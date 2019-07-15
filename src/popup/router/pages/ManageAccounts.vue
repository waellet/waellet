<template>
    <div id="manageAccounts" class="popup">
        <div class="actions">
            <button class="backbutton toAccount" @click="navigateAccount"><ae-icon name="back" /> {{language.buttons.backToAccount}}</button>
        </div>
        <h3>{{ language.strings.manageAccounts }}</h3>
        <ae-panel>
            <h4>All accounts</h4>
            <hr>
            <ae-list >
                <ae-list-item class="editaccount" fill="neutral" v-for="(subaccount, index) in accounts" v-bind:key="index">
                    <!-- IF not edit -->
                    <div v-if="!subaccount.edit">
                        <ae-identicon class="subAccountIcon" v-bind:address="subaccount.publicKey" size="base" />
                        <span class="name">{{ subaccount.name }}</span>
                        <button @click="subaccount.edit = !subaccount.edit"><ae-icon name="edit" class="primary" /></button>
                    </div>
                    <!-- IF edit -->
                    <div v-if="subaccount.edit">
                        <ae-identicon class="subAccountIcon" v-bind:address="subaccount.publicKey" size="base" />
                        <ae-input-plain placeholder="Enter name here.." v-model="subaccount.name" />
                        <button @click="cancelEdit(index)"><ae-icon name="close" /></button>
                        <button @click="nameSave(index)"><ae-icon name="check" /></button>  
                    </div>
                </ae-list-item>
                
            </ae-list>
        </ae-panel>
        <ae-panel>
            <h4 class="addaccount">
                Add account 
                <button v-if="!аddNewSubbAcc" @click="AddNewSubbAccount" class="icon-btn"><ae-icon name="plus" /></button>
                <button v-if="аddNewSubbAcc" @click="closeNewSubbAccountForm" class="icon-btn"><ae-icon name="close" /></button>
            </h4>
            <hr>
            <!-- <div class="addaccount" >
                <div v-if="!аddNewSubbAcc">
                    <span>{{ language.strings.addNewSubAccount }}</span>
                    <button @click="AddNewSubbAccount"><ae-icon name="plus" /></button>
                </div>
                <div v-if="аddNewSubbAcc">
                    <span>{{ language.strings.addNewSubAccount }}</span>
                    <button @click="closeNewSubbAccountForm"><ae-icon name="close" /></button>
                </div>
            </div> -->
            <transition name="slide">
                <ul class="slideform" :class="dropdown ? 'open' : ''">
                    <div class="add-form">
                        <!-- <h4 class="pageTitle">{{ language.strings.addNewSubAccount }}</h4> -->
                        <label style="float:left;"> {{ language.strings.account }}<span class="required_fields">*</span></label>
                        <ae-input v-model="newSubAcc" placeholder="Enter name"></ae-input>
                        <hr>
                        <small><span class="required_fields">*</span> {{ language.messages.requiredFields }} </small>
                        <ae-button @click="addbtn" face="round" fill="primary" extend>{{ language.buttons.add }}</ae-button>
                    </div>
                </ul>
            </transition>
        </ae-panel>
        <popup :popupSecondBtnClick="popup.secondBtnClick"></popup>
    </div>
</template>

<script>
import store from '../../../store';
import locales from '../../locales/locales.json'
import { mapGetters } from 'vuex';
import { getHdWalletAccount } from '../../utils/hdWallet';
export default {
    data () {
        return {
            logo_top: browser.runtime.getURL('../../../icons/icon_48.png'),
            language: locales['en'],
            locales: locales,
            new_accname: '',
            new_accnameValue: 'MyAccount',
            editAccountName: false,
            аddNewSubbAcc: false,
            dropdown: false,
            newSubAcc: '',
            accounts:[]
        }
    },
    computed: {
        ...mapGetters (['account', 'current', 'network','subaccounts','wallet', 'popup'])
    },
    created(){
        this.setAccounts();
    },
    methods: {
        setAccounts() {
            this.accounts = this.subaccounts.map(s => {
                return {
                    ...s,
                    edit:false
                }
            });
        },
        cancelEdit(index){
            let account = this.accounts[index];
            account.edit = false;
            account.name = this.subaccounts[index].name;
        },
        nameSave (index) {
            let account = this.accounts[index];
            if (account.name != "") {
                let editedAccounts = this.accounts.map(a => {
                    let { edit, ...acc } = a;
                    return acc;
                });
                this.$store.dispatch('setSubAccounts', editedAccounts).then(() => {
                    browser.storage.sync.set({ subaccounts: this.subaccounts}).then(() => { });
                });
                account.edit = false;
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
                let public_K = getHdWalletAccount(this.wallet, this.subaccounts.length).address;
                this.$store.dispatch('setSubAccount', {
                    name: this.newSubAcc,
                    publicKey: public_K,
                    root:false,
                    balance:0
                }).then(() => {
                    browser.storage.sync.set({ subaccounts: this.subaccounts}).then(() => {
                        this.$store.dispatch('popupAlert', {
                            name: 'account',
                            type: 'added_success'
                        }).then(() => {
                            let index =  this.subaccounts.length - 1;
                            browser.storage.sync.set({activeAccount: index }).then(() => {
                                this.$store.commit('SET_ACTIVE_ACCOUNT', {publicKey:public_K,index:index});
                            });
                            this.setAccounts();
                        });
                    });
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
        navigateAccount() {
            this.$router.push('/account')
        }
    }
}
</script>

<style lang="scss" scoped>
@import '../../../common/base';
.ae-list-item { cursor: default !important; }
.ae-list-item .ae-icon, h4 .ae-icon , h4 .icon-btn{ float: right; font-size: 1.2rem; }
// .ae-icon-edit, .ae-icon-plus { color: #00b6ff !important; }
#manageAccounts .ae-icon-check { color: #13b100 !important; }
#manageAccounts .ae-icon-close { color: #b10000 !important; }
.editaccount:first-child { border-top: none !important; }
.editaccount div, .addaccount div { width: 100%; }
.editaccount div span, .editaccount div input, .addaccount div span, .editaccount div canvas { float: left; }
.editaccount div button, .addaccount div button { float: right; }
.editaccount div input { width: 58% !important; }

.slideform { position: relative; width: 100%; overflow: hidden; height:0; padding: 0; top: 10px; list-style-type: none; margin:0;
    /*box-shadow: 0 0 8px rgba(0, 33, 87, 0.15);*/ transform-origin: top; transition: all .4s ease-in-out; }
.slideform.open { height:200px}
.slide-enter, .slide-leave-to{ transform: scaleY(0); }
.add-form { text-align: center; /*padding: 15px; margin: 10px;*/ }
.required_fields { color: red; margin: 5px; }
.ae-list-item .ae-icon, h4 .ae-icon { font-size: 1.7rem !important; }

</style>