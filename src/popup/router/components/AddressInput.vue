<template>
    <ae-input :label="$t('pages.mintTokenPage.address')" class="address">
        <textarea class="ae-input textarea" v-model="address" placeholder="ak.."  slot-scope="{ context }" @focus="context.focus = true" @blur="context.focus = false" />
        <ae-toolbar slot="footer" align="right">
            <ae-dropdown v-if="subaccounts && subaccounts.length > 1">
                <ae-icon name="contacts" size="20px" slot="button" />
                <li v-for="(account, key) in subaccounts" v-bind:key="key" @click="setAccount(account.publicKey)">
                    <ae-identicon class="subAccountIcon" :address="account.publicKey" size="base"/> {{account.name}}
                </li>
            </ae-dropdown>
        </ae-toolbar>
    </ae-input>
</template>

<script>
import {mapGetters} from 'vuex';
export default {
    data() {
        return {
            address: null
        }
    },
    computed: {
        ...mapGetters(['subaccounts'])
    },
    watch: {
        address(val) {
            this.$emit("update",val)
        }
    },
    methods: {
        setAccount(address) {
            this.address = address
        }
    }
}
</script>

<style lang="scss" scoped>
@import '../../../common/base';
.ae-input-container{ overflow: unset;}
</style>