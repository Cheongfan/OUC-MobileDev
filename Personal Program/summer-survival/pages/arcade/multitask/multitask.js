// pages/arcade/multitask/multitask.js

const WECHAT_MESSAGES = [
  {
    sender: '导员·突击查勤 👩‍🏫',
    text: '万字大作业实践报告写完了没有？今晚24点系统截止！',
    options: [
      { label: '在交了在交了 📝', isCorrect: true },
      { label: '老师我先洗澡 🛁', isCorrect: false }
    ]
  },
  {
    sender: '母上大人 ⚡',
    text: '桌上那盘红烧肉你动没动？留着晚上吃的！',
    options: [
      { label: '没动！我就闻闻 😇', isCorrect: true },
      { label: '已经被我炫光了 🍗', isCorrect: false }
    ]
  },
  {
    sender: '死党·峡谷开黑 🎮',
    text: '上号上号！四缺一！今晚必上王者！',
    options: [
      { label: '拉我！秒上！ 🚀', isCorrect: true },
      { label: '我要好好学习 📖', isCorrect: false }
    ]
  },
  {
    sender: '驾校教练 🚗',
    text: '明天早上6点考场集训，谁迟到谁提头来见！',
    options: [
      { label: '收到！定五个闹钟 ⏰', isCorrect: true },
      { label: '教练我要睡懒觉 😴', isCorrect: false }
    ]
  }
];

