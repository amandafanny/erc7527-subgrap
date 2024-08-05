import { Address, BigInt, Bytes, ethereum } from "@graphprotocol/graph-ts";
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
  let holderEntity = Holder.load(holder);
  if (holderEntity === null) {
    holderEntity = new Holder(holder);
    holderEntity.address = holder;
    holderEntity.save();
  }

  return holderEntity;
};

export const setCurrency = (currency: Address): Currency => {
  let currencyEntity = Currency.load(currency);
  if (currencyEntity === null) {
    currencyEntity = new Currency(currency);

    if (currency.equals(addressZero)) {
      currencyEntity.decimals = 18;
      currencyEntity.symbol = "ETH";
      currencyEntity.save();
      return currencyEntity;
    }

    const currencyContract = ERC20.bind(currency);

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

export const getAgencyBalance = (agencyInstance: Address): BigInt => {
  const agencyContract = Agency.bind(agencyInstance);
  const strategy = agencyContract.try_getStrategy();

  if (strategy.reverted) {
    return new BigInt(0);
  } else {
    const currency = strategy.value.getAsset().currency;
    if (currency.equals(addressZero)) {
      return ethereum.getBalance(agencyInstance);
      // return new BigInt(0);
    } else {
      const erc20 = ERC20.bind(currency);
      const re = erc20.try_balanceOf(agencyInstance);
      if (re.reverted) {
        return new BigInt(0);
      } else {
        return re.value;
      }
    }
  }
};

export const setFactory = (
  appInstance: Address,
  appImplementation: Address,
  agencyInstance: Address,
  agencyImplementation: Address
): void => {
  const appInstanceEntity = new AppInstance(appInstance);
  const agencyInstanceEntity = new AgencyInstance(agencyInstance);

  const agentContract = Agent.bind(appInstance);
  appInstanceEntity.address = appInstance;
  appInstanceEntity.appImplementation = appImplementation;
  const name = agentContract.try_name();
  appInstanceEntity.totalSupply = new BigInt(0);
  const maxSupply = agentContract.try_getMaxSupply();
  if (name.reverted) {
    appInstanceEntity.name = "";
  } else {
    appInstanceEntity.name = name.value;
  }

  if (maxSupply.reverted) {
    appInstanceEntity.maxSupply = new BigInt(0);
  } else {
    appInstanceEntity.maxSupply = maxSupply.value;
  }

  appInstanceEntity.save();

  agencyInstanceEntity.isRenounceForceApprove = false;
  agencyInstanceEntity.isRenounceForceCancel = false;
  const agencyContract = Agency.bind(agencyInstance);
  const strategy = agencyContract.try_getStrategy();

  if (strategy.reverted) {
    const currencyEntity = setCurrency(addressZero);
    agencyInstanceEntity.currency = currencyEntity.id;
    agencyInstanceEntity.mintFeePercent = 0;
    agencyInstanceEntity.burnFeePercent = 0;
  } else {
    const asset = strategy.value.getAsset();
    const currencyEntity = setCurrency(asset.currency);
    agencyInstanceEntity.currency = currencyEntity.id;
    agencyInstanceEntity.mintFeePercent = asset.mintFeePercent;
    agencyInstanceEntity.burnFeePercent = asset.burnFeePercent;
  }

  agencyInstanceEntity.agencyImplementation = agencyImplementation;
  agencyInstanceEntity.tvl = new BigInt(0);
  agencyInstanceEntity.pureTvl = new BigInt(0);
  agencyInstanceEntity.fee = new BigInt(0);
  agencyInstanceEntity.swap = new BigInt(0);
  agencyInstanceEntity.feeCount = new BigInt(0);
  agencyInstanceEntity.perTokenReward = new BigInt(0);
  agencyInstanceEntity.appInstance = appInstance;

  agencyInstanceEntity.save();
};
