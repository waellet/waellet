<template>
    <div class="popup">
        <div v-if="page == ''">
            <div class="actions">
                <button class="backbutton toAccount" @click="navigateUtilities"><ae-icon name="back" />{{ language.buttons.backToUtilities }}</button>
            </div>
            <h3>Sign and verify messages</h3>
            <ae-panel>
                <h4>Sign message</h4>
                <hr>
                <!-- <p><small>This allows you to deploy your own fungible token contract</small></p> -->
                <ae-button face="round" fill="primary" class="create-token" @click="message='sign'">Sign</ae-button>
            </ae-panel>
            <ae-panel>
                <h4>Verify message</h4>
                <hr>
                <!-- <p><small>This allows you to deploy your own fungible token contract</small></p> -->
                <ae-button face="round" fill="primary" class="create-token" @click="message='verify'">Verify</ae-button>
            </ae-panel>
        </div>
        <div v-if="page=='sign'">
            <div class="actions">
                <button class="backbutton toAccount" @click="message = ''"><ae-icon name="back" />{{ language.buttons.backToSignVerifyMsg }}</button>
            </div>
            <h4>Sign message</h4>
            <hr>
            <ae-textarea v-model="verifyMessage" monospace placeholder="Message" />
            <!-- <p><small>This allows you to sign cryptographically message with your private key</small></p> -->
            <ae-button face="round" fill="primary" extend>Sign</ae-button>
        </div>
        <div v-if="page=='verify'">
            <div class="actions">
                <button class="backbutton toAccount" @click="message = ''"><ae-icon name="back" />{{ language.buttons.backToSignVerifyMsg }}</button>
            </div>
            <h4>Verify message</h4>
            <hr>
            <ae-textarea v-model="verifyMessage" monospace placeholder="Message" />
            <!-- <p><small>This allows you to sign cryptographically message with your private key</small></p> -->
            <ae-button face="round" fill="primary" extend>Verify</ae-button>
        </div>
    </div>
</template>

<script>
import locales from '../../locales/locales.json';
export default {
    data() {
        return {
            language: locales['en'],
            page: '',
            signMessage: '',
            verifyMessage: ''
        }
    },
    locales,
    methods:{
        navigateUtilities(){
            this.$router.push('/utilities')
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
