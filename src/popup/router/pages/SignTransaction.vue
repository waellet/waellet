<template>
    <div class="popup">
        <ae-list class="spendTxDetailsList">
            <ae-list-item fill="neutral" class="flex-justify-between whiteBg noBorder">
                <div class="flex flex-align-center accountFrom">
                    <ae-identicon :address="account.publicKey" />
                    <span  class="spendAccountAddr">{{activeAccountName}}</span>
                </div>
                <div class="arrowSeprator">
                    <ae-icon name="left-more" />
                </div>
                <div class="flex flex-align-center accountTo" v-if="isAddressShow">
                    <ae-identicon :address="receiver"  />
                    <ae-address :value="receiver" v-if="receiver" length="short" class="spendAccountAddr" />
                    <span v-if="!receiver" class="spendAccountAddr">{{$t('pages.signTransaction.unknownAccount')}}</span>
                </div>
                <div v-else class="flex flex-align-center accountTo">
                    <ae-icon name="square" />
                    <span class="spendAccountAddr">{{ data.type == 'contractCreate' ? 'New contract' : 'AENS' }}</span>
                </div>
            </ae-list-item>
            <ae-list-item fill="neutral" class="flex-justify-between flex-align-start flex-direction-column">
                <div>
                    <ae-badge v-if="data.type=='contractCall'">{{$t('pages.signTransaction.contractCall')}}</ae-badge>
                    <ae-badge>{{txType}}</ae-badge>
                </div>
                <div class="balance balanceSpend no-sign" v-if="!isNameTx">{{amount}} {{token}}</div>
                <div class="fiat-rate" v-if="!data.tx.token && !isNameTx">${{convertCurrency(usdRate,amount)}}</div>
            </ae-list-item>
            <ae-list-item v-if="data.type == 'nameClaim' || data.type == 'nameUpdate' " fill="neutral" class="flex-justify-between whiteBg  flex-align-center " >
                <div class="tx-label">
                    {{$t('pages.signTransaction.name')}}
                </div>
                <div>
                    <strong>{{data.tx.name}}</strong>
                </div>
            </ae-list-item>
            <ae-list-item v-if="data.type == 'nameClaim'" fill="neutral" class="flex-justify-between whiteBg flex-align-center " >
                <div class="tx-label ">
                    {{$t('pages.signTransaction.nameSalt')}}
                </div>
                <div>
                    <strong>{{data.tx.preclaim.salt}}</strong>
                </div>
            </ae-list-item>
            <ae-list-item v-if="data.type == 'nameUpdate'" fill="neutral" class="flex-justify-between whiteBg  flex-align-center flex-direction-column" >
                <div class="tx-label extend text-left">
                    {{$t('pages.signTransaction.nameId')}}
                </div>
                <div class="text-left">
                    <strong>{{data.tx.claim.id}}</strong>
                </div>
            </ae-list-item>
            <ae-list-item fill="neutral" class="flex-justify-between whiteBg flex-direction-column flex-align-center " v-if="alertMsg == ''">
                <div class="flex extend flex-justify-between ">
                    <div class="tx-label">{{$t('pages.signTransaction.fee')}}</div>
                    <div class="text-right">
                        <div class="balance balanceBig txFee">{{selectedFee}}</div>
                        <div class="fiat-rate">${{convertCurrency(usdRate,selectedFee)}}</div>
                    </div>
                </div>
                <div class="range-slider">
                    <div class="sliderOver"></div>
                    <input class="range-slider__range" type="range"  :min="fee" :max="maxFee" step="0.000001" v-model="selectedFee">
                </div>
            </ae-list-item>
            <ae-list-item fill="neutral" class="flex-justify-between whiteBg" v-if="alertMsg == '' && !isNameTx">
                <div class="tx-label">{{$t('pages.signTransaction.total')}}</div>
                <div class="text-right">
                    <div class="balance balanceBig balanceTotalSpend no-sign">{{totalSpend}} {{token}}</div>
                    <div class="fiat-rate" v-if="!data.tx.token">${{convertCurrency(usdRate,totalSpend)}}</div>
                </div>
            </ae-list-item>
         </ae-list>
         <Alert fill="primary" :show="alertMsg != ''">
            <div slot="content">
                {{alertMsg}}
            </div>
         </Alert>
        <ae-button-group class="btnFixed">
            <ae-button face="round" fill="primary" @click="cancelTransaction" class="reject">{{$t('pages.signTransaction.reject')}}</ae-button>
            <ae-button face="round" fill="alternative" class="confirm" :class="signDisabled ? 'disabled' : '' " @click="signTransaction">{{$t('pages.signTransaction.confirm')}}</ae-button>
        </ae-button-group>
        <Loader size="big" :loading="loading" :type="loaderType" :content="loaderContent" ></Loader>
        <input type="hidden" class="txHash" :value="hash" />
    </div>
