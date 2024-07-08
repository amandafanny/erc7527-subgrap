import { newMockEvent } from "matchstick-as"
import { ethereum, Address, BigInt, Bytes } from "@graphprotocol/graph-ts"
import {
  Approval,
  ApprovalForAll,
  AuthorityUpdated,
  ERC6551AccountCreated,
  Mint,
  NewResolver,
  NewSubNode,
  Paused,
  SetDefaultTokenURIEngine,
  SetTokenURI,
  Transfer,
  Unpaused
} from "../generated/Deployer/Deployer"

export function createApprovalEvent(
  owner: Address,
  approved: Address,
  tokenId: BigInt
): Approval {
  let approvalEvent = changetype<Approval>(newMockEvent())

  approvalEvent.parameters = new Array()

  approvalEvent.parameters.push(
    new ethereum.EventParam("owner", ethereum.Value.fromAddress(owner))
  )
  approvalEvent.parameters.push(
    new ethereum.EventParam("approved", ethereum.Value.fromAddress(approved))
  )
  approvalEvent.parameters.push(
    new ethereum.EventParam(
      "tokenId",
      ethereum.Value.fromUnsignedBigInt(tokenId)
    )
  )

  return approvalEvent
}

export function createApprovalForAllEvent(
  owner: Address,
  operator: Address,
  approved: boolean
): ApprovalForAll {
  let approvalForAllEvent = changetype<ApprovalForAll>(newMockEvent())

  approvalForAllEvent.parameters = new Array()

  approvalForAllEvent.parameters.push(
    new ethereum.EventParam("owner", ethereum.Value.fromAddress(owner))
  )
  approvalForAllEvent.parameters.push(
    new ethereum.EventParam("operator", ethereum.Value.fromAddress(operator))
  )
  approvalForAllEvent.parameters.push(
    new ethereum.EventParam("approved", ethereum.Value.fromBoolean(approved))
  )

  return approvalForAllEvent
}

export function createAuthorityUpdatedEvent(
  authority: Address
): AuthorityUpdated {
  let authorityUpdatedEvent = changetype<AuthorityUpdated>(newMockEvent())

  authorityUpdatedEvent.parameters = new Array()

  authorityUpdatedEvent.parameters.push(
    new ethereum.EventParam("authority", ethereum.Value.fromAddress(authority))
  )

  return authorityUpdatedEvent
}

export function createERC6551AccountCreatedEvent(
  account: Address,
  implementation: Address,
  salt: Bytes,
  chainId: BigInt,
  tokenContract: Address,
  tokenId: BigInt
): ERC6551AccountCreated {
  let erc6551AccountCreatedEvent = changetype<ERC6551AccountCreated>(
    newMockEvent()
  )

  erc6551AccountCreatedEvent.parameters = new Array()

  erc6551AccountCreatedEvent.parameters.push(
    new ethereum.EventParam("account", ethereum.Value.fromAddress(account))
  )
  erc6551AccountCreatedEvent.parameters.push(
    new ethereum.EventParam(
      "implementation",
      ethereum.Value.fromAddress(implementation)
    )
  )
  erc6551AccountCreatedEvent.parameters.push(
    new ethereum.EventParam("salt", ethereum.Value.fromFixedBytes(salt))
  )
  erc6551AccountCreatedEvent.parameters.push(
    new ethereum.EventParam(
      "chainId",
      ethereum.Value.fromUnsignedBigInt(chainId)
    )
  )
  erc6551AccountCreatedEvent.parameters.push(
    new ethereum.EventParam(
      "tokenContract",
      ethereum.Value.fromAddress(tokenContract)
    )
  )
  erc6551AccountCreatedEvent.parameters.push(
    new ethereum.EventParam(
      "tokenId",
      ethereum.Value.fromUnsignedBigInt(tokenId)
    )
  )

  return erc6551AccountCreatedEvent
}

export function createMintEvent(
  to: Address,
  tokenId: BigInt,
  name: string
): Mint {
  let mintEvent = changetype<Mint>(newMockEvent())

  mintEvent.parameters = new Array()

  mintEvent.parameters.push(
    new ethereum.EventParam("to", ethereum.Value.fromAddress(to))
  )
  mintEvent.parameters.push(
    new ethereum.EventParam(
      "tokenId",
      ethereum.Value.fromUnsignedBigInt(tokenId)
    )
  )
  mintEvent.parameters.push(
    new ethereum.EventParam("name", ethereum.Value.fromString(name))
  )

  return mintEvent
}

