import { Address, dataSource, log } from "@graphprotocol/graph-ts";
import {
  Stake as StakeEvent,
  Unstake as UnstakeEvent,
  DoubleLayerStaking as DoubleLayerStakingContract,
} from "../generated/DoubleLayerStaking/DoubleLayerStaking";
import { Agent, StakeInfoL2 } from "../generated/schema";
import { setCurrency } from ".";

const setStakeInfoL2 = (
  contractAddressString: string,
  appInstance: string,
  update: bool
): StakeInfoL2 => {
  let stakeInfoL2Entity = StakeInfoL2.load(appInstance);
  const contractAddress = Address.fromString(contractAddressString);
  const contract = DoubleLayerStakingContract.bind(contractAddress);
  if (stakeInfoL2Entity === null) {
    stakeInfoL2Entity = new StakeInfoL2(appInstance);
    const stakeInfo = contract.stakingOfNFT(Address.fromString(appInstance));
    stakeInfoL2Entity.tvl = stakeInfo.getTvl();
    stakeInfoL2Entity.points = stakeInfo.getPoints();
    stakeInfoL2Entity.lastRewardBlock = stakeInfo.getLastRewardBlock();
    stakeInfoL2Entity.accTokenPerShare = stakeInfo.getAccTokenPerShare();
    stakeInfoL2Entity.rewardDebt = stakeInfo.getRewardDebt();
    stakeInfoL2Entity.tokenPerBlock = stakeInfo.getTokenPerBlock();
    stakeInfoL2Entity.unspentRewards = stakeInfo.getUnspentRewards();
    stakeInfoL2Entity.endBlockOfEpoch = stakeInfo.getEndBlockOfEpoch();
    stakeInfoL2Entity.type = stakeInfo.getCurrencyType();

    const requestedCurrency = contract.requestedCurrency();
    const requestedCurrencyEntity = setCurrency(
      requestedCurrency.toHexString()
    );
    const rewardToken = contract.rewardToken();
    const rewardTokenCurrencyEntity = setCurrency(rewardToken.toHexString());
    stakeInfoL2Entity.rewardToken = rewardTokenCurrencyEntity.id;
    stakeInfoL2Entity.requestedCurrency = requestedCurrencyEntity.id;

    stakeInfoL2Entity.save();
  }
  if (update) {
    const stakeInfo = contract.stakingOfNFT(Address.fromString(appInstance));
    stakeInfoL2Entity.tvl = stakeInfo.getTvl();
    stakeInfoL2Entity.points = stakeInfo.getPoints();
    stakeInfoL2Entity.lastRewardBlock = stakeInfo.getLastRewardBlock();
    stakeInfoL2Entity.accTokenPerShare = stakeInfo.getAccTokenPerShare();
    stakeInfoL2Entity.rewardDebt = stakeInfo.getRewardDebt();
    stakeInfoL2Entity.tokenPerBlock = stakeInfo.getTokenPerBlock();
    stakeInfoL2Entity.unspentRewards = stakeInfo.getUnspentRewards();
    stakeInfoL2Entity.endBlockOfEpoch = stakeInfo.getEndBlockOfEpoch();
    stakeInfoL2Entity.type = stakeInfo.getCurrencyType();
    stakeInfoL2Entity.save();
  }
  return stakeInfoL2Entity;
};

export function handleStake(event: StakeEvent): void {
  const l2 = event.params.l2;
  const user = event.params.user;
  const tokenId = event.params.tokenId;
  const agentEntityId = l2.toHexString().concat("-").concat(tokenId.toString());
  const agentEntity = Agent.load(agentEntityId);

  const contract = DoubleLayerStakingContract.bind(dataSource.address());
  setStakeInfoL2(dataSource.address().toHexString(), l2.toHexString(), true);
  if (agentEntity) {
    agentEntity.stakeState = contract.getState(l2, tokenId);
    agentEntity.save();
  }
}

export function handleUnStake(event: UnstakeEvent): void {
  const tokenId = event.params.tokenId;
  const l2 = event.params.l2;
  const user = event.params.user;

  const agentEntityId = l2.toHexString().concat("-").concat(tokenId.toString());
  const agentEntity = Agent.load(agentEntityId);

  const contract = DoubleLayerStakingContract.bind(dataSource.address());

  setStakeInfoL2(dataSource.address().toHexString(), l2.toHexString(), true);
  if (agentEntity) {
    agentEntity.stakeState = contract.getState(l2, tokenId);
    agentEntity.save();
  }
}
