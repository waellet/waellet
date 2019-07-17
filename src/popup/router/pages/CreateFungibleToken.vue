<template>
    <div class="popup">
        <h3>{{language.pages.createFungibleToken.heading}}</h3>
        <ae-panel>
            <h4>{{language.pages.createFungibleToken.heading}}</h4>
            <hr>
            <div>
                <div class="input-container">
                    <ae-input :label="language.pages.tokens.tokenName" >
                        <input type="text" class="ae-input token-name" v-model="token.name" slot-scope="{ context }" @focus="context.focus = true" @blur="context.focus = false" />
                        <ae-toolbar slot="footer" v-if="err.name">
                            Enter token name
                        </ae-toolbar>
                    </ae-input>
                </div>
                <div class="input-container">
                    <ae-input :label="language.pages.tokens.tokenSymbolLabel">
                        <input type="text" class="ae-input token-symbol" v-model="token.symbol" slot-scope="{ context }" @focus="context.focus = true" @blur="context.focus = false" />
                        <ae-toolbar slot="footer" v-if="err.symbol">
                            Invalid token symbol value
                        </ae-toolbar>
                    </ae-input>
                </div>
                <div class="input-container">
                    <ae-input :label="language.pages.tokens.tokenPrecision" >
                        <input type="number" min="0" max="36" step="1" class="ae-input token-precision" v-model.number="token.precision" slot-scope="{ context }" @focus="context.focus = true" @blur="context.focus = false" />
                        <ae-toolbar slot="footer" v-if="err.precision">
                            Invalid token precision
                        </ae-toolbar>
                    </ae-input>
                </div>
                <ae-button face="round" fill="primary" @click="confirmTx" class="confirmTx" extend >{{language.pages.createFungibleToken.deployTokenContract}}</ae-button>
            </div>
        </ae-panel>
    </div>
</template>

<script>
import locales from '../../locales/locales.json';
import { mapGetters } from 'vuex';
import { FUNGIBLE_TOKEN_CONTRACT, MIN_SPEND_TX_FEE, MAX_REASONABLE_FEE, TX_TYPES } from '../../utils/constants';


export default {
    data() {
        return {
            language: locales['en'],
            token: {
                name:'',
                precision:0,
                symbol:''
            },
            err:{
                name:false,
                symbol:false,
                precision:false
            }
        }
    },
    computed: {
        ...mapGetters(['sdk','account','balance','wallet'])
    },
    created() {
    },
    methods: {
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
            if(this.token.precision < 1 || this.token .precision > 36) {
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
                    init:contractInitArgs
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
        }
    }
}
</script>

<style lang="scss" scoped>
@import '../../../common/base';

</style>
