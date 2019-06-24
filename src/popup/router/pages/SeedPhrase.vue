<template>
    <div>
        <main>
            <div class="popup" v-if="!loading">
                <div v-if="step == 1" >
                    <h3 class="phraseTitle">Check the spelling of each word and never create a screenshot or photo of this phrase!</h3> 
                </div>
                <div v-if="step == 2">
                    <h3  class="phraseTitle">Carefully keep this phrase safe! Write these 12 words down and keep them in safe place. You need them to recover your account in the future. </h3>
                    <ae-phraser>
                        <ae-badge v-for="seed in seeds" >{{seed.name}}</ae-badge>
                    </ae-phraser>
                    <progress class="seedProgress" :value="progress" max="100"></progress>
                </div>
                <div v-if="step == 3">
                    <h3  class="phraseTitle">Confirm your phrase. Tap the words below to compose your phrase, note correct order! </h3>
                    <ae-phraser>
                        <ae-badge class="seedBadge" :class="{'selected':seed.selected}" v-for="(seed,index) in shiffledSeed" @click.native="selectSeed(seed.name,index,seed.id)">{{seed.name}}</ae-badge>
                    </ae-phraser>
                    <div class="phraseSubTitle">Your recovery phrase</div>
                    <ae-phraser v-if="selectedSeed.length == 0">
                        <ae-badge class="seedBadge selected">first</ae-badge>
                        <ae-badge class="seedBadge selected">second</ae-badge>
                        <ae-badge class="seedBadge selected">third</ae-badge>
                        <ae-badge class="seedBadge selected">...</ae-badge>
                    </ae-phraser>
                    <ae-phraser v-bind="seedError" class="mb-5">
                        <ae-badge class="seedBadge" v-for="(seed,index) in selectedSeed" @click.native="removeSeed(seed.parent,index)">{{seed.name}} <ae-icon name="close" class="seedClose" /></ae-badge>
                    </ae-phraser>
                </div>
                <ae-button extend face="round" :fill="buttonFill" class="mt-3 nextStep" @click="nextSeedStep(step)">{{buttonTitle}}</ae-button>
                
            </div>
            <Loader :loading="loading" v-bind="{'content':language.strings.securingAccount}"></Loader>
        </main>
    </div>
</template>

<script>
import locales from '../../locales/locales.json';

import {shuffleArray} from '../../utils/helper';
import { generateMnemonic, mnemonicToSeed, validateMnemonic } from '@aeternity/bip39';
import { addressGenerator } from '../../utils/address-generator';

