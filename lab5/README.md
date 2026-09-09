# 中国海洋大学《移动软件开发》课程实验五：多功能超级计算器

`calculator/` 为本人对中国海洋大学 26 夏《移动软件开发》课程实验五的项目源码实现。

本项目基于 HarmonyOS NEXT 与 ArkTS 声明式开发范式开发，以“多功能超级计算器”为案例，实现了普通计算器、科学计算器（含 2nd 动态换挡与手写视觉流）、程序员计算器（四进制联动与位运算）、双分栏历史记录面板、11 种国际货币网络实时汇率转换、多维单位换算、国标 BMI 健康指数测评、财务金额汉字大写转换以及全沉浸独立设置与纯黑夜间模式等功能。

---

## 📌 实验目标

1. 掌握基础的 ArkTS 程序开发；
2. 开发一个具有自己个性风格的计算器。

---

## 📂 项目目录结构

```text
lab5/                          # 实验五目录
├── calculator/                # 实验五 鸿蒙计算器项目根目录
│   ├── AppScope/              # 全局公共配置与应用资源 (app.json5, 矢量图标)
│   ├── entry/                 # 应用主模块目录
│   │   ├── src/main/ets/      # ArkTS 核心源码目录
│   │   │   ├── common/        # 全局工具库与常量配置
│   │   │   │   ├── CalcConstants.ets  # 全局主题、键位枚举与度量衡系数字典
│   │   │   │   ├── MathEngine.ets     # 工业级逆波兰 (RPN) 数学表达式解析求值引擎
│   │   │   │   └── RateService.ets    # 基于 @ohos.net.http 的网络实时汇率同步服务
│   │   │   ├── model/         # 数据实体模型
│   │   │   │   ├── CurrencyModel.ets  # 11 种国际主流货币基准模型
│   │   │   │   └── HistoryModel.ets   # 历史记录数据结构模型
│   │   │   ├── pages/         # 页面总装入口
│   │   │   │   └── Index.ets          # 主界面（5 模块导航联动、计算核心逻辑总控）
│   │   │   └── views/         # 模块化子视图组件
│   │   │       ├── calculator/        # 计算器核心视图组件
│   │   │       │   ├── HistoryCardView.ets     # 75% 占位历史记录滚动卡片
│   │   │       │   ├── ProgrammerView.ets      # 程序员计算器（四进制联动与位运算）
│   │   │       │   ├── ScientificView.ets      # 6x8 矩阵科学计算器（含 2nd 变身）
│   │   │       │   └── StandardKeypadView.ets  # 6x4 矩阵普通计算器键盘
│   │   │       ├── components/        # 公共基础按键组件
│   │   │       │   ├── CalcKey.ets             # 具备微动效的基础按键组件
│   │   │       │   ├── RightOperatorColumn.ets # 右侧固定运算操作列组件
│   │   │       │   └── ScientificPad.ets       # 科学扩展键区组件
│   │   │       ├── rate/              # 汇率模块组件
│   │   │       │   ├── CurrencySelectSheet.ets # 国际货币选择抽屉组件
│   │   │       │   ├── RateConverterMainView.ets # 汇率主交互与双向换算视图
│   │   │       │   └── RateKeypad.ets          # 专属 4x4 金融数字键盘
│   │   │       ├── settings/          # 系统设置视图 (SettingsView.ets)
│   │   │       └── tools/             # 工具模块 (ToolsMainView.ets)
│   │   ├── src/main/resources/# 项目静态资源（矢量图标、国际化字符表等）
│   │   ├── .gitignore         # 模块级 Git 忽略规则文件
│   │   ├── build-profile.json5# 模块级构建配置
│   │   ├── code-linter.json5  # 模块代码规约检查配置
│   │   ├── hvigorfile.ts      # 模块自动化构建脚本
│   │   ├── module.json5       # 模块配置文件（含 ohos.permission.INTERNET 网络权限）
│   │   ├── obfuscation-rules.txt # 源码混淆规则文件
│   │   └── oh-package.json5   # 模块级依赖声明文件
│   ├── .gitignore             # 工程级 Git 忽略规则文件
│   ├── build-profile.json5    # 工程级构建配置
│   ├── code-linter.json5      # 工程级代码规约检查配置
│   ├── hvigor/                # Hvigor 构建包装器及配置文件
│   ├── hvigorfile.ts          # 工程自动化构建脚本
│   ├── oh-package.json5       # 工程级依赖声明文件
│   └── oh-package-lock.json5  # 依赖版本锁定文件
│
├── README.md                  # 实验五说明文档（本文件）
├── report.md                  # 实验五实验报告（.md）
├── report.pdf                 # 实验五实验报告（.pdf）
└── resources/                 # 文档配图资源（1.png ~ 14.png）
```

