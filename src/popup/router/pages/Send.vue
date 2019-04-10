<template>
  <div class="popup">
    <ae-main>
      <p>{{heading}}</p>
      <div>
        <div>
          <ae-address-input label="Address"
            placeholder="Address"
            v-model="form.address"
          />
        </div>
        <div>
          <ae-input label="Amount" placeholder="0.0" aemount v-model="form.amount">
            <ae-text slot="header" fill="black">AE</ae-text>
          </ae-input>
        </div>
        <div>
            <ae-button face="round" fill="primary" extend @click="send">Send</ae-button>
        </div>
      </div>
    </ae-main>
  </div>
</template>

<script>
import locales from '../../locales/locales.json';
import store from '../../../store';
import QrcodeVue from 'qrcode.vue';
import Wallet from '@aeternity/aepp-sdk/es/ae/wallet';
import { AeButton, AeMain, AeInput, AeText, AeAddressInput, AeAddress, AeQrcode, mixins } from '@aeternity/aepp-components';

export default {
  name: 'Send',
  mixins: [mixins.events],
  components: {
    'ae-main': AeMain,
    'ae-input': AeInput,
    'ae-text': AeText,
    'ae-button': AeButton,
    'ae-address-input': AeAddressInput,
    'qrcode-vue': QrcodeVue,
    'ae-address': AeAddress,
    'ae-qrcode': AeQrcode
  },
  data() {
    return {
      heading: 'Send AE tokens',
      account: {},
      form: {
        address: '',
        amount: 0.0,
      }
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
    },
    send () {
      let amount = this.form.amount;
      let receiver = this.form.address;
      // alert(JSON.stringify(this.form));
      Wallet({
        url: store.state.config.ae.network.testnet.url,
        internalUrl: store.state.config.ae.network.testnet.internalUrl,
        accounts: [
          MemoryAccount({
            keypair: {
              secretKey: 'PRIV_KEY_HERE',
              publicKey: this.account.publicKey
            },
            networkId: store.state.config.ae.network.testnet.networkId
          })
        ],
        address: this.account.publicKey,
        onTx: true, // guard returning boolean
        onChain: true, // guard returning boolean
        onAccount: true, // guard returning boolean
        onContract: true, // guard returning boolean
        networkId: store.state.config.ae.network.testnet.networkId
      }).then(ae => ae.spend(parseInt(amount), receiver))
    }
  }
}
</script>

<style lang="scss" scoped>
@import '../../../../node_modules/@aeternity/aepp-components/dist/aeMain/aeMain.css';
@import '../../../../node_modules/@aeternity/aepp-components/dist/ae-input/ae-input.css';
@import '../../../../node_modules/@aeternity/aepp-components/dist/ae-text/ae-text.css';
@import '../../../../node_modules/@aeternity/aepp-components/dist/aeAddressInput/aeAddressInput.css';
@import '../../../../node_modules/@aeternity/aepp-components/dist/ae-address/ae-address.css';
@import '../../../../node_modules/@aeternity/aepp-components/dist/ae-button/ae-button.css';
@import '../../../../node_modules/@aeternity/aepp-components/dist/ae-qrcode/ae-qrcode.css';
@import '../../../common/base';


</style>