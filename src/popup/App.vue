<template>
  <div>
    <header>
      <ae-header>
        <span slot="mobile-left">Waellet</span>

        <!-- network -->
        <ae-dropdown slot="mobile-right" direction="right">
          <ae-button slot="button">
            Network
          </ae-button>
          <li>
            <ae-button>
              <ae-icon name="globe" />
              Testnet
            </ae-button>
          </li>
          <li>
            <ae-button>
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
            <ae-button>
              <ae-icon name="globe" />
              Account stuff
            </ae-button>
          </li>
          <li>
            <ae-button>
              <ae-icon name="globe" />
              Account stuff
            </ae-button>
          </li>
        </ae-dropdown>
      </ae-header>
    </header>
    <router-view></router-view>
  </div>
</template>

<script>
import store from '../store';
import locales from './locales/locales.json'
import { AeIcon, AeDropdown, AeHeader, AeButton } from '@aeternity/aepp-components'

export default {
  components: {
    AeIcon,
    AeDropdown,
    AeHeader,
    AeButton
  },
  computed: {
    account () {
      return this.$store.state.account;
    }
  },
};
</script>

<style lang="scss">
@import '../../node_modules/@aeternity/aepp-components/dist/ae-icon/ae-icon.css';
@import '../../node_modules/@aeternity/aepp-components/dist/ae-button/ae-button.css';
@import '../../node_modules/@aeternity/aepp-components/dist/ae-dropdown/ae-dropdown.css';
@import '../../node_modules/@aeternity/aepp-components/dist/aeHeader/aeHeader.css';
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