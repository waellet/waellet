<template>
    <div class="popup">
        <div class="actions">
            <button class="backbutton toAccount" @click="navigateTokenMigrationInfo"><ae-icon name="back" /> {{$t('pages.tokenMigration.backToTokenMigration') }}</button>
        </div>
        <h3>{{$t('pages.tokenMigration.heading') }}</h3>
        <ae-panel>
            <h4>{{$t('pages.tokenMigration.heading') }}</h4>
            <hr>
            <div v-if="step == 1">
                <AddressInput @update="(val) => address = val" />
                <br>
                <ae-check class="tokenRegistry" v-model="checkContinue">
                    {{$t('pages.tokenMigration.checkContinue') }}
                </ae-check>
            </div>
            <div v-if="step == 2">
                <ae-input :label="$t('pages.tokenMigration.ethPrivateKey')" v-model="ethPrivateKey"/>
                <br>
                <ae-input :label="$t('pages.tokenMigration.backendServiceUrl')" v-if="customBackendService" v-model="backendServiceUrl"/>
            </div>

            <div v-if="step == 3">
                <alert :fill="error ? 'primary' : 'alternative'" :show="true">
                    <div slot="content">{{ migrationMessage }}</div>
                </alert>
            </div>

            <ae-button face="round" fill="primary" @click="nextStep" v-if="step <= 2" :class="disabledButton ? 'disabled' : ''" extend >{{$t('pages.tokenMigration.continue') }}</ae-button>
        </ae-panel>
        
    </div>
</template>

<script>
import Web3 from 'web3';
import { checkAddress } from '../../utils/helper';
import { MIGRATION_SERVICE_URL } from '../../utils/constants';
export default {
    data() {
        return {
            address: null,
            checkContinue: false,
            web3: null,
            step:1,
            ethPrivateKey:null,
            customBackendService: false,
            backendServiceUrl:'',
            error: false,
            migrationMessage:''
        }
    },
    created() {
        this.web3 = new Web3()
    },
    computed: {
        disabledButton() {
            if(this.step == 1 && (!this.checkContinue ||  !checkAddress(this.address))) {
                return true
            } else if(this.step == 2 && (!this.ethPrivateKey || this.ethPrivateKey == '' || (this.customBackendService && this.backendServiceUrl == ''))) {
                return true;
            }

            return false;
        }
    },
    methods:{
        navigateTokenMigrationInfo(){
            this.$router.push('/token-migration-info')
        },
        async nextStep() {
            if(this.disabledButton) {
                return
            }   

            if(this.step == 2) {
                let signed_message = this.web3.eth.accounts.sign(this.address, this.ethPrivateKey)
                let url = this.customBackendService ? this.backendServiceUrl : MIGRATION_SERVICE_URL
                let res = await fetch(`${url}`).then(res => res.json).catch(err => err)
                this.migrationMessage = 'Token migration created. '
            }
            this.step += 1
        }
    }
}
</script>

<style lang="scss" scoped>
@import '../../../common/base';
.ae-button {
    margin-top:1rem;
}
.ae-button.disabled {
    opacity:0.5;
    cursor:unset;
}
p small {
    font-weight:normal;
}
</style>
