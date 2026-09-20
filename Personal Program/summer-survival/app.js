/**
 * 全局主程序入口
 */
const Storage = require('./utils/storage');
const Haptics = require('./utils/haptics');
const Audio = require('./utils/audio');
const AIEngine = require('./utils/aiEngine');

App({
  globalData: {
    systemInfo: null,
    isNightMode: false,
    version: '1.0.0',
    easterEggClicks: 0,
    hasPlayedBoot: false
  },

  onLaunch() {
    // 0. 核心：必须初始化云开发/云托管鉴权凭据
    // 0. 安全初始化微信云开发/云托管
    if (wx.cloud) {
      try {
        wx.cloud.init({
          env: 'your-env-id' // 你的真实环境 ID
          // ⚠️ 切勿添加 traceUser: true，否则会触发 webapi_getwxaasyncsecinfo 的 JSON 校验 BUG
        });
      } catch (err) {
        console.warn('[Cloud Init Protected]:', err);
      }
    }

    // 1. 获取设备与窗口环境
    try {
      this.globalData.systemInfo = wx.getSystemInfoSync();
    } catch (e) {
      this.globalData.systemInfo = {};
    }
    
    // 2. 检测当前时段（晚 22:00 ~ 次日 6:00 自动夜间模式）
    this.checkDayNightCycle();

    // 3. 挂载全局便捷工具
    wx.$storage = Storage;
    wx.$haptics = Haptics;
    wx.$audio = Audio;
    wx.$ai = AIEngine;
  },

  checkDayNightCycle() {
    const settings = Storage.getSettings();
    if (!settings.nightModeAuto) {
      this.globalData.isNightMode = false;
      return;
    }
    const currentHour = new Date().getHours();
    this.globalData.isNightMode = currentHour >= 22 || currentHour < 6;
  }
});