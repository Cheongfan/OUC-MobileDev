// pages/settlement/settlement.js
const ENDINGS = require('../../utils/endingsData');

Page({
  data: {
    days: 1,
    reportNo: '',
    ending: {},
    finalStats: {
      stamina: 0,
      money: 0,
      sanity: 0,
      rage: 0
    },
    currentDate: '',
    latestAIQuote: null
  },

  onLoad(options) {
    const endingId = options.endingId || 'END_STAMINA_ZERO';
    const days = parseInt(options.days) || 1;

    const endingInfo = ENDINGS[endingId] || ENDINGS.END_STAMINA_ZERO;

    const randNo = 'SUMMER-' + Math.floor(100000 + Math.random() * 900000);
    const date = new Date();
    const dateStr = `${date.getFullYear()}.${date.getMonth() + 1}.${date.getDate()}`;

    const history = wx.$storage.getSettings ? (wx.getStorageSync('SUMMER_HISTORY') || wx.getStorageSync('SUMMER_SURVIVAL_HISTORY') || []) : [];
    const latest = history[0] || {};

    // 🌟 核心修改：结算页只读取“本局”的最优自由辩解高光
    let sessionBestQuote = null;
    if (wx.$storage && typeof wx.$storage.getBestSessionAIQuote === 'function') {
      sessionBestQuote = wx.$storage.getBestSessionAIQuote();
    }

    this.setData({
      days,
      reportNo: randNo,
      ending: endingInfo,
      finalStats: {
        stamina: latest.stamina || 0,
        money: latest.money || 0,
        sanity: latest.sanity || 0,
        rage: latest.rage || 0
      },
      currentDate: dateStr,
      latestAIQuote: sessionBestQuote
    });

    if (wx.$haptics) wx.$haptics.success();
    if (wx.$audio) wx.$audio.success();
  },

  restartGame() {
    if (wx.$haptics) wx.$haptics.medium();
    if (wx.$audio) wx.$audio.btnClick();
    wx.redirectTo({
      url: '/pages/game/game'
    });
  },

  navToCollection() {
    if (wx.$haptics) wx.$haptics.light();
    if (wx.$audio) wx.$audio.btnClick();
    wx.navigateTo({
      url: '/pages/collection/collection',
      fail: (err) => {
        console.error('跳转图鉴失败:', err);
      }
    });
  },

  backHome() {
    if (wx.$haptics) wx.$haptics.light();
    if (wx.$audio) wx.$audio.btnClick();
    wx.reLaunch({
      url: '/pages/index/index'
    });
  },

  onShareAppMessage() {
    if (wx.$haptics) wx.$haptics.light();
    let shareTitle = `我在大学暑假苟活了 ${this.data.days} 天，惨获【${this.data.ending.title}】！`;
    if (this.data.latestAIQuote && this.data.latestAIQuote.title) {
      shareTitle = `我凭称号【${this.data.latestAIQuote.title}】在暑假苟活了 ${this.data.days} 天！你敢来战？`;
    }
    return {
      title: shareTitle,
      path: '/pages/index/index'
    };
  }
});