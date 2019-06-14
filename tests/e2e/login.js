import {onBeforeLoad} from './support/mock_chrome.js';
import { prepare } from './utils';

export default (customState) => {
    // window.chrome.storage.sync.set('isLogged',true) ;
    const account = {
        publicKey:"ak_NBrcw9KrjU8BjM56jovLHTiXDMhPaepX9miomP1gVFpLZfHew",
        secretKey:"ef07a269ce62e81dbd507d2d677e06654765984aa4650bcf2ed68bbfc783f8e4301ba902bf2b2c176ac934eb41181866ae25f19dcbdd42c4aa448c0f82c913f9",
        encryptedPrivateKey:{"name":"keystore","version":1,"public_key":"ak_NBrcw9KrjU8BjM56jovLHTiXDMhPaepX9miomP1gVFpLZfHew","id":"5699690b-0af4-465f-a3d8-f7fa35ecd8ad","crypto":{"secret_type":"ed25519","symmetric_alg":"xsalsa20-poly1305","ciphertext":"800659efba3c86107ed7edcca0dcd6848bd6702f99c3c401f15431882c80fb0ab21d94e55596082be457cd1381142dfa3f90ecf8ea4b3045ae8378eefea23608832b508a825dc263cd225af5ec1615df","cipher_params":{"nonce":"a1c0a567392213114c4b2075a6ce17524bdd71d546440876"},"kdf":"argon2id","kdf_params":{"memlimit_kib":65536,"opslimit":3,"parallelism":1,"salt":"0817a90b57f7bb5c898c3ef8304d3852"}}}
        
    }
    const state = Cypress._.merge({
        account: account,
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
    }, customState);
    window.localStorage.vuex = JSON.stringify(state);
    window.localStorage.isLogged = false;
    window.localStorage.userAccount = {
        userAccount:account
    };
    cy
      .visit('/popup/popup.html',{onBeforeLoad:(contentWindow) => { onBeforeLoad(contentWindow,true) }})
      .get('input[type=password]').type('qwerty')
      .get('button')
      .contains('Login')
      .click()
      
      .wait(2000)
      .get('.ae-card')
      .should('be.visible')
      .get('.ae-header')
      .should('have.class','logged');
    return state;
  };