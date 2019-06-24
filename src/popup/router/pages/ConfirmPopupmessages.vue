<template>
    <div class="popup">
        <h2><span class="primary">{{data}}</span> would like to connect to your account </h2>
        <p>This website is requesting access to view your current account address. Always make sure you trust the website you interact with. </p>
        <ae-button-group class="btnFixed">
            <ae-button face="round" fill="primary">Cancel</ae-button>
            <ae-button face="round" fill="alternative">Confirm</ae-button>
        </ae-button-group>
    </div>
</template>

<script>
import locales from '../../locales/locales.json'
import {mapGetters} from 'vuex';

export default {
    data(){
        return {};
    },
    locales,
    props:['data'],
    methods: {

    },
    computed: {
        ...mapGetters(['account'])
    }
}
</script>

<style lang="scss" scoped>
@import '../../../common/base';
.primary {
    color:$primary-color;
}
h2{
    word-break:break-word;
}
p{
    font-weight:normal;
}
</style>
