import {onBeforeLoad} from '../support/mock_chrome.js';
import {login} from '../login';
import { transaction } from '../utils';
import { convertToAE } from '../../../src/popup/utils/helper';

describe("Test cases for signing transactions from AEPP", () => {

    it("show pending transaction and have tx info", () => {
        login();
        cy
        .visit('popup/popup.html',{onBeforeLoad:(contentWindow) => { onBeforeLoad(contentWindow,'sign') }})
        .get('.spendTxDetailsList')
        .should('be.visible')
        .get('.btnFixed')
        .should('be.visible')
        .get('.spendAccountAddr')
        .should('be.visible')
        .get('.balanceSpend')
        .should('be.visible')
        .get('.balanceBig')
        .should('be.visible')
        .get('.balanceTotalSpend')
    });

    it("validate tx info", () => {
        login();
        cy
        .visit('popup/popup.html',{onBeforeLoad:(contentWindow) => { onBeforeLoad(contentWindow,'sign') }})
        .get('.accountFrom ul')
        .invoke('attr', 'title')
        .should('eq',transaction.senderId)
        .get('.accountTo ul')
        .invoke('attr', 'title')
        .should('eq',transaction.recipientId)
        .get('.balanceSpend')
        .should('contain',convertToAE(transaction.amount))
        .get('.txFee')
        .should('contain',convertToAE(transaction.fee))
        .get('.balanceTotalSpend')
        .should('contain',convertToAE(transaction.fee) + convertToAE(transaction.amount))
    });

});