</template>

<script>
import { mapGetters } from 'vuex';
import { convertToAE, currencyConv, convertAmountToCurrency, removeTxFromStorage, contractEncodeCall, initializeSDK, checkAddress, chekAensName, escapeCallParams  } from '../../utils/helper';
import { MAGNITUDE, MIN_SPEND_TX_FEE, MIN_SPEND_TX_FEE_MICRO, MAX_REASONABLE_FEE, FUNGIBLE_TOKEN_CONTRACT, TX_TYPES, calculateFee } from '../../utils/constants';
import Wallet from '@aeternity/aepp-sdk/es/ae/wallet';
import { MemoryAccount } from '@aeternity/aepp-sdk';
import BigNumber from 'bignumber.js';
import { clearInterval, clearTimeout  } from 'timers';

export default {
    data(){
        return {
            port:null,
            txFee:{
                min:0,
                max:0
            },
            popup:false,
            signDisabled:true,
            alertMsg:'',
            loading:false,
            loaderType:'transparent',
            loaderContent:"",
            errorTx:  {
                "error": {
                    "code": 1,
                    "data": {
                        "request": {}
                    },
                    "message": "Transaction verification failed"
                },
                "id": null,
                "jsonrpc": "2.0"
            },
            selectedFee:0,
            usdRate:0,
            eurRate:0,
            checkSDKReady:null,
            receiver:"",
            hash:"",
            txParams:{},
            sending: false
        };
    },
    props:['data'],
    async created(){
        await this.init()
    },
    computed: {
        ...mapGetters(['account','activeAccountName','balance','network','current','wallet','activeAccount', 'sdk', 'tokens', 'tokenBalance','isLedger']),
        maxValue() {
            let calculatedMaxValue = this.balance - this.fee
            return calculatedMaxValue > 0 ? calculatedMaxValue.toString() : 0;
        },
        amount() {
            return typeof this.data.tx.amount != "undefined" ? this.data.tx.amount : 0
        },
        fee() {
            return this.txFee.min
        },
        maxFee() {
            return this.txFee.max.toFixed(7)
        },
        totalSpend() {
            if(typeof this.data.tx.token != 'undefined') {
                return parseFloat(this.amount).toFixed(7)
            }
            return (parseFloat(this.amount) + parseFloat(this.selectedFee)).toFixed(7)
        },
        insufficientBalance() {
            // if (this.data.type != 'contractCall') {
                if(typeof this.data.tx.token != 'undefined') {
                    return this.tokenBalance - this.amount <= 0
                }
                return this.maxValue - this.amount <= 0
            // }
        },
        inccorectAddress() {
                if(this.data.type != 'txSign') {
                    return this.receiver == null || this.receiver == ""
                }
                return  (!checkAddress(this.receiver) && !chekAensName(this.receiver) ) 
        },
        watchBalance() {
            return this.balance
        },
        txType() {
            if(this.data.type == 'txSign') {
                return "Send AE"
            }else if(this.data.type == 'contractCall') {
                if(this.data.tx.method != "" ) {
                    return this.data.tx.method
                }
                return "Contract Call"
            }else if(this.data.type == "contractCreate") {
                return "Contract Create"
            }else if(this.data.type == 'namePreClaim') {
                return "Name Preclaim"
            }else if(this.data.type == 'nameClaim') {
                return 'Name Claim'
            }else if(this.data.type == 'nameUpdate') {
                return 'Name Update'
            }
        },
        isAddressShow() {
            if(this.data.type == 'contractCreate' || this.data.type == 'namePreClaim' || this.data.type == 'nameClaim' || this.data.type == 'nameUpdate') {
                return false
            }
            return true
        },
        isNameTx() {
            return this.data.type == 'namePreClaim' || this.data.type == 'nameClaim' || this.data.type == 'nameUpdate'
        },
        convertSelectedFee() {
            return BigNumber(this.selectedFee).shiftedBy(MAGNITUDE)
        },
        token () {
            return typeof this.data.tx.token != 'undefined' ? this.data.tx.token : 'AE' 
        }
    },
    watch:{ 
        watchBalance() {
            this.showAlert(true)
        }
    },
    methods: {
        async init() {
            this.setReceiver()
            if(this.isLedger && this.data.type != 'txSign') {
                this.$store.dispatch('popupAlert', { name: 'account', type: 'ledger_support'})
                .then(() => {
                    if(this.data.popup) {
                        setTimeout(() => {
                            window.close()
                        })
                    }else {
                        this.redirectInExtensionAfterAction()
                    }
                })
            }
            if(this.data.tx.hasOwnProperty("options") && this.data.tx.options.hasOwnProperty("amount")) {
                this.data.tx.amount = this.data.tx.options.amount
            }
            if(typeof this.data.callType != "undefined" && this.data.callType == 'static') {
                this.loaderType = ''
                this.loading = true
                this.loaderContent = this.$t('pages.signTransaction.contractCalling')
                
                this.checkSDKReady = setInterval(async () => {
                    if(this.sdk != null) {
                        window.clearTimeout(this.checkSDKReady)
                        let byteCode = await this.checkSourceByteCode(this.data.tx.source)
                        let deployedByteCode = await this.getDeployedByteCode(this.data.tx.address)
                        
                        if(byteCode.bytecode == deployedByteCode.tx.code) {
                            //Contract call static should be moved here after fixing differences between source of contract and the source compiled with
                            let call = await this.contractCallStatic(this.data.tx)
                            this.sending = true
                            this.port.postMessage(call)
                        }else {
                            this.errorTx.error.message = "Invalid contract interface"
                            this.sending = true
                            this.port.postMessage(this.errorTx)
                        }
                        let list = await removeTxFromStorage(this.data.id)
                        browser.storage.sync.set({pendingTransaction: { list } }).then(() => {})
                        setTimeout(() => {
                            window.close()
                        },1000)
                    }
                },500)
            }else {
                if(this.data.popup) {
                    browser.storage.sync.get('pendingTransaction').then((tx) => {
                        let list = {}
                        if(tx.hasOwnProperty('pendingTransaction') && tx.pendingTransaction.hasOwnProperty("list")) { 
                            list = tx.pendingTransaction.list
                        }
                        list[this.data.id] = this.data
                        browser.storage.sync.set({pendingTransaction:{ list }}).then(() => { })
                    })
                }   
                this.checkSDKReady = setInterval(async () => {
                    if( this.sdk != null ) {
                        window.clearTimeout(this.checkSDKReady)
                        this.txParams = {
                            ...this.sdk.Ae.defaults
                        }
                        
                        if(this.data.type == 'contractCreate') {
                            this.data.tx.contract = {}
                            this.data.tx.contract.params = escapeCallParams(this.data.tx.init)
                            this.data.tx.contract.bytecode = (await this.sdk.contractCompile(FUNGIBLE_TOKEN_CONTRACT)).bytecode
                            let callData = await contractEncodeCall(this.sdk,FUNGIBLE_TOKEN_CONTRACT,'init',[...this.data.tx.contract.params])
                            this.txParams = {
                                ...this.txParams,
                                ownerId:this.account.publicKey,
                                code:this.data.tx.contract.bytecode,
                                callData,
                            } 
                        }else if(this.data.type == 'contractCall') {
                            this.data.tx.call = {}
                            this.data.tx.params = escapeCallParams(this.data.tx.params)
                            let callData = await contractEncodeCall(this.sdk,this.data.tx.source,this.data.tx.method,[...this.data.tx.params])
                            this.txParams = {
                                ...this.txParams,
                                callData,
                                contractId:this.data.tx.address,
                                callerId:this.account.publicKey
                            }
                            
                        }else if(this.data.type == 'txSign') {
                            let recipientId 
                            if(this.data.tx.recipientId.substring(0,3) == 'ak_') {
                                recipientId = this.data.tx.recipientId
                            }else {
                                try {
                                    let address = await this.sdk.api.getNameEntryByName(this.data.tx.recipientId)
                                    if(typeof address.pointers[0] != "undefined") {
                                        recipientId = address.pointers[0].id
                                        this.receiver = recipientId
                                    }else {
                                        this.receiver = ""
                                        this.showAlert()
                                        return
                                    }
                                }catch(err) {
                                    this.receiver = ""
                                    this.showAlert()
                                    return
                                }
                                
                            }

                            this.txParams = {
                                ...this.txParams,
                                senderId:this.account.publicKey,
                                recipientId:recipientId
                            }
                        }else if(this.data.type == 'namePreClaim') {
                            this.txParams = { 
                                ...this.txParams,
                                accountId:this.account.publicKey,
                                commitmentId:"cm_PtSWNMMNJ187NzGgivLFpYKptevuFQx1rKdqsDFAKVkXtyjPJ"
                            }
                        }else if(this.data.type == 'nameClaim') {
                            this.txParams = { 
                                ...this.txParams,
                                accountId:this.account.publicKey,
                                name:"nm_2Wb2xdC9WMSnExyHd8aoDu2Ee8qHD94nvsFQsyiy1iEyUGPQp9",
                                nameSalt:this.data.tx.preclaim.salt
                            }
                        }else if(this.data.type == 'nameUpdate') {
                            this.txParams = {
                                ...this.txParams,
                                accountId:this.account.publicKey,
                                nameId:this.data.tx.claim.id,
                                pointers:this.data.tx.claim.pointers
                            }
                        }
                        let fee = calculateFee(TX_TYPES[this.data.type],this.txParams)
                        this.txFee = fee
                        this.selectedFee = this.fee.toFixed(7)
                    }
                }, 500)
            }
            currencyConv(this)
            if(this.data.popup) {
                this.port = browser.runtime.connect({ name: this.data.id })
                this.port.onMessage.addListener((msg, sender,sendResponse) => {})
            }
            
            setTimeout(() => {
                this.showAlert()
            },3500)
        },
        setReceiver() {
            if(this.data.type == 'txSign') {
                this.receiver = this.data.tx.recipientId
            }else if(this.data.type == 'contractCall') {
                this.receiver = this.data.tx.address
            }
        },
        showAlert(balance = false) {
            if(this.insufficientBalance) {
                this.alertMsg = this.$t('pages.signTransaction.insufficientBalance')
            }else if(this.inccorectAddress && this.isAddressShow) {
                this.alertMsg = this.$t('pages.signTransaction.inccorectAddress')
            }else{
                this.alertMsg = ''
            }

            if(this.alertMsg == '') {
                this.signDisabled = false
            }else {
                this.signDisabled = true
                if(balance) {
                    setTimeout(() => {
                        if(this.data.popup && !this.sending) {
                            this.errorTx.error.message = this.alertMsg
                            
                            this.port.postMessage(this.errorTx)
                            setTimeout(() => {
                                window.close()
                            },1000)
                        }
                    },5000)  
                }
            }
        },
        async cancelTransaction() {
            let list = await removeTxFromStorage(this.data.id)
            if(!this.data.popup) {
                if(this.data.type == 'nameUpdate') {
                    this.$store.dispatch('removePendingName', { hash: this.data.tx.hash }).then(() => {
                        browser.storage.sync.set({pendingTransaction: { list } }).then(() => {})
                        this.redirectInExtensionAfterAction()
                    })
                }else {
                    browser.storage.sync.set({pendingTransaction: { list } }).then(() => {})
                    this.redirectInExtensionAfterAction()
                }   
                
            }else {
                browser.storage.sync.set({pendingTransaction: { list } }).then(() => {
                    this.errorTx.error.message = "Transaction rejected by user"
                    this.sending = true
                    this.port.postMessage(this.errorTx)
                    setTimeout(() => {
                        window.close()
                    },1000)
                })
            } 
        },
        redirectInExtensionAfterAction() {
            browser.storage.sync.get('pendingTransaction').then((data) => {
                if(data.hasOwnProperty('pendingTransaction') && data.pendingTransaction.hasOwnProperty('list') && Object.keys(data.pendingTransaction.list).length > 0) {
                    let tx = data.pendingTransaction.list[Object.keys(data.pendingTransaction.list)[0]];
                    tx.popup = false
                    tx.countTx =  Object.keys(data.pendingTransaction.list).length
                    this.$router.push({'name':'sign', params: {
                        data:tx,
                        type:tx.type
                    }});
                }else {
                    this.$store.commit('SET_AEPP_POPUP',false)
                    this.$router.push('/account')
                }
            });
        },
        signSpendTx(amount) {
                this.sdk.spend(parseInt(amount), this.receiver, { fee: this.convertSelectedFee}).then(async result => {
                    if(typeof result == "object") {
                        this.loading = false
                        this.hash = result.hash
                        let txUrl = this.network[this.current.network].explorerUrl + '/#/tx/' + result.hash
                        let msg = 'You have sent ' + this.amount + ' AE'
                        if(this.data.popup) {
                            let res = {
                                "id": null,
                                "jsonrpc": "2.0",
                                "method":"aeppMessage",
                                "params":{...result}
                                
                            }
                            this.sending = true
                            this.port.postMessage(res)
                            let list = await removeTxFromStorage(this.data.id)
                            browser.storage.sync.set({pendingTransaction: { list } }).then(() => {})
                            
                            setTimeout(() => {
                                window.close()
                            },1000)
                        }else {
                            this.$store.dispatch('popupAlert', { name: 'spend', type: 'success_transfer',msg,data:txUrl})
                            .then(async () => {
                                this.$store.commit('SET_AEPP_POPUP',false)
                                let list = await removeTxFromStorage(this.data.id)
                                browser.storage.sync.set({pendingTransaction: { list } }).then(() => {})
                                this.redirectInExtensionAfterAction()
                            })
                        }
                    }
                    else {
                        
                    }
                })
                .catch(async err => {
                    if(this.data.popup) {
                        this.sending = true
                        this.port.postMessage(this.errorTx)
                        let list = await removeTxFromStorage(this.data.id)
                        browser.storage.sync.set({pendingTransaction: { list } }).then(() => {})
                        setTimeout(() => {
                            window.close()
                        },1000)
                    }else {
                        this.$store.dispatch('popupAlert', { name: 'spend', type: 'transaction_failed'})
                    }
                    this.loading = false;
                    return;
                });
        },
        async signSpendTxLedger(amount) {
            const tx = await this.sdk.spendTx({ senderId: this.account.publicKey, recipientId: this.receiver, amount, fee: this.convertSelectedFee })
            let sign = await this.$store.dispatch('ledgerSignTransaction', { tx })  
            this.loading = false
            if(sign.success) {
                let txUrl = this.network[this.current.network].explorerUrl + '/#/tx/' + sign.res.hash
                let msg = 'You have sent ' + this.amount + ' AE'
                this.$store.dispatch('popupAlert', { name: 'spend', type: 'success_transfer',msg,data:txUrl})
                .then(async () => {
                    this.$store.commit('SET_AEPP_POPUP',false)
                    this.redirectInExtensionAfterAction()
                })
            }else {
                this.$store.dispatch('popupAlert', { name: 'spend', type: 'transaction_failed'}).then(() => {
                    this.redirectInExtensionAfterAction()
                })
            }
        },
        async contractCallStatic(tx) {
            try {
                if(tx.options.hasOwnProperty("amount")) {
                    tx.options.amount = BigNumber(this.data.tx.options.amount).shiftedBy(MAGNITUDE)
                }
                let call = await this.sdk.contractCallStatic(tx.source,tx.address,tx.method,tx.params, { options: tx.options } )
                let decoded = await call.decode()
                call.decoded = decoded
                this.sending = true
                this.port.postMessage(call)
            }catch(err) {
                this.errorTx.error.message = err.message
                this.sending = true
                this.port.postMessage(this.errorTx)
            }
            let list = await removeTxFromStorage(this.data.id)
            browser.storage.sync.set({pendingTransaction: { list } }).then(() => {})
            setTimeout(() => {
                window.close()
            },1000)
            
        },
        async contractCall(){
            let call
            try {
                if(this.data.tx.options.hasOwnProperty("amount")) {
                    this.data.tx.options.amount = BigNumber(this.data.tx.options.amount).shiftedBy(MAGNITUDE)
                }
                if (this.data.popup) {
                    let byteCode = await this.checkSourceByteCode(this.data.tx.source)
                    let deployedByteCode = await this.getDeployedByteCode(this.data.tx.address)
                    if(byteCode.bytecode == deployedByteCode.tx.code) {
                        call = await this.sdk.contractCall(this.data.tx.source,this.data.tx.address,this.data.tx.method,this.data.tx.params, {...this.data.tx.options, fee:this.convertSelectedFee})
                        let decoded = await call.decode()
                        call.decoded = decoded
                        let { decode, ...res} = call
                        this.sending = true
                        this.port.postMessage({...res})
                    }else {
                        this.errorTx.error.message = "Invalid contract interface"
                        this.sending = true
                        this.port.postMessage(this.errorTx)
                        setTimeout(() => {
                            window.close()
                        }, 500)
                    }
                }
                else {
                    call = await this.sdk.contractCall(this.data.tx.source,this.data.tx.address,this.data.tx.method,this.data.tx.params, { ...this.data.tx.options, fee:this.convertSelectedFee})
                    let decoded = await call.decode()
                }
            }catch(err) {
                console.log(err);
                this.errorTx.error.message = err.message
                this.sending = true
                this.port.postMessage(this.errorTx)
            }
            let list = await removeTxFromStorage(this.data.id)
            browser.storage.sync.set({pendingTransaction: { list } }).then(() => {})
            if(this.data.popup) {
                setInterval(() => {
                    window.close()
                },1000)
            }else {
                this.redirectInExtensionAfterAction()
            }
        },
        async contractDeploy() {
            let deployed
            if(this.isLedger) {
                let { ownerId, amount, gas, code, callData, deposit } = this.txParams 
                let tx = (await this.sdk[TX_TYPES[this.data.type]]({ownerId, amount, gas, code, callData, deposit})).tx
                let sign = await this.$store.dispatch('ledgerSignTransaction', { tx })  
                
            }else {
                deployed = await this.sdk.contractDeploy(this.data.tx.contract.bytecode, FUNGIBLE_TOKEN_CONTRACT, [...this.data.tx.contract.params ], { fee: this.convertSelectedFee })
            }
            
            
            this.loading = false
            if(this.data.popup) {
                setTimeout(() => {
                    window.close()
                },1000)
            }else {
                let msg = `Contract deployed at address <br> ${deployed.address}`
                this.$store.dispatch('popupAlert', { name: 'spend', type: 'success_deploy',msg})
                .then(() => {
                    let tokens = this.tokens.map(tkn => tkn)
                    tokens.push({
                        contract:deployed.address,
                        name:this.data.tx.contract.params[0].split('"').join(''),
                        symbol:this.data.tx.contract.params[2].split('"').join(''),
                        precision:this.data.tx.contract.params[1],
                        balance:0,
                        parent:this.account.publicKey
                    })
                    this.$store.dispatch('setTokens', tokens).then(() => {
                        browser.storage.sync.set({ tokens: this.tokens}).then(() => { 
                            this.redirectInExtensionAfterAction()
                        })
                    })
                })
            }
        },
        async namePreclaim(){
            const preclaim = await this.sdk.aensPreclaim(this.data.tx.name)
            let tx = {
                popup:false,
                tx: {
                    name:this.data.tx.name,
                    recipientId:'',
                    preclaim
                },
                type:'nameClaim'
            }
            this.$store.commit('SET_AEPP_POPUP',true)
            
            this.$router.push({'name':'sign', params: {
                data:tx,
                type:tx.type
            }});
        },  
        async nameClaim() {
            const claim =  this.sdk.aensClaim(this.data.tx.name, this.data.tx.preclaim.salt, { waitMined: false })
            setTimeout(() => {
                this.$store.commit('SET_AEPP_POPUP',false)
                this.$router.push('/generalSettings')
            },1000)
        },
        async nameUpdate(){
            const update = this.sdk.aensUpdate(this.data.tx.claim.id, this.account.publicKey)
            this.$store.dispatch('popupAlert', {
                name: 'account',
                type: 'added_success'
            }).then(() => {
                this.$store.dispatch('removePendingName',{ hash: this.data.tx.hash }).then(() => {
                    this.$store.commit('SET_AEPP_POPUP',false)
                    this.$router.push('/generalSettings')
                })  
            })
        },
        async signTransaction() {
            if(!this.signDisabled) {
                this.loading = true
                let amount = BigNumber(this.amount).shiftedBy(MAGNITUDE);
                try {
                    if(this.data.type == 'txSign') {
                        if(this.isLedger) {
                            this.signSpendTxLedger(amount)
                        }else {
                            this.signSpendTx(amount)
                        }
                    }else if(this.data.type == 'contractCall') {
                        if(this.data.callType == 'pay') {
                            this.contractCall()
                        }else {
                            let call = await this.sdk.contractCall(this.data.tx.source,this.data.tx.address,this.data.tx.method,this.data.tx.params, { fee:this.convertSelectedFee})
                            let decoded = await call.decode()
                            let msg = `You have sent ${this.data.tx.amount} ${this.data.tx.token}` 
                            let txUrl = this.network[this.current.network].explorerUrl + '/#/tx/' + call.hash
                            this.$store.dispatch('popupAlert', { name: 'spend', type: 'success_transfer',msg, data:txUrl})
                            .then(() => {
                                this.$store.commit('SET_AEPP_POPUP',false)
                                this.$router.push('/account')
                            })
                        }
                    }else if(this.data.type == 'contractCreate') {
                        this.contractDeploy()
                    }else if(this.data.type == 'namePreClaim') {
                        this.namePreclaim()
                    }else if(this.data.type == 'nameClaim') {
                        this.nameClaim()
                    }else if(this.data.type == 'nameUpdate') {
                        this.nameUpdate()
                    }
                }catch(err) {
                    console.log(err);
                }
            }
        },
        convertCurrency(currency, amount) {
            return parseFloat(convertAmountToCurrency(currency,amount))
        },
        async checkSourceByteCode(source) {
            let byteCode = await this.sdk.contractCompile(source)
            return byteCode
        },
        async getDeployedByteCode(address) {
            let res = await fetch(`https://testnet.mdw.aepps.com/middleware/contracts/transactions/address/${address}`)
            let txs = await res.json()
            let byteCode = txs.transactions.find(tx => tx.tx.type == "ContractCreateTx")
            return byteCode
        }
    },
    async beforeDestroy() {
        if(this.data.popup) {
            if(!this.sending) {
                this.port.postMessage(this.errorTx)
            }   
        }
        let list = await removeTxFromStorage(this.data.id)
        browser.storage.sync.set({pendingTransaction: { list } }).then(() => {})
    },
    beforeRouteUpdate (to, from, next) {
        next()
        
    }
}
</script>

