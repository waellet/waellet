<template>
    <div class="popup">
        <div v-if="allowancePage == ''">
            <div class="actions">
                <button class="backbutton toAccount" @click="navigateUtilities"><ae-icon name="back" /> {{language.buttons.backToUtilities}}</button>
            </div>
            <h3 style='text-align:center;'>{{language.pages.allowances.heading}}</h3>
            <br>
            <div>
                <ae-button @click="allowancePage = 'create'" face="flat" fill="alternative">Create</ae-button>
                <ae-button @click="allowancePage = 'transfer'" face="flat" fill="alternative">Transfer</ae-button>
                <ae-button @click="allowancePage = 'seeAll'" face="flat" fill="alternative">See all</ae-button>
            </div>
        </div>
        <div v-if="allowancePage == 'create'" class="create-allowance allowance-form">
            <div class="actions">
                <button id="toAllowances" class="backbutton toAccount" @click="allowancePage = ''"><ae-icon name="back" />Back to Allowances</button>
            </div>
            <h3 style='text-align:center;'>Create Allowance</h3>
            <br>
            <select class="allowance-token-dropdown" @change="onChange($event)" v-model="selected">
                <option value="default" disabled>Choose a token</option>
                <option v-for="(tok, key) in filteredTokens" :value="tok.key">
                {{tok.name}}
                </option>
            </select>
            <ae-input class="allowance-address" v-model="createform.to_account" label="Address"></ae-input>
            <ae-input class="allowance-value" v-model.number="createform.value" type="number" label="Value"></ae-input>
            <ae-button class="createAllowance" @click="makeAllowance" face="round" fill="primary" extend>Create</ae-button>
        </div>
        <div v-if="allowancePage == 'transfer'" class="transfer-allowance allowance-form">
            <div class="actions">
                <button id="toAllowances" class="backbutton toAccount" @click="allowancePage = ''"><ae-icon name="back" />Back to Allowances</button>
            </div>
            <h3 style='text-align:center;'>Transfer Allowance</h3>
            <br>
            <select class="allowance-token-dropdown" @change="onChange($event)" v-model="selected">
                <option value="default" disabled>Choose a token</option>
                <option v-for="(tok, key) in filteredTokens" :value="tok.key">
                {{tok.name}}
                </option>
            </select>
            <ae-input class="allowance-address" v-model="transferform.to_account" label="Address"></ae-input>
            <ae-input class="allowance-value" v-model.number="transferform.value" type="number" label="Value"></ae-input>
            <ae-button class="transferAllowance" @click="transferAllowance" face="round" fill="primary" extend>Transfer</ae-button>
        </div>
        <div v-if="allowancePage == 'seeAll'" @load="seeAll" class="seeAll-allowance allowance-form">
            <div class="actions">
                <button id="toAllowances" class="backbutton toAccount" @click="allowancePage = ''"><ae-icon name="back" />Back to Allowances</button>
            </div>
            <h3 style='text-align:center;'>See all</h3>
            <br>
            <select class="allowance-token-dropdown" @change="seeAll($event)" v-model="selected">
                <option value="default" disabled>Choose a token</option>
                <option v-for="(tok, key) in filteredTokens" :value="tok.key">
                {{tok.name}}
                </option>
            </select>
            <ae-list v-for="(allowance, index) in allowances" face="primary">
                <ae-list-item style="display: block;" fill="primary"><b style="word-break: normal; display: block;">From: </b>{{allowance.allowanceFrom}}</ae-list-item>
                <ae-button face="round" fill="primary" @click="getAllowance(allowance.allowanceFrom)">Get it</ae-button>
            </ae-list>
        </div>
        <popup :popupSecondBtnClick="popup.secondBtnClick"></popup>
        <Loader size="big" :loading="loading" type="transparent" ></Loader>
    </div>
</template>

<script>
import { mapGetters } from 'vuex';
import locales from '../../locales/locales.json';
import QrcodeVue from 'qrcode.vue';
import Wallet from '@aeternity/aepp-sdk/es/ae/wallet';
import { MemoryAccount } from '@aeternity/aepp-sdk';
import { MAGNITUDE, MIN_SPEND_TX_FEE, MIN_SPEND_TX_FEE_MICRO } from '../../utils/constants';
import BigNumber from 'bignumber.js';
import Ae from '@aeternity/aepp-sdk/es/ae/universal';
import { getHdWalletAccount } from '../../utils/hdWallet';
import { FUNGIBLE_TOKEN_CONTRACT } from '../../utils/constants';
import FungibleTokensVue from './FungibleTokens.vue';
import { isNumber } from 'util';

