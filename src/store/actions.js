import Ae from '@aeternity/aepp-sdk/es/ae/universal';
import * as types from './mutation-types';

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
      url: state.network[state.currentNetwork].url,
      internalUrl: state.network[state.currentNetwork].internalUrl,
      keypair: {
        secretKey: state.account.secretKey,
        publicKey: state.account.publicKey,
      },
      networkId: state.network[state.currentNetwork].networkId,
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
    switch (payload) {
      case 'publicKeyCopied':
        alert('Public key copied to clipboard!')
        break;
      default:
        break;
    }
  },
};
