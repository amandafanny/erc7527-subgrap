import {
  Transfer as TransferEvent,
  Agent as AgentContract,
  NewResolver as NewResolverEvent,
  ERC6551AccountCreated as ERC6551AccountCreatedEvent,
} from "../generated/templates/Agent/Agent";
import {
  Agent,
  AppInstance,
  Erc6551,
  Node,
  Resolver,
} from "../generated/schema";
import {
  Address,
  Bytes,
  DataSourceContext,
  dataSource,
} from "@graphprotocol/graph-ts";
import { Erc6551 as Erc6551Contract } from "../generated/templates";
import { addressZero, setHolder } from ".";
import { setErc6551Zero } from "./erc6551";

export function handleTransfer(event: TransferEvent): void {
  const context = dataSource.context();

  const tokenId = event.params.id;
  const from = event.params.from;
  const holder = event.params.to;
  const appInstance = context.getString("appInstance");
  const appImplementation = context.getString("appImplementation");
  const agencyInstance = context.getString("agencyInstance");
  const agencyImplementation = context.getString("agencyImplementation");

  const holderEntity = setHolder(holder);

  const agentEntityId = Bytes.fromUTF8(
    appInstance.concat("-").concat(tokenId.toString())
  );

  let agentEntity = Agent.load(agentEntityId);

  const appInstanceAddress = Address.fromString(appInstance);
  const agentContract = AgentContract.bind(appInstanceAddress);

  if (agentEntity === null) {
    agentEntity = new Agent(agentEntityId);

    const name = agentContract.getName1(tokenId);
    const node = agentContract.getNode(tokenId);
    const resolver = agentContract.getResolver(node);

    const nodeEntity = new Node(node);
    const resolverEntity = new Resolver(resolver);
    resolverEntity.save();
    nodeEntity.resolver = resolverEntity.id;
    nodeEntity.save();

    const appInstancEntity = AppInstance.load(appInstanceAddress);
    const totalSupply = agentContract.try_totalSupply();
    if (appInstancEntity !== null && !totalSupply.reverted) {
      appInstancEntity.totalSupply = totalSupply.value;
      appInstancEntity.save();
    }

    agentEntity.tokenId = tokenId;
    agentEntity.name = name;
    agentEntity.appInstance = appInstanceAddress;
    agentEntity.agencyInstance = Address.fromString(agencyInstance);
    agentEntity.appImplementation = Address.fromString(appImplementation);
    agentEntity.agencyImplementation = Address.fromString(agencyImplementation);
    agentEntity.holder = holderEntity.id;
    agentEntity.stakeState = 0;
    agentEntity.stakeStateOld = 0;
    agentEntity.erc6551 = setErc6551Zero().id;
    agentEntity.node = nodeEntity.id;
  } else if (holder.equals(addressZero)) {
    const appInstancEntity = AppInstance.load(appInstanceAddress);
    const totalSupply = agentContract.try_totalSupply();
    if (appInstancEntity !== null && !totalSupply.reverted) {
      appInstancEntity.totalSupply = totalSupply.value;
      appInstancEntity.save();
    }
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
    Bytes.fromUTF8(
      dataSource.address().toHexString().concat("-").concat(tokenId.toString())
    )
  );

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

  if (agentEntity !== null) {
    agentEntity.erc6551 = erc6551;
    agentEntity.save();
  }

  const context = new DataSourceContext();
  context.setString("contractAddress", tokenContract.toHexString());
  context.setString("tokenId", tokenId.toString());
  context.setString("erc6551Entity", erc6551Entity.id.toHexString());

  Erc6551Contract.createWithContext(erc6551, context);
}

export function handleNewResolver(event: NewResolverEvent): void {
  const node = event.params.node;
  const resolver = event.params.resolver;

  let nodeEntity = Node.load(node);
  let resolverEntity = Resolver.load(resolver);

  if (resolverEntity === null) {
    resolverEntity = new Resolver(resolver);
  }
  if (nodeEntity === null) {
    nodeEntity = new Node(node);
  }
  nodeEntity.resolver = resolverEntity.id;
  resolverEntity.save();
  nodeEntity.save();
}
