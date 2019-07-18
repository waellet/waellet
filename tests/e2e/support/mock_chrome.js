import { mnemonic, tabs, transaction, transaction2, connectObj } from '../utils';
const onBeforeLoad = (win,mock = '') => {
    win.chrome = win.chrome || {};
    try {
        win.chrome.runtime = {
            getURL(url){
                let path = url.split("/").filter(u => u != "..").join("/");
                return Cypress.config().baseUrl + path;
            },
            getManifest() {
                return {
                    version:"0.0.4"
                }
            }
        };
        win.chrome.storage = {
            sync: {
                set(data,callback) {
                    
                    for (let d in data) {
                        localStorage[d] = JSON.stringify(data[d]);
                    }
                    callback();
                },
                get(data,callback) {
                    let res = {};
                    if(localStorage.getItem(data)){
                        res = {[data]:JSON.parse(localStorage.getItem(data))};
                    }
                    callback(res);
                },
                remove(data,callback) {
                    localStorage.removeItem('data')
                    callback()
                }
            } 
        };
        win.chrome.app = {
            getDetails () {
                return {
                    version:"0.0.4"
                }
            }
        }
       win.chrome.tabs = {
           query(data,callback) {
                if(mock == 'domain') {
                    callback(tabs.reverse());
                }else {
                    callback(tabs);
                }
           }
       }
        win.chrome.storage.sync.set({allowTracking: false},()=>{});
        window.chrome = win.chrome;
        if(mock == 'account') {
            const account = {
                publicKey:"ak_d45oN2qzS1vqdiWVYCfDeWLVb3EepWxAJrsDbCSmnYiZguerw",
                secretKey:"ef07a269ce62e81dbd507d2d677e06654765984aa4650bcf2ed68bbfc783f8e4301ba902bf2b2c176ac934eb41181866ae25f19dcbdd42c4aa448c0f82c913f9",
                encryptedPrivateKey:{"name":"keystore","version":1,"public_key":"ak_d45oN2qzS1vqdiWVYCfDeWLVb3EepWxAJrsDbCSmnYiZguerw","id":"298c2d6e-79fd-4df6-aea9-4258fde7a1d3","crypto":{"secret_type":"ed25519","symmetric_alg":"xsalsa20-poly1305","ciphertext":"74d4706bba362e7cda0effd66ff1da27e5766d6d7d4e630be9763179270d708154d24d1c0fd5f2075d154e1bd2c49699ccfb09b6af2bbf1c51c782a9b555584a447c9dd3082fe6abaffcd31ed4c4f2d7","cipher_params":{"nonce":"de66538f7981040a79876ed85e73e9ae16946887a9baab07"},"kdf":"argon2id","kdf_params":{"memlimit_kib":65536,"opslimit":3,"parallelism":1,"salt":"67eae2f3ff0becc34ca3b2bf9cec414c"}}}
            }
            win.chrome.storage.sync.set({userAccount: account},()=>{});
        }else if(mock == 'seed') {
            win.chrome.storage.sync.set({mnemonic: mnemonic},()=>{});
        }else if(mock == 'subaccounts') {
            let sub = [{"balance":106,"name":"Main account","publicKey":"ak_d45oN2qzS1vqdiWVYCfDeWLVb3EepWxAJrsDbCSmnYiZguerw","root":true},{"balance":0,"name":"Sub account 2","publicKey":"ak_26jiGAScn8BMaxrwUbK2XY1b5xLPM52kYwiVnjirY9jtsFtojx","root":false},{"balance":0,"name":"Sub account 3","publicKey":"ak_24cB1bEdJ53jyEUgKu57F5k1idFGi8XiA4eXSnbv5htnHSdjEC","root":false}];
            win.chrome.storage.sync.set({subaccounts: sub},()=>{});
        }else if(mock == 'sign') {
            chrome.storage.sync.set({
                pendingTransaction:{
                    data:transaction
                }
            }, () => { });
        }else if(mock == 'sign2') {
            chrome.storage.sync.set({
                pendingTransaction:{
                    data:transaction2
                }
            }, () => { });
        }else if(mock == 'confirm-connection') {
            chrome.storage.sync.set({
                showAeppPopup:{
                    data:{params:connectObj.params},
                    type:connectObj.type
                }
            }, () => { });
        }
    }catch(err) {
        console.log(err);
    }
}

export {onBeforeLoad};