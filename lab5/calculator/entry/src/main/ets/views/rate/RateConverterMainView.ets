// entry/src/main/ets/views/rate/RateConverterMainView.ets
import { CurrencyItem, GLOBAL_CURRENCIES } from '../../model/CurrencyModel';
import { AppColorSystem } from '../../common/CalcConstants';
import { RateService } from '../../common/RateService';
import { RateKeypad } from './RateKeypad';
import { CurrencySelectSheet } from './CurrencySelectSheet';

@Component
export struct RateConverterMainView {
  @Prop primaryColor: string = '#004B97';
  @Prop isDarkMode: boolean = false;

  @State currencyA: CurrencyItem = GLOBAL_CURRENCIES[0]; // 美元 USD
  @State currencyB: CurrencyItem = GLOBAL_CURRENCIES[1]; // 人民币 CNY

  @State activeCardIndex: number = 0;
  @State inputValA: string = '1';
  @State inputValB: string = '7.2350';

  // 联网与刷新状态
  @State updateStatusText: string = '正在连接金融中心获取最新汇率...';
  @State isUpdating: boolean = false;

  @State isShowSelectSheet: boolean = false;
  @State isSelectingCardA: boolean = true;

  aboutToAppear(): void {
    this.recalcFromActive();
    // 进入页面自动发起一次真实网络同步
    this.syncRatesFromNetwork();
  }

  /**
   * 发起真实网络请求更新汇率
   */
  private syncRatesFromNetwork(): void {
    this.isUpdating = true;
    RateService.fetchLatestRates().then((resultTips: string): void => {
      this.updateStatusText = resultTips;
      this.isUpdating = false;

      // 汇率更新后，重新匹配当前选中的货币对象基准值
      const foundA: CurrencyItem | undefined = GLOBAL_CURRENCIES.find((c: CurrencyItem): boolean => c.code === this.currencyA.code);
      const foundB: CurrencyItem | undefined = GLOBAL_CURRENCIES.find((c: CurrencyItem): boolean => c.code === this.currencyB.code);
      if (foundA) this.currencyA = foundA;
      if (foundB) this.currencyB = foundB;

      this.recalcFromActive();
    });
  }

  build() {
    Column() {
      // 1. 上半部分：双币种响应式卡片
      Column({ space: 14 }) {
        // 卡片 A
        Column() {
          Row() {
            Row()
              .width(9)
              .height(9)
              .borderRadius(4.5)
              .backgroundColor(this.activeCardIndex === 0 ? this.primaryColor : '#B0B5C0')
              .margin({ right: 8 })

            Row() {
              Text(`${this.currencyA.name}  ${this.currencyA.code}`)
                .fontSize(17)
                .fontWeight(FontWeight.Medium)
                .fontColor(AppColorSystem.getTextPrimary(this.isDarkMode))
              Text(' ＞')
                .fontSize(14)
                .fontColor(AppColorSystem.getTextSecondary(this.isDarkMode))
            }
            .onClick((): void => {
              this.isSelectingCardA = true;
              this.isShowSelectSheet = true;
            })

            Blank()
          }
          .width('100%')

          Text(this.inputValA)
            .fontSize(38)
            .fontWeight(this.activeCardIndex === 0 ? FontWeight.Medium : FontWeight.Normal)
            .fontColor(this.activeCardIndex === 0 ? AppColorSystem.getTextPrimary(this.isDarkMode) : AppColorSystem.getTextSecondary(this.isDarkMode))
            .maxLines(1)
            .textOverflow({ overflow: TextOverflow.Ellipsis })
            .width('100%')
            .margin({ top: 12 })
        }
        .width('100%')
        .padding({ left: 18, right: 18, top: 16, bottom: 16 })
        .backgroundColor(AppColorSystem.getCardBg(this.isDarkMode))
        .borderRadius(16)
        .border({
          width: 1.5,
          color: this.activeCardIndex === 0 ? this.primaryColor : Color.Transparent
        })
        .onClick((): void => {
          this.activeCardIndex = 0;
        })

        // 卡片 B
        Column() {
          Row() {
            Row()
              .width(9)
              .height(9)
              .borderRadius(4.5)
              .backgroundColor(this.activeCardIndex === 1 ? this.primaryColor : '#B0B5C0')
              .margin({ right: 8 })

            Row() {
              Text(`${this.currencyB.name}  ${this.currencyB.code}`)
                .fontSize(17)
                .fontWeight(FontWeight.Medium)
                .fontColor(AppColorSystem.getTextPrimary(this.isDarkMode))
              Text(' ＞')
                .fontSize(14)
                .fontColor(AppColorSystem.getTextSecondary(this.isDarkMode))
            }
            .onClick((): void => {
              this.isSelectingCardA = false;
              this.isShowSelectSheet = true;
            })

            Blank()
          }
          .width('100%')

          Text(this.inputValB)
            .fontSize(38)
            .fontWeight(this.activeCardIndex === 1 ? FontWeight.Medium : FontWeight.Normal)
            .fontColor(this.activeCardIndex === 1 ? AppColorSystem.getTextPrimary(this.isDarkMode) : AppColorSystem.getTextSecondary(this.isDarkMode))
            .maxLines(1)
            .textOverflow({ overflow: TextOverflow.Ellipsis })
            .width('100%')
            .margin({ top: 12 })
        }
        .width('100%')
        .padding({ left: 18, right: 18, top: 16, bottom: 16 })
        .backgroundColor(AppColorSystem.getCardBg(this.isDarkMode))
        .borderRadius(16)
        .border({
          width: 1.5,
          color: this.activeCardIndex === 1 ? this.primaryColor : Color.Transparent
        })
        .onClick((): void => {
          this.activeCardIndex = 1;
        })

        // 真实动态网络时间与手动刷新栏
        Row({ space: 8 }) {
          Text(this.updateStatusText)
            .fontSize(12)
            .fontColor(AppColorSystem.getTextSecondary(this.isDarkMode))
            .layoutWeight(1)
            .textAlign(TextAlign.Center)

          // 手动刷新按钮
          Button(this.isUpdating ? '同步中...' : '刷新')
            .type(ButtonType.Normal)
            .height(26)
            .borderRadius(6)
            .fontSize(11)
            .backgroundColor(this.isDarkMode ? '#282830' : '#E8EBF0')
            .fontColor(this.primaryColor)
            .enabled(!this.isUpdating)
            .onClick((): void => {
              this.syncRatesFromNetwork();
            })
        }
        .width('100%')
        .padding({ left: 4, right: 4, top: 4 })
      }
      .padding({ left: 20, right: 20, top: 12 })

      Blank()

      // 2. 下半部分：4×4 金融专属键盘
      RateKeypad({
        themeColor: this.primaryColor,
        onNumberClick: (digit: string): void => {
          this.handleKeyInput(digit);
        },
        onClearClick: (): void => {
          if (this.activeCardIndex === 0) this.inputValA = '0';
          else this.inputValB = '0';
          this.recalcFromActive();
        },
        onBackspaceClick: (): void => {
          this.handleBackspace();
        }
      })
    }
    .width('100%')
    .height('100%')
    .backgroundColor(AppColorSystem.getPageBg(this.isDarkMode))
    .bindSheet($$this.isShowSelectSheet, this.SelectCurrencySheetBuilder(), {
      height: SheetSize.MEDIUM,
      dragBar: true
    })
  }

