// entry/src/main/ets/views/calculator/CalcDisplayView.ets
import { CalcConstants } from '../../common/CalcConstants';

@Component
export struct CalcDisplayView {
  @Prop expression: string = '0';
  @Prop previewResult: string = '';

  /**
   * 根据表达式字符长度自适应调整字号大小，避免文本溢出
   */
  private getAdaptiveFontSize(): number {
    const len: number = this.expression.length;
    if (len <= 7) return 54;
    if (len <= 11) return 44;
    if (len <= 15) return 36;
    if (len <= 20) return 28;
    return 24;
  }

  build() {
    Column() {
      // 1. 主算式显示区
      Text(this.expression || '0')
        .fontSize(this.getAdaptiveFontSize())
        .fontWeight(FontWeight.Lighter)
        .fontColor(CalcConstants.COLOR_TEXT_PRIMARY)
        .maxLines(2)
        .textOverflow({ overflow: TextOverflow.Ellipsis })
        .textAlign(TextAlign.End)
        .width('100%')
        .animation({ duration: 150 })

      // 2. 弱化实时计算预览结果
      Text(this.previewResult)
        .fontSize(28)
        .fontWeight(FontWeight.Regular)
        .fontColor(CalcConstants.COLOR_TEXT_SECONDARY)
        .textAlign(TextAlign.End)
        .width('100%')
        .margin({ top: 6 })
        .height(36)
        .opacity(this.previewResult.length > 0 ? 1 : 0)
        .animation({ duration: 150 })
    }
    .width('100%')
    .padding({ left: 24, right: 24, top: 12, bottom: 8 })
    .alignItems(HorizontalAlign.End)
  }
}