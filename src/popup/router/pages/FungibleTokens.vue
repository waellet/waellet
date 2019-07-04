<template>
    <div class="popup">
        <div class="actions">
            <button class="backbutton toAccount" @click="navigateAccount"><ae-icon name="back" /> {{language.buttons.backToAccount}}</button>
        </div>
        <div class="tabs">
            <span @click="switchTabs('search')" :class="tabAcitveClass('search')">Search</span>
            <span @click="switchTabs('add')" :class="tabAcitveClass('add')">Custom Token</span>
        </div>

        <div v-if="activeTab == 'search'">
            <h3>{{language.pages.tokens.searchHeading}}</h3>
        </div>
        <div v-if="activeTab == 'add'">
            <h3>{{language.pages.tokens.addHeading}}</h3>
            <div class="input-container">
                <ae-input :label="language.pages.tokens.tokenContractLabel" v-model="token.contract" @keyup.native="validate('contract')">
                    <ae-toolbar slot="footer">
                        Valid token contract address
                    </ae-toolbar>
                </ae-input>
            </div>
            <div class="input-container">
                <ae-input :label="language.pages.tokens.tokenSymbolLabel">
                    <input type="text" :disabled="token.precisionDisabled" class="ae-input" @keyup.native="validate('symbol')" v-model="token.symbol" slot-scope="{ context }" @focus="context.focus = true" @blur="context.focus = false" />
                    <ae-toolbar slot="footer">
                        Symbol between 1 and 12 characters
                    </ae-toolbar>
                </ae-input>
            </div>
            <div class="input-container">
                <ae-input :label="language.pages.tokens.tokenPrecision" >
                    <input type="text" :disabled="token.precisionDisabled" class="ae-input" @keyup.native="validate('precision')" v-model="token.precision" slot-scope="{ context }" @focus="context.focus = true" @blur="context.focus = false" />
                    <ae-toolbar slot="footer" >
                        Number between 0 and 36
                    </ae-toolbar>
                </ae-input>
            </div>
            <ae-button face="round" fill="primary" @click="addCustomToken" extend >{{language.pages.tokens.addHeading}}</ae-button>
        </div>
    </div>
</template>

<script>
import locales from '../../locales/locales.json';
import { mapGetters } from 'vuex';
import { FUNGIBLE_TOKEN_CONTRACT } from '../../utils/constants';

export default {
    data() {
        return {
            activeTab:'add',
            language: locales['en'],
            token: {
                contract:'',
                symbol:'',
                precision:0,
                precisionDisabled:false
            },
            error: {
                type:null,
                msg:null
            },
        }
    },
    locales,
    computed: {
        ...mapGetters(['sdk','account'])
    },
    created(){
        setTimeout(() => {
            this.callContractMethod()
        },2000)
        
        // .then((res) => {
        //     console.log(res)
        //     res.decode()
        //     .then(data => {
        //         console.log(data)
        //     })
        // })
    },
    methods:{
        async callContractMethod() {
            let call = await this.sdk.contractCall(FUNGIBLE_TOKEN_CONTRACT,"ct_2CC7FPsumg5azo7xNH6XS9wCnzFqVCdE4WrKzrUk6Z4jNeazF8",'total_supply')
            console.log(call)
            call.decode()
            .then(data => {
                console.log(data)
            })
            
        },
        switchTabs(tab) {
            this.activeTab = tab
        },
        tabAcitveClass(tab) {
            return this.activeTab == tab ? 'tab-active' : ''
        },
        navigateAccount() {
            this.$router.push('/account')
        },
        validate(type) {
            if(type == 'contract') {
                this.token.precisionDisabled = false
                if(this.token.contract.length == 53) {
                    this.searchTokenMetaInfo(this.token.contract)
                }
            }
        },
        addCustomToken() {
            if( this.token.contract.length != 53 || 
                (this.token.symbol.length < 1 || this.token.symbol.length > 12) || 
                isNaN(this.token.precision) ||
                (!isNaN(this.token.precision) && (this.token.precision < 0 || this.token.precision > 36 ))
            ) {
                this.$store.dispatch('popupAlert', { name: 'account', type: 'token_add'});
            }else {

            }
        },
        searchTokenMetaInfo(address) {
            this.sdk.contractCall(FUNGIBLE_TOKEN_CONTRACT,address,'meta_info')
            .then((res) => {
                res.decode()
                .then(data => {
                    if(typeof data.decimals != 'undefined' && typeof data.symbol != 'undefined') {
                        this.token.precision = data.decimals
                        this.token.symbol = data.symbol
                        this.addToken = true
                        this.token.precisionDisabled = true
                    }
                })
            })
        }
    }
}
</script>

<style lang="scss" scoped>
@import '../../../common/base';
.actions {
  width: 50%;
  margin-top: 5px;
}
.tabs {
    margin-top:1rem;
}
.tabs span {
    width:49%;
}
</style>
