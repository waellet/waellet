import {onBeforeLoad} from '../support/mock_chrome.js';
import {login} from '../login';
const toNamingSystemPage = () => {
    login();
    cy
    .visit("popup/popup.html",{onBeforeLoad})
    .get('#settings')
    .click()
    .get('.dropdown-holder')
    .get('.namingSystem')
    .click()
}
let randomstr = Math.random().toString(36).substring(7);

describe("Test cases for NamingSystem Page", () => {


    it("open naming system page and back to account", () => {
        login();
        cy
        .visit("popup/popup.html",{onBeforeLoad})
        .get('#settings')
        .click()
        .get('.dropdown-holder')
        .should('be.visible')
        .get('.namingSystem')
        .should('be.visible')
        .click()
        .get('.dropdown-holder')
        .should('not.be.visible')
        .get('.addon-input')
        .should('be.visible')
        .get('.backbtn .toAccount')
        .should('be.visible')
        .click()
        .get('.ae-card.primary')
        .should('be.visible')
    });

    it("validation of registered name", () => {
        toNamingSystemPage();
        cy
        .get('.addon-input')
        .type('!@#$%^&*()')
        .get('.regbtn')
        .click()
        .get('.ae-modal-light')
        .should('be.visible')
        .get('.ae-modal-light h1')
        .contains('Please use only allowed characters')
        .get('.ae-modal-light button')
        .click()
        .get('.ae-modal-light')
        .should('not.be.visible')
        .get('.addon-input')
        .clear()
        .type(randomstr)
        .get('.regbtn')
        .click()
        .get('.ae-modal-light')
        .should('be.visible')
        .get('.ae-modal-light h1')
        .contains('Successfully added!')
        .get('.ae-modal-light button')
        .click()
        .get('.ae-modal-light')
        .should('not.be.visible')
        .get('.addon-input')
        .clear()
    });
});