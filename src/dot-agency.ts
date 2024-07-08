import {
  BigInt,
  DataSourceContext,
  dataSource,
  ethereum,
  log,
} from "@graphprotocol/graph-ts";
import {
  Transfer as TransferEvent,
  DotAgency as DotAgencyContract,
  ERC6551AccountCreated as ERC6551AccountCreatedEvent,
  NewResolver as NewResolverEvent,
  Mint as MintEvent,
} from "../generated/DotAgency/DotAgency";
import { addressZero, setHolder } from ".";
import { Erc6551 as Erc6551Contract } from "../generated/templates";
import { DotAgency, Erc6551, Node, Resolver } from "../generated/schema";

export function handleMint(event: MintEvent): void {
  const tokenId = event.params.tokenId;
  const price = event.params.price;
  const to = event.params.to;
  const holderEntity = setHolder(to);

  let entity = DotAgency.load(tokenId.toString());
  if (entity === null) {
    const deployerContract = DotAgencyContract.bind(dataSource.address());
    const node = deployerContract.getNode(tokenId);
    const name = deployerContract.getName(node);

    const resolver = deployerContract.getResolver(node);

    const nodeEntity = new Node(node.toHexString());
    const resolverEntity = new Resolver(resolver.toHexString());
    resolverEntity.save();
    nodeEntity.resolver = resolverEntity.id;
    nodeEntity.save();

    const entityId = tokenId.toString();

    entity = new DotAgency(entityId);
    entity.tokenId = tokenId;
    entity.holder = holderEntity.id;
    entity.name = name.toString();
    entity.timestap = event.block.timestamp;
    entity.blockNumber = event.block.number;
    entity.transactionHash = event.transaction.hash;
    entity.erc6551 = addressZero;
    entity.node = nodeEntity.id;
  }
  entity.mintPrice = price;
  entity.save();
}

export function handleTransfer(event: TransferEvent): void {
  const tokenId = event.params.tokenId;
  const from = event.params.from;
  const to = event.params.to;

  const holderEntity = setHolder(to);

  const entityId = tokenId.toString();
  let entity = DotAgency.load(entityId);

  if (entity === null) {
    const deployerContract = DotAgencyContract.bind(dataSource.address());
    const node = deployerContract.getNode(tokenId);
    const name = deployerContract.getName(node);

    const resolver = deployerContract.getResolver(node);

    const nodeEntity = new Node(node.toHexString());
    const resolverEntity = new Resolver(resolver.toHexString());
    resolverEntity.save();
    nodeEntity.resolver = resolverEntity.id;
    nodeEntity.save();

    const entityId = tokenId.toString();

    entity = new DotAgency(entityId);
    entity.tokenId = tokenId;
    entity.holder = holderEntity.id;
    entity.name = name.toString();
    entity.mintPrice = new BigInt(0);
    entity.timestap = event.block.timestamp;
    entity.blockNumber = event.block.number;
    entity.transactionHash = event.transaction.hash;
    entity.erc6551 = addressZero;
    entity.node = nodeEntity.id;
    entity.save();
  } else {
    entity.holder = holderEntity.id;
    entity.save();
  }
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

  const deployerEntity = DotAgency.load(tokenId.toString());

  const erc6551Entity = new Erc6551(erc6551.toHexString());
  erc6551Entity.account = erc6551;
  erc6551Entity.contractAddress = tokenContract;
  erc6551Entity.tokenId = tokenId;
  erc6551Entity.chainId = chainId;
  erc6551Entity.implementation = implementation;
  erc6551Entity.salt = salt;
  erc6551Entity.transactionHash = event.transaction.hash;
  erc6551Entity.save();

  if (deployerEntity !== null) {
    deployerEntity.erc6551 = erc6551;
    deployerEntity.save();
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