import {
  Address,
  BigInt,
  ByteArray,
  Bytes,
  log,
  store,
} from "@graphprotocol/graph-ts";
import {
  AAACollectionManager,
  CollectionDeleted as CollectionDeletedEvent,
  CollectionCreated as CollectionCreatedEvent,
  DropCreated as DropCreatedEvent,
  DropDeleted as DropDeletedEvent,
  CollectionDeactivated as CollectionDeactivatedEvent,
  CollectionActivated as CollectionActivatedEvent,
} from "../generated/AAACollectionManager/AAACollectionManager";
import {
  CollectionDeleted,
  CollectionCreated,
  DropCreated,
  DropDeleted,
  CollectionActivated,
  CollectionDeactivated,
} from "../generated/schema";
import {
  CollectionMetadata as CollectionMetadataTemplate,
  DropMetadata as DropMetadataTemplate,
} from "../generated/templates";

export function handleCollectionActivated(
  event: CollectionActivatedEvent
): void {
  let entity = new CollectionActivated(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  );
  entity.collectionId = event.params.collectionId;

  entity.save();

  let entityCollection = CollectionCreated.load(
    Bytes.fromByteArray(ByteArray.fromBigInt(event.params.collectionId))
  );

  if (entityCollection) {
    entityCollection.active = true;
    entityCollection.save();
  }
}


export function handleCollectionDeactivated(
  event: CollectionDeactivatedEvent
): void {
  let entity = new CollectionDeactivated(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  );
  entity.collectionId = event.params.collectionId;

  entity.save();

  let entityCollection = CollectionCreated.load(
    Bytes.fromByteArray(ByteArray.fromBigInt(event.params.collectionId))
  );

  if (entityCollection) {
    entityCollection.active = false;
    entityCollection.save();
  }
}

export function handleCollectionDeleted(event: CollectionDeletedEvent): void {
  let entity = new CollectionDeleted(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  );
  entity.artist = event.params.artist;
  entity.collectionId = event.params.collectionId;

  entity.blockNumber = event.block.number;
  entity.blockTimestamp = event.block.timestamp;
  entity.transactionHash = event.transaction.hash;

  entity.save();

  let entityCollection = CollectionCreated.load(
    Bytes.fromByteArray(ByteArray.fromBigInt(event.params.collectionId))
  );

  // drops

  if (entityCollection) {
    let entityDrop = DropCreated.load(
      Bytes.fromByteArray(ByteArray.fromBigInt(entityCollection.dropId))
    );

    if (entityDrop) {
      let updatedCollectionIds: BigInt[] = [];
      let updatedCollections: Bytes[] = [];
      for (let i = 0; i < (entityDrop.collectionIds as BigInt[]).length; i++) {
        if ((entityDrop.collectionIds as BigInt[])[i] !== entity.collectionId) {
          updatedCollectionIds.push((entityDrop.collectionIds as BigInt[])[i]);
        }
      }

      for (let i = 0; i < (entityDrop.collections as Bytes[]).length; i++) {
        if (
          (entityDrop.collections as Bytes[])[i] !==
          Bytes.fromByteArray(ByteArray.fromBigInt(entity.collectionId))
        ) {
          updatedCollections.push((entityDrop.collections as Bytes[])[i]);
        }
      }

      entityDrop.collectionIds = updatedCollectionIds;
      entityDrop.collections = updatedCollections;

      entityDrop.save();
    }

    store.remove(
      "CollectionCreated",
      Bytes.fromByteArray(
        ByteArray.fromBigInt(event.params.collectionId)
      ).toHexString()
    );
  }
}

