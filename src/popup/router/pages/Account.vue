<template>
  <div class="popup">
    <h3>{{language.pages.account.heading}}</h3>
    <ae-card fill="primary">
      <template slot="avatar">
        <ae-identicon :address="account.publicKey" />
        <ae-input-plain fill="white" :placeholder="language.strings.accountName" @keyup.native="setAccountName" :value="activeAccountName"  />
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
        <ae-button face="round" fill="primary" extend class="sendBtn" @click="navigateSend">{{language.buttons.send}}</ae-button>
        <ae-button face="round" fill="secondary" extend class="receiveBtn" @click="navigateReceive">{{language.buttons.receive}}</ae-button>
      </ae-button-group>
      <br>
      <ae-button face="round" fill="alternative" class="toTipping" extend @click="openTipPage">{{language.buttons.tipWebsite}}</ae-button>
    </div>
    <h3>Latest transactions</h3>
    <div v-if="transactions.latest.length && !loading">
      <ae-list class="transactionList">
        <TransactionItem v-for="transaction in transactions.latest" :transactionData="transaction"></TransactionItem>
      </ae-list>
      <ae-button face="round" fill="primary" class="transactionHistory" @click="showAllTranactions">{{language.buttons.wholeTransaction}}</ae-button>
    </div>
    <div v-if="transactions.latest.length == 0 && !loading">
        <p class="paragraph noTransactions">No transactions found!</p> 
    </div>
    <Loader :loading="loading" v-bind="{'content':''}"></Loader>
    <!-- <button @click="showSign">Show sign transaction</button> -->
  </div> 
</template>

<script>
import Ae from '@aeternity/aepp-sdk/es/ae/universal';
import { mapGetters } from 'vuex';
import locales from '../../locales/locales.json';
import { setInterval, setTimeout, setImmediate } from 'timers';
import { getTranscationByPublicAddress }  from '../../utils/transactions';
import { getHdWalletAccount } from '../../utils/hdWallet';
export default {
  name: 'Account',
  data () {
    return {
      polling: null,
      language: locales['en'],
      loading:true,
      accountName:'',
      pollingTransaction:null
    }
  },
  computed: {
    ...mapGetters(['account', 'balance', 'network', 'current','transactions','subaccounts','wallet','activeAccountName','activeAccount']),
    publicKey() { 
      return this.account.publicKey; 
    },
    watchBalance() {
      return this.balance;
    }
  },
  watch:{
      publicKey() {
        this.loading = true;
        this.updateTransactions();
      },
      watchBalance() {
        // this.updateTransactions();
      }
  },
  created () {
    this.pollData();
  },
  mounted(){
    this.updateTransactions();
  },  
  methods: {
    showAllTranactions() {
        this.$router.push('/transactions');
    },
    pollData() {
      this.polling = setInterval(() => {
        this.$store.dispatch('updateBalance');
        // this.$store.dispatch('updateBalanceSubaccounts');
      }, 1000);
      this.pollingTransaction = setInterval(() => {
        this.$store.dispatch('updateBalanceSubaccounts');
        // this.updateTransactions();
      }, 5000);
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
    updateTransactions() {
      this.$store.dispatch('getTransactionsByPublicKey',{publicKey:this.account.publicKey,limit:3})
      .then(res => {
        this.loading = false;
        this.$store.dispatch('updateLatestTransactions',res);
      });
    },
    setAccountName(e) {
      this.$store.dispatch('setAccountName', e.target.value)
      .then(() => {
         chrome.storage.sync.set({ subaccounts: this.subaccounts}, () => {});
      });
    },
    openTipPage() {
      this.$router.push('/tip');
    }
  },
  beforeDestroy () {
    clearInterval(this.polling)
    clearInterval(this.pollingTransaction)
  },
}
</script>

<style lang="scss" scoped>
@import '../../../common/base';

.paragraph {
  font-weight: normal;
}
</style>