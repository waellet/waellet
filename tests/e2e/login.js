import {onBeforeLoad} from './support/mock_chrome.js';
import { prepare,prepareEncryptedPrivateKey } from './utils';

export default (customState) => {
    // window.chrome.storage.sync.set('isLogged',true) ;
    const state = prepareEncryptedPrivateKey(customState);
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