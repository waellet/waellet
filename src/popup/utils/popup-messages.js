export const POPUP_PROPS = {
    show:false,
    type:'',
    title:'',
    msg:'',
    class: '',
    secondBtn:false,
    secondBtnClick:'',
    data:'',
    buttonsTextPrimary: 'Ok',
    buttonsTextSecondary: 'See in explorer',
    buttonsFillPrimary: 'primary',
    buttonsFillSecondary: 'secondary',
  }
//error messages
export const INSUFFICIENT_BALANCE = { type:'error', title:'Insufficient balance', msg:'The requested amount cannot be spent.'};
export const SEED_FAST_COPY = { type:'error', title:'That was too fast!', msg:'Please make sure you write down the recovery phrase on paper and keep it in a safe place.'}
export const INCORRECT_ADDRESS = { type:'error', title:'Incorrect address', msg:'Please make sure you entered valid public address! '}
export const INCORRECT_AMOUNT = { type:'error', title:'Enter amount', msg:'Please make sure you entered valid amount to send! '}
export const TRANSACTION_FAILED = { type:'error', title:'Oops! Something went wrong', msg:'We cannot process this transaction! Plesse, try again!'}
export const REQUIRED_FIELD = { type:'error', title:'Required fields!', msg:'Please fill in all fields.'}
export const REMOVE_USER_NETWORK_ACTIVE_ERROR = {type:'error',title:'Can not be removed!', msg: 'This network is active right now. Please, select other active network and try again.'}
export const USER_NETWORK_EXISTS_ERROR = {type:'error',title:'Network name exists!', msg: 'This name already exists in networks. Please, choose another name for your new network.'}
export const INCORRECT_FIELDS_ADD_TOKEN = { type:'error', title:'Incorrect fields', msg:'Please fill in all fields correctly! '}
export const TOKEN_ADDED = { type:'error', title:'Token exists', msg:'Token already added! '}
export const TOKEN_INVALID_ADDRESS =  { type:'error', title:'Oops! Something went wrong', msg:'Invalid token contract address!'}
export const CHARS_ALLOWED =  { type:'error', title:'Oops! Something went wrong', msg:'Allowed only letters and numbers!'}
//success messages
export const PUBLIC_KEY_COPIED = { type:'success', title:'Copied to clipboard' ,msg:''};
export const SUCCESS_TRANSFER = { type:'success', title:'Transfer completed', msg:''}
export const SUCCESS_ADDED = { type:'success', title:'Successfully added!', msg:''}
export const REMOVE_USER_NETWORK = {type:'success', title:'Are you sure?', msg:'', buttonsTextPrimary: 'No', buttonsTextSecondary: 'Yes', buttonsFillPrimary: 'primary', buttonsFillSecondary: 'alternative'}
export const CONFIRM_TRANSACTION = {type:'success', title:'Confirm transaction?', msg:'You are about to send some tokens to somebody. This transaction is irreversible! ', buttonsTextPrimary: 'Cancel', buttonsTextSecondary: 'Confirm', buttonsFillPrimary: 'primary', buttonsFillSecondary: 'alternative'}
