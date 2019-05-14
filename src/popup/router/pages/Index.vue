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

    <ae-modal
      v-if="modalVisible"
      @close="modalVisible = false"
      title="Import secret key"
    >
      <ae-input v-model="secretKey" placeholder="Input secret key" />
      <ae-button face="round" extend fill="seconday" @click="importPrivateKey(secretKey)">Import</ae-button>
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
      logo: chrome.runtime.getURL('../../../icons/icon_128.png')
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
    importPrivateKey: async function importPrivateKey(secretKey) {
      this.modalVisible = false;
      this.loading = true;
      const keyPair = await addressGenerator.importPrivateKey('test', secretKey);
      chrome.storage.sync.set({userAccount: keyPair}, () => {
        this.$store.commit('UPDATE_ACCOUNT', keyPair);
        this.$router.push('/account');
      });
    },
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
</style>