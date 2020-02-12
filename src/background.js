import { phishingCheckUrl, getPhishingUrls, setPhishingUrl } from './popup/utils/phishing-detect';
import { checkAeppConnected, removeTxFromStorage, detectBrowser, parseFromStorage, detectConnectionType } from './popup/utils/helper';
import WalletController from './wallet-controller'
import Notification from './notifications';
import rpcWallet from './lib/rpcWallet'
import { 
    HDWALLET_METHODS,
    AEX2_METHODS,
    NOTIFICATION_METHODS,
    CONNECTION_TYPES
} from './popup/utils/constants'

import { PopupConnections } from './lib/popup-connection'

global.browser = require('webextension-polyfill');


const error = {
    "error": {
        "code": 1,
        "data": {
            "request": {}
        },
        "message": "Transaction verification failed"
    },
    "id": null,
    "jsonrpc": "2.0"
}

const controller = new WalletController()
const notification = new Notification();

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
    }

    return true
})

/**
 * This should be deprecated
 */
const connectToPopup = (cb,type, id) => {
    browser.runtime.onConnect.addListener((port) => {
        port.onMessage.addListener((msg,sender) => {
            msg.id = sender.name
            if(id == sender.name) cb(msg)
        });
        port.onDisconnect.addListener(async (event) => {
            let list = await removeTxFromStorage(event.name)
            browser.storage.local.set({pendingTransaction: { list } }).then(() => {})
            browser.storage.local.remove('showAeppPopup').then(() => {}); 
            error.id = event.name
            if(event.name == id) {
                if(type == 'txSign') {
                    error.error.message = "Transaction rejected by user"
                    cb(error)
                }else if(type == 'connectConfirm') {
                    error.error.message = "Connection canceled"
                    cb(error)
                }else if(type == 'contractCall') {
                    error.error.message = "Transaction rejected by user"
                    cb(error)
                }else {
                    cb()
                }
            }
        });
   })
}

/**
 * This should be deprecated
 */
const openAeppPopup = (msg,type) => {
    return new Promise((resolve,reject) => {
        browser.storage.local.set({showAeppPopup:{ data: msg.params, type } } ).then( () => {
            browser.windows.create({
                url: browser.runtime.getURL('./popup/popup.html'),
                type: "popup",
                height: 680,
                width:420
            }).then((window) => {
                connectToPopup((res) => {
                    resolve(res)
                }, type, msg.params.id)
            })
        })
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



/** 
 * AEX-2 RpcWallet Init
 */
const popupConnections = PopupConnections()
popupConnections.init()
rpcWallet.init(controller, popupConnections)
browser.runtime.onConnect.addListener( async ( port ) => {
    if(port.sender.id == browser.runtime.id) {
        const connectionType = detectConnectionType(port)
        if(connectionType == CONNECTION_TYPES.EXTENSION) {
            port.onMessage.addListener(async ({ type, payload, uuid }, sender) => {
                if(HDWALLET_METHODS.includes(type)) {
                    port.postMessage({ uuid, res: await controller[type](payload) });
                } 
                if(AEX2_METHODS[type]) rpcWallet[type](payload)

                if(NOTIFICATION_METHODS[type]) notification[type](payload) 
            }) 
        } else if(connectionType == CONNECTION_TYPES.POPUP) {
            const url = new URL(port.sender.url)
            const id = url.searchParams.get('id')
            popupConnections.addConnection(id, port);
        } else if(connectionType == CONNECTION_TYPES.OTHER) {
            const check = rpcWallet.sdkReady(() => {
                rpcWallet.addConnection(port)
            })
            port.onDisconnect.addListener((p) => {
                clearInterval(check)
            })
        }
    }
}) 