import Universal from '@aeternity/aepp-sdk/es/ae/universal';
import { getHdWalletAccount } from './hdWallet';
import { Crypto } from '@aeternity/aepp-sdk/es';
import { postMesssage } from './connection';

const shuffleArray = (array) => {
    let currentIndex = array.length, temporaryValue, randomIndex;

    // While there remain elements to shuffle...
    while (0 !== currentIndex) {

        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;

        // And swap it with the current element.
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }

    return array;
};

const convertToAE = (balance) => {
    return +(balance / 10 ** 18).toFixed(7);
};

const extractHostName = (url) => {
    let hostname;
    //find & remove protocol (http, ftp, etc.) and get hostname

    if (url.indexOf("//") > -1) {
        hostname = url.split('/')[2];
    }
    else {
        hostname = url.split('/')[0];
    }

    //find & remove port number
    hostname = hostname.split(':')[0];
    //find & remove "?"
    hostname = hostname.split('?')[0];

    return hostname;
};

const detectBrowser = () => {
    if((navigator.userAgent.indexOf("Opera") || navigator.userAgent.indexOf('OPR')) != -1 ) {
        return 'Opera'
    }else if(navigator.userAgent.indexOf("Chrome") != -1 ){
        return 'Chrome'
    }else if(navigator.userAgent.indexOf("Safari") != -1){
        return 'Safari'
    }else if(navigator.userAgent.indexOf("Firefox") != -1 ) {
        return 'Firefox'
    }else if((navigator.userAgent.indexOf("MSIE") != -1 ) || (!!document.documentMode == true )){
        return 'IE'
    }else {
       return 'unknown'
    }
}

const fetchData = (url, method, fetchedData) => {
    if (method == 'post') {
        fetch(url, {
            method: method,
            body: fetchedData
        })
        .then(response => response.json())
        .then(json => console.log(json))
    }
    if (method == 'get') {
        return fetch(url)
            .then(response => response.json())
    }
}

const setConnectedAepp = (host) => {
    return new Promise((resolve, reject) => {
        browser.storage.sync.get('connectedAepps').then((aepps) => {

            let list = []
            if(aepps.hasOwnProperty('connectedAepps') && aepps.connectedAepps.hasOwnProperty('list')) {
                list = aepps.connectedAepps.list
            }
            list.push({host})
            browser.storage.sync.set({connectedAepps: { list }}).then(() => {
                resolve()
            })
        })
    })
}

const checkAeppConnected = (host) => {
    return new Promise((resolve, reject) => {
        browser.storage.sync.get('connectedAepps').then((aepps) => {
            if(!aepps.hasOwnProperty('connectedAepps')) {
                return resolve(false)
            }
            if(aepps.hasOwnProperty('connectedAepps') && aepps.connectedAepps.hasOwnProperty('list')) {
                let list = aepps.connectedAepps.list
                if(list.find(ae => ae.host == host)) {
                    return resolve(true)
                }
                return resolve(false)
            }
    
            return resolve(false)
        })
    })
}


const redirectAfterLogin = (ctx) => {
  browser.storage.sync.get('showAeppPopup').then((aepp) => {
    browser.storage.sync.get('pendingTransaction').then((pendingTx) => {
        if(aepp.hasOwnProperty('showAeppPopup') && aepp.showAeppPopup.hasOwnProperty('type') && aepp.showAeppPopup.hasOwnProperty('data') && aepp.showAeppPopup.type != "" ) {
            browser.storage.sync.remove('showAeppPopup').then(() => {
                ctx.$store.commit('SET_AEPP_POPUP',true)
                
                if(aepp.showAeppPopup.type == 'connectConfirm') {
                    aepp.showAeppPopup.data.popup = true
                    ctx.$router.push({'name':'connect-confirm', params: {
                    data:aepp.showAeppPopup.data
                    }});
                }else if(aepp.showAeppPopup.type == 'txSign') {
                    aepp.showAeppPopup.data.popup = true
                    ctx.$router.push({'name':'sign', params: {
                    data:aepp.showAeppPopup.data
                    }});
                }else if(aepp.showAeppPopup.type == 'contractCall') {
                    aepp.showAeppPopup.data.popup = true
                    ctx.$router.push({'name':'sign', params: {
                        data:aepp.showAeppPopup.data
                    }});
                }else if(aepp.showAeppPopup.type == 'signMessage') {
                    aepp.showAeppPopup.data.popup = true
                    ctx.$router.push({'name':'sign-verify-message', params: {
                        data:aepp.showAeppPopup.data
                    }})
                }
            return;
            });
        }else if(pendingTx.hasOwnProperty('pendingTransaction') && pendingTx.pendingTransaction.hasOwnProperty('list') && Object.keys(pendingTx.pendingTransaction.list).length > 0) {
            ctx.$store.commit('SET_AEPP_POPUP',true)
            let tx = pendingTx.pendingTransaction.list[Object.keys(pendingTx.pendingTransaction.list)[0]];
            tx.popup = false
            tx.countTx =  Object.keys(pendingTx.pendingTransaction.list).length
            ctx.$router.push({'name':'sign', params: {
                data:tx
            }});
        }else {
            ctx.$router.push('/account');
        }
    })
  })
}