Page({
  data: {
    surviveSec: 0,
    stressPct: 0,
    stressFillStyle: 'width: 0%; background-color: #06D6A0;',
    carPos: 50,
    carPosStyle: 'left: 50%;',
    isOffRoad: false,
    currentMsg: {},
    chatTimeLeft: 3,
    totalReplies: 0,
    radarProgress: 0,
    radarFillStyle: 'width: 0%; background-color: #06D6A0;',
    radarMsg: '脚步声较远，安全',
    isRaidWarning: false,
    isGameOver: false,
    gameOverVerdict: '',
    finalScore: 0,
    rewardSummary: ''
  },

  mainTimer: null,
  driftTimer: null,
  chatTimer: null,
  radarTimer: null,

  onLoad() {
    this.startMultiTaskGame();
  },

  onUnload() {
    this.stopAllEngines();
  },

  stopAllEngines() {
    if (this.mainTimer) clearInterval(this.mainTimer);
    if (this.driftTimer) clearInterval(this.driftTimer);
    if (this.chatTimer) clearInterval(this.chatTimer);
    if (this.radarTimer) clearInterval(this.radarTimer);
  },

  startMultiTaskGame() {
    this.stopAllEngines();
    this.setData({
      surviveSec: 0,
      stressPct: 0,
      stressFillStyle: 'width: 0%; background-color: #06D6A0;',
      carPos: 50,
      carPosStyle: 'left: 50%;',
      isOffRoad: false,
      totalReplies: 0,
      radarProgress: 0,
      isRaidWarning: false,
      isGameOver: false,
      rewardSummary: ''
    });
    this.spawnNextMessage();

    this.mainTimer = setInterval(() => {
      this.setData({ surviveSec: this.data.surviveSec + 1 });
    }, 1000);

    this.driftTimer = setInterval(() => {
      const drift = (Math.random() - 0.5) * 6;
      let nextPos = Math.min(95, Math.max(5, this.data.carPos + drift));
      const offRoad = (nextPos < 18 || nextPos > 82);
      if (offRoad) {
        this.addStress(3);
        wx.$haptics.light();
      }
      this.setData({
        carPos: nextPos,
        carPosStyle: `left: ${nextPos}%;`,
        isOffRoad: offRoad
      });
    }, 120);

    this.startRadarLoop();
  },

  nudgeCarLeft() {
    let next = Math.max(8, this.data.carPos - 12);
    this.setData({ carPos: next, carPosStyle: `left: ${next}%;` });
    wx.$haptics.light();
  },

  nudgeCarRight() {
    let next = Math.min(92, this.data.carPos + 12);
    this.setData({ carPos: next, carPosStyle: `left: ${next}%;` });
    wx.$haptics.light();
  },

  spawnNextMessage() {
    if (this.chatTimer) clearInterval(this.chatTimer);
    const rand = WECHAT_MESSAGES[Math.floor(Math.random() * WECHAT_MESSAGES.length)];
    this.setData({ currentMsg: rand, chatTimeLeft: 3 });

    this.chatTimer = setInterval(() => {
      let t = this.data.chatTimeLeft - 1;
      if (t <= 0) {
        clearInterval(this.chatTimer);
        this.addStress(25);
        wx.$haptics.heavy();
        this.spawnNextMessage();
      } else {
        this.setData({ chatTimeLeft: t });
      }
    }, 1000);
  },

  onReplyChoice(e) {
    const isCorrect = e.currentTarget.dataset.correct;
    if (isCorrect) {
      wx.$haptics.success();
      wx.$audio.cardSelect();
      this.setData({ totalReplies: this.data.totalReplies + 1 });
      this.reduceStress(10);
    } else {
      wx.$haptics.heavy();
      wx.$audio.danger();
      this.addStress(20);
    }
    this.spawnNextMessage();
  },

  startRadarLoop() {
    this.radarTimer = setInterval(() => {
      let p = this.data.radarProgress + Math.floor(Math.random() * 5 + 3);
      if (p >= 100) {
        p = 100;
        this.setData({
          radarProgress: 100,
          radarFillStyle: 'width: 100%; background-color: #FF5353;',
          isRaidWarning: true,
          radarMsg: '🚨 查房逼近！快点假装乖巧！'
        });

        setTimeout(() => {
          if (this.data.isRaidWarning) {
            this.addStress(40);
            wx.$haptics.failure();
            this.setData({
              radarProgress: 0,
              isRaidWarning: false,
              radarFillStyle: 'width: 0%; background-color: #06D6A0;',
              radarMsg: '脚步声走开，暂时安全'
            });
          }
        }, 900);
      } else {
        this.setData({
          radarProgress: p,
          radarFillStyle: `width: ${p}%; background-color: ${p > 70 ? '#FFD23F' : '#06D6A0'};`,
          radarMsg: p > 70 ? '⚠️ 脚步声逼近门缝...' : '脚步声较远，安全'
        });
      }
    }, 150);
  },

  onActInnocent() {
    if (this.data.isRaidWarning) {
      wx.$haptics.success();
      wx.$audio.success();
      this.setData({
        isRaidWarning: false,
        radarProgress: 0,
        radarFillStyle: 'width: 0%; background-color: #06D6A0;',
        radarMsg: '假装成功！老妈满意走开'
      });
      this.reduceStress(15);
    } else {
      wx.$haptics.light();
    }
  },

  addStress(val) {
    let next = Math.min(100, this.data.stressPct + val);
    this.updateStress(next);
    if (next >= 100) this.triggerOverload();
  },

  reduceStress(val) {
    let next = Math.max(0, this.data.stressPct - val);
    this.updateStress(next);
  },

  updateStress(val) {
    let bg = '#06D6A0';
    if (val > 75) bg = '#FF5353';
    else if (val > 45) bg = '#FFD23F';

    this.setData({
      stressPct: val,
      stressFillStyle: `width: ${val}%; background-color: ${bg};`
    });
  },

  triggerOverload() {
    this.stopAllEngines();
    wx.$haptics.failure();
    wx.$audio.gameOver();

    const sec = this.data.surviveSec;
    const replies = this.data.totalReplies;
    const final = sec * 45 + replies * 60;

    let reward = { stamina: -10, sanity: Math.min(25, Math.floor(sec / 2)), rage: sec > 25 ? -10 : 20 };
    const formatNum = (v) => (v > 0 ? `+${v}` : `${v}`);
    const summaryText = '【多线程战果】精力 ' + formatNum(reward.stamina) + '，精神 ' + formatNum(reward.sanity) + '，妈见打指数 ' + formatNum(reward.rage);

    let verdict = '车也开歪了，微信也回崩了，老妈推门而入抓了个正着！大脑 CPU 彻底熔化！';
    if (sec >= 30) {
      verdict = '能在三线并发的炼狱中坚持半分钟以上，你已经具备了大学生特种兵的核心潜质！';
    }

    this.setData({
      isGameOver: true,
      gameOverVerdict: verdict,
      finalScore: final,
      rewardSummary: summaryText
    });

    wx.$storage.saveMiniGameScore('multitask', final);
    wx.setStorageSync('PENDING_ARCADE_REWARD', reward);
  },

  confirmAndReturn() {
    wx.$haptics.medium();
    wx.$audio.btnClick();
    wx.navigateBack({
      fail: () => wx.reLaunch({ url: '/pages/index/index' })
    });
  },

  restartMultiTask() {
    this.startMultiTaskGame();
  }
});