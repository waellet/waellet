import { onBeforeLoad } from '../support/mock_chrome.js';
import { login,loginAndLogout } from '../login';
import { ACCOUNT_PASSWORD, PUBLIC_KEY_SEND } from '../utils';

const tokenName = "HACK";

const openTokensPage = () => {
    login()
    cy
    .visit('popup/popup.html',{onBeforeLoad})
    .get('.ae-loader')
    .should('not.be.visible')
    .get('#settings')
    .click()
    .get('.utilities')
    .click()
    .get('.fungible-tokens')
    .click()
    .get('.add-token')
    .click()
}

const addToken = () => {
    cy
    .get('.token-contract')
    .clear()
    .type('ct_ZrsqixJo96h2sqTn7HhHwTR9RdHQNWLSdC1f3PAkfK5Rucubm')
    .get('.ae-loader')
    .should('not.be.visible')
    .get('.token-symbol')
    .should('be.disabled')
    .get('.token-precision')
    .should('be.disabled')
    .get('.to-confirm-add')
    .click()
    .get('.ae-loader')
    .should('not.be.visible')
    .get('.token-add-holder')
    .should('be.visible')
    .get('.token-add-form')
    .should('not.be.visible')
    .get('.balanceBig').eq(0)
    .should('contain','HACK')
    .get('.add-token')
    .should('be.visible')
    .click()
    .get('.ae-modal-light')
    .should('be.visible')
    .get('.ae-modal-light .buttons button')
    .click()
    .get('.ae-modal-light')
    .should('not.be.visible')
    .get('.token-add-form')
    .should('be.visible')
    .get('.token-add-holder')
    .should('not.be.visible')
}

