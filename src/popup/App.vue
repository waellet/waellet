<template>
  <ae-main>
    <header>
      <ae-header>
        <span slot="mobile-left">Waellet</span>

        <!-- network -->
        <ae-dropdown slot="mobile-right" direction="right">
          <ae-button slot="button">
            Network
          </ae-button>
          <li>
            <ae-button @click="switchNetwork('testnet')">
              <ae-icon name="globe" />
              Testnet
            </ae-button>
          </li>
          <li>
            <ae-button @click="switchNetwork('mainnet')">
              <ae-icon name="globe" />
              Mainnet
            </ae-button>
          </li>
        </ae-dropdown>

        <!-- account -->
        <ae-dropdown v-if="account.publicKey" slot="mobile-right" direction="right">
          <ae-button slot="button">
            Account
          </ae-button>
          <li>
            <ae-link to="account">
              <ae-button>
                <ae-icon fill="primary" name="globe" />
                My Account
              </ae-button>
            </ae-link>
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

export default {
  computed: {
    ...mapGetters (['account', 'currentNetwork', 'network'])
  },
  methods: {
    switchNetwork (network) {
      this.$store.dispatch('switchNetwork', network).then(() => this.$store.dispatch('updateBalance'));
    }
  }
};
</script>

<style lang="scss">
@import '../common/base';

.ae-button {
  margin-bottom: 1em;
}

html {
  min-width: 357px;
  min-height: 600px;
  background-color: #f5f5f5;
}

.popup {
  color: #555;
  padding: 4px;
  text-align: center;
  font-size: 16px;
  word-break: break-all;
  word-wrap: break-word;
}

</style>