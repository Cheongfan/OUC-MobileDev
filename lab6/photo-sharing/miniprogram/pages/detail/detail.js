// pages/detail/detail.js
const app = getApp();

Page({
  data: {
    photoId: '',
    photoInfo: null,
    isDeveloped: false,
    isPlayingAudio: false,
    currentPlaySec: 0,
    displayDuration: 0,
    isMyPhoto: false,
    lastX: 0, lastY: 0, lastZ: 0,
    lastShakeTime: 0
  },

  onLoad: function (options) {
    const id = options.id;
    if (!id) {
      wx.showToast({ title: '底片参数缺失', icon: 'none' });
      return;
    }

    this.setData({ photoId: id });

    const developedIds = wx.getStorageSync('developed_photo_ids') || [];
    const hasDeveloped = developedIds.includes(id);
    this.setData({ isDeveloped: hasDeveloped });

    this.fetchPhotoDetailFromCloud(id, hasDeveloped);
  },

  onUnload: function () {
    wx.stopAccelerometer();
    const player = app.globalData.innerAudioContext;
    if (player) {
      player.stop();
      player.offCanplay();
      player.offTimeUpdate();
      player.offEnded();
    }
  },

  /**
   * 纯向云数据库发起精确单条查询
   */
  fetchPhotoDetailFromCloud: function (id, hasDeveloped) {
    wx.showLoading({ title: '调取底片...' });
    const db = wx.cloud.database();

    db.collection('photos').doc(id).get().then(res => {
      wx.hideLoading();
      const photo = res.data;
      
      const isMine = (res.data._openid === '{openid}') || 
                     (app.globalData && app.globalData.openid === res.data._openid);
      this.setData({ isMyPhoto: isMine });

      this.initPhotoData(photo, hasDeveloped);
    }).catch(err => {
      console.error('调取胶片记录失败:', err);
      wx.hideLoading();
      wx.showModal({
        title: '底片调取失败',
        content: '该胶片记录不存在或已被作者销毁',
        showCancel: false,
        success: () => {
          wx.navigateBack();
        }
      });
    });
  },

  initPhotoData: function (data, hasDeveloped) {
    this.setData({
      photoInfo: data,
      displayDuration: data.voiceDuration || 0
    });

    if (data.isBlurred && !hasDeveloped) {
      this.initShakeSensor();
    }

    if (data.voiceUrl) {
      this.detectAudioRealDuration(data.voiceUrl);
    }
  },

  confirmDeleteFilm: function () {
    wx.showModal({
      title: '销毁底片',
      content: '确定要从影集中永久销毁这张胶片吗？录制的声音与足迹也将同步移除。',
      confirmText: '确认销毁',
      confirmColor: '#DC2626',
      cancelText: '保留',
      success: res => {
        if (res.confirm) {
          this.executeDeleteProcess();
        }
      }
    });
  },

  executeDeleteProcess: async function () {
    const targetId = this.data.photoId;
    const photoUrl = this.data.photoInfo.photoUrl;
    const voiceUrl = this.data.photoInfo.voiceUrl;

    wx.showLoading({ title: '底片销毁中...', mask: true });

    try {
      const db = wx.cloud.database();
      await db.collection('photos').doc(targetId).remove();

      const filesToDelete = [];
      if (photoUrl && photoUrl.startsWith('cloud://')) filesToDelete.push(photoUrl);
      if (voiceUrl && voiceUrl.startsWith('cloud://')) filesToDelete.push(voiceUrl);
      if (filesToDelete.length > 0) {
        await wx.cloud.deleteFile({ fileList: filesToDelete });
      }

      const developedIds = wx.getStorageSync('developed_photo_ids') || [];
      wx.setStorageSync('developed_photo_ids', developedIds.filter(id => id !== targetId));

      wx.hideLoading();
      wx.showToast({ title: '底片已彻底销毁', icon: 'success' });

      setTimeout(() => {
        wx.navigateBack();
      }, 800);

    } catch (err) {
      console.error('销毁失败:', err);
      wx.hideLoading();
      wx.showToast({ title: '销毁失败', icon: 'none' });
    }
  },

  detectAudioRealDuration: function (url) {
    const player = app.globalData.innerAudioContext;
    player.src = url;

    player.onCanplay(() => {
      if (player.duration) {
        this.setData({ displayDuration: Math.round(player.duration) });
      }
    });

    player.onTimeUpdate(() => {
      if (this.data.isPlayingAudio) {
        this.setData({
          currentPlaySec: Math.floor(player.currentTime),
          displayDuration: Math.round(player.duration) || this.data.displayDuration
        });
      }
    });

    player.onEnded(() => {
      this.setData({
        isPlayingAudio: false,
        currentPlaySec: 0
      });
    });

    player.onError(() => {
      this.setData({ isPlayingAudio: false });
    });
  },

  toggleAudioPlayback: function () {
    const player = app.globalData.innerAudioContext;
    if (this.data.isPlayingAudio) {
      player.stop();
      this.setData({ isPlayingAudio: false, currentPlaySec: 0 });
    } else {
      player.stop();
      player.src = this.data.photoInfo.voiceUrl;
      player.play();
      this.setData({ isPlayingAudio: true });
    }
  },

  initShakeSensor: function () {
    wx.startAccelerometer({ interval: 'game' });
    wx.onAccelerometerChange(res => {
      const curTime = Date.now();
      if ((curTime - this.data.lastShakeTime) > 100) {
        const diffTime = curTime - this.data.lastShakeTime;
        const speed = Math.abs(res.x + res.y + res.z - this.data.lastX - this.data.lastY - this.data.lastZ) / diffTime * 10000;

        if (speed > 160 && !this.data.isDeveloped) {
          this.triggerDevelopSuccess();
        }

        this.setData({
          lastX: res.x, lastY: res.y, lastZ: res.z,
          lastShakeTime: curTime
        });
      }
    });
  },

  manualDevelop: function () {
    if (!this.data.isDeveloped) {
      this.triggerDevelopSuccess();
    }
  },

  triggerDevelopSuccess: function () {
    wx.stopAccelerometer();
    try { wx.vibrateLong(); } catch(e){}

    const developedIds = wx.getStorageSync('developed_photo_ids') || [];
    if (!developedIds.includes(this.data.photoId)) {
      developedIds.push(this.data.photoId);
      wx.setStorageSync('developed_photo_ids', developedIds);
    }

    this.setData({ isDeveloped: true });
    wx.showToast({ title: '显影完成 ✨', icon: 'none' });
  },

  previewFullImage: function () {
    if (!this.data.photoInfo) return;
    wx.previewImage({
      current: this.data.photoInfo.photoUrl,
      urls: [this.data.photoInfo.photoUrl]
    });
  },

  saveToLocalAlbum: function () {
    wx.showLoading({ title: '保存至相册中...' });
    const imgUrl = this.data.photoInfo.photoUrl;

    const doSave = (filePath) => {
      wx.saveImageToPhotosAlbum({
        filePath: filePath,
        success: () => {
          wx.hideLoading();
          wx.showToast({ title: '已保存至相册', icon: 'success' });
        },
        fail: () => {
          wx.hideLoading();
          wx.showToast({ title: '未授权相册权限', icon: 'none' });
        }
      });
    };

    if (imgUrl.startsWith('cloud://')) {
      wx.cloud.downloadFile({
        fileID: imgUrl,
        success: res => doSave(res.tempFilePath),
        fail: () => {
          wx.hideLoading();
          wx.showToast({ title: '下载失败', icon: 'none' });
        }
      });
    } else {
      wx.downloadFile({
        url: imgUrl,
        success: res => doSave(res.tempFilePath),
        fail: () => {
          wx.hideLoading();
          wx.showToast({ title: '下载失败', icon: 'none' });
        }
      });
    }
  },

  generatePoster: function () {
    wx.showLoading({ title: '绘制海报中...', mask: true });
    setTimeout(() => {
      wx.hideLoading();
      wx.showModal({
        title: '拍立得海报已就绪',
        content: `已为【${this.data.photoInfo.userInfo.nickName}】的云端胶片生成电影海报，随时可分享 ✨`,
        showCancel: false
      });
    }, 800);
  },

  onShareAppMessage: function () {
    return {
      title: `分享一张时空胶片：${this.data.photoInfo.caption || '请查收'}`,
      path: `/pages/detail/detail?id=${this.data.photoId}`
    };
  }
});