describe("Test cases for adding fungible tokens functionality", () => {

    it("open add tokens page", () => {
        openTokensPage()
        cy
        .get('.token-add-form')
        .should('be.visible')
        .get('.toAccount')
        .should('be.visible')
        .get('.to-confirm-add')
        .should('be.visible')
    })

    it("open add tokens page and click back button", () => {
        openTokensPage()
        cy
        .get('.backbutton')
        .should('be.visible')
        .click()
        .get('.backbutton')
        .click()
        .get('.toAccount')
        .click()
        .get('.ae-card.primary')
        .should('be.visible')
    })

    it("validate form inputs", () => {
        openTokensPage()
        cy
        .get('.to-confirm-add')
        .click()
        .get('.ae-modal-light')
        .should('be.visible')
        .get('.ae-modal-light .buttons button')
        .click()
        .get('.ae-modal-light')
        .should('not.be.visible')
        .get('.token-contract')
        .type('000')
        .get('.to-confirm-add')
        .click()
        .get('.ae-modal-light')
        .should('be.visible')
        .get('main > div')
        .get('.buttons > .ae-button').click()
        .get('.token-symbol')
        .type('TST')
        .get('.token-precision')
        .clear()
        .type(30)
        .get('.to-confirm-add')
        .click()
        .get('.ae-modal-light')
        .should('be.visible')
    })

    it("validate correct entered contract address", () => {
        openTokensPage()
        cy
        .get('.token-symbol')
        .type('TST')
        .get('.token-precision')
        .clear()
        .type(5)
        .get('.token-contract')
        .type('1234')
        .get('.token-contract')
        .wait(2000)
        .get('.to-confirm-add')
        .click()
        .get('.ae-modal-light')
        .should('be.visible')
        .get('main > div')
        .get('.buttons > .ae-button').click()
        .get('.token-contract')
        .clear()
        .type('ct_2CC7FPsumg5azo7xNH6XS9wCnzFqVCdE4WrKzrUk6Z4jNeazF')
        .get('.ae-modal-light')
        .should('be.visible')
        .get('main > div')
        .should('contain', 'Invalid token contract address!')
        .get('.buttons > .ae-button').click()
        .get('.token-contract')
        .clear()
        .type('ct_UpnJEwJsShbd1AmRNbMcbNr8WWWRQvtC7sPZPdJTLx5sVxvck')
        .get('.ae-loader')
        .should('not.be.visible')
        .get('.to-confirm-add')
        .click()
        .get('.token-add-holder')
        .should('be.visible')
    })

    it("validate correct entered token symbol", () => {
        openTokensPage()
        cy
        .get('.token-contract')
        .type('ct_UpnJEwJsShbd1AmRNbMcbNr8WWWRQvtC7sPZPdJTLx5sVxvckx')
        .get('.ae-loader')
        .should('be.visible')
        .get('.ae-modal-light')
        .should('be.visible')
        .get('.ae-modal-light .buttons button')
        .click()
        .get('.token-precision')
        .clear()
        .type(5)
        .get('.to-confirm-add')
        .click()
        .get('.ae-modal-light')
        .should('be.visible')
        .get('.ae-modal-light .buttons button')
        .click()
        .get('.token-symbol')
        .type('AEEEEEEEEEEEEEEEEE')
        .get('.to-confirm-add')
        .click()
        .get('.ae-modal-light')
        .should('be.visible')
        .get('.ae-modal-light .buttons button')
        .click()
        .get('.ae-modal-light')
        .should('not.be.visible')
    })

    it("validate correct entered token precision", () => {
        openTokensPage()
        cy
        .get('.token-contract')
        .type('ct_UpnJEwJsShbd1AmRNbMcbNr8WWWRQvtC7sPZPdJTLx5sVxvck')
        .get('.ae-loader')
        .should('be.visible')
        .get('.ae-modal-light')
        .should('not.be.visible')
        .get('.token-precision')
        .should('be.disabled')
        .get('.to-confirm-add')
        .click()
        .get('.ae-loader')
        .get('.token-add-holder')
        .should('be.visible')
    })

    it("enter token info and confirm add", () => {
        openTokensPage()
        addToken()
    })
    
    it("add token and check if present in menu", () => {
        openTokensPage()
        addToken()
        cy
        .get('.mainLoader')
        .should('not.be.visible')
        .get('#settings')
        .click()
        .get('.dropdown-holder')
        .should('be.visible')
        .get('.dropdown-holder .toAccount')
        .click()
        .get('.dropdown-holder')
        .should('not.be.visible')
        .get('.ae-card.primary')
        .should('be.visible')
        .get('#settings')
        .click()
        .get('.dropdown-holder')
        .should('be.visible')
        .get('#tokens')
        .should('be.visible')
        .click()
        .wait(2000)
        .get('.sub-dropdown')
        .should('be.visible')
        .get('#tokens')
        .children()
        .should('have.length',2)
    })

    it("add token logout and check if token present in menu", () => {
        openTokensPage()
        addToken()
        cy
        .get('#settings')
        .click()
        .get('.toLogout')
        .click()
        .get('input[type="password"]')
        .type(ACCOUNT_PASSWORD)
        .get('.loginBtn')
        .click()
        .get('.ae-card.primary')
        .should('be.visible')
        .get('#settings')
        .click()
        .get('#tokens')
        .click()
        .children()
        .should('have.length',2)
    })

    it("select token reset transactions history", () => {
        openTokensPage()
        addToken()
        cy
        .get('#settings')
        .click()
        .get('.dropdown-holder .toAccount')
        .click()
        .get('.ae-card.primary')
        .should('be.visible')
        .wait(2000)
        .get('#settings')
        .click()
        .wait(1000)
        .get('#tokens')
        .click()
        .get('.sub-dropdown > :nth-child(2) > .ae-button')
        .click()
        .get('.noTransactions')
        .should('be.visible')
    })

    it("select token change token sign", () => {
        openTokensPage()
        addToken()
        cy
        .get('.mainLoader')
        .should('not.be.visible')
        .get('#settings')
        .click()
        .get('.dropdown-holder .toAccount')
        .click()
        .get('.dropdown-holder')
        .should('not.be.visible')
        .get('.ae-card.primary')
        .should('be.visible')
        .get('#settings')
        .click()
        .get('.dropdown-holder')
        .should('be.visible')
        .get('#tokens')
        .should('be.visible')
        .click()
        .get('#tokens .sub-dropdown li').eq(1).click()
        .get('.ae-card-header .ae-text')
        .should('contain','HACK')
        .get('.sendBtn')
        .click()
        .get('.sendAmount .ae-text')
        .should('contain','HACK')
        .get('.balance')
        .should('contain','HACK')
        .get('.backbutton')
        .click()
        .get('#settings > button')
        .click()
        .get('#utilities')
        .click()
        .get('#utilitiesPage > :nth-child(1)')
        .click()
        .get('.ae-badge').eq(0).should('contain','HACK')
        .get('.ae-badge').eq(1).should('contain','HACK')
        .get('.ae-badge').eq(2).should('contain','HACK')
        .get('.finalAmount .ae-text').should('contain','HACK')
        .get('.balance')
        .should('contain','HACK')
    })

    it("can send fungible tokens", () => {
        openTokensPage()
        addToken()
        cy
        .get('.mainLoader')
        .should('not.be.visible')
        .get('#settings')
        .click()
        .get('.dropdown-holder')
        .should('be.visible')
        .get('.dropdown-holder .toAccount')
        .click()
        .get('.ae-card.primary')
        .should('be.visible')
        .get('.dropdown-holder')
        .should('not.be.visible')
        .get('#settings')
        .click()
        .get('.dropdown-holder')
        .should('be.visible')
        .get('#tokens')
        .should('be.visible')
        .click()
        .get('.sub-dropdown > :nth-child(2) > .ae-button')
        .click()
        .get('.sendBtn')
        .click()
        .get('.address .ae-input')
        .type(PUBLIC_KEY_SEND)
        .get('.aemount')
        .type(1000001)
        .get('.sendBtn')
        .click()
        .get('.ae-modal-light')
        .should('be.visible')
        .get('.ae-modal-light .buttons button')
        .click()
        .get('.ae-modal-light')
        .should('not.be.visible')
        .get('.aemount')
        .clear()
        .type('1')
        .get('.sendBtn')
        .click()
        .get('.spendTxDetailsList')
        .should('be.visible')
        .get('.ae-badge')
        .should('contain','Contract call')
        .get('.ae-badge')
        .should('contain','transfer')
        .get('.reject')
        .should('be.visible')
        .get('.confirm')
        .should('be.visible')
        .should('not.have.class','disabled')
        .click()
        .get('.ae-loader')
        .should('be.visible')
        .get('.ae-modal-light')
        .should('be.visible')
    })


    it("change token from page", () => {
        openTokensPage()
        addToken()
        cy
        .visit("popup/popup.html",{onBeforeLoad})
        .wait(5000)
        .get('.sendBtn')
        .click()
        .get('.sendAmount .ae-dropdown-button')
        .click()
        .get('.sendAmount .ae-dropdown-menu li').eq(0)
        .should('contain', 'HACK')
        .click()
        .get('.balance')
        .should('contain','HACK')
        .get('.backbutton')
        .click()
        .get('.ae-card-header p')
        .should('contain','HACK')
    })

    it("open login", () => {
        cy.visit('popup/popup.html',{onBeforeLoad})
    })
})