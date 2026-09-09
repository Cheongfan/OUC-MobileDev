// entry/src/main/ets/views/calculator/ProgrammerView.ets
import { AppColorSystem } from '../../common/CalcConstants';
import { HistoryItem } from '../../model/HistoryModel';

export enum RadixType {
  HEX = 16,
  DEC = 10,
  OCT = 8,
  BIN = 2
}

@Component
export struct ProgrammerView {
  @Prop isDarkMode: boolean;
  @Prop primaryColor: string;
  @Link progHistoryList: Array<HistoryItem>;
  // 由外部工具栏统一控制是否展开历史记录
  @Link isShowHistory: boolean;

  @State activeRadix: RadixType = RadixType.DEC;
  @State currentVal: number = 0;

  // 四进制展示文本
  @State hexText: string = '0';
  @State decText: string = '0';
  @State octText: string = '0';
  @State binText: string = '0';

  @State formulaHint: string = '';
  @State pendingOp: string = '';
  @State previousVal: number = 0;
  @State isNewInput: boolean = true;

  aboutToAppear(): void {
    this.refreshAllDisplays(0);
  }

  build() {
    Column() {
      // 1. 四进制联动卡片 (包含右上角运算微提示)
      Column({ space: 6 }) {
        if (this.formulaHint) {
          Row() {
            Blank()
            Text(this.formulaHint)
              .fontSize(13)
              .fontColor(this.primaryColor)
              .fontWeight(FontWeight.Medium)
          }
          .width('100%')
          .padding({ right: 6, bottom: 2 })
        }

        this.RadixRowHEX()
        this.RadixRowDEC()
        this.RadixRowOCT()
        this.RadixRowBIN()
      }
      .width('100%')
      .padding(12)
      .backgroundColor(AppColorSystem.getCardBg(this.isDarkMode))
      .borderRadius(16)
      .margin({ top: 4, bottom: 10 })

      // 2. 下方交互区：历史卡片 vs 按键矩阵
      Row() {
        if (this.isShowHistory) {
          // 程序员位运算历史卡片
          this.ProgrammerHistoryPanel()
        } else {
          // 专属按键矩阵 (6 行 4 列)
          Column({ space: 8 }) {
            Row({ space: 8 }) {
              this.KeyBtn('A')
              this.KeyBtn('B')
              this.KeyBtn('C')
              this.ActionBtn('AC', this.primaryColor, (): void => this.onClear())
            }.width('100%')

            Row({ space: 8 }) {
              this.KeyBtn('D')
              this.KeyBtn('E')
              this.KeyBtn('F')
              this.ActionBtn('←', this.primaryColor, (): void => this.onBackspace())
            }.width('100%')

            Row({ space: 8 }) {
              this.KeyBtn('7')
              this.KeyBtn('8')
              this.KeyBtn('9')
              this.BitOpBtn('AND')
            }.width('100%')

            Row({ space: 8 }) {
              this.KeyBtn('4')
              this.KeyBtn('5')
              this.KeyBtn('6')
              this.BitOpBtn('OR')
            }.width('100%')

            Row({ space: 8 }) {
              this.KeyBtn('1')
              this.KeyBtn('2')
              this.KeyBtn('3')
              this.BitOpBtn('XOR')
            }.width('100%')

            Row({ space: 8 }) {
              this.ActionBtn('NOT', this.primaryColor, (): void => this.onBitNot())
              this.KeyBtn('0')
              this.BitOpBtn('<<')
              this.EqualBtn()
            }.width('100%')
          }
          .layoutWeight(1)
          .width('100%')
          .justifyContent(FlexAlign.SpaceAround)
        }
      }
      .layoutWeight(1)
      .width('100%')
      .padding({ bottom: 12 })
    }
    .width('100%')
    .height('100%')
    .padding({ left: 14, right: 14 })
  }

