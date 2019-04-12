// export const account = state => state.account;

export const getters = {
  account(state) {
    return state.account;
  },
  balance(state) {
    return state.balance;
  },
  network(state) {
    return state.network;
  },
  currentNetwork(state) {
    return state.currentNetwork;
  },
};
