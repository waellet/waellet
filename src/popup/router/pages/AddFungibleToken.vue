<template>
  <div>
    <div class="popup">
      <div class="actions">
        <button class="backbutton toAccount" @click="navigateFungibleTokens"><ae-icon name="back" /> {{ $t('pages.addFungibleToken.backToFungibleTokens') }}</button>
      </div>

      <h3>{{ $t('pages.addFungibleToken.heading') }}</h3>
      <div v-if="addStep == false" class="token-add-form">
        <ae-panel>
          <div class="tabs">
            <span :class="activeTab == 'custom' ? 'tab-active' : ''" @click="selectActiveTab('custom')">{{ $t('pages.addFungibleToken.customToken') }}</span>
          </div>
          <!-- <h4>{{$t('pages.addFungibleToken.addToken') }}</h4> -->
          <!-- <hr> -->
          <div class="input-container" v-if="activeTab == 'search'">
            <ae-input :label="$t('pages.addFungibleToken.tokenSearchLabel')">
              <input
                type="text"
                class="ae-input token-contract"
                @keyup="searchTokenName"
                v-model="token.search"
                slot-scope="{ context }"
                @focus="context.focus = true"
                @blur="context.focus = false"
              />
            </ae-input>
          </div>
          <ae-list v-if="token.results.length && activeTab == 'search'">
            <ae-list-item fill="neutral" v-for="(result, key) in token.results" @click="selectToken(result)" :key="key">
              <ae-identicon :address="result[0]" />
              {{ result[1].name }} <strong> ({{ result[1].symbol }}) </strong>
            </ae-list-item>
          </ae-list>
          <div class="input-container" v-if="activeTab == 'custom'">
            <ae-input :label="$t('pages.addFungibleToken.tokenContractLabel')">
              <input
                type="text"
                class="ae-input token-contract"
                :disabled="token.precisionDisabled"
                @mouseout="validate('contract')"
                @keyup="validate('contract')"
                v-model="token.contract"
                slot-scope="{ context }"
                @focus="context.focus = true"
                @blur="context.focus = false"
              />
              <!-- <ae-toolbar slot="footer">
                                {{$t('pages.addFungibleToken.validContractAddressError') }}
                            </ae-toolbar> -->
            </ae-input>
          </div>
          <div class="input-container" v-if="token.symbol && activeTab == 'custom'">
            <ae-input :label="$t('pages.addFungibleToken.tokenSymbolLabel')">
              <input
                type="text"
                :disabled="token.precisionDisabled"
                class="ae-input token-symbol"
                @mouseout="validate('symbol')"
                @keyup.native="validate('symbol')"
                v-model="token.symbol"
                slot-scope="{ context }"
                @focus="context.focus = true"
                @blur="context.focus = false"
              />
              <!-- <ae-toolbar slot="footer">
                                {{$t('pages.addFungibleToken.symbolBetween1and12') }}
                            </ae-toolbar> -->
            </ae-input>
          </div>
          <div class="input-container" v-if="token.precision && token.symbol && activeTab == 'custom'">
            <ae-input :label="$t('pages.addFungibleToken.tokenPrecision')">
              <input
                type="text"
                :disabled="token.precisionDisabled"
                class="ae-input token-precision"
                @mouseout="validate('precision')"
                @keyup.native="validate('precision')"
                v-model="token.precision"
                slot-scope="{ context }"
                @focus="context.focus = true"
                @blur="context.focus = false"
              />
              <!-- <ae-toolbar slot="footer" >
                                {{$t('pages.addFungibleToken.numberBetween0and36') }}
                            </ae-toolbar> -->
            </ae-input>
          </div>
          <ae-button v-if="activeTab == 'custom'" face="round" fill="primary" @click="next" id="to-confirm-add" class="to-confirm-add" extend>{{
            $t('pages.addFungibleToken.next')
          }}</ae-button>
        </ae-panel>
      </div>
      <div v-if="addStep">
        <ae-panel>
          <h4>{{ $t('pages.addFungibleToken.addToken') }}</h4>
          <hr />
          <div class="flex  flex-justify-between token-add-holder">
            <div>
              <div class="token-title">{{ $t('pages.addFungibleToken.token') }}</div>
              <div class="flex ">
                <ae-identicon :address="token.contract" />
                <div class="balanceBig balance no-sign">{{ token.symbol }}</div>
              </div>
            </div>
            <div>
              <div class="token-title">{{ $t('pages.addFungibleToken.balance') }}</div>
              <div class="balanceBig balance no-sign">{{ tokenBalance }} {{ token.symbol }}</div>
            </div>
          </div>
          <ae-check class="tokenRegistry" v-model="tokenRegistryFee" v-if="!presentInRegistry">
            {{ $t('pages.createFungibleToken.registryFee') }}
          </ae-check>
          <ae-button face="round" fill="primary" @click="addCustomToken" class="add-token" extend>{{ $t('pages.addFungibleToken.addToken') }}</ae-button>
        </ae-panel>
      </div>
    </div>
    <popup :popupSecondBtnClick="popup.secondBtnClick"></popup>
    <Loader size="big" :loading="loading" type="transparent"></Loader>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import { uniqWith, isEqual } from 'lodash-es';
