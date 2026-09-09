// entry/src/main/ets/pages/Index.ets
import { AppColorSystem, CalcMode, UnitData, UnitItem } from '../common/CalcConstants';
import { MathEngine } from '../common/MathEngine';
import { HistoryItem } from '../model/HistoryModel';
import { StandardKeypadView } from '../views/calculator/StandardKeypadView';
import { HistoryCardView } from '../views/calculator/HistoryCardView';
import { ProgrammerView } from '../views/calculator/ProgrammerView';
import { ScientificView } from '../views/calculator/ScientificView';
import { RateConverterMainView } from '../views/rate/RateConverterMainView';
import { SettingsView } from '../views/settings/SettingsView';

@Entry
@Component
struct Index {
  // 5 大模块索引: 0: 计算, 1: 汇率, 2: 换算, 3: BMI, 4: 大写
  @State currentTabIndex: number = 0;

  // 全局独立黑夜模式与强调色
  @State isDarkMode: boolean = false;
  @State primaryColor: string = '#004B97'; // 默认中国海大蓝
  @State isVibrateEnabled: boolean = true;

  // 页面切换：是否正在打开设置全屏页 (彻底解决弹窗时序Bug)
  @State isShowSettingsPage: boolean = false;

  // 模式状态
  @State calcMode: CalcMode = CalcMode.STANDARD;
  @State isShowModeSheet: boolean = false;

  // 计算状态
  @State expression: string = '6÷';
  @State previewResult: string = '6';
  @State isShowHistory: boolean = false;
  @State memoryVal: number = 0;

  // 历史记录
  @State historyList: Array<HistoryItem> = [
    new HistoryItem('1,774.93333333÷60', '29.582222222'),
    new HistoryItem('2,662.4÷1.5', '1,774.93333333'),
    new HistoryItem('2.6×1,024', '2,662.4'),
    new HistoryItem('120÷60', '2'),
    new HistoryItem('40×3', '120')
  ];
  @State progHistoryList: Array<HistoryItem> = [];

  // ===== 独立功能状态 =====
  // 1. 换算
  @State unitCategory: number = 0;
  @State sourceUnitIdx: number = 0;
  @State targetUnitIdx: number = 1;
  @State unitInputVal: string = '1';
  @State unitResultVal: string = '100';

  // 2. BMI
  @State bmiHeight: string = '175.5';
  @State bmiWeight: string = '65.0';
  @State bmiScore: string = '21.1';
  @State bmiLevel: string = '标准健康';
  @State bmiColor: string = '#10B981';

  // 3. 大写金额
  @State rmbInputVal: string = '123456.78';
  @State rmbResultVal: string = '壹拾贰万叁仟肆佰伍拾陆元柒角捌分';

  build() {
    Stack() {
      if (this.isShowSettingsPage) {
        // 全屏独立设置页面
        SettingsView({
          isDarkMode: $isDarkMode,
          primaryColor: $primaryColor,
          isVibrateEnabled: $isVibrateEnabled,
          onBack: (): void => {
            this.isShowSettingsPage = false;
          },
          onClearAllHistory: (): void => {
            this.historyList = [];
            this.progHistoryList = [];
            this.isShowSettingsPage = false;
          }
        })
      } else {
        // 主界面
        Column() {
          // 顶部导航栏 (5 模块并列 + 齿轮)
          this.GlobalHeaderBar()

          // 核心内容区 (5 个大功能 Tab)
          Tabs({ index: this.currentTabIndex }) {
            // Tab 0: 计算器 (标准/科学/程序员)
            TabContent() {
              if (this.calcMode === CalcMode.PROGRAMMER) {
                Column() {
                  this.CalcToolBar()
                  ProgrammerView({
                    isDarkMode: this.isDarkMode,
                    primaryColor: this.primaryColor,
                    progHistoryList: $progHistoryList,
                    isShowHistory: $isShowHistory // 统一绑定顶层工具栏时钟状态
                  })
                    .layoutWeight(1)
                }
                .width('100%')
                .height('100%')
              } else {
                this.CalculatorScreen()
              }
            }

            // Tab 1: 汇率
            TabContent() {
              RateConverterMainView({
                primaryColor: this.primaryColor,
                isDarkMode: this.isDarkMode // 传入黑夜模式
              })
            }

            // Tab 2: 独立单位换算
            TabContent() {
              this.UnitConverterPage()
            }

            // Tab 3: 独立 BMI 体质测评
            TabContent() {
              this.BMIPage()
            }

            // Tab 4: 独立大写金额转换
            TabContent() {
              this.RMBPage()
            }
          }
          .barHeight(0)
          .animationDuration(180)
          .onChange((idx: number): void => {
            this.currentTabIndex = idx;
          })
          .layoutWeight(1)
        }
        .width('100%')
        .height('100%')
        .backgroundColor(AppColorSystem.getPageBg(this.isDarkMode))
        // 关键沉浸式配置：彻底消除上下漏白
        .expandSafeArea([SafeAreaType.SYSTEM], [SafeAreaEdge.TOP, SafeAreaEdge.BOTTOM])
        .bindSheet($$this.isShowModeSheet, this.ModeSelectSheet(), {
          height: 230,
          dragBar: true
        })
      }
    }
    .width('100%')
    .height('100%')
    .backgroundColor(AppColorSystem.getPageBg(this.isDarkMode))
  }

