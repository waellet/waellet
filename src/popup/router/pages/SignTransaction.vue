<template>
    <div class="popup">
        <ae-list class="spendTxDetailsList">
            <ae-list-item fill="neutral" class="flex-justify-between whiteBg noBorder">
                <div class="flex flex-align-center accountFrom">
                    <ae-identicon :address="account.publicKey" />
                    <span  class="spendAccountAddr">{{activeAccountName}}</span>
                    <!-- <ae-address :value="account.publicKey" length="short" /> -->
                </div>
                <div class="arrowSeprator">
                    <ae-icon name="left-more" />
                </div>
                <div class="flex flex-align-center accountTo">
                    <ae-identicon :address="receiver" />
                    <ae-address :value="receiver" length="short" class="spendAccountAddr" />
                </div>
            </ae-list-item>
            <ae-list-item fill="neutral" class="flex-justify-between flex-align-start flex-direction-column">
                <div>
                    <ae-badge v-if="data.type=='contractCall'">Contract Call</ae-badge>
                    <ae-badge>{{txType}}</ae-badge>
                </div>
                <div class="balance balanceSpend">{{amount}}</div>
                <div class="fiat-rate">${{convertCurrency(usdRate,amount)}}</div>
            </ae-list-item>
            <ae-list-item fill="neutral" class="flex-justify-between whiteBg flex-direction-column flex-align-center ">
                <div class="flex extend flex-justify-between flex-align-center">
                    <div>{{language.pages.transactionDetails.fee}}</div>
                    <div class="text-right">
                        <div class="balance balanceBig txFee">{{selectedFee}}</div>
                        <div class="fiat-rate">${{convertCurrency(usdRate,selectedFee)}}</div>
                    </div>
                </div>
                <div class="range-slider">
                    <div class="sliderOver"></div>
                    <input class="range-slider__range" type="range"  :min="txFee" :max="maxFee" step="0.000001" v-model="selectedFee">
                </div>
            </ae-list-item>
            <ae-list-item fill="neutral" class="flex-justify-between whiteBg">
                <div>{{language.pages.transactionDetails.total}}</div>
                <div class="text-right">
                    <div class="balance balanceBig balanceTotalSpend">{{totalSpend}}</div>
                    <div class="fiat-rate">${{convertCurrency(usdRate,totalSpend)}}</div>
                </div>
            </ae-list-item>
         </ae-list>
         <Alert fill="primary" :show="alertMsg != ''">
            <div slot="content">
                {{alertMsg}}
            </div>
         </Alert>
        <ae-button-group class="btnFixed">
            <ae-button face="round" fill="primary" @click="cancelTransaction" class="reject">{{language.pages.signTx.reject}}</ae-button>
            <ae-button face="round" fill="alternative" class="confirm" :class="signDisabled ? 'disabled' : '' " @click="signTransaction">{{language.pages.signTx.confirm}}</ae-button>
        </ae-button-group>
        <Loader size="big" :loading="loading" :type="loaderType" :content="loaderContent" ></Loader>
    </div>
</template>

<script>
import locales from '../../locales/locales.json'
import { mapGetters } from 'vuex';
import { convertToAE, currencyConv, convertAmountToCurrency } from '../../utils/helper';
import { MAGNITUDE, MIN_SPEND_TX_FEE, MIN_SPEND_TX_FEE_MICRO, MAX_REASONABLE_FEE } from '../../utils/constants';
import Wallet from '@aeternity/aepp-sdk/es/ae/wallet';
import { MemoryAccount } from '@aeternity/aepp-sdk';
import { getHdWalletAccount } from '../../utils/hdWallet';
import BigNumber from 'bignumber.js';
import { clearInterval, clearTimeout  } from 'timers';

