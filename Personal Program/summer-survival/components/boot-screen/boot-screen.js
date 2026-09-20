Component({
  data: {
    isVisible: true,
    isBooting: true,
    bootProgress: 0,
    bootLog: 'CHECKING MEMORY...'
  },

  lifetimes: {
    attached() {
      // 检查当前会话是否已经播放过开屏动画
      const app = getApp();
      if (app.globalData.hasPlayedBoot) {
        this.setData({ isVisible: false, isBooting: false });
        return;
      }
      app.globalData.hasPlayedBoot = true;
      this.runBootSequence();
    }
  },

  methods: {
    runBootSequence() {
      const logs = [
        'LOADING SUMMER SCRIPTS...',
        'CHECKING MOM RAGE SENSORS...',
        'INITIALIZING NEO-BRUTALISM ENGINE...',
        'READY TO SURVIVE!'
      ];
      let p = 0;
      let logIndex = 0;

      this.timer = setInterval(() => {
        p += 15;
        if (p % 30 === 0 && logIndex < logs.length - 1) {
          logIndex++;
        }
        if (p >= 100) {
          clearInterval(this.timer);
          this.setData({ bootProgress: 100, bootLog: logs[logs.length - 1] });
          wx.$haptics.success();
          setTimeout(() => {
            this.setData({ isBooting: false });
            setTimeout(() => this.setData({ isVisible: false }), 400);
          }, 300);
        } else {
          this.setData({ bootProgress: p, bootLog: logs[logIndex] });
        }
      }, 70);
    },

    skipBoot() {
      if (this.timer) clearInterval(this.timer);
      this.setData({ isBooting: false });
      setTimeout(() => this.setData({ isVisible: false }), 400);
    }
  }
});