  // ==========================================
  //  顶栏组件 (5 模块并列，彻底解耦工具页)
  // ==========================================
  @Builder
  GlobalHeaderBar() {
    Row() {
      // 5 模块导航项
      Row({ space: 18 }) {
        this.NavTabItem('计算', 0)
        this.NavTabItem('汇率', 1)
        this.NavTabItem('换算', 2)
        this.NavTabItem('BMI', 3)
        this.NavTabItem('大写', 4)
      }

      Blank()

      // 右上角设置齿轮按钮 (秒开独立页面)
      Stack({ alignContent: Alignment.Center }) {
        Image($r('app.media.ic_settings'))
          .width(22)
          .height(22)
          .fillColor(AppColorSystem.getTextPrimary(this.isDarkMode)) // 自动跟随黑夜模式变白/黑
      }
      .width(36)
      .height(36)
      .borderRadius(18)
      .onClick((): void => {
        this.isShowSettingsPage = true;
      })
    }
    .width('100%')
    .padding({ left: 20, right: 16, top: 44, bottom: 8 })
  }

  @Builder
  NavTabItem(title: string, index: number) {
    Column() {
      Text(title)
        .fontSize(this.currentTabIndex === index ? 20 : 16)
        .fontWeight(this.currentTabIndex === index ? FontWeight.Bold : FontWeight.Normal)
        .fontColor(this.currentTabIndex === index ? this.primaryColor : AppColorSystem.getTextSecondary(this.isDarkMode))

      if (this.currentTabIndex === index) {
        Divider()
          .strokeWidth(3)
          .color(this.primaryColor)
          .width(22)
          .borderRadius(1.5)
          .margin({ top: 3 })
      } else {
        Stack().height(6)
      }
    }
    .onClick((): void => {
      this.currentTabIndex = index;
    })
  }

  // 计算器模式切换条
  @Builder
  CalcToolBar() {
    Row({ space: 18 }) {
      Image(this.isShowHistory ? $r('app.media.ic_undo') : $r('app.media.ic_history'))
        .width(22)
        .height(22)
        .fillColor(AppColorSystem.getTextSecondary(this.isDarkMode)) // 颜色柔和适配
        .onClick((): void => {
          this.isShowHistory = !this.isShowHistory;
        })

      Row({ space: 4 }) {
        Text(this.calcMode === CalcMode.PROGRAMMER ? 'MODE: 程序员' : (this.calcMode === CalcMode.SCIENTIFIC ? 'MODE: 科学' : 'MODE: 标准'))
          .fontSize(13)
          .fontWeight(FontWeight.Bold)
          .fontColor(this.calcMode !== CalcMode.STANDARD ? this.primaryColor : AppColorSystem.getTextSecondary(this.isDarkMode))
        Text('▼').fontSize(9).fontColor(AppColorSystem.getTextSecondary(this.isDarkMode))
      }
      .border({ width: 1, color: this.calcMode !== CalcMode.STANDARD ? this.primaryColor : '#A0A6B2', radius: 6 })
      .padding({ left: 8, right: 8, top: 4, bottom: 4 })
      .onClick((): void => {
        this.isShowModeSheet = true;
      })

      Blank()
    }
    .width('100%')
    .padding({ left: 24, right: 24, top: 4, bottom: 8 })
  }

