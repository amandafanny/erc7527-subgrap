import { AgencyInstance, Agent, AgentActivity } from "../generated/schema";
import { dataSource } from "@graphprotocol/graph-ts";
import {
  Unwrap as UnwrapEvent,
  Wrap as WrapEvent,
  Agency,
} from "../generated/Factory/Agency";

export function handleWrap(event: WrapEvent): void {
  const context = dataSource.context();

  const tokenId = event.params.tokenId;
  const to = event.params.to;
  const price = event.params.price;
  const fee = event.params.fee;
  const appInstance = context.getString("appInstance");
  const agencyInstance = context.getString("agencyInstance");

  const agentEntity = Agent.load(
    appInstance.concat("-").concat(tokenId.toString())
  );
  if (agentEntity !== null) {
    const agentActivityEntity = new AgentActivity(
      appInstance.concat("-").concat(tokenId.toString().concat("-").concat("1"))
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
  const agencyEntity = AgencyInstance.load(agencyInstance);
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
  const price = event.params.price;
  const fee = event.params.fee;
  const appInstance = context.getString("appInstance");
  const agencyInstance = context.getString("agencyInstance");

  const agentEntity = Agent.load(
    appInstance.concat("-").concat(tokenId.toString())
  );
  if (agentEntity !== null) {
    const agentActivityEntity = new AgentActivity(
      appInstance.concat("-").concat(tokenId.toString().concat("-").concat("0"))
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

  const agencyEntity = AgencyInstance.load(agencyInstance);
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