export function handleCollectionCreated(event: CollectionCreatedEvent): void {
  let entity = new CollectionCreated(
    Bytes.fromByteArray(ByteArray.fromBigInt(event.params.collectionId))
  );
  entity.artist = event.params.artist;
  entity.collectionId = event.params.collectionId;
  entity.dropId = event.params.dropId;

  entity.blockNumber = event.block.number;
  entity.blockTimestamp = event.block.timestamp;
  entity.transactionHash = event.transaction.hash;

  let collectionManager = AAACollectionManager.bind(
    Address.fromString("0x11d84C5067B6B45471B6e2E0A20D95Feb9Ea531a")
  );

  entity.amount = collectionManager.getCollectionAmount(entity.collectionId);
  entity.agents = collectionManager.getCollectionAgentIds(entity.collectionId);
  entity.prices = collectionManager.getCollectionPrices(entity.collectionId);
  entity.tokens = collectionManager
    .getCollectionERC20Tokens(entity.collectionId)
    .map<Bytes>((target: Bytes) => target);
  entity.uri = collectionManager.getCollectionMetadata(entity.collectionId);
  entity.active = true;
  let ipfsHash = (entity.uri as String).split("/").pop();
  if (ipfsHash != null) {
    entity.metadata = ipfsHash;
    CollectionMetadataTemplate.create(ipfsHash);
  }

  entity.prices = collectionManager.getCollectionPrices(entity.collectionId);

  entity.save();
}

export function handleDropCreated(event: DropCreatedEvent): void {
  let entity = new DropCreated(
    Bytes.fromByteArray(ByteArray.fromBigInt(event.params.dropId))
  );
  entity.artist = event.params.artist;
  entity.dropId = event.params.dropId;

  entity.blockNumber = event.block.number;
  entity.blockTimestamp = event.block.timestamp;
  entity.transactionHash = event.transaction.hash;

  let collectionManager = AAACollectionManager.bind(
    Address.fromString("0x11d84C5067B6B45471B6e2E0A20D95Feb9Ea531a")
  );
  let uriResult = collectionManager.try_getDropMetadata(entity.dropId);
  if (uriResult.reverted) {
    log.warning("getDropMetadata reverted for dropId: {}", [
      entity.dropId.toString(),
    ]);
    return;
  }
  entity.uri = uriResult.value;

  if (entity.uri !== null) {
    let ipfsHash = (entity.uri as string).split("/").pop();
    if (ipfsHash != null) {
      entity.metadata = ipfsHash;
      DropMetadataTemplate.create(ipfsHash);
    }
  }

  entity.collectionIds = collectionManager.getDropCollectionIds(entity.dropId);

  let collections: Bytes[] = [];
  for (let i = 0; i < (entity.collectionIds as BigInt[]).length; i++) {
    collections.push(
      Bytes.fromByteArray(
        ByteArray.fromBigInt((entity.collectionIds as BigInt[])[i])
      )
    );
  }

  entity.collections = collections;

  entity.save();
}

export function handleDropDeleted(event: DropDeletedEvent): void {
  let entity = new DropDeleted(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  );
  entity.artist = event.params.artist;
  entity.dropId = event.params.dropId;

  entity.blockNumber = event.block.number;
  entity.blockTimestamp = event.block.timestamp;
  entity.transactionHash = event.transaction.hash;

  let entityDrop = DropCreated.load(
    Bytes.fromByteArray(ByteArray.fromBigInt(event.params.dropId))
  );

  if (entityDrop) {
    let collectionIds = entityDrop.collectionIds;

    if (collectionIds) {
      for (let i = 0; i < collectionIds.length; i++) {
        let collectionId = collectionIds[i];

        if (collectionId) {
          let entityCollection = CollectionCreated.load(
            Bytes.fromByteArray(ByteArray.fromBigInt(collectionId))
          );

          if (entityCollection) {
            store.remove(
              "CollectionCreated",
              Bytes.fromByteArray(
                ByteArray.fromBigInt(collectionId)
              ).toHexString()
            );
          }
        }
      }
    }

    store.remove(
      "DropCreated",
      Bytes.fromByteArray(
        ByteArray.fromBigInt(event.params.dropId)
      ).toHexString()
    );
  }

  entity.save();
}
