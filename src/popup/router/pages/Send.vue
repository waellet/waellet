<template>
  <div class="popup">
    <ae-main>
      <p>{{language.pages.send.heading}}</p>
      <div>
        <div>
          <ae-address-input :label="language.strings.address"
            :placeholder="language.strings.address"
            v-model="form.address"
          />
        </div>
        <div v-if="!tx.status">
          <ae-input :label="language.strings.amount" placeholder="0.0" aemount v-model="form.amount">
            <ae-text slot="header" fill="black">AE</ae-text>
          </ae-input>
          <p>{{language.strings.maxSpendableValue}} {{maxValue}}</p>
          <p>{{language.strings.txFee}} {{txFee}}</p>
        </div>
        <div>
            <ae-button face="round" fill="primary" extend @click="send">{{language.buttons.send}}</ae-button>
        </div>
        <div class="actions">
          <ae-button face="flat" fill="alternative" extend @click="navigateAccount">{{language.buttons.backToAccount}}</ae-button>
        </div>
      </div>

      <div v-if="loading" class="loading">
        <ae-loader />
      </div>
    
      <div class="result" v-if="tx.status">
        <p>{{language.strings.success}}</p>
        <a :href="tx.url">{{language.strings.seeTransactionExplorer}}</a>
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
import { MAGNITUDE, MIN_SPEND_TX_FEE, MIN_SPEND_TX_FEE_MICRO } from '../../utils/constants';
import BigNumber from 'bignumber.js';
import Ae from '@aeternity/aepp-sdk/es/ae/universal';

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
      maxValue: (this.balance - MIN_SPEND_TX_FEE).toString(),
      txFee: MIN_SPEND_TX_FEE
    }
  },
  locales,
  computed: {
    ...mapGetters(['account', 'balance', 'network', 'current']),
  },
  mounted() {
    this.init()
  },
  methods: {
    init() {
      let calculatedMaxValue = this.balance - MIN_SPEND_TX_FEE
      this.maxValue = calculatedMaxValue > 0 ? calculatedMaxValue.toString() : 0
    },
    send () {
      this.loading = true;
      let amount = BigNumber(this.form.amount).shiftedBy(MAGNITUDE);
      let receiver = this.form.address;

      //is the amount correct
      if (this.maxValue - this.form.amount <= 0) {
        this.$store.dispatch('popupAlert', { name: 'spend', type: 'insufficient_balance'})
        return;
      } 

      Wallet({
        url: this.network[this.current.network].url,
        internalUrl: this.network[this.current.network].internalUrl,
        accounts: [
          MemoryAccount({
            keypair: {
              secretKey: this.account.secretKey,
              publicKey: this.account.publicKey
            },
            networkId: this.network[this.current.network].networkId
          })
        ],
        address: this.account.publicKey,
        onTx: confirm, // guard returning boolean
        onChain: confirm, // guard returning boolean
        onAccount: confirm, // guard returning boolean
        onContract: confirm, // guard returning boolean
        networkId: this.network[this.current.network].networkId
      })
      .then(ae => {
        ae.spend(parseInt(amount), receiver).then(result => {
          if(typeof result == "object") {
            let txUrl = this.network[this.current.network].explorerUrl + '/#/tx/' + result.hash;
            // this.tx.status = true;
            this.tx.hash = result.hash;
            this.tx.block = result.blockNumber;
            this.tx.url = txUrl;
           
            let msg = 'You send ' + this.form.amount + ' AE';
            this.$store.dispatch('popupAlert', { name: 'spend', type: 'success_transfer',msg,data:txUrl});
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
    },
    navigateAccount() {
      this.$router.push('/account')
    },
    openExplorer(url) {
      chrome.tabs.create({url,active:false});
    }
  }
}
</script>

<style lang="scss" scoped>
@import '../../../common/base';

.actions {
  margin-top: 5px;
}

</style>