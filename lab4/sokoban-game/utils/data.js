var map1 = [[0,1,1,1,1,1,0,0],[0,1,2,2,1,1,1,0],[0,1,5,4,2,2,1,0],[1,1,1,2,1,2,1,1],[1,3,1,2,1,2,2,1],[1,3,4,2,2,1,2,1],[1,3,2,2,2,4,2,1],[1,1,1,1,1,1,1,1]];
var map2 = [[0,0,1,1,1,0,0,0],[0,0,1,3,1,0,0,0],[0,0,1,2,1,1,1,1],[1,1,1,4,2,4,3,1],[1,3,2,4,5,1,1,1],[1,1,1,1,4,1,0,0],[0,0,0,1,3,1,0,0],[0,0,0,1,1,1,0,0]];
var map3 = [[0,0,1,1,1,1,0,0],[0,0,1,3,3,1,0,0],[0,1,1,2,3,1,1,0],[0,1,2,2,4,3,1,0],[1,1,1,2,2,5,4,1],[1,2,2,1,4,4,2,1],[1,2,2,2,2,2,2,1],[1,1,1,1,1,1,1,1]];
var map4 = [[0,1,1,1,1,1,1,0],[0,1,3,2,3,3,1,0],[0,1,3,2,4,3,1,0],[1,1,1,2,2,4,1,1],[1,2,4,2,2,4,2,1],[1,2,1,4,1,1,2,1],[1,2,2,2,2,5,2,1],[1,1,1,1,1,1,1,1]];
var map5 = [[0,1,1,1,1,1,1,0],[1,1,2,2,1,2,1,1],[1,2,4,2,2,4,2,1],[1,2,1,3,3,1,2,1],[1,2,1,3,3,1,2,1],[1,2,4,2,4,2,2,1],[1,1,2,5,2,2,1,1],[0,1,1,1,1,1,1,0]];
var map6 = [[1,1,1,1,1,1,1,1],[1,2,2,1,3,3,3,1],[1,2,4,2,2,1,3,1],[1,2,1,4,2,2,2,1],[1,2,2,4,5,4,2,1],[1,1,2,1,2,1,2,1],[1,2,2,2,2,2,2,1],[1,1,1,1,1,1,1,1]];
var map7 = [[0,1,1,1,1,1,0,0],[1,1,2,2,2,1,1,0],[1,3,4,1,2,2,1,0],[1,3,2,4,4,2,1,1],[1,3,2,1,2,4,2,1],[1,3,2,5,2,2,2,1],[1,1,1,1,1,2,2,1],[0,0,0,0,1,1,1,1]];
var map8 = [[1,1,1,1,1,1,1,1],[1,2,2,2,1,3,3,1],[1,2,4,2,2,3,3,1],[1,1,4,1,2,1,1,1],[1,2,2,4,2,2,2,1],[1,2,1,2,4,5,2,1],[1,2,2,2,2,2,2,1],[1,1,1,1,1,1,1,1]];
var map9 = [[1,1,1,1,1,1,1,1],[1,3,3,3,3,2,2,1],[1,2,1,1,1,2,2,1],[1,2,4,4,2,2,2,1],[1,2,2,4,1,2,2,1],[1,2,4,2,5,2,2,1],[1,2,2,2,2,2,2,1],[1,1,1,1,1,1,1,1]];

var starLimits = [
  { three: 25, two: 40 }, { three: 30, two: 50 }, { three: 35, two: 60 },
  { three: 45, two: 75 }, { three: 35, two: 55 }, { three: 40, two: 65 },
  { three: 42, two: 70 }, { three: 48, two: 75 }, { three: 50, two: 80 }
];

var mock7Friends = [
  { name: '微信好友-学霸小明', avatar: '👦', completedCount: 8, stars: 22, isMe: false },
  { name: '微信好友-极速小红', avatar: '👧', completedCount: 6, stars: 16, isMe: false },
  { name: '微信好友-推箱老张', avatar: '👨', completedCount: 5, stars: 12, isMe: false },
  { name: '微信好友-游戏人阿坤', avatar: '🏀', completedCount: 4, stars: 9, isMe: false },
  { name: '微信好友-像素萌新', avatar: '🐣', completedCount: 3, stars: 7, isMe: false },
  { name: '微信好友-探险家小李', avatar: '🤠', completedCount: 2, stars: 4, isMe: false },
  { name: '微信好友-游戏收藏家', avatar: '👾', completedCount: 1, stars: 2, isMe: false }
];

// 3 级称号数据库 (纯文字+背景色，无需任何图片)
var titleCatalog = [
  { id: 'title_01', name: '推箱新手', price: 0, tagColor: '#a4b0be' },
  { id: 'title_02', name: '推箱高手', price: 200, tagColor: '#f7b731' },
  { id: 'title_03', name: '像素宗师', price: 500, tagColor: '#ff4757' }
];

var achievementConfigs = [
  { id: 'first_win', name: '新手上路', desc: '成功通关第 1 个关卡', icon: '🐣', target: 1 },
  { id: 'master_win', name: '推箱大师', desc: '成功通关全部 9 个经典关卡', icon: '🏆', target: 9 },
  { id: 'perfect_star', name: '完美主义', desc: '获得 5 次三星满星通关评价', icon: '⭐', target: 5 },
  { id: 'undo_master', name: '深谋远虑', desc: '累计使用悔棋功能达到 10 次', icon: '↩️', target: 10 },
  { id: 'creator', name: '创世神工', desc: '在编辑器中保存 1 个自定义地图', icon: '🛠️', target: 1 }
];

module.exports = {
  maps: [map1, map2, map3, map4, map5, map6, map7, map8, map9],
  starLimits: starLimits,
  previews: ['level01.png', 'level02.png', 'level03.png', 'level04.png', 'level01.png', 'level02.png', 'level03.png', 'level04.png', 'level01.png'],
  friendsLeaderboard: mock7Friends,
  titles: titleCatalog,
  achievements: achievementConfigs
};