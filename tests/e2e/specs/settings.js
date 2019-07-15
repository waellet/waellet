import {onBeforeLoad} from '../support/mock_chrome.js';
import {login} from '../login';

let randomstr = Math.random().toString(36).substring(7);

describe("Test cases for Settings Page", () => {


    it("open Settings page and back to account", () => {
        login();
        cy
        .visit("popup/popup.html",{onBeforeLoad})
        .get('#settings')
        .click()
        .get('.dropdown-holder')
        .should('be.visible')
        .get('.settings')
        .should('be.visible')
        .click()
        .get('.dropdown-holder')
        .should('not.be.visible')
        .get('.settingslist')
        .should('be.visible')
        .get('.backbutton')
        .should('be.visible')
        .click()
        .get('.ae-card.primary')
        .should('be.visible')
    });

    it("open General Settings page and test all the components and then back button to settings", () => {
        login();
        cy
        .visit("popup/popup.html",{onBeforeLoad})
        .get('#settings')
        .click()
        .get('.dropdown-holder')
        .should('be.visible')
        .get('.settings')
        .should('be.visible')
        .click()
        .get('.dropdown-holder')
        .should('not.be.visible')
        .get('.settingslist')
        .should('be.visible')
        .get('.generalsett')
        .click()
        .get('h3')
        .contains('General')
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
        .get('.backbutton')
        .click()
        .get('.settingslist')
        .should('be.visible')
    });
    it("open Security Settings page and test all the components and then back button to settings", () => {
        login();
        cy
        .visit("popup/popup.html",{onBeforeLoad})
        .get('#settings')
        .click()
        .get('.dropdown-holder')
        .should('be.visible')
        .get('.settings')
        .should('be.visible')
        .click()
        .get('.dropdown-holder')
        .should('not.be.visible')
        .get('.settingslist')
        .should('be.visible')
        .get('.securitysett')
        .click()
        .get('h3')
        .contains('Security and Privacy')
        .get('.switch')
        .click()
        .click()
        .get('.backbutton')
        .click()
        .get('.settingslist')
        .should('be.visible')
    });

    
    it("open About Settings page and test all the components and then back button to settings", () => {
        login();
        cy
        .visit("popup/popup.html",{onBeforeLoad})
        .get('#settings')
        .click()
        .get('.dropdown-holder')
        .should('be.visible')
        .get('.settings')
        .should('be.visible')
        .click()
        .get('.dropdown-holder')
        .should('not.be.visible')
        .get('.settingslist')
        .should('be.visible')
        .get('.aboutsett')
        .click()
        .get('h3')
        .contains('About')
        .get('.backbutton')
        .click()
        .get('.settingslist')
        .should('be.visible')
    });

    
});