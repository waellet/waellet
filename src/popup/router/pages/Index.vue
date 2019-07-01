<template>
  <div>
    <main>
      <div class="wrapper">
        <p>{{ language.pages.index.heading }}</p>
        <div class="logo-center">
          <img :src="logo" alt="Waellet logo">
        </div>
      </div>
    </main>
    
    <Loader :loading="loading" v-bind="{'content':language.strings.securingAccount}"></Loader>
    <footer v-if="!loading">
      <div class="wrapper">
          <div v-if="account.encryptedPrivateKey">
            <ae-input  placeholder="" class="my-2" label="Password" v-bind="inputError">
                <input type="password" class="ae-input" min="4"  v-model="accountPassword" slot-scope="{ context }" @focus="context.focus = true" @blur="context.focus = false" />
                <ae-toolbar v-if="errorMsg == 'length'" slot="footer">Password must be at lest 4 symbols! </ae-toolbar>
                <ae-toolbar v-if="loginError" slot="footer">Incorrect password !</ae-toolbar>
            </ae-input>
            <ae-button face="round" extend fill="primary" @click="login({accountPassword})">Login</ae-button>
            <ae-divider />
          </div>
          <ae-button face="round" v-if="!account.encryptedPrivateKey" fill="primary" class="mb-1" extend @click="generateAddress">{{ language.buttons.generateWallet }}</ae-button>
          <ae-button face="round" extend @click="openImportModal" class="importBtn">{{ language.buttons.importPrivateKey }}</ae-button>
      </div>
    </footer>

    <ae-modal 
      v-if="modalVisible"
      @close="modalVisible = false">
      <h2 class="modaltitle">Import waellet</h2>

      <div class="tabs">
        <span @click="switchImportType('privateKey')" :class="{'tab-active':importType == 'privateKey'}">Private key</span>
        <span @click="switchImportType('keystore')"  :class="{'tab-active':importType == 'keystore'}">Keystore.json</span>
        <span @click="switchImportType('seedPhrase')"  :class="{'tab-active':importType == 'seedPhrase'}">Seed phrase</span>
      </div>

      <ae-input label="Secret Key" v-if="importType == 'privateKey'" v-model="privateKey" v-bind="inputError" class="my-2" >
        <ae-toolbar slot="footer">{{errorMsg}}</ae-toolbar>
      </ae-input>

      <div v-if="importType == 'keystore'" class="walletFileHolder" :class="{'walletFileHolderError':inputError.hasOwnProperty('error')}">
        <label for="walletFile" class="customFileUpload my-2 ae-input-box">
          <div class="file-label"> Choose file</div>
          <div class="file-input">{{walletFile !='' ? walletFile.name : ''}}</div>
          <div class="file-toolbar">{{errorMsg}}</div>
        </label>
        
        <input type="file" id="walletFile" @change="uploadWallet" ref="walletFile" class="ae-input" />
      </div>
      
      <div v-if="importType == 'seedPhrase'">
        <p class="importTitle">Enter your seed phrase. The one you wrote down during account creation. </p>
        <ae-input label="Seed phrase" class="my-2" v-bind="inputError">
            <textarea class="ae-input textarea" v-model="seedPhrase" slot-scope="{ context }" @focus="context.focus = true" @blur="context.focus = false" />
            <ae-toolbar slot="footer">{{errorMsg}}</ae-toolbar>
        </ae-input>
      </div>

      <ae-button face="round" extend fill="primary" @click="importShowPassword({importType,privateKey,seedPhrase})">Continue</ae-button>

      <!--<ae-button face="round" disabled extend fill="seconday" @click="importPrivateKey(secretKey)">Import</ae-button>-->
    </ae-modal>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import locales from '../../locales/locales.json';
import { addressGenerator } from '../../utils/address-generator';
import { decrypt } from '../../utils/keystore';
import { generateMnemonic, mnemonicToSeed, validateMnemonic } from '@aeternity/bip39';
import { generateHdWallet, getHdWalletAccount } from '../../utils/hdWallet'