const initializeSDK = (ctx, { network, current, account, wallet, activeAccount = 0, background },backgr = false) => {
    if(!backgr) {
        ctx.hideConnectError()
    }
    return new Promise (async (resolve,reject) => {
        if(!backgr) {
            postMesssage(background, { type: 'getKeypair' , payload: {  activeAccount, account } } ).then(async ({ res }) => {
                if(typeof res.error != 'undefined') {
                    resolve({error:true})
                } else {
                    res = parseFromStorage(res)
                    let sdk = await createSDKObject(ctx, { network, current, account, wallet, activeAccount, background, res },backgr)
                    resolve(sdk)
                }
            })
        }else {
            let sdk = await createSDKObject(ctx, { network, current, account, activeAccount, background, res: account },backgr)
            resolve(sdk)
        }
        
        
    })
}
let countErr = 0;
const createSDKObject = (ctx, { network, current, account, wallet, activeAccount = 0, background, res }, backgr ) => {
    return new Promise((resolve, reject) => {
        Universal({
            url: (typeof network != 'undefined' ? network[current.network].url : "https://sdk-testnet.aepps.com" ) , 
            internalUrl:(typeof network != 'undefined' ? network[current.network].internalUrl : "https://sdk-testnet.aepps.com" ),
            keypair:{ ...res },
            networkId: (typeof network != 'undefined' ? network[current.network].networkId : "ae_uat" ), 
            nativeMode: true,
            compilerUrl: (typeof network != 'undefined' ? network[current.network].compilerUrl : "https://compiler.aepps.com" )
        }).then((sdk) => {
            if(!backgr) {
                ctx.$store.dispatch('initSdk',sdk).then(() => {
                    ctx.hideLoader()
                })
            }
            resolve(sdk)
        })
        .catch(err => {
            if(!backgr) {
                ctx.hideLoader()
                ctx.showConnectError()
            }
            console.log(err)
            // reject(err)
            
            if(countErr < 3) {
                createSDKObject(ctx, { network, current, account, activeAccount, background, res },backgr)
            }else {
                reject({error:true})
            }
            countErr++
        })
    })
    
}


const  currencyConv = async (ctx) => {
    browser.storage.sync.get('convertTimer').then(async result => {
        var time = new Date().getTime();
      if ( !result.hasOwnProperty('convertTimer') || (result.hasOwnProperty('convertTimer') && (result.convertTimer == '' || result.convertTimer == 'undefined' || result.convertTimer <= time)) ) {
        const fetched = await fetchData('https://api.coingecko.com/api/v3/simple/price?ids=aeternity&vs_currencies=usd,eur,aud,ron,brl,cad,chf,cny,czk,dkk,gbp,hkd,hrk,huf,idr,ils,inr,isk,jpy,krw,mxn,myr,nok,nzd,php,pln,ron,rub,sek,sgd,thb,try,zar,xau','get','');
        browser.storage.sync.set({ rateUsd : fetched.aeternity.usd}).then(() => { });
        browser.storage.sync.set({ rateEur : fetched.aeternity.eur}).then(() => { });
        browser.storage.sync.set({ convertTimer : time+3600000}).then(() => { });
        browser.storage.sync.set({ allCurrencies : JSON.stringify(fetched.aeternity)}).then(() => { });
      }

      browser.storage.sync.get('rateUsd').then(resusd => {
        ctx.usdRate = resusd.rateUsd;
        ctx.toUsd = resusd.rateUsd * ctx.balance;
      });
      browser.storage.sync.get('rateEur').then(reseur => {
        ctx.eurRate = reseur.rateEur;
        ctx.toEur = reseur.rateEur * ctx.balance;
      });
      browser.storage.sync.get('allCurrencies').then(resall => {
        let ar = JSON.parse(resall.allCurrencies)
        ctx.allCurrencies = ar;
      });

    });
}

