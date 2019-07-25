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
                <option v-for="(tok, key) in filteredTokens" v-bind:key="key.id" :value="tok.key">
                {{tok.name}}
                </option>
            </select>
            <div v-if="this.selected != 'default'" class="allAllowances">
                <ae-list v-for="(allowance, index) in allowances" v-bind:key="index.id" face="primary">
                    <ae-list-item style="display: block;" fill="primary"><b style="word-break: normal; display: block;">From: </b>{{allowance.allowanceFrom}} - <ae-badge>{{allowance.allowanceAmount}} {{allowance.allowanceToken}}</ae-badge></ae-list-item>
                    <ae-button face="round" fill="primary" @click="getAllowance(allowance.allowanceFrom)">Get it</ae-button>
                </ae-list>
            </div>
            <div v-if="this.selected == 'default'" class="allowanceMsg">
                <p>Please choose a token to see all your allowances!</p>
            </div>
            <div v-if="this.selected == 'default' && this.allowances.length == 0" class="allowanceMsg">
                <p>No allowances found!</p>
            </div>
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
                console.log('t');
                console.log(t);
                console.log('index');
                console.log(index);
                t.key = index;
                return t.parent == this.account.publicKey && t.name != 'AE'
            });
        }
    },
    created() {
        console.log('filteredTokens');
        console.log(this.filteredTokens);
        console.log('tokenbalance');
        console.log(this.tokens)
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

                            let contract = await this.sdk.getContractInstance(FUNGIBLE_TOKEN_CONTRACT, { contractAddress: element.contract, callStatic: true})
                            let checkAmountLeft = await contract.call('allowance', [{from_account: this.transferform.to_account, for_account:this.account.publicKey }], { callStatic: true })
                            let amountLeft = await checkAmountLeft.decode()
                            if (amountLeft != 'None') {
                                let value = (this.transferform.value).toString();
                                let transfer = await this.sdk.contractCall(FUNGIBLE_TOKEN_CONTRACT, element.contract, 'transfer_allowance', [this.transferform.to_account,this.account.publicKey,value])
                                let transferDec = await transfer.decode()
                                console.log('value');
                                console.log(value); 
                                console.log('transfer');
                                console.log(transfer);
                                console.log('transferDec');
                                console.log(transferDec);
                            }


                            // let allowance_accounts = {from_account: 'ak_29N1k3KjQ4EJUvjhxqAB5H4osiru7ZRTbtjBUXLTGHXCF9YQLQ', for_account:this.account.publicKey };
                            // let amountLeft = await this.sdk.contractCallStatic(FUNGIBLE_TOKEN_CONTRACT,element.contract,'allowance', [allowance_accounts] )
                            
                            // let decodedamount = await amountLeft.decode();
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
            this.tokens.forEach(async element => {
                if (element.key == this.selected) {
                    console.log('contract =>');
                    console.log(FUNGIBLE_TOKEN_CONTRACT);
                    let checkAllAllowances = await this.sdk.contractCallStatic(FUNGIBLE_TOKEN_CONTRACT,element.contract,'allowances')
                    let all = await checkAllAllowances.decode()

                    all.forEach(async singleAllowance => { //foreach all allowances
                        if (singleAllowance[0].for_account == this.account.publicKey) { //get allowances for curr account
                            let contract = await this.sdk.getContractInstance(FUNGIBLE_TOKEN_CONTRACT, { contractAddress: element.contract, callStatic: true})
                            let checkAmountLeft = await contract.call('allowance', [{from_account: singleAllowance[0].from_account, for_account:this.account.publicKey }], { callStatic: true })
                            let amountLeft = await checkAmountLeft.decode()
                            let tokensLefttoTransfer = amountLeft.Some[0];
                            this.allowances.push({ 
                                allowance: element.contract,
                                allowanceFrom: singleAllowance[0].from_account,
                                allowanceAmount: tokensLefttoTransfer,
                                allowanceToken: element.symbol
                            });
                        }
                    });
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