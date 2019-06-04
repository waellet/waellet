import Vue from 'vue';
import Vuex from 'vuex';

import { getters } from './getters';
import mutations from './mutations';
import actions from './actions';

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    account: {},
    balance: 0,
    current: {
      network: 'testnet',
      language: 'en'
    },
    network: {
      Testnet: {
        url: 'https://sdk-testnet.aepps.com',
        internalUrl: 'https://sdk-testnet.aepps.com',
        networkId: 'ae_uat',
      },
      Mainnet: {
        url: 'https://sdk-mainnet.aepps.com',
        internalUrl: 'https://sdk-mainnet.aepps.com',
        networkId: 'ae_mainnet',
      },
    },
  },
  getters,
  mutations,
  actions,
});
