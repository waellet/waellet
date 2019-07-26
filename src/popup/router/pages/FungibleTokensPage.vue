<template>
    <div class="popup">
        <div class="actions">
            <button class="backbutton toAccount" @click="navigateAccount"><ae-icon name="back" /> {{language.buttons.backToUtilities}}</button>
        </div>
        <h3>Fungible Tokens</h3>
        <ae-panel>
            <h4>Add Fungible Token</h4>
            <hr>
            <p><small>This allows you to add token from given deployed fungible token contract</small></p>
            <ae-button face="round" fill="primary" class="add-token" @click="navigateAddToken">Add Token</ae-button>
        </ae-panel>
        <ae-panel>
            <h4>Add Fungible Token</h4>
            <hr>
            <p><small>This allows you to deploy your own fungible token contract</small></p>
            <ae-button face="round" fill="primary" class="create-token" @click="navigateCreateToken">Deploy Token Contract</ae-button>
        </ae-panel>
        
    </div>
</template>

<script>
import locales from '../../locales/locales.json';
export default {
    data() {
        return {
            language: locales['en'],
        }
    },
    locales,
    methods:{
        navigateAccount(){
            this.$router.push('/account')
        },
        navigateAddToken() {
            this.$router.push('/tokens')
        },
        navigateCreateToken() {
            this.$router.push('/create-token')
        }
    }
}
</script>

<style lang="scss" scoped>
@import '../../../common/base';
.ae-button {
    margin-top:1rem;
}
p small {
    font-weight:normal;
}
</style>
