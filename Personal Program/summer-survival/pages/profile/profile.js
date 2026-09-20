// pages/profile/profile.js
Page({
  data: {
    stats: { totalRuns: 0, maxDays: 0, unlockedCount: 0 },
    userInfo: {
      nickName: '微信授权用户',
      major: '待绑定专业',
      isLoggedIn: false
    }
  },

  onShow() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ selected: 4 });
    }
    const globalStats = wx.$storage.getGlobalStats();
    
    // 读取本地缓存的用户登录态
    const cachedUser = wx.getStorageSync('SUMMER_USER_PROFILE') || {
      nickName: '微信授权用户',
      major: '待绑定专业',
      isLoggedIn: false
    };

    this.setData({ 
      stats: globalStats,
      userInfo: cachedUser
    });
  },

  // 模拟微信授权登录弹窗
  handleWechatLogin() {
    if (this.data.userInfo.isLoggedIn) {
      wx.showToast({ title: '已完成微信授权登录', icon: 'success' });
      return;
    }

    wx.showModal({
      title: '微信授权提示',
      content: '小程序将申请获取您的微信头像、昵称及公开基本信息用于同步暑假生存档案。',
      confirmText: '允许授权',
      cancelText: '拒绝',
      success: (res) => {
        if (res.confirm) {
          if (wx.$haptics) wx.$haptics.success();
          if (wx.$audio) wx.$audio.success();

          const loggedUser = {
            nickName: 'Cheongfan',
            major: '计算机科学与技术',
            isLoggedIn: true
          };

          wx.setStorageSync('SUMMER_USER_PROFILE', loggedUser);
          this.setData({ userInfo: loggedUser });

          wx.showToast({ title: '授权登录成功！', icon: 'success' });
        }
      }
    });
  },

  navTo(e) {
    const url = e.currentTarget.dataset.url;
    wx.$haptics.light();
    wx.$audio.btnClick();
    wx.navigateTo({ url });
  }
});