import { DataSourceContext, log } from "@graphprotocol/graph-ts";
import { Deploy as DeployEvent } from "../generated/Factory/Factory";
import { DeployV2 } from "../generated/schema";
import { Agency as AgencyContract, Agent } from "../generated/templates";
import { setAgencyInstance, setAppInstance } from ".";

export function handleDeploy(event: DeployEvent): void {
  const deployEntity = new DeployV2(event.transaction.hash.toHexString());

  const agencyImplementation = event.params.agencyImplementation;
  const agencyInstance = event.params.agencyInstance;
  const appImplementation = event.params.appImplementation;
  const appInstance = event.params.appInstance;
  const tokenId = event.params.tokenId;

  const agencyInstanceEntity = setAgencyInstance(agencyInstance.toHexString());
  const appInstanceEntity = setAppInstance(appInstance.toHexString(), false);

  deployEntity.agencyImplementation = agencyImplementation;
  deployEntity.agencyInstance = agencyInstanceEntity.id;
  deployEntity.appImplementation = appImplementation;
  deployEntity.appInstance = appInstanceEntity.id;
  deployEntity.transactionHash = event.transaction.hash;
  deployEntity.tokenId = tokenId.toString();
  deployEntity.blockNumber = event.block.number;
  deployEntity.save();

  const context = new DataSourceContext();
  context.setString("appInstance", event.params.appInstance.toHexString());
  context.setString(
    "agencyInstance",
    event.params.agencyInstance.toHexString()
  );
  Agent.createWithContext(event.params.appInstance, context);
  AgencyContract.createWithContext(event.params.agencyInstance, context);
}
