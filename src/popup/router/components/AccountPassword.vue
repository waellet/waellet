<template>
    <div >
        <ae-modal
            v-if="accountPasswordVisible"
            @close="accountPasswordVisible = false"
            title="Account Password">
            <ae-input  v-model="accountPassword" placeholder="" class="my-2" label="Password" />
            <ae-input  v-model="accountPassword" placeholder="" class="my-2" label="Repeat Password" />
            <ae-button face="round" extend fill="seconday" >Import</ae-button>
        </ae-modal> 
    </div>
</template>

<script>
import locales from '../../locales/locales.json';
export default {
    props: ['accountPasswordVisible','secretKey'],
    data() {
        return {
           
        }
    },
    locales,
    methods: {
    }
}

</script>
<style lang="scss" scoped>
@import '../../../common/base';

</style>