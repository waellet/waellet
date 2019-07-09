<template>
  <ae-main @click.native="hideMenu">
      <ae-header :class="account.publicKey && isLoggedIn ? 'logged' : ''">

        <!-- login screen header -->
        <div class="logo_top" slot="mobile-left" v-if="!isLoggedIn">
          <img :src="logo_top" alt="">
          <p>{{ language.system.name }} <span class="extensionVersion extensionVersionTop">{{extensionVersion}}</span></p>
          
        </div>
        
        <!-- logged in header START -->
          <!-- network dropdown -->
          <div id="network" class="dropdown" v-if="account.publicKey && isLoggedIn" slot="mobile-left" direction="left" ref="network">
            <button v-on:click.prevent="toggleDropdown">
              <ae-icon class="dropdown-button-icon status" name="globe" slot="button" />
              <span class="dropdown-button-name" v-html="current.network" slot="button"></span>
            </button>
            <transition name="slide-fade">
              <ul v-if="dropdown.network" class="dropdown-holder">
                <li v-for="(value, name) in network" v-bind:key="value.networkId">
                  <ae-button v-on:click="switchNetwork(name)" class="status triggerhidedd" :class="current.network == name ? 'current' : ''">
                      {{ name }}
                  </ae-button>
                </li>
              </ul>
            </transition>
          </div>

          <!-- account dropdown -->
          <div id="account" class="dropdown" v-if="account.publicKey && isLoggedIn" slot="mobile-right" direction="center" ref="account">
            <button v-on:click.prevent="toggleDropdown">
              <ae-identicon id="identIcon" class="dropdown-button-icon" v-bind:address="this.account.publicKey" size="base" slot="button" />
              <span class="dropdown-button-name" slot="button">{{ activeAccountName }}</span>
            </button>
            <transition name="slide-fade">
              <ae-list v-if="dropdown.account" class="dropdown-holder">
                <ae-list-item fill="neutral"  @click="changeAccount(index,subaccount)" :class="activeAccount == index ? 'activeAccount' : '' " v-for="(subaccount,index) in subaccounts" v-bind:key="index">
                    <ae-identicon class="subAccountIcon" v-bind:address="subaccount.publicKey" size="base" />
                    <div class="subAccountInfo">
                      <div class="subAccountName">{{subaccount.name}}</div>
                      <div class="subAccountBalance">{{subaccount.balance}} AE</div>
                    </div>
                    <ae-check class="subAccountCheckbox"  type="radio" :value="index" v-model="activeAccount" /> 
                </ae-list-item>
                <ae-list-item fill="neutral" class="manageAccounts">
                  <ae-button @click="manageAccounts" class="triggerhidedd">
                    <ae-button face="icon" fill="primary" class="iconBtn">
                      <ae-icon name="plus" />
                    </ae-button>
                    <span class="newSubaccount">{{ language.strings.manageAccounts }}</span>
                  </ae-button>
                </ae-list-item>
              </ae-list>
            </transition>
          </div>

          <!-- settings dropdown -->
          <div id="settings" class="dropdown" v-if="account.publicKey && isLoggedIn" slot="mobile-right" direction="right" ref="settings">
            <button v-on:click="toggleDropdown">
              <ae-icon class="dropdown-button-icon" name="burger" slot="button" />
              <span class="dropdown-button-name" slot="button">{{ language.strings.menu }}</span>
            </button>
            <transition name="slide-fade">
              <ul v-if="dropdown.settings" class="dropdown-holder">
                <li>
                  <ae-button @click="myAccount" class="toAccount">
                    <ae-icon name="home" />
                    {{ language.strings.myAccount }}
                  </ae-button>
                </li>
                <li>
                  <ae-button @click="settings" class="settings">
                    <ae-icon name="settings" />
                    {{ language.strings.settings }}
                  </ae-button>
                </li>
                <li>
                  <ae-button @click="exportKeypair('keystore')" id="exportKeystore">
                    <ae-icon name="save" />
                    {{ language.strings.exportKeystore }}
                  </ae-button>
                </li>
                <li id="languages" class="have-subDropdown" :class="dropdown.languages ? 'show' : ''">
                  <ae-button @click="toggleDropdown($event, '.have-subDropdown')">
                    <ae-icon name="globe" />
                    {{ language.strings.switchLanguage }}
                    <ae-icon name="left-more" />
                  </ae-button>
                  <!-- Language sub dropdown -->
                  <ul class="sub-dropdown">
                    <li v-for="(value, name) in locales" v-bind:key="name">
                      <ae-button v-on:click="switchLanguage(name)" class="triggerhidedd" :class="current.language == name ? 'current' : ''">
                        <img :src="'../icons/flag_'+name+'.png'" />
                        {{ name }}
                      </ae-button>
                    </li>
                  </ul>
                </li>
                <li>
                  <ae-button @click="logout" class="toLogout">
                    <ae-icon name="sign-out" />
                    {{ language.strings.logout }}
                  </ae-button>
                </li>
              </ul>
            </transition>
          </div>
        <!-- logged in header END -->
      </ae-header>
      <ae-modal-light
        v-if="popup.show"
        @close="closePopup"
        :title="popup.title"
        :class="popup.secondBtn ? 'modal-two-buttons' : '' "
      >
        <div v-html="popup.msg"></div>
        <ae-button
          size="small"
          type="exciting"
          class="popup-button"
          face="round"
          :fill="popupButtonFill"
          uppercase
          @click.native="closePopup"
          slot="buttons"
        >OK</ae-button>
        <ae-button
          v-if="popup.secondBtn"
          class="popup-button"
          face="round"
          fill="secondary"
          uppercase
          @click.native="popupSecondBtnClick"
          slot="buttons"
        >See in explorer</ae-button>
      </ae-modal-light>
    <router-view></router-view>
    <span class="extensionVersion " v-if="isLoggedIn">{{ language.system.name }} {{extensionVersion}} </span>
    <transition name="fadeOut">
      <span v-if="mainLoading" class="mainLoader"><ae-loader v-bind="{'content':''}" /></span>
    </transition>
  </ae-main>
