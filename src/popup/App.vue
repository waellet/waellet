<template>
  <ae-main @click.native="hideMenu">
      <ae-header :class="account.publicKey && isLoggedIn ? 'logged' : ''">

        <!-- login screen header -->
        <div class="logo_top" slot="mobile-left" v-if="!isLoggedIn">
          <img :src="logo_top" alt="">
          <p>{{ language.system.name }}</p>
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
              <span class="dropdown-button-name" slot="button">{{ language.strings.currentAccountName }}</span>
            </button>
            <transition name="slide-fade">
              <ul v-if="dropdown.account" class="dropdown-holder">
                <li>
                  <ae-button v-on:click="changeAccount">
                    <ae-identicon class="subAccountIcon" v-bind:address="this.account.publicKey" size="xs" />
                    <span class="subAccountName">{{ language.strings.currentAccountName }}</span>
                    <ae-check class="subAccountCheckbox" :checked="true" type="radio" value="1" v-model="singleChoice" />
                  </ae-button>
                </li>
                <li>
                  <ae-button v-on:click="changeAccount">
                    <ae-identicon class="subAccountIcon" v-bind:address="this.account.publicKey" size="xs" />
                    <span class="subAccountName">MySubAccountName</span>
                    <ae-check class="subAccountCheckbox" type="radio" value="2" v-model="singleChoice" />
                  </ae-button>
                </li>
                <li>
                  <ae-button @click="manageAccounts" class="triggerhidedd">
                    <ae-icon name="new-subaccount" />
                    <span class="newSubaccount">{{ language.strings.manageAccounts }}</span>
                  </ae-button>
                </li>
              </ul>
            </transition>
          </div>

          <!-- settings dropdown -->
          <div id="settings" class="dropdown" v-if="account.publicKey && isLoggedIn" slot="mobile-right" direction="right" ref="settings">
            <button v-on:click="toggleDropdown">
              <ae-icon class="dropdown-button-icon" name="settings" slot="button" />
              <span class="dropdown-button-name" slot="button">{{ language.strings.settings }}</span>
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
                  <ae-button @click="exportKeypair('keypair')">
                    <ae-icon name="save" />
                    {{ language.strings.exportKeypair }}
                  </ae-button>
                </li>
                <li>
                  <ae-button @click="exportKeypair('keystore')">
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
                      <ae-button v-on:click="switchLanguage(name)" class="triggerhidedd">
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
      logo_top: chrome.runtime.getURL('../../../icons/icon_48.png'),
      language: locales['en'],
      locales: locales,
      dropdown: {
        network: false,
        settings: false,
        account: false,
        languages: false
      },
      singleChoice: undefined
    }
  },
  computed: {
    ...mapGetters (['account', 'current', 'network','popup','isLoggedIn']),
    popupButtonFill(){
      return this.popup.type == 'error' ? 'primary' : 'alternative';
    }
  },
  methods: {
    changeAccount (event) {
      console.log('Change account');
    },
    hideMenu (event) {
      let target = event.target
      
      // Hide dropdown menu on click of the element with class triggerhidedd
      if (typeof target != 'undefined' && (target.className.indexOf('triggerhidedd') > -1 || target.parentElement.className.indexOf('triggerhidedd') > -1)) {
        let dropdownParent = event.target.closest('.dropdown');
        this.dropdown[dropdownParent.id] = !this.dropdown[dropdownParent.id];
        if (event.target.closest('.have-subDropdown') != null) {
          dropdownParent = event.target.closest('.have-subDropdown');
          this.dropdown[dropdownParent.id] = !this.dropdown[dropdownParent.id]
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
    switchLanguage(language) {
      console.log('switch language to', language);
    },
    switchNetwork (network) {
      this.$store.dispatch('switchNetwork', network).then(() => {
        this.$store.dispatch('updateBalance');
        let transactions = this.$store.dispatch('getTransactionsByPublicKey',{publicKey:this.account.publicKey,limit:3});
        transactions.then(res => {
          this.$store.dispatch('updateLatestTransactions',res);
        });
      }); 
    },
    logout () {
      chrome.storage.sync.set({isLogged: false}, () => {
        this.$store.commit('UPDATE_ACCOUNT', '');
        this.$store.commit('SWITCH_LOGGED_IN', false);
        this.$router.push('/');
      });
    }, 
    closePopup() {
      this.$store.commit('HIDE_POPUP');
    },
    popupAlert(payload) {
      this.$store.dispatch('popupAlert', payload)
    },
    myAccount () {
      this.$router.push('/account');
    },
    manageAccounts () {
      this.$router.push('/manageAccounts');
    },
    exportKeypair (type) {
      if(type == 'keypair') {
        let blobData = JSON.stringify({"publicKey": this.account.publicKey, "secretKey": this.account.secretKey});
        let blob = new Blob([blobData], {type: "application/json;charset=utf-8"});
        saveAs(blob, "keypair.json");
      }else if(type == 'keystore') {
        let blobData = "";
        try {
          blobData = JSON.parse(this.account.encryptedPrivateKey);
          blobData = JSON.stringify(this.account.encryptedPrivateKey);
        }catch(err) {
          blobData = JSON.stringify(this.account.encryptedPrivateKey);
        }
        
        console.log( this.account.encryptedPrivateKey);
        let blob = new Blob([blobData], {type: "application/json;charset=utf-8"});
        saveAs(blob, "keystore.json");
      }
      
    },
    popupSecondBtnClick(){
      this[this.popup.secondBtnClick]();
    },
    showTransaction(){
      chrome.tabs.create({url: this.popup.data, active: false});
    },
  }
};
</script>

<style lang="scss">
@import '../common/base';
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
#account .subAccountIcon { margin-right: 5px; }
#account .subAccountName { width: 110px; line-height: 28px; color: #000; text-overflow: ellipsis; overflow: hidden; }
#account .subAccountCheckbox { float: right; }
.ae-check .ae-check-button { float: right; min-width: 0 !important; min-height: 0 !important; padding-left: 0 !important; }
.ae-check-button:before { position: static !important; }
.ae-check-button:after { left: 0 !important; top: 0 !important; width: 28px !important; height: 28px !important; }
.ae-check > input[type="radio"]:checked + .ae-check-button:before, .ae-check > input[type="checkbox"]:checked + .ae-check-button:before { border-color: #dae1ea !important; }
#settings li .ae-icon { font-size: 1.2rem; margin-right: 10px; }
#languages .ae-button img { margin-right: 5px; }
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
</style>