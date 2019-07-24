<template>
    <div class="popup">
        <div class="actions">
            <button class="backbutton toAccount" @click="back"><ae-icon name="back" /> {{language.pages.transactionDetails.backToTransactions}}</button>
        </div>
        <h3 class="transactionsPadding">{{language.pages.transactionDetails.heading}}</h3>
        <ae-list class="transactionList ">
            <ae-list-item fill="neutral">
                <div class="detailTitle">{{language.pages.transactionDetails.date}}</div>
                <div class="transactionDate">{{new Date(transaction.time).toLocaleString()}}</div>
            </ae-list-item>
            <ae-list-item fill="neutral">
                <div class="detailTitle">{{language.pages.transactionDetails.type}}</div>
                <ae-badge :class="transactionType.fill" class="transactionType">{{transactionType.type}}</ae-badge>
            </ae-list-item> 
            <ae-list-item fill="neutral" class="flex-direction-column">
                <div class="flex-col flex-justify-between flex mb-1" v-if="isSpendTx">
                    <div class="detailTitle">{{language.pages.transactionDetails.amount}}</div>
                    <div class="balance transactionAmount">{{txAmount}}</div>
                </div>
                <div class="flex-col flex-justify-between flex mb-1">
                    <div class="detailTitle">{{language.pages.transactionDetails.fee}}</div>
                    <div class="balance transactionFee">{{txFee}}</div>
                </div>
                <div class="flex-col flex-justify-between flex flex-align-center">
                    <div class="detailTitle">{{language.pages.transactionDetails.total}}</div>
                    <div class="balance balanceTotal">{{txTotal}}</div>
                </div>
            </ae-list-item>
            <ae-list-item fill="neutral" class="flex-direction-column"  v-if="isSpendTx">
                <div class="flex-col text-left mb-1 detailTitle">{{language.pages.transactionDetails.txFrom}} <button :class="transactionType.fill" v-clipboard:copy="transaction.tx.sender_id" @click="copy" class="copyBtn">COPY</button></div>
                <input disabled :value="transaction.tx.sender_id" length="flat"  class="transationFrom transactionDetailsInputs"/>
            </ae-list-item>
            <ae-list-item fill="neutral" class="flex-direction-column"  v-if="isSpendTx">
                <div class="flex-col text-left mb-1 detailTitle">{{language.pages.transactionDetails.txTo}} <button :class="transactionType.fill" v-clipboard:copy="transaction.tx.recipient_id" @click="copy" class="copyBtn">COPY</button></div>
                <input disabled :value="transaction.tx.recipient_id" length="flat" class="transactionTo transactionDetailsInputs"/>
            </ae-list-item>
            <ae-list-item fill="neutral" class="flex-direction-column"  v-if="!isSpendTx">
                <div class="flex-col text-left mb-1 detailTitle">{{language.pages.transactionDetails.txAccount}} <button :class="transactionType.fill" v-clipboard:copy="transaction.tx.account_id" @click="copy" class="copyBtn">COPY</button></div>
                <input disabled :value="txAccount" length="flat" class="transactionTo transactionDetailsInputs"/>
            </ae-list-item>
            <ae-list-item fill="neutral" class="flex-direction-column" v-if="isNameClaimTx">
                <div class="flex-col text-left mb-1 detailTitle">{{language.pages.transactionDetails.txName}} <button :class="transactionType.fill" v-clipboard:copy="transaction.tx.name" @click="copy" class="copyBtn">COPY</button></div>
                <div  class="flex-justify-items-left transactionName text-left">{{transaction.tx.name}}</div>
            </ae-list-item>
            <ae-list-item fill="neutral" class="flex-direction-column">
                <div class="flex-col text-left mb-1 detailTitle">{{language.pages.transactionDetails.txHash}} <button :class="transactionType.fill" v-clipboard:copy="transaction.hash" @click="copy" class="copyBtn">COPY</button></div>
                <input disabled :value="transaction.hash" length="flat"  class="transactionHash transactionDetailsInputs"/>
            </ae-list-item>
        </ae-list>
        <ae-button-group  class="btnFixed">
            <ae-button face="round" class=" transactionExplorerBtn" :fill="transactionType.fill" @click="transactionInExplorer">    <ae-icon name="search" />  {{language.pages.transactionDetails.explorer}} </ae-button>
        </ae-button-group>
        <popup :popupSecondBtnClick="popup.secondBtnClick"></popup>
    </div>

</template>

<script>
import locales from '../../locales/locales.json';
import { mapGetters } from 'vuex';
export default {
    data() {
        return {
            language: locales['en']
        }
    },
    props: ['transaction'],
    locales,
    computed: {
        ...mapGetters(['account','current','network' ,'popup']),
        txAmount() {
            return this.isSpendTx ? this.transaction.tx.amount / 10 ** 18 : 0; 
        },
        txFee() {
            return this.transaction.tx.fee / 10 ** 18;
        },
        txTypeBadge () {
           return 'badge' + this.transaction.tx.type;
        },
        transactionType() {
            if(this.transaction.tx.type == "SpendTx") {
                if(this.transaction.tx.sender_id == this.account.publicKey) {
                    return {fill:"primary", type: "Spend Tx Out"}
                }else {
                    return {fill:"alternative", type: "Spend Tx In"}
                }
            }else if(this.transaction.tx.type == "ContractCreateTx") {
                return {fill:"secondary", type: "Contract Create Tx"}
            }else if(this.transaction.tx.type == "NamePreclaimTx" || this.transaction.tx.type == "NameUpdateTx" || this.transaction.tx.type == "NameClaimTx") {
                return {fill:"", type:this.transaction.tx.type}
            }
        },
        transactionThemeColor () {
            return this.transaction.tx.sender_id == this.account.publicKey ? 'secondary' : 'alternative';
        },
        isSpendTx() {
            return this.transaction.tx.type == 'SpendTx';
        },
        isNameClaimTx() {
            return this.transaction.tx.type == 'NameClaimTx';
        },
        isConractCreateTx() {
            return this.transaction.tx.type == 'ContractCreateTx';
        },
        txTotal() {
            return (this.txAmount + this.txFee).toFixed(7)
        },
        txAccount() {
            return this.isConractCreateTx ? this.transaction.tx.owner_id : this.transaction.tx.account_id
        }
    },
    methods: {
        transactionInExplorer() {
            browser.tabs.create({url: this.network[this.current.network].explorerUrl + '/#/tx/' + this.transaction.hash, active: false});
        },
        back() {
            this.$router.push('/transactions');
        },
        copy(){
            this.$store.dispatch('popupAlert', { name: 'account', type: 'publicKeyCopied'});
        },
    }
}
</script>

<style lang="scss" scoped>
@import '../../../common/base';
.transactionDetailsInputs {
    width: 100%;
    background: #EDF3F7;
    color: #000;
    padding: 20px;
}
.copyBtn {
    color: #ffffff;
    background:#929CA6;
    float: right;
    &.primary {
        background:$primary-color;
    }
    &.alternative {
        background:$color-alternative;
    }
    &.secondary {
        background:$color-secondary;
    }
}
.ae-list-item {
    justify-content: space-between;
}
.detailTitle {
    color:$color-neutral-negative-1;
}
.balanceTotal {
    font-size:1.5rem;
    color:#000;
}
.badgeSpendTx {
    background:$primary-color !important;
    color:#FFF !important;
}
.text-left {
    text-align: left;
}
.transactionList {
    margin-bottom:45px !important;
}
.transactionName {
    font-family:"IBM Plex Mono", monospace;
    width:100%;
}
</style>
