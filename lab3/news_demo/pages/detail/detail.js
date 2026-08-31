// 注意引用的层级路径是 ../../utils/common.js
var common = require('../../utils/common.js')

Page({
  data: {
    article: {},
    isAdd: false
  },

  onLoad: function (options) {
    let id = options.id;
    console.log("详情页接收到的新闻ID:", id);

    // 如果没拿到 ID，直接拦截
    if (!id) {
      console.error("错误：未获取到新闻ID");
      return;
    }

    // 1. 检查当前新闻是否在本地收藏缓存中
    var newarticle = wx.getStorageSync(id);

    if (newarticle && newarticle.id) {
      console.log("从本地收藏中读取新闻成功:", newarticle);
      this.setData({
        isAdd: true,
        article: newarticle
      });
    } 
    // 2. 如果未收藏，则从 common.js 中查找
    else {
      let result = common.getNewsDetail(id);
      console.log("从 common.js 获取新闻结果:", result);

      if (result.code == '200') {
        this.setData({
          article: result.news,
          isAdd: false
        });
      } else {
        console.error("common.js 中未找到 ID 为 " + id + " 的新闻");
      }
    }
  },

  // 添加收藏
  addFavorites: function () {
    let article = this.data.article;
    wx.setStorageSync(article.id.toString(), article);
    this.setData({
      isAdd: true
    });
    wx.showToast({
      title: '已加入收藏',
      icon: 'success'
    });
  },

  // 取消收藏
  cancelFavorites: function () {
    let article = this.data.article;
    wx.removeStorageSync(article.id.toString());
    this.setData({
      isAdd: false
    });
    wx.showToast({
      title: '已取消收藏',
      icon: 'none'
    });
  },

  // 转发给好友
  onShareAppMessage: function () {
    return {
      title: this.data.article.title || '海大新闻',
      path: '/pages/detail/detail?id=' + this.data.article.id
    }
  }
})