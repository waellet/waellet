import {onBeforeLoad} from '../support/mock_chrome.js';
import {login} from '../login';
import {prepareEncryptedPrivateKey, ACCOUNT_PASSWORD, PRIVATE_KEY, mnemonic} from '../utils.js';

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
        cy.visit('popup/popup.html',{onBeforeLoad:(contentWindow) => { onBeforeLoad(contentWindow,'account') }})
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
        .should('be.visible')
        .get('.toLogout')
        .click()
        .get('input[type="password"]')
        .should('be.visible')
        .get('.ae-header')
        .should('not.have.class','logged');
    });

    it("generate waellet enter correct password", () => {
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
    });

    it("generate wallet show confirm seed if exit on confirming", () => {
        cy
        .visit('popup/popup.html',{onBeforeLoad:(contentWindow) => { onBeforeLoad(contentWindow,'seed') }})
        .wait(2000)
        .get('footer button.primary').click()
        .get('input[type="password"]').eq(0).clear().type(ACCOUNT_PASSWORD)
        .get('input[type="password"]').eq(1).clear().type(ACCOUNT_PASSWORD)
        .get('button').contains('Continue').click()
        .get('button.nextStep').click()
        .visit('popup/popup.html',{onBeforeLoad:(contentWindow) => { onBeforeLoad(contentWindow,'seed') }})
        .get('button.nextStep').should('contain','SHOW SEED PHRASE')
        .click()
        .get('.ae-phraser-container .ae-badge').each((el,index) => {
            let seeds = mnemonic.split(" ");
            cy.wrap(el).should('contain',seeds[index]);
        });
    });

    it("generate wallet confirm seed", () => {
        let seeds = mnemonic.split(" ");
        cy
        .visit('popup/popup.html',{onBeforeLoad:(contentWindow) => { onBeforeLoad(contentWindow,'seed') }})
        .wait(2000)
        .get('footer button.primary').click()
        .get('input[type="password"]').eq(0).clear().type(ACCOUNT_PASSWORD)
        .get('input[type="password"]').eq(1).clear().type(ACCOUNT_PASSWORD)
        .get('button').contains('Continue').click()
        .visit('popup/popup.html',{onBeforeLoad:(contentWindow) => { onBeforeLoad(contentWindow,'seed') }})
        .get('button.nextStep').click()
        .get('.ae-phraser-container').should('be.visible')
        .get('button.nextStep').click()
        .get('.ae-modal-light').should('be.visible')
        .get('.ae-modal-light button').contains('OK').click()
        .get('.ae-modal-light').should('not.be.visible')
        .wait(10000)
        .get('button.nextStep').click()
        .get('.ae-phraser-container').eq(0).should('be.visible')
        .get('.ae-phraser-container').eq(1).should('be.visible')
        .get('button.nexStep').should('not.have.class','primary')
        .get('.ae-phraser-container').eq(0).within(() => {
            cy.get('.ae-badge.seedBadge').each(($el, index, $list) => {
                cy.wrap($el).click().should('have.class','selected');
            });
        })
        .get('.ae-phraser-container').eq(1).children().should('have.length', 12)
        .get('button.nextStep').should('have.class','primary')
        .get('button.nextStep').click()
        .get('.ae-phraser-error').should('be.visible')
        .get('.ae-phraser-container').eq(1).within(() => {
            cy.get('.ae-badge.seedBadge').each(($el, index, $list) => {
                cy.get('.ae-badge.seedBadge').eq(0).click();
            });
        })
        .get('.ae-phraser-container').eq(0).children().should('have.length', 12)
        .get('.ae-phraser-container').eq(1).children().should('have.length', 4)
        .wrap(seeds).each((num,i) => {
            cy.get('.ae-phraser-container').eq(0).within(() => {
                cy.get('.ae-badge.seedBadge').contains(num).not('.selected').click();
            });
        })
        .get('button.nextStep').click()
        .get('.ae-loader')
        .should('be.visible')
        .get('.ae-card')
        .should('be.visible')
        .get('.ae-header')
        .should('have.class','logged')
        .get('#settings')
        .click()
        .get('.dropdown-holder')
        .should('be.visible')
        .get('.toLogout')
        .click()
        .get('input[type="password"]')
        .should('be.visible')
        .get('.ae-header')
        .should('not.have.class','logged')
        .get('.ae-card')
        .should('not.be.visible');
    });

    it('login', () => {
        login();
    });
});