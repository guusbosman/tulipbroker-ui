export type NewTradeActions = {
  navigateToOrders: () => void;
  closeMenu: () => void;
  requestOrdersFocus: () => void;
};

export function createNewTradeHandler(actions: NewTradeActions): () => void;
