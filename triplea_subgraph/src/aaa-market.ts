import { Address, ByteArray, Bytes } from "@graphprotocol/graph-ts";
import {
  AAAMarket,
  CollectionPurchased as CollectionPurchasedEvent,
} from "../generated/AAAMarket/AAAMarket";
import {
  CollectionCreated,
  CollectionPurchased,
  Order,
} from "../generated/schema";
import { AAACollectionManager } from "../generated/AAACollectionManager/AAACollectionManager";

export function handleCollectionPurchased(
  event: CollectionPurchasedEvent
): void {
  let entity = new CollectionPurchased(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  );
  entity.collectionId = event.params.collectionId;
  entity.buyer = event.params.buyer;
  entity.amount = event.params.amount;
  entity.paymentToken = event.params.paymentToken;

  entity.blockNumber = event.block.number;
  entity.blockTimestamp = event.block.timestamp;
  entity.transactionHash = event.transaction.hash;

  entity.save();

  let market = AAAMarket.bind(
    Address.fromString("0x0545422AB9e96786d95d008301aa5664513e482E")
  );

  let entityOrder = new Order(
    Bytes.fromByteArray(ByteArray.fromBigInt(event.params.orderId))
  );

  entityOrder.collectionId = entity.collectionId;
  entityOrder.token = event.params.paymentToken;
  entityOrder.totalPrice = market.getOrderTotalPrice(event.params.orderId);
  entityOrder.amount = event.params.amount;
  entityOrder.buyer = event.params.buyer;
  entityOrder.blockTimestamp = entity.blockTimestamp;
  entityOrder.transactionHash = entity.transactionHash;
  entityOrder.mintedTokenIds = market.getOrderMintedTokens(
    event.params.orderId
  );
  entityOrder.collection = Bytes.fromByteArray(
    ByteArray.fromBigInt(event.params.collectionId)
  );

  entityOrder.save();

  let collectionManager = AAACollectionManager.bind(
    Address.fromString("0xcF2d02e9dE47b6ACE4782483a3610F02Dc5711c1")
  );

  let entityCollection = CollectionCreated.load(
    Bytes.fromByteArray(ByteArray.fromBigInt(event.params.collectionId))
  );

  if (entityCollection) {
    entityCollection.amountSold = collectionManager.getCollectionAmountSold(
      event.params.collectionId
    );
    entityCollection.tokenIds = collectionManager.getCollectionTokenIds(
      event.params.collectionId
    );

    entityCollection.save();
  }
}
