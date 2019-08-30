<template>
    <div class="popup">
        <div class="actions">
            <button class="backbutton toAccount" @click="navigateToSettings"><ae-icon name="back" /> {{$t('pages.advancedSettings.backToSettings') }}</button>
        </div>
        <h3 style='text-align:center;'>{{$t('pages.advancedSettings.heading') }}</h3>
        
        <ae-panel>
            <div class="maindiv_input-group-addon">
                <h4>{{ $t('pages.advancedSettings.exportKeystore') }}</h4><hr>
                <ae-button @click="exportKeypair('keystore')" id="exportKeystore" class="notround" face="round" fill="primary">
                    <ae-icon name="save" />
                    {{ $t('pages.advancedSettings.exportKeystore') }}
                </ae-button>
            </div>
        </ae-panel>
        <ae-panel>
            <div class="maindiv_input-group-addon">
                <h4>{{ $t('pages.advancedSettings.exportKeypair') }}</h4><hr>
                <ae-button @click="exportKeypair('keypair')" id="exportKeypair" class="notround" face="round" fill="primary">
                    <ae-icon name="save" />
                    {{ $t('pages.advancedSettings.exportKeypair') }}
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
const {Universal} = require('@aeternity/aepp-sdk');
import { saveAs } from 'file-saver';

export default {
    data () {
        return {
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
            }else if(type == 'keystore') {
                let blobData = "";
                try {
                    blobData = JSON.parse(this.account.encryptedPrivateKey);
                }catch(err) {
                    blobData = JSON.stringify(this.account.encryptedPrivateKey);
                }
                let blob = new Blob([blobData], {type: "application/json;charset=utf-8"});
                saveAs(blob, "keystore.json");
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
.notround { border-radius: 0 !important; }

</style>