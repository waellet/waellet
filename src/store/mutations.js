import * as types from './mutation-types';

export default {
  [types.UPDATE_ACCOUNT](state, payload) {
    state.account = payload;
  },
  [types.UPDATE_BALANCE](state, payload) {
    state.balance = payload;
  },
  [types.SWITCH_NETWORK](state, payload) {
    state.current.network = payload;
  },
  [types.SHOW_POPUP](state,payload) {
    state.popup = payload;
  },
  [types.HIDE_POPUP](state) {
    state.popup.show = false;
    state.popup.secondBtn = false;
  },
  [types.SWITCH_LOGGED_IN](state, payload) {
    state.isLoggedIn = payload;
  },
  [types.UPDATE_LATEST_TRANSACTIONS](state, payload) {
    state.transactions.latest = payload;
  },
  [types.SET_SUBACCOUNT](state, payload) {
    state.subaccounts.push(payload);
  },
  [types.SET_SUBACCOUNTS](state, payload) {
    state.subaccounts = payload;
  },
  [types.SET_WALLET](state, payload) {
    state.wallet = payload;
  },
  [types.SET_ACTIVE_ACCOUNT] (state, payload) {
    state.account.publicKey = payload.publicKey;
    state.activeAccount = payload.index;
  },
  [types.UNSET_SUBACCOUNTS] (state) {
    state.subaccounts = [];
  },
  [types.UPDATE_SUBACCOUNTS_BALANCE] (state, payload) {
    state.subaccounts[payload.account].balance = payload.balance;
  },
  [types.SET_ACCOUNT_NAME] (state, payload) {
    state.subaccounts[state.activeAccount].name = payload;
  }
}; 
