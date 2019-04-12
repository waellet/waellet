// export const account = state => state.account;

export const getters = {
  account(state) {
    return state.account;
  },
  network(state) {
    return state.network;
  },
  currentNetwork(state) {
    return state.currentNetwork;
  },
};
