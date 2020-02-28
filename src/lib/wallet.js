import store from '../store';
import { postMessage } from '../popup/utils/connection';
import { parseFromStorage, swag } from '../popup/utils/helper';
import Universal from '@aeternity/aepp-sdk/es/ae/universal';
import { TOKEN_REGISTRY_CONTRACT_LIMA, TIPPING_CONTRACT, DEFAULT_NETWORK } from '../popup/utils/constants'
import Node from '@aeternity/aepp-sdk/es/node';
import MemoryAccount from '@aeternity/aepp-sdk/es/account/memory';

export default {
    store:null,
    countError:0,
    async init(cb) {
      
      let { userAccount } = await browser.storage.local.get('userAccount')
      if(userAccount) {
        const { isLogged } = await browser.storage.local.get('isLogged')
        try {
          userAccount.encryptedPrivateKey = JSON.parse(userAccount.encryptedPrivateKey);
        } catch (e) {
          userAccount.encryptedPrivateKey = JSON.stringify(userAccount.encryptedPrivateKey);
        }
        store.commit('UPDATE_ACCOUNT', userAccount);
        if(isLogged) {
            let sub = [];
            const { subaccounts } = await browser.storage.local.get('subaccounts');
            if (!subaccounts || (subaccounts && !subaccounts.find(f => f.publicKey == userAccount.publicKey))) {
              sub.push({
                name: 'Main Account',
                publicKey: userAccount.publicKey,
                root: true,
                balance: 0,
                aename: null
              });
            }
            if (subaccounts) sub = [...sub, ...subaccounts.filter(s => s.publicKey)];
            store.dispatch('setSubAccounts', sub);
            const { activeAccount } = await browser.storage.local.get('activeAccount')
            if(activeAccount) {
              store.commit('SET_ACTIVE_ACCOUNT', { publicKey: sub[activeAccount].publicKey, index: activeAccount });
            }
            
            // Get usernetworks
            const { userNetworks } = await browser.storage.local.get('userNetworks')
            if(userNetworks) {
              userNetworks.forEach(data => {
                store.state.network[data.name] = data;
              });
              store.dispatch('setUserNetworks', userNetworks);
            }
            store.commit('SWITCH_LOGGED_IN', true);
            this.redirectAfterLogin(cb)
            store.commit('SET_MAIN_LOADING', false);
        } else {
          store.commit('SET_MAIN_LOADING', false);
          cb()
        }
      } else {
        const { confirmSeed } = await browser.storage.local.get('confirmSeed');
        store.commit('SET_MAIN_LOADING', false);
        if (confirmSeed) cb('/seed');
        else cb();
      }
    },
    async initSdk(cb) {
      const keypair = await this.getKeyPair()
      if(typeof keypair.error === 'undefined') {
          const { network, current, subaccounts, getActiveAccount: { publicKey } } = store.getters;
          const node = await Node({ url: network[current.network].internalUrl, internalUrl: network[current.network].internalUrl });
          const keypairs = await Promise.all(subaccounts.map(async (account, activeAccount) => (
              parseFromStorage(await postMessage({ type: 'getKeypair', payload: { activeAccount, account } }))
          )))
          const accounts = keypairs.map((keypair) => (MemoryAccount({ keypair })))
          Universal({
              nodes: [{ name: DEFAULT_NETWORK, instance: node }],
              accounts,
              networkId: network[current.network].networkId, 
              nativeMode: true,
              compilerUrl: network[current.network].compilerUrl
          }).then(async (sdk) => {
            sdk.middleware = (await swag(network,current)).api
            await store.dispatch('initSdk',sdk)
            this.changeAccount(publicKey)
            store.commit('SET_NODE_STATUS', 'connected')
            this.initContractInstances()
          })
          .catch(err => {
            if(this.countError < 2) {
              this.initSdk(cb)
            } else {
              store.commit('SET_NODE_STATUS', 'error')
            }
            this.countError++
          })
      } else {
        this.logout(() => cb())
      }
    },
    changeAccount(address) { 
      store.getters.sdk.selectAccount(address)
    },
    async logout(cb) {
      await browser.storage.local.remove('isLogged')
      await browser.storage.local.remove('activeAccount')
      store.commit('SET_ACTIVE_ACCOUNT', {publicKey:'',index:0});
      store.commit('UNSET_SUBACCOUNTS');
      store.commit('UPDATE_ACCOUNT', {});
      store.commit('SWITCH_LOGGED_IN', false);
      cb()
    },
    async getKeyPair() {
      const activeAccount = store.getters.activeAccount
      const account = store.getters.account
      const res = await postMessage({ type: 'getKeypair', payload: { activeAccount, account } });
      return res.error ? { error: true } : parseFromStorage(res);
    },
    async initContractInstances() {
      store.commit('SET_NODE_STATUS', 'initServices')
      // init token registry
      try {
          await store.commit('SET_TOKEN_REGISTRY', 
            await store.getters.sdk.getContractInstance(store.getters.network[store.getters.current.network].networkId == "ae_uat" ? 
            TOKEN_REGISTRY_CONTRACT_LIMA : 
            TOKEN_REGISTRY_CONTRACT_LIMA, { contractAddress: store.getters.network[store.getters.current.network].tokenRegistry }) 
          )
      } catch (e) { console.log(e) }

      // init lima token registry
      try {
        await store.commit('SET_TOKEN_REGISTRY_LIMA', 
          await store.getters.sdk.getContractInstance(TOKEN_REGISTRY_CONTRACT_LIMA, { contractAddress: store.getters.network[store.getters.current.network].tokenRegistryLima }) 
        )
       
      } catch(e) { console.log(e) }

      // init tipping
      try {
        await store.commit('SET_TIPPING', 
          await store.getters.sdk.getContractInstance(TIPPING_CONTRACT, { contractAddress: store.getters.network[store.getters.current.network].tipContract }) 
        )
      } catch(e) { console.log(e) }

      setTimeout(() => store.commit('SET_NODE_STATUS', ''), 2000 )
      store.dispatch('getAllUserTokens')
    },
    redirectAfterLogin(cb){
      if(process.env.RUNNING_IN_POPUP) {
        store.commit('SET_AEPP_POPUP', true);
        const url = new URL(window.location.href);
        const type = url.searchParams.get('type');
        if (type) {
          if (type == 'connectConfirm') {
            cb('/connect');
          } else if (type == 'sign') {
            cb('/popup-sign-tx');
          } else if (type == 'askAccounts') {
            cb('/ask-accounts');
          } else if (type == 'messageSign') {
            cb('/message-sign');
          }
        }
      } else {
        browser.storage.local.get('showAeppPopup').then((aepp) => {
          browser.storage.local.get('pendingTransaction').then((pendingTx) => {
              if(aepp.hasOwnProperty('showAeppPopup') && aepp.showAeppPopup.hasOwnProperty('type') && aepp.showAeppPopup.hasOwnProperty('data') && aepp.showAeppPopup.type != "" ) {
                  browser.storage.local.remove('showAeppPopup').then(() => {
                      store.commit('SET_AEPP_POPUP',true)
                      if(aepp.showAeppPopup.data.hasOwnProperty("tx") && aepp.showAeppPopup.data.tx.hasOwnProperty("params")) {
                          aepp.showAeppPopup.data.tx.params = parseFromStorage(aepp.showAeppPopup.data.tx.params)
                      }
                      if(aepp.showAeppPopup.type == 'connectConfirm') {
                          aepp.showAeppPopup.data.popup = true
                          cb({'name':'connect-confirm', params: {
                          data:aepp.showAeppPopup.data
                          }});
                      }else if(aepp.showAeppPopup.type == 'txSign') {
                          aepp.showAeppPopup.data.popup = true
                          cb({'name':'sign', params: {
                          data:aepp.showAeppPopup.data
                          }});
                      }else if(aepp.showAeppPopup.type == 'contractCall') {
                          aepp.showAeppPopup.data.popup = true
                          cb({'name':'sign', params: {
                            data:aepp.showAeppPopup.data
                          }})
                      }else if(aepp.showAeppPopup.type == 'signMessage') {
                          aepp.showAeppPopup.data.popup = true
                          cb({'name':'sign-verify-message', params: {
                            data:aepp.showAeppPopup.data
                          }})
                      }
                      return;
                  });
              }else if(pendingTx.hasOwnProperty('pendingTransaction') && pendingTx.pendingTransaction.hasOwnProperty('list') && Object.keys(pendingTx.pendingTransaction.list).length > 0) {
                  store.commit('SET_AEPP_POPUP',true)
                  let tx = pendingTx.pendingTransaction.list[Object.keys(pendingTx.pendingTransaction.list)[0]];
                  tx.popup = false
                  tx.countTx =  Object.keys(pendingTx.pendingTransaction.list).length
                  cb({'name':'sign', params: {
                    data:tx
                  }})
              }else {
                  cb('/account')
              }
          })
        })
      }
      
    }
}