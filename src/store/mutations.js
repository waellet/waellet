import * as types from './mutation-types';
import { POPUP_PROPS } from '../popup/utils/popup-messages';

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
    Object.assign(state.popup, payload);
  },
  [types.DEF_POPUP](state) {
    let def_popup_props = Object.assign({}, POPUP_PROPS);
    state.popup = def_popup_props;
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
  [types.UPDATE_ALL_TRANSACTIONS](state, payload) {
    if(payload.new) {
      state.transactions.all.unshift(...payload.transactions);
    }else {
      state.transactions.all.push(...payload.transactions);
    }
  },
  [types.RESET_TRANSACTIONS](state) {
      state.transactions.all = [];  
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
  },
  [types.SET_USERNETWORK](state, payload) {
    state.userNetworks.push(payload);
  },
  [types.SET_USERNETWORKS](state, payload) {
    state.userNetworks = payload;
  },
  [types.INIT_SDK] (state, payload) {
    state.sdk = payload
  },
  [types.SET_TOKENS] (state, payload) {
    state.tokens = payload
  },
  [types.UPDATE_TOKENS_BALANCE] (state, payload) {
    state.tokens[payload.token].balance = payload.balance
  },
  [types.UNSET_TOKENS] (state, payload) {
    state.tokens = [{
      name:"AE",
      symbol:"AE",
      precision:7,
      balance:0,
      contract:''
    }];
  },
  [types.SET_AEPP_POPUP] (state, payload) {
    state.aeppPopup = payload
  }
}; 
