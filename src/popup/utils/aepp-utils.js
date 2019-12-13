import { networks } from './constants'
import Universal from '@aeternity/aepp-sdk/es/ae/universal';

let sdk;

export const getActiveAccount  = () => {
    return new Promise((resolve, rejet) => {
        browser.storage.local.get('isLogged').then((data) => {
            if (data.isLogged && data.hasOwnProperty('isLogged')) {
                browser.storage.local.get('subaccounts').then((subaccounts) => {
                    browser.storage.local.get('activeAccount').then((active) => {
                        let activeIdx = 0
                        if(active.hasOwnProperty("activeAccount")) {
                            activeIdx = active.activeAccount
                        }
                        let address = subaccounts.subaccounts[activeIdx].publicKey
                        resolve({ account: { publicKey: address }, activeAccount: activeIdx })
                    })
                })
            } else {
                resolve(false)
            }
        })
    })
}

export const getActiveNetwork = async () => {
    const { activeNetwork } = await browser.storage.local.get('activeNetwork')
    return networks[activeNetwork ? activeNetwork : 'Testnet']
}

export const getSDK = async (keypair) => {
    if(!sdk) {
        try {
            let network = getActiveNetwork();
            sdk = await Universal({
                url: network.url , 
                internalUrl: network.internalUrl,
                keypair,
                networkId: network.networkId, 
                nativeMode: true,
                compilerUrl: network.compilerUrl
            })
        } catch(e) { } 
    } 

    return sdk
    
}