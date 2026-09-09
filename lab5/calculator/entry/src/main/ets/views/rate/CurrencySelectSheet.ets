// entry/src/main/ets/views/rate/CurrencySelectSheet.ets
import { CurrencyItem, GLOBAL_CURRENCIES } from '../../model/CurrencyModel';
import { CalcConstants } from '../../common/CalcConstants';

@Component
export struct CurrencySelectSheet {
  @Prop selectedCode: string = 'USD';
  @Prop themeColor: string = CalcConstants.COLOR_PRIMARY_BLUE;
  onSelect: (currency: CurrencyItem) => void = (currency: CurrencyItem): void => {};

  build() {
    Column() {
      Text('选择货币')
        .fontSize(18)
        .fontWeight(FontWeight.Bold)
        .fontColor(CalcConstants.COLOR_TEXT_PRIMARY)
        .margin({ top: 16, bottom: 12 })

      List({ space: 8 }) {
        ForEach(GLOBAL_CURRENCIES, (item: CurrencyItem) => {
          ListItem() {
            Row() {
              // 货币符号小徽章
              Stack({ alignContent: Alignment.Center }) {
                Text(item.symbol)
                  .fontSize(16)
                  .fontWeight(FontWeight.Bold)
                  .fontColor(this.selectedCode === item.code ? this.themeColor : '#5F6368')
              }
              .width(36)
              .height(36)
              .borderRadius(18)
              .backgroundColor(this.selectedCode === item.code ? '#E8EFFF' : '#F1F3F5')
              .margin({ right: 14 })

              // 货币全称与代号
              Column({ space: 2 }) {
                Text(item.name)
                  .fontSize(16)
                  .fontWeight(FontWeight.Medium)
                  .fontColor(CalcConstants.COLOR_TEXT_PRIMARY)
                Text(item.code)
                  .fontSize(12)
                  .fontColor(CalcConstants.COLOR_TEXT_SECONDARY)
              }
              .alignItems(HorizontalAlign.Start)

              Blank()

              // 选中勾选标识
              if (this.selectedCode === item.code) {
                Text('✓')
                  .fontSize(18)
                  .fontWeight(FontWeight.Bold)
                  .fontColor(this.themeColor)
              }
            }
            .width('100%')
            .padding({ left: 16, right: 16, top: 12, bottom: 12 })
            .borderRadius(12)
            .backgroundColor(this.selectedCode === item.code ? '#F4F7FF' : Color.Transparent)
            .onClick((): void => {
              this.onSelect(item);
            })
          }
        }, (item: CurrencyItem): string => item.code)
      }
      .width('100%')
      .layoutWeight(1)
      .edgeEffect(EdgeEffect.Spring)
    }
    .width('100%')
    .height('100%')
    .padding({ left: 16, right: 16, bottom: 16 })
  }
}