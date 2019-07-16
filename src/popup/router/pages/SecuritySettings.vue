<template>
    <div class="popup">
        <div class="actions">
            <button class="backbutton toAccount" @click="navigateToSettings"><ae-icon name="back" /> {{language.buttons.backToSettings}}</button>
        </div>
        <h3 style='text-align:center;'>{{language.pages.settings.securitySettings.heading}}</h3>
        <ae-panel>
            <div class="maindiv_input-group-addon">
                <h4>{{language.pages.settings.securitySettings.privacyDataHeading}}</h4><hr>
                <small class="sett_info">{{language.pages.settings.securitySettings.privacyDataSmall}}</small>
                <ae-button face="round" fill="primary" class="settingBtn" extend @click="clearPrivacyConfirm">{{language.pages.settings.securitySettings.privacyDataClearBtn}}</ae-button>
            </div>
        </ae-panel>
        <ae-panel>
            <div class="maindiv_input-group-addon">
                <h4>{{language.pages.settings.securitySettings.privateKeyHeading}}</h4><hr>
                <small class="sett_info">{{language.pages.settings.securitySettings.privateKeySmall}}</small>
                <ae-button face="round" fill="primary" class="settingBtn" extend @click="revealPrivateKey">{{language.pages.settings.securitySettings.privateKeyRevealBtn}}</ae-button>
            </div>
        </ae-panel>
        <popup :popupSecondBtnClick="popup.secondBtnClick"></popup>
        <div v-if="loading" class="loading">
            <ae-loader />
        </div>
        <Modal :modal="modal">
            <div slot="content">
                <small>Enter the password with which the private key is encrypted. After successfully entered password you will see your private key. Do not share it with anyone, it can be used to steal all your accounts</small>
                <div v-if="privateKey != ''">{{privateKey}}</div>
                <ae-input class="my-2" label="Password">
                    <input type="password" class="ae-input"  placeholder="Enter password" v-model="password" slot-scope="{ context }" @focus="context.focus = true" @blur="context.focus = false" />
                </ae-input>
                <ae-button extend face="round" fill="primary" @click="decryptKeystore">Show private key</ae-button>
            </div>
        </Modal>
    </div>
</template>

<script>
import { mapGetters } from 'vuex';
import { getHdWalletAccount } from '../../utils/hdWallet';
import locales from '../../locales/locales.json';
import { decrypt } from '../../utils/keystore';

export default {
    data () {
        return {
            language: locales['en'],
            loading: false,
            onoff: false,
            modal:{
                visible:false,
                title:''
            },
            password:'',
            privateKey:''
        }
    },
    computed: {
        ...mapGetters(['account', 'balance', 'network', 'current','transactions','subaccounts','wallet','activeAccountName','activeAccount','popup']),
    },
    created() {
        browser.storage.sync.get('allowTracking').then((result) => {
            this.onoff = result.allowTracking;
        })
    },
    methods: {
        navigateToSettings() {
            this.$router.push('/settings')
        },
        clearPrivacyConfirm() {
            this.$store.dispatch('popupAlert', {
                name: 'account',
                type: 'confirm_privacy_clear'
            });
        },
        clearPrivacyData( ) {
            //confirm window to be addeded here after merge with the others 
            browser.storage.sync.remove('connectedAepps')
        },
        revealPrivateKey() {
            this.modal.visible = true
            this.modal.title = "Show Private Key"
        },
        decryptKeystore() {
            browser.storage.sync.get('userAccount').then(async (user) => {
                if(user.userAccount && user.hasOwnProperty('userAccount')) {
                    let encryptedPrivateKey = JSON.parse(user.userAccount.encryptedPrivateKey);
                    let match = await decrypt(encryptedPrivateKey.crypto.ciphertext,this.password,encryptedPrivateKey.crypto.cipher_params.nonce,encryptedPrivateKey.crypto.kdf_params.salt);
                    if(match) {
                        this.privateKey = match
                    }
                }
            })
        }
    }
}
</script>

<style lang="scss">

@import '../../../common/base';
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
.settingBtn {
    margin-top:2rem
}
small {
    word-break: break-word;
}
</style>