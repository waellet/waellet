import {onBeforeLoad} from '../support/mock_chrome.js';
import {login} from '../login';
import {prepareEncryptedPrivateKey, ACCOUNT_PASSWORD, PRIVATE_KEY} from '../utils.js';

describe('Test cases for Index Page', () => {
    it('have import button', () => {
        cy.visit('popup/popup.html',{onBeforeLoad});
        cy.get('button').should('contain','Import secret key');
    });

    it('have generate wallet button', () => {
        cy.visit('popup/popup.html',{onBeforeLoad});
        cy.get('button').should('contain','Generate wallet');
    });


    it("have login button and logout", () => {
        prepareEncryptedPrivateKey();
        cy.visit('popup/popup.html',{onBeforeLoad:(contentWindow) => { onBeforeLoad(contentWindow,true) }})
        .get('input[type="password"]')
        .should('be.visible')
        .get('.logo_top')
        .should('be.visible')
        .get('.ae-button').eq(0)
        .should('contain','Login')
        .get('input[type="password"]')
        .type("123")
        .get('.ae-button').eq(0)
        .click()
        .get('.ae-toolbar')
        .should('be.visible')
        .get('input[type="password"]')
        .clear()
        .type("1234")
        .get('.ae-button').eq(0)
        .click()
        .get('.ae-toolbar')
        .should('be.visible')
        .get('input[type="password"]')
        .clear()
        .type("qwerty")
        .get('.ae-button').eq(0)
        .click()
        .get('.ae-card')
        .should('be.visible')
        .get('#settings')
        .click()
        .get('.dropdown-holder')
        .should('be.visible');
    });

    it('show import modal', () => {
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

    it('import from private key', () => {
        cy.visit('popup/popup.html',{onBeforeLoad});
        cy.get('button.importBtn').click();
        cy.get('.ae-overlay').should('be.visible');
        cy.get('.ae-modal').should('be.visible');
        cy.get('.ae-modal input').type('1234');
        cy.get('.ae-modal button').contains('Continue').click();
        cy.get('.ae-modal .ae-toolbar').should('contain','Private key is incorrect!');
        cy.get('.ae-modal input').clear();
        cy.get('.ae-modal input').type(PRIVATE_KEY);
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
        cy.get('input[type="password"]').eq(0).clear().type(ACCOUNT_PASSWORD);
        cy.get('input[type="password"]').eq(1).clear().type(ACCOUNT_PASSWORD);
        cy.get('button').contains('Import').click();
        cy.get('.ae-loader').should('be.visible');
        cy.get('.ae-card').should('be.visible');

    });

    it("import from keystore.json file", () => {
        cy.visit('popup/popup.html',{onBeforeLoad});
        cy.get('button.importBtn').click();
        cy.get('.ae-overlay').should('be.visible');
        cy.get('.ae-modal').should('be.visible');
        cy.get('.tabs span').eq(1).click();
        cy.uploadFile('input[type="file"]','../../keystore2.csv','application/json');
        cy.get('button').contains('Continue').click();
        cy.get('.file-toolbar').should('contain','Invalid file format!');
        cy.uploadFile('input[type="file"]','../../keystore3.json','application/json');
        cy.get('button').contains('Continue').click();
        cy.get('.file-toolbar').should('contain','Invalid file format!');
        cy.uploadFile('input[type="file"]','../../keystore.json','application/json');
        cy.get('button').contains('Continue').click();
        cy.get('p').should('contain','Import From Keystore.json');
        cy.get('button').should('contain','Import');
        cy.get('input[type="password"]').should('be.visible');
        cy.get('input[type="password"]').type('123');
        cy.get('button').contains('Import').click();
        cy.get('.ae-toolbar').should('contain','Password must be at lest 4 symbols! ');
        cy.get('input[type="password"]').clear().type('12345');
        cy.get('button').contains('Import').click();
        // cy.get('.ae-loader').should('be.visible');
        cy.get('.ae-toolbar').should('contain','Incorrect password !');
        cy.get('input[type="password"]').clear().type(ACCOUNT_PASSWORD);
        cy.get('button').contains('Import').click();
        cy.get('.ae-card').should('be.visible');
    });

    it("import from seed phrase", () => {
        cy.visit('popup/popup.html',{onBeforeLoad});
        cy.get('button.importBtn').click();
        cy.get('.ae-overlay').should('be.visible');
        cy.get('.ae-modal').should('be.visible');
        cy.get('.tabs span').eq(2).click();
        cy.get('p').should('contain','Enter your seed phrase');
        cy.get('textarea').should('be.visible');
        cy.get('button').contains('Continue').should('be.visible');
        cy.get('textarea').type('qwerty');
        cy.get('button').contains('Continue').click();
        cy.get('.ae-toolbar').should('contain','Incorrect seed phrase!');
        cy.get('textarea').clear().type('plug leave parade earn mosquito laptop this alpha donate recipe cancel')
        cy.get('button').contains('Continue').click();
        cy.get('.ae-toolbar').should('contain','Incorrect seed phrase!');
        cy.get('textarea').clear().type('plug leave parade earn mosquito laptop this alpha donate recipe cancel access');
        cy.get('button').contains('Continue').click();
        cy.get('p').should('contain','Import From Seed Phrase');
        cy.get('input[type="password"]').should('be.visible');
        cy.get('button').should('be.visible').should('contain','Restore');
        cy.get('input[type="password"]').eq(0).type('1234');
        cy.get('button').contains('Restore').click();
        cy.get('.ae-toolbar').should('contain',"Passwords doesn't match! ");

        cy.get('input[type="password"]').eq(0).clear().type('123');
        cy.get('input[type="password"]').eq(1).type('123');
        cy.get('button').contains('Restore').click();
        cy.get('.ae-toolbar').should('contain',"Password must be at lest 4 symbols!");

        cy.get('input[type="password"]').eq(0).clear().type(ACCOUNT_PASSWORD);
        cy.get('input[type="password"]').eq(1).clear().type(ACCOUNT_PASSWORD);
        cy.get('button').contains('Restore').click();
        cy.get('.ae-loader').should('be.visible');
        
    });

    it("generate waellet ", () => {
        cy.visit('popup/popup.html',{onBeforeLoad});
        cy.wait(2000);
        cy.get('footer button.primary').click();
        cy.get('p').should('contain','Protect Account with Password');
        cy.get('input[type="password"]').should('be.visible');
        cy.get('button').contains('Continue').should('be.visible');


        cy.get('input[type="password"]').eq(0).type('1234');
        cy.get('button').contains('Continue').click();
        cy.get('.ae-toolbar').should('contain',"Passwords doesn't match! ");
        
        cy.get('input[type="password"]').eq(0).clear().type('123');
        cy.get('input[type="password"]').eq(1).type('123');
        cy.get('button').contains('Continue').click();
        cy.get('.ae-toolbar').should('contain',"Password must be at lest 4 symbols!");

        cy.get('input[type="password"]').eq(0).clear().type(ACCOUNT_PASSWORD);
        cy.get('input[type="password"]').eq(1).clear().type(ACCOUNT_PASSWORD);
        cy.get('button').contains('Continue').click();

        cy.get('button.nextStep').click();
        cy.get('.ae-phraser-container').should('be.visible');
        cy.get('button.nextStep').click();
        cy.get('.ae-modal-light').should('be.visible');
        cy.get('.ae-modal-light button').contains('OK').click();
        cy.get('.ae-modal-light').should('not.be.visible');
        cy.wait(10000);
        cy.get('button.nextStep').click();
        cy.get('.ae-phraser-container').eq(0).should('be.visible');
        cy.get('.ae-phraser-container').eq(1).should('be.visible');
        cy.get('button.nexStep').should('not.have.class','primary');
        cy.get('.ae-phraser-container').eq(0).within(() => {
            cy.get('.ae-badge.seedBadge').each(($el, index, $list) => {
                cy.wrap($el).click().should('have.class','selected');
            });
        });
        cy.get('.ae-phraser-container').eq(1).children().should('have.length', 12);

        cy.get('button.nextStep').should('have.class','primary');
        cy.get('button.nextStep').click();
        cy.get('.ae-phraser-error').should('be.visible');
    });

    it('login', () => {
        login();
    });
});