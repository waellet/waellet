'use strict';

chrome.runtime.onInstalled.addListener(details => {
  console.log('previousVersion', details.previousVersion);
});

chrome.browserAction.setBadgeText({text: 'hack'});

var motivation = require('../lib');
var m = motivation.get(); // returns a random quote
console.log(m);

console.log('Event Page for Browser Action');
