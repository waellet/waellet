//error messages
export const INSUFFICIENT_BALANCE = { type:'error', title:'Insufficient balance', msg:'The requested amount cannot be spent.'};
export const SEED_FAST_COPY = { type:'error', title:'That was too fast!', msg:'Please make sure you write down the recovery phrase on paper and keep it in a safe place.'}
export const INCORRECT_ADDRESS = { type:'error', title:'Incorrect address', msg:'Please make sure you enterd valid public address! '}
export const INCORRECT_AMOUNT = { type:'error', title:'Enter amount', msg:'Please make sure you enterd valid amount to send! '}
export const TRANSACTION_FAILED = { type:'error', title:'Oops! Something went wrong', msg:'We cannot process this transaction! Plesse, try again!'}
export const REQUIRED_FIELD = { type:'error', title:'Required fields!', msg:'Please fill in all fields.'}
export const INCORRECT_FIELDS_ADD_TOKEN = { type:'error', title:'Incorrect fields', msg:'Please fill in all fields correctly! '}
export const TOKEN_ADDED = { type:'error', title:'Token exists', msg:'Token already added! '}
export const TOKEN_INVALID_ADDRESS =  { type:'error', title:'Oops! Something went wrong', msg:'Invalid token contract address!'}
//success messages
export const PUBLIC_KEY_COPIED = { type:'success', title:'Copied' ,msg:'Public key copied to clipboard! '};
export const SUCCESS_TRANSFER = { type:'success', title:'Transfer completed', msg:''}
export const SUCCESS_ADDED = { type:'success', title:'Successfully added!', msg:''}