Page({
  data: {
    progress: 0,
    isLoaded: false,
    logoReady: true
  },

  onLoad: function () {
    this.startLoadingSimulation();
  },

  startLoadingSimulation: function () {
    let p = 0;
    let timer = setInterval(() => {
      p += Math.floor(Math.random() * 15) + 10;
      if (p >= 100) {
        p = 100;
        clearInterval(timer);
        this.setData({ progress: 100, isLoaded: true });
      } else {
        this.setData({ progress: p });
      }
    }, 150);
  },

  enterHome: function () {
    wx.redirectTo({
      url: '/pages/index/index'
    });
  }
});