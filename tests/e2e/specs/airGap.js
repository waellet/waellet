import { onBeforeLoad } from '../support/mock_chrome.js';
import { login } from '../login';
import { generateWallet, mnemonic, PRIVATE_KEY_IMPORT,PRIVATE_KEY, ACCOUNT_PASSWORD,ACCOUNT_PASSWORD_STRONG, importPrivate ,importSeed,importKeystore} from '../utils.js';
import { getHdWalletAccount,generateHdWallet, createAccount,createSubAccount,renameAccounts,renameAccountFromManageAccounts } from '../utils';
import { generateMnemonic, mnemonicToSeed, validateMnemonic } from '@aeternity/bip39';



const hdWallet = (seed) => {
    let wallet = generateHdWallet(seed);
    let publicKey = getHdWalletAccount(wallet,0).address;
    return publicKey;
};

const deriveAdress = (seed,index) => {
    let wallet = generateHdWallet(seed);
    let publicKey = getHdWalletAccount(wallet,index).address;
    return publicKey;
};


describe('Test cases for managing accounts and deriving multiple address from same private key', () => {

    // it("have account menu", () => {
    //     login();
    //     cy
    //     .visit('popup/popup.html',{onBeforeLoad})
    //     .get('#account')
    //     .should('be.visible')
    //     .get('#account .dropdown-button-name')
    //     .should('contain','Main account')
    //     .get('#account')
    //     .click()
    //     .get('.dropdown-holder')
    //     .should('be.visible')
    //     .get('.dropdown-holder li').eq(0)
    //     .should('be.visible')
    //     .should('have.class','activeAccount')
    //     .get('.dropdown-holder li').eq(0).find('.subAccountName')
    //     .should('contain','Main account')
    //     .get('.newSubaccount')
    //     .should('be.visible')
    //     .get('.iconBtn')
    //     .should('be.visible')
    // });

    it("open Create AirGap Vault Account page all steps", () => {
        login();
        cy
        .visit('popup/popup.html',{onBeforeLoad})
        .get('#account')
        .click()
        .get('.airGapVault')
        .click()
        .get('.dropdown-holder')
        .should('not.be.visible')
        .get('.airgap-setup-definitions')
        .should('be.visible')
        .get('.qr-wrapper')
        .should('be.visible')
        .get('.ae-button')
        .should('have.class','step-button')
        .should('be.visible')
        .should('contain','Next')
        .click()
        .wait(500)
        .get('div.step2')
        .should('be.visible')
        .get('.ae-button')
        .should('have.class','step-button')
        .should('be.visible')
        .should('contain','Link vault ')
        .click()
        .wait(3000)
        .get('.cameraMsg p b')
        .should('contain','Camera successfully initilized! Ready for scanning now!')
    });

});