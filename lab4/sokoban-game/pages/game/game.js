var data = require('../../utils/data.js');

var map = [];
var box = [];
var w = 40; // 画布 320 / 8 格 = 40px/格
var row = 0;
var col = 0;

// 1. 图集参数：80x80 图集按 5x5 切割，单格为 16px
var tilesetSrc = '/images/tileset.png';
var imgTileSize = 16; 

// 2. 修正后的 4 方向 4 帧行走动画库
var playerAnimFrames = {
  down:  ['/images/player/player_21.png', '/images/player/player_22.png', '/images/player/player_23.png', '/images/player/player_21.png'],
  up:    ['/images/player/player_24.png', '/images/player/player_01.png', '/images/player/player_02.png', '/images/player/player_24.png'],
  right: ['/images/player/player_09.png', '/images/player/player_10.png', '/images/player/player_11.png', '/images/player/player_09.png'],
  left:  ['/images/player/player_12.png', '/images/player/player_13.png', '/images/player/player_14.png', '/images/player/player_12.png']
};

Page({
  data: {
    level: 0,
    steps: 0,
    timerStr: '00:00',
    seconds: 0,
    playerDir: 'down'
  },

  historyStack: [],
  timer: null,
  
  // 动画精准控制变量
  isAnimating: false,
  animFrameIndex: 0,
  playerRenderX: 0,
  playerRenderY: 0,
  boxRenderPos: null,

  onLoad: function (options) {
    let level = parseInt(options.level) || 0;
    this.setData({ level: level });
  },

  onReady: function () {
    this.ctx = wx.createCanvasContext('myCanvas');
    this.initGame();
  },

  onUnload: function () {
    this.stopTimer();
  },

  startTimer: function () {
    this.stopTimer();
    this.setData({ seconds: 0, timerStr: '00:00' });
    this.timer = setInterval(() => {
      let sec = this.data.seconds + 1;
      let m = Math.floor(sec / 60);
      let s = sec % 60;
      this.setData({
        seconds: sec,
        timerStr: (m < 10 ? '0' + m : m) + ':' + (s < 10 ? '0' + s : s)
      });
    }, 1000);
  },

  stopTimer: function () {
    if (this.timer) clearInterval(this.timer);
  },

  initGame: function () {
    this.initMap(this.data.level);
    this.historyStack = [];
    this.isAnimating = false;
    this.animFrameIndex = 0;
    this.playerRenderX = col * w;
    this.playerRenderY = row * w;
    this.boxRenderPos = null;

    this.setData({ steps: 0, playerDir: 'down' });
    this.drawCanvas();
    this.startTimer();
  },

  initMap: function (l) {
    let mapData = data.maps[l];
    map = [];
    box = [];
    for (let i = 0; i < 8; i++) {
      map[i] = [];
      box[i] = [];
      for (let j = 0; j < 8; j++) {
        box[i][j] = 0;
        map[i][j] = mapData[i][j];
        if (mapData[i][j] == 4) {
          box[i][j] = 4;
          map[i][j] = 2;
        } else if (mapData[i][j] == 5) {
          row = i;
          col = j;
          map[i][j] = 2;
        }
      }
    }
  },

  saveState: function () {
    this.historyStack.push({
      map: JSON.parse(JSON.stringify(map)),
      box: JSON.parse(JSON.stringify(box)),
      row: row,
      col: col,
      dir: this.data.playerDir
    });
  },

  undo: function () {
    if (this.isAnimating) return;
    if (this.historyStack.length === 0) {
      wx.showToast({ title: '无法再撤销了', icon: 'none' });
      return;
    }
    let lastState = this.historyStack.pop();
    map = lastState.map;
    box = lastState.box;
    row = lastState.row;
    col = lastState.col;
    this.playerRenderX = col * w;
    this.playerRenderY = row * w;
    this.setData({
      steps: this.data.steps - 1,
      playerDir: lastState.dir
    });
    this.drawCanvas();
  },

  drawTile: function (ctx, colIndex, rowIndex, canvasX, canvasY) {
    let sx = colIndex * imgTileSize;
    let sy = rowIndex * imgTileSize;
    ctx.drawImage(
      tilesetSrc,
      sx, sy, imgTileSize, imgTileSize,
      canvasX, canvasY, w, w
    );
  },

  drawCanvas: function () {
    let ctx = this.ctx;
    ctx.clearRect(0, 0, 320, 320);

    for (let i = 0; i < 8; i++) {
      for (let j = 0; j < 8; j++) {
        let x = j * w;
        let y = i * w;

        // 铺底草地
        this.drawTile(ctx, 0, 1, x, y);

        // 画墙体
        if (map[i][j] === 1) {
          this.drawTile(ctx, 0, 0, x, y);
        } 
        // 画目标点
        else if (map[i][j] === 3) {
          this.drawTile(ctx, 3, 0, x, y);
        }

        // 画静态箱子
        if (box[i][j] === 4) {
          if (map[i][j] === 3) {
            this.drawTile(ctx, 4, 0, x, y); // 完成目标箱子
          } else {
            this.drawTile(ctx, 0, 4, x, y); // 普通木箱
          }
        }
      }
    }

    // 绘制移动中的箱子
    if (this.boxRenderPos) {
      let isTarget = map[this.boxRenderPos.targetR][this.boxRenderPos.targetC] === 3;
      let bx = Math.round(this.boxRenderPos.x);
      let by = Math.round(this.boxRenderPos.y);
      this.drawTile(ctx, isTarget ? 4 : 0, isTarget ? 0 : 4, bx, by);
    }

    // 绘制 Player 角色（取整像素防止模糊抖动）
    let frames = playerAnimFrames[this.data.playerDir] || playerAnimFrames.down;
    let currentFrameImg = frames[this.animFrameIndex % 4];
    let px = Math.round(this.playerRenderX);
    let py = Math.round(this.playerRenderY);
    ctx.drawImage(currentFrameImg, px, py, w, w);

    ctx.draw();
  },

  // 关键：精准匹配 4 帧节奏的平滑移动动画引擎
  animateMovement: function (startR, startC, targetR, targetC, pushedBoxInfo, onComplete) {
    this.isAnimating = true;
    let startX = startC * w;
    let startY = startR * w;
    let targetX = targetC * w;
    let targetY = targetR * w;

    let totalSteps = 8; // 8 帧插值，整除 4 帧动作
    let stepCount = 0;

    let timer = setInterval(() => {
      stepCount++;
      let progress = stepCount / totalSteps;

      // 1. 平滑坐标插值
      this.playerRenderX = startX + (targetX - startX) * progress;
      this.playerRenderY = startY + (targetY - startY) * progress;

      // 2. 正确按比例播放 0 -> 1 -> 2 -> 3 行走动作
      this.animFrameIndex = Math.floor((stepCount / totalSteps) * 4) % 4;

      // 3. 推箱子同步平滑位移
      if (pushedBoxInfo) {
        this.boxRenderPos = {
          x: pushedBoxInfo.startX + (pushedBoxInfo.targetX - pushedBoxInfo.startX) * progress,
          y: pushedBoxInfo.startY + (pushedBoxInfo.targetY - pushedBoxInfo.startY) * progress,
          targetR: pushedBoxInfo.nextR,
          targetC: pushedBoxInfo.nextC
        };
      }

      this.drawCanvas();

      // 4. 到达目标格，归位并锁回第 0 帧（站立状态）
      if (stepCount >= totalSteps) {
        clearInterval(timer);
        this.playerRenderX = targetX;
        this.playerRenderY = targetY;
        this.animFrameIndex = 0; 
        this.boxRenderPos = null;
        this.isAnimating = false;
        if (onComplete) onComplete();
      }
    }, 20); // 20ms * 8 = 160ms，极致平滑
  },

  move: function (rOffset, cOffset, dirName) {
    if (this.isAnimating) return;

    this.setData({ playerDir: dirName });

    let targetR = row + rOffset;
    let targetC = col + cOffset;

    if (targetR < 0 || targetR >= 8 || targetC < 0 || targetC >= 8) {
      this.drawCanvas();
      return;
    }
    if (map[targetR][targetC] === 1) {
      this.drawCanvas();
      return;
    }

    if (box[targetR][targetC] === 4) {
      let nextBoxR = targetR + rOffset;
      let nextBoxC = targetC + cOffset;
      if (nextBoxR < 0 || nextBoxR >= 8 || nextBoxC < 0 || nextBoxC >= 8) {
        this.drawCanvas();
        return;
      }
      if (map[nextBoxR][nextBoxC] === 1 || box[nextBoxR][nextBoxC] === 4) {
        this.drawCanvas();
        return;
      }

      this.saveState();

      box[targetR][targetC] = 0; // 暂存给动画层渲染

      let pushedBoxInfo = {
        startX: targetC * w,
        startY: targetR * w,
        targetX: nextBoxC * w,
        targetY: nextBoxR * w,
        nextR: nextBoxR,
        nextC: nextBoxC
      };

      let oldR = row, oldC = col;
      row = targetR;
      col = targetC;

      this.animateMovement(oldR, oldC, targetR, targetC, pushedBoxInfo, () => {
        box[nextBoxR][nextBoxC] = 4;
        this.setData({ steps: this.data.steps + 1 });
        this.drawCanvas();
        this.checkWin();
      });

    } else {
      this.saveState();
      let oldR = row, oldC = col;
      row = targetR;
      col = targetC;

      this.animateMovement(oldR, oldC, targetR, targetC, null, () => {
        this.setData({ steps: this.data.steps + 1 });
        this.drawCanvas();
        this.checkWin();
      });
    }
  },

  up: function () { this.move(-1, 0, 'up'); },
  down: function () { this.move(1, 0, 'down'); },
  left: function () { this.move(0, -1, 'left'); },
  right: function () { this.move(0, 1, 'right'); },

  touchStart: function (e) {
    this.touchStartX = e.touches[0].clientX;
    this.touchStartY = e.touches[0].clientY;
  },

  touchEnd: function (e) {
    if (this.isAnimating) return;
    let deltaX = e.changedTouches[0].clientX - this.touchStartX;
    let deltaY = e.changedTouches[0].clientY - this.touchStartY;
    let minDistance = 30;

    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      if (deltaX > minDistance) this.right();
      else if (deltaX < -minDistance) this.left();
    } else {
      if (deltaY > minDistance) this.down();
      else if (deltaY < -minDistance) this.up();
    }
  },

  isWin: function () {
    for (let i = 0; i < 8; i++) {
      for (let j = 0; j < 8; j++) {
        if (box[i][j] === 4 && map[i][j] !== 3) return false;
      }
    }
    return true;
  },

  checkWin: function () {
    if (this.isWin()) {
      this.stopTimer();
      let steps = this.data.steps;
      let limit = data.starLimits[this.data.level];
      let star = steps <= limit.three ? 3 : (steps <= limit.two ? 2 : 1);

      let currentUnlocked = wx.getStorageSync('unlockedLevels') || 1;
      if (this.data.level + 2 > currentUnlocked) {
        wx.setStorageSync('unlockedLevels', this.data.level + 2);
      }

      let stars = wx.getStorageSync('levelStars') || [0, 0, 0, 0];
      if (star > (stars[this.data.level] || 0)) {
        stars[this.data.level] = star;
        wx.setStorageSync('levelStars', stars);
      }

      wx.showModal({
        title: '🏆 LEVEL CLEAR!',
        content: `获得评价：${'⭐'.repeat(star)}\n总步数：${steps} 步\n用时：${this.data.timerStr}`,
        confirmText: '下一关',
        cancelText: '重玩',
        success: (res) => {
          if (res.confirm) {
            if (this.data.level < data.maps.length - 1) {
              this.setData({ level: this.data.level + 1 });
              this.initGame();
            } else {
              wx.showToast({ title: '恭喜通关全部关卡！', icon: 'success' });
            }
          } else {
            this.initGame();
          }
        }
      });
    }
  },

  restartGame: function () {
    if (this.isAnimating) return;
    this.initGame();
  },
  
});