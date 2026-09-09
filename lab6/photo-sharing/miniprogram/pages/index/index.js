// pages/index/index.js
const app = getApp();

function getRelativeTime(timestamp) {
  if (!timestamp) return '刚刚';
  const diff = (Date.now() - timestamp) / 1000;
  if (diff < 60) return '刚刚';
  if (diff < 3600) return `${Math.floor(diff / 60)} 分钟前`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} 小时前`;
  return '昨天';
}

Page({
  data: {
    currentView: 'feed',
    photoList: [],
    isLoading: false,
    currentPlayingId: null,
    lastTapTime: 0,
    
    userProfile: {
      nickName: '胶片漫游者 (我)',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&q=80'
    },

    centerLat: 34.3416,
    centerLng: 108.9398,
    mapScale: 4,
    mapMarkers: [],
    selectedPhotoId: ''
  },

  onLoad: function () {
    this.ensureAudioPlayer();
    this.loadUserProfile();
    this.fetchPhotoList();
  },

  onShow: function () {
    this.loadUserProfile();
    this.fetchPhotoList();
  },

  onPullDownRefresh: function () {
    this.fetchPhotoList(() => {
      wx.stopPullDownRefresh();
    });
  },

  loadUserProfile: function () {
    if (app.globalData && app.globalData.userInfo) {
      this.setData({ userProfile: app.globalData.userInfo });
      return;
    }
    const profile = wx.getStorageSync('user_profile');
    if (profile) {
      this.setData({ userProfile: profile });
    }
  },

  navToMyArchive: function () {
    wx.navigateTo({
      url: '/pages/homepage/homepage?id=my_self_openid'
    });
  },

  /**
   * =======================================================
   * [教材核心考核点 1 & 2] 获取用户基础信息并调用云函数换取 openid
   * =======================================================
   */
  getUserInfo: function (e) {
    const rawUserInfo = e.detail.userInfo;
    if (rawUserInfo) {
      // 1. 尝试打印输出个人信息（对应教材图 19-14）
      console.log('✅ [教材考点] 成功获取用户微信基础信息:', rawUserInfo);
      
      // 2. 将个人信息存放到全局变量 globalData 中
      app.globalData.userInfo = rawUserInfo;
      wx.setStorageSync('user_profile', rawUserInfo);
      this.setData({ userProfile: rawUserInfo });
    }

    // 3. 检测是否已经获取过了用户 openid 信息（对应教材 19.3.1 节第 2 小节）
    if (!app.globalData.openid && wx.cloud) {
      wx.showLoading({ title: '同步身份中...', mask: true });
      wx.cloud.callFunction({
        name: 'getOpenid',
        complete: res => {
          wx.hideLoading();
          if (res.result && res.result.openid) {
            console.log('✅ [教材考点] 成功调用云函数获取用户 openid:', res.result.openid);
            app.globalData.openid = res.result.openid;
          } else {
            console.warn('云函数未就绪，使用会话 openid 备用');
            app.globalData.openid = 'user_self_default';
          }
          // 4. 跳转至发布图片页面（对应教材 goToAdd 逻辑）
          this.goToAdd();
        }
      });
    } else {
      this.goToAdd();
    }
  },

  goToAdd: function () {
    wx.navigateTo({
      url: '/pages/add/add'
    });
  },

  ensureAudioPlayer: function () {
    if (!app.globalData) app.globalData = {};
    if (!app.globalData.innerAudioContext) {
      const audio = wx.createInnerAudioContext();
      audio.obeyMuteSwitch = false;
      app.globalData.innerAudioContext = audio;
    }
    const player = app.globalData.innerAudioContext;
    player.onEnded(() => {
      this.setData({ currentPlayingId: null });
    });
    player.onError((err) => {
      console.error('音频解码错误:', err);
      this.setData({ currentPlayingId: null });
    });
  },

  fetchPhotoList: function (callback) {
    this.setData({ isLoading: true });
    const localPosts = wx.getStorageSync('my_custom_posts') || [];

    if (wx.cloud) {
      const db = wx.cloud.database();
      db.collection('photos')
        .orderBy('createTime', 'desc')
        .limit(30)
        .get()
        .then(res => {
          const cloudList = res.data || [];
          console.log('📡 [云端真实数据] 成功从数据库获取条数:', cloudList.length);

          const combinedMap = new Map();
          localPosts.forEach(item => combinedMap.set(item._id, item));
          cloudList.forEach(item => combinedMap.set(item._id, item));
          const finalCombinedList = Array.from(combinedMap.values());

          this.renderList(finalCombinedList, callback);
        })
        .catch(err => {
          console.error('❌ 拉取云端列表失败，请核实 photos 权限为所有用户可读:', err);
          this.renderList(localPosts, callback);
        });
    } else {
      this.renderList(localPosts, callback);
    }
  },

  renderList: function (list, callback) {
    const developedIds = wx.getStorageSync('developed_photo_ids') || [];
    const formattedList = list.map(item => ({
      ...item,
      relativeTime: getRelativeTime(item.createTime),
      isBlurred: item.isBlurred && !developedIds.includes(item._id)
    }));

    this.setData({
      photoList: formattedList,
      isLoading: false
    }, () => {
      this.buildMapMarkers(formattedList);
      if (callback) callback();
    });
  },

  buildMapMarkers: function (list) {
    const validPhotos = list.filter(item => item.location && item.location.latitude);
    const markers = validPhotos.map((item, index) => ({
      id: index,
      latitude: item.location.latitude,
      longitude: item.location.longitude,
      width: 20,
      height: 20,
      customCallout: {
        anchorY: 10,
        anchorX: 0,
        display: 'ALWAYS'
      },
      customData: item
    }));

    this.setData({
      mapMarkers: markers,
      mapScale: 4,
      centerLat: 34.3416,
      centerLng: 108.9398,
      selectedPhotoId: validPhotos[0] ? validPhotos[0]._id : ''
    });
  },

  forceInjectSeeds: function () {
    wx.showLoading({ title: '正在注入云数据...', mask: true });
    const db = wx.cloud.database();
    
    const seeds = [
      {
        photoUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80',
        caption: '海浪拍打礁石的声音，晚风路过橘子色的海。',
        voiceUrl: 'https://web-ext-storage.dcloud.net.cn/uni-app/uni-test-audio.mp3',
        voiceDuration: 6,
        location: { placeName: '三亚 · 太阳湾度假区', latitude: 18.213, longitude: 109.638 },
        isBlurred: true,
        likeCount: 42,
        likedUsers: [],
        userInfo: { nickName: '海风旅人', avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&q=80' },
        _openid: 'user_haifeng_sanya',
        addDate: '2026-09-07',
        createTime: Date.now() - 1000 * 3600 * 5
      },
      {
        photoUrl: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800&q=80',
        caption: '雨夜街角的小酒馆，咖啡香气混着民谣吉他。',
        voiceUrl: 'https://web-ext-storage.dcloud.net.cn/uni-app/uni-test-audio.mp3',
        voiceDuration: 8,
        location: { placeName: '上海 · 武康大楼', latitude: 31.205, longitude: 121.442 },
        isBlurred: false,
        likeCount: 18,
        likedUsers: [],
        userInfo: { nickName: '胶片小贝', avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&q=80' },
        _openid: 'user_xiaobei_shanghai',
        addDate: '2026-09-07',
        createTime: Date.now() - 1000 * 3600 * 3
      }
    ];

    Promise.all(seeds.map(s => db.collection('photos').add({ data: s }))).then(() => {
      wx.hideLoading();
      wx.showToast({ title: '已注入并刷新！', icon: 'success' });
      this.fetchPhotoList();
    }).catch(err => {
      wx.hideLoading();
      console.error(err);
      wx.showModal({ title: '注入失败', content: '请先在控制台把 photos 集合权限改为“所有用户可读写”再试', showCancel: false });
    });
  },

  switchView: function (e) {
    const mode = e.currentTarget.dataset.mode;
    this.setData({ currentView: mode });
  },

  handlePhotoTap: function (e) {
    const curTime = e.timeStamp;
    const lastTime = this.data.lastTapTime;
    const { id, index } = e.currentTarget.dataset;

    if (curTime - lastTime < 350) {
      this.triggerDoubleTapLike(id, index);
    } else {
      setTimeout(() => {
        if (this.data.lastTapTime === curTime) {
          this.navToDetailDirect(id);
        }
      }, 300);
    }
    this.setData({ lastTapTime: curTime });
  },

  triggerDoubleTapLike: function (photoId, index) {
    const animKey = `photoList[${index}].showHeartAnim`;
    this.setData({ [animKey]: true });
    setTimeout(() => {
      this.setData({ [animKey]: false });
    }, 800);

    if (!this.data.photoList[index].isLiked) {
      this.handleLikeCore(photoId, index);
    }
  },

  handleLike: function (e) {
    const { id, index } = e.currentTarget.dataset;
    this.handleLikeCore(id, index);
  },

  handleLikeCore: function (photoId, index) {
    const currentPhoto = this.data.photoList[index];
    const prevLiked = currentPhoto.isLiked;
    const prevCount = currentPhoto.likeCount || 0;

    this.setData({
      [`photoList[${index}].isLiked`]: !prevLiked,
      [`photoList[${index}].likeCount`]: prevLiked ? Math.max(0, prevCount - 1) : prevCount + 1
    });

    try { wx.vibrateShort({ type: 'light' }); } catch (e) {}

    if (wx.cloud && photoId) {
      wx.cloud.callFunction({
        name: 'toggleLike',
        data: { photoId: photoId }
      }).catch(console.error);
    }
  },

  togglePlayVoice: function (e) {
    const { voice, id } = e.currentTarget.dataset;
    const player = app.globalData.innerAudioContext;

    if (!voice) return;

    if (this.data.currentPlayingId === id) {
      player.stop();
      this.setData({ currentPlayingId: null });
    } else {
      player.stop();
      this.setData({ currentPlayingId: id });
      player.src = voice;
      player.play();
    }
  },

  locateToPhoto: function (e) {
    const item = e.currentTarget.dataset.item;
    if (!item.location) return;

    this.setData({
      centerLat: item.location.latitude,
      centerLng: item.location.longitude,
      mapScale: 12,
      selectedPhotoId: item._id
    });
    try { wx.vibrateShort({ type: 'light' }); } catch(e){}
  },

  onMarkerTap: function (e) {
    const markerId = e.detail.markerId;
    const marker = this.data.mapMarkers.find(m => m.id === markerId);
    if (marker && marker.customData) {
      this.setData({
        selectedPhotoId: marker.customData._id,
        centerLat: marker.latitude,
        centerLng: marker.longitude,
        mapScale: 12
      });
    }
  },

  navToAuthor: function (e) {
    const openid = e.currentTarget.dataset.openid;
    wx.navigateTo({
      url: `/pages/homepage/homepage?id=${openid}`
    });
  },

  navToDetailDirect: function (photoId) {
    wx.navigateTo({
      url: `/pages/detail/detail?id=${photoId}`
    });
  },

  navToDetail: function (e) {
    const id = e.currentTarget.dataset.id;
    this.navToDetailDirect(id);
  }
});