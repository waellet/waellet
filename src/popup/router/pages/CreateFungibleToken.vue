<template>
    <div class="popup">
        <div class="actions">
            <button class="backbutton toAccount" @click="navigateFungibleTokens"><ae-icon name="back" /> {{$t('pages.createFungibleToken.backToFungibleTokens') }}</button>
        </div>
        <h3>{{$t('pages.createFungibleToken.heading') }}</h3>
        <ae-panel>
            <h4>{{$t('pages.createFungibleToken.heading') }}</h4>
            <hr>
            <div>
                <div class="input-container token-name-holder">
                    <ae-input :label="$t('pages.createFungibleToken.tokenName') " >
                        <input type="text" class="ae-input token-name" v-model="token.name" slot-scope="{ context }" @focus="context.focus = true" @blur="context.focus = false" />
                        <ae-toolbar slot="footer" v-if="err.name">
                            Enter token name
                        </ae-toolbar>
                    </ae-input>
                </div>
                <div class="input-container token-symbol-holder">
                    <ae-input :label="$t('pages.createFungibleToken.tokenSymbolLabel') ">
                        <input type="text" class="ae-input token-symbol" v-model="token.symbol" slot-scope="{ context }" @focus="context.focus = true" @blur="context.focus = false" />
                        <ae-toolbar slot="footer" v-if="err.symbol">
                            Invalid token symbol value
                        </ae-toolbar>
                    </ae-input>
                </div>
                <div class="input-container token-precision-holder">
                    <ae-input :label="$t('pages.createFungibleToken.initialSupply') " >
                        <input class="ae-input token-initialSupply" v-model.number="token.initialSupply" slot-scope="{ context }" @focus="context.focus = true" @blur="context.focus = false" />
                        <ae-toolbar slot="footer" v-if="err.initialSupply">
                            Invalid initial supply
                        </ae-toolbar>
                    </ae-input>
                </div>
                <div class="input-container token-precision-holder">
                    <ae-input :label="$t('pages.createFungibleToken.tokenPrecision') " >
                        <input type="number" min="0" max="36" step="1" class="ae-input token-precision" v-model.number="token.precision" slot-scope="{ context }" @focus="context.focus = true" @blur="context.focus = false" />
                        <ae-toolbar slot="footer" v-if="err.precision">
                            Invalid token precision
                        </ae-toolbar>
                    </ae-input>
                </div>
                <ae-check class="tokenRegistry" v-model="tokenRegistry">
                    {{$t('pages.createFungibleToken.registryFee') }}
                </ae-check>
                <ae-button face="round" fill="primary" @click="confirmTx" class="confirmTx" extend >{{$t('pages.createFungibleToken.deployTokenContract') }}</ae-button>
            </div>
        </ae-panel>
    </div>
</template>

<script>
import { mapGetters } from 'vuex';
import { isInt } from '../../utils/helper'
import { FUNGIBLE_TOKEN_CONTRACT, MIN_SPEND_TX_FEE, MAX_REASONABLE_FEE, TX_TYPES } from '../../utils/constants';


export default {
    data() {
        return {
            token: {
                name:'',
                precision: 18,
                symbol:'',
                initialSupply: undefined
            },
            tokenRegistry:false,
            err:{
                name:false,
                symbol:false,
                precision:false,
                initialSupply: false
            }
        }
    },
    computed: {
        ...mapGetters(['sdk','account','balance','wallet'])
    },
    async created() {
        
    },
    methods: {
        navigateFungibleTokens() {
            this.$router.push('/fungible-tokens')
        },
        confirmTx() {
            this.resetErr()
            if(this.token.name == '') {
                this.err.name = true 
                return
            }
            if(this.token.symbol == '' || (this.token.symbol != '' && this.token.symbol.length > 12)) {
                this.err.symbol = true 
                return
            }
            if(this.token.precision < 0 || this.token.precision > 36 || !isInt(this.token.precision)) {
                this.err.precision = true
                return
            }
            let contractInitArgs = []
            for(let param in this.token) {
                contractInitArgs.push(this.token[param])
            }
            let tx = {
                popup:false,
                tx: {
                    amount:0,
                    recipientId:'',
                    init:contractInitArgs,
                    contractType: 'fungibleToken',
                    tokenRegistry: this.tokenRegistry
                },
                type:'contractCreate'
            }
            this.$store.commit('SET_AEPP_POPUP',true)
            this.$router.push({'name':'sign', params: {
                data:tx
            }});
        },
        resetErr() {
            this.err.name = false
            this.err.symbol = false
            this.err.precision = false
            this.err.initialSupply = false
        }
    }
}
</script>

<style lang="scss" scoped>
@import '../../../common/base';

</style>
