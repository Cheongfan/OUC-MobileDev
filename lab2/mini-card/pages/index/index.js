Page({
  data: {},

  // 1. 复制邮箱逻辑
  copyEmail() {
    wx.setClipboardData({
      data: 'wuxiaotian@stu.ouc.edu.cn',
      success() {
        wx.showToast({ title: '邮箱已复制', icon: 'success' });
      }
    });
  },

  // 2. 调起地图查看位置
  openLocation() {
    wx.openLocation({
      latitude: 35.7728,        // 目标纬度
      longitude: 120.0322,      // 目标经度
      scale: 18,                 // 缩放比例
      name: '中国海洋大学西海岸校区 · 听海苑3楼',
      address: '山东省青岛市黄岛区三沙路1299号听海苑',
      success: function () {
        console.log('地图打开成功');
      },
      fail: function (err) {
        console.error('地图打开失败', err);
      }
    });
  },

  // 3. 一键保存手机通讯录
  saveContact() {
    wx.addPhoneContact({
      firstName: '吴啸天',
      remark: '中国海洋大学',
      email: 'wuxiaotian@stu.ouc.edu.cn',
      organization: '中国海洋大学计算机学院',
      title: '本科生',

      success() {
        wx.showToast({
          title: '已保存到通讯录',
          icon: 'success',
          duration: 2000
        });
      },

      fail(err) {
        console.log('保存通讯录失败或取消：', err);
        wx.showModal({
          title: '提示',
          content: '电脑模拟器无法调起手机通讯录，请点击【预览】用手机微信测试！',
          showCancel: false
        });
      }
    });
  },

  // 4. 自定义分享
  onShareAppMessage() {
    return {
      title: '你好！这是吴啸天的名片，请查收！',
      path: '/pages/index/index',
    };
  }
});