  // 标准与科学计算器屏
  @Builder
  CalculatorScreen() {
    Column() {
      Column() {
        Text(this.expression || '0')
          .fontSize(this.calcMode === CalcMode.SCIENTIFIC ? 38 : 48)
          .fontWeight(FontWeight.Lighter)
          .fontColor(AppColorSystem.getTextPrimary(this.isDarkMode))
          .maxLines(2)
          .textAlign(TextAlign.End)
          .width('100%')

        Text(this.previewResult)
          .fontSize(26)
          .fontColor(AppColorSystem.getTextSecondary(this.isDarkMode))
          .textAlign(TextAlign.End)
          .width('100%')
          .margin({ top: 4 })
          .height(30)
      }
      .width('100%')
      .padding({ left: 24, right: 24, top: 6, bottom: 4 })

      this.CalcToolBar()

      Row() {
        if (this.isShowHistory) {
          HistoryCardView({
            historyList: $historyList,
            themeColor: this.primaryColor,
            onItemClick: (val: string): void => {
              this.expression = val;
              this.previewResult = '';
              this.isShowHistory = false;
            },
            onClearClick: (): void => {
              this.historyList = [];
            }
          })
            .layoutWeight(3)
            .height('100%')

          Column({ space: 12 }) {
            this.SideBtn('←')
            this.SideBtn('÷')
            this.SideBtn('×')
            this.SideBtn('-')
            this.SideBtn('+')
            this.SideEqualBtn()
          }
          .layoutWeight(1)
          .height('100%')
          .justifyContent(FlexAlign.SpaceAround)
        } else if (this.calcMode === CalcMode.SCIENTIFIC) {
          ScientificView({
            currentTheme: {
              id: 'custom',
              name: '',
              primaryColor: this.primaryColor,
              pageBgColor: AppColorSystem.getPageBg(this.isDarkMode),
              cardBgColor: AppColorSystem.getCardBg(this.isDarkMode),
              textColorPrimary: AppColorSystem.getTextPrimary(this.isDarkMode),
              textColorSecondary: AppColorSystem.getTextSecondary(this.isDarkMode),
              keyBgColor: AppColorSystem.getKeyBg(this.isDarkMode),
              isDark: this.isDarkMode
            },
            onKeyClick: (k: string): void => this.onKey(k),
            onEqualClick: (): void => this.onEqual()
          })
        } else {
          StandardKeypadView({
            currentTheme: {
              id: 'custom',
              name: '',
              primaryColor: this.primaryColor,
              pageBgColor: AppColorSystem.getPageBg(this.isDarkMode),
              cardBgColor: AppColorSystem.getCardBg(this.isDarkMode),
              textColorPrimary: AppColorSystem.getTextPrimary(this.isDarkMode),
              textColorSecondary: AppColorSystem.getTextSecondary(this.isDarkMode),
              keyBgColor: AppColorSystem.getKeyBg(this.isDarkMode),
              isDark: this.isDarkMode
            },
            hasMemory: this.memoryVal !== 0,
            onKeyClick: (k: string): void => this.onKey(k),
            onEqualClick: (): void => this.onEqual()
          })
        }
      }
      .layoutWeight(1)
      .width('100%')
      .padding({ left: 12, right: 12, bottom: 18 })
    }
    .width('100%')
    .height('100%')
  }

  @Builder
  SideBtn(label: string) {
    Text(label)
      .fontSize(30)
      .fontColor(this.primaryColor)
      .width(60)
      .height(56)
      .textAlign(TextAlign.Center)
      .onClick((): void => {
        this.onKey(label);
      })
  }

  @Builder
  SideEqualBtn() {
    Button() {
      Text('=').fontSize(32).fontColor('#FFFFFF')
    }
    .width(60)
    .height(60)
    .borderRadius(30)
    .backgroundColor(this.primaryColor)
    .onClick((): void => {
      this.onEqual();
    })
  }

