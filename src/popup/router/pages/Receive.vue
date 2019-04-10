<template>
  <div class="popup">
    <p>{{heading}}</p>
    <ae-card fill="neutral" align="center">
      <div class="qr-wrapper">
        <qrcode-vue :value="example"></qrcode-vue>
      </div>
      <!-- <ae-qrcode value="example" :options="{ size: 136 }" /> -->
      <ae-address :value="account.publicKey" gap=0 />
      <ae-toolbar fill="neutral" align="right" slot="footer">
        <ae-button face="toolbar">
          <ae-icon name="copy" />
          Copy
        </ae-button>
        <ae-button face="toolbar">
          <ae-icon name="share" />
          Share
        </ae-button>
      </ae-toolbar>
    </ae-card>
  </div>
</template>

<script>
import locales from '../../locales/locales.json';
import store from '../../../store';
import QrcodeVue from 'qrcode.vue';
import { AeCard, AeToolbar, AeButton, AeIcon, AeAddress, AeQrcode, mixins } from '@aeternity/aepp-components';

export default {
  name: 'Receive',
  mixins: [mixins.events],
  components: {
    'ae-card': AeCard,
    'ae-toolbar': AeToolbar,
    'ae-button': AeButton,
    'ae-icon': AeIcon,
    'qrcode-vue': QrcodeVue,
    'ae-address': AeAddress,
    'ae-qrcode': AeQrcode
  },
  data() {
    return {
      heading: 'Receive AE tokens',
      account: {}
    }
  },
  locales,
  mounted() { 

  },
  created () {
    this.init();
  },
  methods: {
    init () {
      chrome.storage.sync.get('account', accountData => {
        this.account = accountData.account;
      });
    }
  }
}
</script>

<style lang="scss" scoped>
@import '../../../../node_modules/@aeternity/aepp-components/dist/ae-card/ae-card.css';
@import '../../../../node_modules/@aeternity/aepp-components/dist/ae-button/ae-button.css';
@import '../../../../node_modules/@aeternity/aepp-components/dist/ae-toolbar/ae-toolbar.css';
@import '../../../../node_modules/@aeternity/aepp-components/dist/ae-icon/ae-icon.css';
@import '../../../common/base';

.qr-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 5px;
  background-color: white;
  border-radius: 6px;
}

</style>