export default {
    data() {
        return {
            step:1,
            buttonTitle:'SHOW SEED PHRASE',
            buttonFill:'primary',
            seeds: [
                {id:0,name:"volcano",selected:false},
                {id:1,name:"entire",selected:false},
                {id:2,name:"magnet",selected:false},
                {id:3,name:"glow",selected:false},
                {id:4,name:"zero",selected:false},
                {id:5,name:"crack",selected:false},
                {id:6,name:"arena",selected:false},
                {id:7,name:"episode",selected:false},
                {id:8,name:"shrimp",selected:false},
                {id:9,name:"buffalo",selected:false},
                {id:10,name:"tiny",selected:false},
                {id:11,name:"aunt",selected:false}
            ],
            selectedSeed:[],
            seedError:{},
            progress:0,
            loading:false,
            language: locales['en']
        };
    },
    mounted() {
        this.generateSeeds();
        chrome.storage.sync.set({confirmSeed: false}, () => {});
    },
    computed: {
        shiffledSeed() {
            return shuffleArray(this.seeds);
        }
    },
    locales,
    methods: { 
        generateSeeds() {
            let mnemonic;
            chrome.storage.sync.get('mnemonic', data => {
                if(data.hasOwnProperty("mnemonic") && data.mnemonic != "" ) {
                    mnemonic = data.mnemonic;
                }else {
                    mnemonic = generateMnemonic();
                    chrome.storage.sync.set({mnemonic: mnemonic}, () => {});
                }
                mnemonic = mnemonic.split(" ");
                this.seeds.forEach(function(item, index) {
                    item.name = mnemonic[index]
                });
            });
        },
        nextSeedStep:async function nextSeedStep (step) {

            step += 1;
            if(step <= 3) {
                if(step == 2) {
                    this.buttonTitle = "next";
                    let context = this;
                    let progressChange = setInterval(() => {
                        context.progress+=0.1;
                        if(context.progress >= 100){
                            clearInterval(progressChange);
                        }
                    },8);
                }else if(step == 3) {
                    if(this.progress >= 100) {
                        this.buttonTitle = "Confirm";
                        this.buttonFill = "";
                    }else {
                        this.$store.dispatch('popupAlert', {name:'account',type:'seedFastCopy'});
                        return;
                    }
                }
                this.step = step;
            }else if(step == 4) {
                let seed = this.seeds.slice();
                let sorted = seed.sort((a, b) => (a.id > b.id) ? 1 : -1);
                let originalSeed = sorted.map(seed => seed.name).join(",");
                const selectSeed = this.selectedSeed.map(seed => seed.name).join(",");
                
                if(this.selectedSeed.length == 12) {
                    if(originalSeed != selectSeed) {
                        this.seedError = {"error":"Oops! Not the correct order, try again"}
                    }else {
                        this.seedError = {};
                        this.loading = true;
                        chrome.storage.sync.set({isLogged: true}, async () => {
                            chrome.storage.sync.get('accountPassword',async pass => {
                                if(pass.hasOwnProperty('accountPassword') && pass.accountPassword != "") {
                                    originalSeed = originalSeed.replace(/,/g, ' ');
                                    let privateKey = mnemonicToSeed(originalSeed);
                                    const keyPair = await addressGenerator.generateKeyPair(pass.accountPassword,privateKey.toString('hex'), privateKey);
                                    chrome.storage.sync.set({userAccount: keyPair}, () => {
                                        this.loading = false;
                                        chrome.storage.sync.set({accountPassword: ''}, () => {});
                                        chrome.storage.sync.set({mnemonic: ''}, () => {});
                                        chrome.storage.sync.set({confirmSeed: true}, () => {});
                                        this.$store.commit('UPDATE_ACCOUNT', keyPair);
                                        this.$store.commit('SWITCH_LOGGED_IN', true);
                                        this.$router.push('/account');
                                    });
                                }
                            });
                        });
                    }
                }
            }
        },
        selectSeed(seed,index,id) {
            if(!this.selectedSeed.find(s => {return s.parent == id })) {
                this.selectedSeed.push({name:seed,parent:id});
                this.seeds.find(s => s.id == id).selected = true;
            }
            if(this.selectedSeed.length == 12) {
                this.buttonFill = "primary";
            }else {
                this.buttonFill = "";
            }
        },
        removeSeed(parent,index) {
            this.seeds.find(s => s.id == parent).selected = false;
            // this.seeds[parent].selected = false;
            this.selectedSeed.splice(index,1);
            if(this.selectedSeed.length == 12) {
                this.buttonFill = "primary";
            }else {
                this.buttonFill = "";
            }
            this.seedError = {};
        }
    }
}
</script>

<style lang="scss" scoped>
@import '../../../common/base';
.mt-3 { margin-top:3rem;}
.seedBadge { 
    user-select: unset;
    cursor:pointer;
    border: 2px solid #EDF3F7;
    .seedClose {
        margin-left:5px;
    }
    &.selected { 
        opacity:0.4;
        cursor: unset;
        background: transparent;
        border: 2px solid #c1c1c1;
    }
}
.phraseSubTitle { 
    border-left:2px solid transparent;
    margin:1.5rem 0 0.5rem 0;
    padding-left:1rem;
    color:#929ca6;
}
.phraseTitle { padding-left:1rem; font-size:1.5rem; font-weight:500; word-break:break-word; }
.seedProgress {
    background:#fff;
    width: 100%;
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    height: 7px;
}
.seedProgress::-webkit-progress-bar {
  background:transparent;
  border:none;
}
.seedProgress::-webkit-progress-value {
  background:$primary-color;
}
.nextStep {
    position:fixed !important;
    bottom:5%;
    left:50%;
    transform:translateX(-50%) !important;
    -ms-transform:translatex(-50%) !important;
    -webkit-transform:translate(-50%) !important;
    width:80% !important;
}
.extensionVersion {
    position: fixed;
    bottom: -6px;
    left: 50%;
    transform: translateX(-50%);
    -ms-transform:translateX(-50%0);
    -webkit-transform:translateX(-50%);
}
</style>