/* eslint-disable prettier/prettier */
import BigNumber from 'bignumber.js';
import { TxBuilder } from '@aeternity/aepp-sdk/es';
import { OBJECT_ID_TX_TYPE, TX_TYPE, VM_VERSIONS, ABI_VERSIONS } from '@aeternity/aepp-sdk/es/tx/builder/schema';

export const MAGNITUDE = 18;
export const MAGNITUDE_EXA = 18;
export const MAGNITUDE_GIGA = 9;
export const MAGNITUDE_MICRO = -6;
export const MAGNITUDE_PICO = -12;
export const MINPASSWORDLENGTH = 8;
export const TX_TYPES = {
  'txSign':TX_TYPE.spend,
  'contractCall':TX_TYPE.contractCall,
  'contractCreate':TX_TYPE.contractCreate,
  'namePreClaim': TX_TYPE.namePreClaim,
  'nameClaim': TX_TYPE.nameClaim,
  'nameBid': TX_TYPE.nameClaim,
  'nameUpdate': TX_TYPE.nameUpdate
}

const STUB_ADDRESS = 'ak_enAPooFqpTQKkhJmU47J16QZu9HbPQQPwWBVeGnzDbDnv9dxp';
const STUB_CALLDATA = 'cb_AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACDJfUrsdAtW6IZtMvhp0+eVDUiQivrquyBwXrl/ujPLcgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAMAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAJQQwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACUEMAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAJvjRF'
export const MAX_UINT256 = BigNumber(2).exponentiatedBy(256).minus(1);
const MIN_SPEND_TX_FEE_STRING = TxBuilder.calculateMinFee(
    'spendTx', {
    params: {
      senderId: STUB_ADDRESS,
      recipientId: STUB_ADDRESS,
      amount: MAX_UINT256,
      ttl: MAX_UINT256,
      nonce: MAX_UINT256,
    },
  }
);

export const calculateFee = (type,params) => {
  let MIN_FEE = TxBuilder.calculateMinFee(type, {
    params: {
      senderId: STUB_ADDRESS,
      recipientId: STUB_ADDRESS,
      amount: MAX_UINT256,
      ttl: MAX_UINT256,
      nonce: MAX_UINT256,
      ctVersion:{abiVersion:ABI_VERSIONS.SOPHIA,vmVersion:VM_VERSIONS.SOPHIA},
      abiVersion:ABI_VERSIONS.SOPHIA,
      callData: STUB_CALLDATA,
      ...params
    }
  })
  let min = BigNumber(MIN_FEE).shiftedBy(-MAGNITUDE)
  let max = min.multipliedBy(10);
  return {
    min,
    max
  }
}

export const MIN_SPEND_TX_FEE = BigNumber(MIN_SPEND_TX_FEE_STRING).shiftedBy(-MAGNITUDE);
export const MAX_REASONABLE_FEE = MIN_SPEND_TX_FEE.multipliedBy(10);

const toMicro = value => value.shiftedBy(-MAGNITUDE_MICRO).toFixed();

export const MIN_SPEND_TX_FEE_MICRO = toMicro(MIN_SPEND_TX_FEE);
export const MAX_REASONABLE_FEE_MICRO = toMicro(MAX_REASONABLE_FEE);

export const networks = {
  Testnet: {
    url: 'https://sdk-testnet.aepps.com',
    internalUrl: 'https://sdk-testnet.aepps.com',
    networkId: 'ae_uat',
    middlewareUrl: 'https://testnet.aeternal.io',
    explorerUrl: 'https://testnet.explorer.aepps.com',
    compilerUrl: 'https://latest.compiler.aepps.com',
    tokenRegistry: 'ct_Dnwribmd21YrxSQnqXCB5vTFPrgYJx2eg2TrbLvbdyEbTMejw'
  },
  Mainnet: {
    url: 'https://sdk-mainnet.aepps.com',
    internalUrl: 'https://sdk-mainnet.aepps.com',
    networkId: 'ae_mainnet',
    middlewareUrl: 'http://mdw.aepps.com/',
    explorerUrl: 'https://testnet.explorer.aepps.com',
    compilerUrl: 'https://compiler.aepps.com',
    tokenRegistry: 'ct_UAzV9RcXEMsFcUCmrPN4iphbZroM7EHk3wvdidDYgZGGBo3hV'
  }
}

