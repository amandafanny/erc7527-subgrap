import { dataSource } from "@graphprotocol/graph-ts";
import { Execute } from "../generated/schema";
import { ExecuteCall } from "../generated/templates/Erc6551/Erc6551";

export function handleExecute(call: ExecuteCall): void {
  const entity = new Execute(call.transaction.hash.toHexString());
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
  entity.erc6551 = erc6551Entity;
  entity.save();
}
