<template>
    <div class="popup">
        <div v-if="allowancePage == ''">
            <div class="actions">
                <button class="backbutton toAccount" @click="navigateUtilities"><ae-icon name="back" /> {{language.buttons.backToUtilities}}</button>
            </div>
            <h3 style='text-align:center;'>{{language.pages.allowances.heading}}</h3>
            <br>
            <div>
                <ae-button class="createAllowance" @click="allowancePage = 'create'; allowances = []; selected = 'default'; createform.value = ''; createform.to_account = '';" face="flat" fill="alternative">Create</ae-button>
                <ae-button class="transferAllowance" @click="allowancePage = 'transfer'; disableAfterSeeAll = false; allowances = []; selected = 'default'; transferform.to_account = ''; transferform.value = '';" face="flat" fill="alternative">Transfer</ae-button>
                <ae-button class="seeAllAllowance" @click="allowancePage = 'seeAll'; allowances = []; selected = 'default';" face="flat" fill="alternative">See all</ae-button>
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
                <option v-for="(tok, key) in filteredTokens" v-bind:key="key" :value="tok.key">
                {{tok.name}}
                </option>
            </select>
            <ae-input class="allowance-address" v-model="createform.to_account" label="Address"></ae-input>
            <ae-input class="allowance-value" v-model.number="createform.value" type="number" label="Value"></ae-input>
            <div class="allowanceExistError" v-if="allowanceExistError != '' && allowancePage == 'create' && createform.value != '' && createform.to_account != ''">
                <p>This Allowance already exist. If you want to change it click <a class="anchor-here-btn" style="color: #c0c0c0" @click="toChangeAllowanceForm(allowances)">here</a></p>
            </div>
            <ae-button class="createAllowance" @click="makeAllowance" face="round" fill="primary" extend>Create</ae-button>
        </div>
        <div v-if="allowancePage == 'transfer'" class="transfer-allowance allowance-form">
            <div class="actions">
                <button id="toAllowances" class="backbutton toAccount" @click="allowancePage = ''"><ae-icon name="back" />Back to Allowances</button>
            </div>
            <h3 style='text-align:center;'>Transfer Allowance</h3>
            <br>
            <select :disabled="disableAfterSeeAll ? true : false" class="allowance-token-dropdown" @change="onChange($event)" v-model="selected">
                <option value="default" disabled>Choose a token</option>
                <option  v-for="(tok, key) in filteredTokens" v-bind:key="key" :value="tok.key">
                {{tok.name}}
                </option>
            </select>
            <ae-input label="Address">
                <input type="text" :disabled="disableAfterSeeAll ? true : false" class="ae-input allowance-address" v-model="transferform.to_account" />
            </ae-input>
            <ae-input label="Value">
                <input type="text" class="ae-input allowance-value" v-model="transferform.value" />
            </ae-input>
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
                    <ae-button face="round" fill="primary" @click="getAllowance(allowance.allowanceFrom, allowance.allowanceAmount)">Get it</ae-button>
                </ae-list>
            </div>
            <div v-if="this.selected == 'default'" class="allowanceMsg">
                <p>Please choose a token to see all your allowances!</p>
            </div>
            <div v-if="this.allowances.length == 0" class="allowanceMsg">
                <p>No allowances found!</p>
            </div>
        </div>
        <div v-if="allowancePage == 'change'" class="change-allowance allowance-form">
            <div class="actions">
                <button id="toAllowances" class="backbutton toAccount" @click="allowancePage = ''"><ae-icon name="back" />Back to Allowances</button>
            </div>
            <h3 style='text-align:center;'>Change Allowance</h3>
            <br>
            <ae-input label="Symbol">
                <input type="text" :disabled="true" class="ae-input allowance-symbol" v-model="changeform.symbol" />
            </ae-input>
            <ae-input label="Address">
                <input type="text" :disabled="true" class="ae-input allowance-address" v-model="changeform.to_account"  />
            </ae-input>
            <ae-input class="allowance-value" v-model.number="changeform.value" type="number" label="Value"></ae-input>
            <small class="allowanceExistError"> Current allowed allowance is {{saveAllowedAllowance}} </small>
            <ae-button class="changeAllowanceFormBtn" @click="changeAllowanceFormBtn" face="round" fill="primary" extend>Change</ae-button>
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
            changeform: {
                symbol: '',
                to_account: '',
                value: '0',
                contractId: ''
            },
            selected: 'default',
            allowancePage: '',
            allowances: [],
            allowanceExistError: '',
            saveAllowedAllowance: '',
            disableAfterSeeAll: false
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
    created() {
    },
    methods: {
        onChange(event) {
            this.selected = event.target.value;
        },
        makeAllowance() {
            if (this.selected == '' || this.selected == 'default') {
                this.$store.dispatch('popupAlert', {
                    name: 'account',
                    type: 'not_selected_val'
                })
            }
            else {
                // if (this.createform.value == '' && ((this.createform.value).toString()).length == 0) {
                //     this.$store.dispatch('popupAlert', { name: 'account', type: 'invalid_number' })
                // }
                // else {
                    this.tokens.forEach(async element => {
                        if (element.key == this.selected) {
                            this.loading = true
                            let contract = await this.sdk.getContractInstance(FUNGIBLE_TOKEN_CONTRACT, { contractAddress: element.contract, callStatic: true})
                            let checkAmountLeft = await contract.call('allowance', [{from_account: this.account.publicKey, for_account: this.createform.to_account}], { callStatic: true })
                            let amountLeft = await checkAmountLeft.decode()
                            .then (async amount => {
                                if (amount != "None") {
                                    let tokensLefttoTransfer = element.balance - amount.Some[0]
                                    this.saveAllowedAllowance = (tokensLefttoTransfer+' '+element.symbol).toString()
                                }
                                if (this.createform.value > element.balance) {
                                    this.$store.dispatch('popupAlert', { name: 'spend', type: 'insufficient_balance'});
                                    this.loading = false;
                                }
                                else {
                                    try {
                                        this.allowances.push({ 
                                            allowance: element.contract,
                                            allowanceTo: this.createform.to_account,
                                            allowanceAmount: this.createform.value,
                                            allowanceToken: element.symbol,
                                            accountCurrentBalance: element.balance
                                        });
                                        let value = (this.createform.value).toString();
                                        let create = await this.sdk.contractCall(FUNGIBLE_TOKEN_CONTRACT, element.contract , 'create_allowance', [this.createform.to_account,value])
                                        let dec = await create.decode()
                                        this.$store.dispatch('popupAlert', { name: 'account', type: 'added_success'});
                                        this.loading = false;
                                        this.createform.to_account = ''
                                        this.createform.value = ''
                                        this.selected = 'default'
                                    }
                                    catch (createAllowanceError) {
                                        console.log('createAllowanceError.toString()')
                                        console.log(createAllowanceError.toString())
                                        if (createAllowanceError.toString().includes('ALLOWANCE_ALREADY_EXISTENT')) {
                                            this.allowanceExistError = 'Allowance alredy exist!'
                                            this.loading = false;
                                        }
                                        else if (createAllowanceError.toString().includes('fails to match the required pattern: /^(ak_|ct_|ok_|oq_)/]]') ||  
                                                createAllowanceError.toString().includes('Cannot unify address') ||
                                                createAllowanceError.toString().includes('Unbound variable')) {
                                            this.$store.dispatch('popupAlert', { name: 'spend', type: 'incorrect_address' })
                                            this.loading = false; 
                                        }
                                        else if ( createAllowanceError.toString().includes('NON_NEGATIVE_VALUE_REQUIRED')) {
                                            this.loading = false;
                                            this.$store.dispatch('popupAlert', { name: 'account', type: 'invalid_number' })
                                        }
                                        else if (createAllowanceError.toString().includes('Parse errors')) {
                                            this.loading = false;
                                            this.$store.dispatch('popupAlert', { name: 'account', type: 'token_add'})
                                        }
                                    }
                                }
                            })
                        }
                    })
                // }
            }
        },
        transferAllowance() {
            if (this.selected == '' || this.selected == 'default') {
                this.$store.dispatch('popupAlert', {
                    name: 'account',
                    type: 'not_selected_val'
                })
            }
            else {
                if (this.transferform.value == '' && ((this.transferform.value).toString()).length == 0) {
                    this.$store.dispatch('popupAlert', {
                        name: 'account',
                        type: 'invalid_number'
                    })
                }
                else {
                    this.tokens.forEach(async element => {
                        try { 
                            if (element.key == this.selected) {
                                this.loading = true
                                let contract = await this.sdk.getContractInstance(FUNGIBLE_TOKEN_CONTRACT, { contractAddress: element.contract, callStatic: true})
                                let checkAmountLeft = await contract.call('allowance', [{from_account: this.transferform.to_account, for_account:this.account.publicKey }], { callStatic: true })
                                let amountLeft = await checkAmountLeft.decode()
                                try {
                                    if ( (amountLeft != 'None') && (amountLeft + this.transferform.value >= amountLeft) ) {
                                        let tx = {
                                            popup:false,
                                            tx: {
                                                source:     FUNGIBLE_TOKEN_CONTRACT,
                                                address:    element.contract,
                                                method:     'transfer_allowance', 
                                                params:     [this.transferform.to_account,this.account.publicKey,(this.transferform.value).toString()],
                                                amount:     this.transferform.value,
                                                token:      element.symbol
                                            },
                                            callType: 'pay',
                                            type:'contractCall'
                                        }
                                        this.$store.commit('SET_AEPP_POPUP',true)
                                        this.$router.push({'name':'sign', params: {
                                            data:tx
                                        }});
                                        this.loading = false
                                    }
                                } catch (transferError) {
                                    if (transferError.toString().includes('BALANCE_ACCOUNT_NOT_EXISTENT')) {
                                        this.$store.dispatch('popupAlert', { name: 'fungible_token', type: 'balance_account_not_existent'});
                                    }
                                }
                        }
                        }
                        catch (err) {
                            //validation address input
                            if (err.toString().includes('fails to match the required pattern: /^(ak_|ct_|ok_|oq_)/]]')) {
                                this.$store.dispatch('popupAlert', { name: 'spend', type: 'incorrect_address' })
                            }
                        }
                    });
                }
            }
        },
        async seeAll() {
            this.loading = true
            this.allowances = [];
            this.selected = '';
            this.selected = event.target.value;
            this.tokens.forEach(async element => {
                console.log(element)
                if (element.key == this.selected) {
                    let checkAllAllowances = await this.sdk.contractCallStatic(FUNGIBLE_TOKEN_CONTRACT,element.contract,'allowances')
                    let all = await checkAllAllowances.decode()
                    if (all.length != 0) {
                        all.forEach(async singleAllowance => { //foreach all allowances
                            console.log('singleAllowance')
                            console.log(singleAllowance)
                            if (singleAllowance[0].for_account == this.account.publicKey) { //get allowances for curr account
                                let contract = await this.sdk.getContractInstance(FUNGIBLE_TOKEN_CONTRACT, { contractAddress: element.contract, callStatic: true})
                                let checkAmountLeft = await contract.call('allowance', [{from_account: singleAllowance[0].from_account, for_account:this.account.publicKey }], { callStatic: true })
                                .then(async amount => {
                                    let amountLeft = await amount.decode()
                                    let tokensLefttoTransfer = amountLeft.Some[0]
                                    this.allowances.push({ 
                                        allowance: element.contract,
                                        allowanceFrom: singleAllowance[0].from_account,
                                        allowanceAmount: tokensLefttoTransfer,
                                        allowanceToken: element.symbol,
                                        accountCurrentBalance: element.balance
                                    });
                                    this.loading = false
                                })
                            }
                            else {
                                this.allowances.length = 0;
                                this.loading = false
                            }
                        });
                    }
                    else {
                        this.allowances.length = 0;
                        this.loading = false
                    }
                }
            });
        },
        toChangeAllowanceForm(data) {
            this.allowancePage = 'change';
            this.changeform.to_account = data[0].allowanceTo;
            this.changeform.value = data[0].allowanceAmount
            this.changeform.symbol = data[0].allowanceToken
        },
        async changeAllowanceFormBtn() {
            this.loading = true
            if (this.changeform.value == '' && ((this.changeform.value).toString()).length == 0) {
                this.$store.dispatch('popupAlert', { name: 'account', type: 'invalid_number' })
                this.loading = false
            }
            else {
                try {
                    let contractId = this.allowances[0].allowance
                    let value = (this.changeform.value).toString()
                    let contract = await this.sdk.getContractInstance(FUNGIBLE_TOKEN_CONTRACT, { contractAddress: contractId, callStatic: true})
                    let checkAmountLeft = await contract.call('allowance', [{from_account: this.account.publicKey, for_account:this.changeform.to_account }], { callStatic: true })
                    let amountLeft = await checkAmountLeft.decode()
                    let tokensLefttoTransfer = amountLeft.Some[0];
                    console.log(tokensLefttoTransfer)
                    console.log(value)
                    console.log(this.allowances[0].accountCurrentBalance)
                    if (value < 0) {
                        this.$store.dispatch('popupAlert', { name: 'account', type: 'invalid_number'});
                    }
                    else if ( (Number(value) + tokensLefttoTransfer) > this.allowances[0].accountCurrentBalance ) {
                        this.$store.dispatch('popupAlert', { name: 'spend', type: 'insufficient_balance'});
                        this.loading = false;
                    }
                    else {
                        let change = await this.sdk.contractCall(FUNGIBLE_TOKEN_CONTRACT, contractId , 'change_allowance', [this.changeform.to_account,value])
                        let changeDec = await change.decode()
                        this.$store.dispatch('popupAlert', { name: 'fungible_token', type: 'allowance_change_success' })
                        .then(res => {
                            this.$router.push('/account')
                        })
                    }
                    this.loading = false
                } catch (changeallowanceError) {
                    console.log('changeallowanceError')
                    console.log(changeallowanceError)
                    if (changeallowanceError.toString().includes('fails to match the required pattern: /^(ak_|ct_|ok_|oq_)/]]') || changeallowanceError.toString().includes('Parse errors') || changeallowanceError.toString().includes('Unbound variable')) {
                        this.$store.dispatch('popupAlert', { name: 'spend', type: 'incorrect_address' })
                        this.loading = false; 
                    }
                }
            }
        },
        getAllowance(address, amount) {
            this.allowancePage = 'transfer';
            this.transferform.to_account = address;
            this.transferform.value = amount
            this.disableAfterSeeAll = true;
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
.allowanceExistError {
    color: #9d3fc0;
    margin-bottom: 20px;
}

.allowanceExistError a {
    cursor: pointer;
    color: #555;
    text-decoration: underline;
}
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