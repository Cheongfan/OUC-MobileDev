Page({
  data: {
    stats: {
      completedCount: 0,
      progressPercent: 0,
      progressStyle: 'width: 0%;',
      totalSteps: 0,
      totalStars: 0,
      threeStarCount: 0,
      undoCount: 0,
      bestTimeStr: '--:--',
      customMapCount: 0
    }
  },

  onShow: function () {
    let starsArr = wx.getStorageSync('levelStars') || [0,0,0,0,0,0,0,0,0];
    let unlocked = wx.getStorageSync('unlockedLevels') || 1;
    let completed = unlocked - 1;
    let totalStars = starsArr.reduce((a, b) => a + b, 0);
    let threeStars = starsArr.filter(s => s === 3).length;
    let steps = wx.getStorageSync('totalStepsCount') || 0;
    let undo = wx.getStorageSync('totalUndoCount') || 0;
    let bestTime = wx.getStorageSync('bestTimeSec') || 0;
    let customMap = wx.getStorageSync('customMap') ? 1 : 0;

    let timeStr = '--:--';
    if (bestTime > 0) {
      let m = Math.floor(bestTime / 60);
      let s = bestTime % 60;
      timeStr = (m < 10 ? '0' + m : m) + ':' + (s < 10 ? '0' + s : s);
    }

    let pct = Math.round((completed / 9) * 100);

    this.setData({
      stats: {
        completedCount: completed,
        progressPercent: pct,
        progressStyle: 'width: ' + pct + '%;', // 消除 WXML 行内样式检查报错
        totalSteps: steps,
        totalStars: totalStars,
        threeStarCount: threeStars,
        undoCount: undo,
        bestTimeStr: timeStr,
        customMapCount: customMap
      }
    });
  }
});