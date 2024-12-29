import { Address, ByteArray, Bytes, log, store } from "@graphprotocol/graph-ts";
import {
  AAACollectionManager,
  CollectionDeleted as CollectionDeletedEvent,
  CollectionCreated as CollectionCreatedEvent,
  DropCreated as DropCreatedEvent,
  DropDeleted as DropDeletedEvent,
} from "../generated/AAACollectionManager/AAACollectionManager";
import {
  CollectionDeleted,
  CollectionCreated,
  DropCreated,
  DropDeleted,
} from "../generated/schema";
import {
  CollectionMetadata as CollectionMetadataTemplate,
  DropMetadata as DropMetadataTemplate,
} from "../generated/templates";

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

  if (entityCollection) {
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
    Address.fromString("0x38A419A1d67f5952493BDf1A2aB4a54844Be9701")
  );

  entity.amount = collectionManager.getCollectionAmount(entity.collectionId);
  entity.agents = collectionManager.getCollectionAgentIds(entity.collectionId);
  entity.prices = collectionManager.getCollectionPrices(entity.collectionId);
  entity.tokens = collectionManager
    .getCollectionERC20Tokens(entity.collectionId)
    .map<Bytes>((target: Bytes) => target);
  entity.uri = collectionManager.getCollectionMetadata(entity.collectionId);

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
    Address.fromString("0x38A419A1d67f5952493BDf1A2aB4a54844Be9701")
  );
  let uriResult = collectionManager.try_getDropMetadata(entity.dropId);
  if (uriResult.reverted) {
    log.warning("getDropMetadata reverted for dropId: {}", [
      entity.dropId.toString(),
    ]);
    return;
  }
  entity.uri = uriResult.value;

  // log.debug("entity uri {}", [entity.uri as string]);
  if (entity.uri !== null) {
    let ipfsHash = (entity.uri as string).split("/").pop();
    if (ipfsHash != null) {
      entity.metadata = ipfsHash;
      DropMetadataTemplate.create(ipfsHash);
    }
  }

  entity.collectionIds = collectionManager.getDropCollectionIds(entity.dropId);

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
