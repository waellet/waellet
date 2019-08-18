<template>
    <div class="popup">
        <div class="actions">
            <button class="backbutton toAccount" @click="navigateToSettings"><ae-icon name="back" /> {{language.buttons.backToSettings}}</button>
        </div>
        <h3 style='text-align:center;'>{{language.pages.settings.aboutSettings.heading}}</h3>
        <div class="logo-center">
            <img :src="logo" alt="Waellet logo">
        </div>
        <p>
            {{ language.system.name }}
        </p>
        <div v-if="loading" class="loading">
            <ae-loader />
        </div>
    </div>
</template>

<script>
import locales from '../../locales/locales.json';

export default {
    data () {
        return {
            logo: browser.runtime.getURL('../../../icons/icon_128.png'),
            language: locales['en'],
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