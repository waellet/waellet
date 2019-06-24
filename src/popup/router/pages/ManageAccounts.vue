<template>
    <ae-main>
        <div id="manageAccounts" class="popup">
            <h2 class="pageTitle">{{ language.strings.manageAccounts }}</h2>
            <ae-list face="primary">
                <ae-list-item class="editaccount" fill="secondary">
                    <!-- IF not edit -->
                    <div v-if="!editAccountName">
                        <span class="name">{{ new_accnameValue }}</span>
                        <button v-on:click="editAccountName = !editAccountName"><ae-icon name="edit" /></button>
                    </div>
                    <!-- IF edit -->
                    <div v-if="editAccountName">
                        <ae-input-plain placeholder="Type here.." v-model="new_accname" :value="language.strings.currentAccountName" />
                        <button v-on:click="cancelEdit"><ae-icon name="close" /></button>
                        <button @click="nameSave"><ae-icon name="check" /></button>
                    </div>
                </ae-list-item>
                <ae-list-item class="addaccount" fill="secondary">
                    <div v-if="!аddNewSubbAcc">
                        <span>{{ language.strings.addNewSubAccount }}</span>
                        <button v-on:click="AddNewSubbAccount"><ae-icon name="plus" /></button>
                    </div>
                    <div v-if="аddNewSubbAcc">
                        <span>{{ language.strings.addNewSubAccount }}</span>
                        <button v-on:click="closeNewSubbAccountForm"><ae-icon name="close" /></button>
                    </div>
                </ae-list-item>
            </ae-list>
            <transition name="slide">
                <ul class="slideform" v-if="dropdown">
                    <div class="add-form">
                        <h4 class="pageTitle">{{ language.strings.addNewSubAccount }}</h4>
                        <label style="float:left;"> {{ language.strings.account }}<span class="required_fields">*</span></label>
                        <ae-input v-model="newSubAcc" placeholder="Add name"></ae-input>
                        <hr>
                        <small><span class="required_fields">*</span> {{ language.messages.requiredFields }} </small>
                        <ae-button @click="addbtn" face="round" fill="primary" extend>{{ language.buttons.add }}</ae-button>
                    </div>
                </ul>
            </transition>
        </div>
    </ae-main>
</template>

<script>
import store from '../../../store';
import locales from '../../locales/locales.json'
import { mapGetters } from 'vuex';

export default {
    data () {
        return {
            logo_top: chrome.runtime.getURL('../../../icons/icon_48.png'),
            language: locales['en'],
            locales: locales,
            new_accname: '',
            new_accnameValue: 'MyAccount',
            editAccountName: false,
            аddNewSubbAcc: false,
            dropdown: false,
            newSubAcc: ''
        }
    },
    computed: {
        ...mapGetters (['account', 'current', 'network','subaccounts'])
    },
    methods: {
        myAccount () {
            this.$router.push('/account');
        },
        nameSave () {
            if (this.new_accname != "") {
                this.new_accnameValue = this.new_accname;
                this.editAccountName = false;
            }
            else {
                this.$store.dispatch('popupAlert', {
                    name: 'account',
                    type: 'requiredField'
                });
            }
        },
        AddNewSubbAccount() {
            this.аddNewSubbAcc = true;
            this.dropdown = true;
        },
        closeNewSubbAccountForm() {
            this.dropdown = false;
            this.аddNewSubbAcc = false;
        },
        addbtn() {
            if (this.newSubAcc != '') {
                let public_K = getAddressFromPriv(this.account.secretKey, this.subaccounts.length);
                this.$store.dispatch('setSubAccounts', {
                    name: this.newSubAcc,
                    publickKey: publick_K
                }).then(() => {
                    chrome.storage.sync.set({ 
                        subaccounts: this.subaccounts
                    });
                });

                this.$store.dispatch('popupAlert', {
                    name: 'account',
                    type: 'added_success'
                });
            }
            else {
                this.$store.dispatch('popupAlert', {
                    name: 'account',
                    type: 'requiredField'
                });
            }
            this.newSubAcc = "";
        },
        cancelEdit() {
            this.editAccountName = false;
        },
    }
}
</script>

<style lang="scss">
@import '../../../common/base';

#manageAccounts .btnBack { display: block; margin-bottom: 15px; }
#manageAccounts .btnBack .ae-icon { transform: rotate(180deg); vertical-align: bottom; }
.ae-list-item { cursor: default !important; }
.ae-list-item .ae-icon { float: right; font-size: 1.2rem; }
.ae-icon-edit, .ae-icon-plus { color: #00b6ff !important; }
.ae-icon-check { color: #13b100 !important; }
.ae-icon-close { color: #b10000 !important; }
.editaccount div, .addaccount div { width: 100%; }
.editaccount div span, .editaccount div input, .addaccount div span { float: left; }
.editaccount div button, .addaccount div button { float: right; }
.editaccount div input { width: 70% !important; }

.slideform { position: relative; width: 100%; overflow: hidden; padding: 0; top: 10px; list-style-type: none;
    box-shadow: 0 0 8px rgba(0, 33, 87, 0.15); transform-origin: top; transition: transform .4s ease-in-out; }
.slide-enter, .slide-leave-to{ transform: scaleY(0); }
.add-form { text-align: center; padding: 15px; margin: 10px; }
.required_fields { color: red; margin: 5px; }
.ae-list-item .ae-icon { font-size: 1.7rem !important; }

</style>