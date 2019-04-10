// get lang
const lang = chrome.i18n.getUILanguage().toLowerCase()
export default {
  lang: lang === 'zh-cn' ? 'zh-cn' : 'en',
  internationalize (str) {
    return str.replace(/^__MSG_(.+)__$/, function (m, key) {
      return chrome.i18n.getMessage(key)
    })
  }
}
