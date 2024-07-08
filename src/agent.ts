import {
  Transfer as TransferEvent,
  Agent as AgentContract,
  NewResolver as NewResolverEvent,
  ERC6551AccountCreated as ERC6551AccountCreatedEvent,
} from "../generated/templates/Agent/Agent";
import { Agent, Erc6551, Node, Resolver } from "../generated/schema";
import {
  Address,
  DataSourceContext,
  dataSource,
  log,
} from "@graphprotocol/graph-ts";
import { Erc6551 as Erc6551Contract } from "../generated/templates";
import { addressZero, setAppInstance, setHolder } from ".";

export function handleTransfer(event: TransferEvent): void {
  const context = dataSource.context();

  const tokenId = event.params.id;
  const from = event.params.from;
  const holder = event.params.to;
  const appInstance = context.getString("appInstance");
  const agencyInstance = context.getString("agencyInstance");

  const holderEntity = setHolder(holder);

  const agentEntityId = appInstance.concat("-").concat(tokenId.toString());

  let agentEntity = Agent.load(agentEntityId);

  if (agentEntity === null) {
    agentEntity = new Agent(agentEntityId);
    const agentContract = AgentContract.bind(Address.fromString(appInstance));
    const name = agentContract.getName1(tokenId);
    const node = agentContract.getNode(tokenId);

    const resolver = agentContract.getResolver(node);

    const nodeEntity = new Node(node.toHexString());
    const resolverEntity = new Resolver(resolver.toHexString());
    resolverEntity.save();
    nodeEntity.resolver = resolverEntity.id;
    nodeEntity.save();

    const appInstancEntity = setAppInstance(appInstance, true);

    agentEntity.tokenId = tokenId;
    agentEntity.name = name;
    agentEntity.appInstance = appInstancEntity.id;
    agentEntity.agencyInstance = agencyInstance;
    agentEntity.holder = holderEntity.id;
    agentEntity.stakeState = 0;
    agentEntity.erc6551 = addressZero;
    agentEntity.node = nodeEntity.id;
  } else if (holder.toHexString() == addressZero.toHexString()) {
    setAppInstance(appInstance, true);
  }
  agentEntity.holder = holderEntity.id;

  agentEntity.save();
}

export function handleERC6551AccountCreated(
  event: ERC6551AccountCreatedEvent
): void {
  const erc6551 = event.params.account;
  const tokenContract = event.params.tokenContract;
  const tokenId = event.params.tokenId;
  const chainId = event.params.chainId;
  const implementation = event.params.implementation;
  const salt = event.params.salt;

  const agentEntity = Agent.load(
    dataSource.address().toHexString().concat("-").concat(tokenId.toString())
  );

  const erc6551Entity = new Erc6551(erc6551.toHexString());
  erc6551Entity.account = erc6551;
  erc6551Entity.contractAddress = tokenContract;
  erc6551Entity.tokenId = tokenId;
  erc6551Entity.chainId = chainId;
  erc6551Entity.implementation = implementation;
  erc6551Entity.salt = salt;
  erc6551Entity.transactionHash = event.transaction.hash;
  erc6551Entity.save();

  if (agentEntity !== null) {
    agentEntity.erc6551 = erc6551;
    agentEntity.save();
  }

  const context = new DataSourceContext();
  context.setString("contractAddress", tokenContract.toHexString());
  context.setString("tokenId", tokenId.toString());
  context.setString("erc6551Entity", erc6551Entity.id);

  Erc6551Contract.createWithContext(erc6551, context);
}

export function handleNewResolver(event: NewResolverEvent): void {
  const node = event.params.node;
  const resolver = event.params.resolver;

  let nodeEntity = Node.load(node.toHexString());
  let resolverEntity = Resolver.load(resolver.toHexString());

  if (resolverEntity === null) {
    resolverEntity = new Resolver(resolver.toHexString());
  }
  if (nodeEntity === null) {
    nodeEntity = new Node(node.toHexString());
  }
  nodeEntity.resolver = resolverEntity.id;
  resolverEntity.save();
  nodeEntity.save();
}
