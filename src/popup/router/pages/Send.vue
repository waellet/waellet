<template>
  <div class="popup">
    <ae-main>
      <div class="actions">
        <button class="backbutton toAccount" @click="navigateAccount"><ae-icon name="back" /> {{language.buttons.backToAccount}}</button>
      </div>
      <p>{{language.pages.send.heading}}</p>
      <div class="sendContent">
        <div class="address">
          <ae-address-input v-model="form.address" />
          <ae-text class='addresslbl' slot="header">Address </ae-text>
        </div>
        <div class="amount" v-if="!tx.status">
          <ae-input :label="language.strings.amount" aemount v-model="form.amount" class="sendAmount">
            <ae-text slot="header" fill="black">AE</ae-text>
          </ae-input>
          <p>{{language.strings.maxSpendableValue}} {{maxValue}}</p>
          <p>{{language.strings.txFee}} {{txFee}}</p>
        </div>
        <div>
          <ae-button face="round" fill="primary" class="sendBtn extend" @click="send">{{language.buttons.send}}</ae-button>
        </div>
      </div>

      <div v-if="loading" class="loading">
        <ae-loader />
      </div>
      <input type="hidden" class="txHash" :value="tx.hash" />
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
import { getHdWalletAccount } from '../../utils/hdWallet';
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
    ...mapGetters(['account', 'balance', 'network', 'current', 'wallet','activeAccount']),
    maxValue() {
      let calculatedMaxValue = this.balance - MIN_SPEND_TX_FEE
      return calculatedMaxValue > 0 ? calculatedMaxValue.toString() : 0;
    }
  },
  mounted() {
    this.init()
  },
  methods: {
    init() {
      let calculatedMaxValue = this.balance - MIN_SPEND_TX_FEE
      // this.maxValue = calculatedMaxValue > 0 ? calculatedMaxValue.toString() : 0
    },
    send () {
      this.loading = true;
      let amount = BigNumber(this.form.amount).shiftedBy(MAGNITUDE);
      let receiver = this.form.address;
      if(receiver == '') {
        this.$store.dispatch('popupAlert', { name: 'spend', type: 'incorrect_address'});
        this.loading = false;
        return;
      }
      if(this.form.amount <= 0) {
        this.$store.dispatch('popupAlert', { name: 'spend', type: 'incorrect_amount'});
        this.loading = false;
        return;
      }
      //is the amount correct
      if (this.maxValue - this.form.amount <= 0) {
        this.$store.dispatch('popupAlert', { name: 'spend', type: 'insufficient_balance'});
        this.loading = false;
        return;
      } 
      try {
        Wallet({
          url: this.network[this.current.network].url,
          internalUrl: this.network[this.current.network].internalUrl,
          accounts: [
            MemoryAccount({
              keypair: {
                secretKey: getHdWalletAccount(this.wallet,this.activeAccount).secretKey,
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
          })
          .catch(err => {
            console.log(err);
            this.$store.dispatch('popupAlert', { name: 'spend', type: 'transaction_failed'});
            this.loading = false;
            return;
          });
        })
        .catch(err => {
          console.log(err);
        });
      }catch(err) {
        console.log(err);
      }
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
  width: 50%;
  margin-top: 5px;
}
.sendContent div { 
  margin-bottom: 10px;
}
.ae-input-container .ae-input-box {
  background: #fff !important;
  border: solid 2px #dcdcdc;
  border-radius: 10px;
}
.address {
  position: relative;
  background: #ececec;
}
.address:focus-within { border-left: #FF0D6A 2px solid; }
.address:focus-within {
  p { color: #ff0d6a; }
  p:after { content: '*'; color:#ff0d6a; }
}
.address textarea {
  background: none;
  border: none;
  caret-color: #ff0d6a;
  font-size: 20px;
  outline: none;
}
.address p {
  position: absolute;
  top: 5px;
  left: 15px;
  font-size: 11px;
  color: #76818c;
  font-weight: 100;
}

</style>