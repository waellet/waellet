<template>
    <main>
        <div class="wrapper">
            <h3>Transactions Details</h3>
            <ae-list>
                <ae-list-item fill="neutral">
                    <div>Date</div>
                    <div>{{new Date(transaction.time).toLocaleString()}}</div>
                </ae-list-item>
                <ae-list-item fill="neutral">
                    <div>Status</div>
                    <div></div>
                </ae-list-item>
                <ae-list-item fill="neutral" class="flex-direction-column">
                    <div class="flex-col flex-justify-between flex">
                        <div>Amount</div>
                        <div>{{txAmount}}</div>
                    </div>
                    <div class="flex-col flex-justify-between flex">
                        <div>Transaction Fee</div>
                        <div>{{txFee}}</div>
                    </div>
                    <div class="flex-col flex-justify-between flex">
                        <div>Total</div>
                        <div>{{txAmount + txFee}}</div>
                    </div>
                </ae-list-item>
                <ae-list-item fill="neutral" class="flex-direction-column">
                    <div class="flex-col text-left">From</div>
                    <ae-address :value="transaction.tx.sender_id" />
                </ae-list-item>
                <ae-list-item fill="neutral" class="flex-direction-column">
                    <div class="flex-col text-left">To</div>
                    <ae-address :value="transaction.tx.recipient_id" />
                </ae-list-item>
                 <ae-list-item fill="neutral" class="flex-direction-column">
                    <div class="flex-col text-left">Tx hash</div>
                    <ae-address :value="transaction.hash" />
                </ae-list-item>
                <ae-button face="round" class="transactionExplorerBtn" fill="primary" @click="transactionInExplorer"> View in expolorer </ae-button>
            </ae-list>
        </div>
    </main>
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
        }
    },
    methods: {
        transactionInExplorer() {
            chrome.tabs.create({url: this.network[this.current.network].explorerUrl + '/#/tx/' + this.transaction.hash, active: false});
        }
    }
}
</script>

<style lang="scss" scoped>
@import '../../../common/base';
.ae-list-item {
    justify-content: space-between;
}
.transactionExplorerBtn {
    position: fixed !important;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    -webkit-transform:translateX(-50%);
    -ms-transform:transateX(-50%);
}
</style>
