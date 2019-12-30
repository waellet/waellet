
export default `include "List.aes"
payable contract HashTimeLock = 

  record state = {
    contracts : map(bytes(32), lock_contract) }

  datatype status = ACTIVE | WITHDRAWN | REFUNDED | EXPIRED | INVALID

  record lock_contract = {
    id: bytes(32),
    input_amount : int,
    output_amount : int,
    expiration : int,
    hash_lock : bytes(32),
    status: status,
    sender : address,
    receiver : address,
    output_network : string,
    output_address : string}

  datatype event =
    Withdraw(indexed bytes(32), indexed address, indexed address, string)
    | Refund(indexed bytes(32), indexed address, indexed address, string)
    | New_contract(indexed bytes(32), indexed address, indexed address, string)

  function withdrawable(id : bytes(32), secret : bytes(32)) =
    let temp_contract: lock_contract = state.contracts[id]
    require(is_active(temp_contract.status), "SWAP_NOT_ACTIVE")
    require(temp_contract.expiration > Chain.timestamp, "INVALID_TIME")
    require(temp_contract.hash_lock == Crypto.sha256(secret), "INVALID_SECRET")

  function refundable(id : bytes(32)) =
    let temp_contract: lock_contract = state.contracts[id]
    require(is_active(temp_contract.status), "SWAP_NOT_ACTIVE")
    require(Chain.timestamp >= temp_contract.expiration, "INVALID_TIME")
    require(temp_contract.sender == Call.caller, "INVALID_SENDER")

  public payable stateful entrypoint new_contract(output_amount : int,
    expiration : int, hash_lock : bytes(32),
    receiver : address, output_network : string, output_address : string) : lock_contract =
    let sender : address = Call.caller
    let input_amount : int = Call.value
    let id : bytes(32) = generate_id(sender, receiver, input_amount, hash_lock, expiration)

    let new_contract : lock_contract = { 
      id = id,
      input_amount = input_amount,
      output_amount = output_amount,
      expiration = expiration,
      hash_lock = hash_lock,
      status = ACTIVE,
      sender = sender,
      receiver = receiver,
      output_network = output_network,
      output_address = output_address }

    require(expiration > Chain.timestamp, "INVALID_TIME")
    require(input_amount > 0, "INVALID_AMOUNT")

    put(state{
      contracts[id] = new_contract })

    let new_contract_message : string = concat(concat(output_network, output_address),
     concat(concat(Int.to_str(input_amount), Int.to_str(output_amount)),
     concat(Int.to_str(expiration), Bytes.to_str(hash_lock))))

    //all parameters that ARE NOT indexed, are packed in the string
    Chain.event(New_contract(id, sender, receiver, new_contract_message ))

    state.contracts[id]

  public stateful entrypoint withdraw(id : bytes(32), secret : bytes(32)) : bool =
    withdrawable(id, secret)
    let withdraw_message : string = generate_withdraw_message(secret, state.contracts[id].hash_lock)

    put(state{
      contracts[id].status = WITHDRAWN})
    Chain.spend(state.contracts[id].receiver, state.contracts[id].input_amount)

    //all parameters that ARE NOT indexed, are packed in the string
    Chain.event(Withdraw(id, state.contracts[id].sender,
     state.contracts[id].receiver, withdraw_message ))
    true

  public stateful entrypoint refund(id : bytes(32)) : bool =
    refundable(id)

    put(state{
      contracts[id].status = REFUNDED })
    Chain.spend(state.contracts[id].sender, state.contracts[id].input_amount)
    
    //all parameters that ARE NOT indexed, are packed in the string
    Chain.event(Refund(id, state.contracts[id].sender, state.contracts[id].receiver, 
      Bytes.to_str(state.contracts[id].hash_lock)))
    true

  public entrypoint get_contract(id : bytes(32)) : lock_contract =
    state.contracts[id] 

  public entrypoint contract_exists(id : bytes(32)) : bool =
    is_invalid(state.contracts[id].status) == false

  public entrypoint get_one_status(id : bytes(32)) : status =
    let temp_contract : lock_contract = state.contracts[id]
    if(temp_contract.status == ACTIVE &&
        temp_contract.expiration < Chain.timestamp)
      INVALID
    else
      temp_contract.status

  public entrypoint get_many_status(ids : list(bytes(32))) : list(status) =
    List.map((id) => get_one_status(id), ids)

  entrypoint generate_id(sender : address, receiver : address,
   input_amount : int, hash_lock : bytes(32), expiration : int) : bytes(32) =
    let packed_string : string = concat(String.concat(String.concat(Address.to_str(sender), 
      Address.to_str(receiver)), String.concat(Int.to_str(input_amount),
       Bytes.to_str(hash_lock))), Int.to_str(expiration))

    Crypto.sha256(packed_string)

  entrypoint generate_withdraw_message(secret : bytes(32), hash_lock : bytes(32)) : string =
    let withdraw_message : string = concat(Bytes.to_str(secret),
     Bytes.to_str(hash_lock))
    withdraw_message

  entrypoint is_active(x : status) : bool =
    switch(x)
      ACTIVE => true
      _ => false

  entrypoint is_withdrawn(x : status) : bool =
    switch(x)
      WITHDRAWN => true
      _ => false

  entrypoint is_refunded(x : status) : bool =
    switch(x)
      REFUNDED => true
      _ => false

  entrypoint is_expired(x : status) : bool =
    switch(x)
      EXPIRED => true
      _ => false

  entrypoint is_invalid(x : status) : bool =
    switch(x)
      INVALID => true
      _ => false

  entrypoint concat(a : string, b : string) =
    String.concat(String.concat(a, ","),b)

  public entrypoint  init() ={ 
    contracts = {} }`
