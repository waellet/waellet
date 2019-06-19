import {onBeforeLoad} from '../support/mock_chrome.js';
import {login,loginAndLogout} from '../login';
import {ACCOUNT_PASSWORD,account} from '../utils';
import { equal } from 'assert';

describe("Test cases for Account Page" , () => {
   
    it('change network', () => {
        login();
        cy
        .visit('popup/popup.html',{onBeforeLoad})
        .get('.ae-card-header p')
        .should((elem) => {
            expect(elem.text()).not.to.equal('0 AE')
        })
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
        .should('not.be.visible')
        .get('.ae-card-header p')
        .should((elem) => {
            expect(elem.text()).to.equal('0 AE');
        });
    });

    it('check latests 3 transactions', () => {
        login();
        cy.visit('popup/popup.html',{onBeforeLoad})
        .get('.ae-card-header p')
        .get('.transactionList')
        .children()
        .its('length')
        .should('be.eq',3)
        .get('.transactionHistory')
        .should('be.visible')
        .should('have.class','primary')
    });

    //problems with cors on main network
    it("switch network check latest 3 transactions", () => {
        login();
        cy
        .visit('popup/popup.html',{onBeforeLoad})
        .get('#network')
        .click()
        .get('.dropdown-holder')
        .should('be.visible')
        .get('.dropdown-holder li button').eq(1)
        .click()
    });

    it("show whole transaction history",() => {
        login();
        cy.
        visit("popup/popup.html",{onBeforeLoad})
        .get('.transactionHistory')
        .click()
        .get('.allTransactions')
        .should('be.visible')
        .get('#settings')
        .click()
        .get('.dropdown-holder')
        .should('be.visible')
        .get('.dropdown-holder .toAccount')
        .click()
        .get('.dropdown-holder')
        .should('not.be.visible')
        .get('.ae-card')
        .should('be.visible')
        .get('.transactionList')
        .should('be.visible')
        .get('.transactionHistory')
        .should('be.visible')
    });
    
    it("copy public address from account", () => {
        login()
        cy
        .visit("popup/popup.html",{onBeforeLoad})
        .get('.ae-card button')
        .click()
        .get('.ae-modal-light')
        .should('be.visible')
        .get('.ae-overlay')
        .should('be.visible')
        .get('.ae-modal-light .buttons button')
        .should('have.class','alternative')
        .click()
        .get('.ae-modal-light')
        .should('not.be.visible')
        .get('.ae-overlay')
        .should('not.be.visible')
    });

    it("have send receive buttons", () => {
        login();
        cy
        .visit("popup/popup.html",{onBeforeLoad})
        .get('.sendBtn')
        .should('be.visible')
        .get('.receiveBtn')
        .should('be.visible')
    });

    it("open receive page", () => {
        login();
        cy
        .visit("popup/popup.html",{onBeforeLoad})
        .get('.receiveBtn')
        .click()
        .get('.ae-card.neutral')
        .should('be.visible')
        .get('.toAccount')
        .should('be.visible')
        .get('#settings')
        .click()
        .get('.dropdown-holder')
        .should('be.visible')
        .get('.dropdown-holder .toAccount')
        .click()
        .get('.dropdown-holder')
        .should('not.be.visible')
        .get('.ae-card')
        .should('be.visible')
        .get('.transactionList')
        .should('be.visible')
        .get('.transactionHistory')
        .should('be.visible')
    });

    it("open send page", () => {
        login();
        cy
        .visit("popup/popup.html",{onBeforeLoad})
        .get('.sendBtn')
        .click()
        .get('.ae-address-input')
        .should('be.visible')
        .get('.sendAmount')
        .should('be.visible')
        .get('.sendBtn')
        .should('be.visible')
        .get('#settings')
        .click()
        .get('.dropdown-holder')
        .should('be.visible')
        .get('.dropdown-holder .toAccount')
        .click()
        .get('.dropdown-holder')
        .should('not.be.visible')
        .get('.ae-card')
        .should('be.visible')
        .get('.transactionList')
        .should('be.visible')
        .get('.transactionHistory')
        .should('be.visible')
    });

    it("can logout and login again", () => {
        loginAndLogout();
    });

    it("latest 3 transactions match data middleware", () => {
        login();
        cy
        .visit("popup/popup.html",{onBeforeLoad})
        .request("https://testnet.mdw.aepps.com/middleware/transactions/account/" + account.publicKey + '?limit=3')
        .then(res => {
            cy.get('.transactionList .list-item-transaction').each((el,index) => {
                let data = res.body[index];
                let amount = data.tx.amount / 10 ** 18;
                let fee = data.tx.fee / 10 ** 18;
                cy.wrap(el)
                .should('have.class',data.hash)
                .find('div.balance')
                .should('contain',amount);
                cy.wrap(el)
                .find('small .balance')
                .should('contain',fee);
            });
        });
    });

    it("open transaction details",() => {
        login();
        cy
        .visit("popup/popup.html",{onBeforeLoad})
        .get('.transactionList .list-item-transaction').eq(0).then(elem => {
            let amount= elem.find('div.balance').text();
            let fee = elem.find('small .balance').text();
            let total = parseFloat(amount) + parseFloat(fee);
            let address = cy.wrap(elem).find('.ae-address').invoke('attr', 'title').then(el => {
                cy.wrap(elem).click();
                cy.get('.transationFrom')
                .should('contain',el)
                .get('.transactionAmount')
                .should('contain',amount)
                .get('.transactionFee')
                .should('contain',fee)
                .get('.balanceTotal')
                .should('contain',total);
            });
        });
    })
});