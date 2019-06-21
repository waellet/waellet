import Vue from 'vue';
import Vuex from 'vuex';

import { getters } from './getters';
import mutations from './mutations';
import actions from './actions';

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    subaccounts: [],
    account: {},
    balance: 0,
    current: {
      network: 'Testnet',
      language: 'en'
    },
    network: {
      Testnet: {
        url: 'https://sdk-testnet.aepps.com',
        internalUrl: 'https://sdk-testnet.aepps.com',
        networkId: 'ae_uat',
        middlewareUrl: 'https://testnet.mdw.aepps.com/',
        explorerUrl:'https://testnet.explorer.aepps.com'
      },
      Mainnet: {
        url: 'https://sdk-mainnet.aepps.com',
        internalUrl: 'https://sdk-mainnet.aepps.com',
        networkId: 'ae_mainnet',
        middlewareUrl: 'http://mdw.aepps.com/',
        explorerUrl:'https://testnet.explorer.aepps.com'
      },
    },
    popup:{
      show:false,
      type:'',
      title:'',
      msg:'',
      secondBtn:false,
      secondBtnClick:'',
      data:''
    },
    isLoggedIn:false
  },
  getters,
  mutations,
  actions,
});
