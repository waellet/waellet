<template>
    <div class="popup">
        <div class="actions">
            <button class="backbutton toAccount" @click="navigateAccount"><ae-icon name="back" /> {{language.buttons.backToAccount}}</button>
        </div>
        <div>
            <div class="tipWebsiteHeader flex flex-align-center ">
                <Loader class="loader" v-if="loadFavicon" :loading="loadFavicon" v-bind="{'content':''}"></Loader>
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
                <ae-badge :class="selectedTip == index ? 'primary' : ''" @click.native="selectTip(index)" v-for="(tip,index) in tips" :key="index">{{tip == 0 ? 'other' : tip + ' AE'}} </ae-badge>
                
            </div>
            <!-- <div class="sliderContainer">
                
                <input type="range" min="1" max="100" value="50" class="slider tipSlider">
            </div> -->
            <div class="range-slider" :class="!showSlider ? 'hideSlider' : '' ">
                <div class="sliderOver"></div>
                <span class="tipMin tipAmount">1 AE</span>
                <span class="tipMax tipAmount">100 AE</span>
                <input class="range-slider__range" type="range"  min="1" max="100" step="1"  v-model="finalAmount" @input="setTip" ref="tipSlider">
            </div>
            <h4>Amount to tip</h4>
            <ae-input label="Tip amount" placeholder="0.0" aemount v-model="finalAmount" disabled="true" class="finalAmount">
                <ae-text slot="header" fill="black">AE</ae-text>
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
                <div class="balance">
                    {{balance}}
                </div>
            </div>
            <ae-button face="round" fill="alternative" extend class="sendTip" @click="sendTip">Send tip</ae-button>
        </div>
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
        ...mapGetters(['balance','account']),
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
        navigateAccount() {
            this.$router.push('/account')
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
            // now we'll create a linear gradient that separates at the above point
            // Our background color will change here
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
.sliderContainer {
   
    .slider {
        -webkit-appearance: none;  
        appearance: none;
        width: 100%; 
        height: 5px;
        background: #d3d3d3; 
        outline: none; 
        // opacity: 0.7; 
        // -webkit-transition: .2s; 
        // transition: opacity .2s;
        border-radius: 10px;
    }

    .slider:hover {
        opacity: 1; 
    }
    .slider::-webkit-slider-thumb {
        -webkit-appearance: none;
        appearance: none;
        width: 20px; 
        height: 20px; 
        border-radius: 50%;
        background: $primary-color; 
        cursor: pointer; 
    }
    .slider::-moz-range-thumb {
        width: 20px; 
        height: 20px; 
        border-radius: 50%;
        background: $primary-color; 
        cursor: pointer; 
    }
}

$shade-10: #2c3e50 !default;
$shade-1: #d7dcdf !default;
$shade-0: #fff !default;
$teal: #1abc9c !default;

$range-handle-color: $shade-10 !default;
$range-handle-color-hover: $teal !default;
$range-handle-size: 20px !default;

$range-track-color: $shade-1 !default;
$range-track-height: 10px !default;

$range-label-color: $shade-10 !default;
$range-label-width: 60px !default;

.range-slider {
    width: 100%;
    position:relative;
    .tipAmount {
        position:absolute;
        color: #909090;
        font-size: 0.9rem;
    }
    .tipMin {
        left:0;
    }
    .tipMax {
        right:0;
    }
}

.range-slider__range {
  -webkit-appearance: none;
  width: 100%;
  height: $range-track-height;
  border-radius: 5px;
  background: $range-track-color;
  outline: none;
  padding: 0;
  margin: 25px 0;

  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: $range-handle-size;
    height: $range-handle-size;
    border-radius: 50%;
    background: $primary-color;
    cursor: pointer;
    transition: background .15s ease-in-out;
    // box-shadow: 0 0 0 3px $shade-0,
    //             0 0 0 6px $primary-color;
  }
  &:active::-webkit-slider-thumb {
    background: $primary-color;
  }
  &::-moz-range-thumb {
    width: $range-handle-size;
    height: $range-handle-size;
    border: 0;
    border-radius: 50%;
    background: $primary-color;
    cursor: pointer;
    transition: background .15s ease-in-out;
  }
  &:active::-moz-range-thumb {
    background: $primary-color;
  }
}

.range-slider__value {
  display: inline-block;
  position: relative;
  width: $range-label-width;
  color: $shade-0;
  line-height: 20px;
  text-align: center;
  border-radius: 3px;
  background: $range-label-color;
  padding: 5px 10px;
  margin-left: 8px;

  &:after {
    position: absolute;
    top: 8px;
    left: -7px;
    width: 0;
    height: 0;
    border-top: 7px solid transparent;
    border-right: 7px solid $range-label-color;
    border-bottom: 7px solid transparent;
    content: '';
  }
}

::-moz-range-track {
    background: $range-track-color;
    border: 0;
}

input::-moz-focus-inner,
input::-moz-focus-outer { 
  border: 0; 
}
.balanceInfo {
    margin-top:15px;
    .balance {
        font-weight:bold;
    }
}

</style>
