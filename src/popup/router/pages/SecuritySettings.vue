<template>
    <div class="popup">
        <div class="actions">
            <button class="backbutton toAccount" @click="navigateToSettings"><ae-icon name="back" /> {{language.buttons.backToSettings}}</button>
        </div>
        <h3 style='text-align:center;'>{{language.pages.settings.securitySettings.heading}}</h3>
        <ae-panel>
            <div class="maindiv_input-group-addon">
                <h4>Privacy Data</h4><hr>
                <small class="sett_info">Clear privacy data so all websites must request access to view account information again.</small>
                <ae-button face="round" fill="primary" class="notround settingBtn" extend @click="clearPrivacyData">Clear Privacy Data</ae-button>
            </div>
        </ae-panel>
        <popup :popupSecondBtnClick="popup.secondBtnClick"></popup>
        <div v-if="loading" class="loading">
            <ae-loader />
        </div>
    </div>
</template>

<script>
import { mapGetters } from 'vuex';
import { getHdWalletAccount } from '../../utils/hdWallet';
import locales from '../../locales/locales.json';

export default {
    data () {
        return {
            language: locales['en'],
            loading: false,
            onoff: false,
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
        clearPrivacyData( ) {
            //confirm window to be addeded here after merge with the others 
            browser.storage.sync.remove('connectedAepps')
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
.notround { border-radius: 0 !important; }
</style>