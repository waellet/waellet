<template>
    <div class="popup">
        <ae-modal-light class="signature-modal" v-if="modalVisible" @close="modalVisible = false" title="Signature" >
            <h3 class="h3-signature">Signed message:</h3>
            <p class="signedmsg-modal">{{signature}}</p>
            <div class="signature-modal-buttons">
                <button class="signMsg-copy" @click="doCopy">COPY</button>
                <button class="signMsg-cancel" @click="modalVisible = false" >Cancel</button>
            </div>
        </ae-modal-light>
        <div v-if="page == ''">
            <div class="actions">
                <button class="backbutton toAccount" @click="navigateUtilities"><ae-icon name="back" />{{ language.buttons.backToUtilities }}</button>
            </div>
            <h3>Sign and verify messages</h3>
            <ae-panel>
                <h4>Sign message</h4>
                <hr>
                <small class="sett_info">This allows you to sign message with your private key</small>
                <ae-button face="round" extend fill="primary" @click="page='sign'">Sign</ae-button>
            </ae-panel>
            <ae-panel>
                <h4>Verify message</h4>
                <hr>
                <small class="sett_info">This allows you to verify signed messages</small>
                <ae-button face="round" extend fill="primary" class="create-token" @click="page='verify'">Verify</ae-button>
            </ae-panel>
        </div>
        <div v-if="page=='sign'">
            <div class="actions">
                <button class="backbutton toAccount" @click="page = ''"><ae-icon name="back" />{{ language.buttons.backToSignVerifyMsg }}</button>
            </div>
            <h4>Sign message</h4>
            <hr>
            <ae-textarea v-model="signMessage" monospace placeholder="Message" />
            <p :class="alert.class"><small>{{alert.msg}}</small></p>
            <ae-button face="round" fill="primary" extend :class="[ signMessage.length > 0 ? '' : 'disabled' ]" @click="signMessageAction">Sign</ae-button>
        </div>
        <div v-if="page=='verify'">
            <div class="actions">
                <button class="backbutton toAccount" @click="page = ''"><ae-icon name="back" />{{ language.buttons.backToSignVerifyMsg }}</button>
            </div>
            <h4>Verify message</h4>
            <hr>
            <ae-textarea v-model="verifyMessage" monospace placeholder="Message" />
            <p :class="alert.class"><small>{{alert.msg}}</small></p>
            <ae-button face="round" fill="primary" extend :class="[ verifyMessage.length > 0 ? '' : 'disabled' ]" @click="verifyMessageAction">Verify</ae-button>
        </div>
        <popup :popupSecondBtnClick="popup.secondBtnClick"></popup>
        <Loader size="small" :loading="loading" v-bind="{'content':''}"></Loader>
    </div>
</template>

<script>
import locales from '../../locales/locales.json';
import { mapGetters } from 'vuex';
import { Crypto } from '@aeternity/aepp-sdk/es';
import Ae from '@aeternity/aepp-sdk/es/ae/universal';
import { decrypt, str2buf } from '../../utils/keystore';

export default {
    data() {
        return {
            language: locales['en'],
            loading: false,
            page: '',
            signMessage: '',
            verifyMessage: '',
            modalVisible: '',
            signature: '',
            alert: {
                msg: '',
                class: '',
            },
        }
    },
    locales,
    computed: {
        ...mapGetters(['account', 'sdk', 'activeAccount', 'popup', 'wallet']),
    },
    created() {
    },
    methods:{
        signMessageAction() {
                this.loading = true;
                browser.storage.sync.get('userAccount').then(async (user) => {
                    if(user.userAccount && user.hasOwnProperty('userAccount')) {
                        let encPrivateKey = user.userAccount.encryptedPrivateKey;
                        try {
                            JSON.parse(user.userAccount.encryptedPrivateKey);
                        }catch(e) {
                            user.userAccount.encryptedPrivateKey = JSON.stringify( user.userAccount.encryptedPrivateKey );
                            encPrivateKey = JSON.stringify( user.userAccount.encryptedPrivateKey );
                        }
                        let encryptedPrivateKey = JSON.parse(user.userAccount.encryptedPrivateKey);
                        let privKey = await decrypt(encryptedPrivateKey.crypto.ciphertext,'123123123',encryptedPrivateKey.crypto.cipher_params.nonce,encryptedPrivateKey.crypto.kdf_params.salt);
                        let privKey64 = Buffer.from(privKey, 'hex')
                        // let privKey64 = str2buf(privKey);
                        try {
                            let sign = Crypto.signPersonalMessage(this.signMessage, privKey64)
                            this.signature = JSON.stringify(
                                {
                                    // msg: Crypto.hash(this.signMessage),
                                    text: this.signMessage,
                                    sig: Buffer.from(sign),
                                    address: this.account.publicKey,
                                },
                                null,
                                2
                            );
                            this.loading = false;
                            this.modalVisible = true;
                        } catch (error) {
                            console.log(error);
                        }
                    }
                });
        },
        verifyMessageAction() {
            let verifyMessage = JSON.parse(this.verifyMessage);
            let verify = Crypto.verifyPersonalMessage (verifyMessage.text, new Uint8Array(verifyMessage.sig.data), Crypto.hash(verifyMessage.address));
            console.log(verify);
        },
        doCopy() {
            this.$copyText(this.signature).then(e => {
                this.modalVisible = false
                this.alert.msg = "Message successfully copied!";
                this.alert.class = "success";
                this.signMessage = '';
                setTimeout(() => {
                    this.alert.msg = "";
                    this.alert.class = "";
                }, 4000);
            });
        },
        navigateUtilities(){
            this.$router.push('/utilities')
        },
    }
}
</script>

<style lang="scss" scoped>
@import '../../../common/base';
.ae-modal-light main + .buttons {
    display: none !important;
}
.signedmsg-modal {
    color: #000;
    font-weight: 600;
    font-size: 12px;
    background: #ccc;
    padding: 10px;
    border-radius: 20px;
}
.signature-buttons button, .h3-signature {
    margin: 0 !important;
}

.disabled {
  background: #ccc !important;
  pointer-events: none;
}
.success {
    color: #00b100;
    border: 1px solid #008600;
    font-weight: 500;
    font-size: 20px;
    padding: 5px;
    background: none;
}
.error {
    color: #ff0000;
    border: 1px solid #b70000;
    font-weight: 500;
    font-size: 20px;
    padding: 5px;
    background: none;
}
.signature-modal-buttons button {
    border: 2px solid;
    background: #ccc;
    color: #fff;
    padding: 1.5rem;
    border-radius: 20px;
    width: 50%;
    float: left;
    font-size: 15px;
}
.signMsg-copy {
    background: #FF0D6A !important;
}
</style>