  @Builder
  SelectCurrencySheetBuilder() {
    CurrencySelectSheet({
      selectedCode: this.isSelectingCardA ? this.currencyA.code : this.currencyB.code,
      themeColor: this.primaryColor,
      onSelect: (selected: CurrencyItem): void => {
        if (this.isSelectingCardA) {
          this.currencyA = selected;
        } else {
          this.currencyB = selected;
        }
        this.recalcFromActive();
        this.isShowSelectSheet = false;
      }
    })
  }

  // ==========================================
  //  输入逻辑处理
  // ==========================================
  private handleKeyInput(digit: string): void {
    let curStr: string = this.activeCardIndex === 0 ? this.inputValA : this.inputValB;

    if (digit === '.') {
      if (!curStr.includes('.')) curStr += '.';
    } else if (digit === '00') {
      if (curStr !== '0' && curStr !== '') curStr += '00';
    } else {
      if (curStr === '0') curStr = digit;
      else if (curStr.length < 12) curStr += digit;
    }

    if (this.activeCardIndex === 0) this.inputValA = curStr;
    else this.inputValB = curStr;

    this.recalcFromActive();
  }

  private handleBackspace(): void {
    let curStr: string = this.activeCardIndex === 0 ? this.inputValA : this.inputValB;
    if (curStr.length > 1) {
      curStr = curStr.slice(0, -1);
    } else {
      curStr = '0';
    }

    if (this.activeCardIndex === 0) this.inputValA = curStr;
    else this.inputValB = curStr;

    this.recalcFromActive();
  }

  private recalcFromActive(): void {
    if (this.activeCardIndex === 0) {
      const valA: number = parseFloat(this.inputValA) || 0;
      const resB: number = (valA / this.currencyA.rateToUSD) * this.currencyB.rateToUSD;
      this.inputValB = resB === 0 ? '0' : resB.toFixed(4).replace(/\.?0+$/, '');
    } else {
      const valB: number = parseFloat(this.inputValB) || 0;
      const resA: number = (valB / this.currencyB.rateToUSD) * this.currencyA.rateToUSD;
      this.inputValA = resA === 0 ? '0' : resA.toFixed(4).replace(/\.?0+$/, '');
    }
  }
}