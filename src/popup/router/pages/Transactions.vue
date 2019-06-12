<template>
    <div >
        <h3 class="transactionsPadding">Transactions History</h3>
        <!--<div class="tabs">
            <span @click="changeTransactionType('all')" :class="{'tab-active':transactionsType == 'all'}">All</span>
            <span @click="changeTransactionType('incoming')" :class="{'tab-active':transactionsType == 'incoming'}">Incoming</span>
            <span @click="changeTransactionType('outgoing')" :class="{'tab-active':transactionsType == 'outgoing'}">Outgoing</span>
        </div>-->

        <ae-list>
            <div v-for="(trans,index) in groupedTransactions">
                <div class="date">{{index == new Date().toDateString() ? 'Today' : index}}</div>
                <TransactionItem v-for="transaction in trans" :transactionData="transaction"></TransactionItem>
            </div>
            <ae-button v-if="currentCount > 0 && showMore" face="flat" @click="loadMore" fill="neutral">Load more</ae-button>
        </ae-list>
        <Loader :loading="loading" v-bind="{'content':''}"></Loader>
    </div>
</template>

<script>
import locales from '../../locales/locales.json';
import {mapGetters} from 'vuex';
export default {
    data() {
        return {
            transactionsType:'all',
            allTransactions:[],
            loading:true,
            page:1,
            limit:15,
            showMoreBtn:true,
            totalTransactions:0,
            currentCount:0,
            groupedTransactions:{}
        }
    },
    locales,
    computed: {
        ...mapGetters(['account']),
        showMore() {
            return this.currentCount + 1 <= this.totalTransactions;
        }
    },
    created(){
        this.getTotalTransactions();
        this.getTransactions();
        
    },
    methods: {
        changeTransactionType(type) {
            this.transactionsType = type;
        },
        getTransactions(){
            this.loading = true;
            let transactions = this.$store.dispatch('getTransactionsByPublicKey',{publicKey:this.account.publicKey,page:this.page,limit:this.limit});
            transactions.then(res => {
                let grouped = this.groupedTransactions;
                let count = this.currentCount;
                res.forEach(trans => {
                    if(typeof grouped[new Date(trans.time).toDateString()] == 'undefined') {
                        grouped[new Date(trans.time).toDateString()] = [];
                    }
                    grouped[new Date(trans.time).toDateString()].push(trans);
                    count++;
                });
                if(res.length != 0) {
                    this.groupedTransactions = grouped;
                    this.currentCount = count;
                }else {
                    this.showMoreBtn = false;
                }
                this.loading = false;
            });
        },
        getTotalTransactions() {
            let transactions = this.$store.dispatch('getTransactionsByPublicKey',{publicKey:this.account.publicKey,param:'count'});
            transactions.then(res => this.totalTransactions = res.count);
        },
        loadMore() {
            this.page++;
            this.getTransactions();
        },
        group() {
            console.log(this.groupedTransactions);
        }
    }
}
</script>

<style lang="scss" scoped>
@import '../../../common/base';
.date{
    background: #EDF3F7;
    padding: 0.5rem 1rem;
    color: #4e4e4e;
    text-transform: uppercase;
    font-size: 0.9rem;
    font-family: monospace;
}
</style>
