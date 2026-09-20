// pages/ranking/ranking.js
Page({
  data: {
    activeTab: 'survival', // 'survival' | 'drive' | 'sneak' | 'rush' | 'pack' | 'schedule' | 'multitask'
    scoreUnit: '天',
    myScore: 49,
    myRank: 4,
    currentList: []
  },

  onShow() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ selected: 3 });
    }
    this.renderRankList(this.data.activeTab);
  },

  switchTab(e) {
    const tab = e.currentTarget.dataset.tab;
    wx.$haptics.light();
    wx.$audio.cardSelect();
    this.setData({ activeTab: tab });
    this.renderRankList(tab);
  },

  renderRankList(tab) {
    const globalStats = wx.$storage.getGlobalStats();
    const miniScores = wx.$storage.getMiniGameScores();

    let list = [];
    let unit = '天';
    let selfScore = 0;

    if (tab === 'survival') {
      unit = '天';
      selfScore = globalStats.maxDays || 1;
      list = [
        { rank: 1, name: '计科·熬夜修仙真君', dept: '信息学院', motto: '考前万字大作业已提前通关', score: 60 },
        { rank: 2, name: '泰山石敢当本尊', dept: '体育部', motto: '日行四万步，双腿已机械化', score: 58 },
        { rank: 3, name: '全款吃疯四的土豪', dept: '经管学院', motto: 'V我50，我带你生存到开学', score: 54 },
        { rank: 4, name: 'Cheongfan', dept: '计算机', motto: '在老妈拖把下勉强苟延残喘', score: selfScore, isSelf: true },
        { rank: 5, name: '科目二退钱苦主', dept: '自动化系', motto: '方向盘都摸包浆了还没约上考', score: 42 },
        { rank: 6, name: '冰西瓜全职消灭官', dept: '外语学院', motto: '空调房里不知今夕是何年', score: 36 }
      ];
    } else if (tab === 'drive') {
      unit = '分';
      selfScore = miniScores.drive || 0;
      list = [
        { rank: 1, name: '秋名山老司机', dept: '车辆工程', motto: '倒车入库不用看后视镜', score: 100 },
        { rank: 2, name: '教练的得意关门弟子', dept: '交通学院', motto: '一把进库，刹车踩得毫无破绽', score: 100 },
        { rank: 3, name: 'Cheongfan', dept: '计算机', motto: '不撞水泥墙就算胜利', score: selfScore, isSelf: true },
        { rank: 4, name: '驾校护栏修缮赞助商', dept: '土木学院', motto: '教练见我都让我买保险', score: 50 }
      ];
    } else if (tab === 'sneak') {
      unit = '分';
      selfScore = miniScores.sneak || 0;
      list = [
        { rank: 1, name: '被窝影帝·奥斯卡得主', dept: '传媒学院', motto: '老妈脚步声到门口我能瞬间打呼噜', score: 860 },
        { rank: 2, name: '修仙神尊无敌手', dept: '软件工程', motto: '屏幕亮度调到最低，连看五场球', score: 640 },
        { rank: 3, name: 'Cheongfan', dept: '计算机', motto: '听拖鞋声判断老妈愤怒等级', score: selfScore, isSelf: true },
        { rank: 4, name: '人赃并获大头虾', dept: '人文学院', motto: '没戴耳机直接外放了土味视频', score: 120 }
      ];
    } else if (tab === 'rush') {
      unit = '分';
      selfScore = miniScores.rush || 0;
      list = [
        { rank: 1, name: '神之右手加藤鹰', dept: '电竞社', motto: '10秒点击180次，手机屏幕冒火', score: 1250 },
        { rank: 2, name: '抢票脚本人形自走器', dept: '人工智能', motto: '泰山硬座我势在必得', score: 980 },
        { rank: 3, name: 'Cheongfan', dept: '计算机', motto: '多点触控连击充能手抽筋', score: selfScore, isSelf: true },
        { rank: 4, name: '4G网络重度受害者', dept: '通信系', motto: '刚点进去票就已经灰了', score: 200 }
      ];
    } else if (tab === 'pack') {
      unit = '分';
      selfScore = miniScores.pack || 0;
      list = [
        { rank: 1, name: '全屋收纳强迫症大师', dept: '建筑系', motto: '连牙缝都能塞进一个充电宝', score: 850 },
        { rank: 2, name: '特种兵打包狂魔', dept: '物流管理', motto: '空间利用率永远保持 100%', score: 720 },
        { rank: 3, name: 'Cheongfan', dept: '计算机', motto: '只要旋转角度对，西瓜也能塞进去', score: selfScore, isSelf: true },
        { rank: 4, name: '防爆安检常客', dept: '化学系', motto: '充电宝挨着防晒喷雾当场被扣', score: 310 }
      ];
    } else if (tab === 'schedule') {
      unit = '分';
      selfScore = miniScores.schedule || 0;
      list = [
        { rank: 1, name: '生物钟绝对统治者', dept: '医学院', motto: '24小时作息无懈可击', score: 1420 },
        { rank: 2, name: '时间折叠艺术家', dept: '物理系', motto: '连消 COMBO 永不中断', score: 1100 },
        { rank: 3, name: 'Cheongfan', dept: '计算机', motto: '用消除来对抗黑白颠倒', score: selfScore, isSelf: true },
        { rank: 4, name: '作息崩盘受害者', dept: '哲学系', motto: '早上一睁眼已经是下午两点', score: 450 }
      ];
    } else if (tab === 'multitask') {
      unit = '分';
      selfScore = miniScores.multitask || 0;
      list = [
        { rank: 1, name: '人形双核 CPU 怪物', dept: '计算机', motto: '左手开车右手秒回，耳朵听雷达', score: 1890 },
        { rank: 2, name: '时间管理大师尊者', dept: '管理学院', motto: '一心三用毫无压力', score: 1560 },
        { rank: 3, name: 'Cheongfan', dept: '计算机', motto: '大脑 CPU 在熔化边缘疯狂试探', score: selfScore, isSelf: true },
        { rank: 4, name: '当场宕机脆皮', dept: '艺术系', motto: '微信没回老妈就推门进来了', score: 520 }
      ];
    }

    this.setData({
      currentList: list,
      scoreUnit: unit,
      myScore: selfScore
    });
  }
});