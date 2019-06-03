<template>
  <div>
    <main>
      <div class="wrapper">
        <p>{{ heading }}</p>
        <div class="logo-center">
          <img :src="logo" alt="Waellet logo">
        </div>
      </div>
    </main>
    
    <div v-if="loading" class="loading">
      <div class="wrapper">
        <div class="center">
          <span>Securing your account</span>
          <br>
          <ae-loader />
        </div>
      </div>
    </div>
    
    <footer v-if="!loading">
      <div class="wrapper">
          <ae-button face="round" fill="primary" extend @click="generateAddress">Generate wallet</ae-button>
          <ae-button face="round" extend @click="modalVisible = true">Import secret key</ae-button>
      </div>
    </footer>

    <accountPassword 
      @clickAction="importPrivateKey" 
      :accountPasswordVisible="accountPasswordVisible"
      :secretKey="secretKey" />

    <ae-modal
      v-if="modalVisible"
      @close="modalVisible = false"
      title="Import secret key">

      <div class="tabs">
        <span @click="switchImportType('privateKey')" :class="{'tab-active':importType == 'privateKey'}">Private key</span>
        <span @click="switchImportType('keystore')"  :class="{'tab-active':importType == 'keystore'}">Keystore.json</span>
        <span @click="switchImportType('seedPhrase')"  :class="{'tab-active':importType == 'seedPhrase'}">Seed phrase</span>
      </div>

      <ae-input 
        label="Secret Key"
        v-if="importType == 'privateKey'" 
        v-model="secretKey" 
        v-bind="inputError"
        class="my-2" >
        <ae-toolbar slot="footer">
          This field is required
        </ae-toolbar>
      </ae-input>

      <input  type="file" v-if="importType == 'keystore'" placeholder="Upload keystore.json" class="my-2 input" />
      
      <div v-if="importType == 'seedPhrase'">
        <p>Enter your seed phrase. The one you wrote down during account creation. </p>
        <!--<ae-textarea  v-model="seedPhrase" placeholder="Enter seed phrase" class="my-2  input" />-->
          <ae-input label="Seed phrase" class="my-2" >
            <textarea class="textarea"
              slot-scope="{ context }"
              @focus="context.focus = true" 
              @blur="context.focus = false" 
            />
            <ae-toolbar slot="footer">
              This field is required
            </ae-toolbar>
          </ae-input>
      </div>

      <ae-button face="round" extend fill="secondary" @click="importShowPassword(secretKey)">Continue</ae-button>

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
      heading: '',
      modalVisible: false,
      logo: chrome.runtime.getURL('../../../icons/icon_128.png'),
      importType:'privateKey',
      showPassword: false,
      accountPasswordVisible:false,
      inputError:''
    };
  },
  locales,
  computed: {
    ...mapGetters(['account'])
  },
  mounted() {
    chrome.tabs.query(
      {
        active: true,
        lastFocusedWindow: true,
      },
      tabs => {
        this.heading = 'Welcome to waellet, to start interacting with aeternity blockchain:';
      }
    );
  },
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
    importPrivateKey: async function importPrivateKey({accountPassword,secretKey}) {
      this.modalVisible = false;
      this.loading = true;
      this.accountPasswordVisible = false;
      const keyPair = await addressGenerator.importPrivateKey(accountPassword, secretKey);
      chrome.storage.sync.set({userAccount: keyPair}, () => {
        this.$store.commit('UPDATE_ACCOUNT', keyPair);
        this.$router.push('/account');
      });
    },
    switchImportType(type) {
      this.importType = type;
    },
    importShowPassword(secretKey) {
      if(secretKey.length == 128) {
        this.accountPasswordVisible = true;
        this.modalVisible = false;
        this.inputError = '';
      }else {
        this.inputError = 'error';
      }
    }
  },
};
</script>

<style lang="scss" scoped>
@import '../../../common/base';
main {
  padding-top: 1rem;
  padding-bottom: 2rem;
}

.logo-center {
  display: flex;
  flex-flow: row wrap;
  justify-content: center;
}

.center {
  text-align: center;
}

.loading {
  display: flex;
  flex-flow: row wrap;
  justify-content: center;
}

.wrapper {
  max-width: 480px;
  -webkit-box-sizing: border-box;
  box-sizing: border-box;
  margin: 0 auto;
  padding: 0 3rem;
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
    &.tab-active {
      padding-bottom: 0;
      border-bottom: 2px solid #FF0D6A;
    }
    
  }
}


</style>