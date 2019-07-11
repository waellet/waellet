import IndexComponent from './pages/Index';
import AccountComponent from './pages/Account';
import SendComponent from './pages/Send';
import ReceiveComponent from './pages/Receive';
import AccountPasswordComponent from './pages/AccountPassword';
import SeedPhraseComponent from './pages/SeedPhrase';
import TransactionsComponent from './pages/Transactions';
import TransactionDetailsComponent from './pages/TransactionDetails';
import SignTransactionComponent from './pages/SignTransaction';
import ManageAccount from './pages/ManageAccounts';
import Settings from './pages/Settings';
import GeneralSettings from './pages/GeneralSettings';
import SecuritySettings from './pages/SecuritySettings';
import AboutSettings from './pages/AboutSettings';
import ConnectConfirmComponent from './pages/ConnectConfirm';
import TipComponent from './pages/TipPage';
import ManageNetworks from './pages/ManageNetworks';
import FungibleTokensComponent from './pages/FungibleTokens';

export default [
  {
    path: '/',
    component: IndexComponent,
  },
  {
    path: '/account',
    component: AccountComponent,
  },
  {
    path: '/send',
    component: SendComponent,
  },
  {
    path: '/receive',
    component: ReceiveComponent,
  },
  {
    name: 'password',
    path: '/password',
    component: AccountPasswordComponent,
    props:true
  },
  {
    name:'seed',
    path:'/seed',
    component:SeedPhraseComponent,
    props:true
  },
  {
    path:'/transactions',
    component:TransactionsComponent
  },
  {
    name:'transaction-details',
    path:'/transaction-details',
    component:TransactionDetailsComponent,
    props:true
  },
  {
    name:'sign',
    path:'/sign-transaction',
    component:SignTransactionComponent,
    props:true

  },
  {
    name:'connect-confirm',
    path:'/connect-confirm',
    component:ConnectConfirmComponent,
    props:true
  },
  {
    path:'/manageAccounts',
    component:ManageAccount,
  },
  {
    path:'/settings',
    component:Settings,
  },
  {
    path:'/generalSettings',
    component:GeneralSettings,
  },
  {
    path:'/securitySettings',
    component:SecuritySettings,
  },
  {
    path:'/aboutSettings',
    component:AboutSettings,
  },
  {
    path:'/tip',
    component:TipComponent
  },
  {
    path:'/manageNetworks',
    component:ManageNetworks
  },
  {
    path:'/tokens',
    component:FungibleTokensComponent
  }
];
