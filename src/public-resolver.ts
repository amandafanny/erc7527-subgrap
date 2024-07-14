import { Bytes, dataSource, log } from "@graphprotocol/graph-ts";
import {
  PublicResolver,
  TextChanged as TextChangedEvent,
} from "../generated/templates/PublicResolver/PublicResolver";
import { Bond, Node } from "../generated/schema";

export function handleTextChanged(event: TextChangedEvent): void {
  const node = event.params.node;
  const indexedKey = event.params.indexedKey;
  const key = event.params.key;
  const value = event.params.value;
  const resolver = dataSource.address();
  const bondId = Bytes.fromUTF8(
    node
      .toHexString()
      .concat("-")
      .concat(resolver.toHexString())
      .concat("-")
      .concat(key)
  );

  const contract = PublicResolver.bind(dataSource.address());
  const version = contract.recordVersions(node);
  let bondEntity = Bond.load(bondId);
  let nodeEntity = Node.load(node);
  if (nodeEntity === null) {
    return;
  }
  if (bondEntity === null) {
    bondEntity = new Bond(bondId);
    bondEntity.key = key.toString();
    bondEntity.value = value.toString();
    bondEntity.resolver = resolver;
    bondEntity.version = version;
    if (nodeEntity !== null) {
      bondEntity.node = nodeEntity.id;
    }
  } else {
    bondEntity.value = value.toString();
  }
  if (bondEntity.version.notEqual(version)) {
    bondEntity.version = version;
  }

  bondEntity.save();
}
