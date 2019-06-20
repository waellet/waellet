import { mnemonic } from '../utils';
const onBeforeLoad = (win,mock = '') => {
    win.chrome = win.chrome || {};
    try {
        win.chrome.runtime = {
            getURL(url){
                let path = url.split("/").filter(u => u != "..").join("/");
                return Cypress.config().baseUrl + path;
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
                }
            } 
        };
        window.chrome = win.chrome;
        if(mock == 'account') {
            const account = {
                publicKey:"ak_NBrcw9KrjU8BjM56jovLHTiXDMhPaepX9miomP1gVFpLZfHew",
                secretKey:"ef07a269ce62e81dbd507d2d677e06654765984aa4650bcf2ed68bbfc783f8e4301ba902bf2b2c176ac934eb41181866ae25f19dcbdd42c4aa448c0f82c913f9",
                encryptedPrivateKey:{"name":"keystore","version":1,"public_key":"ak_NBrcw9KrjU8BjM56jovLHTiXDMhPaepX9miomP1gVFpLZfHew","id":"5699690b-0af4-465f-a3d8-f7fa35ecd8ad","crypto":{"secret_type":"ed25519","symmetric_alg":"xsalsa20-poly1305","ciphertext":"800659efba3c86107ed7edcca0dcd6848bd6702f99c3c401f15431882c80fb0ab21d94e55596082be457cd1381142dfa3f90ecf8ea4b3045ae8378eefea23608832b508a825dc263cd225af5ec1615df","cipher_params":{"nonce":"a1c0a567392213114c4b2075a6ce17524bdd71d546440876"},"kdf":"argon2id","kdf_params":{"memlimit_kib":65536,"opslimit":3,"parallelism":1,"salt":"0817a90b57f7bb5c898c3ef8304d3852"}}}
                
            }
            win.chrome.storage.sync.set({userAccount: account},()=>{});
        }else if(mock == 'seed') {
            win.chrome.storage.sync.set({mnemonic: mnemonic},()=>{});
        }
    }catch(err) {
        console.log(err);
    }
}

export {onBeforeLoad};