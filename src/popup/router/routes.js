import IndexComponent from './pages/Index';
import AccountComponent from './pages/Account';
import SendComponent from './pages/Send';
import ReceiveComponent from './pages/Receive';
import AccountPasswordComponent from './pages/AccountPassword';
import SeedPhraseComponent from './pages/SeedPhrase';
import TransactionsComponent from './pages/Transactions';
import TransactionDetailsComponent from './pages/TransactionDetails';
import SignTransactionComponent from './pages/SignTransaction';
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
    path:'/sign-transaction',
    component:SignTransactionComponent,
  }
];
