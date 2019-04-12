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
      <ae-address :value="account.publicKey" length="medium" gap=0 />
      <ae-toolbar fill="primary" align="right" slot="footer">
        <ae-button face="toolbar" v-clipboard:copy="account.publicKey">
          <ae-icon name="copy" />
          Copy
        </ae-button>
      </ae-toolbar>
    </ae-card>

    <div class="actions">
      <ae-button face="round" fill="primary" extend @click="navigateSend">Send</ae-button>
      <ae-button face="round" fill="secondary" extend @click="navigateReceive">Receive</ae-button>
      <ae-button face="round" fill="alternative" disabled extend >Tip website</ae-button>
    </div>
  </div> 
</template>

<script>
import { mapGetters } from 'vuex';
import locales from '../../locales/locales.json';
import QrcodeVue from 'qrcode.vue';
import Ae from '@aeternity/aepp-sdk/es/ae/universal';

export default {
  name: 'Account',
  data () {
    return {
      heading: 'Account',
      balance: 0
    }
  },
  locales,
  computed: {
    ...mapGetters(['account', 'network', 'currentNetwork'])
  },
  created () {
    this.updateAccountBalance();
  },
  methods: {
    updateAccountBalance () {
      Ae({
        url: this.network[this.currentNetwork].url,
        internalUrl: this.network[this.currentNetwork].internalUrl,
        keypair: { 
          secretKey: this.account.secretKey,
          publicKey: this.account.publicKey
        },
        networkId: this.network[this.currentNetwork].networkId
      }).then(ae => {
        ae.balance(this.account.publicKey).then(balance => {
          this.balance = balance / (10**18);
        }).catch(e => {
          console.log(e)
          this.balance = 0;
        })
      })
    },
    navigateSend () {
      this.$router.push('/send');
    },
    navigateReceive () {
      this.$router.push('/receive');
    },
  }
}
</script>

<style lang="scss" scoped>
@import '../../../common/base';

.actions {
  margin-top: 5px;
}

</style>