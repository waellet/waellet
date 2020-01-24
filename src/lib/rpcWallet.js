import { DEFAULT_NETWORK, networks } from '../popup/utils/constants'
import { stringifyForStorage, parseFromStorage, extractHostName, getAeppAccountPermission } from '../popup/utils/helper'
import { getAccounts } from '../popup/utils/storage'
import MemoryAccount from '@aeternity/aepp-sdk/es/account/memory'
import { RpcWallet } from '@aeternity/aepp-sdk/es/ae/wallet'
import BrowserRuntimeConnection
  from '@aeternity/aepp-sdk/es/utils/aepp-wallet-communication/connection/browser-runtime'
import Node from '@aeternity/aepp-sdk/es/node'
import { detectBrowser } from '../popup/utils/helper'

global.browser = require('webextension-polyfill');

export default async (connection, walletController) => {

    let network = DEFAULT_NETWORK
    let compiler = networks[network].compilerUrl
    let internalUrl = networks[network].internalUrl
    const account = ""
    let activeAccount = ""
    const { subaccounts } = await getAccounts()
    let accounts = []
    let accountKeyPairs = []
    let sdk 
    console.log("hereeee")
    let seed = {
        seed:stringifyForStorage("3c9ed46b5da9b5686abcbd85870adc66c1706c62d2000857820870b960593a6dcb9734abe47a122a2917462ede5994a0a7eff304cab6aeb66d6c1ad021b6eb6c")
    }
    await walletController.generateWallet(seed)

    connection(async ({ hdwallet, port, type, payload, uuid }) => {
        if(!hdwallet) {
            if(type == "changeAccount") {
                sdk.selectAccount(payload)
                activeAccount = payload
                console.log("change account")
            } else if( type == "addAccount") {
                console.log("add new account")
                let account = {
                    publicKey: payload.address
                }
                let newAccount =  MemoryAccount({
                    keypair: parseFromStorage(await walletController.getKeypair({ activeAccount: payload.idx, account }))
                })
                sdk.addAccount(newAccount, { select: true })
                activeAccount = payload.address
            } else if( type == "switchNetwork" ) {
                console.log("switch network")
                network = payload
                compiler = networks[network].compilerUrl
                internalUrl = networks[network].internalUrl
                const node = await Node({ url:internalUrl, internalUrl: internalUrl })
                try {
                    await sdk.addNode(payload, node, true)
                } catch(e) {
                    console.log(e)
                }
                sdk.selectNode(internalUrl)
            }
        }
    })


    const createWallet = async () => {
        accountKeyPairs = await Promise.all(subaccounts.map(async (a, index) => (
            parseFromStorage(await walletController.getKeypair({ activeAccount: index, account: a}))
        )))
        
        let activeIdx = await browser.storage.sync.get('activeAccount') 
        
        accounts = accountKeyPairs.map((a) => {
            return MemoryAccount({
                keypair: a
            })
        })

        try {
            const node = await Node({ url: internalUrl, internalUrl: internalUrl })
            sdk  = await RpcWallet({
                nodes: [
                    { name: DEFAULT_NETWORK, instance: node },
                ],
                compilerUrl: compiler,
                name: 'Waellet',
                accounts,
                async onConnection (aepp, action) {
                    checkAeppPermissions(aepp, action, "connection")
                },
                onDisconnect (masg, client) {
                    client.disconnect()
                },
                async onSubscription (aepp, action) {
                    checkAeppPermissions(aepp, action, "subscription")
                },
                async onSign (aepp, action) {
                    checkAeppPermissions(aepp, action, "sign", () => {
                        setTimeout(() => {
                            showConnectionPopup({ aepp, action, type: "sign" })
                        }, 2000)
                        
                    })
                },
                onAskAccounts (aepp, { accept, deny }) {
                    if (confirm(`Client ${aepp.info.name} with id ${aepp.id} want to get accounts`)) {
                      accept()
                    } else {
                      deny()
                    }
                }
            })
            
            browser.runtime.onConnectExternal.addListener(async (port) => { 
                const connection = await BrowserRuntimeConnection({ connectionInfo: { id: port.sender.frameId }, port })
                sdk.addRpcClient(connection)
            })

            console.log(accountKeyPairs)

            if (activeIdx.hasOwnProperty("activeAccount") && !isNaN(activeIdx.activeAccount)) {
                sdk.selectAccount(accountKeyPairs[activeIdx.activeAccount].publicKey)
                activeAccount = accountKeyPairs[activeIdx.activeAccount].publicKey
            } else {
                sdk.selectAccount(accountKeyPairs[0].publicKey)
                activeAccount = accountKeyPairs[0].publicKey
            }

            setInterval(() => sdk.shareWalletInfo(postMessageToContent), 5000)

        } catch(e) {
            console.error(e)
        }
       
        console.log(sdk)
        return sdk
    }

    const checkAeppPermissions = async (aepp, action, caller, cb ) => {
        let { connection: { port: {  sender: { url } } } } = aepp
        let isConnected = await getAeppAccountPermission(extractHostName(url), activeAccount)

        if(!isConnected) {
            try {
                let a = caller == "connection" ? action : {}
                let res = await showConnectionPopup({ action: a, aepp, type: "connectConfirm" })
                if(typeof cb != "undefined") {
                    cb()
                }
            } catch(e) {
                
            }
        } else {
            if (typeof cb == "undefined") {
                action.accept()
            } else {
                cb()
            }
        }
    }

    const showConnectionPopup = ({ action, aepp, type = "connectConfirm" }) => {
        const popupWindow = window.open(`/popup/popup.html?t=${action.id}`, `popup_id_${action.id}`, 'width=420,height=680', false);
        if (!popupWindow) action.deny()
        let { connection: { port: {  sender: { url } } }, info: { icons, name} } = aepp
        let { protocol } = new URL (url)
        return new Promise((resolve, reject) => {
            popupWindow.window.props = { type, resolve, reject, action, host: extractHostName(url), icons, name, protocol };
        });
    }
  

    const postMessageToContent = (data) => {
        if(detectBrowser() == 'Firefox') {
            browser.tabs.query({}).then( tabs => { 
                const message = { method: 'pageMessage', data };
                tabs.forEach(({ id }) => browser.tabs.sendMessage(id, message))
            });
        } else {
            chrome.tabs.query({}, function(tabs) { 
                const message = { method: 'pageMessage', data };
                tabs.forEach(({ id }) => chrome.tabs.sendMessage(id, message))
            });
        }
        
    }

    const recreateWallet = async () => {
        await createWallet()
    }

    let created = false
    let lastNetwork
    let createInterval = setInterval(async () => {
        console.log("logged in", walletController.isLoggedIn())
        if(walletController.isLoggedIn()) {
            
            if(!created) {
                recreateWallet()
                clearInterval(createInterval)
            }
            created = true
        }
    }, 5000)

}