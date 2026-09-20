// pages/arcade/pack/pack.js
const LEVELS = [
  {
    id: 1,
    title: '泰山夜爬特种兵',
    goalDesc: '背包空间紧凑！必须塞进手电、充电宝与水，严禁挤爆！',
    items: [
      { id: 'water', name: '大桶冰水', emoji: '🧊', color: 'umbrella', shape: [[1, 1]], traitDesc: '夏日必备，占2格' },
      { id: 'power', name: '强力充电宝', emoji: '🔋', color: 'power', shape: [[1]], traitDesc: '易燃！绝不可靠近喷雾' },
      { id: 'spray', name: '防晒喷雾', emoji: '🧴', color: 'spray', shape: [[1], [1]], traitDesc: '高压罐！与充电宝相邻违规' },
      { id: 'book', name: '科二手册', emoji: '🚗', color: 'book', shape: [[1, 1]], traitDesc: '提供护考精神增益 +20分' },
      { id: 'umbrella', name: '折叠晴雨伞', emoji: '☂️', color: 'umbrella', shape: [[1], [1], [1]], traitDesc: '纵向3格大件' }
    ]
  },
  {
    id: 2,
    title: '驾校集训烈日战',
    goalDesc: '防晒喷雾、西瓜与电脑的极限权衡，小心腌菜气味污染！',
    items: [
      { id: 'melon', name: '冰镇大西瓜', emoji: '🍉', color: 'watermelon', shape: [[1, 1], [1, 1]], traitDesc: '2x2大方块！周围物品获清凉+15分' },
      { id: 'laptop', name: '游戏笔记本', emoji: '💻', color: 'laptop', shape: [[1, 1], [1, 1]], traitDesc: '贵重物品！严禁沾染腌菜气味' },
      { id: 'pickles', name: '老妈装腌菜', emoji: '🧄', color: 'pickles', shape: [[1], [1]], traitDesc: '浓烈气味！相邻电脑扣30分' },
      { id: 'power', name: '充电宝', emoji: '🔋', color: 'power', shape: [[1]], traitDesc: '严禁相邻防晒喷雾' },
      { id: 'spray', name: '防晒喷雾', emoji: '🧴', color: 'spray', shape: [[1]], traitDesc: '夏日刚需' },
      { id: 'book', name: '科目二手册', emoji: '🚗', color: 'book', shape: [[1, 1]], traitDesc: '精神支柱' }
    ]
  },
  {
    id: 3,
    title: '暑假开学大迁徙',
    goalDesc: '超载极限！将全部行囊全部塞进 5x5 行李箱，挑战 100% 满充！',
    items: [
      { id: 'melon', name: '大西瓜', emoji: '🍉', color: 'watermelon', shape: [[1, 1], [1, 1]], traitDesc: '清凉范围增益' },
      { id: 'laptop', name: '电竞电脑', emoji: '💻', color: 'laptop', shape: [[1, 1], [1, 1]], traitDesc: '惧怕气味与挤压' },
      { id: 'pickles', name: '腌菜大坛', emoji: '🧄', color: 'pickles', shape: [[1, 1]], traitDesc: '气味外泄' },
      { id: 'umbrella', name: '长柄伞', emoji: '☂️', color: 'umbrella', shape: [[1], [1], [1]], traitDesc: '长条3格' },
      { id: 'power', name: '充电宝', emoji: '🔋', color: 'power', shape: [[1]], traitDesc: '防爆安检' },
      { id: 'spray', name: '大瓶防晒', emoji: '🧴', color: 'spray', shape: [[1], [1]], traitDesc: '高压防晒' },
      { id: 'book', name: '考研英语', emoji: '📖', color: 'book', shape: [[1, 1]], traitDesc: '假装学习' }
    ]
  }
];