import { FUNGIBLE_TOKEN_CONTRACT, TOKEN_REGISTRY_CONTRACT, TOKEN_REGISTRY_CONTRACT_LIMA } from '../../utils/constants';
import { addRejectedToken, checkContractAbiVersion, parseForStorage } from '../../utils/helper';

export default {
  data() {
    return {
      activeTab: 'custom',
      token: {
        contract: '',
        symbol: '',
        precision: 1,
        precisionDisabled: false,
        balance: 0,
        name: '',
        search: '',
        results: [],
      },
      error: {
        type: null,
        msg: null,
      },
      addStep: false,
      addStepNumber: 1,
      loading: false,
      timer: '',
      tokenRegistryFee: false,
      presentInRegistry: true,
    };
  },
  computed: {
    ...mapGetters(['sdk', 'account', 'tokens', 'popup', 'tokenRegistry', 'tokenRegistryLima', 'network', 'current']),
    tokenBalance() {
      return (this.token.balance / ( 10 ** this.token.precision) ).toFixed(3);
    },
  },
  async created() { },
  methods: {
    switchTabs(tab) {
      this.activeTab = tab;
    },
    tabAcitveClass(tab) {
      return this.activeTab == tab ? 'tab-active' : '';
    },
    navigateAccount() {
      this.$router.push('/account');
    },
    navigateFungibleTokens() {
      this.$router.push('/fungible-tokens');
    },
    validate(type) {
      if (this.timer) {
        clearTimeout(this.timer);
        this.timer = null;
      }
      this.timer = setTimeout(() => {
        if (type == 'contract') {
          // this.token.precisionDisabled = false
          if (this.token.contract.length == 53 || this.token.contract.length == 54 || this.token.contract.length == 52) {
            // this.searchTokenMetaInfo(this.token.contract)
          }
        }
      }, 3000);
    },
    checkAdded(contract) {
      return typeof this.tokens.find(tkn => tkn.contract == contract && tkn.parent == this.account.publicKey) !== 'undefined';
    },
    selectActiveTab(tab) {
      this.activeTab = tab;
      if (tab == 'search') {
        this.addStepNumber = 2;
      } else {
        this.addStepNumber = 1;
      }
    },
    async next() {
      if (this.addStepNumber == 1) {
        const find = await this.searchTokenMetaInfo(this.token.contract);
        return;
      }
      const added = this.checkAdded(this.token.contract);
      if (
        (this.token.contract.length != 53 && this.token.contract.length != 54 && this.token.contract.length != 52) ||
        (this.token.symbol.length < 1 || this.token.symbol.length > 12) ||
        isNaN(this.token.precision) ||
        (!isNaN(this.token.precision) && (this.token.precision < 1 || this.token.precision > 36))
      ) {
        this.$store.dispatch('popupAlert', { name: 'account', type: 'token_add' });
      } else if (added) {
        this.$store.dispatch('popupAlert', { name: 'account', type: 'token_exists' });
      } else {
        this.loading = true;
        const contractInstance = await this.$helpers.getContractInstance(FUNGIBLE_TOKEN_CONTRACT, { contractAddress: this.token.contract });
        const call = await this.$helpers.contractCall({ instance: contractInstance, method: 'balance', params: [this.account.publicKey] });

        const balance = await call.decode();
        this.loading = false;
        this.token.balance = balance == 'None' ? 0 : balance.Some[0];
        this.addStep = true;
        this.addStepNumber = 1;
        this.checkIfTokenPresentInRegistry();
      }
    },
    async checkIfTokenPresentInRegistry() {
      try {
        const find = (await this.$helpers.contractCall({ instance: this.tokenRegistry, method: 'get_all_tokens' })).decodedResult.find(t => t[0] === this.token.contract);
        const findLima = (await this.$helpers.contractCall({ instance: this.tokenRegistryLima, method: 'get_all_tokens' })).decodedResult.find(t => t[0] === this.token.contract);
        if (!find && !findLima) {
          this.presentInRegistry = false;
        }
        return find || findLima;
      } catch (e) {
        return false;
      }
    },
    async addCustomToken() {
      const tokens = this.tokens.map(tkn => tkn);
      tokens.push({
        contract: this.token.contract,
        name: this.token.name,
        symbol: this.token.symbol,
        precision: this.token.precision,
        balance: this.token.balance,
        parent: this.account.publicKey,
      });
      this.$store.dispatch('setTokens', tokens).then(async () => {
        this.loading = true;
        await browser.storage.local.set({ tokens: parseForStorage(tokens) });
        this.$store
          .dispatch('popupAlert', {
            name: 'account',
            type: 'added_success',
          })
          .then(() => {
            this.loading = false;
            this.token.contract = '';
            this.token.symbol = '';
            this.token.precision = 0;
            this.token.precisionDisabled = false;
            this.addStep = false;
          });
      });
    },
    async searchTokenMetaInfo(address) {
      this.loading = true;

      return new Promise(async (resolve, reject) => {
        try {
          const contractInstance = await this.$helpers.getContractInstance(FUNGIBLE_TOKEN_CONTRACT, { contractAddress: address });
          this.$helpers
            .contractCall({ instance: contractInstance, method: 'meta_info', async: false })
            .then(res => {
              res
                .decode()
                .then(data => {
                  if (typeof data.decimals !== 'undefined' && typeof data.symbol !== 'undefined') {
                    this.token.precision = data.decimals;
                    this.token.symbol = data.symbol;
                    this.token.name = data.name;
                    // this.addToken = true
                    this.token.precisionDisabled = true;
                    this.addStepNumber = 2;
                  }
                  this.loading = false;
                  resolve(true);
                })
                .catch(e => {
                  this.$store.dispatch('popupAlert', { name: 'account', type: 'token_invalid_address' });
                  this.loading = false;
                  resolve(false);
                });
            })
            .catch(e => {
              this.$store.dispatch('popupAlert', { name: 'account', type: 'token_invalid_address' });
              this.loading = false;
              resolve(false);
            });
        } catch (e) {
          this.$store.dispatch('popupAlert', { name: 'account', type: 'token_invalid_address' });
          this.loading = false;
          resolve(false);
        }
      });
    },
    async searchTokenName() {
      if (this.token.search == '') {
        this.token.results = [];
        return;
      }
      const keyword = this.token.search.toLowerCase();
      const result = (await this.$helpers.contractCall({ instance: this.tokenRegistry, method: 'get_all_tokens' })).decodedResult;
      const resultLima = (await this.$helpers.contractCall({ instance: this.tokenRegistryLima, method: 'get_all_tokens' })).decodedResult;

      const final = uniqWith(result.concat(resultLima), isEqual);
      this.token.results = final.filter(
        t => t[1].name.toLowerCase().includes(keyword) || t[1].name.toLowerCase().startsWith(keyword) || t[1].symbol.toLowerCase().startsWith(keyword) || t[0] == keyword
      );
    },
    resetToken() {
      this.token.precision = 1;
      this.token.symbol = '';
      this.token.name = '';
      this.token.contract = '';
    },
    async selectToken(token) {
      console.log(token);
      this.token.precision = token[1].decimals;
      this.token.symbol = token[1].symbol;
      this.token.name = token[1].name;
      this.token.contract = token[0];
      await this.next();
      if (!this.addStep) {
        this.resetToken();
      }
    },
  },
};
</script>

<style lang="scss" scoped>
@import '../../../common/variables';

.tabs {
  margin-top: 1rem;
}
.tabs span {
  width: 100%;
}
.token-title {
  font-size: 1.1rem;
  text-align: left;
  margin-bottom: 1rem;
}
.token-add-holder {
  margin-bottom: 2rem;
}
.token-add-holder > div:first-child {
  width: 60%;
}
.token-add-holder > div:last-child {
  width: 40%;
}
.token-add-holder > div div {
  text-align: left;
  color: $color-secondary;
}
.token-add-holder .ae-identicon {
  height: 3rem !important;
  margin-right: 1rem;
}
.to-confirm-add {
  margin-top: 1rem;
}
.ae-identicon {
  margin-right: 1rem;
}
.ae-list-item:hover {
  background: #fefefe;
}
</style>
