import { newMockEvent } from "matchstick-as"
import { ethereum, Address, BigInt } from "@graphprotocol/graph-ts"
import {
  CollectionDeleted,
  CollectionsCreated,
  DropCreated,
  DropDeleted
} from "../generated/AAACollectionManager/AAACollectionManager"

export function createCollectionDeletedEvent(
  artist: Address,
  collectionId: BigInt
): CollectionDeleted {
  let collectionDeletedEvent = changetype<CollectionDeleted>(newMockEvent())

  collectionDeletedEvent.parameters = new Array()

  collectionDeletedEvent.parameters.push(
    new ethereum.EventParam("artist", ethereum.Value.fromAddress(artist))
  )
  collectionDeletedEvent.parameters.push(
    new ethereum.EventParam(
      "collectionId",
      ethereum.Value.fromUnsignedBigInt(collectionId)
    )
  )

  return collectionDeletedEvent
}

export function createCollectionsCreatedEvent(
  artist: Address,
  collectionId: BigInt,
  dropId: BigInt
): CollectionsCreated {
  let collectionsCreatedEvent = changetype<CollectionsCreated>(newMockEvent())

  collectionsCreatedEvent.parameters = new Array()

  collectionsCreatedEvent.parameters.push(
    new ethereum.EventParam("artist", ethereum.Value.fromAddress(artist))
  )
  collectionsCreatedEvent.parameters.push(
    new ethereum.EventParam(
      "collectionId",
      ethereum.Value.fromUnsignedBigInt(collectionId)
    )
  )
  collectionsCreatedEvent.parameters.push(
    new ethereum.EventParam("dropId", ethereum.Value.fromUnsignedBigInt(dropId))
  )

  return collectionsCreatedEvent
}

export function createDropCreatedEvent(
  artist: Address,
  dropId: BigInt
): DropCreated {
  let dropCreatedEvent = changetype<DropCreated>(newMockEvent())

  dropCreatedEvent.parameters = new Array()

  dropCreatedEvent.parameters.push(
    new ethereum.EventParam("artist", ethereum.Value.fromAddress(artist))
  )
  dropCreatedEvent.parameters.push(
    new ethereum.EventParam("dropId", ethereum.Value.fromUnsignedBigInt(dropId))
  )

  return dropCreatedEvent
}

export function createDropDeletedEvent(
  artist: Address,
  dropId: BigInt
): DropDeleted {
  let dropDeletedEvent = changetype<DropDeleted>(newMockEvent())

  dropDeletedEvent.parameters = new Array()

  dropDeletedEvent.parameters.push(
    new ethereum.EventParam("artist", ethereum.Value.fromAddress(artist))
  )
  dropDeletedEvent.parameters.push(
    new ethereum.EventParam("dropId", ethereum.Value.fromUnsignedBigInt(dropId))
  )

  return dropDeletedEvent
}
