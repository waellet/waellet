import Vue from 'vue';
import Vuex from 'vuex';

import * as getters from './getters';
import mutations from './mutations';
import * as actions from './actions';

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    account: '',
    config: {
      ae: {
        network: {
          testnet: {
            url: 'https://sdk-testnet.aepps.com',
            internalUrl: 'https://sdk-testnet.aepps.com',
            networkId: 'aet_ua',
          },
          mainnet: {
            url: 'https://sdk-testnet.aepps.com',
            internalUrl: 'https://sdk-testnet.aepps.com',
            networkId: 'aet_ua',
          },
        },
      },
    },
  },
  getters,
  mutations,
  actions,
});
