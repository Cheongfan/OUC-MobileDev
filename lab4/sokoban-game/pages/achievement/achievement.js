var data = require('../../utils/data.js');

Page({
  data: { list: [] },

  onShow: function () {
    let unlockedLevel = wx.getStorageSync('unlockedLevels') || 1;
    let completedCount = unlockedLevel - 1;
    let starsArr = wx.getStorageSync('levelStars') || [0,0,0,0,0,0,0,0,0];
    let threeStarCount = starsArr.filter(s => s === 3).length;
    let undoCount = wx.getStorageSync('totalUndoCount') || 0;
    let hasCustomMap = wx.getStorageSync('customMap') ? 1 : 0;

    let configs = JSON.parse(JSON.stringify(data.achievements));

    configs.forEach(item => {
      let currentVal = 0;
      if (item.id === 'first_win') currentVal = completedCount >= 1 ? 1 : 0;
      else if (item.id === 'master_win') currentVal = completedCount;
      else if (item.id === 'perfect_star') currentVal = threeStarCount;
      else if (item.id === 'undo_master') currentVal = undoCount;
      else if (item.id === 'creator') currentVal = hasCustomMap;

      item.current = Math.min(currentVal, item.target);
      item.percent = Math.round((item.current / item.target) * 100);
      // 在 JS 中生成格式化的样式字符串，解决 WXML Linter 误报问题
      item.progressStyle = 'width: ' + item.percent + '%;';
      item.unlocked = item.current >= item.target;
    });

    this.setData({ list: configs });
  }
});