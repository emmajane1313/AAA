import {
  CollectionDeleted as CollectionDeletedEvent,
  CollectionsCreated as CollectionsCreatedEvent,
  DropCreated as DropCreatedEvent,
  DropDeleted as DropDeletedEvent
} from "../generated/AAACollectionManager/AAACollectionManager"
import {
  CollectionDeleted,
  CollectionsCreated,
  DropCreated,
  DropDeleted
} from "../generated/schema"

export function handleCollectionDeleted(event: CollectionDeletedEvent): void {
  let entity = new CollectionDeleted(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.artist = event.params.artist
  entity.collectionId = event.params.collectionId

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleCollectionsCreated(event: CollectionsCreatedEvent): void {
  let entity = new CollectionsCreated(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.artist = event.params.artist
  entity.collectionId = event.params.collectionId
  entity.dropId = event.params.dropId

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleDropCreated(event: DropCreatedEvent): void {
  let entity = new DropCreated(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.artist = event.params.artist
  entity.dropId = event.params.dropId

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleDropDeleted(event: DropDeletedEvent): void {
  let entity = new DropDeleted(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.artist = event.params.artist
  entity.dropId = event.params.dropId

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}
