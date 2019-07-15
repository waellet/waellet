
const Aepp = {
    request: {
        sign({ recipientId, amount }){
            let error = {
                id: null,
                jsonrpc: "2.0",
                data:{
                    request: {
    
                    }
                },
                error: {}
            }
            if(recipientId == "" || recipientId.length != 53) {
                error.error = {
                    code:1,
                    message: "Enter correct public address"
                }
    
                return new Promise((resolve,reject) => {
                    resolve(error)
                });
            }
            if(amount <= 0) {
                error.error = {
                    code:1,
                    message: "Enter correct amount"
                }
    
                return new Promise((resolve,reject) => {
                    resolve(error)
                });
            }
            let req = {
                method:'aeppMessage',
                type:"txSign",
                tx: {
                    recipientId,
                    amount
                },
                hostname: window.location.host
            }
            window.postMessage(req, '*')
            return new Promise((resolve,reject) => {
                receiveResponse((res) => {
                    resolve(res)
                })
            })
            
        },
        connect() {
            let req = {
                method:'aeppMessage',
                type:"connectConfirm",
                params: {
                    hostname:window.location.host,
                    protocol:window.location.protocol,
                    title:document.title
                }
            }
            window.postMessage(req, '*')
            return new window.Promise((resolve,reject) => {
                receiveResponse((r) => {
                    resolve(r)
                })
            })
        },
        contractCallStatic({source,address, method, params = []}) {
            let req = {
                method: "aeppMessage",
                type:"contractCall",
                callType:"static",
                tx: {
                    source,
                    address,
                    method,
                    params
                },
                hostname:window.location.host
            }
            window.postMessage(req, '*')
            return new Promise((resolve, reject) => {
                receiveResponse((r) => {
                    resolve(r)
                })
            })
        }
    },
    get: {
        address() {
            let req = {
                method:'aeppMessage',
                type:"getAddress"
            }
            window.postMessage(req, '*')
            return new Promise((resolve,reject) => {
                receiveResponse((res) => {
                    resolve(res)
                })
            })
        }
    }
    
}

const receiveResponse = (cb) => {
    window.addEventListener("message", ({data}) => {
        if(data.method == "aeppMessage" && data.hasOwnProperty("resolve")) {
            cb(data)
        }
    });
}

window.cont = `
contract FungibleToken =

  type balances = map(address, int)

  record allowance_accounts = { from_account : address, for_account : address }

  type allowances = map(allowance_accounts, int)

  record meta_info =
    { name     : string
    , symbol   : string
    , decimals : int }

  record state =
    { owner        : address
    , total_supply : int
    , balances     : balances
    , allowances   : allowances
    , meta_info    : meta_info }

  datatype event =
    Transfer(indexed address, indexed address, indexed int)
    | Allowance(indexed address, indexed address, indexed int)
    | Burn(indexed address, indexed int)
    | Mint(indexed address, indexed int)

  public stateful function init(name: string, decimals : int, symbol : string) =
    require(String.length(name) >= 1, "STRING_TOO_SHORT_NAME")
    require(String.length(symbol) >= 1, "STRING_TOO_SHORT_SYMBOL")
    { owner        = Call.caller,
      total_supply = 0,
      balances     = {},
      allowances   = {},
      meta_info    = { name = name, symbol = symbol, decimals = decimals } }

  public function meta_info() : meta_info =
    state.meta_info

  public function total_supply() : int =
    state.total_supply

  public function owner() : address =
    state.owner

  public function balances() : balances =
    state.balances

  public function allowances() : allowances =
    state.allowances


  public function balance(owner: address) : option(int) =
    Map.lookup(owner, state.balances)

  public function allowance(allowance_accounts : allowance_accounts) : option(int) =
    Map.lookup(allowance_accounts, state.allowances)

  public function allowance_for_caller(from_account: address) : option(int) =
    allowance({ from_account = from_account, for_account = Call.caller })


  public stateful function transfer(to_account: address, value: int) =
    internal_transfer(Call.caller, to_account, value)

  public stateful function transfer_allowance(from_account: address, to_account: address, value: int) =
    let allowance_accounts = { from_account = from_account, for_account = Call.caller }
    internal_change_allowance(allowance_accounts, -value)
    internal_transfer(from_account, to_account, value)

  public stateful function create_allowance(for_account: address, value: int) =
    require_non_negative_value(value)
    let allowance_accounts = { from_account =  Call.caller, for_account = for_account }
    require_allowance_not_existent(allowance_accounts)
    put(state{ allowances[allowance_accounts] = value })
    Chain.event(Allowance(Call.caller, for_account, value))

  public stateful function change_allowance(for_account: address, value_change: int) =
    let allowance_accounts = { from_account =  Call.caller, for_account = for_account }
    internal_change_allowance(allowance_accounts, value_change)


  public stateful function mint(account: address, value: int) =
    require_owner()
    require_non_negative_value(value)
    put(state{ total_supply = state.total_supply + value, balances[account = 0] @ b = b + value })
    Chain.event(Mint(account, value))

  public stateful function burn(value: int) =
    require_balance(Call.caller, value)
    require_non_negative_value(value)
    put(state{ total_supply = state.total_supply - value, balances[Call.caller] @ b = b - value })
    Chain.event(Burn(Call.caller, value))

  // INTERNAL FUNCTIONS

  private function require_owner() =
    require(Call.caller == state.owner, "ONLY_OWNER_CALL_ALLOWED")

  private function require_allowance_not_existent(allowance_accounts : allowance_accounts) =
    switch(allowance(allowance_accounts))
      Some(_) => abort("ALLOWANCE_ALREADY_EXISTENT")

  private function require_non_negative_value(value : int) =
    require(value >= 0, "NON_NEGATIVE_VALUE_REQUIRED")

  private function require_allowance(allowance_accounts : allowance_accounts, value : int) : int =
    switch(allowance(allowance_accounts))
      Some(allowance) =>
        require(allowance >= value, "ACCOUNT_INSUFFICIENT_ALLOWANCE")
        allowance
      None => abort("ALLOWANCE_NOT_EXISTENT")

  private function require_balance(account : address, value : int) =
    switch(balance(account))
      Some(balance) =>
        require(balance >= value, "ACCOUNT_INSUFFICIENT_BALANCE")
      None => abort("BALANCE_ACCOUNT_NOT_EXISTENT")

  private stateful function internal_transfer(from_account: address, to_account: address, value: int) =
    require_non_negative_value(value)
    require_balance(from_account, value)
    put(state{ balances[from_account] @ b = b - value })
    put(state{ balances[to_account = 0] @ b = b + value })
    Chain.event(Transfer(from_account, to_account, value))

  private stateful function internal_change_allowance(allowance_accounts : allowance_accounts, value_change : int) =
    let allowance = require_allowance(allowance_accounts, value_change)
    let new_allowance = allowance + value_change
    require_non_negative_value(new_allowance)
    put(state{ allowances[allowance_accounts] = new_allowance })
    Chain.event(Allowance(allowance_accounts.from_account, allowance_accounts.for_account, new_allowance))

  // GENERIC HELPER FUNCTIONS

  private function require(expression : bool, error : string) =
    if(!expression)
      abort(error)`;
window.Aepp = Aepp 