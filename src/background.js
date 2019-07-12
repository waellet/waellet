import { phishingCheckUrl, getPhishingUrls, setPhishingUrl } from './popup/utils/phishing-detect';
import { checkAeppConnected, initializeSDK } from './popup/utils/helper';

global.browser = require('webextension-polyfill');

// listen for our browerAction to be clicked
chrome.browserAction.onClicked.addListener(function (tab) {
    // for the current tab, inject the "inject.js" file & execute it
	chrome.tabs.executeScript(tab.id, {
        file: 'inject.js'
	}); 
});

setInterval(() => {
    browser.windows.getAll({}).then((wins) => {
        if(wins.length == 0) {
            sessionStorage.removeItem("phishing_urls");
        }
    });
},60000);

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


// getAccount()
//     .then((account) => {
//         // Init accounts
//         const accounts = [
//             // You can add your own account implementation,
//             // Account.compose({
//             //     init() {
//             //     },
//             //     methods: {
//             //         /**
//             //          * Sign data blob
//             //          * @function sign
//             //          * @instance
//             //          * @abstract
//             //          * @category async
//             //          * @rtype (data: String) => data: Promise[String]
//             //          * @param {String} data - Data blob to sign
//             //          * @return {String} Signed data blob
//             //          */
//             //         async sign(data) {
//             //         },
//             //         /**
//             //          * Obtain account address
//             //          * @function address
//             //          * @instance
//             //          * @abstract
//             //          * @category async
//             //          * @rtype () => address: Promise[String]
//             //          * @return {String} Public account address
//             //          */
//             //         async address() {
//             //         }
//             //     }
//             // })(),
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
//                 // if (confirm('Do you want to share wallet with sdk ' + sdk.sdkId)) sdk.shareWallet()
//                 sdk.shareWallet();
//                 chrome.storage.sync.set({showAeppPopup:{ data: sdk.sdkId.toString(), type:'confirm',callback:null } } , () => {
//                     chrome.windows.create({
//                         url: chrome.runtime.getURL('./popup/popup.html'),
//                         type: "popup",
//                         height: 600,
//                         width:420
//                       },() => {
//                         console.log("created");
                        
//                     });
//                 });
//             },
//             // Hook for signing transaction
//             onSign: function ({sdkId, tx, txObject, sign}) {
//                 // sendDataToPopup(this.getSdks())
//                 // if (confirm('Do you want to sign ' + JSON.stringify(txObject) + ' ?')) sign() // SIGN TX
//                 // sign();
//                 console.log(sign);
//                 chrome.storage.sync.set({showAeppPopup:{ data: txObject, type:'sign',callback:'asd'  } } , () => {
//                     chrome.windows.create({
//                         url: chrome.runtime.getURL('./popup/popup.html'),
//                         type: "popup",
//                         height: 600,
//                         width:420
//                       },() => {
//                         console.log("created");
//                     });
//                 });
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

browser.runtime.onMessage.addListener( (msg, sender,sendResponse) => {
    switch(msg.method) {
        case 'phishingCheck':
            let data = {...msg, extUrl: browser.extension.getURL ('./') };
            phishingCheckUrl(msg.params.hostname)
            .then(res => {
                if(typeof res.result !== 'undefined' && res.result == 'blocked') {
                    let whitelist = getPhishingUrls().filter(url => url === msg.params.hostname);
                    if(whitelist.length) {
                        data.blocked = false;
                        return postPhishingData(data);
                    }
                    data.blocked = true;
                    return postPhishingData(data);
                }
                data.blocked = false;
                return postPhishingData(data);
            });
        break;
        case 'setPhishingUrl':
            let urls = getPhishingUrls();
            urls.push(msg.params.hostname);
            setPhishingUrl(urls);
        break;
        case 'aeppMessage':
            switch(msg.params.type) {
                case "txSign":
                    checkAeppConnected(msg.params.hostname).then((check) => {
                        if(check) {
                            browser.storage.sync.set({showAeppPopup:{ data: msg.params, type:'txSign' } } ).then( () => {
                                browser.windows.create({
                                    url: browser.runtime.getURL('./popup/popup.html'),
                                    type: "popup",
                                    height: 600,
                                    width:420
                                    }).then((window) => {
                                        connectToPopup((res) => {
                                            sendResponse(res)
                                        }, 'txSign')
                                    })
                            })
                        }else {
                            sendResponse({id:null, jsonrpc:"2.0",message: "Aepp not registered. Establish connection first"})
                        }
                    });
                break;
                case 'connectConfirm':
                    checkAeppConnected(msg.params.params.hostname).then((check) => {
                        if(!check) {
                            browser.storage.sync.set({showAeppPopup:{ data: msg.params, type:'connectConfirm' } } ).then( () => {
                                browser.windows.create({
                                    url: browser.runtime.getURL('./popup/popup.html'),
                                    type: "popup",
                                    height: 600,
                                    width:420
                                    }).then((window) => {
                                        connectToPopup((res) => {
                                            sendResponse(res)
                                        }, 'connectConfirm')
                                    })
                            })
                        } else {
                            sendResponse({id:null, jsonrpc:"2.0",message: "Connection already established"})
                        }
                    })
                break;
                case 'getAddress':
                    browser.storage.sync.get('userAccount').then((user)=> {
                        browser.storage.sync.get('isLogged').then((data) => {
                            if (data.isLogged && data.hasOwnProperty('isLogged')) {
                                browser.storage.sync.get('subaccounts').then((subaccounts) => {
                                    browser.storage.sync.get('activeAccount').then((active) => {
                                        let activeIdx = 0
                                        if(active.hasOwnProperty("activeAccount")) {
                                            activeIdx = active.activeAccount
                                        }
                                        let address = subaccounts.subaccounts[activeIdx].publicKey
                                        sendResponse({id:null, jsonrpc:"2.0",address})
                                    })
                                })
                            }else {
                                sendResponse({id:null, jsonrpc:"2.0",address:""})
                            }
                        })
                    })
                break;

                case 'contractCall':

                    
                break;
            }
        break
    }

    return true
})

const connectToPopup = (cb,type) => {
    browser.runtime.onConnect.addListener((port) => {
        port.onMessage.addListener((msg) => {
            cb(msg)
        });
        port.onDisconnect.addListener((event) => {
            browser.storage.sync.remove('pendingTransaction').then(() => {});
            browser.storage.sync.remove('showAeppPopup').then(() => {});  
            if(type == 'txSign') {
                cb({
                    "error": {
                        "code": 1,
                        "data": {
                            "request": {}
                        },
                        "message": "Transaction verification failed"
                    },
                    "id": null,
                    "jsonrpc": "2.0"
                })
            }else if(type == 'connectConfirm') {
                cb({id:null, jsonrpc:"2.0",message:"Connection canceled"})
            }else {
                cb()
            }
            
        });
   })
}

const postPhishingData = (data) => {
    browser.tabs.query({active:true, currentWindow:true}).then((tabs) => { 
        const message = { method: 'phishingCheck', data };
        tabs.forEach(({ id }) => browser.tabs.sendMessage(id, message)) 
    });
}

const postToContent = (data, tabId) => {
    const message = { method: 'aeppMessage', data };
    browser.tabs.sendMessage(tabId, message)
}
