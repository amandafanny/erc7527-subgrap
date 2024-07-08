import { Address, BigInt, Bytes } from "@graphprotocol/graph-ts";
import {
  AgencyInstance,
  AppInstance,
  Currency,
  Holder,
} from "../generated/schema";
import { Agent } from "../generated/templates/Agent/Agent";
import { Agency } from "../generated/Factory/Agency";
import { ERC20 } from "../generated/Factory/ERC20";

export const addressZero = Address.fromString(
  "0x0000000000000000000000000000000000000000"
);

export const setHolder = (holder: Bytes): Holder => {
  const id = holder.toHexString();
  let appInstanceEntity = Holder.load(id);
  if (appInstanceEntity === null) {
    appInstanceEntity = new Holder(id);
    appInstanceEntity.address = holder;
    appInstanceEntity.save();
  }

  return appInstanceEntity;
};

export const setAppInstance = (
  appInstance: string,
  update: bool
): AppInstance => {
  let appInstanceEntity = AppInstance.load(appInstance);
  const appInstanceAddress = Address.fromString(appInstance);
  const agentContract = Agent.bind(appInstanceAddress);

  if (appInstanceEntity === null) {
    appInstanceEntity = new AppInstance(appInstance);
    appInstanceEntity.address = appInstanceAddress;
    const name = agentContract.try_name();
    appInstanceEntity.totalSupply = new BigInt(0);
    if (name.reverted) {
      appInstanceEntity.name = "";
    } else {
      appInstanceEntity.name = name.value;
    }
  }
  // update totalSupply
  if (update) {
    const totalSupply = agentContract.try_totalSupply();
    if (!totalSupply.reverted) {
      appInstanceEntity.totalSupply = totalSupply.value;
    }
  }

  appInstanceEntity.save();
  return appInstanceEntity;
};

export const setCurrency = (currency: string): Currency => {
  let currencyEntity = Currency.load(currency);
  if (currencyEntity === null) {
    currencyEntity = new Currency(currency);

    if (currency == addressZero.toHexString()) {
      currencyEntity.decimals = 18;
      currencyEntity.symbol = "ETH";
      currencyEntity.save();
      return currencyEntity;
    }

    const currencyAddress = Address.fromString(currency);
    const currencyContract = ERC20.bind(currencyAddress);

    const decimals = currencyContract.try_decimals();
    const symbol = currencyContract.try_symbol();

    if (decimals.reverted) {
      currencyEntity.decimals = 0;
    } else {
      currencyEntity.decimals = decimals.value;
    }

    if (symbol.reverted) {
      currencyEntity.symbol = "";
    } else {
      currencyEntity.symbol = symbol.value;
    }

    currencyEntity.save();
  }

  return currencyEntity;
};

export const setAgencyInstance = (agencyInstance: string): AgencyInstance => {
  let agencyInstanceEntity = AgencyInstance.load(agencyInstance);
  if (agencyInstanceEntity === null) {
    agencyInstanceEntity = new AgencyInstance(agencyInstance);
  } else {
    return agencyInstanceEntity;
  }

  const appInstanceAddress = Address.fromString(agencyInstance);
  const agencyContract = Agency.bind(appInstanceAddress);
  const strategy = agencyContract.try_getStrategy();

  if (strategy.reverted) {
    const currencyEntity = setCurrency(addressZero.toHexString());
    agencyInstanceEntity.currency = currencyEntity.id;
    agencyInstanceEntity.mintFeePercent = 0;
    agencyInstanceEntity.burnFeePercent = 0;
  } else {
    const asset = strategy.value.getAsset();
    const currencyEntity = setCurrency(asset.currency.toHexString());
    agencyInstanceEntity.currency = currencyEntity.id;
    agencyInstanceEntity.mintFeePercent = asset.mintFeePercent;
    agencyInstanceEntity.burnFeePercent = asset.burnFeePercent;
  }

  agencyInstanceEntity.tvl = new BigInt(0);
  agencyInstanceEntity.fee = new BigInt(0);
  agencyInstanceEntity.swap = new BigInt(0);
  agencyInstanceEntity.feeCount = new BigInt(0);
  agencyInstanceEntity.perTokenReward = new BigInt(0);

  agencyInstanceEntity.save();
  return agencyInstanceEntity;
};