  // ==========================================
  //  独立功能页 1：单位换算 (Tab 2)
  // ==========================================
  @Builder
  UnitConverterPage() {
    Column({ space: 14 }) {
      Row({ space: 10 }) {
        this.CategoryBtn('长度', 0)
        this.CategoryBtn('重量', 1)
        this.CategoryBtn('面积', 2)
      }.width('100%')

      Column({ space: 8 }) {
        Row() {
          Text('源单位: ' + this.getUnitList()[this.sourceUnitIdx].name).fontSize(14).fontColor(AppColorSystem.getTextSecondary(this.isDarkMode))
          Blank()
          Text('切换单位 ❯').fontSize(13).fontColor(this.primaryColor)
            .onClick((): void => {
              this.sourceUnitIdx = (this.sourceUnitIdx + 1) % this.getUnitList().length;
              this.recalcUnit();
            })
        }.width('100%')

        TextInput({ text: this.unitInputVal })
          .type(InputType.NUMBER_DECIMAL)
          .fontSize(28)
          .fontWeight(FontWeight.Bold)
          .fontColor(AppColorSystem.getTextPrimary(this.isDarkMode))
          .backgroundColor(this.isDarkMode ? '#24242A' : '#F5F7FA')
          .height(56)
          .borderRadius(12)
          .onChange((v: string): void => {
            this.unitInputVal = v;
            this.recalcUnit();
          })
      }
      .padding(18)
      .backgroundColor(AppColorSystem.getCardBg(this.isDarkMode))
      .borderRadius(16)

      Column({ space: 8 }) {
        Row() {
          Text('目标单位: ' + this.getUnitList()[this.targetUnitIdx].name).fontSize(14).fontColor(AppColorSystem.getTextSecondary(this.isDarkMode))
          Blank()
          Text('切换单位 ❯').fontSize(13).fontColor(this.primaryColor)
            .onClick((): void => {
              this.targetUnitIdx = (this.targetUnitIdx + 1) % this.getUnitList().length;
              this.recalcUnit();
            })
        }.width('100%')

        Text(this.unitResultVal)
          .fontSize(32)
          .fontWeight(FontWeight.Bold)
          .fontColor(this.primaryColor)
          .width('100%')
          .margin({ top: 6 })
      }
      .padding(18)
      .backgroundColor(AppColorSystem.getCardBg(this.isDarkMode))
      .borderRadius(16)
    }
    .padding(18)
    .width('100%')
    .height('100%')
  }

  @Builder
  CategoryBtn(label: string, idx: number) {
    Button(label)
      .type(ButtonType.Normal)
      .borderRadius(8)
      .height(34)
      .backgroundColor(this.unitCategory === idx ? this.primaryColor : (this.isDarkMode ? '#282830' : '#E5E7EB'))
      .fontColor(this.unitCategory === idx ? '#FFFFFF' : AppColorSystem.getTextSecondary(this.isDarkMode))
      .layoutWeight(1)
      .onClick((): void => {
        this.unitCategory = idx;
        this.sourceUnitIdx = 0;
        this.targetUnitIdx = 1;
        this.recalcUnit();
      })
  }

