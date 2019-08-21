<template>
    <div class="popup">
        <div class="actions">
            <button class="backbutton toAccount" @click="navigateToSettings"><ae-icon name="back" /> {{ $t('pages.aboutSettings.backToSettings') }}</button>
        </div>
        <h3 style='text-align:center;'>{{ $t('pages.aboutSettings.heading') }}</h3>
        <div class="logo-center">
            <img :src="logo" alt="Waellet logo">
        </div>
        <p>
            {{ $t('pages.aboutSettings.systemName') }}
        </p>
        <div v-if="loading" class="loading">
            <ae-loader /> 
        </div>
    </div>
</template>

<script>

export default {
    data () {
        return {
            logo: browser.runtime.getURL('../../../icons/icon_128.png'),
            loading: false,
        }
    },
    methods: {
        navigateToSettings() {
            this.$router.push('/settings')
        },
    }
}
</script>

<style lang="scss">

@import '../../../common/base';
.backbtn {
    width: 50%; margin-top: 5px;
}
</style>