// pages/arcade/arcade.js
Page({
  data: {
    scores: {}
  },

  onShow() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ selected: 1 });
    }

    const scores = wx.$storage.getMiniGameScores();
    this.setData({ scores });
  },

  playGame(e) {
    const url = e.currentTarget.dataset.url;
    if (!url) return;

    if (wx.$haptics) wx.$haptics.medium();
    if (wx.$audio) wx.$audio.btnClick();

    wx.navigateTo({
      url: url,
      fail: (err) => {
        console.error('跳转小游戏失败：', err);
      }
    });
  }
});