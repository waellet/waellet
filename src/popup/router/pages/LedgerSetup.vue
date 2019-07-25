<template>
    <div class="popup">
        <h3>Ledger Setup</h3>

        <ae-button @click="addAccount" face="round" class="ledger">Add</ae-button>
    </div>
</template>

<script>
import locales from '../../locales/locales.json'
import { mapGetters } from 'vuex';


export default {
    data () {
        return {
            language: locales['en'],
            
        }
    },
    computed: {
        ...mapGetters(['ledgerApi','account','sdk','balance'])
    },
    locales: locales,
    created() {
        // this.$store.dispatch('ledgerRequest')
    },
    methods: {
        addAccount() {
            this.$store.dispatch('ledgerCreate')
        }
    }   
}
</script>

<style>

</style>
