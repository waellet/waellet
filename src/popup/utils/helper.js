import Universal from '@aeternity/aepp-sdk/es/ae/universal';
import { getHdWalletAccount } from './hdWallet';


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
          }
          return;
        });
      }else if(pendingTx.hasOwnProperty('pendingTransaction') && pendingTx.pendingTransaction.hasOwnProperty('data')) {
        ctx.$store.commit('SET_AEPP_POPUP',true)
        pendingTx.pendingTransaction.data.popup = false
        ctx.$router.push({'name':'sign', params: {
          data:pendingTx.pendingTransaction.data
        }});
      }else {
        ctx.$router.push('/account');
      }
    })
  })
}



const initializeSDK = (ctx, {network, current, account, wallet, activeAccount},background = false) => {
    return new Promise ((resolve,reject) => {
        Universal({
            url: network[current.network].url, 
            internalUrl: network[current.network].internalUrl,
            keypair: {
                publicKey: account.publicKey,
                secretKey: getHdWalletAccount(wallet,activeAccount).secretKey
            },
            networkId: network[current.network].networkId, 
            nativeMode: true,
            compilerUrl: 'https://compiler.aepps.com'
        }).then((sdk) => {
            if(!background) {
                ctx.$store.dispatch('initSdk',sdk).then(() => {
                    ctx.hideLoader()
                })
            }else {
                resolve(sdk)
            }
        })
    })
}

export { shuffleArray, convertToAE, extractHostName, fetchData, detectBrowser, setConnectedAepp, checkAeppConnected, redirectAfterLogin, initializeSDK }

