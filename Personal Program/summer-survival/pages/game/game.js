// pages/game/game.js
const CARDS_EXTENDED = [
  {
    id: 'CARD_01',
    categoryTag: '驾考惊魂',
    tagType: 'red',
    title: '科目二半坡熄火',
    character: '副驾咆哮教练 🚗',
    desc: '“手刹拉紧！离合慢慢抬！听见发动机抖动没有？再抖车就要散架了！”',
    left: {
      text: '一脚猛踩到底',
      impact: { stamina: -15, money: -20, sanity: -25, rage: 15 },
      hints: ['体力-', 'San-']
    },
    right: {
      text: '微抬离合稳住',
      impact: { stamina: -10, money: 0, sanity: 15, rage: -5 },
      hints: ['San+', '妈见打-']
    },
    presets: ['教练我听见离合 in 向我求救！', '刚才有阵逆向山风导致了熄火！', '其实这是防后溜的安全试探！']
  },
  {
    id: 'CARD_02',
    categoryTag: '特种兵出行',
    tagType: 'teal',
    title: '硬座直达海边看日出',
    character: '热血特种兵室友 🌊',
    desc: '“今晚 11 点慢车硬座，天亮刚好赶上海边退潮抓螃蟹，纯省酒店钱走不走？”',
    left: {
      text: '苟在空调房',
      impact: { stamina: 10, money: 5, sanity: -10, rage: 0 },
      hints: ['体力+', 'San-']
    },
    right: {
      text: '背包直接出发！',
      impact: { stamina: -35, money: -25, sanity: 30, rage: 10 },
      hints: ['体力--', 'San++']
    },
    presets: ['青春没有售价，硬座直达脱水！', '我负责在海边看行李行不行？', '我算过潮汐表，今晚不宜赶海！']
  },
  {
    id: 'CARD_03',
    categoryTag: '深夜放纵',
    tagType: 'purple',
    title: '疯狂星期四夜宵拼单',
    character: '饥饿的胃 🍗',
    desc: '凌晨 1:40，宿舍群有人连发十个炸鸡优惠券，香气仿佛透过屏幕钻进鼻子里。',
    left: {
      text: '喝凉水忍住',
      impact: { stamina: -5, money: 0, sanity: -20, rage: 0 },
      hints: ['San--']
    },
    right: {
      text: '狠狠拼单！',
      impact: { stamina: 15, money: -30, sanity: 25, rage: 20 },
      hints: ['钱包-', '体力+']
    },
    presets: ['人在低血糖时做的决定不具备法律效力！', '这是明天的早饭提前吃！', '吃了这顿炸鸡，我发誓明天晨跑五公里！']
  },
  {
    id: 'CARD_04',
    categoryTag: '家庭生存',
    tagType: 'yellow',
    title: '老妈的拖把巡视',
    character: '双手叉腰的老妈 ⚡',
    desc: '“天天睡到大中午！地也不拖，垃圾也不倒，饭还要端到床头喂你吗？！”',
    left: {
      text: '翻身主动拖地',
      impact: { stamina: -15, money: 10, sanity: -5, rage: -30 },
      hints: ['体力-', '妈见打--']
    },
    right: {
      text: '被子蒙头装死',
      impact: { stamina: 5, money: 0, sanity: -10, rage: 40 },
      hints: ['妈见打+++']
    },
    presets: ['妈！我其实是在被窝里构思全屋收纳方案！', '我刚才在闭目默背高数公式！', '妈您放下拖把，这把让我这个大学生尽孝！']
  }
];

const ENDINGS = require('../../utils/endingsData');

const ARCADE_MINI_GAMES = [
  { name: '科目二倒车入库', url: '/pages/arcade/drive/drive' },
  { name: '行李箱收纳大作战', url: '/pages/arcade/pack/pack' },
  { name: '母上深夜查房伪装', url: '/pages/arcade/sneak/sneak' },
  { name: '12306神之右手抢票', url: '/pages/arcade/rush/rush' },
  { name: '24小时作息消除', url: '/pages/arcade/schedule/schedule' },
  { name: '一心三用分心模拟', url: '/pages/arcade/multitask/multitask' }
];