---

## 🖼️ 预览效果

核心计算模式展示：

<p align="center">
  <img src="resources/1.png" width="30%" alt="普通计算器" />
  <img src="resources/2.png" width="30%" alt="科学计算器" />
  <img src="resources/3.png" width="30%" alt="程序员计算器" />
</p>

历史记录与汇率转换功能：

<p align="center">
  <img src="resources/4.png" width="24%" alt="普通历史记录" />
  <img src="resources/5.png" width="24%" alt="程序员历史记录" />
  <img src="resources/6.png" width="24%" alt="网络汇率换算" />
  <img src="resources/7.png" width="24%" alt="多币种选择列表" />
</p>

多功能工具与全沉浸黑夜设置：

<p align="center">
  <img src="resources/8.png" width="24%" alt="单位换算" />
  <img src="resources/11.png" width="24%" alt="BMI健康测评" />
  <img src="resources/12.png" width="24%" alt="金额大写转换" />
  <img src="resources/13.png" width="24%" alt="全沉浸黑夜设置" />
</p>

---

## 🛠️ 实现功能与技术细节

### 逆波兰调度场算法与代数求值引擎

彻底摒弃存在安全与精度隐患的解释器方案，在 `MathEngine.ets` 中手写词法解析器（Lexer）与调度场算法（Shunting-Yard Algorithm），将复杂中缀表达式转换为后缀逆波兰队列，精准支持四则运算优先级、括号嵌套、三角函数、方幂开方及后缀阶乘（如 `5!`），杜绝浮点精度丢失与语法混乱。

### 6×8 科学计算器与 2nd 动态换挡

科学计算器采用专业 6 行 8 列矩阵排布。针对高阶数学需求，点击 `2nd` 键可实现局部组件响应式换挡，使 `sin`、`cos`、`tan`、`ln`、`e^x` 瞬间动态变身为 `asin`、`acos`、`atan`、`log2` 与 `2^x`；针对 $x\sqrt{y}$ 落实代数手写输入流，允许用户先输入开方次数再录入底数，直接显示为 `3√(8)` 形式求解。

### 程序员模式四进制联动与位运算

底层采用 32 位整型数据架构，在同一界面内毫秒级联动刷新 HEX、DEC、OCT 与成组 BIN 显示。支持点击任意进制行作为输入基准，并具备严格的键位动态置灰机制（如 BIN 模式仅放行 `0` 与 `1`）；全面支持 `AND`、`OR`、`XOR`、`NOT`、`<<`（左移）位运算与独立的历史记录追溯。

### HTTP 网络实时汇率与全沉浸防漏白设计

借助 `@ohos.net.http` 模块异步对接公开国际金融汇率 API，提供网络数据自动同步与手动轮询刷新机制；开发独立全屏 `SettingsView` 规避多模态弹窗竞争阻塞，并利用 `.expandSafeArea` 属性穿透状态栏与底部手势区，呈现纯黑 OLED 调色，彻底根除了边缘“漏白”瑕疵。

---

## 💻 本地运行指南

1. **克隆本仓库到本地**：

   ```bash
   git clone https://github.com/Cheongfan/OUC-MobileDev.git
   ```

2. **导入 DevEco Studio**：

   * 打开 **DevEco Studio**，点击 **Open**。
   * 选择克隆仓库的实验五项目根目录：`OUC-MobileDev/lab5/calculator`。
   * 等待项目完成 Gradle/Hvigor 同步及工程索引构建。

3. **编译预览与模拟器运行**：

   * 启动 DevEco Studio 顶部的 **Device Manager**，开启 Phone 规格的 HarmonyOS 模拟器。
   * 点击工具栏绿色的 **Run 'entry' (▶)** 按钮，系统将自动进行 HAP 包编译并推送至模拟器。
   * 即可在仿真界面中体验多模式计算切换、实时网络汇率同步、多维单位换算、黑夜模式切换与按键触觉反馈。