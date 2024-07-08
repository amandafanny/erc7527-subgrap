import { newMockEvent } from "matchstick-as"
import { ethereum, Address, BigInt, Bytes } from "@graphprotocol/graph-ts"
import {
  Approval,
  ApprovalForAll,
  ERC6551AccountCreated,
  OwnershipTransferred,
  SetDefaultTokenURIEngine,
  SetTokenURI,
  Transfer
} from "../generated/PremiumDAO/PremiumDAO"

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

export function createOwnershipTransferredEvent(
  previousOwner: Address,
  newOwner: Address
): OwnershipTransferred {
  let ownershipTransferredEvent = changetype<OwnershipTransferred>(
    newMockEvent()
  )

  ownershipTransferredEvent.parameters = new Array()

  ownershipTransferredEvent.parameters.push(
    new ethereum.EventParam(
      "previousOwner",
      ethereum.Value.fromAddress(previousOwner)
    )
  )
  ownershipTransferredEvent.parameters.push(
    new ethereum.EventParam("newOwner", ethereum.Value.fromAddress(newOwner))
  )

  return ownershipTransferredEvent
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
