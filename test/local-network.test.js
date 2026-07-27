import assert from "node:assert/strict";
import test from "node:test";
import { isLocalNetworkAddress } from "../build/local-network.js";

const allowedAddresses = [
  "127.0.0.1",
  "10.2.3.4",
  "169.254.8.2",
  "172.16.0.1",
  "172.31.255.254",
  "192.168.50.4",
  "::1",
  "fc00::1",
  "fd12:3456::1",
  "fe80::1",
  "::ffff:192.168.1.2"
];

const rejectedAddresses = [
  "",
  "not-an-address",
  "8.8.8.8",
  "100.64.0.1",
  "172.15.255.254",
  "172.32.0.1",
  "192.0.2.1",
  "2001:4860:4860::8888"
];

test("accepts loopback, private, and link-local addresses", () => {
  for (const address of allowedAddresses) {
    assert.equal(isLocalNetworkAddress(address), true, address);
  }
});

test("rejects public, malformed, and unspecified addresses", () => {
  for (const address of rejectedAddresses) {
    assert.equal(isLocalNetworkAddress(address), false, address);
  }
});
