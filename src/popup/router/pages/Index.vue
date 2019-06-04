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
    
    <div v-if="loading" class="loading">
      <div class="wrapper">
        <div class="center">
          <span>{{ language.strings.securingAccount }}</span>
          <br>
          <ae-loader />
        </div>
      </div>
    </div>
    
    <footer v-if="!loading">
      <div class="wrapper">
          <ae-button face="round" fill="primary" extend @click="generateAddress">{{ language.buttons.generateWallet }}</ae-button>
          <ae-button face="round" extend @click="modalVisible = true">{{ language.buttons.importPrivateKey }}</ae-button>
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

      <ae-input label="Upload keystore.json" v-if="importType == 'keystore'" class="my-2" v-bind="inputError">
        <input type="file" @change="uploadWallet" ref="walletFile" class="ae-input" slot-scope="{ context }" @focus="context.focus = true" @blur="context.focus = false" />
        <ae-toolbar slot="footer">{{errorMsg}}</ae-toolbar>
      </ae-input>
      
      <div v-if="importType == 'seedPhrase'">
        <p>Enter your seed phrase. The one you wrote down during account creation. </p>
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
      errorMsg:'This field is requried!'
    };
  },
  computed: {
    ...mapGetters(['account'])
  },
  mounted() {},
  created () {
    this.init();
  },
  methods: {
    init () {
      // check if there is an account generated already
      chrome.storage.sync.get('userAccount', data => {
        this.$store.commit('UPDATE_ACCOUNT', data.userAccount);
        if (data.userAccount && data.userAccount.hasOwnProperty('publicKey')) {
          this.$router.push('/account');
        }
      });
    },
    generateAddress: async function generateAddress({ dispatch }) {
      this.loading = true;
      const keyPair = await addressGenerator.generateKeyPair('test');
      chrome.storage.sync.set({userAccount: keyPair}, () => {
        this.$store.commit('UPDATE_ACCOUNT', keyPair);
        this.$router.push('/account');
      });
    },
    switchImportType(type) {
      this.importType = type;
      this.errorMsg = "This field is requried! ";
      this.inputError = {}; 
    },
    checkSeed(seed) {
      return true;
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
                context.$router.push({name:'password',params:{
                    confirmPassword:false,
                    data:e.target.result,
                    buttonTitle:'Import',
                    type:importType,
                    title:'Import From Keystore.json'
                }});
                context.modalVisible = false;
              }catch(err) {
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
    }
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
.tabs, .date {
    margin-left: rem(-48px);
    margin-right: rem(-48px);
    padding-left: rem(48px);
}
.tabs {
  box-shadow: 0 4px 2px -2px rgba(27, 68, 121, 0.1);
  span {
    cursor: pointer;
    display:inline-block;
    width:32%;
    font-weight: bold;
    text-align: center;
    color: #203040;
    padding-bottom:5px;
    &.tab-active {
      border-bottom: 2px solid #FF0D6A;
    }
    
  }
}


</style>