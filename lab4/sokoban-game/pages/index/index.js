var data = require('../../utils/data.js');

Page({
  data: {
    isLoggedIn: false,
    userInfo: { nickname: '像素冒险家', level: 1, coins: 0 },
    equippedTitleName: '推箱新手',
    equippedTitleColor: '#a4b0be',
    levels: [1, 2, 3, 4, 5, 6, 7, 8, 9],
    unlockedLevels: 1,
    stars: [],
    hasCheckedInToday: false,
    showLoginAuthModal: false,
    showNicknameModal: false,
    showShopModal: false,
    titlesList: [],
    inputNickname: ''
  },

  onShow: function () {
    this.loadUserData();
    this.loadTitlesData();
  },

  onReady: function () {
    this.drawAllLevelPreviews();
  },

  // 读取并计算称号状态与当前佩戴效果
  loadTitlesData: function () {
    let unlockedTitles = wx.getStorageSync('unlockedTitles') || ['title_01'];
    let equippedTitleId = wx.getStorageSync('equippedTitleId') || 'title_01';

    let list = JSON.parse(JSON.stringify(data.titles));
    let currentName = '推箱新手';
    let currentColor = '#a4b0be';

    list.forEach(item => {
      item.isUnlocked = unlockedTitles.includes(item.id);
      item.isEquipped = (equippedTitleId === item.id);
      if (item.isEquipped) {
        currentName = item.name;
        currentColor = item.tagColor;
      }
    });

    this.setData({
      titlesList: list,
      equippedTitleName: currentName,
      equippedTitleColor: currentColor
    });
  },

  // 一键佩戴称号
  equipTitle: function (e) {
    let titleId = e.currentTarget.dataset.id;
    wx.setStorageSync('equippedTitleId', titleId);
    this.loadTitlesData();
    wx.showToast({ title: '已佩戴该称号！', icon: 'success' });
  },

  // 购买称号逻辑（防重复购买 + 自动佩戴持久化）
  buyTitle: function (e) {
    let titleId = e.currentTarget.dataset.id;
    let price = e.currentTarget.dataset.price;
    let coins = this.data.userInfo.coins;

    if (coins < price) {
      wx.showToast({ title: '金币不足，快去签到通关吧！', icon: 'none' });
      return;
    }

    // 扣除金币
    let newCoins = coins - price;
    wx.setStorageSync('userCoins', newCoins);

    // 解锁称号并保存到 Storage
    let unlockedTitles = wx.getStorageSync('unlockedTitles') || ['title_01'];
    if (!unlockedTitles.includes(titleId)) {
      unlockedTitles.push(titleId);
      wx.setStorageSync('unlockedTitles', unlockedTitles);
    }

    // 自动佩戴新称号并保存到 Storage
    wx.setStorageSync('equippedTitleId', titleId);

    this.setData({ 'userInfo.coins': newCoins });
    this.loadTitlesData();

    wx.showToast({ title: '解锁成功并已佩戴！', icon: 'success' });
  },

  // 动态 Canvas 像素渲染引擎
  drawAllLevelPreviews: function () {
    let maps = data.maps;
    let tilesetSrc = '/images/tileset.png';
    let imgTileSize = 16;
    let pw = 20;

    for (let k = 0; k < maps.length; k++) {
      let ctx = wx.createCanvasContext('preview_' + k, this);
      let mapData = maps[k];

      ctx.clearRect(0, 0, 160, 160);
      for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
          let x = j * pw, y = i * pw;
          ctx.drawImage(tilesetSrc, 0, imgTileSize, imgTileSize, imgTileSize, x, y, pw, pw);
          let val = mapData[i][j];
          if (val === 1) ctx.drawImage(tilesetSrc, 0, 0, imgTileSize, imgTileSize, x, y, pw, pw);
          else if (val === 3) ctx.drawImage(tilesetSrc, 3 * imgTileSize, 0, imgTileSize, imgTileSize, x, y, pw, pw);
          else if (val === 4) ctx.drawImage(tilesetSrc, 0, 4 * imgTileSize, imgTileSize, imgTileSize, x, y, pw, pw);
          else if (val === 5) ctx.drawImage('/images/player/player_01.png', x, y, pw, pw);
        }
      }
      ctx.draw();
    }
  },

  getTodayStr: function () {
    let now = new Date();
    let y = now.getFullYear();
    let m = now.getMonth() + 1;
    let d = now.getDate();
    return `${y}-${m < 10 ? '0' + m : m}-${d < 10 ? '0' + d : d}`;
  },

  loadUserData: function () {
    let loggedIn = wx.getStorageSync('isLoggedIn') || false;
    let unlocked = wx.getStorageSync('unlockedLevels') || 1;
    let stars = wx.getStorageSync('levelStars') || [0,0,0,0,0,0,0,0,0];
    let savedName = wx.getStorageSync('userNickname') || '像素冒险家';
    let coins = wx.getStorageSync('userCoins') || 0;

    let lastCheckinDate = wx.getStorageSync('lastCheckinDate') || '';
    let todayStr = this.getTodayStr();
    let checkedIn = (lastCheckinDate === todayStr);

    this.setData({
      isLoggedIn: loggedIn,
      unlockedLevels: loggedIn ? unlocked : 1,
      stars: loggedIn ? stars : [],
      hasCheckedInToday: checkedIn,
      'userInfo.nickname': savedName,
      'userInfo.coins': coins
    });
  },

  handleCheckin: function () {
    let todayStr = this.getTodayStr();
    let lastCheckinDate = wx.getStorageSync('lastCheckinDate') || '';

    if (lastCheckinDate === todayStr) {
      wx.showToast({ title: '今天已签到过，明天再来吧！', icon: 'none' });
      return;
    }

    let newCoins = this.data.userInfo.coins + 50;
    wx.setStorageSync('lastCheckinDate', todayStr);
    wx.setStorageSync('userCoins', newCoins);

    this.setData({
      hasCheckedInToday: true,
      'userInfo.coins': newCoins
    });

    wx.showToast({ title: '签到成功！🪙 金币+50', icon: 'success' });
  },

  openTitleShop: function () { this.setData({ showShopModal: true }); },
  closeShopModal: function () { this.setData({ showShopModal: false }); },

  openLoginModal: function () { this.setData({ showLoginAuthModal: true }); },
  cancelLogin: function () {
    this.setData({ showLoginAuthModal: false });
    wx.showToast({ title: '已取消登录', icon: 'none' });
  },

  confirmLogin: function () {
    this.setData({ showLoginAuthModal: false });
    wx.setStorageSync('isLoggedIn', true);
    this.loadUserData();
    this.loadTitlesData();
    wx.showToast({ title: '登录成功！', icon: 'success' });
  },

  handleLogout: function () {
    wx.showModal({
      title: '提示',
      content: '确定要退出当前账号吗？',
      success: (res) => {
        if (res.confirm) {
          wx.setStorageSync('isLoggedIn', false);
          this.loadUserData();
          this.loadTitlesData();
          wx.showToast({ title: '已退出登录', icon: 'none' });
        }
      }
    });
  },

  chooseLevel: function (e) {
    if (!this.data.isLoggedIn) {
      wx.showToast({ title: '请先完成微信一键登录！', icon: 'none' });
      return;
    }
    let level = e.currentTarget.dataset.level;
    if (level + 1 > this.data.unlockedLevels) {
      wx.showToast({ title: '请先通关前一关！', icon: 'none' });
      return;
    }
    wx.navigateTo({ url: '/pages/game/game?level=' + level });
  },

  checkAuthAndNavigate: function (url) {
    if (!this.data.isLoggedIn) {
      wx.showToast({ title: '请先完成微信一键登录！', icon: 'none' });
      return;
    }
    wx.navigateTo({ url: url });
  },

  openEditor: function () { this.checkAuthAndNavigate('/pages/editor/editor'); },
  openRank: function () { this.checkAuthAndNavigate('/pages/rank/rank'); },
  openStats: function () { this.checkAuthAndNavigate('/pages/stats/stats'); },
  openAchievement: function () { this.checkAuthAndNavigate('/pages/achievement/achievement'); },
  openAbout: function () { wx.navigateTo({ url: '/pages/about/about' }); },

  openEditNickname: function () {
    this.setData({ showNicknameModal: true, inputNickname: this.data.userInfo.nickname });
  },
  closeNicknameModal: function () { this.setData({ showNicknameModal: false }); },
  onNicknameInput: function (e) { this.setData({ inputNickname: e.detail.value }); },

  submitNickname: function () {
    let name = this.data.inputNickname.trim();
    if (name.length < 2 || name.length > 8) {
      wx.showToast({ title: '昵称须为2-8字！', icon: 'none' });
      return;
    }
    wx.setStorageSync('userNickname', name);
    this.setData({ 'userInfo.nickname': name, showNicknameModal: false });
    wx.showToast({ title: '修改成功！', icon: 'success' });
  }
});