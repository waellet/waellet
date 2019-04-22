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
      <ae-button-group>
        <ae-button face="flat" fill="primary" extend @click="navigateSend">Send</ae-button>
        <ae-button face="flat" fill="secondary" extend @click="navigateReceive">Receive</ae-button>
      </ae-button-group>
      <ae-button face="round" fill="alternative" disabled extend >Tip website</ae-button>
    </div>
  </div> 
</template>

<script>
import { mapGetters } from 'vuex';
import locales from '../../locales/locales.json';

export default {
  name: 'Account',
  data () {
    return {
      heading: 'Account',
    }
  },
  locales,
  computed: {
    ...mapGetters(['account', 'balance', 'network', 'currentNetwork'])
  },
  created () {
    this.$store.dispatch('updateBalance');
  },
  methods: {
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