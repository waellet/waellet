<template>
    <div class="popup">
        <div class="actions">
            <button class="backbutton toAccount" @click="navigateUtilities"><ae-icon name="back" /> {{language.buttons.backToUtilities}}</button>
        </div>
        <div>
            <div class="tipWebsiteHeader flex flex-align-center ">
                <Loader size="small" class="loader" v-if="loadFavicon" :loading="loadFavicon" v-bind="{'content':''}"></Loader>
                <img :src="favicon" v-if="!loadFavicon && typeof favicon !== 'undefined'" class="domainFavicon"/>
                <div v-if="!loadFavicon && typeof favicon == 'undefined' " class="domainFavicon noFavicon">No image</div>
                <div class="domainInfo text-left">
                    <h3>{{domain}}</h3>
                    <p>
                        <div v-if="domainVerified" class="verified verifyRow">
                            <ae-icon fill="alternative" face="round" name="check" /> 
                            {{language.pages.tip.domainVerified}}
                        </div>
                        <div v-else class="notVerified verifyRow">
                            <ae-icon fill="alternative"  face="round" name="close" /> 
                            {{language.pages.tip.domainNotVerified}}
                        </div>
                        <span class="verifyBtn" @click="checkDomain"> {{language.pages.tip.check}}</span>
                    </p>
                </div>
            </div>
            <ae-input label="More info" class="my-2">
                <textarea class="ae-input textarea" slot-scope="{ context }" @focus="context.focus = true" @blur="context.focus = false" />
            </ae-input>
            <h3> {{language.pages.tip.sendHeading}}</h3>
            <h4>Select amount</h4>
            <div class="flex flex-justify-between tipWebisteAmount">  
                <ae-badge :class="selectedTip == index ? 'primary' : ''" @click.native="selectTip(index)" v-for="(tip,index) in tips" :key="index">{{tip == 0 ? 'other' : `${tip} ${tokenSymbol}`}} </ae-badge>
            </div>
            <div class="range-slider" :class="!showSlider ? 'hideSlider' : '' ">
                <div class="sliderOver"></div>
                <span class="tipMin tipAmount">1 {{tokenSymbol}}</span>
                <span class="tipMax tipAmount">100 {{tokenSymbol}}</span>
                <input class="range-slider__range" type="range"  min="1" max="100" step="1"  v-model="finalAmount" @input="setTip" ref="tipSlider">
            </div>
            <h4>Amount to tip</h4>
            <ae-input label="Tip amount" placeholder="0.0" aemount v-model="finalAmount" disabled="true" class="finalAmount">
                <ae-text slot="header" fill="black">{{tokenSymbol}}</ae-text>
                <ae-toolbar slot="footer" class="flex-justify-between">
                   <div>
                       Transaction fee
                    </div>
                    <div>
                        {{txFee}} AE
                    </div>
                </ae-toolbar>
            </ae-input>
            <div class="flex flex-justify-between balanceInfo">
                <div>
                    Balance
                </div>
                <div class="balance no-sign">
                    {{tokenBalance}} {{tokenSymbol}}
                </div>
            </div>
            <ae-button face="round" fill="alternative" extend class="sendTip" @click="sendTip">Send tip</ae-button>
        </div>
        <popup :popupSecondBtnClick="popup.secondBtnClick"></popup>
    </div>
</template>

<script>
import { mapGetters } from 'vuex';
import locales from '../../locales/locales.json';
import { extractHostName } from '../../utils/helper';
import { MAGNITUDE, MIN_SPEND_TX_FEE, MIN_SPEND_TX_FEE_MICRO } from '../../utils/constants';
import BigNumber from 'bignumber.js';

