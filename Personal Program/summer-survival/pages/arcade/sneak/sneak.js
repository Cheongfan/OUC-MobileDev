// pages/arcade/sneak/sneak.js
Page({
  data: {
    totalScore: 0,
    comboRate: 1,
    bpm: 78,
    bpmColorStyle: 'color: #06D6A0;',
    alertState: 0,
    radarStateText: '【门外安全】放心大口冲浪',
    doorLightStyle: 'background: transparent;',
    isBlanketCovered: false,
    isCaptured: false,
    fromMain: false,
    rewardSummary: ''
  },

  scoreInterval: null,
  radarTimeout: null,

  onLoad() {
    // 🌟 核心：直接从本地同步缓存安全读取主线标记
    const fromMain = !!wx.getStorageSync('ENTERED_FROM_MAIN');
    this.setData({ fromMain });
    
    // 用完即焚，避免影响后续单独进街机厅
    wx.removeStorageSync('ENTERED_FROM_MAIN');

    this.initNightRun();
  },

  onUnload() {
    this.clearAllTasks();
  },

  clearAllTasks() {
    if (this.scoreInterval) clearInterval(this.scoreInterval);
    if (this.radarTimeout) clearTimeout(this.radarTimeout);
  },

  initNightRun() {
    this.clearAllTasks();
    this.setData({
      totalScore: 0,
      comboRate: 1,
      bpm: 78,
      bpmColorStyle: 'color: #06D6A0;',
      alertState: 0,
      radarStateText: '【门外安全】放心大口冲浪',
      doorLightStyle: 'background: transparent;',
      isBlanketCovered: false,
      isCaptured: false,
      rewardSummary: ''
    });

    this.scoreInterval = setInterval(() => {
      if (!this.data.isBlanketCovered && !this.data.isCaptured) {
        let nextScore = this.data.totalScore + 10 * this.data.comboRate;
        let nextCombo = Math.min(8, this.data.comboRate + (Math.random() > 0.6 ? 1 : 0));
        let nextBpm = Math.min(145, this.data.bpm + 1);

        this.setData({
          totalScore: nextScore,
          comboRate: nextCombo,
          bpm: nextBpm,
          bpmColorStyle: nextBpm > 120 ? 'color: #FF5353;' : (nextBpm > 100 ? 'color: #FFD23F;' : 'color: #06D6A0;')
        });
      } else if (this.data.isBlanketCovered) {
        let relaxedBpm = Math.max(72, this.data.bpm - 2);
        this.setData({
          bpm: relaxedBpm,
          comboRate: 1,
          bpmColorStyle: relaxedBpm > 100 ? 'color: #FFD23F;' : 'color: #06D6A0;'
        });
      }
    }, 400);

    this.scheduleFootsteps();
  },

  scheduleFootsteps() {
    if (this.data.isCaptured) return;
    const waitMs = Math.floor(Math.random() * 2500 + 2600);
    this.radarTimeout = setTimeout(() => {
      this.triggerWarning();
    }, waitMs);
  },

  triggerWarning() {
    if (this.data.isCaptured) return;
    wx.$haptics.medium();
    wx.$audio.cardSlide();

    this.setData({
      alertState: 1,
      radarStateText: '⚠️ 听到拖鞋声靠近！速速准备蒙头！',
      doorLightStyle: 'background: rgba(255, 210, 63, 0.45);'
    });

    this.radarTimeout = setTimeout(() => {
      this.triggerRaid();
    }, 1400);
  },

  triggerRaid() {
    if (this.data.isCaptured) return;
    this.setData({
      alertState: 2,
      radarStateText: '🚨 门被猛推开！老妈正在鹰视狼顾！',
      doorLightStyle: 'background: rgba(255, 83, 83, 0.85);'
    });

    if (!this.data.isBlanketCovered) {
      this.triggerGameOver();
      return;
    }

    wx.$haptics.heavy();
    this.radarTimeout = setTimeout(() => {
      if (this.data.isCaptured) return;
      this.setData({
        alertState: 0,
        radarStateText: '【安全了】上厕所走开了，继续冲浪！',
        doorLightStyle: 'background: transparent;'
      });
      this.scheduleFootsteps();
    }, 1600);
  },

  startBlanketHold() {
    if (this.data.isCaptured) return;
    wx.$haptics.light();
    this.setData({ isBlanketCovered: true });
  },

  releaseBlanketHold() {
    if (this.data.isCaptured) return;
    this.setData({ isBlanketCovered: false });
    if (this.data.alertState === 2) {
      this.triggerGameOver();
    }
  },

  triggerGameOver() {
    this.clearAllTasks();
    wx.$haptics.failure();
    wx.$audio.gameOver();

    const score = this.data.totalScore;
    const reward = { stamina: -15, sanity: Math.min(30, Math.floor(score / 50)), rage: 35 };
    const formatNum = (v) => (v > 0 ? `+${v}` : `${v}`);
    const summaryText = `【潜行战果】精力 ${formatNum(reward.stamina)}，精神 ${formatNum(reward.sanity)}，妈见打指数 ${formatNum(reward.rage)}`;

    this.setData({
      isCaptured: true,
      alertState: 2,
      doorLightStyle: 'background: rgba(255, 83, 83, 0.9);',
      radarStateText: '❌ 人赃并获！手机已被没收！',
      rewardSummary: summaryText
    });

    wx.$storage.saveMiniGameScore('sneak', score);
    wx.setStorageSync('PENDING_ARCADE_REWARD', reward);
  },

  onBackClick() {
    wx.$haptics.light();
    wx.showModal({
      title: '放弃当晚潜行？',
      content: '当前冲浪得分将作废并直接返回，是否确认？',
      success: (res) => {
        if (res.confirm) {
          wx.navigateBack({
            fail: () => wx.reLaunch({ url: '/pages/index/index' })
          });
        }
      }
    });
  },

  confirmAndReturn() {
    wx.$haptics.light();
    wx.$audio.btnClick();

    if (this.data.fromMain) {
      wx.navigateBack({
        success: () => console.log('返回主线成功'),
        fail: () => wx.reLaunch({ url: '/pages/index/index' })
      });
    } else {
      this.initNightRun();
    }
  }
});