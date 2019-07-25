<template>
<div class="popup">
    <div class="actions">
        <button class="backbutton toAccount" @click="navigateAccount"><ae-icon name="back" /> {{language.buttons.backToAccount}}</button>
    </div>
    <h3>AirGap Setup</h3>

    <div v-if="step == 1" class="step1">
        <h4>Install AirGap on your phone</h4>
        <p class="airgap-setup-definitions">Search for AirGap.it in the store or scan this QR code</p>
        <div class="qr-wrapper">
            <qrcode-vue :value="this.airgap_it" foreground="#14CCB7" :size="180" level="H"></qrcode-vue>
        </div>
        <ae-button class="step-button" face="flat" fill="alternative" @click="next">Next <ae-icon name="left-more" /></ae-button>
    </div>

    <div v-if="step == 2" class="step2">
        <h5 class="airgap-setup-titles">Open AirGap on the 2nd device</h5>
        <p class="airgap-setup-definitions">
            <ae-badge class="airgap-setup-badge"><span style="font-weight:bold">1.</span> Turn off the internet connection before opening AirGap</ae-badge>
        </p>
        <ae-divider />
        <h5 class="airgap-setup-titles">Create secret key</h5>
        <p class="airgap-setup-definitions">
            <ae-badge class="airgap-setup-badge"><span style="font-weight:bold">2.</span> No internet connection means maximum security for the key</ae-badge>
        </p>
        <ae-divider />
        <h5 class="airgap-setup-titles">Write it down in the right order</h5>
        <p class="airgap-setup-definitions">
            <ae-badge class="airgap-setup-badge"><span style="font-weight:bold">3.</span> You will need it for recovery</ae-badge>
        </p>
        <ae-divider />
        <h5 class="airgap-setup-titles">Add an aeternity wallet</h5>
        <p class="airgap-setup-definitions">
            <ae-badge class="airgap-setup-badge"><span style="font-weight:bold">4.</span> Tap wallet, add wallet and choose aeternity</ae-badge>
        </p>
        <ae-divider />
        <h5 class="airgap-setup-titles">Link your aeternity wallet</h5>
        <p class="airgap-setup-definitions">
            <ae-badge class="airgap-setup-badge"><span style="font-weight:bold">5.</span> Finish by linking your vault to your aeternity address</ae-badge>
        </p>
        <br>
        <ae-button class="step-button" face="flat" fill="alternative" @click="linkVault">Link vault <ae-icon name="left-more" /></ae-button>
    </div>

</div>
</template>

<script>
import locales from '../../locales/locales.json'
import { mapGetters } from 'vuex';
import QrcodeVue from 'qrcode.vue';

export default {
    components: {
        QrcodeVue
    },
    data () {
        return {
            language: locales['en'],
            locales: locales,
            step: 1,
            airgap_it: 'https://airgap.it'
        }
    },
    methods: {
        navigateAccount() {
            this.$router.push('/account')
        },
        next(){
            this.step = this.step + 1;
            if (this.step > 3)
                this.step = 1;
        },
        linkVault() {
            this.$router.push('/qrCodeReader')
        }
    }
}
</script>



<style lang="scss" scoped>
@import '../../../common/base';
.airgap-setup-definitions {
    font-weight: normal;
    word-break: break-word;
    margin: 0;
    text-align: left;
}
.airgap-setup-titles {
    color: #9d3fc0;
    margin:0;
}
.airgap-setup-badge {
    background: none !important;
}
.step-button {
    font-size: 14px !important;
    margin-top: 2rem;
}
.qr-wrapper {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 5px;
    border-radius: 6px;
}


</style>