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
      testnet: {
        url: 'https://sdk-testnet.aepps.com',
        internalUrl: 'https://sdk-testnet.aepps.com',
        networkId: 'ae_uat',
      },
      mainnet: {
        url: 'https://sdk-mainnet.aepps.com',
        internalUrl: 'https://sdk-mainnet.aepps.com',
        networkId: 'ae_mainnet',
      },
    },
    popup:{
      show:false,
      type:'',
      title:'',
      msg:''
    }
  },
  getters,
  mutations,
  actions,
});