export function createNewResolverEvent(
  node: Bytes,
  resolver: Address
): NewResolver {
  let newResolverEvent = changetype<NewResolver>(newMockEvent())

  newResolverEvent.parameters = new Array()

  newResolverEvent.parameters.push(
    new ethereum.EventParam("node", ethereum.Value.fromFixedBytes(node))
  )
  newResolverEvent.parameters.push(
    new ethereum.EventParam("resolver", ethereum.Value.fromAddress(resolver))
  )

  return newResolverEvent
}

export function createNewSubNodeEvent(
  parentNode: Bytes,
  subnode: Bytes,
  name: Bytes,
  tokenId: BigInt
): NewSubNode {
  let newSubNodeEvent = changetype<NewSubNode>(newMockEvent())

  newSubNodeEvent.parameters = new Array()

  newSubNodeEvent.parameters.push(
    new ethereum.EventParam(
      "parentNode",
      ethereum.Value.fromFixedBytes(parentNode)
    )
  )
  newSubNodeEvent.parameters.push(
    new ethereum.EventParam("subnode", ethereum.Value.fromFixedBytes(subnode))
  )
  newSubNodeEvent.parameters.push(
    new ethereum.EventParam("name", ethereum.Value.fromBytes(name))
  )
  newSubNodeEvent.parameters.push(
    new ethereum.EventParam(
      "tokenId",
      ethereum.Value.fromUnsignedBigInt(tokenId)
    )
  )

  return newSubNodeEvent
}

export function createPausedEvent(account: Address): Paused {
  let pausedEvent = changetype<Paused>(newMockEvent())

  pausedEvent.parameters = new Array()

  pausedEvent.parameters.push(
    new ethereum.EventParam("account", ethereum.Value.fromAddress(account))
  )

  return pausedEvent
}

export function createSetDefaultTokenURIEngineEvent(
  tokenURIEngine: Address
): SetDefaultTokenURIEngine {
  let setDefaultTokenUriEngineEvent = changetype<SetDefaultTokenURIEngine>(
    newMockEvent()
  )

  setDefaultTokenUriEngineEvent.parameters = new Array()

  setDefaultTokenUriEngineEvent.parameters.push(
    new ethereum.EventParam(
      "tokenURIEngine",
      ethereum.Value.fromAddress(tokenURIEngine)
    )
  )

  return setDefaultTokenUriEngineEvent
}

export function createSetTokenURIEvent(
  tokenId: BigInt,
  tokenURIEngine: Address,
  count: BigInt
): SetTokenURI {
  let setTokenUriEvent = changetype<SetTokenURI>(newMockEvent())

  setTokenUriEvent.parameters = new Array()

  setTokenUriEvent.parameters.push(
    new ethereum.EventParam(
      "tokenId",
      ethereum.Value.fromUnsignedBigInt(tokenId)
    )
  )
  setTokenUriEvent.parameters.push(
    new ethereum.EventParam(
      "tokenURIEngine",
      ethereum.Value.fromAddress(tokenURIEngine)
    )
  )
  setTokenUriEvent.parameters.push(
    new ethereum.EventParam("count", ethereum.Value.fromUnsignedBigInt(count))
  )

  return setTokenUriEvent
}

export function createTransferEvent(
  from: Address,
  to: Address,
  tokenId: BigInt
): Transfer {
  let transferEvent = changetype<Transfer>(newMockEvent())

  transferEvent.parameters = new Array()

  transferEvent.parameters.push(
    new ethereum.EventParam("from", ethereum.Value.fromAddress(from))
  )
  transferEvent.parameters.push(
    new ethereum.EventParam("to", ethereum.Value.fromAddress(to))
  )
  transferEvent.parameters.push(
    new ethereum.EventParam(
      "tokenId",
      ethereum.Value.fromUnsignedBigInt(tokenId)
    )
  )

  return transferEvent
}

export function createUnpausedEvent(account: Address): Unpaused {
  let unpausedEvent = changetype<Unpaused>(newMockEvent())

  unpausedEvent.parameters = new Array()

  unpausedEvent.parameters.push(
    new ethereum.EventParam("account", ethereum.Value.fromAddress(account))
  )

  return unpausedEvent
}
