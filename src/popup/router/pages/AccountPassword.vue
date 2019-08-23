<template>
    <div >
        <main>
            <div class="popup">
                <div v-if="!loading">
                    <h3>{{title}}</h3>
                    <password v-if="confirmPassword" v-model="accountPassword" strength-meter-class="passwordStrengthMeter" :strength-meter-only="true" @score="getScore"/>
                    <ae-input  placeholder="" class="my-2" label="Password" v-bind="inputError">
                        <input type="password" class="ae-input" :min="minPasswordLength"  v-model="accountPassword" slot-scope="{ context }" @focus="context.focus = true" @blur="context.focus = false" />
                        <ae-toolbar v-if="errorMsg == 'length'" slot="footer">{{ $t('pages.accountPassword.passwordSymbolsError') }}{{ minPasswordLength }}</ae-toolbar>
                        <ae-toolbar v-if="errorMsg == 'weak'" slot="footer">{{ $t('pages.accountPassword.weakPasswordError') }}</ae-toolbar>
                        <ae-toolbar v-if="loginError" slot="footer">{{ $t('pages.accountPassword.incorrectPasswordError') }}</ae-toolbar>
                    </ae-input>
                    <ae-input  v-if="confirmPassword" placeholder="" class="my-2" label="Repeat Password" v-bind="inputError">
                        <input type="password" class="ae-input" :min="minPasswordLength" v-model="confirmAccountPassword" slot-scope="{ context }" @focus="context.focus = true" @blur="context.focus = false" />
                        <ae-toolbar v-if="errorMsg == 'match'" slot="footer">{{ $t('pages.accountPassword.passwordDoesntMatchError') }} </ae-toolbar>
                    </ae-input>
                    <ae-button face="round" extend fill="primary" @click="clickAction({accountPassword,data,confirmAccountPassword, termsAgreed})">{{buttonTitle}}</ae-button>
                </div>
                <Loader size="small" :loading="loading" v-bind="{'content':$t('pages.accountPassword.securingAccount')}"></Loader>
            </div>
        </main>
    </div> 
</template>
<script>
import { addressGenerator } from '../../utils/address-generator';
import { decrypt } from '../../utils/keystore';
import { mnemonicToSeed } from '@aeternity/bip39';
import { generateHdWallet, getHdWalletAccount } from '../../utils/hdWallet';
import { MINPASSWORDLENGTH } from '../../utils/constants';
import Password from 'vue-password-strength-meter';
import { mapGetters } from 'vuex'
import { redirectAfterLogin } from '../../utils/helper';

