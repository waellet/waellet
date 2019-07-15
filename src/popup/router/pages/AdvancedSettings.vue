<template>
    <div class="popup">
        <div class="actions">
            <button class="backbutton toAccount" @click="navigateToSettings"><ae-icon name="back" /> {{language.buttons.backToSettings}}</button>
        </div>
        <h3 style='text-align:center;'>{{language.pages.settings.advancedSettings.heading}}</h3>
        
        <ae-panel>
            <div class="maindiv_input-group-addon">
                <h4>{{ language.strings.exportKeystore }}</h4><hr>
                <ae-button @click="exportKeypair('keystore')" id="exportKeystore">
                    <ae-icon name="save" />
                    {{ language.strings.exportKeystore }}
                </ae-button>
            </div>
        </ae-panel>
        <ae-panel>
            <div class="maindiv_input-group-addon">
                <h4>{{ language.strings.exportKeypair }}</h4><hr>
                <ae-button @click="exportKeypair('keypair')" id="exportKeypair">
                    <ae-icon name="save" />
                    {{ language.strings.exportKeypair }}
                </ae-button>
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
import { saveAs } from 'file-saver';

export default {
    data () {
        return {
            language: locales['en'],
            loading: false,
        }
    },
    computed: {
        ...mapGetters(['account', 'balance', 'network', 'current','transactions','subaccounts','wallet','activeAccountName','activeAccount', 'popup']),
    },
    methods: {
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
        navigateToSettings() {
            this.$router.push('/settings')
        }
    }
}
</script>

<style lang="scss">

@import '../../../common/base';

</style>