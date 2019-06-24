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
                cy.wrap(elem).should('have.class',data.hash);
                cy.wrap(elem).find('.ae-address').should('have.attr','title',data.tx.sender_id);
                cy.wrap(elem).find('.transactionDate').should('contain',new Date(data.time).toDateString() + ' ' + new Date(data.time).toLocaleTimeString() );
                cy.wrap(elem).find('div.balance').should('contain',amount);
                cy.wrap(elem).find('small .balance').should('contain',fee);
                if(data.tx.sender_id == account.publicKey) {
                    cy.wrap(elem).find('.badgeTransactionType').should('be.visible').should('contain','outgoing');
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
            let amount = data.tx.amount / 10 ** 18;
            let fee = data.tx.fee / 10 ** 18;
            let total = parseFloat(amount) + parseFloat(fee);
            cy.get('.allTransactions .list-item-transaction').eq(0).click()
            .get('.transactionDate')
            .should('contain',new Date(data.time).toLocaleString())
            .get('.transactionType')
            .should('contain',data.tx.type)
            .get('.transactionAmount')
            .should('contain',amount)
            .get('.transactionFee')
            .should('contain',fee)
            .get('.balanceTotal')
            .should('contain',total)
            .get('.transationFrom')
            .should('contain',data.tx.sender_id)
            .get('.transactionTo')
            .should('contain',data.tx.recipient_id)
            .get('.transactionHash')
            .should('contain',data.hash)
            .get('.transactionExplorerBtn')
            .should('be.visible')
            .get('.backBtn')
            .should('be.visible')
            .click()
            .get('.ae-loader')
            .should('be.visible')
            .get('.allTransactions')
            .should('be.visible')
        });
    });
});