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

    <div class="actions">
      <ae-button-group>
        <ae-button face="flat" fill="primary" extend @click="navigateSend">{{language.buttons.send}}</ae-button>
        <ae-button face="flat" fill="secondary" extend @click="navigateReceive">{{language.buttons.receive}}</ae-button>
      </ae-button-group>
      <ae-button face="round" fill="alternative" disabled extend >{{language.buttons.tipWebsite}}</ae-button>
    </div>
  </div> 
</template>

<script>
import { mapGetters } from 'vuex';
import locales from '../../locales/locales.json';
import { setInterval } from 'timers';

export default {
  name: 'Account',
  data () {
    return {
      polling: null,
      language: locales['en']
    }
  },
  computed: {
    ...mapGetters(['account', 'balance', 'network', 'current'])
  },
  created () {
    console.log(current);
    this.pollData();
  },
  methods: {
    pollData() { 
      this.polling = setInterval(() => {
        this.$store.dispatch('updateBalance');
      }, 200)
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

.actions {
  margin-top: 5px;
}

</style>