export default {
    data(){
        return {
            port:null,
            txFee:MIN_SPEND_TX_FEE,
            popup:false,
            signDisabled:true,
            alertMsg:'',
            language: locales['en'],
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
            checkSDKReady:null
        };
    },
    props:['data'],
    locales,
    methods: {

    }, 
    mounted() {
        if(typeof this.data.callType != "undefined" && this.data.callType == 'static') {
            this.loaderType = ''
            this.loading = true
            this.loaderContent = this.language.pages.signTx.contractCall
            this.checkSDKReady = setInterval(async () => {
                if(this.sdk != null) {
                    window.clearTimeout(this.checkSDKReady)
                    let byteCode = await this.checkSourceByteCode(this.data.tx.source)
                    let deployedByteCode = await this.getDeployedByteCode(this.data.tx.address)
                    let call = await this.contractCallStatic(this.data.tx)
                    
                    if(byteCode.bytecode == deployedByteCode.tx.code) {
                        //Contract call static should be moved here after fixing differences between source of contract and the source compiled with

                        return
                    }else {
                        this.errorTx.error.message = "Invalid contract interface"
                        this.port.postMessage(this.errorTx)
                    }
                    this.removeTxStorageData()
                    setTimeout(() => {
                        window.close()
                    },1000)
                }
            },500)
        }else {
            browser.storage.sync.set({pendingTransaction:{data:this.data}}).then(() => { })
        }
    },
    created(){
        this.selectedFee = this.fee.toFixed(7)
        currencyConv(this)
        if(this.data.popup) {
            this.port = browser.runtime.connect({ name: "conn" })
            this.port.onMessage.addListener((msg, sender,sendResponse) => {})
        }
        
        setTimeout(() => {
            this.showAlert()
        },3500)
    },
    computed: {
        ...mapGetters(['account','activeAccountName','balance','network','current','wallet','activeAccount', 'sdk']),
        maxValue() {
            let calculatedMaxValue = this.balance - MIN_SPEND_TX_FEE
            return calculatedMaxValue > 0 ? calculatedMaxValue.toString() : 0;
        },
        amount() {
            return typeof this.data.tx.amount != "undefined" ? this.data.tx.amount : 0
        },
        fee() {
            return this.txFee
        },
        totalSpend() {
            return (parseFloat(this.amount) + parseFloat(this.selectedFee)).toFixed(7)
        },
        insufficientBalance() {
            return this.maxValue - this.amount <= 0
        },
        inccorectAddress() {
            return this.receiver == ""
        },
        watchBalance() {
            return this.balance
        },
        receiver() {
            if(this.data.type == 'txSign') {
                return this.data.tx.recipientId
            }else if(this.data.type == 'contractCall') {
                return this.data.tx.address
            }
        },
        txType() {
            if(this.data.type == 'txSign') {
                return "Spend"
            }else if(this.data.type == 'contractCall') {
                if(this.data.tx.method != "" ) {
                    return this.data.tx.method
                }
                return "Contract Call"
            }else if(this.data.tyoe == "contractDeploy") {
                return "Contract Deploy"
            }
        },
        maxFee() {
            return MAX_REASONABLE_FEE.toFixed(7)
        },

    },
    watch:{ 
        watchBalance() {
            this.showAlert()
        }
    },
    methods: {
        showAlert() {
            if(this.insufficientBalance) {
                this.alertMsg = this.language.pages.signTx.insufficientBalance
            }else if(this.inccorectAddress) {
                this.alertMsg = this.language.pages.signTx.inccorectAddress
            }else {
                this.alertMsg = ''
            }

            if(this.alertMsg == '') {
                this.signDisabled = false
            }else {
                this.signDisabled = true
            }
        },
        cancelTransaction() {
            this.$store.commit('SET_AEPP_POPUP',false)
            browser.storage.sync.get('pendingTransaction').then(data => {
                if(!this.data.popup) {
                    browser.storage.sync.remove('pendingTransaction').then(() => {})
                    this.$router.push('/account');
                }else {
                   browser.storage.sync.remove('pendingTransaction').then(() => {
                       this.port.postMessage(this.errorTx)
                       window.close()
                   })
                }
            });
        },
        removeTxStorageData() {
            browser.storage.sync.remove('pendingTransaction').then(() => {});
            browser.storage.sync.remove('showAeppPopup').then(() => {});  
        },
        signSpendTx(amount) {
            Wallet({
                url: this.network[this.current.network].url,
                internalUrl: this.network[this.current.network].internalUrl,
                accounts: [
                MemoryAccount({
                    keypair: {
                    secretKey: getHdWalletAccount(this.wallet,this.activeAccount).secretKey,
                    publicKey: this.account.publicKey
                    },
                    networkId: this.network[this.current.network].networkId
                })
                ],
                address: this.account.publicKey,
                onTx: confirm, // guard returning boolean
                onChain: confirm, // guard returning boolean
                onAccount: confirm, // guard returning boolean
                onContract: confirm, // guard returning boolean
                networkId: this.network[this.current.network].networkId
            })
            .then(ae => {
                ae.spend(parseInt(amount), this.receiver, { gas: this.selectedFee}).then(result => {
                    if(typeof result == "object") {
                        this.loading = false
                        let txUrl = this.network[this.current.network].explorerUrl + '/#/tx/' + result.hash
                        let msg = 'You send ' + this.amount + ' AE'
                        if(this.data.popup) {
                            let res = {
                                "id": null,
                                "jsonrpc": "2.0",
                                "method":"aeppMessage",
                                "params":{...result}
                                
                            }
                            this.port.postMessage(res)
                            this.removeTxStorageData()
                            setTimeout(() => {
                                window.close()
                            },1000)
                        }else {
                            this.$store.dispatch('popupAlert', { name: 'spend', type: 'success_transfer',msg,data:txUrl})
                            .then(() => {
                                this.$store.commit('SET_AEPP_POPUP',false)
                                this.removeTxStorageData()
                                this.$router.push('/account');
                            })
                        }
                    }
                    else {
                        
                    }
                })
                .catch(err => {
                    if(this.data.popup) {
                        this.port.postMessage(this.errorTx)
                        this.removeTxStorageData()
                    }else {
                        this.$store.dispatch('popupAlert', { name: 'spend', type: 'transaction_failed'})
                    }
                    this.loading = false;
                    return;
                });
            })
            .catch(err => {
                console.log(err);
            });
        },
        async contractCallStatic(tx) {
            try {
                let call = await this.sdk.contractCallStatic(tx.source,tx.address,tx.method,tx.params)
                let decoded = await call.decode()
                call.decoded = decoded
                this.port.postMessage(call)
            }catch(err) {
                this.errorTx.error.message = err.message
                this.port.postMessage(this.errorTx)
            }
            this.removeTxStorageData()
            setTimeout(() => {
                window.close()
            },1000)
            
        },
        async contractCall(){
           let call
            try {
                call = await this.sdk.contractCall(this.data.tx.source,this.data.tx.address,this.data.tx.method,this.data.tx.params)
                let decoded = await call.decode()
                call.decoded = decoded
                this.port.postMessage(call)
            }catch(err) {
                this.errorTx.error.message = err.message
                this.port.postMessage(this.errorTx)
            }
            this.removeTxStorageData()
            setTimeout(() => {
                window.close()
            },1000)
        },
        signTransaction() {
            if(!this.signDisabled) {
                this.loading = true
                let amount = BigNumber(this.amount).shiftedBy(MAGNITUDE);
                try {
                    if(this.data.type == 'txSign') {
                        this.signSpendTx(amount)
                    }else if(this.data.type == 'contractCall') {
                        if(this.data.callType == 'pay') {
                            this.contractCall()
                        }
                    }
                }catch(err) {
                    console.log(err);
                }
            }
        },
        convertCurrency(currency, amount) {
            return parseFloat(convertAmountToCurrency(currency,amount)).toFixed(7)
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
    beforeDestroy() {
        if(this.data.popup) {
            this.port.postMessage(this.errorTx)
        }
        this.removeTxStorageData()
    }
}
</script>

<style lang="scss" scoped>
@import '../../../common/base';
.balanceSpend {
    font-size:2.5rem;
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
}
.spendAccountAddr {
    font-size:0.9rem !important;
    font-family:"IBM Plex Mono", monospace;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
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
</style>
