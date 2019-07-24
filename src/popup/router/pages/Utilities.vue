<template>
    <div class="popup">
        <div class="actions">
            <button class="backbutton toAccount" @click="navigateAccount"><ae-icon name="back" /> {{language.buttons.backToAccount}}</button>
        </div>
        <h3 style='text-align:center;'>{{language.pages.utilities.heading}}</h3>
        <br>
        <ae-list id="utilitiesPage" class="settingslist" face="primary">
            <button class="generalsett" @click="openTipPage">
                <span class="settings-li">{{language.buttons.tipWebsite}}</span>
                <i class="arrowright"></i>
                <p class="tabinfo">Make a donation for any website you want</p>
            </button>
            <button class="generalsett" @click="openAllowencesPage">
                <span class="settings-li">{{language.buttons.allowances}}</span>
                <i class="arrowright"></i>
                <p class="tabinfo">Give an allowance to your people</p>
            </button>
        </ae-list>

        <div v-if="loading" class="loading">
            <ae-loader />
        </div>
    </div>
</template>

<script>
import { mapGetters } from 'vuex';
import locales from '../../locales/locales.json';
import QrcodeVue from 'qrcode.vue';
import Wallet from '@aeternity/aepp-sdk/es/ae/wallet';
import { MemoryAccount } from '@aeternity/aepp-sdk';
import { MAGNITUDE, MIN_SPEND_TX_FEE, MIN_SPEND_TX_FEE_MICRO } from '../../utils/constants';
import BigNumber from 'bignumber.js';
import Ae from '@aeternity/aepp-sdk/es/ae/universal';
import { getHdWalletAccount } from '../../utils/hdWallet';
import { FUNGIBLE_TOKEN_CONTRACT } from '../../utils/constants';

export default {
  data() {
    return {
      language: locales['en'],
      loading: false,
    }
  },
  locales,
  computed: {
    ...mapGetters(['account', 'balance', 'network', 'current', 'wallet', 'activeAccount', 'subaccounts', 'tokenSymbol', 'tokenBalance', 'sdk', 'tokens', 'popup']),
  },
  methods: {
    openTipPage() {
      this.$router.push('/tip');
    },
    openAllowencesPage() {
      this.$router.push('/allowances');
    },
    navigateAccount() {
      this.$router.push('/account')
    },
  }
}
</script>

<style lang="scss" scoped>
@import '../../../common/base';

</style>