  // ==========================================
  //  独立功能页 2：BMI 健康体质评测 (Tab 3)
  // ==========================================
  @Builder
  BMIPage() {
    Column({ space: 16 }) {
      Column({ space: 14 }) {
        Row() {
          Text('身高 (cm):').fontSize(16).fontColor(AppColorSystem.getTextPrimary(this.isDarkMode)).width(90)
          TextInput({ text: this.bmiHeight })
            .type(InputType.NUMBER_DECIMAL)
            .height(46)
            .layoutWeight(1)
            .backgroundColor(this.isDarkMode ? '#24242A' : '#F5F7FA')
            .fontColor(AppColorSystem.getTextPrimary(this.isDarkMode))
            .borderRadius(10)
            .onChange((v: string): void => {
              this.bmiHeight = v;
              this.recalcBMI();
            })
        }

        Row() {
          Text('体重 (kg):').fontSize(16).fontColor(AppColorSystem.getTextPrimary(this.isDarkMode)).width(90)
          TextInput({ text: this.bmiWeight })
            .type(InputType.NUMBER_DECIMAL)
            .height(46)
            .layoutWeight(1)
            .backgroundColor(this.isDarkMode ? '#24242A' : '#F5F7FA')
            .fontColor(AppColorSystem.getTextPrimary(this.isDarkMode))
            .borderRadius(10)
            .onChange((v: string): void => {
              this.bmiWeight = v;
              this.recalcBMI();
            })
        }
      }
      .padding(18)
      .backgroundColor(AppColorSystem.getCardBg(this.isDarkMode))
      .borderRadius(16)

      Column({ space: 10 }) {
        Text('身体健康指数 (BMI)').fontSize(14).fontColor(AppColorSystem.getTextSecondary(this.isDarkMode))
        Text(this.bmiScore).fontSize(44).fontWeight(FontWeight.Bold).fontColor(this.bmiColor)
        Text(this.bmiLevel)
          .fontSize(15).fontColor('#FFFFFF').backgroundColor(this.bmiColor)
          .padding({ left: 16, right: 16, top: 4, bottom: 4 }).borderRadius(12)
      }
      .width('100%')
      .padding(24)
      .backgroundColor(AppColorSystem.getCardBg(this.isDarkMode))
      .borderRadius(16)
      .alignItems(HorizontalAlign.Center)
    }
    .padding(18)
    .width('100%')
    .height('100%')
  }

  // ==========================================
  //  独立功能页 3：大写金额转换 (Tab 4)
  // ==========================================
  @Builder
  RMBPage() {
    Column({ space: 16 }) {
      Column({ space: 10 }) {
        Text('输入数字金额 (元):').fontSize(14).fontColor(AppColorSystem.getTextSecondary(this.isDarkMode))
        TextInput({ text: this.rmbInputVal })
          .type(InputType.NUMBER_DECIMAL)
          .fontSize(24)
          .fontWeight(FontWeight.Bold)
          .fontColor(AppColorSystem.getTextPrimary(this.isDarkMode))
          .backgroundColor(this.isDarkMode ? '#24242A' : '#F5F7FA')
          .borderRadius(12)
          .height(54)
          .onChange((v: string): void => {
            this.rmbInputVal = v;
            this.recalcRMB();
          })
      }
      .padding(18)
      .backgroundColor(AppColorSystem.getCardBg(this.isDarkMode))
      .borderRadius(16)

      Column({ space: 10 }) {
        Text('中国银行规范大写:').fontSize(14).fontColor(AppColorSystem.getTextSecondary(this.isDarkMode))
        Text(this.rmbResultVal)
          .fontSize(20)
          .fontWeight(FontWeight.Medium)
          .fontColor(this.primaryColor)
          .width('100%')
          .margin({ top: 4, bottom: 6 })
      }
      .padding(18)
      .backgroundColor(AppColorSystem.getCardBg(this.isDarkMode))
      .borderRadius(16)
    }
    .padding(18)
    .width('100%')
    .height('100%')
  }

  // 模式选择抽屉
  @Builder
  ModeSelectSheet() {
    Column({ space: 10 }) {
      Text('选择计算模式')
        .fontSize(18)
        .fontWeight(FontWeight.Bold)
        .fontColor(AppColorSystem.getTextPrimary(this.isDarkMode))
        .width('100%')
        .margin({ top: 6, bottom: 4 })

      this.ModeBtn('标准计算器', CalcMode.STANDARD)
      this.ModeBtn('科学计算器', CalcMode.SCIENTIFIC)
      this.ModeBtn('程序员计算器', CalcMode.PROGRAMMER)
    }
    .padding(20)
    .backgroundColor(AppColorSystem.getCardBg(this.isDarkMode))
  }

