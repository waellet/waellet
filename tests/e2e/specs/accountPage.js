import {onBeforeLoad} from '../support/mock_chrome.js';
import {login,loginAndLogout} from '../login';
import {ACCOUNT_PASSWORD,account} from '../utils';
import { equal } from 'assert';

describe("Test cases for Account Page" , () => {
   
    // it("export keystore",() => {
    //     login();
    //     cy.visit('popup/popup.html',{onBeforeLoad})
    //     .get('#settings')
    //     .should('be.visible')
    //     .click()
    //     .get('#exportKeystore')
    //     .click()
    // });

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
        .get('.dropdown-holder li').eq(0)
        .should('have.class','activeAccount')
        .get('.dropdown-holder li').eq(1)
        .click()
        .wait(1000)
        .get('.dropdown-holder')
        .should('not.be.visible')
        .get('#network')
        .click()
        .get('.dropdown-holder')
        .should('be.visible')
        .get('.dropdown-holder li').eq(1)
        .should('have.class','activeAccount')
        .get('#network')
        .click()
        .get('.dropdown-holder')
        .should('not.be.visible')
        .get('.ae-card-header p')
        .should((elem) => {
            expect(elem.text()).not.to.equal('0 AE')
        });
    });

    it("have settings menu", () => {
        login();
        cy
        .visit('popup/popup.html',{onBeforeLoad})
        .get('#settings')
        .should('be.visible')
    });

    it("have accounts menu", () => {
        login();
        cy
        .visit('popup/popup.html',{onBeforeLoad})
        .get('#account')
        .should('be.visible')
    }); 

    it("have switch network menu", () => {
        login();
        cy
        .visit('popup/popup.html',{onBeforeLoad})
        .get('#network')
        .should('be.visible')
    }); 

    it("show accounts submenu ", () => {
        login();
        cy
        .visit('popup/popup.html',{onBeforeLoad})
        .get('#account')
        .should('be.visible')
        .click()
        .get('.dropdown-holder')
        .should('be.visible')
        .get('.newSubaccount')
        .should('be.visible')
    }); 

    
    it("open manage accounts page", () => {
        login();
        cy
        .visit('popup/popup.html',{onBeforeLoad})
        .get('#account')
        .click()
        .get('.dropdown-holder')
        .should('be.visible')
        .get('.manageAccounts > .triggerhidedd > .newSubaccount').eq(0)
        .click()
        .get('.dropdown-holder')
        .should('not.be.visible')
        .get('#manageAccounts')
        .should('be.visible')
    }); 
    
    it("open Utilities page", () => {
        login();
        cy
        .visit('popup/popup.html',{onBeforeLoad})
        .get('#settings')
        .click()
        .get('.dropdown-holder')
        .should('be.visible')
        .get('#utilities')
        .should('be.visible')
        .click()
        .wait(1000)
        .get('.dropdown-holder')
        .should('not.be.visible')
        .get('#utilitiesPage')
        .should('be.visible')
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

    /* not working for now problems with cors on main network */
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
        .get('.ae-modal-light > .buttons > .ae-button')
        .contains('Ok')
        .click({ force: true })
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
        .get('.receiveBtn')
        .click()
        .get('.actions .toAccount')
        .click()
        .get('.ae-card')
        .should('be.visible')
    });

    it("open send page", () => {
        login();
        cy
        .visit("popup/popup.html",{onBeforeLoad})
        .get('.sendBtn')
        .click()
        .get('.address .ae-input')
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
        .get('.sendBtn')
        .click()
        .get('.actions .toAccount')
        .click()
        .get('.ae-card')
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
                // .find('div.balance')
                // .should('contain',amount);
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
            if(amount == '') {
                amount = 0
            }
            let fee = elem.find('small .balance').text();
            let total = (parseFloat(amount) + parseFloat(fee)).toFixed(7);
            let address = cy.wrap(elem).find('.ae-address').invoke('attr', 'title').then(el => {
                cy.wrap(elem).click();
                cy.get('body').then(($body) => {
                    if($body.find('.transationFrom').length) {
                        cy
                        .get('.transationFrom')
                        .should('have.value', el)
                        .get('.transactionAmount')
                        .should('contain',amount)
                    }
                    cy
                    .get('.transactionFee')
                    .should('contain',fee)
                    .get('.balanceTotal')
                    .should('contain',total);
                })
            });
        });
    })
});