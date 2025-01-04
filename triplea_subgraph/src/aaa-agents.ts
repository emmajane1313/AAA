import {
  Address,
  BigInt,
  ByteArray,
  Bytes,
  store,
} from "@graphprotocol/graph-ts";
import {
  AAAAgents,
  AgentCreated as AgentCreatedEvent,
  AgentDeleted as AgentDeletedEvent,
  AgentEdited as AgentEditedEvent,
  BalanceAdded as BalanceAddedEvent,
  BalanceWithdrawn as BalanceWithdrawnEvent,
} from "../generated/AAAAgents/AAAAgents";
import {
  AgentCreated,
  AgentDeleted,
  AgentEdited,
  BalanceAdded,
  BalanceWithdrawn,
  Balance,
  AgentActiveCollection,
  AgentCollection,
  CollectionCreated,
  RentPaid,
} from "../generated/schema";
import { AgentMetadata as AgentMetadataTemplate } from "../generated/templates";
import { AAACollectionManager } from "../generated/AAACollectionManager/AAACollectionManager";

export function handleAgentCreated(event: AgentCreatedEvent): void {
  let entity = new AgentCreated(
    Bytes.fromByteArray(ByteArray.fromBigInt(event.params.id))
  );
  entity.wallets = event.params.wallets.map<Bytes>((target: Bytes) => target);
  entity.creator = event.params.creator;
  entity.AAAAgents_id = event.params.id;

  entity.blockNumber = event.block.number;
  entity.blockTimestamp = event.block.timestamp;
  entity.transactionHash = event.transaction.hash;

  let agents = AAAAgents.bind(
    Address.fromString("0xdE421E01Ecb93c29Ce0AF4809121F37B5b6653a1")
  );
  entity.owner = agents.getAgentOwner(entity.AAAAgents_id) as Bytes;
  entity.uri = agents.getAgentMetadata(entity.AAAAgents_id);

  let ipfsHash = (entity.uri as String).split("/").pop();
  if (ipfsHash != null) {
    entity.metadata = ipfsHash;
    AgentMetadataTemplate.create(ipfsHash);
  }

  entity.save();
}

export function handleAgentDeleted(event: AgentDeletedEvent): void {
  let entity = new AgentDeleted(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  );
  entity.AAAAgents_id = event.params.id;

  entity.blockNumber = event.block.number;
  entity.blockTimestamp = event.block.timestamp;
  entity.transactionHash = event.transaction.hash;

  entity.save();

  let entityAgent = AgentCreated.load(
    Bytes.fromByteArray(ByteArray.fromBigInt(event.params.id))
  );

  if (entityAgent) {
    store.remove(
      "AgentCreated",
      Bytes.fromByteArray(ByteArray.fromBigInt(event.params.id)).toHexString()
    );
  }
}

export function handleAgentEdited(event: AgentEditedEvent): void {
  let entity = new AgentEdited(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  );
  entity.AAAAgents_id = event.params.id;

  entity.blockNumber = event.block.number;
  entity.blockTimestamp = event.block.timestamp;
  entity.transactionHash = event.transaction.hash;

  entity.save();

  let entityAgent = AgentCreated.load(
    Bytes.fromByteArray(ByteArray.fromBigInt(event.params.id))
  );

  if (entityAgent) {
    let agents = AAAAgents.bind(
      Address.fromString("0xdE421E01Ecb93c29Ce0AF4809121F37B5b6653a1")
    );

    entityAgent.uri = agents.getAgentMetadata(entity.AAAAgents_id);

    let ipfsHash = (entityAgent.uri as String).split("/").pop();
    if (ipfsHash != null) {
      entityAgent.metadata = ipfsHash;
      AgentMetadataTemplate.create(ipfsHash);
    }

    entityAgent.save();
  }
}

