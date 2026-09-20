// pages/arcade/drive/drive.js
Page({
  data: {
    coachQuote: '离合稳住！手别发抖！看准库底线再踩！',
    coachFace: '👨‍🏫',
    coachBp: 110,
    bpColorStyle: 'color: #1C1917;',
    bpFillStyle: 'width: 30%; background-color: #06D6A0;',
    carProgress: 0,
    carEntityStyle: 'top: 0%;',
    leftDist: 40,
    rightDist: 38,
    leftWheelStyle: 'transform: translate(24rpx, 20rpx);',
    rightWheelStyle: 'transform: translate(-24rpx, 20rpx);',
    isBraked: false,
    isFinished: false,
    finalScore: 0,
    verdictText: '',
    rewardSummary: ''
  },

  timer: null,

  onLoad() {
    this.startExamLoop();
  },

  onUnload() {
    this.stopLoop();
  },

  stopLoop() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  },

  startExamLoop() {
    this.stopLoop();
    this.setData({
      coachQuote: '离合稳住！车在慢慢往后倒，看后视镜！',
      coachFace: '👨‍🏫',
      coachBp: 110,
      bpColorStyle: 'color: #1C1917;',
      bpFillStyle: 'width: 30%; background-color: #06D6A0;',
      carProgress: 0,
      carEntityStyle: 'top: 0%;',
      leftDist: 42,
      rightDist: 40,
      isBraked: false,
      isFinished: false,
      finalScore: 0,
      verdictText: '',
      rewardSummary: ''
    });

    this.timer = setInterval(() => {
      let nextProg = this.data.carProgress + 1.2;
      let nextBp = Math.min(220, Math.floor(110 + nextProg * 1.1));
      let face = '👨‍🏫';
      let quote = this.data.coachQuote;
      let bpColor = 'color: #06D6A0;';
      let bpFillBg = '#06D6A0';

      if (nextBp > 150 && nextBp <= 180) {
        face = '😠';
        quote = '“看线！慢点！踩刹车准备！离合别抬太高！”';
        bpColor = 'color: #FFD23F;';
        bpFillBg = '#FFD23F';
      } else if (nextBp > 180) {
        face = '🤬';
        quote = '“踩刹车啊！你要给阎王拜年吗？！”';
        bpColor = 'color: #FF5353;';
        bpFillBg = '#FF5353';
      }

      let lDist = Math.max(2, Math.floor(42 - nextProg * 0.42));
      let rDist = Math.max(3, Math.floor(40 - nextProg * 0.40));

      if (nextProg >= 92) {
        this.stopLoop();
        this.resolveResult(nextProg, true);
      } else {
        this.setData({
          carProgress: nextProg,
          carEntityStyle: `top: ${nextProg}%;`,
          coachBp: nextBp,
          coachFace: face,
          coachQuote: quote,
          bpColorStyle: bpColor,
          bpFillStyle: `width: ${Math.min(100, Math.round((nextBp / 220) * 100))}%; background-color: ${bpFillBg};`,
          leftDist: lDist,
          rightDist: rDist,
          leftWheelStyle: `transform: translate(24rpx, ${Math.floor(nextProg * 0.5)}rpx);`,
          rightWheelStyle: `transform: translate(-24rpx, ${Math.floor(nextProg * 0.5)}rpx);`
        });
      }
    }, 32);
  },

  triggerBrake() {
    if (this.data.isBraked || this.data.isFinished) return;
    this.stopLoop();
    wx.$haptics.heavy();
    wx.$audio.danger();
    this.setData({ isBraked: true });
    this.resolveResult(this.data.carProgress, false);
  },

  resolveResult(prog, isCrash) {
    let score = 0;
    let face = '🤬';
    let quote = '';
    let verdict = '';
    let reward = { stamina: 0, sanity: 0, rage: 0 };
    let summaryText = '';

    const formatNum = (v) => v > 0 ? `+${v}` : `${v}`;

    if (isCrash || prog >= 88) {
      score = 0;
      face = '🤯';
      quote = '“咣当！撞得响亮！驾校护栏维修费两千，下周喊你家长来！”';
      verdict = '❌ 压线撞墙 · 挂科重开';
      reward = { stamina: -25, sanity: -20, rage: 30 };
      summaryText = `【科目二惨败】精力 ${formatNum(reward.stamina)}，精神 ${formatNum(reward.sanity)}，妈见打指数 ${formatNum(reward.rage)}`;
      wx.$audio.gameOver();
      wx.$haptics.failure();
    } else if (prog >= 72 && prog <= 83) {
      score = 100;
      face = '😎';
      quote = '“呦呵！今天祖坟冒青烟了？这把居然停得无可挑剔！”';
      verdict = '🌟 完美车神 · 顺利出师';
      reward = { stamina: 15, sanity: 25, rage: -25 };
      summaryText = `【科目二大捷】精力 ${formatNum(reward.stamina)}，精神 ${formatNum(reward.sanity)}，妈见打指数 ${formatNum(reward.rage)}`;
      wx.$audio.success();
      wx.$haptics.success();
    } else if (prog >= 60 && prog < 72) {
      score = 75;
      face = '😐';
      quote = '“踩太早了！车头还在外面吹西北风呢！扣25分及格边缘！”';
      verdict = '⚠️ 入库不完全 · 勉强及格';
      reward = { stamina: -5, sanity: 5, rage: -5 };
      summaryText = `【科目二险过】精力 ${formatNum(reward.stamina)}，精神 ${formatNum(reward.sanity)}，妈见打指数 ${formatNum(reward.rage)}`;
      wx.$audio.success();
    } else {
      score = 30;
      face = '🤦‍♂️';
      quote = '“你这是刚挂上倒挡就刹死了？胆子小成这样回家摇摇车吧！”';
      verdict = '❌ 提前急刹 · 成绩作废';
      reward = { stamina: -15, sanity: -10, rage: 15 };
      summaryText = `【科目二挂科】精力 ${formatNum(reward.stamina)}，精神 ${formatNum(reward.sanity)}，妈见打指数 ${formatNum(reward.rage)}`;
      wx.$audio.gameOver();
    }

    this.setData({
      isFinished: true,
      finalScore: score,
      coachFace: face,
      coachQuote: quote,
      verdictText: verdict,
      rewardSummary: summaryText
    });

    wx.$storage.saveMiniGameScore('drive', score);
    wx.setStorageSync('PENDING_ARCADE_REWARD', reward);
  },

  confirmAndReturn() {
    wx.$haptics.light();
    wx.$audio.btnClick();
    wx.navigateBack({
      delta: 1,
      fail: () => {
        wx.reLaunch({ url: '/pages/index/index' });
      }
    });
  }
});