import {onBeforeLoad} from '../support/mock_chrome.js';
import {login} from '../login';
import  { tabs } from '../utils';


describe("Test cases for tipping functionality", () => {

    it("open tipping page", () => {
        login();
        cy
        .get('.toTipping')
        .click()
        .get('.tipWebsiteHeader')
        .should('be.visible')
        .get('.backbutton')
        .should('be.visible')
        .get('.tipWebisteAmount')
        .should('be.visible')
        .get('.sendTip')
        .should('be.visible')
    });

    it("open tipping page and return to account", () => {
        login();
        cy
        .get('.toTipping')
        .click()
        .get('.backbutton')
        .should('be.visible')
        .click()
        .get('.ae-card.primary')
        .should('be.visible')
    });

    it("open tipping page check if domain and favicon is present", () => {
        login();
        cy
        .visit('popup/popup.html',{onBeforeLoad:(contentWindow) => { onBeforeLoad(contentWindow,'domain') }})
        .get('.toTipping')
        .click()
        .get('.domainInfo')
        .should('be.visible')
        .get('.domainInfo h3')
        .should('contain',tabs[1].url)
        .get('.domainFavicon')
        .should('be.visible')
        .should('have.class','noFavicon')
        .get('.verifyRow')
        .should('contain','Not yet verified')
         .should('have.class','notVerified')
    });

    it("open tipping page check if domain and favicon is present", () => {
        login();
        cy
        .get('.toTipping')
        .click()
        .get('.domainInfo')
        .should('be.visible')
        .get('.domainInfo h3')
        .should('contain',tabs[0].url)
        .get('.domainFavicon')
        .should('be.visible')
        .invoke('attr', 'src')
        .should('eq',tabs[0].favIconUrl)
        .get('.verifyRow')
        .should('contain','Not yet verified')
         .should('have.class','notVerified')
    });

    it("click check changes verification", () => {
        login();
        cy
        .get('.toTipping')
        .click()
        .get('.verifyBtn')
        .click()
        .get('.verifyRow')
        .should('contain','Verified')
        .should('have.class','verified')
    });


    it("selecting tip amount", () => {
        login();
        cy
        .get('.toTipping')
        .click()
        .get('.tipWebisteAmount .ae-badge').eq(0)
        .click()
        .get('.finalAmount .ae-input')
        .invoke('val')
        .should('eq','1')
        .get('.range-slider__range')
        .invoke('val')
        .should('eq','1')
        .get('.range-slider')
        .should('have.class','hideSlider')
        .get('.tipWebisteAmount .ae-badge').eq(1)
        .click()
        .get('.finalAmount .ae-input')
        .invoke('val')
        .should('eq','5')
        .get('.range-slider__range')
        .invoke('val')
        .should('eq','5')
        .get('.range-slider')
        .should('have.class','hideSlider')
        .get('.tipWebisteAmount .ae-badge').eq(2)
        .click()
        .get('.finalAmount .ae-input')
        .invoke('val')
        .should('eq','10')
        .get('.range-slider__range')
        .invoke('val')
        .should('eq','10')
        .get('.range-slider')
        .should('have.class','hideSlider')
    });   
    
    it("selecting tip amount other shows the slider" , () => {
        login();
        cy
        .get('.toTipping')
        .click()
        .get('.tipWebisteAmount .ae-badge').eq(2)
        .click()
        .get('.finalAmount .ae-input')
        .invoke('val')
        .should('eq','10')
        .get('.range-slider__range')
        .invoke('val')
        .should('eq','10')
        .get('.range-slider')
        .should('have.class','hideSlider')
        .get('.tipWebisteAmount .ae-badge').eq(3)
        .click()
        .get('.finalAmount .ae-input')
        .invoke('val')
        .should('eq','10')
        .get('.range-slider')
        .should('not.have.class','hideSlider')
    });
    
    it("validates entered amount" , () => {
        login();
        cy
        .get('.toTipping')
        .click()
        .get('.finalAmount .ae-input')
        .type("asd")
        .get('.sendTip')
        .click()
        .get('.ae-modal-light')
        .should('be.visible')
        .find('.buttons button')
        .click()
        .get('.finalAmount .ae-input')
        .clear()
        .type("-5")
        .get('.sendTip')
        .click()
        .get('.ae-modal-light')
        .should('be.visible')
        .find('.buttons button')
        .click()
        .get('.finalAmount .ae-input')
        .clear()
        .type("0")
        .get('.sendTip')
        .click()
        .get('.ae-modal-light')
        .should('be.visible')
        .find('.buttons button')
        .click()
        .get('.finalAmount .ae-input')
        .clear()
        .type("200")
        .get('.sendTip')
        .click()
        .get('.ae-modal-light')
        .should('be.visible')
        .find('.buttons button')
        .click()
        .get('.finalAmount .ae-input')
        .clear()
        .type("0.0001")
        .get('.sendTip')
        .click()
        .get('.ae-modal-light')
        .should('not.be.visible')
    });

    it("check login page", () => {
        cy.
        visit('popup/popup.html',{onBeforeLoad});
    });
});