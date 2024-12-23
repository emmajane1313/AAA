import {
  Address,
  ByteArray,
  Bytes,
  crypto,
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
} from "../generated/schema";
import { AgentMetadata as AgentMetadataTemplate } from "../generated/templates";

export function handleAgentCreated(event: AgentCreatedEvent): void {
  let entity = new AgentCreated(
    Bytes.fromByteArray(ByteArray.fromBigInt(event.params.id))
  );
  entity.wallet = event.params.wallet;
  entity.creator = event.params.creator;
  entity.AAAAgents_id = event.params.id;

  entity.blockNumber = event.block.number;
  entity.blockTimestamp = event.block.timestamp;
  entity.transactionHash = event.transaction.hash;

  let agents = AAAAgents.bind(
    Address.fromString("0x4eD74d03D9d4F6f4DC2E50DC2f0C701326DF156a")
  );

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
      Address.fromString("0x4eD74d03D9d4F6f4DC2E50DC2f0C701326DF156a")
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
      Address.fromString("0x4eD74d03D9d4F6f4DC2E50DC2f0C701326DF156a")
    );

    let collectionIdHex = entity.collectionId.toHexString();
    let tokenHex = entity.token.toHexString();
    let combinedHex = collectionIdHex + tokenHex;

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
    newBalance.totalBalance = agents.getAgentTotalBalance(
      event.params.token,
      entity.agentId,
      entity.collectionId
    );

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
  entity.token = event.params.token;
  entity.agentId = event.params.agentId;
  entity.amount = event.params.amount;

  entity.blockNumber = event.block.number;
  entity.blockTimestamp = event.block.timestamp;
  entity.transactionHash = event.transaction.hash;

  entity.save();

  let entityAgent = AgentCreated.load(
    Bytes.fromByteArray(ByteArray.fromBigInt(entity.agentId))
  );

  if (entityAgent) {
    let agents = AAAAgents.bind(
      Address.fromString("0x4eD74d03D9d4F6f4DC2E50DC2f0C701326DF156a")
    );

    let collectionIdHex = entity.collectionId.toHexString();
    let tokenHex = entity.token.toHexString();
    let combinedHex = collectionIdHex + tokenHex;

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
    newBalance.totalBalance = agents.getAgentTotalBalance(
      event.params.token,
      entity.agentId,
      entity.collectionId
    );

    let balances = entityAgent.balances;

    if (!balances) {
      balances = [];
      balances.push(Bytes.fromHexString(combinedHex));
    }

    entityAgent.balances = balances;

    entityAgent.save();
  }
}
