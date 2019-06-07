<template>
    <div @click="showTransactionDetails">
        <ae-list-item fill="neutral" class="list-item-transaction">
            <ae-identicon :address="transactionData.tx.sender_id" />
            <div class="transaction-address">
                <ae-address :value="transactionData.tx.sender_id" length="short" />
                <ae-text face="mono-xs">{{ new Date(transactionData.time).toLocaleTimeString() }}</ae-text>
            </div>
            <div class="text-right balance-change">
                <div class="balance" :class="balanceSign" >{{transactionData.tx.amount / 10 ** 18}}</div>
                <small><span class="balance">{{transactionData.tx.fee / 10 ** 18}}</span></small>
            </div>
        </ae-list-item>
    </div>
</template>

<script>
import locales from '../../locales/locales.json';
import {mapGetters} from 'vuex';
export default  {
    props: ['transactionData'],
    data() {
        return {}
    },
    computed: {
        ...mapGetters(['account']),
        balanceSign() {
            return this.transactionData.tx.sender_id == this.account.publicKey ? 'minus' : 'plus';
        }
    },
    locales,
    methods: {
        showTransactionDetails() {
            this.$router.push({'name':'transaction-details',params: { transaction: this.transactionData }});
        }
    }
}
</script>

<style lang="scss" scoped>
@import '../../../common/base';
$color-neutral-negative-3: #203040;
$color-alternative: #14CCB7;
$color-neutral-negative-1: #76818C;

.list-item-transaction {
    justify-content: space-around;
    .ae-address {
        
        font-weight: bold;
        color: $color-neutral-negative-3;
    }
    .pending {
        
        font-weight: bold;
        color: $primary-color;
    }
    .balance-change {
        
        font-weight: bold;
        color: $primary-color;
        text-align: right;
        .plus {
            color: $color-alternative !important;
            &:before {
                content: '+';
            }
        }
        .minus {
            color: $primary-color !important;
            &:before {
                content: '-';
            }
        }
        .balance {
            font-weight: bold;
            color: $color-neutral-negative-3;
        }
        small {
            display: block;
            .balance {
                
                font-size: rem(11px);
                font-weight: normal;
                color: $color-neutral-negative-1;
            }
        }
    }
    .balance {
        font-weight: bold;
        color: $color-neutral-negative-1;

        &.invert {
            color: #fff;
        }

        &:after {
            content: 'AE';
        }
    }
    .transaction-address {
        text-align: left;
    }
}
</style>
