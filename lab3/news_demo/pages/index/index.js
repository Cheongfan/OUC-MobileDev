var common = require('../../utils/common.js')

Page({
  data: {
    // 分类菜单列表
    categories: ['全部', '海大要闻', '学术竞赛', '迎新工作'],
    currentTab: 0,
    swiperImg: [],        // 💡 修正：删除了重复定义的 swiperImg
    allNewsList: [],
    displayNewsList: []
  },

  onLoad: function (options) {
    let list = common.getNewList();
    let topThreeNews = list.slice(0, 3);
    this.setData({
      allNewsList: list,
      displayNewsList: list,
      swiperImg: topThreeNews // 动态绑定前3条新闻
    });
  },

  // 💡 修正：将 witchTab 修改为 switchTab
  switchTab: function (e) {
    let index = e.currentTarget.dataset.index;
    let categoryName = this.data.categories[index];
    let filteredList = [];
    
    if (index === 0) {
      filteredList = this.data.allNewsList;
    } else {
      filteredList = this.data.allNewsList.filter(item => item.category === categoryName);
    }
    
    this.setData({
      currentTab: index,
      displayNewsList: filteredList
    });
  },
  
  // 跳转新闻详情
  goToDetail: function (e) {
    let id = e.currentTarget.dataset.id;
    console.log("点击跳转新闻ID:", id);
    wx.navigateTo({
      url: '../detail/detail?id=' + id,
    });
  }
})