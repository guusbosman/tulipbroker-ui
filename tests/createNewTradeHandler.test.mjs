import assert from "node:assert/strict";
import { mock, test } from "node:test";
import { createNewTradeHandler } from "../src/utils/createNewTradeHandler.js";

test("new trade handler routes to orders and closes menu", () => {
  const navigateToOrders = mock.fn();
  const closeMenu = mock.fn();
  const requestOrdersFocus = mock.fn();

  const handler = createNewTradeHandler({
    navigateToOrders,
    closeMenu,
    requestOrdersFocus,
  });

  handler();

  assert.equal(navigateToOrders.mock.calls.length, 1);
  assert.equal(closeMenu.mock.calls.length, 1);
  assert.equal(requestOrdersFocus.mock.calls.length, 1);
});
