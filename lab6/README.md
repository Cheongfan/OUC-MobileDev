# 中国海洋大学《移动软件开发》课程实验六：图片分享社区（Aura 时空留声馆）

`photo-sharing/` 为本人对中国海洋大学 26 夏《移动软件开发》课程实验六的项目源码实现。

本项目基于微信小程序原生框架与腾讯云开发体系开发，以图片分享社区“Aura 时空留声馆”为案例，实现了复古拍立得胶片流、留声胶囊录制与黑胶原声回放、双击爆心点赞、Canvas 2D 拍立得海报动态合成导出、足迹地图与头像气泡图钉联动平移、手机摇一摇重力显影交互、端云一体化资源存储管理以及个人时空档案馆等功能。

---

## 📌 实验目标

1. 综合应用小程序云开发的基础知识创建图片分享社区小程序；
2. 掌握云数据集创建、云存储管理和云函数调用等知识。

---
## 📂 项目目录结构

```text
lab6/                                  # 实验六目录
├── photo-sharing/                     # 实验六 图片分享社区项目根目录
│   ├── cloudfunctions/                # 云开发云函数目录
│   │   ├── getOpenid/                 # 用户唯一身份 openid 获取云函数
│   │   ├── initData/                  # 社区多用户种子数据初始化云函数
│   │   ├── quickstartFunctions/       # 云开发官方模板脚手架函数
│   │   ├── secCheck/                  # 文本与图像内容安全合规审核云函数
│   │   └── toggleLike/                # 高并发原子点赞计数与状态反转云函数
│   ├── miniprogram/                   # 小程序前端项目源码目录
│   │   ├── components/                # 自定义组件目录
│   │   ├── images/                    # 本地静态图像与图标资源
│   │   ├── pages/                     # 页面模块目录
│   │   │   ├── index/                 # 1. 首页（拍立得胶片流 / 城市足迹地图双视图）
│   │   │   ├── add/                   # 2. 个人定格工坊（实拍/相册、录音胶囊、地图打卡）
│   │   │   ├── detail/                # 3. 胶片原件详情页（摇一摇显影、Canvas 海报、下载）
│   │   │   └── homepage/              # 4. 个人主页（时空档案馆与作者公开作品集）
│   │   ├── utils/                     # 工具函数库
│   │   │   └── util.js                # 相对时间计算与云路径生成工具
│   │   ├── app.js                     # 全局生命周期、音频单例管理与云环境初始化
│   │   ├── app.json                   # 路由注册、窗口配置与敏感接口权限声明
│   │   ├── app.wxss                   # 全局暗黑极简与拍立得拟物样式规范
│   │   ├── envList.js                 # 云开发环境 ID 配置文件
│   │   └── sitemap.json               # 搜索引擎索引配置
│   ├── project.config.json            # 核心工程配置文件
│   └── project.private.config.json    # 开发者个人私有配置文件
│
├── README.md                          # 实验六说明文档（本文件）
├── report.md                          # 实验六实验报告（.md）
├── report.pdf                         # 实验六实验报告（.pdf）
└── resources/                         # 文档配图资源 (1.png ~ 14.png)
```

---

## 🖼️ 预览效果

主页胶片流与黑胶原声播放：

<p align="center">
  <img src="resources/1.png" width="48%" alt="拍立得胶片流" />
  <img src="resources/2.png" width="48%" alt="双击点赞与留声播放" />
</p>

胶片详情、显影交互与海报导出：

<p align="center">
  <img src="resources/3.png" width="31%" alt="自适应高斯模糊背景" />
  <img src="resources/4.png" width="31%" alt="摇一摇显影提示" />
  <img src="resources/5.png" width="31%" alt="拍立得海报生成" />
</p>

城市足迹地图与镜头聚焦联动：

<p align="center">
  <img src="resources/7.png" width="48%" alt="足迹地图与头像气泡图钉" />
  <img src="resources/8.png" width="48%" alt="地标卡片切换平移" />
</p>

定格工坊发布、摇一摇显影与个人档案馆：

<p align="center">
  <img src="resources/9.png" width="31%" alt="录音与图文编辑" />
  <img src="resources/11.png" width="31%" alt="真机摇一摇显影" />
  <img src="resources/14.png" width="31%" alt="个人时空档案馆" />
</p>

云端数据库集合与存储管理：

<p align="center">
  <img src="resources/13.png" width="85%" alt="云数据库 photos 集合控制台查验" />
</p>

---

## 🛠️ 实现功能与技术细节

### Canvas 2D 拍立得电影海报生成

详情页摒弃传统上下文接口，采用微信最新 Canvas 2D 离屏节点，自动获取设备物理像素比（DPR）做倍率缩放；自适应裁切照片主体并合成象牙白相纸质感底衬、手写配文、时空地标与打字机日期印戳，调用 `wx.canvasToTempFilePath` 并通过相册授权保存，生成高质感朋友圈海报。

### 视听多模态留声胶囊与黑胶微交互

集成 `wx.getRecorderManager` 实现手机端长按/电脑端点击的双模态音频录制，限制 10 秒并编码为高保真 AAC 格式；首页卡片搭载全局单例 `innerAudioContext`，点击黑胶唱片徽标即可就地换轨播放环境原声并伴随 CSS 循环旋转动效，搭配 350ms 双击判定算法实现爆裂红心与原子点赞。

### 足迹地图联动聚焦与自定义头像图钉

利用原生 `<map>` 组件结合 `customCallout` 插槽机制，将包含经纬度的相片转换为由作者头像与地标文字构成的复合气泡图钉；底部悬浮横滑相片抽屉，点击卡片即捕获目标坐标平滑平移（Camera Fly-to）并自动拉近视点至城市详细级别（`scale: 12`）。

### 暗房朦胧柔焦与摇一摇重力显影

发布时可选开启“暗房神秘显影”模式，卡片默认叠加浅柔焦滤镜（`filter: blur(8rpx)`）；进入详情页后调用 `wx.onAccelerometerChange` 实时监听三轴加速度计，真机晃动速率达到阈值即触发触觉震动反馈，模糊遮罩在 0.8s 内渐变消退，显影状态持久化写入本地白名单。

---

## 💻 本地运行指南

1. **克隆本仓库到本地**：

   ```bash
   git clone https://github.com/Cheongfan/OUC-MobileDev.git
   ```

2. **导入开发者工具**：

   * 打开 **微信开发者工具**，点击 **导入项目**。
   * 选择克隆仓库的实验六项目根目录：`OUC-MobileDev/lab6/photo-sharing`。
   * 填入个人小程序的 `AppID`（需已开通云开发权限）。

3. **云环境配置与真机预览**：

   * 点击工具栏 **云开发**，新建数据库集合 `photos`，并将权限设为 **“所有用户可读，仅创建者及管理员可写”**。
   * 在 `cloudfunctions/` 目录下，分别右键 `getOpenid`、`toggleLike` 云函数，选择 **上传并部署：云端安装依赖**。
   * 点击 **编译** 即可在模拟器中体验地图漫游、留声试听与海报导出；点击 **真机调试** 扫码体验现场拍摄、麦克风留声及手机摇一摇显影功能。