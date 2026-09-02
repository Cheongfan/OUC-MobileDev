var audioManager = require('../../utils/audio.js');

Page({
  data: {
    soundEnabled: true,
    fbText: ''
  },

  onLoad: function () {
    this.setData({
      soundEnabled: audioManager.soundEnabled
    });
  },

  toggleSound: function (e) {
    let enabled = e.detail.value;
    audioManager.setSoundEnabled(enabled);
    this.setData({ soundEnabled: enabled });
    wx.showToast({ title: enabled ? '音效已开启' : '音效已关闭', icon: 'none' });
  },

  clearData: function () {
    wx.showModal({
      title: '重置警告',
      content: '确定要清除所有本地通关记录、星级和金币吗？',
      success: (res) => {
        if (res.confirm) {
          wx.clearStorageSync();
          wx.showToast({ title: '已清空本地数据', icon: 'success' });
        }
      }
    });
  },

  onFbInput: function (e) {
    this.setData({ fbText: e.detail.value });
  },

  submitFeedback: function () {
    if (this.data.fbText.trim().length < 10) {
      wx.showToast({ title: '反馈内容不能少于 10 字！', icon: 'none' });
      return;
    }
    wx.showToast({ title: '提交成功，感谢反馈！', icon: 'success' });
    this.setData({ fbText: '' });
  }
});