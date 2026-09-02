var tilesetSrc = '/images/tileset.png';
var imgTileSize = 16;
var w = 40;

Page({
  data: {
    currentBrush: 1, // 默认墙体
  },

  mapData: [
    [1,1,1,1,1,1,1,1],
    [1,2,2,2,2,2,2,1],
    [1,2,5,4,3,2,2,1],
    [1,2,2,2,2,2,2,1],
    [1,2,2,2,2,2,2,1],
    [1,2,2,2,2,2,2,1],
    [1,2,2,2,2,2,2,1],
    [1,1,1,1,1,1,1,1]
  ],

  onReady: function () {
    this.ctx = wx.createCanvasContext('editorCanvas');
    this.drawEditor();
  },

  selectBrush: function (e) {
    this.setData({ currentBrush: e.currentTarget.dataset.brush });
  },

  drawTile: function (col, row, x, y) {
    this.ctx.drawImage(tilesetSrc, col * imgTileSize, row * imgTileSize, imgTileSize, imgTileSize, x, y, w, w);
  },

  drawEditor: function () {
    let ctx = this.ctx;
    ctx.clearRect(0, 0, 320, 320);

    for (let i = 0; i < 8; i++) {
      for (let j = 0; j < 8; j++) {
        let x = j * w, y = i * w;
        this.drawTile(0, 1, x, y); // 铺底
        let val = this.mapData[i][j];
        if (val === 1) this.drawTile(0, 0, x, y);
        else if (val === 3) this.drawTile(3, 0, x, y);
        else if (val === 4) this.drawTile(0, 4, x, y);
        else if (val === 5) {
          ctx.drawImage('/images/player/player_01.png', x, y, w, w);
        }
      }
    }
    ctx.draw();
  },

  onCanvasTap: function (e) {
    let x = e.touches[0].x;
    let y = e.touches[0].y;
    let c = Math.floor(x / w);
    let r = Math.floor(y / w);

    if (r >= 0 && r < 8 && c >= 0 && c < 8) {
      this.mapData[r][c] = this.data.currentBrush;
      this.drawEditor();
    }
  },

  clearMap: function () {
    for (let i = 0; i < 8; i++) {
      for (let j = 0; j < 8; j++) {
        this.mapData[i][j] = (i === 0 || i === 7 || j === 0 || j === 7) ? 1 : 2;
      }
    }
    this.drawEditor();
  },

  // 严密的校验逻辑
  validateAndSave: function () {
    let playerNum = 0, boxNum = 0, targetNum = 0;
    for (let i = 0; i < 8; i++) {
      for (let j = 0; j < 8; j++) {
        if (this.mapData[i][j] === 5) playerNum++;
        if (this.mapData[i][j] === 4) boxNum++;
        if (this.mapData[i][j] === 3) targetNum++;
      }
    }

    if (playerNum !== 1) {
      wx.showToast({ title: '地图必须有且仅有1位主角！', icon: 'none' });
      return;
    }
    if (boxNum < 1 || targetNum < 1) {
      wx.showToast({ title: '至少需要1个箱子和1个目标！', icon: 'none' });
      return;
    }
    if (boxNum !== targetNum) {
      wx.showToast({ title: '箱子数量必须等于目标数量！', icon: 'none' });
      return;
    }

    wx.setStorageSync('customMap', this.mapData);
    wx.showToast({ title: '校验通过，地图已保存！', icon: 'success' });
  }
});