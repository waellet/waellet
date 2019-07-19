import IndexComponent from './pages/Index';
import AccountComponent from './pages/Account';
import SendComponent from './pages/Send';
import ReceiveComponent from './pages/Receive';
import AccountPasswordComponent from './pages/AccountPassword';
import SeedPhraseComponent from './pages/SeedPhrase';
import TransactionsComponent from './pages/Transactions';
import TransactionDetailsComponent from './pages/TransactionDetails';
import SignTransactionComponent from './pages/SignTransaction';
import ManageAccountComponent from './pages/ManageAccounts';
import SettingsComponent from './pages/Settings';
import GeneralSettingsComponent from './pages/GeneralSettings';
import SecuritySettingsComponent from './pages/SecuritySettings';
import AdvancedSettingsComponent from './pages/AdvancedSettings';
import AboutSettingsComponent from './pages/AboutSettings';
import UtilitiesComponent from './pages/Utilities';
import TipComponent from './pages/TipPage';
import AllowancesComponent from './pages/Allowances';
import ConnectConfirmComponent from './pages/ConnectConfirm';
import ManageNetworksComponent from './pages/ManageNetworks';
import FungibleTokensComponent from './pages/FungibleTokens';
import AirGapSetup from './pages/AirGapSetup';
import SignTransactionByQrCode from './pages/SignTransactionByQrCode';

import QrCodeReader from './pages/QrCodeReader';

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
    component:ManageAccountComponent,
  },
  {
    path:'/settings',
    component:SettingsComponent,
  },
  {
    path:'/generalSettings',
    component:GeneralSettingsComponent,
  },
  {
    path:'/securitySettings',
    component:SecuritySettingsComponent,
  },
  {
    path:'/advancedSettings',
    component:AdvancedSettingsComponent,
  },
  {
    path:'/aboutSettings',
    component:AboutSettingsComponent,
  },
  {
    path:'/utilities',
    component:UtilitiesComponent,
  },
  {
    path:'/tip',
    component:TipComponent
  },
  {
    path:'/allowances',
    component:AllowancesComponent
  },
  {
    path:'/manageNetworks',
    component:ManageNetworksComponent
  },
  {
    path:'/tokens',
    component:FungibleTokensComponent
  },
  {
    path:'/airGapSetup',
    component:AirGapSetup
  },
  {
    path:'/qrCodeReader',
    component: QrCodeReader
  },
  {
    path:'/signTransactionByQrCode',
    component: SignTransactionByQrCode,
    props: true,
    name: 'signTransactionByQrCode'
  }
];
