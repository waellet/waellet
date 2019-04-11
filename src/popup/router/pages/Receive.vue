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
    <p>
      <span>{{account.publicKey}}</span>
    </p>
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
    AeCard,
    AeToolbar,
    AeButton,
    AeIcon,
    QrcodeVue,
    AeAddress,
    AeQrcode
  },
  data() {
    return {
      heading: 'Receive AE tokens',
      account: {}
    }
  },
  locales,
  created () {
    this.init();
  },
  methods: {
    init () {
      chrome.storage.sync.get('userAccount', accountData => {
        this.account = accountData.userAccount;
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