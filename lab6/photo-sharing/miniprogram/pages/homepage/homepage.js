// pages/homepage/homepage.js
Page({
  data: {
    authorOpenid: '',
    authorInfo: {
      nickName: '胶片旅人',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&q=80'
    },
    authorPhotos: [],
    totalLikes: 0,
    isLoading: true
  },

  onLoad: function (options) {
    const targetId = options.id || 'my_self_openid';
    this.setData({ authorOpenid: targetId });
  },

  onShow: function () {
    if (this.data.authorOpenid) {
      this.fetchAuthorDataFromCloud(this.data.authorOpenid);
    }
  },

  fetchAuthorDataFromCloud: function (openid) {
    wx.showLoading({ title: '加载影集中...' });
    const db = wx.cloud.database();

    // 1. 若为当前登录者自己
    if (openid === 'my_self_openid') {
      const myProfile = wx.getStorageSync('user_profile') || {
        nickName: '胶片漫游者 (我)',
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&q=80'
      };

      db.collection('photos')
        .where({ _openid: '{openid}' })
        .orderBy('createTime', 'desc')
        .get()
        .then(res => {
          wx.hideLoading();
          const photos = res.data || [];
          const likes = photos.reduce((acc, cur) => acc + (cur.likeCount || 0), 0);
          this.setData({
            authorInfo: myProfile,
            authorPhotos: photos,
            totalLikes: likes,
            isLoading: false
          });
        })
        .catch(() => {
          wx.hideLoading();
          this.setData({ authorInfo: myProfile, authorPhotos: [], isLoading: false });
        });
      return;
    }

    // 2. 查其他创作者（动态匹配，查谁是谁）
    db.collection('photos')
      .where({ _openid: openid })
      .orderBy('createTime', 'desc')
      .get()
      .then(res => {
        wx.hideLoading();
        const photos = res.data || [];
        
        if (photos.length > 0) {
          const author = photos[0].userInfo || {
            nickName: '时空旅人',
            avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&q=80'
          };
          const likes = photos.reduce((acc, cur) => acc + (cur.likeCount || 0), 0);

          this.setData({
            authorInfo: author,
            authorPhotos: photos,
            totalLikes: likes,
            isLoading: false
          });
        } else {
          this.setData({ authorPhotos: [], totalLikes: 0, isLoading: false });
        }
      })
      .catch(err => {
        console.error('拉取创作者作品失败:', err);
        wx.hideLoading();
        this.setData({ isLoading: false });
      });
  },

  navToDetail: function (e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/detail/detail?id=${id}`
    });
  }
});