Page({
  data: {
    currentDay: 1,
    currentCard: null,
    cardEmoji: '🚗',
    stats: { stamina: 60, money: 50, sanity: 70, rage: 15 },
    previewDiff: { stamina: 0, money: 0, sanity: 0, rage: 0 },
    cardTransform: { x: 0, y: 0, rotate: 0 },
    leftOpacity: 0,
    rightOpacity: 0,
    isCardEntering: true,
    isNight: false,

    isAIDrawerOpen: false,
    bargainInput: '',
    currentPresets: [],
    isAISubmitting: false,
    isStreaming: false,
    aiSpeechOutput: '',
    aiVerdictData: null,
    showVerdictStamp: false,
    verdictStamp: { title: '', passed: true },

    activeMilestone: null,

    timelineStyle: 'width: 1.6%;',
    staminaStyle: 'width: 60%;',
    moneyStyle: 'width: 50%;',
    sanityStyle: 'width: 70%;',
    rageStyle: 'width: 15%;'
  },

  cardIndex: 0,
  deck: [],
  milestonesTriggered: { 15: false, 30: false, 45: false },

  onLoad() {
    if (wx.$storage && typeof wx.$storage.clearSessionAIQuotes === 'function') {
      wx.$storage.clearSessionAIQuotes();
    }

    const settings = wx.$storage.getSettings();
    this.setData({ isNight: !!settings.manualNightMode });
    this.deck = [...CARDS_EXTENDED].sort(() => Math.random() - 0.5);
    this.updateStyleBars(this.data.stats, 1);
    this.loadCard();
  },

  onShow() {
    const arcadeReward = wx.getStorageSync('PENDING_ARCADE_REWARD');
    if (arcadeReward) {
      wx.removeStorageSync('PENDING_ARCADE_REWARD');
      this.applyArcadeRewardAnimated(arcadeReward);
    }
  },

  applyArcadeRewardAnimated(reward) {
    wx.$haptics.success();
    wx.$audio.success();
    const stats = this.data.stats;

    const nextStamina = Math.min(100, Math.max(0, stats.stamina + (reward.stamina || 0)));
    const nextMoney = Math.min(100, Math.max(0, stats.money + (reward.money || 0)));
    const nextSanity = Math.min(100, Math.max(0, stats.sanity + (reward.sanity || 0)));
    const nextRage = Math.min(100, Math.max(0, stats.rage + (reward.rage || 0)));

    const nextStats = { stamina: nextStamina, money: nextMoney, sanity: nextSanity, rage: nextRage };
    
    this.setData({
      stats: nextStats,
      previewDiff: {
        stamina: reward.stamina || 0,
        money: reward.money || 0,
        sanity: reward.sanity || 0,
        rage: reward.rage || 0
      }
    });

    this.updateStyleBars(nextStats, this.data.currentDay);

    setTimeout(() => {
      this.setData({
        previewDiff: { stamina: 0, money: 0, sanity: 0, rage: 0 }
      });
      this.cardIndex++;
      this.loadCard();
    }, 2000);
  },

  updateStyleBars(stats, day) {
    const progress = Math.min(100, Math.max(1, Math.round((day / 60) * 100)));
    const staminaPct = Math.min(100, Math.max(0, stats.stamina));
    const moneyPct = Math.min(100, Math.max(0, stats.money));
    const sanityPct = Math.min(100, Math.max(0, stats.sanity));
    const ragePct = Math.min(100, Math.max(0, stats.rage));

    this.setData({
      timelineStyle: `width: ${progress}%;`,
      staminaStyle: `width: ${staminaPct}%;`,
      moneyStyle: `width: ${moneyPct}%;`,
      sanityStyle: `width: ${sanityPct}%;`,
      rageStyle: `width: ${ragePct}%;`
    });
  },

  loadCard() {
    if (this.cardIndex >= this.deck.length) {
      this.deck = [...CARDS_EXTENDED].sort(() => Math.random() - 0.5);
      this.cardIndex = 0;
    }

    const card = this.deck[this.cardIndex];
    let emoji = '🍉';
    if (card.tagType === 'red') emoji = '🚗';
    else if (card.tagType === 'teal') emoji = '🌊';
    else if (card.tagType === 'purple') emoji = '🍗';
    else if (card.tagType === 'yellow') emoji = '🧹';

    this.setData({
      currentCard: card,
      cardEmoji: emoji,
      currentPresets: card.presets || ['我真的尽力了！', '这纯属不可抗力！'],
      cardTransform: { x: 0, y: 0, rotate: 0 },
      leftOpacity: 0,
      rightOpacity: 0,
      previewDiff: { stamina: 0, money: 0, sanity: 0, rage: 0 },
      isCardEntering: true,
      showVerdictStamp: false
    });

    setTimeout(() => {
      this.setData({ isCardEntering: false });
    }, 300);
  },

  onTouchStart(e) {
    this.startX = e.touches[0].clientX;
    this.startY = e.touches[0].clientY;
  },

  onTouchMove(e) {
    const dx = (e.touches[0].clientX - this.startX) * 1.3;
    const dy = (e.touches[0].clientY - this.startY) * 0.4;
    const rotate = dx * 0.08;

    let leftOpa = 0;
    let rightOpa = 0;
    let preview = { stamina: 0, money: 0, sanity: 0, rage: 0 };

    if (dx < -30) {
      leftOpa = Math.min(1, Math.abs(dx) / 120);
      preview = this.data.currentCard.left.impact;
    } else if (dx > 30) {
      rightOpa = Math.min(1, dx / 120);
      preview = this.data.currentCard.right.impact;
    }

    this.setData({
      'cardTransform.x': dx,
      'cardTransform.y': dy,
      'cardTransform.rotate': rotate,
      leftOpacity: leftOpa,
      rightOpacity: rightOpa,
      previewDiff: preview
    });
  },

  onTouchEnd() {
    const finalX = this.data.cardTransform.x;
    if (finalX < -110) {
      this.applyChoice('left');
    } else if (finalX > 110) {
      this.applyChoice('right');
    } else {
      this.setData({
        cardTransform: { x: 0, y: 0, rotate: 0 },
        leftOpacity: 0,
        rightOpacity: 0,
        previewDiff: { stamina: 0, money: 0, sanity: 0, rage: 0 }
      });
    }
  },

  chooseLeft() { this.applyChoice('left'); },
  chooseRight() { this.applyChoice('right'); },

  applyChoice(dir) {
    wx.$haptics.medium();
    wx.$audio.cardSelect();

    const choice = dir === 'left' ? this.data.currentCard.left : this.data.currentCard.right;
    const imp = choice.impact;

    this.setData({
      'cardTransform.x': dir === 'left' ? -700 : 700,
      'cardTransform.rotate': dir === 'left' ? -30 : 30
    });

    const nextStamina = Math.min(100, Math.max(0, this.data.stats.stamina + (imp.stamina || 0)));
    const nextMoney = Math.min(100, Math.max(0, this.data.stats.money + (imp.money || 0)));
    const nextSanity = Math.min(100, Math.max(0, this.data.stats.sanity + (imp.sanity || 0)));
    const nextRage = Math.min(100, Math.max(0, this.data.stats.rage + (imp.rage || 0)));
    
    const nextDay = this.data.currentDay + 1;

    setTimeout(() => {
      const nextStats = { stamina: nextStamina, money: nextMoney, sanity: nextSanity, rage: nextRage };
      this.setData({
        stats: nextStats,
        currentDay: nextDay
      });
      this.updateStyleBars(nextStats, nextDay);

      if (this.checkResult(nextStamina, nextMoney, nextSanity, nextRage, nextDay)) return;
      
      if (this.checkMilestones(nextDay)) return;
      if (Math.random() < 0.25 && nextDay > 3 && nextDay < 58) {
        this.triggerRandomEncounter();
        return;
      }

      this.cardIndex++;
      this.loadCard();
    }, 250);
  },

  checkMilestones(day) {
    if (day === 15 && !this.milestonesTriggered[15]) {
      this.milestonesTriggered[15] = true;
      this.triggerArcadeMilestone('🚗', 'DAY 15 强制大考：科目二倒车入库', '教练血压拉爆！必须通过科目二考核！', '/pages/arcade/drive/drive');
      return true;
    }
    if (day === 30 && !this.milestonesTriggered[30]) {
      this.milestonesTriggered[30] = true;
      this.triggerArcadeMilestone('🎒', 'DAY 30 特种兵集结：行李箱收纳', '特种兵夜爬泰山！必须完美收纳行囊！', '/pages/arcade/pack/pack');
      return true;
    }
    if (day === 45 && !this.milestonesTriggered[45]) {
      this.milestonesTriggered[45] = true;
      const randomGame = ARCADE_MINI_GAMES[Math.floor(Math.random() * ARCADE_MINI_GAMES.length)];
      this.triggerArcadeMilestone('🎯', 'DAY 45 暑期突发考核：命运街机挑战', `系统为你摇号选中了【${randomGame.name}】！准备迎战！`, randomGame.url);
      return true;
    }
    return false;
  },

  triggerRandomEncounter() {
    const randomGame = ARCADE_MINI_GAMES[Math.floor(Math.random() * ARCADE_MINI_GAMES.length)];
    const encounterTitles = [
      '⚡ 突发奇遇：深夜老妈查房危机！',
      '🚄 突发奇遇：12306 候补秒到票！',
      '⏰ 突发奇遇：生物钟濒临崩盘边缘！',
      '🧠 突发奇遇：多线程并发地狱考验！'
    ];
    const title = encounterTitles[Math.floor(Math.random() * encounterTitles.length)];

    wx.$haptics.heavy();
    wx.$audio.danger();
    this.setData({
      activeMilestone: {
        badge: `DAY ${this.data.currentDay} 随机突发事件`,
        title: title,
        desc: `触发随机街机历练【${randomGame.name}】！通关可获得巨额数值奖励，失败则惨遭扣除！`,
        icon: '🎲',
        url: randomGame.url
      }
    });
  },

  enterMilestoneArcade() {
    if (!this.data.activeMilestone) return;
    const url = this.data.activeMilestone.url;
    
    // 🌟 核心：在此处显式写入主线来源标记！
    wx.setStorageSync('ENTERED_FROM_MAIN', true);

    wx.$haptics.heavy();
    wx.$audio.btnClick();
    this.setData({ activeMilestone: null });
    wx.navigateTo({ url });
  },

  openGlobalTestMenu() {
    wx.$haptics.light();
    wx.showActionSheet({
      itemList: ARCADE_MINI_GAMES.map(g => `测试直达：${g.name}`),
      success: (res) => {
        const target = ARCADE_MINI_GAMES[res.tapIndex];
        if (target) {
          // 🌟 核心：测试直达也写入主线来源标记
          wx.setStorageSync('ENTERED_FROM_MAIN', true);
          wx.navigateTo({ url: target.url });
        }
      }
    });
  },

  skipMilestone() {
    wx.$haptics.medium();
    this.setData({ activeMilestone: null });
    const stats = this.data.stats;
    const nextStamina = Math.max(0, stats.stamina - 20);
    const nextRage = Math.min(100, stats.rage + 15);
    const nextStats = { ...stats, stamina: nextStamina, rage: nextRage };
    this.setData({ stats: nextStats });
    this.updateStyleBars(nextStats, this.data.currentDay);
    wx.showToast({ title: '临阵脱逃，老妈震怒！', icon: 'none' });
    this.cardIndex++;
    this.loadCard();
  },

  openAIDrawer() {
    wx.$haptics.light();
    wx.$audio.cardSlide();
    this.setData({
      isAIDrawerOpen: true,
      bargainInput: '',
      aiSpeechOutput: '',
      aiVerdictData: null,
      isAISubmitting: false,
      isStreaming: false
    });
  },

  closeAIDrawer() {
    wx.$haptics.light();
    this.setData({ isAIDrawerOpen: false });
  },

  onBargainInput(e) {
    this.setData({ bargainInput: e.detail.value });
  },

  usePresetText(e) {
    wx.$haptics.light();
    const text = e.currentTarget.dataset.text;
    this.setData({ bargainInput: text });
  },

  submitBargain() {
    const input = (this.data.bargainInput || '').trim();
    if (!input) {
      wx.showToast({ title: '先说点什么吧！', icon: 'none' });
      return;
    }
    if (this.data.isAISubmitting) return;

    wx.$haptics.medium();
    wx.$audio.btnClick();

    this.setData({
      isAISubmitting: true,
      isStreaming: true,
      aiSpeechOutput: '正在连线裁判法庭...',
      aiVerdictData: null
    });

    const role = this.data.currentCard.character.replace(/[^a-zA-Z\u4e00-\u9fa5]/g, '') || '审判员';

    wx.$ai.judgeDebate({
      eventTitle: this.data.currentCard.title,
      eventDesc: this.data.currentCard.desc,
      userBargain: input,
      currentRole: role,
      onChunk: (chunk, display) => {
        this.setData({ aiSpeechOutput: display });
      },
      onSuccess: (res) => {
        wx.$audio.success();
        wx.$haptics.success();

        this.setData({
          isAISubmitting: false,
          isStreaming: false,
          aiSpeechOutput: res.speech,
          aiVerdictData: res.data
        });

        if (wx.$storage && typeof wx.$storage.recordAIDebate === 'function') {
          wx.$storage.recordAIDebate({
            event: this.data.currentCard.title,
            bargain: input,
            speech: res.speech,
            passed: res.data.passed,
            title: res.data.title,
            isFallback: !!res.isFallback,
            data: res.data
          });
        }
      },
      onError: () => {
        this.setData({ isAISubmitting: false, isStreaming: false });
      }
    });
  },

  acceptVerdict() {
    if (!this.data.aiVerdictData) return;

    wx.$haptics.heavy();
    wx.$audio.cardSelect();

    const data = this.data.aiVerdictData;
    const stats = this.data.stats;

    const nextStamina = Math.min(100, Math.max(0, stats.stamina + (data.stamina || 0)));
    const nextMoney = Math.min(100, Math.max(0, stats.money + (data.money || 0)));
    const nextSanity = Math.min(100, Math.max(0, stats.sanity + (data.sanity || 0)));
    const nextRage = Math.min(100, Math.max(0, stats.rage + (data.momRage || 0)));
    
    const nextDay = this.data.currentDay + 1;

    this.setData({
      isAIDrawerOpen: false,
      showVerdictStamp: true,
      verdictStamp: { title: data.title || '辩解成立', passed: data.passed },
      stats: { stamina: nextStamina, money: nextMoney, sanity: nextSanity, rage: nextRage },
      currentDay: nextDay
    });

    this.updateStyleBars({ stamina: nextStamina, money: nextMoney, sanity: nextSanity, rage: nextRage }, nextDay);

    setTimeout(() => {
      this.setData({
        'cardTransform.y': -600,
        'cardTransform.rotate': 15
      });
      setTimeout(() => {
        if (this.checkResult(nextStamina, nextMoney, nextSanity, nextRage, nextDay)) return;
        if (this.checkMilestones(nextDay)) return;
        this.cardIndex++;
        this.loadCard();
      }, 250);
    }, 900);
  },

  checkResult(s, m, sa, r, day) {
    let ending = null;
    if (s <= 0) ending = ENDINGS.END_STAMINA_ZERO;
    else if (m <= 0) ending = ENDINGS.END_MONEY_ZERO;
    else if (sa <= 0) ending = ENDINGS.END_SANITY_ZERO;
    else if (r >= 100) ending = ENDINGS.END_MOM_RAGE;
    else if (day >= 60) ending = ENDINGS.END_SUMMER_VICTORY;

    if (ending) {
      wx.$storage.unlockEnding(ending.id);
      wx.$storage.recordSurvivalRun({ days: day, endingId: ending.id, stamina: s, money: m, sanity: sa, rage: r });
      wx.redirectTo({ url: `/pages/settlement/settlement?endingId=${ending.id}&days=${day}` });
      return true;
    }
    return false;
  }
});