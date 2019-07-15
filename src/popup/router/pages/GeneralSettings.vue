<template>
    <div class="popup">
        <div class="actions">
            <button class="backbutton toAccount" @click="navigateToSettings"><ae-icon name="back" /> {{language.buttons.backToSettings}}</button>
        </div>
        <h3 style='text-align:center;'>{{language.pages.settings.generalSettings.heading}}</h3>
        <ae-panel>
            <div class="maindiv_input-group-addon">
                <h4>{{language.pages.settings.generalSettings.registerName}}</h4><hr>
                <small class="sett_info">{{language.pages.settings.generalSettings.registerNameInfo}}</small>
                <div class="checkName input-group-addon">
                    <input v-model="name" class="addon-input" />
                    <label class="addon-lbl" >.test</label>
                </div>
                <ae-button class="regbtn" face="icon" fill="primary" @click="registerName">
                    <ae-icon name="plus" />
                </ae-button>
                <small style="font-size:12px; display: inline-block;"><ae-icon style="font-size: 15px;" name="github" />{{language.pages.settings.generalSettings.registerNameRequirement}}</small>
            </div>
        </ae-panel>
        
        <ae-panel>
            <div class="maindiv_input-group-addon">
                <h4>Password change</h4><hr>
                
            </div>
        </ae-panel>

        <div v-if="loading" class="loading">
            <ae-loader />
        </div>
        <popup :popupSecondBtnClick="popup.secondBtnClick"></popup>
    </div>
</template>

<script>
import { mapGetters } from 'vuex';
import { getHdWalletAccount } from '../../utils/hdWallet';
import locales from '../../locales/locales.json';
const {Universal} = require('@aeternity/aepp-sdk');

export default {
    data () {
        return {
            language: locales['en'],
            loading: false,
            name: '',
            ak_address: '',
        }
    },
    computed: {
        ...mapGetters(['account', 'balance', 'network', 'current','transactions','subaccounts','wallet','activeAccountName','activeAccount', 'popup']),
    },
    methods: {
        registerName() {
            var onlyLettersAndNums = /^[A-Za-z0-9]+$/;
            if (this.name == '') {
                this.$store.dispatch('popupAlert', {
                    name: 'account',
                    type: 'requiredField'
                });
            }
            else if (!onlyLettersAndNums.test(this.name)) {
                console.log('asd');
                this.$store.dispatch('popupAlert', {
                    name: 'account',
                    type: 'only_allowed_chars'
                });
            }
            else {
                console.log('XXX');
                const {Universal} = require('@aeternity/aepp-sdk');
                const main = async (name) => {
                    const   publicKey = this.account.publicKey,
                            secretKey = getHdWalletAccount(this.wallet,this.activeAccount).secretKey,
                            url = this.network[this.current.network].url,
                            internalUrl = this.network[this.current.network].internalUrl,
                            networkId = this.network[this.current.network].networkId;
                    
                    const client = await Universal({
                        url: url,
                        internalUrl: internalUrl,
                        keypair: {
                            publicKey: publicKey,
                            secretKey: secretKey
                        },
                        networkId: networkId,
                        nativeMode: true
                    });

                    this.loading = true;
                    // const query = await client.aensQuery(name);
                    const preclaim = await client.aensPreclaim(name);
                    this.loading = false;

                    this.$store.dispatch('popupAlert', {
                        name: 'account',
                        type: 'added_success'
                    });

                    const claim = await client.aensClaim(name, preclaim.salt, preclaim.height);
                    const update = await client.aensUpdate(claim.id, publicKey);
                };
                main(this.name+'.test');
            }
        },
        navigateToSettings() {
            this.$router.push('/settings')
        }
    }
}
</script>

<style lang="scss">

@import '../../../common/base';
.backbtn {
    width: 50%; margin-top: 5px;
}
.regbtn{
    background: #FF0D6A;
    color: #ffffff;
    float: right;
    width: 19%;
    border-radius: 0 !important;
}
.maindiv_input-group-addon {
    text-align: center;
}
.maindiv_input-group-addon h4 {
    text-align: left;
    margin: 0 !important; 
}
.input-group-addon {
    background: #ececec;
    border: 1px solid #ccc;
    width: 79%;
    height: 56px;
    float: left;
}
.addon-input {
    width: 75%;
    outline: none;
    color: #828282;
    padding: 0;
    height: 55px;
    text-indent: 5px;
    caret-color: #ff0d6a;
}
.addon-lbl {
    font-weight: 600;
    color: #828282;
}
input:active,input:focus {
    border: none;
    outline: none;
}
.sett_info {
    text-align: left;
    width: 100%;
    display: block;
    word-break: break-word;
}
</style>