  @Builder
  ModeBtn(name: string, target: CalcMode) {
    Row() {
      Text(name)
        .fontSize(16)
        .fontWeight(this.calcMode === target ? FontWeight.Bold : FontWeight.Normal)
        .fontColor(this.calcMode === target ? this.primaryColor : AppColorSystem.getTextPrimary(this.isDarkMode))
      Blank()
      if (this.calcMode === target) {
        Text('✓').fontSize(18).fontWeight(FontWeight.Bold).fontColor(this.primaryColor)
      }
    }
    .width('100%')
    .padding(12)
    .borderRadius(10)
    .backgroundColor(this.calcMode === target ? (this.isDarkMode ? '#2A303C' : '#EFF6FF') : Color.Transparent)
    .onClick((): void => {
      this.calcMode = target;
      this.isShowModeSheet = false;
    })
  }

  // ==========================================
  //  计算与工具逻辑
  // ==========================================
  private getUnitList(): UnitItem[] {
    if (this.unitCategory === 0) return UnitData.LENGTH_UNITS;
    if (this.unitCategory === 1) return UnitData.WEIGHT_UNITS;
    return UnitData.AREA_UNITS;
  }

  private recalcUnit(): void {
    const list: UnitItem[] = this.getUnitList();
    const val: number = parseFloat(this.unitInputVal) || 0;
    const base: number = val * list[this.sourceUnitIdx].factorToBase;
    const res: number = base / list[this.targetUnitIdx].factorToBase;
    this.unitResultVal = res >= 1000000 ? res.toExponential(4) : res.toFixed(4).replace(/\.?0+$/, '');
  }

  private recalcBMI(): void {
    const h: number = (parseFloat(this.bmiHeight) || 0) / 100;
    const w: number = parseFloat(this.bmiWeight) || 0;
    if (h > 0 && w > 0) {
      const b: number = w / (h * h);
      this.bmiScore = b.toFixed(1);
      if (b < 18.5) { this.bmiLevel = '偏瘦'; this.bmiColor = '#3B82F6'; }
      else if (b < 24.0) { this.bmiLevel = '标准健康'; this.bmiColor = '#10B981'; }
      else if (b < 28.0) { this.bmiLevel = '超重'; this.bmiColor = '#F59E0B'; }
      else { this.bmiLevel = '肥胖'; this.bmiColor = '#EF4444'; }
    }
  }

  private recalcRMB(): void {
    const n: number = parseFloat(this.rmbInputVal);
    if (isNaN(n)) { this.rmbResultVal = '零元整'; return; }
    this.rmbResultVal = this.toRMBWords(n);
  }

  private toRMBWords(money: number): string {
    if (money === 0) return '零元整';
    const fraction: string[] = ['角', '分'];
    const digit: string[] = ['零', '壹', '贰', '叁', '肆', '伍', '陆', '柒', '捌', '玖'];
    const unit: string[][] = [['元', '万', '亿'], ['', '拾', '佰', '仟']];
    let head: string = money < 0 ? '负' : '';
    money = Math.abs(money);
    let s: string = '';
    for (let i = 0; i < fraction.length; i++) {
      const fVal: number = Math.floor(money * 10 * Math.pow(10, i)) % 10;
      if (fVal > 0) s += (digit[fVal] + fraction[i]);
    }
    if (!s) s = '整';
    let integerPart: number = Math.floor(money);
    let unitPos: number = 0;
    let strInt: string = '';
    while (integerPart > 0) {
      let section: string = '';
      const secVal: number = integerPart % 10000;
      for (let i = 0; i < 4 && i < secVal.toString().length; i++) {
        const d: number = Math.floor(secVal / Math.pow(10, i)) % 10;
        if (d > 0) section = digit[d] + unit[1][i] + section;
        else if (section && !section.startsWith('零')) section = '零' + section;
      }
      if (secVal > 0) strInt = section + unit[0][unitPos] + strInt;
      unitPos++;
      integerPart = Math.floor(integerPart / 10000);
    }
    return head + (strInt ? strInt : '零元') + s;
  }

