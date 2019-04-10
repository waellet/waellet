<template>
  <div>
    <header>
      <ae-header name="Waellet">
        <ae-button type='dramatic'>Button</ae-button>
        <span slot="mobile-left"></span>
        <span slot="mobile-right"></span>
      </ae-header>
    </header>
    <router-view></router-view>
  </div>
</template>

<script>
import locales from './locales/locales.json'
import { AeHeader, AeButton } from '@aeternity/aepp-components'

export default {
  data() {
    return {};
  },
  components: {
    'ae-header': AeHeader,
    'ae-button': AeButton
  }
};
</script>

<style lang="scss">
@import '../../node_modules/@aeternity/aepp-components/dist/ae-button/ae-button.css';
@import '../../node_modules/@aeternity/aepp-components/dist/aeHeader/aeHeader.css';
@import '../common/base';

.ae-button {
  margin-bottom: 1em;
}

html {
  min-width: 357px;
  min-height: 600px;
  background-color: #f5f5f5;
}

.popup {
  color: #555;
  padding: 4px;
  text-align: center;
  font-size: 16px;
  word-break: break-all;
  word-wrap: break-word;
}

</style>