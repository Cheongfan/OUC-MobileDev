Page({
  data: {
    isLogin: false,
    src: '',
    nickName: '',
    number: 0,
    newsList: []
  },

  onShow: function () {
    if (this.data.isLogin) {
      this.getMyFavorites();
    } else {
      this.setData({
        newsList: [],
        number: 0
      });
    }
  },

  // 获取微信个人信息登录
  getUserInfo: function () {
    let that = this;
    wx.getUserProfile({
      desc: '用于展示用户头像及昵称',
      success(res) {
        let user = res.userInfo;
        that.setData({
          isLogin: true,
          src: '/images/0.png',
          nickName: 'Cheongfan'
        });
        that.getMyFavorites();
      }
    });
  },

  // 💡 新增：退出登录逻辑
  logout: function () {
    let that = this;
    wx.showModal({
      title: '提示',
      content: '确定要退出登录吗？',
      confirmColor: '#328EEB',
      success(res) {
        if (res.confirm) {
          // 清空登录状态与页面展示的收藏列表
          that.setData({
            isLogin: false,
            src: '',
            nickName: '',
            number: 0,
            newsList: []
          });
          
          wx.showToast({
            title: '已退出登录',
            icon: 'success'
          });
        }
      }
    });
  },

  // 获取本地收藏夹列表
  getMyFavorites: function () {
    let info = wx.getStorageInfoSync();
    let myList = [];
    for (let i = 0; i < info.keys.length; i++) {
      let obj = wx.getStorageSync(info.keys[i]);
      if (obj && obj.id && obj.title) {
        myList.push(obj);
      }
    }
    this.setData({
      newsList: myList,
      number: myList.length
    });
  },

  goToDetail: function (e) {
    let id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: '../detail/detail?id=' + id,
    });
  }
})