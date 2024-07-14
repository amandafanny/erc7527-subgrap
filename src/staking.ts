import {
  Address,
  BigInt,
  ByteArray,
  Bytes,
  dataSource,
  ethereum,
} from "@graphprotocol/graph-ts";
import {
  Stake as StakeEvent,
  Unstake as UnstakeEvent,
  StakeCall,
  UnstakeCall,
  DoubleLayerStaking,
  WithdrawRewardCall,
  ExecCall,
  Claim1Call,
  ClaimCall,
  UpdateRewardL2Call,
  UpdatePoolL2Call,
  UpdateRewardL1Call,
} from "../generated/DoubleLayerStaking/DoubleLayerStaking";
import { Agency } from "../generated/templates/Agency/Agency";
import {
  Agent,
  AppInstance,
  DoubleLayerCreatorAccount,
  DoubleLayerDotAgency,
  DoubleLayerStakingL2,
  DoubleLayerStakingL2TokenIdRewardDebt,
} from "../generated/schema";
import { setCurrency } from ".";

export function setDoubleLayerCreatorAccount(
  doubleLayerStakingContract: DoubleLayerStaking,
  creator: Address
): void {
  const creatorAccountEntity = new DoubleLayerCreatorAccount(creator);
  const claim = doubleLayerStakingContract.claimForCreatorAccount(creator);
  creatorAccountEntity.account = creator;
  creatorAccountEntity.claim = claim;
  creatorAccountEntity.save();
}

export function setDoubleLayerDotAgenct(
  doubleLayerStakingContract: DoubleLayerStaking,
  tokenId: BigInt
): void {
  const dotAgencyEntity = new DoubleLayerDotAgency(
    Bytes.fromByteArray(Bytes.fromBigInt(tokenId))
  );
  const claim = doubleLayerStakingContract.claimForDotAgencyAccount(tokenId);
  dotAgencyEntity.tokenId = tokenId;
  dotAgencyEntity.claim = claim;
  dotAgencyEntity.save();
}

export function setDoubleLayerStakingL2Info(
  doubleLayerStakingContract: DoubleLayerStaking,
  nft: Address
): void {
  let l2InfoEntity = DoubleLayerStakingL2.load(nft);
  if (l2InfoEntity === null) {
    l2InfoEntity = new DoubleLayerStakingL2(nft);
    l2InfoEntity.appInstance = nft;
  }

  const appInstanceEntity = AppInstance.load(nft);
  if (appInstanceEntity && appInstanceEntity.doubleLayerStakingL2 === null) {
    appInstanceEntity.doubleLayerStakingL2 = l2InfoEntity.id;
    appInstanceEntity.save();
  }
  const stakeInfo = doubleLayerStakingContract.stakingOfNFT(nft);
  l2InfoEntity.tvl = stakeInfo.getTvl();
  l2InfoEntity.points = stakeInfo.getPoints();
  l2InfoEntity.lastRewardBlock = stakeInfo.getLastRewardBlock();
  l2InfoEntity.endBlockOfEpoch = stakeInfo.getEndBlockOfEpoch();
  l2InfoEntity.rewardDebt = stakeInfo.getRewardDebt();
  l2InfoEntity.accTokenPerShare = stakeInfo.getAccTokenPerShare();
  l2InfoEntity.tokenPerBlock = stakeInfo.getTokenPerBlock();
  l2InfoEntity.unspentRewards = stakeInfo.getUnspentRewards();
  const rewardToken = doubleLayerStakingContract.rewardToken();
  if (rewardToken) {
    setCurrency(rewardToken);
  }
  const requestedCurrency = doubleLayerStakingContract.requestedCurrency();
  l2InfoEntity.rewardToken = rewardToken;
  l2InfoEntity.requestedCurrency = requestedCurrency;
  // TODO
  l2InfoEntity.currencyType = BigInt.fromI32(
    stakeInfo.getCurrencyType()
  ).equals(new BigInt(0))
    ? "ERC20"
    : "ETH";
  l2InfoEntity.save();
}

export function setDoubleLayerStakingL2TokenIdRewardDebtInfo(
  doubleLayerStakingContract: DoubleLayerStaking,
  nft: Address,
  tokenId: BigInt
): void {
  const entityId = Bytes.fromUTF8(
    nft.toHexString().concat("-").concat(tokenId.toString())
  );
  let rewardDebtEntity = new DoubleLayerStakingL2TokenIdRewardDebt(entityId);

  if (rewardDebtEntity === null) {
    rewardDebtEntity = new DoubleLayerStakingL2TokenIdRewardDebt(entityId);
  }
  const agentEntity = Agent.load(entityId);
  if (
    agentEntity &&
    agentEntity.doubleLayerStakingL2TokenIdRewardDebt === null
  ) {
    agentEntity.doubleLayerStakingL2TokenIdRewardDebt = rewardDebtEntity.id;
    agentEntity.save();
  }
  const rewardDebt = doubleLayerStakingContract.tokenIdRewardDebt(nft, tokenId);
  rewardDebtEntity.tokenId = tokenId;
  rewardDebtEntity.contractAddress = nft;
  rewardDebtEntity.rewardDebt = rewardDebt;
  if (agentEntity) {
    rewardDebtEntity.agent = agentEntity.id;
  }
  rewardDebtEntity.save();
}

