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

    <!-- <accountPassword @clickAction="importPrivateKey" :accountPasswordVisible="accountPasswordVisible" :data="accountPasswordData" :confirmPassword="confirmPassword" buttonTitle="Import" />
     -->
    <ae-modal 
      v-if="modalVisible"
      @close="modalVisible = false"
      title="Import waellet">

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
    ...mapGetters(['account','isLoggedIn'])
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
      chrome.storage.sync.get('isLogged', data => {
        
        chrome.storage.sync.get('userAccount', user => {
            if(user.userAccount && user.hasOwnProperty('userAccount')) {
              try {
                user.userAccount.encryptedPrivateKey = JSON.parse(user.userAccount.encryptedPrivateKey);
              }catch(e) {
                user.userAccount.encryptedPrivateKey = JSON.stringify( user.userAccount.encryptedPrivateKey );
              }
              this.$store.commit('UPDATE_ACCOUNT', user.userAccount);
            } 
            chrome.storage.sync.get('confirmSeed', seed => {
              if(seed.hasOwnProperty('confirmSeed') && seed.confirmSeed == false) {
                
                this.$router.push('/seed');
                return;
              }
            });
            if (data.isLogged && data.hasOwnProperty('isLogged')) {
              this.$store.commit('SWITCH_LOGGED_IN', true);
              this.$router.push('/account');
            }
        });
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
                console.log(e.target.result);
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
                  try {
                    JSON.parse(user.userAccount.encryptedPrivateKey);
                  }catch(e) {
                    user.userAccount.encryptedPrivateKey = JSON.stringify( user.userAccount.encryptedPrivateKey );
                  }
                  let encryptedPrivateKey = JSON.parse(user.userAccount.encryptedPrivateKey);
                  let match = await decrypt(encryptedPrivateKey.crypto.ciphertext,accountPassword,encryptedPrivateKey.crypto.cipher_params.nonce,encryptedPrivateKey.crypto.kdf_params.salt);
                  user.userAccount.encryptedPrivateKey = JSON.stringify( user.userAccount.encryptedPrivateKey );
                  if(match) {
                      this.loginError = false;
                      this.inputError = {};
                      chrome.storage.sync.set({isLogged: true}, () => {
                          this.$store.commit('SWITCH_LOGGED_IN', true);
                          this.$router.push('/account');
                      });
                  }else {
                      this.loginError = true;
                      this.inputError = {error:''};
                  }
                  context.loading = false;
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


</style>