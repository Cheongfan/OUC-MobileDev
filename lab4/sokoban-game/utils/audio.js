// 全局音频管理器
class AudioManager {
  constructor() {
    this.bgmContext = null;
    this.soundEnabled = true;
    this.bgmEnabled = true;
    this.init();
  }

  init() {
    // 读取本地音效设置
    this.soundEnabled = wx.getStorageSync('soundEnabled') !== false;
    this.bgmEnabled = wx.getStorageSync('bgmEnabled') !== false;
  }

  setSoundEnabled(enabled) {
    this.soundEnabled = enabled;
    wx.setStorageSync('soundEnabled', enabled);
  }

  setBgmEnabled(enabled) {
    this.bgmEnabled = enabled;
    wx.setStorageSync('bgmEnabled', enabled);
    if (!enabled && this.bgmContext) {
      this.bgmContext.pause();
    }
  }

  // 播放移步/推箱音效接口
  playEffect(type) {
    if (!this.soundEnabled) return;
    // 保底防报错逻辑：音效文件若未准备，静默忽略
    try {
      const innerAudio = wx.createInnerAudioContext();
      innerAudio.src = `/audio/${type}.mp3`;
      innerAudio.play();
    } catch (e) {}
  }
}

const audioManager = new AudioManager();
module.exports = audioManager;