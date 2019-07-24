<template>
    <div class="popup">
        <div class="actions">
            <button class="backbutton toAccount" @click="navigateAccount"><ae-icon name="back" /> {{language.buttons.backToAccount}}</button>
        </div>
        <h3 style='text-align:center;'>Qr Code Scanner</h3>
        <br>
        <div class="cameraMsg">
            <p v-if="successMessage != ''">
                <b>{{ successMessage }}</b>
            </p>
            <p v-if="errorMessage != ''" class="error">
                <b>{{ errorMessage }}</b>
            </p>
        </div>
        <qrcode-stream @decode="onDecode" @init="onInit"></qrcode-stream>
        <popup :popupSecondBtnClick="popup.secondBtnClick"></popup>
        <Loader size="small" :loading="loading" v-bind="{'content':''}"></Loader>
    </div>
</template>

<script>
import { mapGetters } from 'vuex';
import locales from '../../locales/locales.json';
import QrcodeVue from 'qrcode.vue';
import { QrcodeStream, QrcodeDropZone, QrcodeCapture } from 'vue-qrcode-reader';
import {
  getPublicKeyByResponseUrl, getSignedTransactionByResponseUrl, generateSignRequestUrl,
} from '../../utils/airGap';
import { Crypto } from '@aeternity/aepp-sdk/es';

export default {
    data() {
        return {
            language: locales['en'],
            loading: false,
            successMessage: '',
            errorMessage: '',
            counter: 0,
            accountspublicKeys: []
        }
    },
    locales,
    computed: {
        ...mapGetters (['account', 'current', 'network','subaccounts','wallet', 'popup'])
    },
    methods: {
        navigateAccount() {
            this.$router.push('/account')
        },
        onDecode (content) {
            this.loading = true;
            this.decodedContent = content;
            try {
                const publicKey = getPublicKeyByResponseUrl(content);
                browser.storage.sync.set({ airGapGeneratedKey: publicKey}).then(() => {});
                const address = Crypto.aeEncodeKey(publicKey);
                if (address.includes('ak_')) {
                    this.subaccounts.forEach(element => {
                        this.accountspublicKeys.push(element.publicKey);
                    });
                    if (this.accountspublicKeys.includes(address)) {
                        this.$store.dispatch('popupAlert', {
                            name: 'account',
                            type: 'account_already_exist'
                        })
                        this.loading = false;
                    }
                    else {
                        let public_K = address;
                        let nameCounter =  this.subaccounts.length;
                        let name = 'AirGap Vault Account #'+nameCounter;
                        this.$store.dispatch('setSubAccount', {
                            isAirGapAcc: true,
                            name: name,
                            publicKey: public_K,
                            root:false,
                            balance:0
                        }).then(() => {
                            this.loading = false;
                            browser.storage.sync.set({ subaccounts: this.subaccounts}).then(() => {
                                this.$store.dispatch('popupAlert', {
                                    name: 'account',
                                    type: 'airgap_created'
                                }).then(() => {
                                    let index =  this.subaccounts.length - 1;
                                    browser.storage.sync.set({activeAccount: index }).then(() => {
                                        this.$store.commit('SET_ACTIVE_ACCOUNT', {publicKey:public_K,index:index});
                                    });
                                    this.$router.push('/account')
                                });
                            });
                        });
                    }
                }
            } catch (error) {
                error = error.toString();
                if (error.includes('Invalid URL')) {
                    this.$router.push('/airGapSetup')
                }
            }
        },
        onInit (promise) {
            promise.then(() => {
                this.successMessage = 'Camera successfully initilized! Ready for scanning now!';
            })
            .catch(error => {
                browser.tabs.create({url: 'chrome-extension://'+browser.runtime.id+'/popup/CameraRequestPermission.html', active: true});
                if (error.name === 'NotAllowedError') {
                    this.errorMessage = 'Hey! I need access to your camera'
                } else if (error.name === 'NotFoundError') {
                    this.errorMessage = 'Do you even have a camera on your device?'
                } else if (error.name === 'NotSupportedError') {
                    this.errorMessage = 'Seems like this page is served in non-secure context (HTTPS, localhost or file://)'
                } else if (error.name === 'NotReadableError') {
                    this.errorMessage = 'Couldn\'t access your camera. Is it already in use?'
                } else if (error.name === 'OverconstrainedError') {
                    this.errorMessage = 'Constraints don\'t match any installed camera. Did you asked for the front camera although there is none?'
                } else {
                    this.errorMessage = 'UNKNOWN ERROR: ' + error.message
                }
            })
        },
    }
}
</script>

<style lang="scss" scoped>
@import '../../../common/base';
.cameraMsg p {
word-break: break-word;
}
</style>