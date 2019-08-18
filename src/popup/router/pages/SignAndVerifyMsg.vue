<template>
    <div class="popup">
        <ae-modal-light class="signature-modal" v-if="modalVisible && !requirePass" @close="modalVisible = false" title="Signature" >
            <h3 class="h3-signature">Signed message:</h3>
            <p class="signedmsg-modal">{{signature}}</p>
            <div class="signature-modal-buttons">
                <button class="signMsg-copy" @click="doCopy">COPY</button>
                <button class="signMsg-cancel" @click="modalVisible = false" >Cancel</button>
            </div>
        </ae-modal-light>
        <ae-modal-light class="signature-modal" v-if="requirePass" @close="requirePass = false" title="" >
            <h3 class="h3-signature">Enter your password</h3>
            <p class="error">{{passwordAlert}}</p>
            <ae-input class="my-2" label="Password">
                <input type="password" class="ae-input"  placeholder="Enter password" v-model="password" slot-scope="{ context }" @focus="context.focus = true" @blur="context.focus = false" />
            </ae-input>
            <Loader size="small" :loading="loading" v-bind="{'content':''}"></Loader>
            <div class="signature-modal-buttons">
                <button class="signMsg-copy" @click="openSignPage">Sign message</button>
                <button class="signMsg-cancel" @click="requirePass = false" >Cancel</button>
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
                <ae-button face="round" extend fill="primary" @click="requirePasswordModal">Sign</ae-button>
            </ae-panel>
            <ae-panel>
                <h4>Verify message</h4>
                <hr>
                <small class="sett_info">This allows you to verify signed messages</small>
                <ae-button face="round" extend fill="primary" class="create-token" @click="page='verify'; verifyMessage=''">Verify</ae-button>
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
            password:'',
            passwordAlert: '',
            alert: {
                msg: '',
                class: '',
            },
            requirePass: false
        }
    },
    locales,
    computed: {
        ...mapGetters(['account', 'sdk', 'activeAccount', 'popup', 'wallet']),
    },
    created() {
    },
    methods:{
        requirePasswordModal() {
            this.password = '';
            this.requirePass = true;
        },
        openSignPage() {
            this.loading = true;
            if (this.password != '') {
                browser.storage.sync.get('userAccount').then(async (user) => {
                    if(user.userAccount && user.hasOwnProperty('userAccount')) {
                        let encryptedPrivateKey = JSON.parse(user.userAccount.encryptedPrivateKey);
                        let match = await decrypt(encryptedPrivateKey.crypto.ciphertext,this.password,encryptedPrivateKey.crypto.cipher_params.nonce,encryptedPrivateKey.crypto.kdf_params.salt);
                        this.loading = false
                        if(match) {
                            this.requirePass = false;
                            this.page = 'sign';
                        }else {
                            this.passwordAlert = 'Incorrect password!';
                            setTimeout(() => {
                                this.passwordAlert = '';
                            }, 2800);
                        }
                    }
                })
            }
            else {
                this.loading = false;
                this.passwordAlert = 'Please enter valid password!';
                setTimeout(() => {
                    this.passwordAlert = '';
                }, 2800);
            }
        },
        signMessageAction() {
            this.loading = true;
            browser.storage.sync.get('userAccount').then(async (user) => {
                if(user.userAccount && user.hasOwnProperty('userAccount') && this.password != '') {
                    let encPrivateKey = user.userAccount.encryptedPrivateKey;
                    try {
                        JSON.parse(user.userAccount.encryptedPrivateKey);
                    }catch(e) {
                        user.userAccount.encryptedPrivateKey = JSON.stringify( user.userAccount.encryptedPrivateKey );
                        encPrivateKey = JSON.stringify( user.userAccount.encryptedPrivateKey );
                    }
                    let encryptedPrivateKey = JSON.parse(user.userAccount.encryptedPrivateKey);
                    let privKeyasHex = await decrypt(encryptedPrivateKey.crypto.ciphertext, this.password, encryptedPrivateKey.crypto.cipher_params.nonce, encryptedPrivateKey.crypto.kdf_params.salt);
                    let privKey = Buffer.from(privKeyasHex, 'hex')
                    let publicKey = Buffer.from(Crypto.decodeBase58Check(this.account.publicKey.split('_')[1]))
                    try {
                        const sign = Crypto.signPersonalMessage(this.signMessage, privKey)
                        this.signature = JSON.stringify(
                            { 
                                text: this.signMessage, 
                                sig: sign, 
                                address: publicKey,
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
            try {
                let verObj = JSON.parse(this.verifyMessage);
                console.log(verObj);
                const verify = Crypto.verifyPersonalMessage(verObj.text, new Uint8Array(verObj.sig.data), new Uint8Array(verObj.address.data));
                console.log(verify);
            } catch (error) {
                console.log(error);
                error = error.toString();
                if (error.includes('unexpected type') || error.includes('Unexpected token') || error.includes('argument must be')) {
                    this.$store.dispatch('popupAlert', { name: 'account', type: 'token_add'});
                }
            }
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
                }, 2800);
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
