<template>
    <div >
        <main>
            <div class="popup">
                <div v-if="!loading">
                    <h3>{{title}}</h3>
                    <ae-input  placeholder="" class="my-2" label="Password" v-bind="inputError">
                        <input type="password" class="ae-input" min="4"  v-model="accountPassword" slot-scope="{ context }" @focus="context.focus = true" @blur="context.focus = false" />
                        <ae-toolbar v-if="errorMsg == 'length'" slot="footer">Password must be at lest 4 symbols! </ae-toolbar>
                        <ae-toolbar v-if="loginError" slot="footer">Incorrect password !</ae-toolbar>
                    </ae-input>
                    <ae-input  v-if="confirmPassword"   placeholder="" class="my-2" label="Repeat Password" v-bind="inputError">
                        <input type="password" class="ae-input" min="4" v-model="confirmAccountPassword" slot-scope="{ context }" @focus="context.focus = true" @blur="context.focus = false" />
                        <ae-toolbar v-if="errorMsg == 'match'" slot="footer">Passwords doesn't match! </ae-toolbar>
                    </ae-input>
                    <ae-button face="round" extend fill="primary" @click="clickAction({accountPassword,data,confirmAccountPassword})">{{buttonTitle}}</ae-button>
                </div>
                <Loader :loading="loading" v-bind="{'content':language.strings.securingAccount}"></Loader>
            </div>
        </main>
    </div>
</template>

<script>
import locales from '../../locales/locales.json';
import { addressGenerator } from '../../utils/address-generator';
import { decrypt } from '../../utils/keystore';
import { mnemonicToSeed } from '@aeternity/bip39';
import { generateHdWallet, getHdWalletAccount } from '../../utils/hdWallet'

export default {
    props: ['data','confirmPassword','buttonTitle','type','title'],
    data() {
        return {
            language: locales['en'],
            accountPassword:'',
            confirmAccountPassword:'',
            inputError:{},
            loading:false,
            errorMsg:'',
            loginError:false
        }
    },
    locales,
    methods: {
        clickAction({accountPassword,data,confirmAccountPassword}) {
            if((this.confirmPassword && accountPassword !== confirmAccountPassword) || accountPassword.length < 4 || (this.confirmPassword && confirmAccountPassword < 4))  {
                this.inputError = {error:""};
                if(accountPassword.length < 4 || (this.confirmPassword && confirmAccountPassword < 4)){
                    this.errorMsg = "length";
                }
                if(this.confirmPassword && accountPassword !== confirmAccountPassword) {
                    this.errorMsg = "match";
                }
                return;
            }
            this.inputError = {};
            if(this.type == 'privateKey') {
                this.importPrivateKey({accountPassword,data});
            }else if(this.type == 'seedPhrase') {
                this.importSeedPhrase({accountPassword,data});
            }else if(this.type == 'keystore') {
                this.importKeystore({accountPassword,data});
            }else if(this.type == 'generateEncrypt') {
                this.generateAddress({accountPassword});
            }else if(this.type == 'login') {
                this.login({accountPassword});
            }
            // this.$emit('clickAction',{accountPassword,data});
        },
        importPrivateKey: async function importPrivateKey({accountPassword,data}) {
            this.loading = true;
            let wallet = generateHdWallet(data);
            const keyPair = await addressGenerator.importPrivateKey(accountPassword, data, wallet);
            if(keyPair) {
                this.setLogin(keyPair,wallet);
            }
            
        },
        importSeedPhrase: async function importSeedPhrase({accountPassword,data}) {
            this.loading = true;
            let privateKey = mnemonicToSeed(data)
            let wallet = generateHdWallet(privateKey);
            const keyPair = await addressGenerator.generateKeyPair(accountPassword,privateKey.toString('hex'),wallet);
            if(keyPair) {
                this.setLogin(keyPair,wallet);
            }
        },
        importKeystore:async function importKeystore({accountPassword,data}) {
            this.loading = true;
            const encryptedPrivateKey = JSON.parse(data);
            let match = await decrypt(encryptedPrivateKey.crypto.ciphertext,accountPassword,encryptedPrivateKey.crypto.cipher_params.nonce,encryptedPrivateKey.crypto.kdf_params.salt);
            
            if(match !== false) {
                let wallet = generateHdWallet(match);
                let keyPair = {encryptedPrivateKey:JSON.stringify(encryptedPrivateKey),secretKey:match,publicKey:encryptedPrivateKey.public_key};
                this.setLogin(keyPair,wallet,true);
            }else {
                this.loginError = true;
                this.errorMsg = "";
                this.inputError = {error:''};
                this.loading = false;
                
            }
        },
        setLogin(keyPair,wallet, fixAccount = false) {
            if(fixAccount) {
                let address = getHdWalletAccount(wallet).address;
                if(address !== keyPair.publicKey) {
                    keyPair.publicKey = address;
                    let encPrivateKey = JSON.parse(keyPair.encryptedPrivateKey);
                    encPrivateKey.publicKey = address;
                    keyPair.encryptedPrivateKey = JSON.stringify(encPrivateKey);
                }
            }
            chrome.storage.sync.set({userAccount: keyPair}, () => {
                chrome.storage.sync.set({isLogged: true}, () => {
                    chrome.storage.sync.set({wallet: JSON.stringify(wallet)}, () => { 
                        let sub = [];
                        sub.push({
                            name:'Main account',
                            publicKey:keyPair.publicKey,
                            balance:0,
                            root:true
                        });
                        chrome.storage.sync.set({subaccounts: sub}, () => {
                            chrome.storage.sync.set({activeAccount: 0}, () => {
                                this.$store.commit('SET_ACTIVE_ACCOUNT', {publicKey:keyPair.publicKey,index:0});
                            });
                            this.$store.dispatch('setSubAccounts', sub).then(() => {
                                this.$store.commit('UPDATE_ACCOUNT', keyPair);
                                this.$store.commit('SWITCH_LOGGED_IN', true);
                                this.$store.commit('SET_WALLET', wallet);
                                this.$router.push('/account');
                            });
                        });
                        
                    });
                });
            });
        },
        generateAddress: async function generateAddress({ accountPassword }) {
            this.loading = true;
            chrome.storage.sync.set({accountPassword: accountPassword}, () => {
                 this.$router.push('/seed');
            });
        },
    }
}

</script>
<style lang="scss" scoped>
@import '../../../common/base';

</style>