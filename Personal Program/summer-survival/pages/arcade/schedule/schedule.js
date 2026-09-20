// pages/arcade/schedule/schedule.js
const ACTIVITY_PRESETS = [
  { type: 'sleep', name: '报复性补觉', emoji: '😴', color: 'sleep', shape: [[1, 1], [1, 1]] },
  { type: 'phone', name: '熬夜刷视频', emoji: '📱', color: 'phone', shape: [[1, 0], [1, 1]] },
  { type: 'study', name: '假装学网课', emoji: '📚', color: 'study', shape: [[1, 1]] },
  { type: 'game', name: '峡谷开黑', emoji: '🎮', color: 'game', shape: [[1, 1, 1], [0, 1, 0]] },
  { type: 'chores', name: '母上喊拖地', emoji: '🧹', color: 'chores', shape: [[1]] },
  { type: 'feast', name: '疯狂星期四', emoji: '🍗', color: 'feast', shape: [[1], [1]] },
  { type: 'binge', name: '连环追剧', emoji: '🍿', color: 'phone', shape: [[1, 1, 1]] }
];

Page({
  data: {
    gridRows: [],
    candidateSlots: [],
    selectedSlotIndex: -1,
    totalScore: 0,
    linesCleared: 0,
    comboCount: 0,
    maxCombo: 1,
    sanity: 100,
    sanityFillStyle: 'width: 100%; background-color: #06D6A0;',
    statusEmoji: '☀️',
    statusMsg: '今日作息正常，赶紧安排日程！',
    isGameOver: false,
    gameOverVerdict: '',
    rewardSummary: '',
    fromMain: false
  },

  onLoad() {
    // 🌟 统一采用本地缓存的安全标记获取方式，与 sneak / rush 完全一致
    const fromMain = !!wx.getStorageSync('ENTERED_FROM_MAIN');
    this.setData({ fromMain });
    wx.removeStorageSync('ENTERED_FROM_MAIN');

    this.startNewDay();
  },

  startNewDay() {
    const matrix = [];
    for (let r = 0; r < 6; r++) {
      const row = [];
      for (let c = 0; c < 6; c++) {
        row.push({ r, c, filled: false, color: '', emoji: '', isAnchor: false });
      }
      matrix.push(row);
    }

    this.setData({
      gridRows: matrix,
      selectedSlotIndex: -1,
      totalScore: 0,
      linesCleared: 0,
      comboCount: 0,
      maxCombo: 1,
      sanity: 100,
      sanityFillStyle: 'width: 100%; background-color: #06D6A0;',
      statusEmoji: '☀️',
      statusMsg: '新的一天开始！平衡作息防崩塌',
      isGameOver: false,
      gameOverVerdict: '',
      rewardSummary: ''
    });

    this.spawnCandidateSlots();
  },

  spawnCandidateSlots() {
    const slots = [];
    for (let i = 0; i < 3; i++) {
      const randPreset = ACTIVITY_PRESETS[Math.floor(Math.random() * ACTIVITY_PRESETS.length)];
      slots.push({
        id: `slot_${Date.now()}_${i}`,
        type: randPreset.type,
        name: randPreset.name,
        emoji: randPreset.emoji,
        color: randPreset.color,
        shape: randPreset.shape,
        placed: false
      });
    }

    this.setData({ candidateSlots: slots, selectedSlotIndex: -1 });
    this.checkBoardPossibility();
  },

  onSelectCandidate(e) {
    const idx = e.currentTarget.dataset.index;
    if (this.data.candidateSlots[idx].placed) return;
    wx.$haptics.light();
    wx.$audio.btnClick();
    this.setData({ selectedSlotIndex: idx });
  },

  onCellTap(e) {
    const { r, c } = e.currentTarget.dataset;
    const sIndex = this.data.selectedSlotIndex;
    if (sIndex < 0) {
      wx.showToast({ title: '先在下方点选一个活动方块', icon: 'none' });
      return;
    }

    const candidate = this.data.candidateSlots[sIndex];
    const shape = candidate.shape;
    const sRows = shape.length;
    const sCols = shape[0].length;
    const matrix = this.data.gridRows;

    if (r + sRows > 6 || c + sCols > 6) {
      wx.$haptics.heavy();
      wx.$audio.danger();
      wx.showToast({ title: '时段放不下！超出今日范围', icon: 'none' });
      return;
    }

    for (let dr = 0; dr < sRows; dr++) {
      for (let dc = 0; dc < sCols; dc++) {
        if (shape[dr][dc] === 1 && matrix[r + dr][c + dc].filled) {
          wx.$haptics.heavy();
          wx.$audio.danger();
          wx.showToast({ title: '时段冲突！此时段已有安排', icon: 'none' });
          return;
        }
      }
    }

    wx.$haptics.medium();
    wx.$audio.cardSelect();

    for (let dr = 0; dr < sRows; dr++) {
      for (let dc = 0; dc < sRows; dc++) {} // 兼容占位
      for (let dr = 0; dr < sRows; dr++) {
        for (let dc = 0; dc < sCols; dc++) {
          if (shape[dr][dc] === 1) {
            matrix[r + dr][c + dc] = {
              r: r + dr,
              c: c + dc,
              filled: true,
              color: candidate.color,
              emoji: candidate.emoji,
              isAnchor: (dr === 0 && dc === 0)
            };
          }
        }
      }
    }

    const slots = this.data.candidateSlots;
    slots[sIndex].placed = true;

    this.setData({ gridRows: matrix, candidateSlots: slots, selectedSlotIndex: -1 });
    this.executeLineClearLogic();
  },

  executeLineClearLogic() {
    const matrix = this.data.gridRows;
    const fullRows = [];
    const fullCols = [];

    for (let r = 0; r < 6; r++) {
      let isRowFull = true;
      for (let c = 0; c < 6; c++) {
        if (!matrix[r][c].filled) { isRowFull = false; break; }
      }
      if (isRowFull) fullRows.push(r);
    }

    for (let c = 0; c < 6; c++) {
      let isColFull = true;
      for (let r = 0; r < 6; r++) {
        if (!matrix[r][c].filled) { isColFull = false; break; }
      }
      if (isColFull) fullCols.push(c);
    }

    const totalClearedLines = fullRows.length + fullCols.length;

    if (totalClearedLines > 0) {
      wx.$haptics.success();
      wx.$audio.success();

      fullRows.forEach(r => {
        for (let c = 0; c < 6; c++) {
          matrix[r][c] = { r, c, filled: false, color: '', emoji: '', isAnchor: false };
        }
      });

      fullCols.forEach(c => {
        for (let r = 0; r < 6; r++) {
          matrix[r][c] = { r, c, filled: false, color: '', emoji: '', isAnchor: false };
        }
      });

      const nextCombo = this.data.comboCount + 1;
      const addScore = totalClearedLines * 120 * nextCombo;
      const newScore = this.data.totalScore + addScore;
      const newLines = this.data.linesCleared + totalClearedLines;
      const nextSanity = Math.min(100, this.data.sanity + totalClearedLines * 10);

      this.setData({
        gridRows: matrix,
        totalScore: newScore,
        linesCleared: newLines,
        comboCount: nextCombo,
        maxCombo: Math.max(this.data.maxCombo, nextCombo),
        sanity: nextSanity,
        sanityFillStyle: `width: ${nextSanity}%; background-color: #06D6A0;`,
        statusEmoji: '✨',
        statusMsg: `作息消除！时段平衡 +${addScore}分！`
      });
    } else {
      this.setData({ comboCount: 0 });
    }

    const allPlaced = this.data.candidateSlots.every(s => s.placed);
    if (allPlaced) {
      this.spawnCandidateSlots();
    } else {
      this.checkBoardPossibility();
    }
  },

  checkBoardPossibility() {
    const unplacedSlots = this.data.candidateSlots.filter(s => !s.placed);
    if (unplacedSlots.length === 0) return;

    const matrix = this.data.gridRows;
    let anyCanFit = false;

    for (const slot of unplacedSlots) {
      const shape = slot.shape;
      const sRows = shape.length;
      const sCols = shape[0].length;

      for (let r = 0; r <= 6 - sRows; r++) {
        for (let c = 0; c <= 6 - sCols; c++) {
          let canFitHere = true;
          for (let dr = 0; dr < sRows; dr++) {
            for (let dc = 0; dc < sCols; dc++) {
              if (shape[dr][dc] === 1 && matrix[r + dr][c + dc].filled) {
                canFitHere = false;
                break;
              }
            }
            if (!canFitHere) break;
          }
          if (canFitHere) { anyCanFit = true; break; }
        }
        if (anyCanFit) break;
      }
      if (anyCanFit) break;
    }

    if (!anyCanFit) {
      this.triggerCollapse();
    }
  },

  triggerCollapse() {
    wx.$haptics.failure();
    wx.$audio.gameOver();

    const score = this.data.totalScore;
    const reward = { stamina: 10, sanity: Math.min(35, Math.floor(score / 80)), rage: -15 };
    const formatNum = (v) => (v > 0 ? `+${v}` : `${v}`);
    const summaryText = `【作息战果】精力 ${formatNum(reward.stamina)}，精神 ${formatNum(reward.sanity)}，妈见打指数 ${formatNum(reward.rage)}`;

    let verdict = '由于作息严重超载、黑白颠倒，你的生物钟彻底失灵！';
    if (score >= 800) {
      verdict = '虽作息崩盘，但你展现了惊人的时间折叠技巧，顺利通关！';
    }

    this.setData({
      isGameOver: true,
      gameOverVerdict: verdict,
      rewardSummary: summaryText,
      sanity: 0,
      sanityFillStyle: 'width: 0%; background-color: #FF5353;'
    });

    wx.$storage.saveMiniGameScore('schedule', score);
    wx.setStorageSync('PENDING_ARCADE_REWARD', reward);
  },

  // 🌟 主动结束规划（对应主游戏进入时的“结束规划”按钮）
  triggerActiveSettle() {
    wx.$haptics.medium();
    wx.$audio.btnClick();

    const score = this.data.totalScore;
    const reward = { stamina: 15, sanity: Math.min(35, Math.floor(score / 50)), rage: -20 };
    const formatNum = (v) => (v > 0 ? `+${v}` : `${v}`);
    const summaryText = `【作息排班结算】精力 ${formatNum(reward.stamina)}，精神 ${formatNum(reward.sanity)}，妈见打指数 ${formatNum(reward.rage)}`;

    this.setData({
      isGameOver: true,
      gameOverVerdict: `你成功完成了今日的 24 小时作息规划，共积攒了 ${score} 点规律指数！`,
      rewardSummary: summaryText
    });

    wx.$storage.saveMiniGameScore('schedule', score);
    wx.setStorageSync('PENDING_ARCADE_REWARD', reward);
  },

  confirmAndReturn() {
    wx.$haptics.light();
    wx.$audio.btnClick();
    if (this.data.fromMain) {
      wx.navigateBack({
        fail: () => wx.reLaunch({ url: '/pages/index/index' })
      });
    } else {
      this.startNewDay();
    }
  },

  restartGame() {
    wx.$haptics.medium();
    wx.$audio.btnClick();
    this.startNewDay();
  }
});