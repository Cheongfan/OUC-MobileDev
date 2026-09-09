// pages/add/add.js
const app = getApp();
const recorderManager = wx.getRecorderManager();
let recordTimer = null;
let recordStartTime = 0;
let isTouchMode = false;

Page({
  data: {
    tempPhotoPath: '',
    caption: '',
    
    isRecording: false,
    currentRecordSec: 0,
    tempVoicePath: '',
    voiceDuration: 0,
    voiceRecordText: '轻触或长按录制现场声音',
    isPlayingVoice: false,

    latitude: null,
    longitude: null,
    placeName: '',

    isBlurred: false,
    canSubmit: false,
    isSubmitting: false,
    historyList: []
  },

  onLoad: function () {
    this.setupAudioRecorder();
    this.fetchUserHistory();
  },

  onUnload: function () {
    if (recordTimer) clearInterval(recordTimer);
    try { recorderManager.stop(); } catch(e){}
    const player = app.globalData.innerAudioContext;
    if (player) player.stop();
  },

  /**
   * 点击取景框：弹出原生 ActionSheet 操作栏
   */
  showPhotoSourceActionSheet: function () {
    wx.showActionSheet({
      itemList: ['📸 现场拍摄定格', '🖼️ 从手机相册选取'],
      success: res => {
        if (res.tapIndex === 0) {
          this.executePickMedia('camera');
        } else if (res.tapIndex === 1) {
          this.executePickMedia('album');
        }
      }
    });
  },

  /**
   * [核心升级] 采用微信现代化 chooseMedia 引擎，真机彻底区分相机与相册
   */
  executePickMedia: function (sourceType) {
    // 优先使用现代化 chooseMedia 接口
    if (wx.chooseMedia) {
      wx.chooseMedia({
        count: 1,
        mediaType: ['image'],
        sourceType: [sourceType], // 严格限定为 'camera' 或 'album'
        camera: 'back',           // 若为拍照，默认唤起后置镜头
        sizeType: ['compressed'],
        success: res => {
          if (res.tempFiles && res.tempFiles.length > 0) {
            this.setData({
              tempPhotoPath: res.tempFiles[0].tempFilePath,
              canSubmit: true
            });
          }
        },
        fail: err => {
          if (err.errMsg && !err.errMsg.includes('cancel')) {
            console.warn('chooseMedia 失败，尝试降级兼容:', err);
            this.fallbackChooseImage(sourceType);
          }
        }
      });
    } else {
      this.fallbackChooseImage(sourceType);
    }
  },

  fallbackChooseImage: function (sourceType) {
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: [sourceType],
      success: res => {
        this.setData({
          tempPhotoPath: res.tempFilePaths[0],
          canSubmit: true
        });
      }
    });
  },

  onCaptionInput: function (e) {
    this.setData({ caption: e.detail.value });
  },

  onBlurSwitchChange: function (e) {
    this.setData({ isBlurred: e.detail.value });
  },

  chooseLocation: function () {
    wx.chooseLocation({
      success: res => {
        this.setData({
          latitude: res.latitude,
          longitude: res.longitude,
          placeName: res.name || res.address
        });
        wx.showToast({ title: '已选定地标', icon: 'success' });
      },
      fail: (err) => {
        if (err.errMsg && err.errMsg.includes('cancel')) return;
        console.warn('地图选点提示:', err);
      }
    });
  },

  setupAudioRecorder: function () {
    recorderManager.onStart(() => {
      recordStartTime = Date.now();
      this.setData({
        isRecording: true,
        currentRecordSec: 1,
        voiceRecordText: '录制中... (再次轻触或松开完成)'
      });

      if (recordTimer) clearInterval(recordTimer);
      recordTimer = setInterval(() => {
        const sec = Math.floor((Date.now() - recordStartTime) / 1000) + 1;
        if (sec >= 10) {
          this.stopRecordingProcess();
        } else {
          this.setData({ currentRecordSec: sec });
        }
      }, 1000);

      try { wx.vibrateShort({ type: 'medium' }); } catch(e){}
    });

    recorderManager.onStop(res => {
      if (recordTimer) clearInterval(recordTimer);
      const actualSec = Math.max(1, Math.round((Date.now() - recordStartTime) / 1000));
      
      this.setData({
        isRecording: false,
        tempVoicePath: res.tempFilePath,
        voiceDuration: Math.min(10, actualSec),
        voiceRecordText: `已封存 ${actualSec}s 原声`
      });

      try { wx.vibrateShort({ type: 'light' }); } catch(e){}
    });

    recorderManager.onError((err) => {
      console.error('麦克风录制异常:', err);
      if (recordTimer) clearInterval(recordTimer);
      this.setData({
        isRecording: false,
        voiceRecordText: '轻触或长按录制现场声音'
      });
    });
  },

  handleRecordTap: function () {
    if (isTouchMode) return;
    if (this.data.isRecording) {
      this.stopRecordingProcess();
    } else {
      this.requestAndStartRecord();
    }
  },

  handleTouchStart: function () {
    isTouchMode = true;
    this.requestAndStartRecord();
  },

  handleTouchEnd: function () {
    setTimeout(() => {
      if (this.data.isRecording) {
        this.stopRecordingProcess();
      }
      setTimeout(() => { isTouchMode = false; }, 500);
    }, 300);
  },

  requestAndStartRecord: function () {
    wx.getSetting({
      success: res => {
        if (!res.authSetting['scope.record']) {
          wx.authorize({
            scope: 'scope.record',
            success: () => {
              this.startNativeRecord();
            },
            fail: () => {
              wx.showModal({
                title: '需要麦克风权限',
                content: '请在设置中开启麦克风权限以录制现场原声',
                confirmText: '去授权',
                success: modalRes => {
                  if (modalRes.confirm) wx.openSetting();
                }
              });
            }
          });
        } else {
          this.startNativeRecord();
        }
      }
    });
  },

  startNativeRecord: function () {
    recorderManager.start({
      duration: 10000,
      format: 'aac',
      sampleRate: 16000,
      numberOfChannels: 1
    });
  },

  stopRecordingProcess: function () {
    if (recordTimer) clearInterval(recordTimer);
    try {
      recorderManager.stop();
    } catch(e) {}
  },

  deleteRecordedVoice: function () {
    this.setData({
      tempVoicePath: '',
      voiceDuration: 0,
      isPlayingVoice: false,
      voiceRecordText: '轻触或长按录制现场声音'
    });
  },

  playRecordedVoice: function () {
    if (!this.data.tempVoicePath) return;
    const player = app.globalData.innerAudioContext;
    if (this.data.isPlayingVoice) {
      player.stop();
      this.setData({ isPlayingVoice: false });
    } else {
      player.stop();
      player.src = this.data.tempVoicePath;
      player.play();
      this.setData({ isPlayingVoice: true });
      player.onEnded(() => {
        this.setData({ isPlayingVoice: false });
      });
    }
  },

  handleSubmit: async function () {
    if (!this.data.canSubmit || this.data.isSubmitting) return;

    this.setData({ isSubmitting: true });
    wx.showLoading({ title: '正在上传云存储...', mask: true });

    const myProfile = (app.globalData && app.globalData.userInfo) || 
                      wx.getStorageSync('user_profile') || {
                        nickName: '胶片漫游者 (我)',
                        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&q=80'
                      };

    try {
      const cloudPhotoPath = `photos/${Date.now()}_${Math.random().toString(36).slice(-6)}.jpg`;
      const uploadPhotoRes = await wx.cloud.uploadFile({
        cloudPath: cloudPhotoPath,
        filePath: this.data.tempPhotoPath
      });
      const realPhotoFileID = uploadPhotoRes.fileID;

      let realVoiceFileID = '';
      if (this.data.tempVoicePath) {
        wx.showLoading({ title: '封装声音云胶囊...', mask: true });
        const cloudVoicePath = `voices/${Date.now()}_${Math.random().toString(36).slice(-6)}.aac`;
        const uploadVoiceRes = await wx.cloud.uploadFile({
          cloudPath: cloudVoicePath,
          filePath: this.data.tempVoicePath
        });
        realVoiceFileID = uploadVoiceRes.fileID;
      }

      wx.showLoading({ title: '正在写入云数据库...', mask: true });

      const cloudPayload = {
        photoUrl: realPhotoFileID,
        caption: this.data.caption || '定格此瞬，未写下碎念。',
        voiceUrl: realVoiceFileID,
        voiceDuration: this.data.voiceDuration || 0,
        location: this.data.placeName ? {
          latitude: this.data.latitude,
          longitude: this.data.longitude,
          placeName: this.data.placeName
        } : null,
        isBlurred: this.data.isBlurred,
        likeCount: 0,
        likedUsers: [],
        userInfo: myProfile,
        addDate: '今天',
        createTime: Date.now()
      };

      const db = wx.cloud.database();
      await db.collection('photos').add({
        data: cloudPayload
      });

      wx.hideLoading();
      wx.showToast({ title: '已真实存入云端！', icon: 'success' });

      setTimeout(() => {
        wx.navigateBack();
      }, 1000);

    } catch (err) {
      console.error('❌ 云端入库失败:', err);
      wx.hideLoading();
      this.setData({ isSubmitting: false });
      wx.showModal({
        title: '云端写入异常',
        content: err.errMsg || JSON.stringify(err),
        showCancel: false
      });
    }
  },

  fetchUserHistory: function () {
    if (wx.cloud) {
      const db = wx.cloud.database();
      db.collection('photos')
        .where({ _openid: '{openid}' })
        .orderBy('createTime', 'desc')
        .limit(10)
        .get()
        .then(res => {
          this.setData({ historyList: res.data });
        })
        .catch(() => {});
    }
  },

  navToDetail: function (e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/detail/detail?id=${id}`
    });
  }
});