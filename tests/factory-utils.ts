import { newMockEvent } from "matchstick-as";
import { ethereum, Address, BigInt } from "@graphprotocol/graph-ts";
import { Deploy } from "../generated/Factory/Factory";

export function createDeployEvent(
  agencyImplementation: Address,
  agencyInstance: Address,
  appImplementation: Address,
  appInstance: Address,
  tokenId: BigInt
): Deploy {
  let deployEvent = changetype<Deploy>(newMockEvent());

  deployEvent.parameters = new Array();

  deployEvent.parameters.push(
    new ethereum.EventParam(
      "agencyImplementation",
      ethereum.Value.fromAddress(agencyImplementation)
    )
  );
  deployEvent.parameters.push(
    new ethereum.EventParam(
      "agencyInstance",
      ethereum.Value.fromAddress(agencyInstance)
    )
  );
  deployEvent.parameters.push(
    new ethereum.EventParam(
      "appImplementation",
      ethereum.Value.fromAddress(appImplementation)
    )
  );
  deployEvent.parameters.push(
    new ethereum.EventParam(
      "appInstance",
      ethereum.Value.fromAddress(appInstance)
    )
  );
  deployEvent.parameters.push(
    new ethereum.EventParam(
      "tokenId",
      ethereum.Value.fromUnsignedBigInt(tokenId)
    )
  );

  return deployEvent;
}
