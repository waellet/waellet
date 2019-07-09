<template>
    <div class="popup">
        <h3 class="transactionsPadding">{{language.pages.transactionDetails.heading}}</h3>
        <ae-list class="transactionList ">
            <ae-list-item fill="neutral">
                <div class="detailTitle">{{language.pages.transactionDetails.date}}</div>
                <div class="transactionDate">{{new Date(transaction.time).toLocaleString()}}</div>
            </ae-list-item>
            <ae-list-item fill="neutral">
                <div class="detailTitle">{{language.pages.transactionDetails.type}}</div>
                <ae-badge :class="txTypeBadge" class="transactionType">{{transaction.tx.type}}</ae-badge>
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
                    <div class="balance balanceTotal">{{txAmount + txFee}}</div>
                </div>
            </ae-list-item>
            <ae-list-item fill="neutral" class="flex-direction-column"  v-if="isSpendTx">
                <div class="flex-col text-left mb-1 detailTitle">{{language.pages.transactionDetails.txFrom}}</div>
                <ae-address :value="transaction.tx.sender_id" length="flat"  class="flex-justify-items-left transationFrom text-left"/>
            </ae-list-item>
            <ae-list-item fill="neutral" class="flex-direction-column"  v-if="isSpendTx">
                <div class="flex-col text-left mb-1 detailTitle">{{language.pages.transactionDetails.txTo}}</div>
                <ae-address :value="transaction.tx.recipient_id" length="flat" class="flex-justify-items-left transactionTo text-left" />
            </ae-list-item>
            <ae-list-item fill="neutral" class="flex-direction-column"  v-if="!isSpendTx">
                <div class="flex-col text-left mb-1 detailTitle">{{language.pages.transactionDetails.txAccount}}</div>
                <ae-address :value="transaction.tx.account_id" length="flat" class="flex-justify-items-left transactionTo text-left" />
            </ae-list-item>
            <ae-list-item fill="neutral" class="flex-direction-column" v-if="isNameClaimTx">
                <div class="flex-col text-left mb-1 detailTitle">{{language.pages.transactionDetails.txName}}</div>
                <div  class="flex-justify-items-left transactionName text-left">{{transaction.tx.name}}</div>
            </ae-list-item>
            <ae-list-item fill="neutral" class="flex-direction-column">
                <div class="flex-col text-left mb-1 detailTitle">{{language.pages.transactionDetails.txHash}}</div>
                <ae-address :value="transaction.hash" length="flat"  class="flex-justify-items-left transactionHash text-left"/>
            </ae-list-item>
        </ae-list>
        <ae-button-group  class="btnFixed">
            <ae-button face="round" class=" backBtn " fill="primary" @click="back"><ae-icon name="back" size="50px" /> {{language.pages.transactionDetails.transactions}} </ae-button>
            <ae-button face="round" class=" transactionExplorerBtn" :fill="transactionThemeColor" @click="transactionInExplorer">    <ae-icon name="search" />  {{language.pages.transactionDetails.explorer}} </ae-button>
        </ae-button-group>
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
        ...mapGetters(['account','current','network']),
        txAmount() {
            return this.isSpendTx ? this.transaction.tx.amount / 10 ** 18 : 0; 
        },
        txFee() {
            return this.transaction.tx.fee / 10 ** 18;
        },
        txTypeBadge () {
           return 'badge' + this.transaction.tx.type;
        },
        transactionThemeColor () {
            return this.transaction.tx.sender_id == this.account.publicKey ? 'secondary' : 'alternative';
        },
        isSpendTx() {
            return this.transaction.tx.type == 'SpendTx';
        },
        isNameClaimTx() {
            return this.transaction.tx.type == 'NameClaimTx';
        }
    },
    methods: {
        transactionInExplorer() {
            browser.tabs.create({url: this.network[this.current.network].explorerUrl + '/#/tx/' + this.transaction.hash, active: false});
        },
        back() {
            this.$router.push('/transactions');
        }
    }
}
</script>

<style lang="scss" scoped>
@import '../../../common/base';
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
