var data = require('../../utils/data.js');

Page({
  data: { rankList: [] },

  onShow: function () {
    let unlocked = wx.getStorageSync('unlockedLevels') || 1;
    let myCompleted = unlocked - 1;
    let starsArr = wx.getStorageSync('levelStars') || [0,0,0,0,0,0,0,0,0];
    let myTotalStars = starsArr.reduce((a, b) => a + b, 0);
    let myName = wx.getStorageSync('userNickname') || '像素冒险家';

    // 取出 7 位好友基准数据
    let list = JSON.parse(JSON.stringify(data.friendsLeaderboard));

    // 注入当前玩家（“我”）的动态数据
    list.push({
      name: myName,
      avatar: '🤠',
      completedCount: myCompleted,
      stars: myTotalStars,
      isMe: true
    });

    // 双重多级降序排序规则：1. 通关关数高者优先；2. 通关数相同时，总星数高者优先
    list.sort((a, b) => {
      if (b.completedCount !== a.completedCount) {
        return b.completedCount - a.completedCount;
      }
      return b.stars - a.stars;
    });

    this.setData({ rankList: list });
  }
});