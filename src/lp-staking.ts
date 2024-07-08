import { dataSource } from "@graphprotocol/graph-ts";
import {
  Deposit as DepositEvent,
  LPStaking,
  Withdraw as WithdrawEvent,
} from "../generated/LPStaking/LPStaking";
import { LP } from "../generated/schema";
import { setCurrency, setHolder } from ".";

export function handleDeposit(event: DepositEvent): void {
  const user = event.params.user;
  const holder = setHolder(user);
  const lpContract = LPStaking.bind(dataSource.address());
  const userInfo = lpContract.userInfo(user);
  const rewardToken = lpContract.rewardToken();
  const currency = setCurrency(rewardToken.toHexString());
  let lpEntity = LP.load(user.toHex());
  if (lpEntity === null) {
    lpEntity = new LP(user.toHex());
    lpEntity.rewardToken = currency.id;
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
  let lpEntity = LP.load(user.toHex());
  if (lpEntity) {
    lpEntity.holder = holder.id;
    lpEntity.amount = userInfo.getAmount();
    lpEntity.rewardDebt = userInfo.getRewardDebt();
    lpEntity.save();
  }
}
