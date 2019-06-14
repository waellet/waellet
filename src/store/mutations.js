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
  [types.SWITCH_LOGGED_IN](state,payload) {
    state.isLoggedIn = payload;
  }
}; 
