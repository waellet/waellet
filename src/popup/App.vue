<template>
  <ae-main>
      <ae-header>

        <!-- network -->
        <ae-dropdown id="network-dropdown" class="dropdown" v-if="account.publicKey" slot="mobile-left" direction="left">
          <ae-icon class="dropdown-button-icon status" name="globe" slot="button" />
          <span class="dropdown-button-name" v-html="currentNetwork" slot="button"></span>
          <li v-for="(value, name) in network" v-bind:key="value.networkId">
            <ae-button v-on:click="switchNetwork(name)" class="status" :class="currentNetwork == name ? 'current' : ''">
                {{ name }}
            </ae-button>
          </li>
        </ae-dropdown>

        <!-- <span slot="mobile-left">
          <div class="logo_top">
            <img :src="logo_top" alt="">
            <p>Waellet</p>
          </div>
        </span> -->


        <!-- account -->
        <ae-dropdown id="account" class="dropdown" v-if="account.publicKey" slot="mobile-left" direction="right">
          <ae-identicon id="identIcon" class="dropdown-button-icon" v-bind:name="this.account.publicKey" size="base" slot="button" />
          <span class="dropdown-button-name" slot="button">MyAccountName</span>
          <li>
            <!--  @click="switchAccount('MyAccountName')" -->
            <ae-button>
              <ae-identicon class="subAccountIcon" v-bind:name="this.account.publicKey" size="xs" />
              <span class="subAccountName">MyAccountName</span>
              <ae-check class="subAccountCheckbox" aria-checked="" />
            </ae-button>
          </li>
        </ae-dropdown>

        <!-- settings -->
        <ae-dropdown class="dropdown" v-if="account.publicKey" slot="mobile-right" direction="right">
          <ae-icon class="dropdown-button-icon" name="settings" slot="button" />
          <span class="dropdown-button-name" slot="button">Settings</span>
          <li>
            <ae-button @click="myAccount">
              <ae-icon fill="primary" name="home" />
              My Account
            </ae-button>
          </li>
          <li>
            <ae-button @click="exportKeypair">
              <ae-icon name="save" />
              Export keypair
            </ae-button>
          </li>
          <li>
            <ae-button @click="switchLanguage">
              <ae-icon name="globe" />
              Language
            </ae-button>
          </li>
          <li>
            <ae-button @click="logout">
              <ae-icon name="sign-out" />
              Logout
            </ae-button>
          </li>
        </ae-dropdown>

      </ae-header>
    <router-view></router-view>
  </ae-main>
</template>

<script>
import store from '../store';
import locales from './locales/locales.json'
import { mapGetters } from 'vuex';
import { saveAs } from 'file-saver';

export default {
  data () {
    return {
      logo_top: chrome.runtime.getURL('../../../icons/icon_48.png')
    }
  },
  computed: {
    ...mapGetters (['account', 'currentNetwork', 'network'])
  },
  methods: {
    newSubAccount () {
      console.log(this.account);
    },
    switchNetwork (network) {
      this.$store.dispatch('switchNetwork', network).then(() => this.$store.dispatch('updateBalance'));
    },
    logout () {
      chrome.storage.sync.set({userAccount: ''}, () => {
        this.$store.commit('UPDATE_ACCOUNT', '');
        this.$router.push('/');
      });
    },

    myAccount () {
      this.$router.push('/account');
    },

    exportKeypair () {
      let blobData = JSON.stringify({"publicKey": this.account.publicKey, "secretKey": this.account.secretKey});
      let blob = new Blob([blobData], {type: "application/json;charset=utf-8"});
      saveAs(blob, "keypair.json");
    },
    switchLanguage () {
      this.$router.push('/language');
    }
  }
};
</script>

<style lang="scss">
@import '../common/base';

.ae-header {
  background: #001833;
  border-bottom: 1px solid #EEE;
}

.ae-header > * {
  color: #717C87;
}

.ae-button {
  margin-bottom: 1em;
}

.top-button {
  border-radius: 8px;
  margin-bottom: 0;
}

html {
  min-width: 357px;
  min-height: 600px;
  background-color: #f5f5f5;
}

.logo_top {
  display: flex;
  flex-flow: row wrap;
  justify-content: center;
  vertical-align: center;
}

.logo_top p {
  font-size: 20px;
  line-height: 12px;
}

p {
  font-weight: bolder;
  margin-left: 3px;
}

.p-top {
  font-size: 16px;
  margin-right: 2px;
  display: contents;
}

.mr-2 {
  margin-right: 2em;
}

.popup {
  color: #555;
  padding: 4px 14px;
  text-align: center;
  font-size: 16px;
  word-break: break-all;
  word-wrap: break-word;
}

.dropdown {
  vertical-align: top;
}

#account {
  position: absolute;
  left: 50%;
  margin-left: -60px;
}

.dropdown li {
  color: #717C87;
  margin: 0;
}

.dropdown li .ae-button {
  margin: 0;
}

.dropdown .ae-dropdown-button {
  color: #717C87;
  vertical-align: top;
  height: 50px;
  width: 50px;
  display: inline-block !important;
}

.dropdown .dropdown-button-icon {
  font-size: 1.5rem;
  margin: 0 auto 5px;
  display: block;
}

.dropdown .dropdown-button-name {
  display: block;
  margin: 0 auto;
}

#network-dropdown li .status::before {
  content: '';
  display: inline-block;
  width: 8px;
  height: 8px;
  -moz-border-radius: 7.5px;
  -webkit-border-radius: 7.5px;
  border-radius: 7.5px;
  margin-right: 5px;
  border: 1px solid #DDD;
  background-color: #EFEFEF;
}

#network-dropdown li .status.current::before {
  border-color: green;
  background-color: greenyellow;
}

#account .ae-dropdown-button {
  width: 120px;
}

#account .dropdown-button-icon.ae-identicon.base {
  height: 1.8rem;
  margin-bottom: 3px;
  vertical-align: top;
}

#account .ae-dropdown-button .dropdown-button-name {
  max-width: 100%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

#account .subAccountIcon {
  margin-right: 5px;
}

#account .subAccountCheckbox {
  float: right;
}

</style>