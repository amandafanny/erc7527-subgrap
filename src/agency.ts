import {
  AgencyApprove,
  AgencyInstance,
  Agent,
  AgentActivity,
} from "../generated/schema";
import { Address, Bytes, dataSource } from "@graphprotocol/graph-ts";
import {
  Unwrap as UnwrapEvent,
  Wrap as WrapEvent,
  ForceApprove as ForceApproveEvent,
  ForceCancel as ForceCancelEvent,
  RenounceForceApprove as RenounceForceApproveEvent,
  RenounceForceCancel as RenounceForceCancelEvent,
  Agency,
} from "../generated/Factory/Agency";

export function handleWrap(event: WrapEvent): void {
  const context = dataSource.context();

  const tokenId = event.params.tokenId;
  const to = event.params.to;
  const price = event.params.premium;
  const fee = event.params.fee;
  const appInstance = context.getString("appInstance");
  const agencyInstance = context.getString("agencyInstance");

  const agentEntity = Agent.load(
    Bytes.fromUTF8(appInstance.concat("-").concat(tokenId.toString()))
  );
  if (agentEntity !== null) {
    const agentActivityEntity = new AgentActivity(
      Bytes.fromUTF8(
        appInstance
          .concat("-")
          .concat(tokenId.toString().concat("-").concat("1"))
      )
    );
    agentActivityEntity.to = to;
    agentActivityEntity.timestap = event.block.timestamp;
    agentActivityEntity.blockNumber = event.block.number;
    agentActivityEntity.transactionHash = event.transaction.hash;
    agentActivityEntity.type = "Wrap";
    agentActivityEntity.fee = fee;
    agentActivityEntity.swap = price;
    agentActivityEntity.agent = agentEntity.id;
    agentActivityEntity.save();
  }
  const agencyEntity = AgencyInstance.load(Address.fromString(agencyInstance));
  if (agencyEntity !== null) {
    const agencyContract = Agency.bind(dataSource.address());
    const feeCount = agencyContract.feeCount();
    const perTokenReward = agencyContract.perTokenReward();
    agencyEntity.swap = price;
    agencyEntity.fee = fee;
    agencyEntity.tvl = agencyEntity.tvl.plus(price);
    agencyEntity.feeCount = feeCount;
    agencyEntity.perTokenReward = perTokenReward;
    agencyEntity.save();
  }
}

export function handleUnwrap(event: UnwrapEvent): void {
  const context = dataSource.context();

  const tokenId = event.params.tokenId;
  const to = event.params.to;
  const price = event.params.premium;
  const fee = event.params.fee;
  const appInstance = context.getString("appInstance");
  const agencyInstance = context.getString("agencyInstance");

  const agentEntity = Agent.load(
    Bytes.fromUTF8(appInstance.concat("-").concat(tokenId.toString()))
  );
  if (agentEntity !== null) {
    const agentActivityEntity = new AgentActivity(
      Bytes.fromUTF8(
        appInstance
          .concat("-")
          .concat(tokenId.toString().concat("-").concat("0"))
      )
    );
    agentActivityEntity.to = to;
    agentActivityEntity.timestap = event.block.timestamp;
    agentActivityEntity.blockNumber = event.block.number;
    agentActivityEntity.transactionHash = event.transaction.hash;
    agentActivityEntity.type = "Unwrap";
    agentActivityEntity.fee = fee;
    agentActivityEntity.swap = price;
    agentActivityEntity.agent = agentEntity.id;
    agentActivityEntity.save();
  }

  const agencyEntity = AgencyInstance.load(Address.fromString(agencyInstance));
  if (agencyEntity !== null) {
    const agencyContract = Agency.bind(dataSource.address());
    const feeCount = agencyContract.feeCount();
    const perTokenReward = agencyContract.perTokenReward();
    agencyEntity.swap = price;
    agencyEntity.fee = fee;
    agencyEntity.tvl = agencyEntity.tvl.minus(price);
    agencyEntity.feeCount = feeCount;
    agencyEntity.perTokenReward = perTokenReward;
    agencyEntity.save();
  }
}

export function handleForceApprove(event: ForceApproveEvent): void {
  const context = dataSource.context();

  const selector = event.params.selector;
  const target = event.params.target;
  const agencyInstance = context.getString("agencyInstance");

  const agencyApproveEntityId = Bytes.fromUTF8(
    agencyInstance
      .concat("-")
      .concat(target.toHexString())
      .concat("-")
      .concat(selector.toHexString())
  );
  let agencyApproveEntity = AgencyApprove.load(agencyApproveEntityId);
  if (agencyApproveEntity === null) {
    agencyApproveEntity = new AgencyApprove(agencyApproveEntityId);
    agencyApproveEntity.target = target;
    agencyApproveEntity.selector = selector;
    agencyApproveEntity.address = Address.fromString(agencyInstance);
  }
  agencyApproveEntity.value = true;
  agencyApproveEntity.save();
}

export function handleForceCancel(event: ForceCancelEvent): void {
  const context = dataSource.context();

  const selector = event.params.selector;
  const target = event.params.target;
  const agencyInstance = context.getString("agencyInstance");

  const agencyApproveEntityId = Bytes.fromUTF8(
    agencyInstance
      .concat("-")
      .concat(target.toHexString())
      .concat("-")
      .concat(selector.toHexString())
  );
  let agencyApproveEntity = AgencyApprove.load(agencyApproveEntityId);
  if (agencyApproveEntity === null) {
    agencyApproveEntity = new AgencyApprove(agencyApproveEntityId);
    agencyApproveEntity.target = target;
    agencyApproveEntity.selector = selector;
    agencyApproveEntity.address = Address.fromString(agencyInstance);
  }
  agencyApproveEntity.value = false;
  agencyApproveEntity.save();
}

export function handleRenounceForceApprove(
  event: RenounceForceApproveEvent
): void {
  const context = dataSource.context();
  const agencyInstance = context.getString("agencyInstance");

  const agencyEntity = AgencyInstance.load(Address.fromString(agencyInstance));
  if (agencyEntity !== null) {
    agencyEntity.isRenounceForceApprove = true;
    agencyEntity.save();
  }
}

export function handleRenounceForceCancel(
  event: RenounceForceCancelEvent
): void {
  const context = dataSource.context();
  const agencyInstance = context.getString("agencyInstance");

  const agencyEntity = AgencyInstance.load(Address.fromString(agencyInstance));
  if (agencyEntity !== null) {
    agencyEntity.isRenounceForceCancel = true;
    agencyEntity.save();
  }
}