export function handleBalanceAdded(event: BalanceAddedEvent): void {
  let entity = new BalanceAdded(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  );
  entity.token = event.params.token;
  entity.agentId = event.params.agentId;
  entity.amount = event.params.amount;
  entity.collectionId = event.params.collectionId;

  entity.blockNumber = event.block.number;
  entity.blockTimestamp = event.block.timestamp;
  entity.transactionHash = event.transaction.hash;

  entity.save();

  let entityAgent = AgentCreated.load(
    Bytes.fromByteArray(ByteArray.fromBigInt(entity.agentId))
  );

  if (entityAgent) {
    let agents = AAAAgents.bind(
      Address.fromString("0xdE421E01Ecb93c29Ce0AF4809121F37B5b6653a1")
    );
    let collections = AAACollectionManager.bind(
      Address.fromString("0x11d84C5067B6B45471B6e2E0A20D95Feb9Ea531a")
    );

    let collectionIdHex = entity.collectionId.toHexString();
    let tokenHex = entity.token.toHexString();
    let combinedHex = collectionIdHex + tokenHex;
    if (combinedHex.length % 2 !== 0) {
      combinedHex = "0" + combinedHex;
    }

    let newBalance = Balance.load(Bytes.fromHexString(combinedHex));
    if (!newBalance) {
      newBalance = new Balance(Bytes.fromHexString(combinedHex));
      newBalance.collectionId = entity.collectionId;
      newBalance.token = entity.token;
    }

    newBalance.activeBalance = agents.getAgentActiveBalance(
      event.params.token,
      entity.agentId,
      entity.collectionId
    );
    newBalance.instructions = collections.getAgentCollectionCustomInstructions(
      entity.collectionId,
      entity.agentId
    );
    newBalance.dailyFrequency = collections.getAgentCollectionDailyFrequency(
      entity.collectionId,
      entity.agentId
    );
    newBalance.totalBalance = agents.getAgentTotalBalance(
      event.params.token,
      entity.agentId,
      entity.collectionId
    );
    newBalance.collection = Bytes.fromByteArray(
      ByteArray.fromBigInt(event.params.collectionId)
    );

    newBalance.save();

    let balances = entityAgent.balances;

    if (!balances) {
      balances = [];
      balances.push(Bytes.fromHexString(combinedHex));
    }

    entityAgent.balances = balances;

    entityAgent.save();

    let agentActive = AgentActiveCollection.load(
      Bytes.fromByteArray(ByteArray.fromBigInt(entity.agentId))
    );

    if (!agentActive) {
      agentActive = new AgentActiveCollection(
        Bytes.fromByteArray(ByteArray.fromBigInt(entity.agentId))
      );
      agentActive.agentId = entity.agentId;
    }

    let collectionIds = agents.getAgentActiveCollectionIds(entity.agentId);

    let activeCollections: Bytes[] = [];
    for (let i = 0; i < collectionIds.length; i++) {
      activeCollections.push(
        Bytes.fromByteArray(ByteArray.fromBigInt(collectionIds[i]))
      );
    }
    agentActive.collections = activeCollections;
    agentActive.save();
  }
}

