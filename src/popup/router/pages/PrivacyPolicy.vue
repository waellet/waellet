<template>
    <div class="popup">
        <div class="actions">
            <button class="backbutton toAccount" @click="navigateToIndex"><ae-icon name="back" /> {{ $t('pages.privacyPolicy.backButton') }}</button>
        </div>
        <h2> {{ $t('pages.privacyPolicy.heading') }} </h2>
        <h2> In progress.. </h2>
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



</style>
