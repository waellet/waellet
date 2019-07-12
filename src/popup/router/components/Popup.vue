<template>
    <ae-modal-light
        class="popup-modal"
        v-if="popup.show"
        @close="closePopup"
        :title="popup.title"
        :class="(popup.secondBtn ? 'modal-two-buttons ' : '') + (popup.class ? popup.class : '')"
    >
        <div v-html="popup.msg"></div>
        <ae-button
            size="small"
            type="exciting"
            class="popup-button"
            face="round"
            :fill="popup.buttonsFillPrimary"
            uppercase
            @click.native="closePopup"
            slot="buttons"
        >{{ popup.buttonsTextPrimary }}</ae-button>
        <ae-button
            v-if="popup.secondBtn"
            class="popup-button"
            face="round"
            :fill="popup.buttonsFillSecondary"
            uppercase
            @click.native="clickSecondBtn"
            slot="buttons"
        >{{ popup.buttonsTextSecondary }}</ae-button>
    </ae-modal-light>
</template>

<script>

import { mapGetters } from 'vuex';

export default {
    props: [
        'popupSecondBtnClick'
    ],
    computed: {
        ...mapGetters(['popup']),
    },
    methods: {
        closePopup() {
            this.$store.commit('HIDE_POPUP');
            this.$store.commit('DEF_POPUP');
        },
        clickSecondBtn() {
            this.$parent[this.popupSecondBtnClick]();
            this.closePopup();
        },
    }
    
}
</script>

<style>

</style>