export function handleBalanceWithdrawn(event: BalanceWithdrawnEvent): void {
  let entity = new BalanceWithdrawn(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  );
  entity.tokens = event.params.tokens.map<Bytes>((target: Bytes) => target);
  entity.agentId = event.params.agentId;
  entity.amounts = event.params.amounts;
  entity.collectionIds = event.params.collectionIds;

  entity.blockNumber = event.block.number;
  entity.blockTimestamp = event.block.timestamp;
  entity.transactionHash = event.transaction.hash;

  entity.save();

  let entityAgent = AgentCreated.load(
    Bytes.fromByteArray(ByteArray.fromBigInt(entity.agentId))
  );

  if (entityAgent) {
    let agents = AAAAgents.bind(
      Address.fromString("0xdE421E01Ecb93c29Ce0AF4809121F37B5b6653a1")
    );
    let collections = AAACollectionManager.bind(
      Address.fromString("0x11d84C5067B6B45471B6e2E0A20D95Feb9Ea531a")
    );

    let collectionIds: BigInt[] = entity.collectionIds as BigInt[];
    let combinedHexes: string[] = [];

    for (let i = 0; i < (collectionIds as BigInt[]).length; i++) {
      let collectionId: BigInt = collectionIds[i];
      let token: Bytes = (entity.tokens as Bytes[])[i] as Bytes;

      let collectionIdHex = collectionId.toHexString();
      let tokenHex = token.toHexString();
      let combinedHex = collectionIdHex + tokenHex;
      if (combinedHex.length % 2 !== 0) {
        combinedHex = "0" + combinedHex;
      }

      combinedHexes.push(combinedHex);

      let newBalance = Balance.load(Bytes.fromHexString(combinedHex));
      if (!newBalance) {
        newBalance = new Balance(Bytes.fromHexString(combinedHex));
        newBalance.collectionId = collectionId;
        newBalance.token = token;
      }

      newBalance.activeBalance = agents.getAgentActiveBalance(
        token as Address,
        entity.agentId,
        collectionId
      );
      newBalance.instructions =
        collections.getAgentCollectionCustomInstructions(
          collectionId,
          entity.agentId
        );
      newBalance.dailyFrequency = collections.getAgentCollectionDailyFrequency(
        collectionId,
        entity.agentId
      );
      newBalance.totalBalance = agents.getAgentTotalBalance(
        token as Address,
        entity.agentId,
        collectionId
      );

      newBalance.save();
    }

    let balances = entityAgent.balances;

    if (!balances) {
      balances = [];
      for (let i = 0; i < combinedHexes.length; i++) {
        balances.push(Bytes.fromHexString(combinedHexes[i]));
      }
    }

    let activeCollectionIds = agents.getAgentActiveCollectionIds(
      entity.agentId
    );
    let historicalCollectionIds = agents.getAgentCollectionIdsHistory(
      entity.agentId
    );

    let activeCollectionIds_array: Bytes[] = [];
    let historicalCollectionIds_array: Bytes[] = [];

    for (let i = 0; i < (activeCollectionIds as BigInt[]).length; i++) {
      let entityCollection = CollectionCreated.load(
        Bytes.fromByteArray(
          ByteArray.fromBigInt((activeCollectionIds as BigInt[])[i])
        )
      );

      if (entityCollection) {
        let agentColl = AgentCollection.load(
          Bytes.fromByteArray(
            ByteArray.fromBigInt((activeCollectionIds as BigInt[])[i])
          )
        );

        if (!agentColl) {
          agentColl = new AgentCollection(
            Bytes.fromByteArray(
              ByteArray.fromBigInt((activeCollectionIds as BigInt[])[i])
            )
          );
        }

        agentColl.collectionId = (activeCollectionIds as BigInt[])[i];
        agentColl.metadata = entityCollection.metadata;
        agentColl.artist = entityCollection.artist;

        activeCollectionIds_array.push(
          Bytes.fromByteArray(
            ByteArray.fromBigInt((activeCollectionIds as BigInt[])[i])
          )
        );

        agentColl.save();
      }
    }

    for (let i = 0; i < (historicalCollectionIds as BigInt[]).length; i++) {
      let entityCollection = CollectionCreated.load(
        Bytes.fromByteArray(
          ByteArray.fromBigInt((activeCollectionIds as BigInt[])[i])
        )
      );

      if (entityCollection) {
        let agentColl = AgentCollection.load(
          Bytes.fromByteArray(
            ByteArray.fromBigInt((activeCollectionIds as BigInt[])[i])
          )
        );

        if (!agentColl) {
          agentColl = new AgentCollection(
            Bytes.fromByteArray(
              ByteArray.fromBigInt((activeCollectionIds as BigInt[])[i])
            )
          );
        }

        agentColl.collectionId = (activeCollectionIds as BigInt[])[i];
        agentColl.metadata = entityCollection.metadata;
        agentColl.artist = entityCollection.artist;

        historicalCollectionIds_array.push(
          Bytes.fromByteArray(
            ByteArray.fromBigInt((activeCollectionIds as BigInt[])[i])
          )
        );

        agentColl.save();
      }
    }

    let rentPaids = entityAgent.rentPaid;

    if (!rentPaids) {
      rentPaids = [];
    }

    let newRent = new RentPaid(
      event.transaction.hash.concatI32(event.logIndex.toI32())
    );
    newRent.blockTimestamp = entity.blockTimestamp;
    newRent.transactionHash = entity.transactionHash;
    newRent.save();
    rentPaids.push(event.transaction.hash.concatI32(event.logIndex.toI32()));

    entityAgent.rentPaid = rentPaids;

    entityAgent.activeCollectionIds = activeCollectionIds_array;
    entityAgent.collectionIdsHistory = historicalCollectionIds_array;

    entityAgent.balances = balances;

    entityAgent.save();
  }
}
