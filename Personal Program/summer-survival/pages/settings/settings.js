Page({
  data: {
    settings: {
      haptics: true,
      vibrationIntensity: 'medium',
      sfx: true,
      manualNightMode: false
    },
    devTapCount: 0,

    // AI 中继监控状态
    proxyUrl: '',
    isPinging: false,
    pingStatus: {
      online: true,
      text: '就绪 / 自动降级',
      latencyText: ''
    },
    aiStats: {
      totalRequests: 0,
      fallbackCount: 0,
      passedCount: 0
    },
    // 安全预计算字段，避免 WXML 发生除法运算
    fallbackPctText: '0%'
  },

  onShow() {
    this.refreshSettingsData();
  },

  refreshSettingsData() {
    const current = wx.$storage.getSettings() || {};
    const proxy = (wx.$ai && typeof wx.$ai.getProxyUrl === 'function') 
      ? wx.$ai.getProxyUrl() 
      : (wx.getStorageSync('AI_PROXY_URL') || 'http://127.0.0.1:3000');
    const stats = (wx.$storage && typeof wx.$storage.getAIDebateStats === 'function')
      ? wx.$storage.getAIDebateStats()
      : { totalRequests: 0, fallbackCount: 0, passedCount: 0 };

    let pct = '0%';
    if (stats.totalRequests > 0) {
      pct = Math.round((stats.fallbackCount / stats.totalRequests) * 100) + '%';
    }

    this.setData({
      settings: Object.assign({
        haptics: true,
        vibrationIntensity: 'medium',
        sfx: true,
        manualNightMode: false
      }, current),
      proxyUrl: proxy,
      aiStats: stats,
      fallbackPctText: pct
    });
  },

  onHapticsToggle(e) {
    const enabled = e.detail.value;
    wx.$storage.saveSettings({ haptics: enabled });
    this.setData({ 'settings.haptics': enabled });
    if (enabled && wx.$haptics) wx.$haptics.success();
  },

  onIntensityChange(e) {
    const intensity = e.currentTarget.dataset.val;
    wx.$storage.saveSettings({ vibrationIntensity: intensity });
    this.setData({ 'settings.vibrationIntensity': intensity });
    if (wx.$haptics) wx.$haptics.vibrate(intensity);
    if (wx.$audio) wx.$audio.btnClick();
  },

  onSfxToggle(e) {
    const enabled = e.detail.value;
    wx.$storage.saveSettings({ sfx: enabled });
    this.setData({ 'settings.sfx': enabled });
    if (enabled && wx.$audio) wx.$audio.cardSelect();
  },

  onNightToggle(e) {
    const enabled = e.detail.value;
    wx.$storage.saveSettings({ manualNightMode: enabled });
    this.setData({ 'settings.manualNightMode': enabled });
    if (wx.$haptics) wx.$haptics.light();
    if (wx.$audio) wx.$audio.cardSlide();
  },

  // ================= AI 中继连通性探测 =================
  onProxyInput(e) {
    const val = (e.detail.value || '').trim();
    this.setData({ proxyUrl: val });
    if (wx.$ai && typeof wx.$ai.setProxyUrl === 'function') {
      wx.$ai.setProxyUrl(val);
    } else {
      wx.setStorageSync('AI_PROXY_URL', val);
    }
  },

  pingProxy() {
    if (this.data.isPinging) return;
    if (wx.$haptics) wx.$haptics.light();
    if (wx.$audio) wx.$audio.btnClick();

    this.setData({
      isPinging: true,
      'pingStatus.text': '探测云容器...',
      'pingStatus.latencyText': ''
    });

    wx.$ai.ping((err, latency) => {
      if (!err) {
        this.setData({
          isPinging: false,
          pingStatus: {
            online: true,
            text: '云托管在线',
            latencyText: `${latency}ms`
          }
        });
        if (wx.$audio) wx.$audio.success();
        if (wx.$haptics) wx.$haptics.success();
      } else {
        this.setData({
          isPinging: false,
          pingStatus: {
            online: false,
            text: '云容器离线 (降级运作)',
            latencyText: '熔断保护'
          }
        });
        if (wx.$haptics) wx.$haptics.failure();
      }
    });
  },

  confirmResetData() {
    if (wx.$haptics) wx.$haptics.heavy();
    if (wx.$audio) wx.$audio.danger();

    wx.showModal({
      title: '🚨 确认重置全部数据？',
      content: '该操作将抹除所有已解锁的暑假结局、AI 辩解战绩、小游戏记录，无法撤回！',
      confirmColor: '#FF5353',
      success: (res) => {
        if (res.confirm) {
          wx.$storage.clearAllData();
          if (wx.$haptics) wx.$haptics.success();
          wx.showToast({ title: '已恢复出厂状态', icon: 'success' });
          this.refreshSettingsData();
        }
      }
    });
  },

  onVersionTap() {
    if (wx.$haptics) wx.$haptics.light();
    let current = this.data.devTapCount + 1;
    this.setData({ devTapCount: current });

    if (current >= 5) {
      if (wx.$haptics) wx.$haptics.heavy();
      if (wx.$audio) wx.$audio.success();
      this.setData({ devTapCount: 0 });

      wx.showActionSheet({
        itemList: [
          '⚡ 开发者特权：一键解锁全结局图鉴',
          '🚀 作弊指令：清除小游戏最高分',
          '🤖 AI 指令：重置辩解推演统计'
        ],
        success: (sheetRes) => {
          if (sheetRes.tapIndex === 0) {
            const allDummyEndings = ['END_STAMINA_ZERO', 'END_MONEY_ZERO', 'END_SANITY_ZERO', 'END_MOM_RAGE', 'END_SUMMER_VICTORY'];
            allDummyEndings.forEach(id => wx.$storage.unlockEnding(id));
            wx.showToast({ title: '已解锁全图鉴！', icon: 'success' });
          } else if (sheetRes.tapIndex === 1) {
            wx.removeStorageSync('SUMMER_MINI_SCORES');
            wx.showToast({ title: '小游戏榜单已重置' });
          } else if (sheetRes.tapIndex === 2) {
            wx.removeStorageSync('SUMMER_AI_STATS');
            wx.removeStorageSync('SUMMER_AI_QUOTES');
            this.refreshSettingsData();
            wx.showToast({ title: 'AI 统计已重置' });
          }
        }
      });
    }
  }
});