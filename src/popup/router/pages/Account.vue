<template>
  <div class="popup">
    <p>{{language.pages.account.heading}}</p>
    <ae-card fill="primary">
      <template slot="avatar">
        <ae-identicon :address="account.publicKey" />
        <ae-input-plain fill="white" :placeholder="language.strings.accountName" :value="language.strings.myAccount" />
      </template>
      <template slot="header">
        <ae-text fill="white" face="mono-base">{{balance}} AE</ae-text>
      </template>
      <ae-address :value="account.publicKey" length="medium" gap=0 />
      <ae-toolbar fill="primary" align="right" slot="footer">
        <ae-button face="toolbar" v-clipboard:copy="account.publicKey" @click="popupAlert({ name: 'account', type: 'publicKeyCopied' })">
          <ae-icon name="copy" />
          {{language.buttons.copy}}
        </ae-button>
      </ae-toolbar>
    </ae-card>
    <br>
    <div class="actions">
      <ae-button-group>
        <ae-button face="round" fill="primary" extend @click="navigateSend">{{language.buttons.send}}</ae-button>
        <ae-button face="round" fill="secondary" extend @click="navigateReceive">{{language.buttons.receive}}</ae-button>
      </ae-button-group>
      <br>
      <ae-button face="round" fill="alternative" disabled extend >{{language.buttons.tipWebsite}}</ae-button>
    </div>
    <h3>Latest transactions</h3>
    <div v-if="transactions.length && !loading">
      <ae-list class="transactionList">
        <TransactionItem v-for="transaction in transactions" :transactionData="transaction"></TransactionItem>
      </ae-list>
      <ae-button face="round" fill="primary" @click="showAllTranactions">{{language.buttons.wholeTransaction}}</ae-button>
    </div>
    <div v-if="transactions.length == 0 && !loading">
        <p class="paragraph">No transactions found!</p>
    </div>
    <Loader :loading="loading" v-bind="{'content':''}"></Loader>
    <!-- <button @click="showSign">Show sign transaction</button> -->
  </div> 
</template>

<script>
import { mapGetters } from 'vuex';
import locales from '../../locales/locales.json';
import { setInterval } from 'timers';
import { getTranscationByPublicAddress }  from '../../utils/transactions';

export default {
  name: 'Account',
  data () {
    return {
      polling: null,
      language: locales['en'],
      transactions: [],
      loading:true
    }
  },
  computed: {
    ...mapGetters(['account', 'balance', 'network', 'current'])
  },
  created () {
    // getTranscationByPublicAddress(this.account.publicKey);
    let transactions = this.$store.dispatch('getTransactionsByPublicKey',{publicKey:this.account.publicKey,limit:3});
    transactions.then(res => {
      this.transactions = res;
      this.loading = false;
    });
    this.pollData();
  },
  methods: {
    showAllTranactions() {
        this.$router.push('/transactions');
    },
    showSign() {
      this.$router.push('/sign-transaction');
      /*chrome.windows.create({
        url: chrome.runtime.getURL('./popup/popup.html'),
        type: "popup",
        height: 600,
        width:420
      },() => {
        console.log("created");
      });*/
    },
    pollData() { 
      // this.polling = setInterval(() => {
        
        // this.$store.dispatch('updateBalance');
      // }, 200)
    },
    popupAlert(payload) {
      this.$store.dispatch('popupAlert', payload)
    },
    navigateSend () {
      this.$router.push('/send');
    },
    navigateReceive () {
      this.$router.push('/receive');
    },
  },
  beforeDestroy () {
	  clearInterval(this.polling)
  },
}
</script>

<style lang="scss" scoped>
@import '../../../common/base';

.paragraph {
  font-weight: normal;
}
</style>