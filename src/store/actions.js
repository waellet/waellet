import Ae from '@aeternity/aepp-sdk/es/ae/universal';
import * as types from './mutation-types';
import * as popupMessages from '../popup/utils/popup-messages';
export default {
  setAccount({ commit }, payload) {
    commit(types.UPDATE_ACCOUNT, payload);
    commit(types.UPDATE_BALANCE);
  },
  switchNetwork({ commit }, payload) {
    return new Promise((resolve, reject) => {
      commit(types.SWITCH_NETWORK, payload);
      resolve();
    });
  },
  updateBalance({ commit, state }) {
    Ae({
      url: state.network[state.current.network].url,
      internalUrl: state.network[state.current.network].internalUrl,
      keypair: {
        secretKey: state.account.secretKey,
        publicKey: state.account.publicKey,
      },
      networkId: state.network[state.current.network].networkId,
    }).then(ae => {
      ae.balance(state.account.publicKey)
        .then(balance => {
          const balanceInAE = balance / 10 ** 18;
          commit(types.UPDATE_BALANCE, balanceInAE);
        })
        .catch(e => {
          console.log(e);
          const balanceInAE = 0;
          commit(types.UPDATE_BALANCE, balanceInAE);
        });
    });
  },
  popupAlert({ commit }, payload) {
    switch (payload.name) {
      case 'spend':
        switch (payload.type) {
          case 'insufficient_balance':
            commit(types.SHOW_POPUP,{show:true,...popupMessages.INSUFFICIENT_BALANCE});
            break;
          case 'success_transfer':
            commit(types.SHOW_POPUP,{show:true,secondBtn:true,secondBtnClick:'showTransaction',...popupMessages.SUCCESS_TRANSFER,msg:payload.msg,data:payload.data})
            break;
          default:
            break;
        }
        break;
      case 'account':
        switch (payload.type) {
          case 'publicKeyCopied':
            commit(types.SHOW_POPUP,{show:true,...popupMessages.PUBLIC_KEY_COPIED});
            break;
          case 'seedFastCopy':
              commit(types.SHOW_POPUP,{show:true,...popupMessages.SEED_FAST_COPY});
            break;
          default:
            break;
        }
        break;
      default:
        break;
    }
  },
  getTransactionsByPublicKey({commit,state}, payload) {
    const middlewareUrl = state.network[state.current.network].middlewareUrl;
    let limit = "",page = "" ,param = "";
    let account = payload.publicKey;
    if(payload.limit) {
      limit = "?limit=" + payload.limit;
    }
    if(payload.page) {
      page = "&page=" + payload.page;
    }
    if(payload.param) {
      param = "/" + payload.param;
    }
    return fetch(middlewareUrl + "/middleware/transactions/account/" + account + limit + page + param)
    .then(res => res.json());
  }
};
