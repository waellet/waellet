<template>
    <div class="popup">
        <ae-main>
            <div class="backbtn">
                <button class="backbutton toAccount" @click="navigateAccount"><ae-icon name="back" /> {{language.buttons.backToAccount}}</button>
            </div>
            <h3 style='text-align:center;'>Aeternity Naming System</h3>
            <br>
            <div class="maindiv_input-group-addon">
                <div class="checkName input-group-addon">
                    <input v-model="name" class="addon-input" />
                    <label class="addon-lbl" >.test</label>
                </div>
                <small><ae-icon name="github" /> Allowed only letters and numbers</small>
                <ae-button class="regbtn" face="round" fill="primary" extend @click="registerName">Register name</ae-button>
            </div>
            <div v-if="loading" class="loading">
                <ae-loader />
            </div>
        </ae-main>
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
            name: '',
            ak_address: '',
            loading: false,
        }
    },
    computed: {
        ...mapGetters(['account', 'balance', 'network', 'current','transactions','subaccounts','wallet','activeAccountName','activeAccount']),
    },
    methods: {
        registerName() {
            var onlyLettersAndNums = /^[A-Za-z0-9]+$/;
            if (this.name == '') {
                this.$store.dispatch('popupAlert', {
                    name: 'account',
                    type: 'requiredField'
                });
            }
            else if (!onlyLettersAndNums.test(this.name)) {
                this.$store.dispatch('popupAlert', {
                    name: 'account',
                    type: 'only_allowed_chars'
                });
            }
            else {
                const {Universal} = require('@aeternity/aepp-sdk');
                const main = async (name) => {
                    const   publicKey = this.account.publicKey,
                            secretKey = getHdWalletAccount(this.wallet,this.activeAccount).secretKey,
                            url = this.network[this.current.network].url,
                            internalUrl = this.network[this.current.network].internalUrl,
                            networkId = this.network[this.current.network].networkId;
                    
                    const client = await Universal({
                        url: url,
                        internalUrl: internalUrl,
                        keypair: {
                            publicKey: publicKey,
                            secretKey: secretKey
                        },
                        networkId: networkId,
                        nativeMode: true
                    });

                    this.loading = true;
                    const query = await client.aensQuery(name);
                    console.log('query');
                    console.log(query);
                    const preclaim = await client.aensPreclaim(name);
                    console.log('preclaim');
                    console.log(preclaim);

                    this.loading = false;
                    this.$store.dispatch('popupAlert', {
                        name: 'account',
                        type: 'added_success'
                    });
                    const claim = await client.aensClaim(name, preclaim.salt, preclaim.height);
                    console.log('claim');
                    console.log(claim);
                    const update = await client.aensUpdate(claim.id, publicKey);
                    console.log('update');
                    console.log(update);
                };
                main(this.name+'.test');
            }
        },
        navigateAccount() {
            this.$router.push('/account')
        },
    }
}
</script>

<style>
.backbtn {
    width: 50%; margin-top: 5px;
}
.regbtn{
    margin: 20px 0;
}
.maindiv_input-group-addon {
    text-align: center;
    margin: 10px 30px 10px;
}
.input-group-addon {
    background: #ececec;
    position: relative;
    line-height: 4rem;
    border: 1px solid #ccc;
    font-size: 22px;
}
.addon-input {
    width: 75%;
    border-right: 2px solid;
    font-size: 22px;
    outline: none;
    line-height: 4rem;
    height: auto;
    color: #828282;
    padding: 0;
    text-indent: 5px;
    caret-color: #ff0d6a;
}
.addon-lbl {
    font-weight: 600;
    color: #828282;
}
input:active,input:focus {
    border: none;
    border-right: 2px solid;
    outline: none;
}
</style>
