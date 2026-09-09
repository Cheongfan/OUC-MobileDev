// entry/src/main/ets/views/tools/ToolsMainView.ets
import { ThemeConfig, UnitData, UnitItem } from '../../common/CalcConstants';

@Component
export struct ToolsMainView {
  @Prop currentTheme: ThemeConfig;

  // 0: 单位换算, 1: BMI健康计算, 2: 人民币大写金额
  @State activeToolTab: number = 0;

  // ===== 单位换算状态 =====
  @State unitCategory: number = 0; // 0: 长度, 1: 重量
  @State sourceUnitIndex: number = 0;
  @State targetUnitIndex: number = 5; // 默认 米 -> 英尺
  @State unitInputValue: string = '1';
  @State unitResultValue: string = '3.2808';

  // ===== BMI 模块状态 (支持小数输入) =====
  @State heightStr: string = '175.5'; // cm
  @State weightStr: string = '65.2';  // kg
  @State bmiValue: string = '21.2';
  @State bmiTag: string = '标准 (健康)';
  @State bmiColor: string = '#10B981';

  // ===== 人民币大写模块状态 =====
  @State rmbInput: string = '123456.78';
  @State rmbOutput: string = '壹拾贰万叁仟肆佰伍拾陆元柒角捌分';

  aboutToAppear(): void {
    this.recalcUnit();
    this.recalcBMI();
    this.recalcRMB();
  }

  build() {
    Column() {
      // 1. 顶部三段式切换标签
      Row({ space: 8 }) {
        this.TabHeaderBtn('多维单位换算', 0)
        this.TabHeaderBtn('BMI 评测', 1)
        this.TabHeaderBtn('大写金额转换', 2)
      }
      .width('100%')
      .padding({ left: 16, right: 16, top: 10, bottom: 12 })

      // 2. 核心内容滚动区
      Scroll() {
        Column({ space: 16 }) {
          if (this.activeToolTab === 0) {
            this.UnitConverterModule()
          } else if (this.activeToolTab === 1) {
            this.BMIModule()
          } else {
            this.RMBModule()
          }
        }
        .padding({ left: 16, right: 16, bottom: 28 })
      }
      .layoutWeight(1)
      .width('100%')
      .edgeEffect(EdgeEffect.Spring)
    }
    .width('100%')
    .height('100%')
    .backgroundColor(this.currentTheme.pageBgColor)
  }

  @Builder
  TabHeaderBtn(title: string, index: number) {
    Button(title)
      .type(ButtonType.Capsule)
      .backgroundColor(this.activeToolTab === index ? this.currentTheme.primaryColor : (this.currentTheme.isDark ? '#262630' : '#E8EBF0'))
      .fontColor(this.activeToolTab === index ? '#FFFFFF' : this.currentTheme.textColorSecondary)
      .fontSize(14)
      .fontWeight(FontWeight.Medium)
      .height(38)
      .layoutWeight(1)
      .onClick((): void => {
        this.activeToolTab = index;
      })
  }

