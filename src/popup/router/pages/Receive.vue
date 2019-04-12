<template>
  <div class="popup">
    <p>{{heading}}</p>
    <ae-card fill="neutral" align="center">
      <div class="qr-wrapper">
        <qrcode-vue :value="account.publicKey"></qrcode-vue>
      </div>
      <!-- <ae-qrcode :value="account.publicKey" :options="{ size: 136 }" /> -->
      <ae-address :value="account.publicKey" gap=0 />
      <ae-toolbar fill="neutral" align="right" slot="footer">
        <ae-button face="toolbar" v-clipboard:copy="account.publicKey">
          <ae-icon name="copy" />
          Copy
        </ae-button>
      </ae-toolbar>
    </ae-card>
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

</style>