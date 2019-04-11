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
import { MemoryAccount } from '@aeternity/aepp-sdk';
import { AeButton, AeMain, AeInput, AeText, AeAddressInput, AeAddress, AeQrcode, mixins } from '@aeternity/aepp-components';
import { MAGNITUDE, MIN_SPEND_TX_FEE } from '../../utils/constants';
import BigNumber from 'bignumber.js';

import Ae from '@aeternity/aepp-sdk/es/ae/universal';


export default {
  name: 'Send',
  mixins: [mixins.events],
  components: {
    AeMain,
    AeInput,
    AeText,
    AeButton,
    AeAddressInput,
    QrcodeVue,
    AeAddress,
    AeQrcode
  },
  data() {
    return {
      heading: 'Send AE tokens',
      account: {},
      form: {
        address: '',
        amount: '',
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
      let amount = BigNumber(this.form.amount).shiftedBy(MAGNITUDE);
      let receiver = this.form.address;

      Wallet({
        url: store.state.config.ae.network.testnet.url,
        internalUrl: store.state.config.ae.network.testnet.internalUrl,
        accounts: [
          MemoryAccount({
            keypair: {
              secretKey: store.state.account.secretKey,
              publicKey: store.state.account.publicKey
            },
            networkId: store.state.config.ae.network.testnet.networkId
          })
        ],
        address: store.state.account.publicKey,
        onTx: confirm, // guard returning boolean
        onChain: confirm, // guard returning boolean
        onAccount: confirm, // guard returning boolean
        onContract: confirm, // guard returning boolean
        networkId: store.state.config.ae.network.testnet.networkId
      })
      .then(ae => {
        ae.spend(parseInt(amount),  receiver);
      })
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