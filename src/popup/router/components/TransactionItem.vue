<template>
    <div @click="showTransactionDetails">
        <ae-list-item fill="neutral" class="list-item-transaction">
            <ae-identicon :address="transactionData.tx.sender_id" />
            <div class="transaction-address">
                <ae-address :value="transactionData.tx.sender_id" length="short" />
                <ae-text face="mono-xs">{{ new Date(transactionData.time).toDateString() + ' ' + new Date(transactionData.time).toLocaleTimeString() }}</ae-text>
            </div>
            <div class="text-right balance-change">
                <ae-badge class="badgeTransactionType" :class="transactionTypeClass">{{transactionType}}</ae-badge>
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
        },
        transactionTypeClass() {
            return "transaction" + (this.transactionData.tx.sender_id == this.account.publicKey ? 'Outgoing' : 'Incoming');
        },
        transactionType() {
            return this.transactionData.tx.sender_id == this.account.publicKey ? 'outgoing' : 'incoming'
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
.list-item-transaction {
    justify-content: space-around;
    .ae-address {
        
        font-weight: bold;
        color: $color-neutral-negative-2;
    }
    .pending {
        
        font-weight: bold;
        color: $color-secondary;
    }
    .balance-change {
        
        font-weight: bold;
        color: $color-secondary;
        text-align: right;
        .plus {
            color: $color-alternative !important;
            &:before {
                content: '+';
            }
        }
        .minus {
            color: $color-secondary !important;
            &:before {
                content: '-';
            }
        }
        .balance {
            font-weight: bold;
            color: $color-neutral-negative-2;
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
            content: ' AE';
        }
    }
    .transaction-address {
        text-align: left;
    }
}
</style>
