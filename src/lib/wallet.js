import store from '../store';
import { postMesssage } from '../popup/utils/connection';
import { parseFromStorage, swag } from '../popup/utils/helper';
import Universal from '@aeternity/aepp-sdk/es/ae/universal';
import {  TOKEN_REGISTRY_CONTRACT_LIMA, TIPPING_CONTRACT } from '../popup/utils/constants'

export default {
    store:null,
    countError:0,
    init(cb) {
        browser.storage.local.get('isLogged').then(data => {
            browser.storage.local.get('userAccount').then(async user => {
              if (user.userAccount && user.hasOwnProperty('userAccount')) {
                try {
                  user.userAccount.encryptedPrivateKey = JSON.parse(user.userAccount.encryptedPrivateKey);
                } catch (e) {
                  user.userAccount.encryptedPrivateKey = JSON.stringify(user.userAccount.encryptedPrivateKey);
                }
                store.commit('UPDATE_ACCOUNT', user.userAccount);
                if (data.isLogged && data.hasOwnProperty('isLogged')) {
                  browser.storage.local.get('subaccounts').then(subaccounts => {
                    let sub = [];
                    if (
                      !subaccounts.hasOwnProperty('subaccounts') ||
                      subaccounts.subaccounts == '' ||
                      (typeof subaccounts.subaccounts == 'object' && !subaccounts.subaccounts.find(f => f.publicKey == user.userAccount.publicKey))
                    ) {
                      sub.push({
                        name: typeof subaccounts.subaccounts != 'undefined' ? subaccounts.subaccounts.name : 'Main account',
                        publicKey: user.userAccount.publicKey,
                        root: true,
                        balance: 0,
                      });
                    }
                    if (subaccounts.hasOwnProperty('subaccounts') && subaccounts.subaccounts.length > 0 && subaccounts.subaccounts != '') {
                      subaccounts.subaccounts.forEach(su => {
                        sub.push({ ...su });
                      });
                    }
                    store.dispatch('setSubAccounts', sub);
                    browser.storage.local.get('activeAccount').then(active => {
                      if (active.hasOwnProperty('activeAccount')) {
                        store.commit('SET_ACTIVE_ACCOUNT', { publicKey: sub[active.activeAccount].publicKey, index: active.activeAccount });
                      }
                    });
                  });
    
                  // Get user networks
                  browser.storage.local.get('userNetworks').then(usernetworks => {
                    if (usernetworks.hasOwnProperty('userNetworks')) {
                      usernetworks.userNetworks.forEach(data => {
                        store.state.network[data.name] = data;
                      });
                      store.dispatch('setUserNetworks', usernetworks.userNetworks);
                    }
                  });
                  store.commit('SWITCH_LOGGED_IN', true);
                  this.redirectAfterLogin(cb) //ger rid of this when update to sdk7

                  store.commit('SET_MAIN_LOADING', false);
                } else {
                  store.commit('SET_MAIN_LOADING', false);
                  cb()
                }
              } else {
                browser.storage.local.get('confirmSeed').then(seed => {
                  store.commit('SET_MAIN_LOADING', false);
                  if (seed.hasOwnProperty('confirmSeed') && seed.confirmSeed == false) {
                    cb('/seed')
                  } else {
                    cb()
                  }
                });
              }
            });
        });
    },
    async initSdk(cb) {
      const keypair = await this.getKeyPair()
      if(typeof keypair.error === 'undefined') {
          const network = store.getters.network
          const current = store.getters.current
          Universal({
              url: network[current.network].url , 
              internalUrl: network[current.network].internalUrl,
              keypair,
              networkId: network[current.network].networkId, 
              nativeMode: true,
              compilerUrl: network[current.network].compilerUrl
          }).then(async (sdk) => {
            sdk.middleware = (await swag(network,current)).api
            await store.dispatch('initSdk',sdk)
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
    async logout(cb) {
      await browser.storage.local.remove('isLogged')
      await browser.storage.local.remove('activeAccount')
      store.commit('SET_ACTIVE_ACCOUNT', {publicKey:'',index:0});
      store.commit('UNSET_SUBACCOUNTS');
      store.commit('UPDATE_ACCOUNT', {});
      store.commit('SWITCH_LOGGED_IN', false);
      cb()
    },
    getKeyPair() {
      const activeAccount = store.getters.activeAccount
      const account = store.getters.account
      return new Promise((resolve, reject) => {
        postMesssage(store.getters.background, { type: 'getKeypair' , payload: {  activeAccount, account } } ).then(async ({ res }) => {
          if(typeof res.error != 'undefined') {
              resolve({ error:true })
          } else {
              res = parseFromStorage(res)
              resolve(res)
          }
        })
      })
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