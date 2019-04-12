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

      <div v-if="loading" class="loading">
        <ae-loader />
      </div>
    
      <div class="result" v-if="tx.status">
        <p>Success</p>
        <a :href="tx.url">See transaction in the explorer.</a>
      </div>
    </ae-main>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import locales from '../../locales/locales.json';
import QrcodeVue from 'qrcode.vue';
import Wallet from '@aeternity/aepp-sdk/es/ae/wallet';
import { MemoryAccount } from '@aeternity/aepp-sdk';
import { MAGNITUDE, MIN_SPEND_TX_FEE } from '../../utils/constants';
import BigNumber from 'bignumber.js';
import Ae from '@aeternity/aepp-sdk/es/ae/universal';

export default {
  name: 'Send',
  data() {
    return {
      heading: 'Send AE tokens',
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
      }
    }
  },
  locales,
  computed: {
    ...mapGetters(['account', 'network', 'currentNetwork'])
  },
  methods: {
    send () {
      this.loading = true;
      let amount = BigNumber(this.form.amount).shiftedBy(MAGNITUDE);
      let receiver = this.form.address;

      Wallet({
        url: this.network[this.currentNetwork].url,
        internalUrl: this.network[this.currentNetwork].internalUrl,
        accounts: [
          MemoryAccount({
            keypair: {
              secretKey: this.account.secretKey,
              publicKey: this.account.publicKey
            },
            networkId: this.network[this.currentNetwork].networkId
          })
        ],
        address: this.account.publicKey,
        onTx: confirm, // guard returning boolean
        onChain: confirm, // guard returning boolean
        onAccount: confirm, // guard returning boolean
        onContract: confirm, // guard returning boolean
        networkId: this.network[this.currentNetwork].networkId
      })
      .then(ae => {
        ae.spend(parseInt(amount), receiver).then(result => {
          if(typeof result == "object") {
            console.log(result);
            this.tx.status = true;
            this.tx.hash = result.hash;
            this.tx.block = result.blockNumber;
            this.tx.url = "//testnet.explorer.aepps.com/#/tx/" + result.hash;
            this.clearForm();
          }
          else {
            alert("error");
          }
        });
      })
    },
    clearForm () {
      setTimeout(() => {
        this.loading = false;
        this.tx.status = false;
        this.form.address = '';
        this.form.amount = '';
      }, 2000);
    }
  }
}
</script>

<style lang="scss" scoped>
@import '../../../common/base';

</style>