export default {
    data() {
        return {
            language: locales['en'],
            loading: false,
            createform: {
                to_account: '',
                value: '0',
            },
            transferform: {
                to_account: '',
                value: '0',
            },
            selected: 'default',
            allowancePage: '',
            allowances: []
        }
    },
    locales,
    computed: {
        ...mapGetters(['account', 'balance', 'network', 'current', 'wallet', 'activeAccount', 'subaccounts', 'tokenSymbol', 'tokenBalance', 'sdk', 'tokens', 'popup']),
        filteredTokens() {
            return this.tokens.filter((t,index) => {
                t.key = index;
                return t.parent == this.account.publicKey && t.name != 'AE'
            });
        }
    },
    methods: {
        onChange(event) {
            this.selected = event.target.value;
        },
        makeAllowance() {
            // if (this.selected == '' || this.selected == 'default') {
            //     this.$store.dispatch('popupAlert', {
            //         name: 'account',
            //         type: 'not_selected_val'
            //     })
            // }
            // else if (this.form.to_account == '' || this.form.value.length == 0) {
            //     this.$store.dispatch('popupAlert', {
            //         name: 'account',
            //         type: 'requiredField'
            //     });
            //     console.log(this.form.to_account);
            //     console.log(this.form.value);
            //     console.log(typeof this.form.value);
            // }
            // else {
            //     if (this.form.value < 0) {
            //         this.$store.dispatch('popupAlert', {
            //             name: 'account',
            //             type: 'invalid_number'
            //         })
            //     }
            //     else {
                    this.tokens.forEach(async element => {
                        if (element.key == this.selected) {
                            let value = (this.createform.value).toString();
                            let create = await this.sdk.contractCall(FUNGIBLE_TOKEN_CONTRACT, element.contract , 'create_allowance', [this.createform.to_account,value])
                            console.log('create');
                            console.log(create);
                            let dec = await create.decode()
                            console.log('dec');
                            console.log(dec);
                        }
                    })
                    .catch(err => {
                        console.log('err');
                        console.log(err);
                    })
            //     }
            // }
        },
        transferAllowance() {
            // if (this.selected == '' || this.selected == 'default') {
            //     this.$store.dispatch('popupAlert', {
            //         name: 'account',
            //         type: 'not_selected_val'
            //     })
            // }
            // else if (this.form.to_account == '' || this.form.value.length == 0) {
            //     this.$store.dispatch('popupAlert', {
            //         name: 'account',
            //         type: 'requiredField'
            //     });
            //     console.log(this.form.to_account);
            //     console.log(this.form.value);
            //     console.log(typeof this.form.value);
            // }
            // else {
            //     if (this.form.value < 0) {
            //         this.$store.dispatch('popupAlert', {
            //             name: 'account',
            //             type: 'invalid_number'
            //         })
            //     }
            //     else {
                console.log(FUNGIBLE_TOKEN_CONTRACT);
                    this.tokens.forEach(async element => {
                        if (element.key == this.selected) {
                            // let allowance_accounts = {from_account: this.transferform.to_account, for_account:this.account.publicKey };
                            let amountLeft = await this.sdk.contractCallStatic(FUNGIBLE_TOKEN_CONTRACT,element.contract,'allowance', [['ak_29N1k3KjQ4EJUvjhxqAB5H4osiru7ZRTbtjBUXLTGHXCF9YQLQ', this.account.publicKey]] )
                            console.log('amountLeft');
                            console.log(amountLeft);
                            let decodedamount = await amountLeft.decode();
                            console.log('decodedamount');
                            console.log(decodedamount); return;
                            // let value = (this.transferform.value).toString();
                            // let transfer = await this.sdk.contractCall(FUNGIBLE_TOKEN_CONTRACT, element.contract, 'transfer_allowance', [this.transferform.to_account,this.account.publicKey,value])
                            // console.log('transfer');
                            // console.log(transfer);
                            // let dec = await transfer.decode()
                            // console.log('dec');
                            // console.log(dec);
                        }
                    });
            //     }
            // }
        },
        
        async seeAll() {
            this.allowances = [];
            this.selected = '';
            this.selected = event.target.value;
            console.log(FUNGIBLE_TOKEN_CONTRACT)
            this.tokens.forEach(async element => {
                if (element.key == this.selected) {
                    let all = await this.sdk.contractCallStatic(FUNGIBLE_TOKEN_CONTRACT,element.contract,'allowances')
                    console.log('all');
                    console.log(all);
                    let dec = await all.decode()
                    console.log('dec');
                    console.log(dec);
                    dec.forEach(d => {
                        console.log(d[0]);
                        if (d[0].for_account == this.account.publicKey) {
                            this.allowances.push({
                                allowance: element.contract,
                                allowanceFrom: d[0].from_account
                            });
                        }
                    });


            //     console.log(element);
            //         let all = await this.sdk.contractCall(FUNGIBLE_TOKEN_CONTRACT, element.contract , 'allowance ', [ this.account.publicKey, 'ak_2dY7HSsxH3yGL5j7mNvYYjFGTZwqtLNyoLSSaymn1wLKFSneeQ' ])
            //         console.log('create');
            //         console.log(all);
                }
            });
        },
        getAllowance(address) {
            this.allowancePage = 'transfer';
            this.transferform.to_account = address;
        },
        openAllowencesPage() {
            this.$router.push('/allowances');
        },
        navigateUtilities() {
            this.$router.push('/utilities')
        },
    }
}
</script>

<style lang="scss" scoped>
@import '../../../common/base';
.allowance-token-dropdown {
    margin-bottom: 1rem;
    width: 100%;
    height: 4rem;
    background: #ececec;
    border: 0;
    font-size: 19px;
    text-align: center;
    padding: 10px;
}
.allowance-token-dropdown:active, .allowance-token-dropdown:focus {
    border: none;
    outline: none;
    border-left: 2px solid #ff0d6a;
}
.allowance-token-dropdown option {
    height: 4rem;
    padding: 10px;
    width: 100%;
    border:none;
}
.allowance-form .ae-input-container {
    margin-bottom: 1rem; 
}
</style>