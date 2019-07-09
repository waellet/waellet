import Vue from 'vue';
import Vuex from 'vuex';

import { getters } from './getters';
import mutations from './mutations';
import actions from './actions';
import { POPUP_PROPS } from '../popup/utils/popup-messages';

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    subaccounts: [],
    account: {},
    activeAccount:0,
    wallet:[],
    balance: 0,
    current: {
      network: 'Testnet',
      language: 'en',
      token:0
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
    userNetworks: [],
    popup: Object.assign({}, POPUP_PROPS),
    isLoggedIn:false,
    transactions: {
      latest:[],
      all:[],
      new:[]
    },
    sdk:null,
    tokens:[
      {
        name:"AE",
        symbol:"AE",
        precision:7,
        balance:0,
        contract:''
      }
    ]
  },
  getters,
  mutations,
  actions,
});
