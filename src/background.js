import MemoryAccount from '@aeternity/aepp-sdk/es/account/memory'
import Account from '@aeternity/aepp-sdk/es/account'
// import ExtensionProvider from '@aeternity/aepp-sdk/es/provider/extension'


global.browser = require('webextension-polyfill');

// listen for our browerAction to be clicked
chrome.browserAction.onClicked.addListener(function (tab) {
	// for the current tab, inject the "inject.js" file & execute it
	chrome.tabs.executeScript(tab.id, {
		file: 'inject.js'
	});
});

chrome.browserAction.setBadgeText({ 'text': 'beta' });
chrome.browserAction.setBadgeBackgroundColor({ color: "#FF004D"});

function getAccount() {
    return new Promise(resolve => {
        chrome.storage.sync.get('userAccount', data => {
            if (data.userAccount && data.userAccount.hasOwnProperty('publicKey')) {
                resolve({ keypair: {
                    publicKey: data.userAccount.publicKey,
                    secretKey: data.userAccount.secretKey
                }})
            }
        })
    });
  }

// async function asyncCall() {
//     console.log('calling');
//     await 
//     // expected output: 'resolved'
// }
  
// asyncCall();


// getAccount()
//     .then((account) => {
//         // Init accounts
//         const accounts = [
//             // You can add your own account implementation,
//             Account.compose({
//                 init() {
//                 },
//                 methods: {
//                     /**
//                      * Sign data blob
//                      * @function sign
//                      * @instance
//                      * @abstract
//                      * @category async
//                      * @rtype (data: String) => data: Promise[String]
//                      * @param {String} data - Data blob to sign
//                      * @return {String} Signed data blob
//                      */
//                     async sign(data) {
//                     },
//                     /**
//                      * Obtain account address
//                      * @function address
//                      * @instance
//                      * @abstract
//                      * @category async
//                      * @rtype () => address: Promise[String]
//                      * @return {String} Public account address
//                      */
//                     async address() {
//                     }
//                 }
//             })(),
//             MemoryAccount(account)
//         ]
//         return accounts
//     })
//     .then((accounts) => {
//         // Init extension stamp from sdk
//         ExtensionProvider({
//             // Provide post function (default: window.postMessage)
//             postFunction: postToContent,
//             // By default `ExtesionProvider` use first account as default account. You can change active account using `selectAccount (address)` function
//             accounts: accounts,
//             // Hook for sdk registration
//             onSdkRegister: function (sdk) {
//                 // sendDataToPopup(this.getSdks())
//                 if (confirm('Do you want to share wallet with sdk ' + sdk.sdkId)) sdk.shareWallet() // SHARE WALLET WITH SDK
//             },
//             // Hook for signing transaction
//             onSign: function ({sdkId, tx, txObject, sign}) {
//                 // sendDataToPopup(this.getSdks())
//                 if (confirm('Do you want to sign ' + JSON.stringify(txObject) + ' ?')) sign() // SIGN TX
//             }
//         }).then(provider => {
//             // Subscribe from postMessages from page
//             chrome.runtime.onMessage.addListener((msg, sender) => {
//                 switch (msg.method) {
//                     case 'pageMessage':
//                         console.log(msg);
//                         provider.processMessage(msg);
//                         break
//                 }
//             })
//         }).catch(err => {
//             console.error(err)
//         })
//     });


const postToContent = (data) => {
    chrome.tabs.query({}, function (tabs) { // TODO think about direct direct communication with tab
        const message = { method: 'waelletMessage', data };
        tabs.forEach(({ id }) => chrome.tabs.sendMessage(id, message)) // Send message to all tabs
    });
}




// // Subscribe from postMessages from page
// chrome.runtime.onMessage.addListener((msg, sender) => {
//     switch (msg.method) {
//         case 'waelletMessage':
//             console.log(msg);
//             // processMessage(msg);
//             break
//     }
// })