export const TX_LIMIT_PER_DAY = 2000


export const TOKEN_REGISTRY_CONTRACT = 
`contract Token =
  record meta_info =
    { name : string
    , symbol : string
    , decimals : int }
    
  entrypoint meta_info : () => meta_info
  entrypoint total_supply : () => int
  entrypoint owner : () => address
  entrypoint balances : () => map(address, int)
  entrypoint balance : (address) => option(int)
  entrypoint transfer : (address, int) => ()

contract TokenRegistry =
  record state = { tokens: map(Token, Token.meta_info) }

  stateful entrypoint init() = { tokens = {} }

  stateful entrypoint add_token(token : Token) : () =
    put(state{ tokens[token] = token.meta_info() })

  entrypoint get_all_tokens() : map(Token, Token.meta_info) = state.tokens

  entrypoint get_token_meta_info(token : Token) : Token.meta_info = token.meta_info()
  entrypoint get_token_balances(token : Token) : map(address, int) = token.balances()
  entrypoint get_token_balance(token : Token, account: address) : option(int) = token.balance(account)
  entrypoint get_token_owner(token : Token) : address = token.owner()
  entrypoint get_token_total_supply(token : Token) : int = token.total_supply()`


export const TOKEN_REGISTRY_CONTRACT_LIMA = 
`contract Token =
  record meta_info =
    { name : string
    , symbol : string
    , decimals : int }
    
  entrypoint meta_info : () => meta_info
  entrypoint total_supply : () => int
  entrypoint owner : () => address
  entrypoint balances : () => map(address, int)
  entrypoint balance : (address) => option(int)
  entrypoint transfer : (address, int) => unit

contract TokenRegistry =
  type state = map(Token, Token.meta_info)

  stateful entrypoint init() : state = {}

  stateful entrypoint add_token(token : Token) : unit =
    put(state{ [token] = token.meta_info() })

  entrypoint get_all_tokens() : map(Token, Token.meta_info) = state

  entrypoint get_token_meta_info(token : Token) : Token.meta_info = token.meta_info()
  entrypoint get_token_balances(token : Token) : map(address, int) = token.balances()
  entrypoint get_token_balance(token : Token, account: address) : option(int) = token.balance(account)
  entrypoint get_token_owner(token : Token) : address = token.owner()
  entrypoint get_token_total_supply(token : Token) : int = token.total_supply()`


