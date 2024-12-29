import { ByteArray, Bytes } from "@graphprotocol/graph-ts";
import {
  AgentFundsWithdrawn as AgentFundsWithdrawnEvent,
  AgentOwnerPaid as AgentOwnerPaidEvent,
  FundsReceived as FundsReceivedEvent,
  FundsWithdrawn as FundsWithdrawnEvent,
  OrderPayment as OrderPaymentEvent,
} from "../generated/AAADevTreasury/AAADevTreasury";
import {
  AgentFundsWithdrawn,
  AgentOwnerPaid,
  DevTreasury,
  FundsReceived,
  FundsWithdrawn,
  OrderPayment,
} from "../generated/schema";

export function handleAgentFundsWithdrawn(
  event: AgentFundsWithdrawnEvent
): void {
  let entity = new AgentFundsWithdrawn(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  );
  entity.tokens = event.params.tokens.map<Bytes>((target: Bytes) => target);
  entity.amounts = event.params.amounts;
  entity.agent = event.params.agent;

  entity.blockNumber = event.block.number;
  entity.blockTimestamp = event.block.timestamp;
  entity.transactionHash = event.transaction.hash;

  entity.save();
}

export function handleAgentOwnerPaid(event: AgentOwnerPaidEvent): void {
  let entity = new AgentOwnerPaid(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  );
  entity.token = event.params.token;
  entity.owner = event.params.owner;
  entity.amount = event.params.amount;

  entity.blockNumber = event.block.number;
  entity.blockTimestamp = event.block.timestamp;
  entity.transactionHash = event.transaction.hash;

  let devEntity = DevTreasury.load(event.params.token);

  if (!devEntity) {
    devEntity = new DevTreasury(event.params.token);
  }

  devEntity.amount = devEntity.amount.plus(event.params.amount);
  devEntity.token = event.params.token;

  devEntity.save();

  entity.save();
}

export function handleFundsReceived(event: FundsReceivedEvent): void {
  let entity = new FundsReceived(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  );
  entity.buyer = event.params.buyer;
  entity.token = event.params.token;
  entity.amount = event.params.amount;

  entity.blockNumber = event.block.number;
  entity.blockTimestamp = event.block.timestamp;
  entity.transactionHash = event.transaction.hash;

  entity.save();
}

export function handleFundsWithdrawn(event: FundsWithdrawnEvent): void {
  let entity = new FundsWithdrawn(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  );
  entity.token = event.params.token;
  entity.amount = event.params.amount;

  entity.blockNumber = event.block.number;
  entity.blockTimestamp = event.block.timestamp;
  entity.transactionHash = event.transaction.hash;

  entity.save();
}

export function handleOrderPayment(event: OrderPaymentEvent): void {
  let entity = new OrderPayment(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  );
  entity.token = event.params.token;
  entity.recipient = event.params.recipient;
  entity.amount = event.params.amount;

  entity.blockNumber = event.block.number;
  entity.blockTimestamp = event.block.timestamp;
  entity.transactionHash = event.transaction.hash;

  entity.save();
}
