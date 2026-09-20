/**
 * 音效与音频管理引擎（完全自包含，无外部依赖）
 */
const Storage = require('./storage');

class SoundManager {
  constructor() {
    this.ctx = null;
    this.initWebAudio();
  }

  initWebAudio() {
    if (wx.createWebAudioContext) {
      try {
        this.ctx = wx.createWebAudioContext();
      } catch (e) {
        this.ctx = null;
      }
    }
  }

  // 合成特定频率声音（正弦波/方波），保证在无外部音频资源时也有超棒的街机手感
  playTone(freq = 440, duration = 0.08, type = 'sine') {
    const settings = Storage.getSettings();
    if (!settings.sfx) return;

    if (!this.ctx) {
      this.initWebAudio();
      if (!this.ctx) return;
    }

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

      gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch (e) {
      // 静默降级
    }
  }

  // 预设情境音效
  btnClick() {
    this.playTone(600, 0.05, 'triangle');
  }

  cardSlide() {
    this.playTone(320, 0.04, 'sine');
  }

  cardSelect() {
    this.playTone(520, 0.08, 'triangle');
  }

  success() {
    this.playTone(523.25, 0.08, 'triangle'); // C5
    setTimeout(() => {
      this.playTone(659.25, 0.08, 'triangle'); // E5
    }, 90);
    setTimeout(() => {
      this.playTone(783.99, 0.14, 'triangle'); // G5
    }, 180);
  }

  danger() {
    this.playTone(180, 0.15, 'sawtooth');
  }

  gameOver() {
    this.playTone(220, 0.12, 'sawtooth');
    setTimeout(() => {
      this.playTone(196, 0.15, 'sawtooth');
    }, 130);
    setTimeout(() => {
      this.playTone(164, 0.25, 'sawtooth');
    }, 280);
  }
}

module.exports = new SoundManager();