export const FUNGIBLE_TOKEN_CONTRACT = 
`contract FungibleToken =
  
  record state =
    { owner        : address      // the smart contract's owner address
    , total_supply : int          // total token supply
    , balances     : balances     // balances for each account
    , allowances   : allowances   // owner of account approves the transfer of an amount to another account
    , meta_info    : meta_info }  // token meta info (name, symbol, decimals)

  record allowance_accounts = { from_account : address, for_account : address }

  record meta_info =
    { name     : string
    , symbol   : string
    , decimals : int }

  type allowances = map(allowance_accounts, int)

  type balances = map(address, int)

  datatype event =
    Transfer(indexed address, indexed address, indexed int)
    | Allowance(indexed address, indexed address, indexed int)
    | Burn(indexed address, indexed int)
    | Mint(indexed address, indexed int)

  entrypoint init(name: string, decimals : int, symbol : string) =
    require(String.length(name) >= 1, "STRING_TOO_SHORT_NAME")
    require(String.length(symbol) >= 1, "STRING_TOO_SHORT_SYMBOL")
    require_non_negative_value(decimals)
    { owner        = Call.caller,
      total_supply = 0,
      balances     = {},
      allowances   = {},
      meta_info    = { name = name, symbol = symbol, decimals = decimals } }

  // Get the token meta info
  entrypoint meta_info() : meta_info =
    state.meta_info

  // Get the token total supply
  entrypoint total_supply() : int =
    state.total_supply

  // Get the token owner address
  entrypoint owner() : address =
    state.owner

  // Get the balances state
  entrypoint balances() : balances =
    state.balances

  // Get the allowances state
  entrypoint allowances() : allowances =
    state.allowances

  entrypoint balance(owner: address) : option(int) =
    Map.lookup(owner, state.balances)

  entrypoint allowance(allowance_accounts : allowance_accounts) : option(int) =
    Map.lookup(allowance_accounts, state.allowances)

  entrypoint allowance_for_caller(from_account: address) : option(int) =
    allowance({ from_account = from_account, for_account = Call.caller })

  stateful entrypoint transfer(to_account: address, value: int) =
    internal_transfer(Call.caller, to_account, value)

  stateful entrypoint transfer_allowance(from_account: address, to_account: address, value: int) =
    let allowance_accounts = { from_account = from_account, for_account = Call.caller }
    internal_change_allowance(allowance_accounts, -value)
    internal_transfer(from_account, to_account, value)

  stateful entrypoint create_allowance(for_account: address, value: int) =
    require_non_negative_value(value)
    let allowance_accounts = { from_account =  Call.caller, for_account = for_account }
    require_allowance_not_existent(allowance_accounts)
    put(state{ allowances[allowance_accounts] = value })
    Chain.event(Allowance(Call.caller, for_account, value))

  stateful entrypoint change_allowance(for_account: address, value_change: int) =
    let allowance_accounts = { from_account =  Call.caller, for_account = for_account }
    internal_change_allowance(allowance_accounts, value_change)

  stateful entrypoint mint(account: address, value: int) =
    require_owner()
    require_non_negative_value(value)
    put(state{ total_supply = state.total_supply + value, balances[account = 0] @ b = b + value })
    Chain.event(Mint(account, value))

  stateful entrypoint burn(value: int) =
    require_balance(Call.caller, value)
    require_non_negative_value(value)
    put(state{ total_supply = state.total_supply - value, balances[Call.caller] @ b = b - value })
    Chain.event(Burn(Call.caller, value))

  // INTERNAL FUNCTIONS

  function require_owner() =
    require(Call.caller == state.owner, "ONLY_OWNER_CALL_ALLOWED")

  function require_allowance_not_existent(allowance_accounts : allowance_accounts) =
    switch(allowance(allowance_accounts))
      None => None
      Some(_) => abort("ALLOWANCE_ALREADY_EXISTENT")

  function require_non_negative_value(value : int) =
    require(value >= 0, "NON_NEGATIVE_VALUE_REQUIRED")

  function require_allowance(allowance_accounts : allowance_accounts, value : int) : int =
    switch(allowance(allowance_accounts))
      Some(allowance) =>
        require_non_negative_value(allowance + value)
        allowance
      None => abort("ALLOWANCE_NOT_EXISTENT")

  function require_balance(account : address, value : int) =
    switch(balance(account))
      Some(balance) =>
        require(balance >= value, "ACCOUNT_INSUFFICIENT_BALANCE")
      None => abort("BALANCE_ACCOUNT_NOT_EXISTENT")

  stateful function internal_transfer(from_account: address, to_account: address, value: int) =
    require_non_negative_value(value)
    require_balance(from_account, value)
    put(state{ balances[from_account] @ b = b - value })
    put(state{ balances[to_account = 0] @ b = b + value })
    Chain.event(Transfer(from_account, to_account, value))

  stateful function internal_change_allowance(allowance_accounts : allowance_accounts, value_change : int) =
    let allowance = require_allowance(allowance_accounts, value_change)
    let new_allowance = allowance + value_change
    require_non_negative_value(new_allowance)
    put(state{ allowances[allowance_accounts] = new_allowance })
    Chain.event(Allowance(allowance_accounts.from_account, allowance_accounts.for_account, new_allowance))`;