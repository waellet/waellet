<template>
  <div class="popup">
    <main>
      <div class="wrapper">
        {{ heading }}
      </div>
    </main>
    <div v-if="loading" class="loading">
      <ae-loader />
    </div>
    <footer>
      <div class="wrapper">
          <ae-button face="round" fill="primary" extend @click="generateAddress">Generate wallet</ae-button>
          <ae-button face="round" extend @click="importPrivateKey">Import secret key</ae-button>
      </div>
    </footer>
  </div>
</template>

<script>
import locales from '../../locales/locales.json';
import store from '../../../store';
import { addressGenerator } from '../../utils/address-generator';
import { AeLoader, AeButton, mixins } from '@aeternity/aepp-components';

export default {
  name: 'Home',
  mixins: [mixins.events],
  components: {
    AeLoader,
    AeButton
  },
  data() {
    return {
      loading: false,
      heading: '',
      account: {},
    };
  },
  locales,
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
        console.log('got user account');
        console.log(data.userAccount);
        if (data.userAccount && data.userAccount.hasOwnProperty('publicKey')) {
          this.$router.push('/account');
        }
      });
    },
    generateAddress: async function generateAddress({ dispatch }) {
      this.loading = true;
      const keyPair = await addressGenerator.generateKeyPair('test');
      chrome.storage.sync.set({userAccount: keyPair}, () => {
        console.log(keyPair);
        console.log('Account saved');
        this.$router.push('/account');
      });
    },
    importPrivateKey: function importPrivateKey() {
      alert('Not working yet.');
    },
  },
};
</script>

<style lang="scss" scoped>
@import '../../../../node_modules/@aeternity/aepp-components/dist/aeLoader/aeLoader.css';
@import '../../../../node_modules/@aeternity/aepp-components/dist/ae-button/ae-button.css';
@import '../../../common/base';

main {
  padding-top: 1rem;
  padding-bottom: 2rem;
}

.wrapper {
  max-width: 480px;
  -webkit-box-sizing: border-box;
  box-sizing: border-box;
  margin: 0 auto;
  padding: 0 3rem;
}
</style>