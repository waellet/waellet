import store from '../store';
export default {
    store:null,
    initSdk() {
      // init sdk here
    },
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
                  // redirectAfterLogin(this);
                  cb('/account')
                  store.commit('SET_MAIN_LOADING', false);
                } else {
                  store.commit('SET_MAIN_LOADING', false);
                  cb()
                }
              } else {
                browser.storage.local.get('confirmSeed').then(seed => {
                  if (seed.hasOwnProperty('confirmSeed') && seed.confirmSeed == false) {
                    // this.$router.push('/seed');
                    // return;
                    cb('/seed')
                  } else {
                    cb()
                  }
                });
              }
            });
        });
    }
}