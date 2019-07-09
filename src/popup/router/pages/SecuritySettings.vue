<template>
    <div class="popup">
        <div class="backbtn">
            <button class="backbutton toAccount" @click="navigateToSettings"><ae-icon name="back" /> {{language.buttons.backToSettings}}</button>
        </div>
        <h3 style='text-align:center;'>{{language.pages.settings.securitySettings.heading}}</h3>
        <ae-panel>
            <div class="maindiv_input-group-addon">
                <h4>Waellet Statistic Track</h4><hr>
                <small class="sett_info">Take part in the Waellet statistics</small>
                <switchButton class="tracker-switchbtn" :onChange="onChange" :onoff="onoff"></switchButton>
            </div>
        </ae-panel>
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
        ...mapGetters(['account', 'balance', 'network', 'current','transactions','subaccounts','wallet','activeAccountName','activeAccount']),
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
        onChange(){
            this.onoff = !this.onoff;
            if (this.onoff == true) {
                browser.storage.sync.set({allowTracking:  true}).then(() => {});
            }
            if (this.onoff == false) {
                browser.storage.sync.set({allowTracking:  false}).then(() => {});
            }
        },
    }
}
</script>

<style lang="scss">

@import '../../../common/base';
.tracker-switchbtn {
    text-align: left;
    margin: 10px 0 0 0;
}
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
    width: 80%;
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
    display: block;
    word-break: break-word;
}
</style>