<style lang="scss" scoped>
@import '../../../common/base';
.balanceSpend {
    font-size:2rem;
    color:#001833;
}
.spendTxDetailsList .ae-list-item {
    padding:1rem;
    position:relative;
    cursor: unset;
    text-transform: uppercase;
    font-size:.9rem;
}
.spendTxDetailsList .ae-button {
    margin-bottom:0 !important;
}
.arrowSeprator {
    margin-right:1rem;
    background:$primary-color;
    color:#fff;
    border-radius: 50%;
    width: 20px;
    height: 20px;
    text-align: center;
    vertical-align: middle;
    padding-left: 0px;
    padding-top:1.5px;
    border: 1px solid #d8d8d8;
    line-height:20px;
    .ae-icon {
        font-size:1.2rem !important;
        float:none !important;
    }
    &:after{
        content:"";

    }
}

.whiteBg {
    background:#fff;
}
.spendAccountAddr {
    padding:0 0.5rem !important;
    font-weight:bold !important;
}
.noBorder {
    border-top:none !important;
}
.accountFrom {
    width:50%;
}
.accountTo{
    width:70%;
    .ae-icon {
        font-size:2rem
    }
}
.spendAccountAddr {
    font-size:0.9rem !important;
    font-family:"IBM Plex Mono", monospace;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}
.btnFixed {
    background:#fff;
}
.btnFixed button {
    width:50%;
}
.confirm.disabled {
    opacity:0.5;
    cursor:unset;
}
.ae-badge {
    border:2px solid #001833;
    background:$color-alternative;
}
.ae-header {
    margin-bottom:0 !important;
}
.extend {
    width:100%;
}
.fiat-rate {
    color:#939393;
    font-size:1rem;
}
.tx-label {
    margin-top:.4rem
}
</style>