const convertAmountToCurrency = (currency, amount) => {
    return currency * amount
}

const contractEncodeCall = async (sdk,source, name, args = []) => {
    return await sdk.contractEncodeCall(source,name,args)
}

const contractDecodeData = async (sdk,source, fn, callValue, callResults, options = {}) => {
    return await sdk.contractDecodeData(source, fn, callValue, callResults, options)
}

const removeTxFromStorage = (id) => {
    return new Promise((resolve,reject) => {
        browser.storage.sync.get('pendingTransaction').then((data) => {
            browser.storage.sync.remove('showAeppPopup').then(() => {
                let list = {}
                if(data.hasOwnProperty("pendingTransaction") && data.pendingTransaction.hasOwnProperty("list")) {
                    list = data.pendingTransaction.list
                    delete list[id]
                }
                resolve(list)
            }); 
        });
    }) 
}

const checkAddress = (value) => {
    return Crypto.isAddressValid(value);
}

const isInt = (n) => {
    return n % 1 === 0;
}

const chekAensName = (value) => {
    return value.endsWith('.test');
}

const stringifyForStorage = state =>  {
    return JSON.stringify(state, (key, value) => {
        if (value instanceof ArrayBuffer) {
          return { type: 'ArrayBuffer', data: Array.from(new Uint8Array(value)) };
        }
        if (value instanceof Uint8Array) {
          return { type: 'Uint8Array', data: Array.from(value) };
        }
        return value;
    })
}
    
const parseFromStorage = state => {
    return JSON.parse(
        state,
        (key, value) => {
          if (value && value.type === 'ArrayBuffer') {
            return new Uint8Array(value.data).buffer;
          }
          if (value && value.type === 'Uint8Array') {
            return new Uint8Array(value.data);
          }
          if(value && value.type == 'Buffer' ) {
            return new Uint8Array(value.data);
          }
          
          return value;
        },
    );
}

const escapeCallParams = params => {
    return params.map(p => {
        if(typeof p == 'string' && !checkAddress(p)) {
            return `"${p}"`
        }else {
            return p.toString()
        }
    })
}

const addRejectedToken = async (token) => {
    let { rejected_token } = await browser.storage.sync.get('rejected_token')
    if (typeof rejected_token == 'undefined') {
        rejected_token = []
    }
    rejected_token.push(token)
    await browser.storage.sync.set({ rejected_token })
}

const contractCall = async ({ instance, method,  params = [], decode = false, async = true }) => {
    let call
    try {
        if(params.length) {
            call = await instance.methods[method](...params)
        } else {
            call = await instance.methods[method]()
        }
    }catch(e) {
        instance.setOptions({ backend: 'aevm'})
        return contractCall({ instance, method, params, decode, async })
    }

    return async ? (decode ? call.decodedResult : call ) : params.length ? instance.methods[method](...params) :  instance.methods[method]()
}

export { 
    shuffleArray, 
    convertToAE, 
    extractHostName, 
    fetchData, 
    detectBrowser, 
    setConnectedAepp, 
    checkAeppConnected, 
    redirectAfterLogin, 
    initializeSDK, 
    currencyConv, 
    convertAmountToCurrency, 
    contractEncodeCall, 
    contractDecodeData, 
    removeTxFromStorage,
    checkAddress,
    chekAensName,
    isInt,
    stringifyForStorage,
    parseFromStorage,
    escapeCallParams,
    addRejectedToken,
    contractCall
}


