import {onBeforeLoad} from './support/mock_chrome.js';
import { prepare,prepareEncryptedPrivateKey,ACCOUNT_PASSWORD } from './utils';

export const login = (customState) => {
    prepare();
    const state = prepareEncryptedPrivateKey(customState);
    cy
      .visit('/popup/popup.html',{onBeforeLoad:(contentWindow) => { onBeforeLoad(contentWindow,'account') }})
      .wait(4000)
      .get('input[type=password]').type(ACCOUNT_PASSWORD)
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

export const loginAndLogout = () => {
    login();
    cy
    .visit("popup/popup.html",{onBeforeLoad})
    .get('#settings')
    .click()
    .get('.dropdown-holder')
    .should('be.visible')
    .get('.dropdown-holder .toLogout')
    .click()
    .get('input[type="password"]')
    .should('be.visible')
    .get('button')
    .contains('Login')
    .should('be.visible')
    .get('input[type="password"]')
    .type("1234")
    .get('button')
    .contains('Login')
    .click()
    // .get('.ae-loader')
    // .should('be.visible')
    .get('.ae-toolbar')
    .should('be.visible')
    .get('input[type="password"]')
    .clear()
    .type(ACCOUNT_PASSWORD);
}