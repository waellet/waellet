<template>
    <div id="manageNetworks" class="popup">
        <div class="actions">
            <button class="backbutton toAccount" @click="navigateAccount"><ae-icon name="back" /> {{language.buttons.backToAccount}}</button>
        </div>
        <h3>{{ language.strings.manageNetworks }}</h3>
        <ae-panel>
            <h4>{{ language.strings.networks }}</h4>
            <hr>
            <ae-list >
                <ae-list-item class="editaccount" fill="neutral" v-for="(userNetowrk, index) in userNetworks" v-bind:key="index">
                    <div>
                        <span class="name">{{ userNetowrk.name }}</span>
                        <button @click="removeUserNetworkCheck(userNetowrk.name)"><ae-icon name="close" class="primary" /></button>
                    </div>
                </ae-list-item>
                
            </ae-list>
        </ae-panel>
        <ae-panel>
            <h4 class="addaccount">
                {{ language.strings.addNewNetwork }}
                <button class="icon-btn" v-if="!аddNewUserNetwork" @click="AddNewUserNetwork"><ae-icon name="plus" /></button>
                <button class="icon-btn" v-if="аddNewUserNetwork" @click="closeNewUserNetworkForm"><ae-icon name="close" /></button>
            </h4>
            <hr>
            <transition name="slide">
                <ul class="slideform" :class="dropdown ? 'open' : ''">
                    <div class="add-form">
                        <!-- <h4 class="pageTitle">{{ language.strings.addNewNetwork }}</h4> -->
                        <!-- <label style="float:left;"> {{ language.strings.networkName }}<span class="required_fields">*</span></label> -->
                        <ae-input class="node-name" :label="language.strings.networkName" v-model="newUserNetwork" placeholder="Add Node name"></ae-input>
                        <!-- <label style="float:left; margin-top: 10px;"> {{ language.strings.networkURL }}<span class="required_fields">*</span></label> -->
                        <ae-input class="node-url" :label="language.strings.networkURL" v-model="newUserNetworkURL" placeholder="Add Node URL"></ae-input>
                        <!-- <hr>
                        <small><span class="required_fields">*</span> {{ language.messages.requiredFields }} </small> -->
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

export default {
    data () {
        return {
            logo_top: browser.runtime.getURL('../../../icons/icon_48.png'),
            language: locales['en'],
            locales: locales,
            editNetworkName: false,
            аddNewUserNetwork: false,
            dropdown: false,
            newUserNetwork: '',
            newUserNetworkURL: ''
        }
    },
    computed: {
        ...mapGetters (['current', 'userNetworks', 'wallet', 'popup'])
    },
    created(){

    },
    methods: {
        removeUserNetwork () {
        let networkName = this.popup.data;
            // deleteIndex = null;
        if (networkName != '') {
            let un = this.userNetworks.filter(d => {
                return d.name != networkName
            });
            this.$store.dispatch('setUserNetworks', un).then(() => {
                browser.storage.sync.set({ userNetworks: un}).then(() => {
                delete this.$store.state.network[networkName];
                });
            });
        }
        },
        removeUserNetworkCheck (name) {
            if (this.$store.state.current.network == name) {
                this.$store.dispatch('popupAlert', {
                    name: 'network',
                    type: 'cannot_remove',
                });
            } else {
                this.$store.dispatch('popupAlert', {
                    name: 'network',
                    type: 'confirm_remove',
                    data: name
                });
            }
        },
        AddNewUserNetwork() {
            this.аddNewUserNetwork = true;
            this.dropdown = true;
        },
        closeNewUserNetworkForm() {
            this.dropdown = false;
            this.аddNewUserNetwork = false;
        },
        addbtn() {
            let sameNameNetwork = false,
                networkName = this.newUserNetwork,
                networkURL = this.newUserNetworkURL,
                index =  this.userNetworks.length - 1,
                newNetwork = {
                    name: networkName,
                    url: networkURL,
                    internalUrl: this.$store.state.network.Testnet.internalUrl,
                    networkId: this.$store.state.network.Testnet.networkId+'_user'+index,
                    middlewareUrl: this.$store.state.network.Testnet.middlewareUrl,
                    explorerUrl: this.$store.state.network.Testnet.explorerUrl
                };
            Object.keys(this.$store.state.network).forEach((name) => {
                if (name == networkName) {
                    sameNameNetwork = true;
                    return;
                }
            });
            if (networkName != '' && networkURL != '' && !sameNameNetwork) {
                this.$store.dispatch('setUserNetwork', newNetwork).then(() => {
                    browser.storage.sync.set({ userNetworks: this.userNetworks}).then(() => {
                        this.$store.dispatch('popupAlert', {
                            name: 'account',
                            type: 'added_success'
                        }).then(() => {
                            this.$store.state.network[networkName] = newNetwork;
                            this.newUserNetwork = "";
                            this.newUserNetworkURL = "";
                            /* UNCOMMENT IF CURRENT NETWORK MUST CHANGE TO ADDED ONE */
                            // this.$store.dispatch('switchNetwork', networkName).then(() => {
                            //     this.$store.state.aeAPI = this.fetchApi();
                            //     this.$store.dispatch('updateBalance');
                            //     let transactions = this.$store.dispatch('getTransactionsByPublicKey',{publicKey:this.account.publicKey,limit:3});
                            //     transactions.then(res => {
                            //         this.$store.dispatch('updateLatestTransactions',res);
                            //     });
                            // }); 
                            this.setNetworks();
                        });
                    });
                });
            }
            else if (sameNameNetwork) {
                this.$store.dispatch('popupAlert', {
                    name: 'network',
                    type: 'name_exists'
                });
            }
            else {
                this.$store.dispatch('popupAlert', {
                    name: 'account',
                    type: 'requiredField'
                });
            }
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
.editaccount div input { width: 60% !important; }

.slideform { position: relative; width: 100%; overflow: hidden; padding: 0; top: 10px; list-style-type: none; height: 0; margin:0;
    /*box-shadow: 0 0 8px rgba(0, 33, 87, 0.15);*/ transform-origin: top; transition: all .4s ease-in-out; }
.slide-enter, .slide-leave-to{ transform: scaleY(0); }
.add-form { text-align: center; /*padding: 15px; margin: 10px; */}
.required_fields { color: red; margin: 5px; }
.ae-list-item .ae-icon, h4 .ae-icon { font-size: 1.7rem !important; }
.add-form .ae-input-container { margin-bottom: 1rem; }
.slideform.open { height:240px }
.ae-button { margin-top: 1rem}
</style>