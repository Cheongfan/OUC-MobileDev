// pages/about/about.js
Page({
  data: {
    repoUrl: 'https://github.com/Cheongfan/OUC-MobileDev',
    blogUrl: 'https://cheongfan.github.io/',
    eggCount: 0
  },

  copyRepoUrl() {
    wx.$haptics.medium();
    wx.$audio.btnClick();
    wx.setClipboardData({
      data: this.data.repoUrl,
      success: () => {
        wx.showToast({ title: '开源仓库地址已复制！', icon: 'success' });
      }
    });
  },

  copyBlogUrl() {
    wx.$haptics.medium();
    wx.$audio.btnClick();
    wx.setClipboardData({
      data: this.data.blogUrl,
      success: () => {
        wx.showToast({ title: '个人博客地址已复制！', icon: 'success' });
      }
    });
  },

  onEggClick() {
    wx.$haptics.light();
    let current = this.data.eggCount + 1;
    this.setData({ eggCount: current });

    if (current === 5) {
      wx.$haptics.success();
      wx.$audio.success();
      wx.showModal({
        title: '🎉 触发主创彩蛋',
        content: '“祝你科目二一把过，暑假旅行永不晚点，吃再多夜宵也不长胖！”',
        showCancel: false,
        confirmText: '收到祝福'
      });
      this.setData({ eggCount: 0 });
    }
  }
});