</template>

<script>
import Ae from '@aeternity/aepp-sdk/es/ae/universal';
import store from '../store';
import locales from './locales/locales.json'
import { mapGetters } from 'vuex';
import { saveAs } from 'file-saver';
import { setTimeout } from 'timers';
import { fetchData } from './utils/helper';

export default {
  
  data () {
    return {
      logo_top: browser.runtime.getURL('../../../icons/icon_48.png'),
      language: locales['en'],
      locales: locales,
      dropdown: {
        network: false,
        settings: false,
        account: false,
        languages: false
      },
      mainLoading: true,
    }
  },
  computed: {
    ...mapGetters (['account', 'current', 'network','popup','isLoggedIn', 'AeAPI','subaccounts','activeAccount', 'balance','activeAccountName']),
    popupButtonFill(){
      return this.popup.type == 'error' ? 'primary' : 'alternative';
    },
    extensionVersion() {
      return 'v.' + browser.runtime.getManifest().version + 'beta'
    }
  },
  created: function () {
    browser.storage.sync.set({language: 'en'}).then(() => {
      this.language = locales['en'];
    });
    // browser.storage.sync.get('language', langChoose => {
    //   this.language = locales[langChoose.language];
    // });
      // fetch api one time
    let states = this.$store.state;
    if (typeof states.aeAPI == 'undefined') {
      this.$store.state.aeAPI = this.fetchApi();
    }
  },
  mounted: function mounted () {
    this.hideLoader();
    this.dropdown.settings = false; this.dropdown.languages = false;
  },
  methods: {
    hideLoader() {
      var self = this;
      setTimeout(function() {
        self.mainLoading = false;
      }, 1000);
    },
    changeAccount (index,subaccount) {
      browser.storage.sync.set({activeAccount: index}).then(() => {
        this.$store.commit('SET_ACTIVE_ACCOUNT', {publicKey:subaccount.publicKey,index:index});
        this.dropdown.account = false;
      });
    },
    hideMenu (event) {
      let target = event.target
      
      // Hide dropdown menu on click of the element with class triggerhidedd
      if (typeof target != 'undefined' && (target.className.indexOf('triggerhidedd') > -1 || target.parentElement.className.indexOf('triggerhidedd') > -1)) {
        let dropdownParent = event.target.closest('.dropdown');
        this.dropdown[dropdownParent.id] = !this.dropdown[dropdownParent.id];
        if (event.target.closest('.have-subDropdown') != null) {
          dropdownParent = event.target.closest('.have-subDropdown');
          this.dropdown[dropdownParent.id] = !this.dropdown[dropdownParent.id];
        }
      }
      for (var tar in this.dropdown) {
        let el = this.$refs[tar];
        if ( tar != 'languages' && typeof el != 'undefined' && el !== target && !el.contains(target)) {
          this.dropdown[tar]=false
        }
      }
    },
    toggleDropdown(event, parentClass) {
      if (typeof parentClass == 'undefined') {
        parentClass = '.dropdown';
      }
      let dropdownParent = event.target.closest(parentClass);
      this.dropdown[dropdownParent.id] = !this.dropdown[dropdownParent.id]
    },
    switchLanguage(languageChoose) {
      browser.storage.sync.set({language: languageChoose}).then(() => {
        this.language = locales[languageChoose];
        this.current.language = languageChoose;
      });
    },
    switchNetwork (network) {
      this.$store.dispatch('switchNetwork', network).then(() => {
        this.$store.state.aeAPI = this.fetchApi();
        this.$store.dispatch('updateBalance');
        let transactions = this.$store.dispatch('getTransactionsByPublicKey',{publicKey:this.account.publicKey,limit:3});
        transactions.then(res => {
          this.$store.dispatch('updateLatestTransactions',res);
        });
      }); 
    },
    logout () {
      browser.storage.sync.set({isLogged: false}).then(() => {
        browser.storage.sync.set({wallet: ''}).then(() => {
          browser.storage.sync.set({activeAccount: 0}).then(() => {
            this.dropdown.settings = false; this.dropdown.languages = false;
            this.dropdown.account = false;
            this.$store.commit('SET_ACTIVE_ACCOUNT', {publicKey:'',index:0});
            this.$store.commit('UNSET_SUBACCOUNTS');
            this.$store.commit('UPDATE_ACCOUNT', '');
            this.$store.commit('SWITCH_LOGGED_IN', false);
            this.$store.commit('SET_WALLET', []);
            browser.storage.sync.get('allowTracking').then(result => {
              if(result.allowTracking == true) {
                  fetchData('https://stats.waellet.com/user/logout', 'post', this.isLogged);
              }
            });
            this.$router.push('/');
          });
        });
      });
    }, 
    closePopup() {
      this.$store.commit('HIDE_POPUP');
    },
    popupAlert(payload) {
      this.$store.dispatch('popupAlert', payload)
    },
    myAccount () {
      this.dropdown.settings = false; this.dropdown.languages = false;
      this.$router.push('/account');
    },
    settings () {
      this.dropdown.settings = false; this.dropdown.languages = false;
      this.$router.push('/settings');
    },
    manageAccounts () {
      this.$router.push('/manageAccounts');
    },
    exportKeypair (type) {
      if(type == 'keypair') {
        let blobData = JSON.stringify({"publicKey": this.account.publicKey, "secretKey": this.account.secretKey});
        let blob = new Blob([blobData], {type: "application/json;charset=utf-8"});
        saveAs(blob, "keypair.json");
        this.dropdown.settings = false; this.dropdown.languages = false; 
      }else if(type == 'keystore') {
        let blobData = "";
        try {
          blobData = JSON.parse(this.account.encryptedPrivateKey);
        }catch(err) {
          blobData = JSON.stringify(this.account.encryptedPrivateKey);
        }
        let blob = new Blob([blobData], {type: "application/json;charset=utf-8"});
        saveAs(blob, "keystore.json");
        this.dropdown.settings = false; this.dropdown.languages = false;
      }
    },
    popupSecondBtnClick(){
      this[this.popup.secondBtnClick]();
    },
    showTransaction(){
      browser.tabs.create({url: this.popup.data, active: false});
    },
    fetchApi() {
      let states = this.$store.state;
      let ae = Ae({
          url: states.network[states.current.network].url,
          internalUrl: states.network[states.current.network].internalUrl,
          keypair: {
            secretKey: states.account.secretKey,
            publicKey: states.account.publicKey,
          },
          networkId: states.network[states.current.network].networkId,
      });
      return ae;
    }
  }
};
</script>

