<template>
    <div class="popup">
        <div class="actions">
            <button class="backbutton toAccount" @click="navigateAccount"><ae-icon name="back" /> {{language.buttons.backToAccount}}</button>
        </div>
        <h3 style='text-align:center;'>{{language.pages.settings.heading}}</h3>
        <br>
        <ae-list class="settingslist" face="primary">
            <button class="generalsett" @click="GeneralSettings">
                <span class="settings-li">{{ language.pages.settings.tabGeneral }}</span>
                <i class="arrowright"></i>
                <p class="tabinfo">{{ language.pages.settings.tabGeneralsmall }}</p>
            </button>
            <button class="advancedsett" @click="AdvancedSettings">
                <span class="settings-li">{{ language.pages.settings.tabAdvanced }}</span>
                <i class="arrowright"></i>
                <p class="tabinfo">{{ language.pages.settings.tabAdvancedsmall }}</p>
            </button>
            <button class="securitysett" @click="SecuritySettings">
                <span class="settings-li">{{ language.pages.settings.tabSecurity }}</span>
                <i class="arrowright"></i>
                <p class="tabinfo">{{ language.pages.settings.tabSecuritysmall }}</p>
            </button>
            <button class="aboutsett" @click="AboutSettings">
                <span class="settings-li">{{ language.pages.settings.tabAbout }}</span>
                <i class="arrowright"></i>
                <p class="tabinfo">{{ language.pages.settings.tabAboutsmall }}</p>
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
  name: 'Send',
  data() {
    return {
      language: locales['en'],
      form: {
        address: '',
        amount: '',
      },
      loading: false,
      tx: {
        status: false,
        hash: '',
        block: '',
        url: ''
      },
      txFee: MIN_SPEND_TX_FEE
    }
  },
  locales,
  computed: {
    ...mapGetters(['account', 'balance', 'network', 'current', 'wallet', 'activeAccount', 'subaccounts', 'tokenSymbol', 'tokenBalance', 'sdk', 'tokens', 'popup']),
  },
  methods: {
    navigateAccount() {
      this.$router.push('/account')
    },
  }
}
</script>

<style lang="scss" scoped>
@import '../../../common/base';

</style>