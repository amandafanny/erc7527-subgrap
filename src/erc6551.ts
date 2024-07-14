import { Address, BigInt, Bytes, dataSource } from "@graphprotocol/graph-ts";
import { Erc6551, Execute } from "../generated/schema";
import { ExecuteCall } from "../generated/templates/Erc6551/Erc6551";
import { addressZero } from ".";

export function setErc6551Zero(): Erc6551 {
  let erc6551Entity = Erc6551.load(addressZero);
  if (erc6551Entity === null) {
    erc6551Entity = new Erc6551(addressZero);
    erc6551Entity.account = addressZero;
    erc6551Entity.contractAddress = addressZero;
    erc6551Entity.tokenId = new BigInt(0);
    erc6551Entity.chainId = new BigInt(0);
    erc6551Entity.implementation = addressZero;
    erc6551Entity.salt = Bytes.fromHexString("0x");
    erc6551Entity.transactionHash = Bytes.fromHexString("0x");
    erc6551Entity.blockNumber = new BigInt(0);
    erc6551Entity.save();
  }
  return erc6551Entity;
}

export function handleExecute(call: ExecuteCall): void {
  const entity = new Execute(call.transaction.hash);
  const context = dataSource.context();
  const erc6551Entity = context.getString("erc6551Entity");
  const target = call.inputs.target;
  const value = call.inputs.value;
  const data = call.inputs.data;
  const operation = call.inputs.operation;
  entity.transactionHash = call.transaction.hash;
  entity.target = target;
  entity.value = value;
  entity.data = data;
  entity.operation = operation;
  entity.erc6551 = Address.fromString(erc6551Entity);
  entity.blockNumber = call.block.number;
  entity.save();
}