<style lang="scss">
@import '../common/base';
@-moz-document url-prefix() {
  html { scrollbar-width: none; }
}
// ::-webkit-scrollbar { 
//     display: none; 
// }
.ae-main { width: 380px; }
.fadeOut-enter-active, .fadeOut-leave-active { transition: all .5s ease-in-out; }
.fadeOut-leave-to { opacity: 0; }
.mainLoader { position: fixed; width: 100%; height: 100%; background-color: #FFF; top: 0; }
.mainLoader .ae-loader { position: absolute; top: 50%; left: 50%; margin: -1.5em; width: 3em !important; height: 3em !important; border-radius: 3em !important; }
html { min-width: 357px; min-height: 600px; background-color: #f5f5f5; }
p { font-weight: bolder; margin-left: 3px; }
input { background: transparent; border: none; border-bottom: 1px; height: 25px; line-height: 25px; }
input:focus { border-bottom: 1px solid #DDD; }
button:focus { outline: none; }
button { background: none; border: none; color: #717C87; cursor: pointer; transition: all 0.2s; }
// .ae-button + .ae-button { margin-top: 1rem; }
.pageTitle { margin: 0 0 10px; }
.ae-header { border-bottom: 1px solid #EEE; margin-bottom: 10px; }
.ae-header.logged { background: #001833; }
.ae-header.logged > * { color: #717C87; }
.logo_top { display: flex; flex-flow: row wrap; justify-content: center; vertical-align: center; }
.logo_top p { color: #FF0D6A; font-size: 20px; line-height: 12px; }
.popup { color: #555; padding: 4px 14px; text-align: center; font-size: 16px; word-break: break-all; word-wrap: break-word; }
#network li .status::before { content: ''; display: inline-block; width: 8px; height: 8px; -moz-border-radius: 7.5px; -webkit-border-radius: 7.5px; border-radius: 7.5px; margin-right: 5px;
                border: 1px solid #DDD; background-color: #EFEFEF; }
#network li .status.current::before { border-color: green; background-color: greenyellow; }
#account { position: absolute; left: 50%; margin-left: -60px; top: 50%; margin-top: -27px; }
#account  > button { width: 120px; }
#account .dropdown-button-icon.ae-identicon.base { height: 1.8rem; margin-bottom: 3px; vertical-align: top; }
#account .ae-dropdown-button .dropdown-button-name { max-width: 100%; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.subAccountIcon { margin-right: 10px; }
.subAccountName { /*width: 110px; line-height: 28px;*/ color: #000; text-overflow: ellipsis; overflow: hidden; font-weight:bold; margin-bottom:0 !important;}
.subAccountBalance { font-family: monospace; margin-bottom:0 !important;}
.subAccountInfo { margin-right:auto; margin-bottom:0 !important; }
#account .subAccountCheckbox { float: right; }
#account li { padding:0.75rem; cursor:pointer !important; }
#account ul { width:250px; margin:0; transform:translateX(-50%); -webkit-transform:translateX(-50%); -ms-transform:translateX(-50%); }
#account .activeAccount { background: #f6f6f6; }
#account .manageAccounts { padding:0; }
#account .manageAccounts button { padding:1.2rem 1rem; height: auto; }
#account .iconBtn { padding: 0 !important; height: 30px !important; width: 30px; color: #fff; text-align: center; margin-right: 8px;}
#account .iconBtn i { color: #fff !important; font-size: 1.2rem !important; margin: 0;float: none; text-align: center;}
.ae-check .ae-check-button { float: right; min-width: 0 !important; min-height: 0 !important; padding-left: 0 !important; }
.ae-check-button:before { position: static !important; }
.ae-check-button:after { left: 0 !important; top: 0 !important; width: 28px !important; height: 28px !important; }
.ae-check > input[type="radio"]:checked + .ae-check-button:before, .ae-check > input[type="checkbox"]:checked + .ae-check-button:before { border-color: #dae1ea !important; }
#settings li .ae-icon { font-size: 1.2rem; margin-right: 10px; }
#languages .ae-button img { margin-right: 5px; }
#languages .ae-button.current { text-decoration: underline; }
.dropdown { display: inline-block; position: relative; vertical-align: top; }
.dropdown[direction="left"] ul { left: 0; }
.dropdown[direction="right"] ul { right: 0; }
.dropdown[direction="center"] ul { width: 200px; left: 50%; margin-left: -100px; }
.dropdown > ul { min-width: 120px; position: absolute; top: 100%; padding: 0; background-color: #FFF; z-index: 1; }
.dropdown ul { transition: all 0.2s; margin: 0; padding: 5px 0; overflow: hidden; border-radius: 4px; box-shadow: 0 0 16px rgba(0, 33, 87, 0.15); list-style: none; }
.dropdown ul.sub-dropdown { box-shadow: none; visibility: hidden; max-height:0; padding: 0; overflow: hidden; transition: all 0.3s ease-in-out; }
.dropdown .have-subDropdown.show ul.sub-dropdown { visibility: visible; max-height: 165px; }
.dropdown ul.sub-dropdown .ae-button { padding: 0 2rem; }
.dropdown ul li .ae-button { width: 100%; text-align: left; margin: 0; padding: 0 1rem; white-space: nowrap; justify-content: unset; }
.dropdown ul li .ae-button .ae-icon-left-more { margin-top: 3px; transition: all 0.3s; }
.dropdown .have-subDropdown.show .ae-button .ae-icon-left-more { transform: rotate(90deg); }
#account.dropdown ul li .ae-button > * { display: inline-block; vertical-align: middle; }
.dropdown li { color: #717C87; margin: 0; }
.dropdown li > .ae-button:hover, .sub-dropdown li:not(.backBtn) > .ae-button:hover { background-color: #F3F3F3; }
.dropdown li > .ae-button { width: 100%; }
.dropdown > .ae-button { text-align: center; }
.dropdown > .ae-button, .dropdown .ae-dropdown-button { color: #717C87; vertical-align: top; height: 50px; width: 50px; display: inline-block !important; }
.dropdown .dropdown-button-icon { font-size: 1.5rem; margin: 0 auto 5px; display: block; }
.dropdown .dropdown-button-name { display: block; margin: 0 auto; }
.dropdown > button:hover, .dropdown > .ae-dropdown-button:hover { color: #FFF; }
.slide-fade-enter-active { transition: all .3s ease; }
.slide-fade-leave-active { transition: all .2s ease; }
.slide-fade-enter { transform: translateY(-50px); }
.slide-fade-leave-to { transform: translateY(-50px); opacity: 0; }
.extensionVersion { color: #909090; display:block;text-align:center; padding:1.5rem 1rem; }
.extensionVersionTop { padding: 0; display: inline-block; font-size: 1rem; line-height: 12px; font-weight: normal; }
.Password .passwordStrengthMeter { position: relative; height: 5px; }
.Password + .ae-input-container { margin-top: 0 !important; }
.Password .passwordStrengthMeter .Password__strength-meter--fill[data-score="0"] { background: $primary-color }
.Password .passwordStrengthMeter .Password__strength-meter--fill[data-score="1"] { background: #d728b3 }
.Password .passwordStrengthMeter .Password__strength-meter--fill[data-score="2"] { background: #9d3fc0 }
.Password .passwordStrengthMeter .Password__strength-meter--fill[data-score="3"] { background: #1d7fe2 }
.Password .passwordStrengthMeter .Password__strength-meter--fill[data-score="4"] { background: $color-alternative }
</style>