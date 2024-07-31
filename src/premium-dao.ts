import {
  ByteArray,
  Bytes,
  DataSourceContext,
  dataSource,
  log,
} from "@graphprotocol/graph-ts";
import { setHolder } from ".";
import {
  ERC6551AccountCreated as ERC6551AccountCreatedEvent,
  Transfer as TransferEvent,
} from "../generated/PremiumDAO/PremiumDAO";
import { Erc6551 as Erc6551Contract } from "../generated/templates";
import { Erc6551, PremiumDAO } from "../generated/schema";
import { setErc6551Zero } from "./erc6551";

export function handleERC6551AccountCreated(
  event: ERC6551AccountCreatedEvent
): void {
  const erc6551 = event.params.account;
  const tokenContract = event.params.tokenContract;
  const tokenId = event.params.tokenId;
  const chainId = event.params.chainId;
  const implementation = event.params.implementation;
  const salt = event.params.salt;
  const erc6551Entity = new Erc6551(erc6551);
  erc6551Entity.account = erc6551;
  erc6551Entity.contractAddress = tokenContract;
  erc6551Entity.tokenId = tokenId;
  erc6551Entity.chainId = chainId;
  erc6551Entity.implementation = implementation;
  erc6551Entity.salt = salt;
  erc6551Entity.transactionHash = event.transaction.hash;
  erc6551Entity.blockNumber = event.block.number;
  erc6551Entity.save();

  const premiumDAOEntity = PremiumDAO.load(
    Bytes.fromByteArray(Bytes.fromBigInt(tokenId))
  );
  if (premiumDAOEntity !== null) {
    premiumDAOEntity.erc6551 = erc6551;
    premiumDAOEntity.save();
  }

  const context = new DataSourceContext();
  context.setString("contractAddress", tokenContract.toHexString());
  context.setString("tokenId", tokenId.toString());
  context.setString("erc6551Entity", erc6551Entity.id.toHexString());

  Erc6551Contract.createWithContext(erc6551, context);
}

export function handleTransfer(event: TransferEvent): void {
  const to = event.params.to;
  const from = event.params.from;
  const tokenId = event.params.tokenId;
  const entityId = Bytes.fromByteArray(ByteArray.fromBigInt(tokenId));
  let premiumDAOEntity = PremiumDAO.load(entityId);
  const context = dataSource.context();
  const holderEntity = setHolder(to);
  if (premiumDAOEntity === null) {
    premiumDAOEntity = new PremiumDAO(entityId);
    premiumDAOEntity.holder = holderEntity.id;
    premiumDAOEntity.tokenId = tokenId;
    premiumDAOEntity.erc6551 = setErc6551Zero().id;
    premiumDAOEntity.transactionHash = event.transaction.hash;
  } else {
    premiumDAOEntity.holder = holderEntity.id;
  }
  premiumDAOEntity.save();
}