Page({
  data: {
    currentLevel: 1,
    levelTitle: '',
    levelGoalDesc: '',
    gridRows: [],
    inventoryPool: [],
    selectedItem: null,
    densityPercent: 0,
    densityFillStyle: 'width: 0%; background-color: #06D6A0;',
    hazardCount: 0,
    hazardMsg: '当前行李箱安检合规',
    currentBonus: 0,
    showInspectModal: false,
    inspectResult: { passed: true, grade: 'S', verdict: '', logs: [], totalScore: 0, rewardSummary: '' },
    isAllPacked: false
  },

  onLoad(options) {
    const lvl = options.lvl ? parseInt(options.lvl) : 1;
    this.initScenario(lvl);
  },

  initScenario(levelNum) {
    const level = LEVELS[levelNum - 1] || LEVELS[0];
    const matrix = [];
    for (let r = 0; r < 5; r++) {
      const row = [];
      for (let c = 0; c < 5; c++) {
        row.push({ r, c, occupied: false, itemId: null, color: '', emoji: '', isRoot: false });
      }
      matrix.push(row);
    }

    const pool = level.items.map(item => ({
      ...item,
      packed: false,
      currentShape: JSON.parse(JSON.stringify(item.shape))
    }));

    this.setData({
      currentLevel: levelNum,
      levelTitle: level.title,
      levelGoalDesc: level.goalDesc,
      gridRows: matrix,
      inventoryPool: pool,
      selectedItem: null,
      densityPercent: 0,
      densityFillStyle: 'width: 0%; background-color: #06D6A0;',
      hazardCount: 0,
      hazardMsg: '当前行李箱安检合规',
      currentBonus: 0,
      showInspectModal: false,
      isAllPacked: false
    });
  },

  selectItemToPack(e) {
    const item = e.currentTarget.dataset.item;
    if (item.packed) return;
    wx.$haptics.light();
    wx.$audio.btnClick();
    this.setData({ selectedItem: item });
  },

  rotateCurrentItem() {
    if (!this.data.selectedItem) return;
    wx.$haptics.medium();
    wx.$audio.cardSlide();
    const shape = this.data.selectedItem.currentShape;
    const rows = shape.length;
    const cols = shape[0].length;
    const rotated = [];
    for (let c = 0; c < cols; c++) {
      const newRow = [];
      for (let r = rows - 1; r >= 0; r--) {
        newRow.push(shape[r][c]);
      }
      rotated.push(newRow);
    }
    this.setData({ 'selectedItem.currentShape': rotated });
  },

  cancelSelection() {
    this.setData({ selectedItem: null });
  },

  onCellTap(e) {
    const { r, c } = e.currentTarget.dataset;
    const item = this.data.selectedItem;

    if (!item) {
      this.tryUnpackCell(r, c);
      return;
    }

    const shape = item.currentShape;
    const shapeRows = shape.length;
    const shapeCols = shape[0].length;

    if (r + shapeRows > 5 || c + shapeCols > 5) {
      wx.$haptics.heavy();
      wx.$audio.danger();
      wx.showToast({ title: '箱子边沿塞不下！换个位置或旋转', icon: 'none' });
      return;
    }

    const matrix = this.data.gridRows;
    for (let dr = 0; dr < shapeRows; dr++) {
      for (let dc = 0; dc < shapeCols; dc++) {
        if (shape[dr][dc] === 1 && matrix[r + dr][c + dc].occupied) {
          wx.$haptics.heavy();
          wx.$audio.danger();
          wx.showToast({ title: '空间被占！不能重叠摆放', icon: 'none' });
          return;
        }
      }
    }

    wx.$haptics.success();
    wx.$audio.cardSelect();

    for (let dr = 0; dr < shapeRows; dr++) {
      for (let dc = 0; dc < shapeCols; dc++) {
        if (shape[dr][dc] === 1) {
          matrix[r + dr][c + dc] = {
            r: r + dr,
            c: c + dc,
            occupied: true,
            itemId: item.id,
            color: item.color,
            emoji: item.emoji,
            isRoot: (dr === 0 && dc === 0)
          };
        }
      }
    }

    const pool = this.data.inventoryPool.map(p => {
      if (p.id === item.id) return { ...p, packed: true };
      return p;
    });

    this.setData({ gridRows: matrix, inventoryPool: pool, selectedItem: null });
    this.evaluateSuitcase();
  },

  tryUnpackCell(r, c) {
    const cell = this.data.gridRows[r][c];
    if (!cell.occupied) return;
    wx.$haptics.light();
    const itemId = cell.itemId;
    const matrix = this.data.gridRows;

    for (let row = 0; row < 5; row++) {
      for (let col = 0; col < 5; col++) {
        if (matrix[row][col].itemId === itemId) {
          matrix[row][col] = { r: row, c: col, occupied: false, itemId: null, color: '', emoji: '', isRoot: false };
        }
      }
    }

    const pool = this.data.inventoryPool.map(p => {
      if (p.id === itemId) return { ...p, packed: false };
      return p;
    });

    this.setData({ gridRows: matrix, inventoryPool: pool });
    this.evaluateSuitcase();
  },

  evaluateSuitcase() {
    const matrix = this.data.gridRows;
    let filledCount = 0;
    for (let r = 0; r < 5; r++) {
      for (let c = 0; c < 5; c++) {
        if (matrix[r][c].occupied) filledCount++;
      }
    }

    const density = Math.round((filledCount / 25) * 100);
    const allPacked = this.data.inventoryPool.every(p => p.packed);
    let hazards = 0;
    let bonus = 0;
    let msg = '当前行李箱安检合规，排列整洁';
    const dirs = [[-1, 0], [1, 0], [0, -1], [0, 1]];

    for (let r = 0; r < 5; r++) {
      for (let c = 0; c < 5; c++) {
        const cur = matrix[r][c];
        if (!cur.occupied) continue;
        for (const [dr, dc] of dirs) {
          const nr = r + dr, nc = c + dc;
          if (nr >= 0 && nr < 5 && nc >= 0 && nc < 5) {
            const neighbor = matrix[nr][nc];
            if (!neighbor.occupied) continue;
            if (cur.itemId === 'power' && neighbor.itemId === 'spray') {
              hazards++;
              msg = '🚨 警报！充电宝与防晒喷雾相邻，易发生高温爆燃！';
            }
            if (cur.itemId === 'pickles' && neighbor.itemId === 'laptop') {
              hazards++;
              msg = '🤢 灾难！老妈腌菜汁可能渗入电脑主板！';
            }
            if (cur.itemId === 'melon' && neighbor.itemId !== 'melon') {
              bonus += 2;
            }
          }
        }
      }
    }

    if (hazards > 0) bonus -= hazards * 25;

    this.setData({
      densityPercent: density,
      densityFillStyle: `width: ${density}%; background-color: ${density > 75 ? '#06D6A0' : '#FFD23F'};`,
      hazardCount: hazards,
      hazardMsg: msg,
      currentBonus: bonus,
      isAllPacked: allPacked
    });
  },

  inspectLuggage() {
    this.evaluateSuitcase();
    const density = this.data.densityPercent;
    const hazards = this.data.hazardCount;
    const bonus = this.data.currentBonus;

    if (density < 30) {
      wx.$haptics.heavy();
      wx.showToast({ title: '箱子太空了！再多装点特种兵装备', icon: 'none' });
      return;
    }

    wx.$haptics.success();
    wx.$audio.success();

    let passed = hazards === 0;
    let totalScore = Math.max(0, density * 8 + bonus + (passed ? 100 : -100));
    let grade = 'B';
    let verdict = '安检通过，顺利启程！';
    const logs = [];

    logs.push({ msg: `📦 空间充填率: ${density}%`, type: 'normal' });

    let reward = { stamina: 0, sanity: 0, rage: 0 };
    const formatNum = (v) => v > 0 ? `+${v}` : `${v}`;

    if (hazards > 0) {
      grade = 'F';
      verdict = '❌ 安检扣押！行李箱违规报警！';
      logs.push({ msg: '🚨 发现违规布局：危险品相邻或液体污染！', type: 'danger' });
      reward = { stamina: -20, sanity: -25, rage: 35 };
    } else {
      logs.push({ msg: '✅ 危险品安全隔离合规', type: 'bonus' });
      if (density >= 80) {
        grade = 'SSS';
        reward = { stamina: 15, sanity: 30, rage: -20 };
      } else {
        grade = 'A';
        reward = { stamina: 10, sanity: 15, rage: -10 };
      }
    }

    const rewardSummary = `【收纳战果】精力 ${formatNum(reward.stamina)}，精神 ${formatNum(reward.sanity)}，妈见打指数 ${formatNum(reward.rage)}`;

    this.setData({
      showInspectModal: true,
      inspectResult: { passed, grade, verdict, logs, totalScore, rewardSummary }
    });

    wx.$storage.saveMiniGameScore('pack', totalScore);
    wx.setStorageSync('PENDING_ARCADE_REWARD', reward);
  },

  closeModalAndRetry() {
    this.setData({ showInspectModal: false });
  },

  nextLevelOrFinish() {
    this.setData({ showInspectModal: false });
    wx.navigateBack({
      fail: () => wx.reLaunch({ url: '/pages/index/index' })
    });
  },

  resetSuitcase() {
    wx.$haptics.medium();
    wx.$audio.btnClick();
    this.initScenario(this.data.currentLevel);
  }
});