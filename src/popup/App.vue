<template>
  <ae-main>
    <header>
      <ae-header>
        <span slot="mobile-left">
          <div class="logo_top">
            <img :src="logo_top" alt="">
            <p>{{ language.system.name }}</p>
          </div>
        </span>

        <!-- network -->
        <ae-dropdown v-if="account.publicKey && isLoggedIn" slot="mobile-right" direction="right" class="mr-2">
          <ae-button slot="button" class="top-button">
            <p class="p-top status" v-if="current.network == 'testnet'">
              {{ language.networks.testnet }}
            </p>
            <p class="p-top status" v-if="current.network == 'mainnet'">
              {{ language.networks.mainnet }}
            </p>
          </ae-button>
          <li>
            <ae-button @click="switchNetwork('testnet')">
              <p :class="current.network == 'testnet' ? 'status' : ''">
                {{ language.networks.testnet }}
              </p>
            </ae-button>
          </li>
          <li>
            <ae-button @click="switchNetwork('mainnet')">
              <p :class="current.network == 'mainnet' ? 'status' : ''">
                {{ language.networks.mainnet }}
              </p>
            </ae-button>
          </li>
        </ae-dropdown>

        <!-- account -->
        <ae-dropdown v-if="account.publicKey && isLoggedIn" slot="mobile-right" direction="right">
          <ae-button slot="button" class="top-button">
            <p class="p-top">{{ language.strings.account }}</p>
          </ae-button>
          <li>
            <ae-button @click="myAccount">
              <ae-icon fill="primary" name="globe" />
              {{ language.strings.myAccount }}
            </ae-button>
          </li>
          <li>
            <ae-button @click="exportKeypair('keypair')">
              <ae-icon name="globe" />
              {{ language.strings.exportKeypair }}
            </ae-button>
          </li>
          <li>
            <ae-button @click="exportKeypair('keystore')">
              <ae-icon name="globe" />
              Export keystore.json
            </ae-button>
          </li>
          <li>
            <ae-button @click="logout">
              <ae-icon name="globe" />
              {{ language.strings.logout }}
            </ae-button>
          </li>
        </ae-dropdown>
      </ae-header>
    </header>
    
    
   
    <ae-modal-light
        v-if="popup.show"
        @close="closePopup"
        :title="popup.title"
      >
        {{popup.msg}}
        <ae-button
          size="small"
          type="exciting"
          class="popup-button"
          face="round"
          :fill="popupButtonFill"
          uppercase
          @click.native="closePopup"
          slot="buttons"
        >OK</ae-button>
      </ae-modal-light>
    <router-view></router-view>
  </ae-main>
</template>

<script>
import store from '../store';
import locales from './locales/locales.json'
import { mapGetters } from 'vuex';
import { saveAs } from 'file-saver';

export default {
  data () {
    return {
      logo_top: chrome.runtime.getURL('../../../icons/icon_48.png'),
      language: locales['en']
    }
  },
  computed: {
    ...mapGetters (['account', 'current', 'network','popup','isLoggedIn']),
    popupButtonFill(){
      return this.popup.type == 'error' ? 'primary' : 'alternative';
    }
  },
  methods: {
    switchNetwork (network) {
      this.$store.dispatch('switchNetwork', network).then(() => this.$store.dispatch('updateBalance'));
    },
    logout () {
      chrome.storage.sync.set({isLogged: false}, () => {
        this.$store.commit('UPDATE_ACCOUNT', '');
        this.$store.commit('SWITCH_LOGGED_IN', false);
        this.$router.push('/');
      });
    },
    closePopup() {
      this.$store.commit('HIDE_POPUP');
    },
    popupAlert(payload) {
      this.$store.dispatch('popupAlert', payload)
    },
    myAccount () {
      this.$router.push('/account');
    },
    exportKeypair (type) {
      if(type == 'keypair'){
        let blobData = JSON.stringify({"publicKey": this.account.publicKey, "secretKey": this.account.secretKey});
        let blob = new Blob([blobData], {type: "application/json;charset=utf-8"});
        saveAs(blob, "keypair.json");
      }else if(type == 'keystore') {
         let blobData = this.account.encryptedPrivateKey;
        let blob = new Blob([blobData], {type: "application/json;charset=utf-8"});
        saveAs(blob, "keystore.json");
      }
      
    }
  }
};
</script>

<style lang="scss">
@import '../common/base';

.ae-button {
  margin-bottom: 1em;
}

.top-button {
  border: 1px solid #555 !important;
  padding: 4px !important;
  border-radius: 8px;
  margin-right: 2px;
}

.ae-dropdown-button {
  margin-right: 3px;
}

html {
  min-width: 357px;
  min-height: 600px;
  background-color: #f5f5f5;
}

.logo_top {
  display: flex;
  flex-flow: row wrap;
  justify-content: center;
  vertical-align: center;
}

.logo_top p {
  font-size: 20px;
  line-height: 12px;
}

p {
  font-weight: bolder;
  margin-left: 3px;
}

.p-top {
  font-size: 16px;
  margin-right: 2px;
  display: contents;
}

.mr-2 {
  margin-right: 2em;
}

.popup {
  color: #555;
  padding: 4px;
  text-align: center;
  font-size: 16px;
  word-break: break-all;
  word-wrap: break-word;
}

p.status::before {
  content: '';
  display: inline-block;
  width: 8px;
  height: 8px;
  -moz-border-radius: 7.5px;
  -webkit-border-radius: 7.5px;
  border-radius: 7.5px;
  margin-right: 2px;
  border: 1px solid green;
  background-color: greenyellow;
}
.popup-button { 
  width:100px !important;
}
</style>