export function handleStakeEvent(event: StakeEvent): void {
  const l2 = event.params.l2;
  const user = event.params.user;
  const tokenId = event.params.tokenId;
  const agentEntityId = Bytes.fromUTF8(
    l2.toHexString().concat("-").concat(tokenId.toString())
  );
  const agentEntity = Agent.load(agentEntityId);

  const contract = DoubleLayerStaking.bind(dataSource.address());
  if (agentEntity) {
    agentEntity.stakeState = contract.getState(l2, tokenId);
    agentEntity.save();
  }
}

export function handleUnStakeEvent(event: UnstakeEvent): void {
  const tokenId = event.params.tokenId;
  const l2 = event.params.l2;
  const user = event.params.user;

  const agentEntityId = Bytes.fromUTF8(
    l2.toHexString().concat("-").concat(tokenId.toString())
  );
  const agentEntity = Agent.load(agentEntityId);

  const contract = DoubleLayerStaking.bind(dataSource.address());
  if (agentEntity) {
    agentEntity.stakeState = contract.getState(l2, tokenId);
    agentEntity.save();
  }
}

export function handleStake(call: StakeCall): void {
  const nft = call.inputs.nft;
  const tokenId = call.inputs.tokenId;
  const stakingContract = DoubleLayerStaking.bind(dataSource.address());
  setDoubleLayerStakingL2Info(stakingContract, nft);
  setDoubleLayerStakingL2TokenIdRewardDebtInfo(stakingContract, nft, tokenId);
}

export function handleUnstake(call: UnstakeCall): void {
  const nft = call.inputs.nft;
  const tokenId = call.inputs.tokenId;
  const stakingContract = DoubleLayerStaking.bind(dataSource.address());
  setDoubleLayerStakingL2Info(stakingContract, nft);
  setDoubleLayerStakingL2TokenIdRewardDebtInfo(stakingContract, nft, tokenId);
}

export function handleWithdrawReward(call: WithdrawRewardCall): void {
  const nft = call.inputs.nft;
  const tokenId = call.inputs.tokenId;
  const stakingContract = DoubleLayerStaking.bind(dataSource.address());
  setDoubleLayerStakingL2Info(stakingContract, nft);
  setDoubleLayerStakingL2TokenIdRewardDebtInfo(stakingContract, nft, tokenId);
}

export function handleUpdateRewardL1(call: UpdateRewardL1Call): void {
  const nft = call.inputs.nft;
  const stakingContract = DoubleLayerStaking.bind(dataSource.address());
  const stakingOfNFT = stakingContract.stakingOfNFT(nft);
  if (stakingOfNFT.getTvl().equals(new BigInt(0))) {
    return;
  }
  setDoubleLayerStakingL2Info(stakingContract, nft);
}

export function handleUpdatePoolL2(call: UpdatePoolL2Call): void {
  const nft = call.inputs.nft;

  const stakingContract = DoubleLayerStaking.bind(dataSource.address());
  const stakingOfNFT = stakingContract.stakingOfNFT(nft);
  if (
    stakingOfNFT.getEndBlockOfEpoch().ge(call.block.number) ||
    stakingOfNFT.getUnspentRewards().equals(new BigInt(0))
  ) {
    return;
  }
  setDoubleLayerStakingL2Info(stakingContract, nft);
}

export function handleUpdateRewardL2(call: UpdateRewardL2Call): void {
  const nft = call.inputs.nft;
  const stakingContract = DoubleLayerStaking.bind(dataSource.address());
  const stakingOfNFT = stakingContract.stakingOfNFT(nft);

  if (
    stakingOfNFT.getPoints().equals(new BigInt(0)) ||
    stakingOfNFT.getEndBlockOfEpoch() <= stakingOfNFT.getLastRewardBlock() ||
    stakingOfNFT.getTokenPerBlock().equals(new BigInt(0))
  ) {
    return;
  }
  setDoubleLayerStakingL2Info(stakingContract, nft);
}

export function handleClaimCreator(call: ClaimCall): void {
  const account = call.inputs.account;
  const stakingContract = DoubleLayerStaking.bind(dataSource.address());
  setDoubleLayerCreatorAccount(stakingContract, account);
}

export function handleClaimDotAgency(call: Claim1Call): void {
  const tokenId = call.inputs.tokenId;
  const stakingContract = DoubleLayerStaking.bind(dataSource.address());
  setDoubleLayerDotAgenct(stakingContract, tokenId);
}

export function handleExec(call: ExecCall): void {
  const selector = call.inputs.selector;
  const data = call.inputs.data;
  if (
    ByteArray.fromHexString(selector.toHexString()).equals(
      Bytes.fromHexString("0x3c6e2f22")
    )
  ) {
    return;
  }
  const tokenId = ethereum.decode("(uint256)", data);
  if (tokenId === null) {
    return;
  }
  const agencyContract = Agency.bind(call.from);
  const strategy = agencyContract.try_getStrategy();
  if (strategy.reverted) {
    return;
  }

  const nft = strategy.value.getApp();
  const stakingContract = DoubleLayerStaking.bind(dataSource.address());
  setDoubleLayerStakingL2Info(stakingContract, nft);
  setDoubleLayerStakingL2TokenIdRewardDebtInfo(
    stakingContract,
    nft,
    tokenId.toBigInt()
  );
}