export default {
  name: 'Home',
  data() {
    return {
      loading: false,
      language: locales['en'],
      modalVisible: false,
      logo: chrome.runtime.getURL('../../../icons/icon_128.png'),
      privateKey:'',
      seedPhrase:'',
      importType:'privateKey',
      inputError:{},
      walletFile:'',
      errorMsg:'This field is requried!',
      errorMsg:'',
      loginError:false,
      accountPassword:''
    };
  },
  computed: {
    ...mapGetters(['account','isLoggedIn','wallet'])
  },
  mounted() {},
  created () {
    this.init();
  },
  methods: {
    init () {
      // check if there is an account generated already
      // chrome.storage.sync.set({userAccount: ''}, () => {});
      // chrome.storage.sync.set({isLogged: ''}, () => {});
      // chrome.storage.sync.set({confirmSeed: true}, () => {});
      // chrome.storage.sync.set({mnemonic: ''}, () => {});
      // chrome.storage.sync.remove('subaccounts', () => {});
      
      var newTab = false;
      chrome.storage.sync.get('showAeppPopup', data => {
        
        if(data.hasOwnProperty('showAeppPopup') && data.showAeppPopup.hasOwnProperty('type') && data.showAeppPopup.hasOwnProperty('data') && data.showAeppPopup.type != "" ) {
          
          chrome.storage.sync.set({showAeppPopup:{}}, () => {
            if(data.showAeppPopup.type == 'confirm') {
              this.$router.push({'name':'confirm-share', params: {
                data:data.showAeppPopup.data
              }});
            }else if(data.showAeppPopup.type == 'sign') {
              this.$router.push({'name':'sign', params: {
                data:data.showAeppPopup.data
              }});
            }
            return;
          });
        }else {
          chrome.storage.sync.get('pendingTransaction', data => {
              
              if(data.hasOwnProperty('pendingTransaction') && data.pendingTransaction.hasOwnProperty('data')) {
                this.$router.push({'name':'sign', params: {
                  data:data.pendingTransaction.data
                }});
              }else {
                chrome.storage.sync.get('isLogged', data => {
                  chrome.storage.sync.get('userAccount', user => {
                      if(user.userAccount && user.hasOwnProperty('userAccount')) {
                        try {
                          user.userAccount.encryptedPrivateKey = JSON.parse(user.userAccount.encryptedPrivateKey);
                        }catch(e) {
                          user.userAccount.encryptedPrivateKey = JSON.stringify( user.userAccount.encryptedPrivateKey );
                        }
                        this.$store.commit('UPDATE_ACCOUNT', user.userAccount);
                        if (data.isLogged && data.hasOwnProperty('isLogged')) {
                          chrome.storage.sync.get('subaccounts', subaccounts => {
                            let sub = [];
                            if(!subaccounts.hasOwnProperty('subaccounts') || subaccounts.subaccounts == "" || ( typeof subaccounts.subaccounts == 'object' && !subaccounts.subaccounts.find(f => f.publicKey == user.userAccount.publicKey))) {
                              sub.push({
                                name: typeof subaccounts.subaccounts != 'undefined' ? subaccounts.subaccounts.name : "Main account",
                                publicKey:  user.userAccount.publicKey, 
                                root:true, 
                                balance:0
                              });
                            }
                            if(subaccounts.hasOwnProperty('subaccounts') && subaccounts.subaccounts.length > 0 && subaccounts.subaccounts != "") {
                              subaccounts.subaccounts.forEach(su => {
                                sub.push({...su});
                              });
                            }
                            this.$store.dispatch('setSubAccounts', sub);
                            chrome.storage.sync.get('activeAccount', active => {
                              if(active.hasOwnProperty('activeAccount')) {
                                this.$store.commit('SET_ACTIVE_ACCOUNT', {publicKey:sub[active.activeAccount].publicKey,index:active.activeAccount});
                              }
                            });
                          });
                        }
                      } 
                      chrome.storage.sync.get('confirmSeed', seed => {
                        if(seed.hasOwnProperty('confirmSeed') && seed.confirmSeed == false) {
                          
                          this.$router.push('/seed');
                          return;
                        }
                      });
                      if (data.isLogged && data.hasOwnProperty('isLogged')) {
                        chrome.storage.sync.get('wallet',wallet => {
                          if(wallet.hasOwnProperty('wallet') && wallet.wallet != "") {
                            this.$store.commit('SET_WALLET', JSON.parse(wallet.wallet));
                            this.$store.commit('SWITCH_LOGGED_IN', true);
                            
                            this.$router.push('/account');
                          }
                        });
                      }
                  });
                });
              }
          });
          
        }
      });
      
    },
    generateAddress: async function generateAddress({ dispatch }) {
        this.$router.push({name:'password',params:{
          confirmPassword:true,
          data:'',
          buttonTitle:'Continue',
          type:'generateEncrypt',
          title:'Protect Account with Password'
        }});
    },
   
    switchImportType(type) {
      this.importType = type;
      this.errorMsg = "This field is requried! ";
      this.inputError = {}; 
    },
    checkSeed(seed) {
      return validateMnemonic(seed);
    },
    uploadWallet() {
      this.walletFile = this.$refs.walletFile.files[0];
    },
    importShowPassword({importType,privateKey,seedPhrase}) {
      if(importType == 'privateKey') {
        if(privateKey.length == 128) {
          this.$router.push({name:'password',params:{
            confirmPassword:true,
            data:privateKey,
            buttonTitle:'Import',
            type:importType,
            title:'Import From Private Key'
          }});
          this.modalVisible = false;
          this.inputError = {}; 
        }else {
          this.inputError = {error:''};
          this.errorMsg = "Private key is incorrect! ";
        }
      }else if(importType == 'seedPhrase') {
        let seed = seedPhrase.split(" ");
        if(seed.length == 12 && this.checkSeed(seedPhrase)) {
            this.$router.push({name:'password',params:{
              confirmPassword:true,
              data:seedPhrase,
              buttonTitle:'Restore',
              type:importType,
              title:'Import From Seed Phrase'
            }});
            this.modalVisible = false;
            this.inputError = {};
        }else {
            this.inputError = {error:''};
            this.errorMsg = "Incorrect seed phrase! ";
        }
      }else if(importType == 'keystore') {
          if(this.walletFile != "") {
            let reader = new FileReader();
            let context = this;
            reader.onload = function(e){
              try {
                let keystore = JSON.parse(e.target.result);
                context.inputError = {};
                if(keystore.crypto.ciphertext.length && keystore.crypto.cipher_params.nonce && keystore.crypto.kdf_params.salt.length){
                    context.$router.push({name:'password',params:{
                      confirmPassword:false,
                      data:e.target.result,
                      buttonTitle:'Import',
                      type:importType,
                      title:'Import From Keystore.json'
                  }});
                  context.modalVisible = false;
                }else {
                  context.inputError = {error:''};
                  context.errorMsg = "Invalid file format! ";
                }
              }catch(err) {
                console.log(err);
                 context.inputError = {error:''};
                 context.errorMsg = "Invalid file format! ";
              }
            }
            reader.readAsText(this.walletFile);
          }else {
             this.inputError = {error:''};
             this.errorMsg = "Plese upload keystore.json file! ";
          }
      }
    },
    openImportModal() {
      this.modalVisible = true;
      this.inputError = {};
      this.errorMsg = "This field is requried! ";
    },
    login: async function login ({accountPassword}) {
        let context = this;
        if(accountPassword.length >= 4){
          context.loading = true;
          chrome.storage.sync.get('userAccount', async user => {
              this.errorMsg = "";
              if(user.userAccount && user.hasOwnProperty('userAccount')) {
                  let encPrivateKey = user.userAccount.encryptedPrivateKey;
                  try {
                    JSON.parse(user.userAccount.encryptedPrivateKey);
                  }catch(e) {
                    user.userAccount.encryptedPrivateKey = JSON.stringify( user.userAccount.encryptedPrivateKey );
                    encPrivateKey = JSON.stringify( user.userAccount.encryptedPrivateKey );
                  }
                  let encryptedPrivateKey = JSON.parse(user.userAccount.encryptedPrivateKey);
                  let match = await decrypt(encryptedPrivateKey.crypto.ciphertext,accountPassword,encryptedPrivateKey.crypto.cipher_params.nonce,encryptedPrivateKey.crypto.kdf_params.salt);
                  user.userAccount.encryptedPrivateKey = JSON.stringify( user.userAccount.encryptedPrivateKey );
                  if(match !== false) {
                      this.loginError = false;
                      this.inputError = {};
                      let wallet = generateHdWallet(match);
                      let address = getHdWalletAccount(wallet).address;
                      let sub = [];
                      let account = {
                          name:'Main account',
                          publicKey:address,
                          balance:0,
                          root:true
                      };
                      chrome.storage.sync.set({isLogged: true}, () => {
                        chrome.storage.sync.set({wallet:JSON.stringify(wallet)},() => {
                          if(address !== user.userAccount.publicKey) {
                              user.userAccount.publicKey = address;
                              user.userAccount.encryptedPrivateKey = encPrivateKey;
                              chrome.storage.sync.set({userAccount:  user.userAccount}, () => {
                                sub.push(account);
                                chrome.storage.sync.set({subaccounts:sub }, () => {
                                  chrome.storage.sync.set({activeAccount: 0}, () => {
                                    this.$store.commit('SET_ACTIVE_ACCOUNT', {publicKey:account.publicKey,index:0});
                                    this.$store.dispatch('setSubAccounts',sub);
                                    this.$store.commit('SET_WALLET', wallet);
                                    this.$store.commit('SWITCH_LOGGED_IN', true);
                                    this.$router.push('/account');
                                  });
                                });
                              });
                              return;
                          }
                          chrome.storage.sync.get('subaccounts',subaccounts => {
                            if((subaccounts.hasOwnProperty('subaccounts') && subaccounts.subaccounts == "") ||  !subaccounts.hasOwnProperty('subaccounts')){
                              sub.push(account);
                              chrome.storage.sync.set({subaccounts:sub }, () => {
                                  chrome.storage.sync.set({activeAccount: 0}, () => {
                                    this.$store.commit('SET_ACTIVE_ACCOUNT', {publicKey:account.publicKey,index:0});
                                  });
                              });
                            }else {
                              sub = subaccounts.subaccounts;
                            }
                            this.$store.dispatch('setSubAccounts',sub).then(() => {
                              this.$store.commit('SET_WALLET', wallet);
                              this.$store.commit('SWITCH_LOGGED_IN', true);
                              this.$router.push('/account');
                            });
                          });
                        });
                      });
                  }else {
                      this.loginError = true;
                      this.inputError = {error:''};
                  }
                  this.loading = false;
              }
          });
        }else {
          this.errorMsg = "length";
          this.inputError = {error:''};
          context.loading = false;
        }
    },
  },
};
</script>

<style lang="scss" scoped>
@import '../../../common/base';

.logo-center {
  display: flex;
  flex-flow: row wrap;
  justify-content: center;
}

#walletFile { display:none; }
.walletFileHolder {
  border-left:2px solid transparent;
  &.walletFileHolderError {
    border-left:2px solid $input-border-color;
  }
}
.importTitle { 
    font-size: 1.5rem;
    font-weight: 500;
}

.modaltitle {
  position: absolute;
  top: 0;
  left: 50%;
  transform: translate(-50%, 0);
}
</style>