import { dataSource } from "@graphprotocol/graph-ts";
import {
  Deposit as DepositEvent,
  LPStaking,
  Withdraw as WithdrawEvent,
  ClaimCall,
} from "../generated/LPStaking/LPStaking";
import { LP } from "../generated/schema";
import { setCurrency, setHolder } from ".";

export function handleDeposit(event: DepositEvent): void {
  const user = event.params.user;
  const holder = setHolder(user);
  const lpContract = LPStaking.bind(dataSource.address());
  const userInfo = lpContract.userInfo(user);
  const rewardToken = lpContract.rewardToken();
  const currency = setCurrency(rewardToken);
  let lpEntity = LP.load(user);
  if (lpEntity === null) {
    lpEntity = new LP(user);
    lpEntity.rewardToken = currency.id;
  }

  if (holder.lp === null) {
    holder.lp = lpEntity.id;
    holder.save();
  }

  lpEntity.holder = holder.id;
  lpEntity.amount = userInfo.getAmount();
  lpEntity.rewardDebt = userInfo.getRewardDebt();
  lpEntity.save();
}

export function handleWithdraw(event: WithdrawEvent): void {
  const user = event.params.user;
  const holder = setHolder(user);
  const lpContract = LPStaking.bind(dataSource.address());
  const userInfo = lpContract.userInfo(user);
  let lpEntity = LP.load(user);
  if (lpEntity !== null) {
    lpEntity.holder = holder.id;
    lpEntity.amount = userInfo.getAmount();
    lpEntity.rewardDebt = userInfo.getRewardDebt();
    lpEntity.save();
  }
}

export function handleClaim(call: ClaimCall): void {
  const user = call.transaction.from;
  const holder = setHolder(user);
  const lpContract = LPStaking.bind(dataSource.address());
  const userInfo = lpContract.userInfo(user);
  let lpEntity = LP.load(user);
  if (lpEntity !== null) {
    lpEntity.holder = holder.id;
    lpEntity.amount = userInfo.getAmount();
    lpEntity.rewardDebt = userInfo.getRewardDebt();
    lpEntity.save();
  }
}