  // ==========================================
  //  模块 1：专业级多维单位换算器
  // ==========================================
  @Builder
  UnitConverterModule() {
    Column({ space: 14 }) {
      // 分类切换 (长度 / 重量)
      Row({ space: 10 }) {
        Button('长度维度')
          .type(ButtonType.Normal)
          .borderRadius(8)
          .height(32)
          .backgroundColor(this.unitCategory === 0 ? this.currentTheme.primaryColor : '#D2D7DF')
          .fontColor('#FFFFFF')
          .fontSize(13)
          .onClick((): void => {
            this.unitCategory = 0;
            this.sourceUnitIndex = 0;
            this.targetUnitIndex = 1;
            this.recalcUnit();
          })

        Button('重量维度')
          .type(ButtonType.Normal)
          .borderRadius(8)
          .height(32)
          .backgroundColor(this.unitCategory === 1 ? this.currentTheme.primaryColor : '#D2D7DF')
          .fontColor('#FFFFFF')
          .fontSize(13)
          .onClick((): void => {
            this.unitCategory = 1;
            this.sourceUnitIndex = 0;
            this.targetUnitIndex = 1;
            this.recalcUnit();
          })
      }
      .width('100%')

      // 输入卡片（源单位）
      Column({ space: 8 }) {
        Row() {
          Text('源单位: ' + this.getCurrentUnitList()[this.sourceUnitIndex].name)
            .fontSize(14)
            .fontColor(this.currentTheme.textColorSecondary)
          Blank()
          Text('切换单位 ❯')
            .fontSize(13)
            .fontColor(this.currentTheme.primaryColor)
            .onClick((): void => {
              this.sourceUnitIndex = (this.sourceUnitIndex + 1) % this.getCurrentUnitList().length;
              this.recalcUnit();
            })
        }.width('100%')

        // 关键点：使用 NUMBER_DECIMAL 允许输入负数与小数点
        TextInput({ text: this.unitInputValue })
          .type(InputType.NUMBER_DECIMAL)
          .fontSize(28)
          .fontWeight(FontWeight.Bold)
          .fontColor(this.currentTheme.textColorPrimary)
          .backgroundColor(this.currentTheme.isDark ? '#262630' : '#F4F6F9')
          .borderRadius(12)
          .height(56)
          .onChange((val: string): void => {
            this.unitInputValue = val;
            this.recalcUnit();
          })
      }
      .padding(18)
      .backgroundColor(this.currentTheme.cardBgColor)
      .borderRadius(16)

      // 换算结果卡片（目标单位）
      Column({ space: 8 }) {
        Row() {
          Text('换算至: ' + this.getCurrentUnitList()[this.targetUnitIndex].name)
            .fontSize(14)
            .fontColor(this.currentTheme.textColorSecondary)
          Blank()
          Text('切换单位 ❯')
            .fontSize(13)
            .fontColor(this.currentTheme.primaryColor)
            .onClick((): void => {
              this.targetUnitIndex = (this.targetUnitIndex + 1) % this.getCurrentUnitList().length;
              this.recalcUnit();
            })
        }.width('100%')

        Text(this.unitResultValue)
          .fontSize(32)
          .fontWeight(FontWeight.Bold)
          .fontColor(this.currentTheme.primaryColor)
          .width('100%')
          .margin({ top: 6 })
      }
      .padding(18)
      .backgroundColor(this.currentTheme.cardBgColor)
      .borderRadius(16)
    }
  }

  // ==========================================
  //  模块 2：BMI 健康评测 (完整支持小数)
  // ==========================================
  @Builder
  BMIModule() {
    Column({ space: 14 }) {
      Column({ space: 14 }) {
        Row() {
          Text('身高 (cm):')
            .fontSize(16)
            .fontColor(this.currentTheme.textColorPrimary)
            .width(90)
          TextInput({ text: this.heightStr })
            .type(InputType.NUMBER_DECIMAL)
            .height(46)
            .layoutWeight(1)
            .backgroundColor(this.currentTheme.isDark ? '#262630' : '#F5F7FA')
            .fontColor(this.currentTheme.textColorPrimary)
            .borderRadius(10)
            .onChange((val: string): void => {
              this.heightStr = val;
              this.recalcBMI();
            })
        }

        Row() {
          Text('体重 (kg):')
            .fontSize(16)
            .fontColor(this.currentTheme.textColorPrimary)
            .width(90)
          TextInput({ text: this.weightStr })
            .type(InputType.NUMBER_DECIMAL)
            .height(46)
            .layoutWeight(1)
            .backgroundColor(this.currentTheme.isDark ? '#262630' : '#F5F7FA')
            .fontColor(this.currentTheme.textColorPrimary)
            .borderRadius(10)
            .onChange((val: string): void => {
              this.weightStr = val;
              this.recalcBMI();
            })
        }
      }
      .padding(18)
      .backgroundColor(this.currentTheme.cardBgColor)
      .borderRadius(16)

      // 结果卡片
      Column({ space: 10 }) {
        Text('身体质量指数 (BMI)').fontSize(14).fontColor(this.currentTheme.textColorSecondary)
        Text(this.bmiValue)
          .fontSize(44)
          .fontWeight(FontWeight.Bold)
          .fontColor(this.bmiColor)
        Text(this.bmiTag)
          .fontSize(15)
          .fontColor('#FFFFFF')
          .backgroundColor(this.bmiColor)
          .padding({ left: 14, right: 14, top: 4, bottom: 4 })
          .borderRadius(12)
      }
      .width('100%')
      .padding(22)
      .backgroundColor(this.currentTheme.cardBgColor)
      .borderRadius(16)
      .alignItems(HorizontalAlign.Center)
    }
  }

