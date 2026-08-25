Page({
    data: {
      message: "Hello World",
      count: 0,
      greetings: [
        "Hello World",
        "你好，中国海洋大学！",
        "欢迎来到《移动软件开发》课堂",
        "微信小程序开发之旅开启！"
      ],
      currentIndex: 0,
      loaded: false,      // 控制动画触发
      navTop: 20,         // 胶囊顶部距离
      navHeight: 32,      // 胶囊高度
      headerPaddingTop: 90// 页面顶部避让距离
    },
  
    onLoad: function () {
      const menuButton = wx.getMenuButtonBoundingClientRect();
      const totalHeight = menuButton.top + menuButton.height + 12;
      this.setData({
        navTop: menuButton.top,
        navHeight: menuButton.height,
        headerPaddingTop: totalHeight
      });
    },
  
    onReady: function () {
      this.setData({
        loaded: true
      });
    },
  
    changeText: function () {
      let nextIndex = (this.data.currentIndex + 1) % this.data.greetings.length;
      this.setData({
        currentIndex: nextIndex,
        message: this.data.greetings[nextIndex],
        count: this.data.count + 1
      });
    },
  
    resetAll: function () {
      this.setData({
        message: "Hello World",
        count: 0,
        currentIndex: 0
      });
      wx.showToast({
        title: '已重置',
        icon: 'success',
        duration: 1000
      });
    }
  });