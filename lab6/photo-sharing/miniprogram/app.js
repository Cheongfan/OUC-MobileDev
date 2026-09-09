// app.js
App({
  onLaunch: function () {
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力');
    } else {
      wx.cloud.init({
        traceUser: true
      });
      // 启动时静默尝试触发一次 initData 云函数（已导入数据则秒过，未导入则自动写入）
      this.triggerCloudInit();
    }

    this.globalData = {
      userInfo: null,
      openid: null,
      innerAudioContext: null
    };

    this.initAudioPlayer();
  },

  initAudioPlayer: function () {
    const audio = wx.createInnerAudioContext();
    audio.obeyMuteSwitch = false;
    this.globalData.innerAudioContext = audio;
  },

  triggerCloudInit: function () {
    wx.cloud.callFunction({
      name: 'initData',
      data: { force: false }
    }).then(res => {
      console.log('云端数据状态就绪:', res.result);
    }).catch(err => {
      // 若尚未部署 initData，也不影响控制台手动导入的数据正常读取
      console.log('若已在控制台导入 JSON 则无需关注此提示');
    });
  }
});