export default {
    data() {
        return {
            language: locales['en'],
            domain:'',
            favicon:undefined,
            loadFavicon:true,
            domainVerified:false,
            tips: [1,5,10,0],
            selectedTip:0,
            tipAmount:0,
            finalAmount:1,
            showSlider:false,
            txFee:MIN_SPEND_TX_FEE
        }
    },
    locales,
    computed: {
        ...mapGetters(['balance','account','tokenSymbol','tokenBalance','popup']),
        maxValue() {
            let calculatedMaxValue = this.balance - MIN_SPEND_TX_FEE
            return calculatedMaxValue > 0 ? calculatedMaxValue.toString() : 0;
        }
    },
    watch:{
        finalAmount() {
           setTimeout(() => {
                let elem = this.$refs["tipSlider"];
                this.setSliderBackground(elem);
            },10);
        }
    },
    created() {
        chrome.tabs.query({active:true,currentWindow:true},(tabs) => {
            var currentTabUrl = tabs[0].url;
            this.favicon = tabs[0].favIconUrl;
            this.domain = extractHostName(currentTabUrl);
            setTimeout(() => {
                this.loadFavicon = false;
            },1500)
            
        });
    },
    mounted() {
        let elem = this.$refs["tipSlider"];
        this.setSliderBackground(elem);
    },  
    methods: {
        navigateUtilities() {
            this.$router.push('/utilities')
        },
        checkDomain() {
            this.domainVerified = true;
        },
        selectTip(index) {
            this.selectedTip = index;
            if(this.tips[index] == 0) {
                this.showSlider = true;
            }else {
                this.finalAmount = this.tips[index];
                this.showSlider = false;
            }
            setTimeout(() => {
                let elem = this.$refs["tipSlider"];
                this.setSliderBackground(elem);
            },10);
        },
        sendTip() {
            let amount = this.finalAmount;
            
            if (this.maxValue - amount <= 0 || isNaN (amount) || amount <= 0) {
                this.$store.dispatch('popupAlert', { name: 'spend', type: 'insufficient_balance'});
                return;
            } 
            amount = BigNumber(amount).shiftedBy(MAGNITUDE);
            
        },
        setTip(e) {
            this.finalAmount = e.target.value;
            let slider = e.target;
            this.setSliderBackground(slider);
        },
        setSliderBackground(slider) {
            const percentage = 100*(slider.value-slider.min)/(slider.max-slider.min);
            const bg = `linear-gradient(90deg, #FF0D6A ${percentage}%, #d7dcdf ${percentage+0.1}%)`;
            slider.style.background = bg;
        }
    }
}
</script>

<style lang="scss" scoped>
@import '../../../common/base';

.actions{
    width:50%;
    margin-top: 5px;
}

.tipWebsiteHeader  {
    margin-top:15px;
}
.tipWebsiteHeader .loader {
    
}
.domainFavicon {
    width:32px;
    margin-right:15px;
}
.noFavicon {
    font-size:0.8rem;
    height:32px;
    word-break: break-word;
}
.domainInfo {
    flex-grow:1;
    h3{
        font-size:1.5rem;
        margin:0;
    }
    p {
        margin:0;
        font-weight:normal;
    }
    .ae-icon {
        color: #fff !important;
        width: 14px !important;
        height: 14px !important;
        font-size: 0.8rem;
    }
    .verifyRow {
        display:inline-block;
        font-size:1rem;
    }
    .verified {
        color:$color-alternative;
    }
    .notVerified {
        color:$primary-color;
        .ae-icon{
            background:$primary-color !important;
        }
    }
    .verifyBtn {
        color:$color-alternative;
        float:right;
        font-size:1rem;
        cursor: pointer;
    }
}
.textarea {
    min-height: 60px;
}
.tipWebisteAmount {
    margin-bottom:25px;
    .ae-badge {
        border-radius:20px;
        width:20%;
        justify-content:center;
        cursor: pointer;
        background:#e4e4e4;
    }
    .ae-badge.primary {
        background:$primary-color;
        color:#fff;
    }
}
.sendTip { 
    margin-top:25px;
}
.tipSlider {
    margin:25px 0;
}
.hideSlider {
    opacity: 0.3;
}
.hideSlider .sliderOver {
    position:absolute;
    z-index:50;
    left:0;
    right:0;
    bottom:0;
    top:0;
}


.balanceInfo {
    margin-top:15px;
    .balance {
        font-weight:bold;
    }
}

</style>
