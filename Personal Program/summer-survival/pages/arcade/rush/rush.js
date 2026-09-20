// pages/arcade/rush/rush.js
Page({
  data: {
    countdownSec: 10,
    shieldHp: 100,
    shieldFillStyle: 'width: 100%; background-color: #FF5353;',
    totalTaps: 0,
    currentCps: 0,
    ping: 32,
    pingColorStyle: 'color: #06D6A0;',
    isFrenzyMode: false,
    isQteActive: false,
    isFinished: false,
    isSuccess: false,
    finalScore: 0,
    fromMain: false,
    rewardSummary: ''
  },

  countdownTimer: null,
  tapsInLastSecond: 0,

  onLoad() {
    // 🌟 核心修复：直接从本地同步缓存安全读取主线标记，与 sneak 保持完全一致
    const fromMain = !!wx.getStorageSync('ENTERED_FROM_MAIN');
    this.setData({ fromMain });
    
    // 用完即焚，避免影响后续单独进街机厅
    wx.removeStorageSync('ENTERED_FROM_MAIN');

    this.startTicketSession();
  },

  onUnload() {
    this.clearRushTimers();
  },

  clearRushTimers() {
    if (this.countdownTimer) clearInterval(this.countdownTimer);
    if (this.cpsTimer) clearInterval(this.cpsTimer);
  },

  startTicketSession() {
    this.clearRushTimers();
    this.setData({
      countdownSec: 10,
      shieldHp: 100,
      shieldFillStyle: 'width: 100%; background-color: #FF5353;',
      totalTaps: 0,
      currentCps: 0,
      ping: 32,
      pingColorStyle: 'color: #06D6A0;',
      isFrenzyMode: false,
      isQteActive: false,
      isFinished: false,
      isSuccess: false,
      finalScore: 0,
      rewardSummary: ''
    });

    this.countdownTimer = setInterval(() => {
      let sec = this.data.countdownSec - 1;
      let randPing = Math.floor(Math.random() * 80 + 25);
      if (sec <= 3) randPing = 460 + Math.floor(Math.random() * 400);

      if (sec <= 0) {
        this.clearRushTimers();
        this.setData({ countdownSec: 0, ping: 999, pingColorStyle: 'color: #FF5353;' });
        this.finishRush(false);
      } else {
        this.setData({
          countdownSec: sec,
          ping: randPing,
          pingColorStyle: randPing > 300 ? 'color: #FF5353;' : (randPing > 100 ? 'color: #FFD23F;' : 'color: #06D6A0;')
        });

        if (sec === 6 && !this.data.isQteActive && this.data.shieldHp > 20) {
          this.triggerQteShield();
        }
      }
    }, 1000);

    this.cpsTimer = setInterval(() => {
      this.setData({
        currentCps: this.tapsInLastSecond,
        isFrenzyMode: this.tapsInLastSecond >= 6
      });
      this.tapsInLastSecond = 0;
    }, 1000);
  },

  onTapStrike() {
    if (this.data.isFinished || this.data.isQteActive) return;
    wx.$haptics.light();
    wx.$audio.btnClick();

    this.tapsInLastSecond++;
    const total = this.data.totalTaps + 1;
    const dmg = this.data.isFrenzyMode ? 4 : 2;
    let nextHp = Math.max(0, this.data.shieldHp - dmg);

    this.setData({
      totalTaps: total,
      shieldHp: nextHp,
      shieldFillStyle: `width: ${nextHp}%; background-color: ${nextHp < 30 ? '#06D6A0' : '#FF5353'};`
    });

    if (nextHp <= 0) {
      this.clearRushTimers();
      this.finishRush(true);
    }
  },

  triggerQteShield() {
    wx.$haptics.heavy();
    wx.$audio.danger();
    this.setData({ isQteActive: true });
  },

  handleQteChoice(e) {
    const val = e.currentTarget.dataset.val;
    if (val === 'duck') {
      wx.$haptics.success();
      wx.$audio.success();
      let smashedHp = Math.max(0, this.data.shieldHp - 25);
      this.setData({
        isQteActive: false,
        shieldHp: smashedHp,
        shieldFillStyle: `width: ${smashedHp}%; background-color: #06D6A0;`
      });
      if (smashedHp <= 0) {
        this.clearRushTimers();
        this.finishRush(true);
      }
    } else {
      wx.$haptics.failure();
      wx.$audio.gameOver();
      this.setData({
        countdownSec: Math.max(1, this.data.countdownSec - 2),
        isQteActive: false
      });
    }
  },

  finishRush(isWon) {
    let score = 0;
    let reward = { stamina: 0, money: 0, sanity: 0 };

    if (isWon) {
      wx.$haptics.success();
      wx.$audio.success();
      score = this.data.countdownSec * 120 + this.data.totalTaps * 15;
      reward = { stamina: -10, money: -30, sanity: 35 };
    } else {
      wx.$haptics.failure();
      wx.$audio.gameOver();
      score = this.data.totalTaps * 10;
      reward = { stamina: -15, sanity: -25 };
    }

    const formatNum = (v) => (v > 0 ? `+${v}` : `${v}`);
    const summaryText = `【抢票战果】精力 ${formatNum(reward.stamina)}，钱包 ${formatNum(reward.money || 0)}，精神 ${formatNum(reward.sanity)}`;

    this.setData({
      isFinished: true,
      isSuccess: isWon,
      finalScore: score,
      rewardSummary: summaryText
    });

    wx.$storage.saveMiniGameScore('rush', score);
    // 写入收益缓存，供主线读取
    wx.setStorageSync('PENDING_ARCADE_REWARD', reward);
  },

  onBackClick() {
    wx.$haptics.light();
    wx.showModal({
      title: '放弃本次抢票？',
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
      this.startTicketSession();
    }
  }
});