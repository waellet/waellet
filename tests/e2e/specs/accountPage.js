import {onBeforeLoad} from '../support/mock_chrome.js';
import login from '../login';


describe("Account Page" , () => {
   
    it('change network', () => {
        login();
        cy
        .visit('popup/popup.html',{onBeforeLoad})
        .get('#network')
        .click()
        .get('.dropdown-holder')
        .should('be.visible')
        .get('.dropdown-holder li button').eq(0)
        .should('have.class','current')
        .get('.dropdown-holder li button').eq(1)
        .click()
        .get('#network')
        .click()
        .get('.dropdown-holder li button').eq(1)
        .should('have.class','current')
        .click()
        .get('.dropdown-holder')
        .should('not.be.visible');
    });
});