  // ==========================================
  //  模块 3：人民币大写转换（加分杀手锏）
  // ==========================================
  @Builder
  RMBModule() {
    Column({ space: 14 }) {
      Column({ space: 10 }) {
        Text('输入小写阿拉伯金额 (元):')
          .fontSize(14)
          .fontColor(this.currentTheme.textColorSecondary)
          .width('100%')

        TextInput({ text: this.rmbInput })
          .type(InputType.NUMBER_DECIMAL)
          .fontSize(24)
          .fontWeight(FontWeight.Bold)
          .fontColor(this.currentTheme.textColorPrimary)
          .backgroundColor(this.currentTheme.isDark ? '#262630' : '#F4F6F9')
          .borderRadius(12)
          .height(54)
          .onChange((val: string): void => {
            this.rmbInput = val;
            this.recalcRMB();
          })
      }
      .padding(18)
      .backgroundColor(this.currentTheme.cardBgColor)
      .borderRadius(16)

      Column({ space: 10 }) {
        Text('规范中文大写金额:')
          .fontSize(14)
          .fontColor(this.currentTheme.textColorSecondary)
          .width('100%')

        Text(this.rmbOutput)
          .fontSize(20)
          .fontWeight(FontWeight.Medium)
          .fontColor(this.currentTheme.primaryColor)
          .width('100%')
          .margin({ top: 4, bottom: 8 })
      }
      .padding(18)
      .backgroundColor(this.currentTheme.cardBgColor)
      .borderRadius(16)
    }
  }

  // ==========================================
  //  逻辑运算
  // ==========================================
  private getCurrentUnitList(): UnitItem[] {
    return this.unitCategory === 0 ? UnitData.LENGTH_UNITS : UnitData.WEIGHT_UNITS;
  }

  private recalcUnit(): void {
    const list: UnitItem[] = this.getCurrentUnitList();
    const val: number = parseFloat(this.unitInputValue) || 0;
    const baseValue: number = val * list[this.sourceUnitIndex].factorToBase;
    const result: number = baseValue / list[this.targetUnitIndex].factorToBase;
    this.unitResultValue = result >= 1000000 ? result.toExponential(4) : result.toFixed(4).replace(/\.?0+$/, '');
  }

  private recalcBMI(): void {
    const h: number = (parseFloat(this.heightStr) || 0) / 100;
    const w: number = parseFloat(this.weightStr) || 0;
    if (h > 0 && w > 0) {
      const bmi: number = w / (h * h);
      this.bmiValue = bmi.toFixed(1);
      if (bmi < 18.5) {
        this.bmiTag = '偏瘦 (体重过轻)';
        this.bmiColor = '#3B82F6';
      } else if (bmi < 24.0) {
        this.bmiTag = '标准 (身体健康)';
        this.bmiColor = '#10B981';
      } else if (bmi < 28.0) {
        this.bmiTag = '超重 (需要控制)';
        this.bmiColor = '#F59E0B';
      } else {
        this.bmiTag = '肥胖 (建议减脂)';
        this.bmiColor = '#EF4444';
      }
    }
  }

  private recalcRMB(): void {
    const n: number = parseFloat(this.rmbInput);
    if (isNaN(n)) {
      this.rmbOutput = '零元整';
      return;
    }
    this.rmbOutput = this.convertToChineseCurrency(n);
  }

  private convertToChineseCurrency(money: number): string {
    if (money === 0) return '零元整';
    const fraction: string[] = ['角', '分'];
    const digit: string[] = ['零', '壹', '贰', '叁', '肆', '伍', '陆', '柒', '捌', '玖'];
    const unit: string[][] = [
      ['元', '万', '亿'],
      ['', '拾', '佰', '仟']
    ];

    let head: string = money < 0 ? '负' : '';
    money = Math.abs(money);

    let s: string = '';
    for (let i = 0; i < fraction.length; i++) {
      const fVal: number = Math.floor(money * 10 * Math.pow(10, i)) % 10;
      if (fVal > 0) {
        s += (digit[fVal] + fraction[i]);
      }
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
        if (d > 0) {
          section = digit[d] + unit[1][i] + section;
        } else if (section && !section.startsWith('零')) {
          section = '零' + section;
        }
      }
      if (secVal > 0) {
        strInt = section + unit[0][unitPos] + strInt;
      }
      unitPos++;
      integerPart = Math.floor(integerPart / 10000);
    }

    return head + (strInt ? strInt : '零元') + s;
  }
}