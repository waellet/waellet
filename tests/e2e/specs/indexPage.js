import {onBeforeLoad} from '../support/mock_chrome.js';


describe('IndexPage', () => {
    const privateKey = "ef07a269ce62e81dbd507d2d677e06654765984aa4650bcf2ed68bbfc783f8e4301ba902bf2b2c176ac934eb41181866ae25f19dcbdd42c4aa448c0f82c913f9";
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

    it('should import from private key', () => {
        cy.visit('popup/popup.html',{onBeforeLoad});
        cy.get('button.importBtn').click();
        cy.get('.ae-overlay').should('be.visible');
        cy.get('.ae-modal').should('be.visible');
        cy.get('.ae-modal input').type('1234');
        cy.get('.ae-modal button').contains('Continue').click();
        cy.get('.ae-modal .ae-toolbar').should('contain','Private key is incorrect!');
        cy.get('.ae-modal input').clear();
        cy.get('.ae-modal input').type(privateKey);
        cy.get('.ae-modal button').contains('Continue').click();
        cy.get('p').should('contain','Import From Private Key');
        cy.get('input[type="password"]').should('be.visible');
        cy.get('button').contains('Import').should('be.visible');
        cy.get('input[type="password"]').eq(0).type('1234');
        cy.get('button').contains('Import').click();
        cy.get('.ae-toolbar').should('contain',"Passwords doesn't match! ");
        cy.get('input[type="password"]').eq(0).clear();
        cy.get('input[type="password"]').eq(0).type('123');
        cy.get('input[type="password"]').eq(1).type('123');
        cy.get('button').contains('Import').click();
        cy.get('.ae-toolbar').should('contain',"Password must be at lest 4 symbols!");
        cy.get('input[type="password"]').eq(0).clear().type('1234');
        cy.get('input[type="password"]').eq(1).clear().type('1234');
        cy.get('button').contains('Import').click();
        cy.get('.ae-loader').should('be.visible');
        cy.get('.ae-card').should('be.visible');

    });
});