  @Builder
  ProgrammerHistoryPanel() {
    Column() {
      if (this.progHistoryList.length === 0) {
        Column() {
          Text('暂无位运算历史')
            .fontSize(15)
            .fontColor(AppColorSystem.getTextSecondary(this.isDarkMode))
        }
        .layoutWeight(1)
        .justifyContent(FlexAlign.Center)
      } else {
        List({ space: 8 }) {
          ForEach(this.progHistoryList, (item: HistoryItem) => {
            ListItem() {
              Column({ space: 4 }) {
                Text(item.expression)
                  .fontSize(14)
                  .fontColor(AppColorSystem.getTextSecondary(this.isDarkMode))
                  .width('100%')
                  .textAlign(TextAlign.End)
                Text(`= ${item.result}`)
                  .fontSize(18)
                  .fontWeight(FontWeight.Bold)
                  .fontColor(AppColorSystem.getTextPrimary(this.isDarkMode))
                  .width('100%')
                  .textAlign(TextAlign.End)
                Divider().color(AppColorSystem.getBorderColor(this.isDarkMode))
              }
              .padding(8)
              .onClick((): void => {
                const parsed: number = parseInt(item.result, 10);
                if (!isNaN(parsed)) {
                  this.currentVal = parsed;
                  this.refreshAllDisplays(parsed);
                }
                this.isShowHistory = false;
              })
            }
          }, (item: HistoryItem): string => item.id)
        }
        .layoutWeight(1)
        .width('100%')
      }

      Button('清除位运算记录')
        .backgroundColor(Color.Transparent)
        .fontColor(this.primaryColor)
        .fontSize(15)
        .onClick((): void => {
          this.progHistoryList = [];
        })
    }
    .width('100%')
    .height('100%')
    .backgroundColor(AppColorSystem.getCardBg(this.isDarkMode))
    .borderRadius(16)
    .padding(12)
  }

  @Builder
  RadixRowHEX() {
    Row() {
      Text('HEX').fontSize(14).fontWeight(FontWeight.Bold)
        .fontColor(this.activeRadix === RadixType.HEX ? this.primaryColor : AppColorSystem.getTextSecondary(this.isDarkMode))
        .width(42)
      Text(this.hexText).fontSize(18).fontWeight(FontWeight.Medium)
        .fontColor(this.activeRadix === RadixType.HEX ? this.primaryColor : AppColorSystem.getTextPrimary(this.isDarkMode))
        .layoutWeight(1).textAlign(TextAlign.End)
    }
    .width('100%').padding(8).borderRadius(8)
    .backgroundColor(this.activeRadix === RadixType.HEX ? (this.isDarkMode ? '#282C34' : '#EFF6FF') : Color.Transparent)
    .onClick((): void => {
      this.activeRadix = RadixType.HEX;
      this.isNewInput = true;
    })
  }

  @Builder
  RadixRowDEC() {
    Row() {
      Text('DEC').fontSize(14).fontWeight(FontWeight.Bold)
        .fontColor(this.activeRadix === RadixType.DEC ? this.primaryColor : AppColorSystem.getTextSecondary(this.isDarkMode))
        .width(42)
      Text(this.decText).fontSize(18).fontWeight(FontWeight.Medium)
        .fontColor(this.activeRadix === RadixType.DEC ? this.primaryColor : AppColorSystem.getTextPrimary(this.isDarkMode))
        .layoutWeight(1).textAlign(TextAlign.End)
    }
    .width('100%').padding(8).borderRadius(8)
    .backgroundColor(this.activeRadix === RadixType.DEC ? (this.isDarkMode ? '#282C34' : '#EFF6FF') : Color.Transparent)
    .onClick((): void => {
      this.activeRadix = RadixType.DEC;
      this.isNewInput = true;
    })
  }

  @Builder
  RadixRowOCT() {
    Row() {
      Text('OCT').fontSize(14).fontWeight(FontWeight.Bold)
        .fontColor(this.activeRadix === RadixType.OCT ? this.primaryColor : AppColorSystem.getTextSecondary(this.isDarkMode))
        .width(42)
      Text(this.octText).fontSize(18).fontWeight(FontWeight.Medium)
        .fontColor(this.activeRadix === RadixType.OCT ? this.primaryColor : AppColorSystem.getTextPrimary(this.isDarkMode))
        .layoutWeight(1).textAlign(TextAlign.End)
    }
    .width('100%').padding(8).borderRadius(8)
    .backgroundColor(this.activeRadix === RadixType.OCT ? (this.isDarkMode ? '#282C34' : '#EFF6FF') : Color.Transparent)
    .onClick((): void => {
      this.activeRadix = RadixType.OCT;
      this.isNewInput = true;
    })
  }

