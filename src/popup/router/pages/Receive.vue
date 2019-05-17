<template>
  <div class="popup">
    <p>{{heading}}</p>
    <ae-card fill="neutral" align="center">
      <div class="qr-wrapper">
        <qrcode-vue :value="account.publicKey"></qrcode-vue>
      </div>
      <ae-address :value="account.publicKey" gap=0 />
      <ae-toolbar fill="neutral" align="right" slot="footer">
        <ae-button face="toolbar" v-clipboard:copy="account.publicKey" @click="popupAlert({ name: 'account', type: 'publicKeyCopied' })">
          <ae-icon name="copy" />
          Copy
        </ae-button>
      </ae-toolbar>
    </ae-card>

    <div class="actions">
      <ae-button face="round" fill="alternative" extend @click="navigateAccount"> Back to account</ae-button>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import locales from '../../locales/locales.json';
import QrcodeVue from 'qrcode.vue';

export default {
  name: 'Receive',
  components: {
    QrcodeVue
  },
  data() {
    return {
      heading: 'Receive AE tokens',
    }
  },
  locales,
  computed: {
    ...mapGetters(['account'])
  },
  methods: {
    popupAlert(payload) {
      this.$store.dispatch('popupAlert', payload)
    },
    navigateAccount() {
      this.$router.push('/account')
    }
  }
}
</script>

<style lang="scss" scoped>
@import '../../../common/base';

.qr-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 5px;
  background-color: white;
  border-radius: 6px;
}

.actions {
  margin-top: 5px;
}

</style>