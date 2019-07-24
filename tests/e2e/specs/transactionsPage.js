import {onBeforeLoad} from '../support/mock_chrome.js';
import {login} from '../login';
import  { PUBLIC_KEY_SEND, account} from '../utils';

describe("Tets cases for Transactions Page", () => {
    it("open transaction page", () => {
        login();
        cy
        .visit("popup/popup.html",{onBeforeLoad})
        .get('.transactionHistory')
        .click()
    });

    it("check transactions list is rendered correctly", () => {
        login();
        cy
        .visit("popup/popup.html",{onBeforeLoad})
        .get('.transactionHistory')
        .click()
        .request("https://testnet.mdw.aepps.com/middleware/transactions/account/" + account.publicKey + '?limit=1')
        .then(res => {
            let data = res.body[0];
            let amount = data.tx.amount / 10 ** 18;
            let fee = data.tx.fee / 10 ** 18;
            cy.get('.allTransactions .list-item-transaction').eq(0).then(elem => {
                if (data.tx.type != "NameClaimTx" && data.tx.type != 'NamePreclaimTx'){
                    cy.wrap(elem).should('have.class',data.hash);
                    cy.wrap(elem).find('.ae-address').should('have.attr','title',data.tx.account_id);
                    cy.wrap(elem).find('.transactionDate').should('contain',new Date(data.time).toLocaleTimeString() );
                    cy.wrap(elem).find('div.balance').should('contain',amount);
                    cy.wrap(elem).find('small .balance').should('contain',fee);
                    if(data.tx.account_id == account.publicKey) {
                        cy.wrap(elem).find('.badgeTransactionType').should('be.visible').should('contain','outgoing');
                    }
                }
            })
        });
    });

    it("check transaction details are rendered correctly", () => {
        login();
        cy
        .visit("popup/popup.html",{onBeforeLoad})
        .get('.transactionHistory')
        .click()
        .request("https://testnet.mdw.aepps.com/middleware/transactions/account/" + account.publicKey + '?limit=1')
        .then(res => {
            let data = res.body[0];
            console.log(data);
            let amount = data.tx.amount / 10 ** 18;
            let fee = data.tx.fee / 10 ** 18;
            let total = (parseFloat(amount) + parseFloat(fee)).toFixed(7);
            cy.get('.allTransactions .list-item-transaction').eq(0).click().then(elem => {
                if (data.tx.type != "NameClaimTx" && data.tx.type != 'NamePreclaimTx'){
                    cy.wrap(elem).find('.transactionDate').should('contain',new Date(data.time).toLocaleTimeString() );
                    cy.wrap(elem).find('.transactionType').should('contain',data.tx.type)
                    cy.wrap(elem).find('.transactionAmount').should('contain',amount);
                    cy.wrap(elem).find('.transactionFee').should('contain',fee);
                    cy.wrap(elem).find('.balanceTotal').should('contain',total);
                    cy.wrap(elem).find('.transationFrom').should('contain',data.tx.sender_id);
                    cy.wrap(elem).find('.transactionTo').should('contain',data.tx.recipient_id);
                    cy.wrap(elem).find('.transactionHash').should('contain',data.hash);
                }
            });
            cy
            .get('.transactionExplorerBtn')
            .should('be.visible')
            .get('.backbutton')
            .should('be.visible')
            .click()
            .get('.ae-loader')
            .should('be.visible')
            .get('.allTransactions')
            .should('be.visible')
        });
    });
    
    it("check login page", () => {
        cy.
        visit('popup/popup.html',{onBeforeLoad});
    });
});