import {
  AgencyApprove,
  AgencyInstance,
  Agent,
  AgentActivity,
} from "../generated/schema";
import { Bytes, dataSource } from "@graphprotocol/graph-ts";
import { getAgencyBalance } from ".";
import {
  Unwrap as UnwrapEvent,
  Wrap as WrapEvent,
  ForceApprove as ForceApproveEvent,
  ForceCancel as ForceCancelEvent,
  RenounceForceApprove as RenounceForceApproveEvent,
  RenounceForceCancel as RenounceForceCancelEvent,
  Agency,
  RebaseCall,
} from "../generated/templates/Agency/Agency";

export function handleWrap(event: WrapEvent): void {
  const context = dataSource.context();

  const tokenId = event.params.tokenId;
  const to = event.params.to;
  const price = event.params.premium;
  const fee = event.params.fee;
  const appInstance = context.getString("appInstance");

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
  const agencyInstance = dataSource.address();
  const agencyEntity = AgencyInstance.load(agencyInstance);
  if (agencyEntity !== null) {
    const agencyContract = Agency.bind(agencyInstance);
    const feeCount = agencyContract.feeCount();
    const perTokenReward = agencyContract.perTokenReward();
    const balance = getAgencyBalance(agencyInstance);
    agencyEntity.swap = price;
    agencyEntity.fee = fee;
    agencyEntity.tvl = balance;
    agencyEntity.pureTvl = agencyEntity.tvl.plus(price);
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

  const agencyInstance = dataSource.address();

  const agencyEntity = AgencyInstance.load(agencyInstance);
  if (agencyEntity !== null) {
    const agencyContract = Agency.bind(agencyInstance);
    const feeCount = agencyContract.feeCount();
    const perTokenReward = agencyContract.perTokenReward();
    const balance = getAgencyBalance(agencyInstance);
    agencyEntity.swap = price;
    agencyEntity.fee = fee;
    agencyEntity.tvl = balance;
    agencyEntity.pureTvl = agencyEntity.tvl.minus(price);
    agencyEntity.feeCount = feeCount;
    agencyEntity.perTokenReward = perTokenReward;
    agencyEntity.save();
  }
}

export function handleForceApprove(event: ForceApproveEvent): void {
  const selector = event.params.selector;
  const target = event.params.target;
  const agencyInstance = dataSource.address();

  const agencyApproveEntityId = Bytes.fromUTF8(
    agencyInstance
      .toHexString()
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
    agencyApproveEntity.address = agencyInstance;
  }
  agencyApproveEntity.value = true;
  agencyApproveEntity.save();
}

export function handleForceCancel(event: ForceCancelEvent): void {
  const selector = event.params.selector;
  const target = event.params.target;
  const agencyInstance = dataSource.address();

  const agencyApproveEntityId = Bytes.fromUTF8(
    agencyInstance
      .toHexString()
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
    agencyApproveEntity.address = agencyInstance;
  }
  agencyApproveEntity.value = false;
  agencyApproveEntity.save();
}

export function handleRenounceForceApprove(
  event: RenounceForceApproveEvent
): void {
  const agencyInstance = dataSource.address();

  const agencyEntity = AgencyInstance.load(agencyInstance);
  if (agencyEntity !== null) {
    agencyEntity.isRenounceForceApprove = true;
    agencyEntity.save();
  }
}

export function handleRenounceForceCancel(
  event: RenounceForceCancelEvent
): void {
  const agencyInstance = dataSource.address();

  const agencyEntity = AgencyInstance.load(agencyInstance);
  if (agencyEntity !== null) {
    agencyEntity.isRenounceForceCancel = true;
    agencyEntity.save();
  }
}

export function handleRebase(event: RebaseCall): void {
  const agencyInstance = dataSource.address();

  const agencyEntity = AgencyInstance.load(agencyInstance);
  if (agencyEntity !== null) {
    const balance = getAgencyBalance(agencyInstance);
    agencyEntity.tvl = balance;
    agencyEntity.save();
  }
}