export default {
    props: ['data','confirmPassword','buttonTitle','type','title', 'termsAgreed'],
    components: { Password },
    data() {
        return {
            accountPassword:'',
            confirmAccountPassword:'',
            inputError:{},
            loading:false,
            errorMsg:'',
            loginError:false,
            minPasswordLength: MINPASSWORDLENGTH,
            passwordScore: 0
        }
    },
    computed: {
        ...mapGetters(['tokens'])
    },
    methods: {
        getScore(score) {
            this.passwordScore = score;
        },
        clickAction({accountPassword,data,confirmAccountPassword, termsAgreed}) {
            if((this.confirmPassword && accountPassword !== confirmAccountPassword) || accountPassword.length < this.minPasswordLength || (this.confirmPassword && confirmAccountPassword < this.minPasswordLength))  {
                this.inputError = {error:""};
                if(accountPassword.length < this.minPasswordLength || (this.confirmPassword && confirmAccountPassword < this.minPasswordLength)){
                    this.errorMsg = "length";
                }
                if(this.confirmPassword && accountPassword !== confirmAccountPassword) {
                    this.errorMsg = "match";
                }
                if(this.passwordScore < 3) {
                    this.errorMsg = "weak";
                }
                return;
            }
            this.inputError = {};
            if(this.type == 'privateKey') {
                this.importPrivateKey({accountPassword,data, termsAgreed});
            }else if(this.type == 'seedPhrase') {
                this.importSeedPhrase({accountPassword,data, termsAgreed});
            }else if(this.type == 'keystore') {
                this.importKeystore({accountPassword,data, termsAgreed});
            }else if(this.type == 'generateEncrypt') {
                this.generateAddress({accountPassword,termsAgreed});
            }else if(this.type == 'login') {
                this.login({accountPassword});
            }
            // this.$emit('clickAction',{accountPassword,data});
        },
        importPrivateKey: async function importPrivateKey({accountPassword,data,termsAgreed}) {
            this.loading = true;
            let wallet = generateHdWallet(data);
            const keyPair = await addressGenerator.importPrivateKey(accountPassword, data, wallet);
            if(keyPair) {
                this.setLogin(keyPair,wallet, false, termsAgreed);
            }
            
        },
        importSeedPhrase: async function importSeedPhrase({accountPassword,data,termsAgreed}) {
            this.loading = true;
            let privateKey = mnemonicToSeed(data)
            let wallet = generateHdWallet(privateKey);
            const keyPair = await addressGenerator.generateKeyPair(accountPassword,privateKey.toString('hex'),wallet);
            if(keyPair) {
                this.setLogin(keyPair,wallet, false, termsAgreed);
            }
        },
        importKeystore:async function importKeystore({accountPassword,data,termsAgreed}) {
            this.loading = true;
            const encryptedPrivateKey = JSON.parse(data);
            let match = await decrypt(encryptedPrivateKey.crypto.ciphertext,accountPassword,encryptedPrivateKey.crypto.cipher_params.nonce,encryptedPrivateKey.crypto.kdf_params.salt);
            
            if(match !== false) {
                let wallet = generateHdWallet(match);
                let keyPair = {encryptedPrivateKey:JSON.stringify(encryptedPrivateKey),publicKey:encryptedPrivateKey.public_key};
                this.setLogin(keyPair,wallet,true,termsAgreed);
            }else {
                this.loginError = true;
                this.errorMsg = "";
                this.inputError = {error:''};
                this.loading = false;
                
            }
        },
        setLogin(keyPair,wallet, fixAccount = false, termsAgreed) {
            if(fixAccount) {
                let address = getHdWalletAccount(wallet).address;
                if(address !== keyPair.publicKey) {
                    keyPair.publicKey = address;
                    let encPrivateKey = JSON.parse(keyPair.encryptedPrivateKey);
                    encPrivateKey.publicKey = address;
                    keyPair.encryptedPrivateKey = JSON.stringify(encPrivateKey);
                }
            }
            browser.storage.sync.set({userAccount: keyPair}).then(() => {
                browser.storage.sync.set({isLogged: true}).then(() => {
                    browser.storage.sync.set({wallet: JSON.stringify(wallet)}).then(() => {
                        browser.storage.sync.set({ termsAgreed: termsAgreed }).then(() => {
                            let sub = [];
                            sub.push({
                                name:'Main account',
                                publicKey:keyPair.publicKey,
                                balance:0,
                                root:true
                            });
                            browser.storage.sync.set({subaccounts: sub}).then(() => {
                                browser.storage.sync.set({activeAccount: 0}).then(() => {
                                    this.$store.commit('SET_ACTIVE_ACCOUNT', {publicKey:keyPair.publicKey,index:0});
                                });
                                this.$store.dispatch('setSubAccounts', sub).then(() => {
                                    this.$store.commit('UNSET_TOKENS')
                                    this.$store.dispatch('setTokens',this.tokens)
                                    this.$store.commit('UPDATE_ACCOUNT', keyPair);
                                    this.$store.commit('SWITCH_LOGGED_IN', true);
                                    this.$store.commit('SET_WALLET', wallet);
                                    redirectAfterLogin(this)
                                });
                            });
                        });
                    });
                });
            });
        },
        generateAddress: async function generateAddress({ accountPassword, termsAgreed}) {
            this.loading = true;
            browser.storage.sync.set({accountPassword: accountPassword}).then(() => {
                this.$router.push({
                    name: 'seed',
                    params: {
                        termsAgreed: termsAgreed
                    },
                });
            });
        },
    }
}

</script>
<style lang="scss" scoped>
@import '../../../common/base';
</style>