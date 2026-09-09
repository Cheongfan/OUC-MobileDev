// entry/src/main/ets/views/calculator/HistoryCardView.ets
import { HistoryItem } from '../../model/HistoryModel';
import { CalcConstants } from '../../common/CalcConstants';

@Component
export struct HistoryCardView {
  @Link historyList: Array<HistoryItem>;
  @Prop themeColor: string = CalcConstants.COLOR_PRIMARY_BLUE;

  onItemClick: (result: string) => void = (result: string): void => {};
  onClearClick: () => void = (): void => {};

  build() {
    Column() {
      if (this.historyList.length === 0) {
        // 空状态
        Column({ space: 12 }) {
          Text('暂无历史记录')
            .fontSize(16)
            .fontColor(CalcConstants.COLOR_TEXT_MUTED)
        }
        .width('100%')
        .layoutWeight(1)
        .justifyContent(FlexAlign.Center)
      } else {
        // 图 3 滚动列表
        List({ space: 8 }) {
          ForEach(this.historyList, (item: HistoryItem) => {
            ListItem() {
              Column({ space: 4 }) {
                // 上行：历史输入表达式
                Text(item.expression)
                  .fontSize(16)
                  .fontColor(CalcConstants.COLOR_TEXT_SECONDARY)
                  .width('100%')
                  .textAlign(TextAlign.End)

                // 下行：历史计算结果（大字高亮）
                Text(`= ${item.result}`)
                  .fontSize(22)
                  .fontWeight(FontWeight.Medium)
                  .fontColor(CalcConstants.COLOR_TEXT_PRIMARY)
                  .width('100%')
                  .textAlign(TextAlign.End)

                Divider()
                  .color('#E5E8EC')
                  .margin({ top: 6 })
              }
              .width('100%')
              .padding({ left: 14, right: 14, top: 8 })
              .onClick((): void => {
                this.onItemClick(item.result);
              })
            }
          }, (item: HistoryItem): string => item.id)
        }
        .layoutWeight(1)
        .width('100%')
        .edgeEffect(EdgeEffect.Spring)
      }

      // 底部居中的“清除记录”按钮（与图3一致）
      Button('清除记录')
        .backgroundColor(Color.Transparent)
        .fontColor(this.themeColor)
        .fontSize(16)
        .fontWeight(FontWeight.Medium)
        .width('100%')
        .height(44)
        .onClick((): void => {
          this.onClearClick();
        })
    }
    .width('94%')
    .height('96%')
    .backgroundColor('#F1F3F5')
    .borderRadius(18)
    .padding({ top: 10, bottom: 6 })
    .animation({ duration: 200 })
  }
}