<template>
    <div>
        <div class="popup">
            <div class="actions">
                <button class="backbutton toAccount" @click="navigateUtilities"><ae-icon name="back" /> {{$t('pages.fungibleTokensPage.backToUtilities') }}</button>
            </div>
            <h3>{{$t('pages.mintTokenPage.mint') }}</h3>
            <div>
                <ae-panel>
                    <h4>{{$t('pages.mintTokenPage.mint') }}</h4>
                    <hr>
                    <select class="dropdown-menu" >
                        <option value="default" disabled>{{$t('pages.allowances.chooseToken')}}</option>
                        <option 
                            v-for="(tok, key) in fungibleTokens" 
                            :key="key" 
                            :value="tok.key">
                            {{tok.name}}
                        </option>
                    </select>
                    <ae-input :label="$t('pages.mintTokenPage.address')" class="address">
                        <textarea class="ae-input textarea" v-model="address" placeholder="ak.."  slot-scope="{ context }" @focus="context.focus = true" @blur="context.focus = false" />
                        <ae-toolbar slot="footer" align="right">
                            
                        </ae-toolbar>
                    </ae-input>
                    <div class="input-container">
                        <ae-input :label="$t('pages.mintTokenPage.amount') " >
                            <input type="text" class="ae-input token-contract" v-model="amount" slot-scope="{ context }" @focus="context.focus = true" @blur="context.focus = false" />
                        </ae-input>
                    </div>

                    <ae-button face="round" fill="primary" @click="mint" class="to-confirm-add" extend >{{$t('pages.mintTokenPage.mintBtn') }}</ae-button>
                </ae-panel>
            </div>
        </div>
        <popup :popupSecondBtnClick="popup.secondBtnClick"></popup>
        <Loader size="big" :loading="loading" type="transparent" ></Loader>
    </div>
</template>

<script>
import { mapGetters } from 'vuex';
import { FUNGIBLE_TOKEN_CONTRACT } from '../../utils/constants';

export default {
    data() {
        return {
            loading:false,
            token:0,
            amount:null,
            address:null,
            error:null
        }
    },
    computed: {
        ...mapGetters(['sdk','account','tokens','popup']),
        fungibleTokens() {
            return this.tokens.filter((t,index) => {
                t.key = index;
                return t.parent == this.account.publicKey && t.name != 'AE'
            });
        }
    },
    async created() {

    },
    methods:{
        navigateUtilities() {
            this.$router.push('/utilities')
        },
        mint() {
            if (this.amount && this.address) {
                let tx = {
                    popup:false,
                    tx: {
                        source:     FUNGIBLE_TOKEN_CONTRACT,
                        address:    this.fungibleTokens[this.token].contract,
                        method:     'mint', 
                        params:     [this.address,this.amount],
                        amount:     0,
                        token:      this.fungibleTokens[this.token].symbol
                    },
                    callType: 'pay',
                    type:'contractCall'
                }
                this.$store.commit('SET_AEPP_POPUP',true)
                this.$router.push({'name':'sign', params: {
                    data:tx
                }});
            } else {
                this.error = "";
            }
        }
    }
}
</script>

<style lang="scss" scoped>
@import '../../../common/base';


</style>
