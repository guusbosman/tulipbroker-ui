/**
 * Create a handler for the "New Trade" action.
 * @param {{ navigateToOrders: () => void; closeMenu: () => void; requestOrdersFocus: () => void }} actions
 */
export function createNewTradeHandler(actions) {
  return () => {
    actions.navigateToOrders();
    actions.closeMenu();
    actions.requestOrdersFocus();
  };
}
