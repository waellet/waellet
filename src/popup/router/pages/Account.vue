<template>
  <div class="popup">
    <p>{{heading}}</p>

    <ae-card fill="primary">
      <template slot="avatar">
        <ae-identicon :address="account.publicKey" />
        <ae-input-plain fill="white" placeholder="Account name" value="My Account" />
      </template>
      <ae-icon name="more" fill="white" size="20px" slot="header" />
      <ae-text face="uppercase-xs" weight=600 style="margin: 0">Normal Secured</ae-text>
      <ae-address :value="account.publicKey" length="medium" gap=0 />
      <ae-toolbar fill="primary" align="right" slot="footer">
        <ae-button face="toolbar">
          <ae-icon name="eye" />
          Details
        </ae-button>
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

      <div class="row">
        <div class="col-sm-6">
          <div class="card-page" >
            <div class="wbox back-wb">
              <span class="box-title">Your Aeternity wallet</span>
              <qrcode-vue size="120" :value="account.publicKey" class="qr-holder" />
              <ae-address :value="account.publicKey" length="flat" />
              <!-- <ae-qrcode :value="account.publicKey" :options="{ size: 136 }" /> -->
            </div>
          </div>
        </div>
        <button type="button" class="btn" @click="getAddress">Get address</button>
    </div>
  </div>
</template>

<script>
import locales from '../../locales/locales.json';
import store from '../../../store';
import QrcodeVue from 'qrcode.vue';
import { AeAddress, AeQrcode, AeCard, AeIdenticon, AeIcon, AeText, AeToolbar, AeInputPlain, mixins } from '@aeternity/aepp-components';

export default {
  name: 'Account',
  mixins: [mixins.events],
  components: {
    'qrcode-vue': QrcodeVue,
    'ae-address': AeAddress,
    'ae-qrcode': AeQrcode,
    'ae-card': AeCard,
    'ae-icon': AeIcon,
    'ae-identicon': AeIdenticon,
    'ae-text': AeText,
    'ae-toolbar': AeToolbar,
    'ae-input-plain': AeInputPlain
  },
  data() {
    return {
      heading: '',
      account: {}
    }
  },
  locales,
  mounted() {
    chrome.tabs.query(
      {
        active: true,
        lastFocusedWindow: true,
      },
      tabs => {
        this.heading = 'account';
        this.account = this.getAccountFromStorage();
      }
    );
  },
  methods: {
    getAccountFromStorage: function getAccountFromStorage() {
      chrome.storage.local.get(['account'], function(result) {
        return result.key;
      });
    },
    getAddress: function getAddress() {
      alert(JSON.stringify(this.account));
    }
  }
}
</script>

<style lang="scss" scoped>
@import '../../../../node_modules/@aeternity/aepp-components/dist/ae-address/ae-address.css';
@import '../../../../node_modules/@aeternity/aepp-components/dist/ae-qrcode/ae-qrcode.css';
@import '../../../../node_modules/@aeternity/aepp-components/dist/ae-card/ae-card.css';
@import '../../../../node_modules/@aeternity/aepp-components/dist/ae-icon/ae-icon.css';
@import '../../../../node_modules/@aeternity/aepp-components/dist/ae-identicon/ae-identicon.css';
@import '../../../../node_modules/@aeternity/aepp-components/dist/ae-text/ae-text.css';
@import '../../../../node_modules/@aeternity/aepp-components/dist/ae-toolbar/ae-toolbar.css';
@import '../../../../node_modules/@aeternity/aepp-components/dist/ae-input-plain/ae-input-plain.css';
@import '../../../common/base';


</style>