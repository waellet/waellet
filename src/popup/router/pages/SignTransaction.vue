<template>
    <div>
        <ae-list class="spendTxDetailsList">
            <ae-list-item fill="neutral" class="flex-justify-between whiteBg">
                <div class="flex flex-align-center">
                    <ae-identicon :address="data.senderId" />
                    <ae-address :value="data.senderId" length="short" class="spendAccountAddr" />
                </div>
                <ae-filter-separator />
                <div class="arrowSeprator">
                    <ae-icon name="left-more" />
                </div>
                <div class="flex flex-align-center">
                    <ae-identicon :address="data.recipientId" />
                    <ae-address :value="data.recipientId" length="short" class="spendAccountAddr" />
                </div>
            </ae-list-item>
            <ae-list-item fill="neutral" class="flex-justify-between">
                <div class="balance balanceSpend">{{amount}}</div>
            </ae-list-item>
            <ae-list-item fill="neutral" class="flex-justify-between whiteBg">
                <div>Transaction fee</div>
                <div class="balance balanceBig">{{fee}}</div>
            </ae-list-item>
            <ae-list-item fill="neutral" class="flex-justify-between whiteBg">
                <div>Total</div>
                <div class="balance balanceBig balanceTotalSpend">{{amount + fee}}</div>
            </ae-list-item>
            <ae-list-item fill="neutral">
                <ae-button-group class="fullWidth">
                    <ae-button face="round" fill="primary">Cancel</ae-button>
                    <ae-button face="round" fill="alternative">Confirm</ae-button>
                </ae-button-group>
            </ae-list-item>
         </ae-list>
    </div>
</template>

<script>
import locales from '../../locales/locales.json'
import {mapGetters} from 'vuex';

export default {
    data(){
        return {};
    },
    props:['data'],
    locales,
    methods: {

    },
    computed: {
        ...mapGetters(['account']),
        amount() {
            return this.data.amount / 10 ** 18;
        },
        fee() {
            return this.data.fee / 10 ** 18;
        }
    }
}
</script>

<style lang="scss" scoped>
@import '../../../common/base';
.balanceSpend {
    font-size:2.5rem;
    color:#000;
}
.spendTxDetailsList .ae-list-item {
    padding:1rem;
    position:relative;
    cursor: unset;
    text-transform: uppercase;
}
.spendTxDetailsList .ae-button {
    margin-bottom:0 !important;
}
.fullWidth {
    width:100%;
}
.arrowSeprator {
    position:absolute;
    top:50%;
    left:50%;
    transform:translate(-50%,-50%);
    -webkit-transform:translate(-50%,-50%);
    -ms-transform:translate(-50%,-50%);
    background: white;
    border-radius: 50%;
    width: 20px;
    height: 20px;
    text-align: center;
    vertical-align: middle;
    padding-left: 2px;
    border: 1px solid #d8d8d8;
}
.whiteBg {
    background:#fff;
}
.spendAccountAddr {
    padding:0 0.5rem !important;
    font-weight:bold !important;
}
</style>
