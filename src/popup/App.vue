<template>
  <ae-main>
    <header>
      <ae-header>
        <span slot="mobile-left">
          <div class="logo_top">
            <img :src="logo_top" alt="">
            <p>Waellet</p>
          </div>
        </span>

        <!-- network -->
        <ae-dropdown v-if="account.publicKey" slot="mobile-right" direction="right" class="mr-2">
          <ae-button slot="button" class="top-button">
            <p class="p-top status" v-if="currentNetwork == 'testnet'">
              Testnet
            </p>
            <p class="p-top status" v-if="currentNetwork == 'mainnet'">
              Mainnet
            </p>
          </ae-button>
          <li>
            <ae-button @click="switchNetwork('testnet')">
              <p :class="currentNetwork == 'testnet' ? 'status' : ''">
                Testnet
              </p>
            </ae-button>
          </li>
          <li>
            <ae-button @click="switchNetwork('mainnet')">
              <p :class="currentNetwork == 'mainnet' ? 'status' : ''">
                Mainnet
              </p>
            </ae-button>
          </li>
        </ae-dropdown>

        <!-- account -->
        <ae-dropdown v-if="account.publicKey" slot="mobile-right" direction="right">
          <ae-button slot="button" class="top-button">
            <p class="p-top">Account</p>
          </ae-button>
          <li>
            <ae-button @click="myAccount">
              <ae-icon fill="primary" name="globe" />
              My Account
            </ae-button>
          </li>
          <li>
            <ae-button @click="exportKeypair">
              <ae-icon name="globe" />
              Export keypair
            </ae-button>
          </li>
          <li>
            <ae-button @click="logout">
              <ae-icon name="globe" />
              Logout
            </ae-button>
          </li>
        </ae-dropdown>
      </ae-header>
    </header>
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
      logo_top: chrome.runtime.getURL('../../../icons/icon_48.png')
    }
  },
  computed: {
    ...mapGetters (['account', 'currentNetwork', 'network'])
  },
  methods: {
    switchNetwork (network) {
      this.$store.dispatch('switchNetwork', network).then(() => this.$store.dispatch('updateBalance'));
    },
    logout () {
      chrome.storage.sync.set({userAccount: ''}, () => {
        this.$store.commit('UPDATE_ACCOUNT', '');
        this.$router.push('/');
      });
    },

    myAccount () {
      this.$router.push('/account');
    },

    exportKeypair () {
      let blobData = JSON.stringify({"publicKey": this.account.publicKey, "secretKey": this.account.secretKey});
      let blob = new Blob([blobData], {type: "application/json;charset=utf-8"});
      saveAs(blob, "keypair.json");
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

</style>