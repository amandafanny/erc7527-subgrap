import {
  assert,
  describe,
  test,
  clearStore,
  beforeAll,
  afterAll,
} from "matchstick-as/assembly/index";
import { BigInt, ByteArray, Bytes, ethereum } from "@graphprotocol/graph-ts";
import { addressZero } from "../src";
// import { ApprovalForAll } from "../generated/schema"
// import { handleApprovalForAll } from "../src/factory"

// Tests structure (matchstick-as >=0.5.0)
// https://thegraph.com/docs/en/developer/matchstick/#tests-structure-0-5-0

describe("Describe entity assertions", () => {
  beforeAll(() => {});

  afterAll(() => {
    clearStore();
  });

  test("BigInt equal", () => {
    assert.bigIntEquals(
      new BigInt(4).minus(new BigInt(5)),
      new BigInt(-1),
      new BigInt(4).minus(new BigInt(5)).toString()
    );
  });
  test("Address equal", () => {
    assert.booleanEquals(addressZero.equals(addressZero), true);
  });
  test("hexstring equal", () => {
    assert.booleanEquals(
      ByteArray.fromHexString(
        Bytes.fromHexString("0x3c6e2f22").toHexString()
      ).equals(Bytes.fromHexString("0x3c6e2f22")),
      true
    );
  });

  test("Bytes not equal", () => {
    assert.booleanEquals(
      !ByteArray.fromHexString(
        Bytes.fromHexString("0x3c6e2f22").toHexString()
      ).equals(Bytes.fromHexString("0x3c6e2f22")),
      false
    );
  });

  test("ethereum.decode equal", () => {
    const data = ethereum.encode(
      ethereum.Value.fromUnsignedBigInt(new BigInt(4))
    );
    if (data !== null) {
      const tokenId = ethereum.decode("(uint256)", data);
      if (tokenId !== null) {
        assert.booleanEquals(
          tokenId.toTuple()[0].toBigInt().equals(new BigInt(4)),
          true
        );
      }
    }
  });

  test("BigInt equal", () => {
    assert.booleanEquals(new BigInt(0).equals(new BigInt(0)), true);
  });
});
