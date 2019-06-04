<template>
    <div >
        <main>
            <div class="wrapper">
                <div v-if="!loading">
                    <p>{{title}}</p>
                    <ae-input  placeholder="" class="my-2" label="Password" v-bind="inputError">
                        <input type="password" class="ae-input" min="4"  v-model="accountPassword" slot-scope="{ context }" @focus="context.focus = true" @blur="context.focus = false" />
                        <ae-toolbar v-if="errorMsg == 'length'" slot="footer">Password must be at lest 4 symbols! </ae-toolbar>
                    </ae-input>
                    <ae-input  v-if="confirmPassword"   placeholder="" class="my-2" label="Repeat Password" v-bind="inputError">
                        <input type="password" class="ae-input" min="4" v-model="confirmAccountPassword" slot-scope="{ context }" @focus="context.focus = true" @blur="context.focus = false" />
                        <ae-toolbar v-if="errorMsg == 'match'" slot="footer">Passwords doesn't match! </ae-toolbar>
                    </ae-input>
                    <ae-button face="round" extend fill="primary" @click="clickAction({accountPassword,data,confirmAccountPassword})">{{buttonTitle}}</ae-button>
                </div>
                <div v-if="loading" class="loading">
                    <div class="center">
                    <span>Securing your account</span>
                    <br>
                    <ae-loader />
                    </div>
                </div>
            </div>
        </main>
    </div>
</template>

<script>
import locales from '../../locales/locales.json';
import { addressGenerator } from '../../utils/address-generator';
export default {
    props: ['data','confirmPassword','buttonTitle','type','title'],
    data() {
        return {
           accountPassword:'',
           confirmAccountPassword:'',
           inputError:{},
           loading:false,
           errorMsg:''
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
            }
            // this.$emit('clickAction',{accountPassword,data});
        },
        importPrivateKey: async function importPrivateKey({accountPassword,data}) {
            this.loading = true;
            const keyPair = await addressGenerator.importPrivateKey(accountPassword, data);
            chrome.storage.sync.set({userAccount: keyPair}, () => {
                this.$store.commit('UPDATE_ACCOUNT', keyPair);
                this.$router.push('/account');
            });
        },
        importSeedPhrase({accountPassword,data}) {
            this.loading = true;
            console.log("Import seed Phrase");
            console.log("password" + accountPassword);
            console.log("seed" + data);
        },
        importKeystore({accountPassword,data}) {
            this.loading = true;
            console.log("Import Keystore");
            console.log("password" + accountPassword);
            console.log("keystore data" + data);
        }
    }
}

</script>
<style lang="scss" scoped>
@import '../../../common/base';

</style>