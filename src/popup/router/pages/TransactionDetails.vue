<template>
    <div >
        <h3 class="transactionsPadding">Transactions Details</h3>
        <ae-list class="transactionList">
            <ae-list-item fill="neutral">
                <div class="detailTitle">Date</div>
                <div>{{new Date(transaction.time).toLocaleString()}}</div>
            </ae-list-item>
            <ae-list-item fill="neutral">
                <div class="detailTitle">Type</div>
                <ae-badge :class="txTypeBadge">{{transaction.tx.type}}</ae-badge>
            </ae-list-item> 
            <ae-list-item fill="neutral" class="flex-direction-column">
                <div class="flex-col flex-justify-between flex mb-1">
                    <div class="detailTitle">Amount</div>
                    <div class="balance">{{txAmount}}</div>
                </div>
                <div class="flex-col flex-justify-between flex mb-1">
                    <div class="detailTitle">Transaction Fee</div>
                    <div class="balance">{{txFee}}</div>
                </div>
                <div class="flex-col flex-justify-between flex flex-align-center">
                    <div class="detailTitle">Total</div>
                    <div class="balance balanceTotal">{{txAmount + txFee}}</div>
                </div>
            </ae-list-item>
            <ae-list-item fill="neutral" class="flex-direction-column">
                <div class="flex-col text-left mb-1 detailTitle">From</div>
                <ae-address :value="transaction.tx.sender_id" length="flat"  class="flex-justify-items-left"/>
            </ae-list-item>
            <ae-list-item fill="neutral" class="flex-direction-column">
                <div class="flex-col text-left mb-1 detailTitle">To</div>
                <ae-address :value="transaction.tx.recipient_id" length="flat" class="flex-justify-items-left" />
            </ae-list-item>
                <ae-list-item fill="neutral" class="flex-direction-column">
                <div class="flex-col text-left mb-1 detailTitle">Tx hash</div>
                <ae-address :value="transaction.hash" length="flat"  class="flex-justify-items-left"/>
            </ae-list-item>
            <ae-button-group  class="btnFixed">
                <ae-button face="round" class=" backBtn " fill="primary" @click="back"><ae-icon name="back" size="50px" /> Back </ae-button>
                <ae-button face="round" class=" transactionExplorerBtn" :fill="transactionThemeColor" @click="transactionInExplorer">    <ae-icon name="search" /> View in explorer </ae-button>
            </ae-button-group>
            
        </ae-list>
    </div>

</template>

<script>
import locales from '../../locales/locales.json';
import { mapGetters } from 'vuex';
export default {
    data() {
        return {}
    },
    props: ['transaction'],
    locales,
    computed: {
        ...mapGetters(['account','current','network']),
        txAmount() {
            return this.transaction.tx.amount / 10 ** 18;
        },
        txFee() {
            return this.transaction.tx.fee / 10 ** 18;
        },
        txTypeBadge () {
           return 'badge' + this.transaction.tx.type;
        },
        transactionThemeColor () {
            return this.transaction.tx.sender_id == this.account.publicKey ? 'secondary' : 'alternative';
        }
    },
    methods: {
        transactionInExplorer() {
            chrome.tabs.create({url: this.network[this.current.network].explorerUrl + '/#/tx/' + this.transaction.hash, active: false});
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
.btnFixed {
    position: fixed !important;
    bottom: 20px;
    left:50%;
    transform:translateX(-50%);
    -webkit-transform:translateX(-50%);
    -ms-transform:translateX(-50%);
    width:80%;
    button {
        margin-bottom:0 !important;
    }
    button .ae-icon { 
        font-size:1.5rem !important;
    }
}

.balance {
    font-weight: bold;
    color: $color-neutral-negative-1;
    font-family: monospace;
    &.invert {
        color: #fff;
    }

    &:after {
        content: ' AE';
    }
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
</style>
