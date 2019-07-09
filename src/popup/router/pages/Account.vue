  <template>
  <div class="popup">
    <h3>{{language.pages.account.heading}}</h3>
    <div class="currenciesgroup">
      <div class="inputGroup-currencies">
        <div class="input-group-icon">$</div>
        <div class="input-group-area"><input disabled type="text" :value=toUsd></div>
      </div>
      <div class="inputGroup-currencies">
        <div class="input-group-icon">€</div>
        <div class="input-group-area"><input disabled type="text" :value=toEur></div>
      </div>
    </div>
    <ae-card fill="primary">
      <template slot="avatar">
        <ae-identicon :address="account.publicKey" />
        <ae-input-plain fill="white" :placeholder="language.strings.accountName" @keyup.native="setAccountName" :value="activeAccountName"  />
      </template>
      <template slot="header">
        <ae-text fill="white" face="mono-base">{{balance}} AE</ae-text>
      </template>
      <ae-address :value="account.publicKey" copyOnClick enableCopyToClipboard length="medium" gap=0 />
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
import { setInterval, setTimeout, setImmediate, clearInterval } from 'timers';
import { getTranscationByPublicAddress }  from '../../utils/transactions';
import { getHdWalletAccount } from '../../utils/hdWallet';
import { request } from 'http';
import { fetchData } from '../../utils/helper';
export default {
  name: 'Account',
  data () {
    return {
      polling: null,
      language: locales['en'],
      loading:true,
      accountName:'',
      pollingTransaction:null,
      toUsd: null,
      toEur: null,
      timer: '',
      eurRate: '',
      usdRate: '',
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
    this.currencyConv();
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
        this.toUsd = this.balance * this.usdRate;
        this.toEur = this.balance * this.eurRate;
      }, 1000);
      this.pollingTransaction = setInterval(() => {
        this.$store.dispatch('updateBalanceSubaccounts');
        this.updateTransactions();
      }, 5000);
    },
    async currencyConv () {
      browser.storage.sync.get('convertTimer').then(async result => {
        var time = new Date().getTime();
        if ( result.convertTimer == '' || result.convertTimer == 'undefined' || result.convertTimer <= time) {
          const fetched = await fetchData('https://api.coingecko.com/api/v3/simple/price?ids=aeternity&vs_currencies=usd,eur','get','');
          browser.storage.sync.set({ rateUsd : fetched.aeternity.usd}).then(() => { });
          browser.storage.sync.set({ rateEur : fetched.aeternity.eur}).then(() => { });
          // console.log(result.convertTimer);
          // console.log('v if');
          browser.storage.sync.set({ convertTimer : time+3600000}).then(() => { });
        }
          // console.log(time);
          // console.log(result.convertTimer);
        browser.storage.sync.get('rateUsd').then(resusd => {
          this.usdRate = resusd.rateUsd;
          this.toUsd = resusd.rateUsd * this.balance;
        });
        browser.storage.sync.get('rateEur').then(reseur => {
          this.eurRate = reseur.rateEur;
          this.toEur = reseur.rateEur * this.balance;
        });
      });
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
         browser.storage.sync.set({ subaccounts: this.subaccounts}).then(() => {});
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
.transactionHistory {
  margin-top:1rem;
}
.inputGroup-currencies{
  display: inline-block;
  border-collapse: collapse;
  width: 49%;
}
.inputGroup-currencies > div{
  display: table-cell;
  font-weight: bold;
  border-bottom: 2px solid #ff0d6a;
  vertical-align: middle;
  border-radius: 10px;
  border-bottom-left-radius: 0;
}
.input-group-icon{
  background: #ff0d6a;
  color: #fff;
  padding: 0 12px;
}
.input-group-area{
  width:100%;
}
.inputGroup-currencies input{
  border: 0;
  display: block;
  font-weight: bold;
  width: 100%;
  padding: 8px;
}
</style>