<template>
    <div class="wrapper">
        <h3>Transactions History</h3>
        <div class="tabs">
            <span @click="changeTransactionType('all')" :class="{'tab-active':transactionsType == 'all'}">All</span>
            <span @click="changeTransactionType('incoming')" :class="{'tab-active':transactionsType == 'incoming'}">Incoming</span>
            <span @click="changeTransactionType('outgoing')" :class="{'tab-active':transactionsType == 'outgoing'}">Outgoing</span>
        </div>

        <ae-list>
            <TransactionItem v-for="transaction in transactions" :transactionData="transaction"></TransactionItem>
        </ae-list>
    </div>
</template>

<script>
import locales from '../../locales/locales.json';
import {mapGetters} from 'vuex';
export default {
    data() {
        return {
            transactionsType:'all',
            allTransactions:[]
        }
    },
    locales,
    computed: {
        ...mapGetters(['account']),
        transactions() {
            if(this.transactionsType == 'all') {
                return this.allTransactions;
            }else if(this.transactionsType == 'incoming') {
                return this.allTransactions.filter(transaction => transaction.tx.recipient_id == this.account.publicKey);
            }else if(this.transactionsType == 'outgoing') {
                return this.allTransactions.filter(transaction => transaction.tx.sender_id == this.account.publicKey);
            }
        }
    },
    created(){
        let transactions = this.$store.dispatch('getTransactionsByPublicKey',{publicKey:this.account.publicKey});
        transactions.then(res => this.allTransactions = res);
    },
    methods: {
        changeTransactionType(type) {
            this.transactionsType = type;
            
        }
    }
}
</script>

<style lang="scss" scoped>
@import '../../../common/base';
</style>