  @Builder
  RadixRowBIN() {
    Row() {
      Text('BIN').fontSize(14).fontWeight(FontWeight.Bold)
        .fontColor(this.activeRadix === RadixType.BIN ? this.primaryColor : AppColorSystem.getTextSecondary(this.isDarkMode))
        .width(42)
      Text(this.binText).fontSize(this.binText.length > 18 ? 12 : 16).fontWeight(FontWeight.Medium)
        .fontColor(this.activeRadix === RadixType.BIN ? this.primaryColor : AppColorSystem.getTextPrimary(this.isDarkMode))
        .layoutWeight(1).textAlign(TextAlign.End)
    }
    .width('100%').padding(8).borderRadius(8)
    .backgroundColor(this.activeRadix === RadixType.BIN ? (this.isDarkMode ? '#282C34' : '#EFF6FF') : Color.Transparent)
    .onClick((): void => {
      this.activeRadix = RadixType.BIN;
      this.isNewInput = true;
    })
  }

  @Builder
  KeyBtn(char: string) {
    Button(char)
      .type(ButtonType.Normal)
      .borderRadius(10)
      .layoutWeight(1)
      .height(48)
      .fontSize(22)
      .fontWeight(FontWeight.Medium)
      .backgroundColor(this.checkCharAvailable(char) ? AppColorSystem.getKeyBg(this.isDarkMode) : (this.isDarkMode ? '#141418' : '#F9FAFB'))
      .fontColor(this.checkCharAvailable(char) ? AppColorSystem.getTextPrimary(this.isDarkMode) : (this.isDarkMode ? '#3A3A44' : '#D1D5DB'))
      .enabled(this.checkCharAvailable(char))
      .onClick((): void => {
        this.onInputChar(char);
      })
  }

  @Builder
  BitOpBtn(op: string) {
    Button(op)
      .type(ButtonType.Normal)
      .borderRadius(10)
      .layoutWeight(1)
      .height(48)
      .fontSize(15)
      .fontWeight(FontWeight.Bold)
      .backgroundColor(this.pendingOp === op ? this.primaryColor : (this.isDarkMode ? '#262630' : '#EFF6FF'))
      .fontColor(this.pendingOp === op ? '#FFFFFF' : this.primaryColor)
      .onClick((): void => {
        this.onSetBitOp(op);
      })
  }

  @Builder
  ActionBtn(text: string, color: ResourceColor, action: () => void) {
    Button(text)
      .type(ButtonType.Normal)
      .borderRadius(10)
      .layoutWeight(1)
      .height(48)
      .fontSize(17)
      .fontWeight(FontWeight.Bold)
      .backgroundColor(AppColorSystem.getKeyBg(this.isDarkMode))
      .fontColor(color)
      .onClick((): void => {
        action();
      })
  }

  @Builder
  EqualBtn() {
    Button('=')
      .type(ButtonType.Normal)
      .borderRadius(10)
      .layoutWeight(1)
      .height(48)
      .fontSize(24)
      .fontWeight(FontWeight.Bold)
      .backgroundColor(this.primaryColor)
      .fontColor('#FFFFFF')
      .onClick((): void => {
        this.onExecuteCalculate();
      })
  }

  private checkCharAvailable(char: string): boolean {
    if (this.activeRadix === RadixType.BIN) return char === '0' || char === '1';
    if (this.activeRadix === RadixType.OCT) return ['0', '1', '2', '3', '4', '5', '6', '7'].includes(char);
    if (this.activeRadix === RadixType.DEC) return !['A', 'B', 'C', 'D', 'E', 'F'].includes(char);
    return true;
  }

