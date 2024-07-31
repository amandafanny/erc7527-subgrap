import { Bytes, DataSourceContext, log } from "@graphprotocol/graph-ts";
import { Deploy as DeployEvent } from "../generated/Factory/Factory";
import { DeployV2 } from "../generated/schema";
import { Agency as AgencyContract, Agent } from "../generated/templates";
import { setFactory } from ".";

export function handleDeploy(event: DeployEvent): void {
  const deployEntity = new DeployV2(event.transaction.hash);

  const agencyImplementation = event.params.agencyImplementation;
  const agencyInstance = event.params.agencyInstance;
  const appImplementation = event.params.appImplementation;
  const appInstance = event.params.appInstance;
  const tokenId = event.params.tokenId;

  setFactory(
    appInstance,
    appImplementation,
    agencyInstance,
    agencyImplementation
  );

  deployEntity.agencyImplementation = agencyImplementation;
  deployEntity.agencyInstance = agencyInstance;
  deployEntity.appImplementation = appImplementation;
  deployEntity.appInstance = appInstance;
  deployEntity.transactionHash = event.transaction.hash;
  deployEntity.tokenId = Bytes.fromByteArray(Bytes.fromBigInt(tokenId));
  deployEntity.blockNumber = event.block.number;
  deployEntity.save();

  const context = new DataSourceContext();
  context.setString(
    "appImplementation",
    event.params.appImplementation.toHexString()
  );
  context.setString("appInstance", event.params.appInstance.toHexString());

  context.setString(
    "agencyImplementation",
    event.params.agencyImplementation.toHexString()
  );
  context.setString(
    "agencyInstance",
    event.params.agencyInstance.toHexString()
  );
  Agent.createWithContext(event.params.appInstance, context);
  AgencyContract.createWithContext(event.params.agencyInstance, context);
}
