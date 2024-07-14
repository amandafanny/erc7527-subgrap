import {
  assert,
  describe,
  test,
  clearStore,
  beforeAll,
  afterAll,
} from "matchstick-as/assembly/index";
import { Address, BigInt, Bytes } from "@graphprotocol/graph-ts";
// import { Approval } from "../generated/schema"
import { Approval as ApprovalEvent } from "../generated/PremiumDAO/PremiumDAO";
// import { handleApproval } from "../src/premium-dao"
import { createApprovalEvent } from "./premium-dao-utils";

// Tests structure (matchstick-as >=0.5.0)
// https://thegraph.com/docs/en/developer/matchstick/#tests-structure-0-5-0

describe("Describe entity assertions", () => {
  beforeAll(() => {});

  afterAll(() => {
    clearStore();
  });

  test("I32 equal", () => {
    // More assert options:
    // https://thegraph.com/docs/en/developer/matchstick/#asserts
    // assert.bigIntEquals(new BigInt(0), new BigInt(0));
    assert.bytesEquals(
      Bytes.fromHexString("0xcc"),
      Bytes.fromHexString("0xcc")
    );

    // assert.i32Equals(0, 0);
    assert.stringEquals("0", "0");
  });
});
