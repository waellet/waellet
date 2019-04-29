/* eslint-disable */
import Aepp from '../node_modules/@aeternity/aepp-sdk/es/ae/aepp';
import store from './store';

global.browser = require('webextension-polyfill');

chrome.browserAction.onClicked.addListener(function(tab) {
    chrome.tabs.executeScript({file: "backgrounds.js"});
});

console.log(1);