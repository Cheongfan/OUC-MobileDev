/**
 * 触觉微震动反馈引擎
 */
const Storage = require('./storage');

const Haptics = {
  // 通用震动入口
  vibrate(type = 'light') {
    const settings = Storage.getSettings();
    if (!settings.haptics) return;

    // 微信原生短震动只支持 'heavy' | 'medium' | 'light'
    const validTypes = ['heavy', 'medium', 'light'];
    const intensity = validTypes.includes(type) ? type : settings.vibrationIntensity || 'medium';

    wx.vibrateShort({
      type: intensity,
      fail: () => {
        // 部分旧机型降级兼容
        wx.vibrateShort();
      }
    });
  },

  // 轻微触感：滑动卡牌、按键悬停
  light() {
    this.vibrate('light');
  },

  // 中度触感：卡牌选定、切换标签、小游戏操作
  medium() {
    this.vibrate('medium');
  },

  // 重度触感：致命扣分、警告、老妈发飙
  heavy() {
    this.vibrate('heavy');
  },

  // 成功反馈：长震动
  success() {
    const settings = Storage.getSettings();
    if (!settings.haptics) return;
    wx.vibrateShort({ type: 'medium' });
    setTimeout(() => {
      wx.vibrateShort({ type: 'light' });
    }, 100);
  },

  // 失败/暴毙长震动
  failure() {
    const settings = Storage.getSettings();
    if (!settings.haptics) return;
    wx.vibrateLong();
  }
};

module.exports = Haptics;