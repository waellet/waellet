<template>
  <div class="popup">
    <p>{{heading}}</p>
    <ae-card fill="primary">
      <template slot="avatar">
        <ae-identicon :address="account.publicKey" />
        <ae-input-plain fill="white" placeholder="Account name" value="My Account" />
      </template>
      <template slot="header">
        <ae-text fill="white" face="mono-base">{{balance}} AE</ae-text>
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
    <div>
      <ae-button face="flat" fill="neutral" @click="navigateSend">Send</ae-button>
      <ae-button face="flat" fill="neutral" @click="navigateReceive">Receive</ae-button>
    </div>
  </div> 
</template>

<script>
import locales from '../../locales/locales.json';
import store from '../../../store';
import QrcodeVue from 'qrcode.vue';
import Ae from '@aeternity/aepp-sdk/es/ae/universal';
import { AeAddress, AeButton, AeQrcode, AeCard, AeIdenticon, AeIcon, AeText, AeToolbar, AeInputPlain, mixins } from '@aeternity/aepp-components';
import { account } from '../../../store/getters';

export default {
  name: 'Account',
  mixins: [mixins.events],
  components: {
    'qrcode-vue': QrcodeVue,
    'ae-address': AeAddress,
    'ae-button': AeButton,
    'ae-qrcode': AeQrcode,
    'ae-card': AeCard,
    'ae-icon': AeIcon,
    'ae-identicon': AeIdenticon,
    'ae-text': AeText,
    'ae-toolbar': AeToolbar,
    'ae-input-plain': AeInputPlain
  },
  data () {
    return {
      heading: 'Account',
      account: {},
      balance: 0.0
    }
  },
  locales,
  created () {
    this.init();
    this.updateAccountBalance();
  },
  methods: {
    init () {
      chrome.storage.sync.get('account', accountData => {
        this.account = accountData.account;
      });
    },
    updateAccountBalance () {
      Ae({
        url: store.state.config.ae.network.testnet.url,
        internalUrl: store.state.config.ae.network.testnet.internalUrl,
        keypair: { 
          secretKey: this.account.secretKey,
          publicKey: this.account.publicKey
        },
        networkId: store.state.config.ae.network.testnet.networkId
      }).then(ae => {
          // getting the balance of a public address
          ae.balance(this.account.publicKey).then(balance => {
            // logs current balance of "A_PUB_ADDRESS"
            this.balance = balance / (10**18);
          }).catch(e => {
            // logs error
            console.log(e)
          })
        })
    },
    navigateSend () {
      this.$router.push('/send');
    },
    navigateReceive () {
      this.$router.push('/receive');
    }
  }
}
</script>

<style lang="scss" scoped>
@import '../../../../node_modules/@aeternity/aepp-components/dist/ae-address/ae-address.css';
@import '../../../../node_modules/@aeternity/aepp-components/dist/ae-button/ae-button.css';
@import '../../../../node_modules/@aeternity/aepp-components/dist/ae-qrcode/ae-qrcode.css';
@import '../../../../node_modules/@aeternity/aepp-components/dist/ae-card/ae-card.css';
@import '../../../../node_modules/@aeternity/aepp-components/dist/ae-icon/ae-icon.css';
@import '../../../../node_modules/@aeternity/aepp-components/dist/ae-identicon/ae-identicon.css';
@import '../../../../node_modules/@aeternity/aepp-components/dist/ae-text/ae-text.css';
@import '../../../../node_modules/@aeternity/aepp-components/dist/ae-toolbar/ae-toolbar.css';
@import '../../../../node_modules/@aeternity/aepp-components/dist/ae-input-plain/ae-input-plain.css';
@import '../../../common/base';


</style>