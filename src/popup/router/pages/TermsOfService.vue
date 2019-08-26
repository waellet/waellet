<template>
    <div class="popup">
        <div class="actions">
            <button class="backbutton toAccount" @click="navigateToIndex"><ae-icon name="back" /> {{ $t('pages.termsOfService.backButton') }}</button>
        </div>
        <h2> {{ $t('pages.termsOfService.heading') }} </h2>
        <h2> In progress.. </h2>
        <!-- <p class="termsText">
            
        </p>  -->
    </div>
</template>

<script>
import { mapGetters } from 'vuex';

export default {
    data(){
        return {
        }
    },
    created() {
    },
    methods: {
        navigateToIndex() {
            this.$router.push('/');
        },
    },
    computed: {
    }
}
</script>

<style lang="scss" scoped>
@import '../../../common/base';
.termsText {
    width: 100%;
    white-space: pre-line;
    text-align: left;
    font-weight: 600;
}


</style>
