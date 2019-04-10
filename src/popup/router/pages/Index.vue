<template>
  <div class="popup">
    <main>
      <div class="wrapper">
        {{ heading }}
      </div>
    </main>
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
import { AeButton, mixins } from '@aeternity/aepp-components';

export default {
  name: 'Home',
  mixins: [mixins.events],
  components: {
    'ae-button': AeButton
  },
  data() {
    return {
      heading: '',
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
  methods: {
    generateAddress: async function generateAddress({ dispatch }) {
      const keyPair = await addressGenerator.generateKeyPair('test');
      chrome.storage.local.set({account: keyPair}, function() {
        console.log('Account saved');
      });
      // this.$store.commit('UPDATE_ACCOUNT', keyPair);
      this.$router.push('/account');
    },
    importPrivateKey: function importPrivateKey() {
      alert('import private key');
    },
  },
};
</script>

<style lang="scss" scoped>
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