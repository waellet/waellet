import {onBeforeLoad} from '../support/mock_chrome.js';

describe('IndexPage', () => {
    it('should have import button', () => {
        cy.visit('popup/popup.html',{onBeforeLoad});
        cy.get('button').should('contain','Import secret key');
    });

    it('should have generate wallet button', () => {
        cy.visit('popup/popup.html',{onBeforeLoad});
        cy.get('button').should('contain','Generate wallet');
    });

    it('should show import modal', () => {
        cy.visit('popup/popup.html',{onBeforeLoad});
        cy.get('button.importBtn').click();
        cy.get('.ae-overlay').should('be.visible');
        cy.get('.ae-modal').should('be.visible');
        cy.get('.ae-modal button').should('contain','Continue');
        cy.get('.ae-modal .ae-input').should('be.visible');
        cy.get('.mobile-right button').should('be.visible').click();
        cy.get('.ae-modal').should('not.be.visible');
        cy.get('.ae-overlay').should('not.be.visible');
    });

});