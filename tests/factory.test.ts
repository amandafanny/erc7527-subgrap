import {
  assert,
  describe,
  test,
  clearStore,
  beforeAll,
  afterAll,
} from "matchstick-as/assembly/index";
import {
  Address,
  BigInt,
  ByteArray,
  Bytes,
  ethereum,
  log,
} from "@graphprotocol/graph-ts";
import { addressZero } from "../src";
// import { ApprovalForAll } from "../generated/schema"
// import { ApprovalForAll as ApprovalForAllEvent } from "../generated/Factory/Factory"
// import { handleApprovalForAll } from "../src/factory"

// Tests structure (matchstick-as >=0.5.0)
// https://thegraph.com/docs/en/developer/matchstick/#tests-structure-0-5-0

describe("Describe entity assertions", () => {
  beforeAll(() => {});

  afterAll(() => {
    clearStore();
  });

  test("Address equal", () => {
    assert.booleanEquals(
      ByteArray.fromHexString(addressZero.toHexString()).equals(addressZero),
      true
    );
  });
  test("Bytes equal", () => {
    assert.booleanEquals(
      ByteArray.fromHexString(
        Bytes.fromHexString("0x3c6e2f22").toHexString()
      ) == Bytes.fromHexString("0x3c6e2f22"),
      true
    );
  });

  test("Bytes not equal", () => {
    assert.booleanEquals(
      Bytes.fromHexString("0x3c6e2f22") != Bytes.fromHexString("0x3c6e2f22"),
      false
    );
  });

  test("BigInt equal", () => {
    assert.booleanEquals(new BigInt(0).equals(new BigInt(0)), true);
  });
});
