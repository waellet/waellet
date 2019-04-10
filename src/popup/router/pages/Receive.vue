<template>
  <div class="popup">
    <p>{{heading}}</p>
      
  </div>
</template>

<script>
import locales from '../../locales/locales.json';
import store from '../../../store';
import QrcodeVue from 'qrcode.vue';
import { AeAddress, AeQrcode, mixins } from '@aeternity/aepp-components';

export default {
  name: 'Account',
  mixins: [mixins.events],
  components: {
    'qrcode-vue': QrcodeVue,
    'ae-address': AeAddress,
    'ae-qrcode': AeQrcode
  },
  data() {
    return {
      heading: 'Receive AE tokens',
      account: {}
    }
  },
  locales,
  mounted() {
    chrome.tabs.query(
      {
        active: true,
        lastFocusedWindow: true,
      },
      tabs => {
        this.heading = 'account';
        this.account = this.$store.state.account;
      }
    );
  },
  methods: {
    getAddress: function getAddress() {
      alert(JSON.stringify(this.account));
    }
  }
}
</script>

<style lang="scss" scoped>
@import '../../../../node_modules/@aeternity/aepp-components/dist/ae-address/ae-address.css';
@import '../../../../node_modules/@aeternity/aepp-components/dist/ae-qrcode/ae-qrcode.css';
@import '../../../common/base';


</style>