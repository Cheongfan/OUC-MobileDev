// entry/src/main/ets/views/components/CalcKey.ets
import { KeyType, CalcConstants } from '../../common/CalcConstants';

/**
 * 具备弹性微动效与触觉交互的通用按键组件
 */
@Component
export struct CalcKey {
  @Prop text: string = '';
  @Prop fontColor: ResourceColor = CalcConstants.COLOR_TEXT_PRIMARY;
  @Prop fontSize: number = 28;
  @Prop fontWeight: FontWeight = FontWeight.Normal;
  @Prop btnWidth: Length = 64;
  @Prop btnHeight: Length = 60;
  @Prop isCircular: boolean = false;
  @Prop bgColor: ResourceColor = Color.Transparent;
  @Prop keyType: KeyType = KeyType.NUMBER;

  // 外部点击事件回调
  onClickAction: () => void = (): void => {};

  // 按压动效缩放状态
  @State private scaleFactor: number = 1.0;
  @State private isPressed: boolean = false;

  build() {
    Stack({ alignContent: Alignment.Center }) {
      Text(this.text)
        .fontSize(this.fontSize)
        .fontWeight(this.fontWeight)
        .fontColor(this.fontColor)
        .textAlign(TextAlign.Center)
    }
    .width(this.btnWidth)
    .height(this.btnHeight)
    .borderRadius(this.isCircular ? (typeof this.btnWidth === 'number' ? this.btnWidth / 2 : 30) : 14)
    .backgroundColor(this.isPressed ? '#E5E8EC' : this.bgColor)
    .scale({ x: this.scaleFactor, y: this.scaleFactor })
    .animation({
      duration: 120,
      curve: Curve.EaseOut
    })
    .onTouch((event: TouchEvent): void => {
      if (event.type === TouchType.Down) {
        this.scaleFactor = 0.92; // 按下微缩放
        this.isPressed = true;
      } else if (event.type === TouchType.Up || event.type === TouchType.Cancel) {
        this.scaleFactor = 1.0;  // 抬起弹性复原
        this.isPressed = false;
      }
    })
    .onClick((): void => {
      this.onClickAction();
    })
  }
}