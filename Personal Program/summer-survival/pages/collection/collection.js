const ENDINGS = require('../../utils/endingsData');

Page({
  data: {
    endingsList: [],
    unlockedCount: 0,
    totalCount: 0,
    activeModal: null,
    progressStyle: 'width: 0%;',
    currentTab: 'endings', // 新增：'endings' | 'quotes'
    quotesList: []          // 新增：AI 辩解语录列表
  },

  onShow() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ selected: 2 });
    }
    this.loadCollectionData();
  },

  loadCollectionData() {
    const unlockedIds = wx.$storage.getUnlockedEndings();
    const allEndings = Object.values(ENDINGS);

    const list = allEndings.map(item => {
      const isUnlocked = unlockedIds.includes(item.id);
      return Object.assign({}, item, { unlocked: isUnlocked });
    });

    const percent = Math.round((unlockedIds.length / allEndings.length) * 100);

    // 🌟 获取已持久化的口胡战绩语录
    const quotes = (wx.$storage && typeof wx.$storage.getAIQuotes === 'function') 
      ? wx.$storage.getAIQuotes() 
      : [];

    this.setData({
      endingsList: list,
      unlockedCount: unlockedIds.length,
      totalCount: allEndings.length,
      progressStyle: `width: ${percent}%;`,
      quotesList: quotes
    });
  },

  switchTab(e) {
    const tab = e.currentTarget.dataset.tab;
    if (tab === this.data.currentTab) return;
    if (wx.$haptics) wx.$haptics.light();
    if (wx.$audio) wx.$audio.btnClick();
    this.setData({ currentTab: tab });
  },

  inspectEnding(e) {
    const item = e.currentTarget.dataset.item;
    if (!item.unlocked) {
      if (wx.$haptics) wx.$haptics.heavy();
      if (wx.$audio) wx.$audio.cardSlide();
      wx.showToast({
        title: '尚未解锁！去生存主线多探索吧',
        icon: 'none'
      });
      return;
    }

    if (wx.$haptics) wx.$haptics.light();
    if (wx.$audio) wx.$audio.btnClick();
    this.setData({ activeModal: item });
  },

  closeModal() {
    if (wx.$haptics) wx.$haptics.light();
    this.setData({ activeModal: null });
  },

  preventBubble() {}
});