  onKey(key: string): void {
    if (['2nd', 'Rad', 'EE'].includes(key)) return;

    if (key === 'AC') {
      this.expression = '';
      this.previewResult = '';
    } else if (key === '←') {
      if (this.expression.length > 0) {
        this.expression = this.expression.slice(0, -1);
        this.previewResult = MathEngine.evaluate(this.expression);
      }
    } else if (key === '+/-') {
      if (this.expression.startsWith('-')) this.expression = this.expression.slice(1);
      else if (this.expression) this.expression = '-' + this.expression;
      this.previewResult = MathEngine.evaluate(this.expression);
    } else if (['+', '-', '×', '÷', '%'].includes(key)) {
      const last: string = this.expression.slice(-1);
      if (['+', '-', '×', '÷'].includes(last)) this.expression = this.expression.slice(0, -1) + key;
      else if (this.expression) this.expression += key;
      this.previewResult = MathEngine.evaluate(this.expression);
    } else if (['sin', 'cos', 'tan', 'asin', 'acos', 'atan', 'sinh', 'cosh', 'tanh', 'ln', 'lg', 'log2'].includes(key)) {
      // 包含 2nd 反三角函数与对数
      this.expression += `${key}(`;
      this.previewResult = MathEngine.evaluate(this.expression);
    } else if (key === '√') {
      this.expression += '√(';
      this.previewResult = MathEngine.evaluate(this.expression);
    } else if (key === 'x√y') {
      // 【流派 B 核心实现】：先输开方次数 3，再按 x√y，直接输出 "√("，形成 "3√("
      if (this.expression && !['+', '-', '×', '÷', '('].includes(this.expression.slice(-1))) {
        this.expression += '√(';
      } else {
        // 前面无数字时，默认以 2 作为开方次数
        this.expression += '2√(';
      }
      this.previewResult = MathEngine.evaluate(this.expression);
    } else if (key === '1/x') {
      // 未知数由用户填，拒绝写死 1
      if (!this.expression || ['+', '-', '×', '÷', '('].includes(this.expression.slice(-1))) {
        this.expression += '1÷(';
      } else {
        this.expression = `1÷(${this.expression})`;
      }
      this.previewResult = MathEngine.evaluate(this.expression);
    } else if (key === 'e^x') {
      this.expression += 'e^(';
      this.previewResult = MathEngine.evaluate(this.expression);
    } else if (key === '2^x') {
      this.expression += '2^(';
      this.previewResult = MathEngine.evaluate(this.expression);
    } else if (key === '10^x') {
      this.expression += '10^(';
      this.previewResult = MathEngine.evaluate(this.expression);
    } else if (key === 'y^x') {
      this.expression += '^';
    } else if (key === 'x!') {
      if (this.expression && !['+', '-', '×', '÷', '('].includes(this.expression.slice(-1))) {
        this.expression += '!';
        this.previewResult = MathEngine.evaluate(this.expression);
      }
    } else if (key === 'x²') {
      if (this.expression && !['+', '-', '×', '÷', '('].includes(this.expression.slice(-1))) {
        this.expression += '^2';
        this.previewResult = MathEngine.evaluate(this.expression);
      }
    } else if (key === 'x³') {
      if (this.expression && !['+', '-', '×', '÷', '('].includes(this.expression.slice(-1))) {
        this.expression += '^3';
        this.previewResult = MathEngine.evaluate(this.expression);
      }
    } else if (key === 'Rand') {
      const r: string = Math.random().toFixed(4);
      this.expression += r;
      this.previewResult = MathEngine.evaluate(this.expression);
    } else if (key === 'mc') {
      this.memoryVal = 0;
    } else if (key === 'm+') {
      this.memoryVal += (parseFloat(this.previewResult || this.expression) || 0);
    } else if (key === 'm-') {
      this.memoryVal -= (parseFloat(this.previewResult || this.expression) || 0);
    } else if (key === 'mr') {
      this.expression += this.memoryVal.toString();
      this.previewResult = MathEngine.evaluate(this.expression);
    } else {
      if (this.expression === '0' && key !== '.') this.expression = key;
      else this.expression += key;
      this.previewResult = MathEngine.evaluate(this.expression);
    }
  }

  onEqual(): void {
    if (!this.expression) return;
    const res: string = MathEngine.evaluate(this.expression);
    if (res && res !== '错误') {
      this.historyList.unshift(new HistoryItem(this.expression, res));
      this.expression = res;
      this.previewResult = '';
    }
  }
}