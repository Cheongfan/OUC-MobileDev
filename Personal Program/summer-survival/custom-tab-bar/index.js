Component({
  data: {
    selected: 0,
    list: [
      { pagePath: "/pages/index/index", text: "主页", icon: "🏠" },
      { pagePath: "/pages/arcade/arcade", text: "游戏厅", icon: "🕹️" },
      { pagePath: "/pages/collection/collection", text: "成就", icon: "🏆" },
      { pagePath: "/pages/ranking/ranking", text: "排行榜", icon: "🥇" },
      { pagePath: "/pages/profile/profile", text: "我的", icon: "👤" }
    ]
  },
  methods: {
    switchTab(e) {
      const data = e.currentTarget.dataset;
      const url = data.path;
      if (this.data.selected === data.index) return;

      if (wx.$haptics) wx.$haptics.light();
      if (wx.$audio) wx.$audio.btnClick();

      wx.switchTab({ url });
    }
  }
});