  private onInputChar(char: string): void {
    let baseStr: string = '';
    const unsignedVal: number = this.currentVal >>> 0;
    if (this.activeRadix === RadixType.HEX) baseStr = unsignedVal.toString(16).toUpperCase();
    else if (this.activeRadix === RadixType.DEC) baseStr = this.currentVal.toString(10);
    else if (this.activeRadix === RadixType.OCT) baseStr = unsignedVal.toString(8);
    else if (this.activeRadix === RadixType.BIN) baseStr = unsignedVal.toString(2);

    if (this.isNewInput || baseStr === '0') {
      baseStr = char;
      this.isNewInput = false;
    } else {
      if (baseStr.length < 32) baseStr += char;
    }

    const parsed: number = parseInt(baseStr, this.activeRadix);
    if (!isNaN(parsed)) {
      this.currentVal = parsed | 0;
      this.refreshAllDisplays(this.currentVal);
    }
  }

  private onBackspace(): void {
    let baseStr: string = '';
    const unsignedVal: number = this.currentVal >>> 0;
    if (this.activeRadix === RadixType.HEX) baseStr = unsignedVal.toString(16).toUpperCase();
    else if (this.activeRadix === RadixType.DEC) baseStr = this.currentVal.toString(10);
    else if (this.activeRadix === RadixType.OCT) baseStr = unsignedVal.toString(8);
    else if (this.activeRadix === RadixType.BIN) baseStr = unsignedVal.toString(2);

    if (baseStr.length > 1) {
      baseStr = baseStr.slice(0, -1);
      const parsed: number = parseInt(baseStr, this.activeRadix);
      this.currentVal = isNaN(parsed) ? 0 : (parsed | 0);
    } else {
      this.currentVal = 0;
      this.isNewInput = true;
    }
    this.refreshAllDisplays(this.currentVal);
  }

  private onClear(): void {
    this.currentVal = 0;
    this.previousVal = 0;
    this.pendingOp = '';
    this.formulaHint = '';
    this.isNewInput = true;
    this.refreshAllDisplays(0);
  }

  private onSetBitOp(op: string): void {
    this.pendingOp = op;
    this.previousVal = this.currentVal;
    this.formulaHint = `${this.currentVal} ${op}`;
    this.isNewInput = true;
  }

  private onBitNot(): void {
    const res: number = (~this.currentVal) | 0;
    this.progHistoryList.unshift(new HistoryItem(`NOT ${this.currentVal}`, res.toString()));
    this.currentVal = res;
    this.isNewInput = true;
    this.formulaHint = `NOT ${this.currentVal}`;
    this.refreshAllDisplays(this.currentVal);
  }

  private onExecuteCalculate(): void {
    if (!this.pendingOp) return;

    // 1. 先保存操作数，避免被计算结果覆盖
    const leftNum: number = this.previousVal;
    const op: string = this.pendingOp;
    const rightNum: number = this.currentVal;

    // 2. 执行位运算
    let res: number = 0;
    if (op === 'AND') res = (leftNum & rightNum) | 0;
    else if (op === 'OR') res = (leftNum | rightNum) | 0;
    else if (op === 'XOR') res = (leftNum ^ rightNum) | 0;
    else if (op === '<<') res = (leftNum << rightNum) | 0;

    // 3. 构建正确的表达式（如: 6 << 3 = 48）
    const exprText: string = `${leftNum} ${op} ${rightNum}`;
    this.formulaHint = `${exprText} = ${res}`;

    // 4. 存入历史记录
    this.progHistoryList.unshift(new HistoryItem(exprText, res.toString()));

    // 5. 更新内部数值并刷新屏幕
    this.currentVal = res;
    this.pendingOp = '';
    this.isNewInput = true;
    this.refreshAllDisplays(res);
  }

  private refreshAllDisplays(val: number): void {
    const unsignedVal: number = val >>> 0;
    this.hexText = unsignedVal.toString(16).toUpperCase();
    this.decText = val.toString(10);
    this.octText = unsignedVal.toString(8);

    const rawBin: string = unsignedVal.toString(2);
    this.binText = rawBin.replace(/\B(?=(\d{4})+(?!\d))/g, ' ');
  }
}