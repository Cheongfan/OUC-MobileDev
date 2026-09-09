// entry/src/main/ets/views/calculator/StandardKeypadView.ets
import { ThemeConfig } from '../../common/CalcConstants';
import { CalcKey } from '../components/CalcKey';

@Component
export struct StandardKeypadView {
  @Prop currentTheme: ThemeConfig;
  @Prop hasMemory: boolean = false;

  // 按键回调
  onKeyClick: (key: string) => void = (key: string): void => {};
  onEqualClick: () => void = (): void => {};

  build() {
    Column() {
      // ===== 行 1 (全蓝): mc, m+, m-, mr =====
      Row() {
        this.BlueTextKey('mc')
        this.BlueTextKey('m+')
        this.BlueTextKey('m-')
        this.BlueTextKey('mr')
      }
      .width('100%')
      .justifyContent(FlexAlign.SpaceAround)

      // ===== 行 2 (全蓝): AC, ←, +/-, ÷ =====
      Row() {
        this.BlueTextKey('AC')
        this.BlueTextKey('←')
        this.BlueTextKey('+/-')
        this.BlueTextKey('÷')
      }
      .width('100%')
      .justifyContent(FlexAlign.SpaceAround)

      // ===== 行 3: 7, 8, 9, × =====
      Row() {
        this.NumberKey('7')
        this.NumberKey('8')
        this.NumberKey('9')
        this.BlueTextKey('×')
      }
      .width('100%')
      .justifyContent(FlexAlign.SpaceAround)

      // ===== 行 4: 4, 5, 6, - =====
      Row() {
        this.NumberKey('4')
        this.NumberKey('5')
        this.NumberKey('6')
        this.BlueTextKey('-')
      }
      .width('100%')
      .justifyContent(FlexAlign.SpaceAround)

      // ===== 行 5: 1, 2, 3, + =====
      Row() {
        this.NumberKey('1')
        this.NumberKey('2')
        this.NumberKey('3')
        this.BlueTextKey('+')
      }
      .width('100%')
      .justifyContent(FlexAlign.SpaceAround)

      // ===== 行 6: %, 0, ., = (图1完全一致) =====
      Row() {
        this.NumberKey('%')
        this.NumberKey('0')
        this.NumberKey('.')
        this.EqualBigCircleKey()
      }
      .width('100%')
      .justifyContent(FlexAlign.SpaceAround)
    }
    .width('100%')
    .height('100%')
    .justifyContent(FlexAlign.SpaceAround)
  }

  // 蓝色功能与运算符键
  @Builder
  BlueTextKey(label: string) {
    CalcKey({
      text: label,
      fontColor: this.currentTheme.primaryColor,
      fontSize: 26,
      fontWeight: FontWeight.Medium,
      btnWidth: 70,
      btnHeight: 56,
      onClickAction: (): void => {
        this.onKeyClick(label);
      }
    })
  }

  // 黑色数字键
  @Builder
  NumberKey(digit: string) {
    CalcKey({
      text: digit,
      fontColor: this.currentTheme.textColorPrimary,
      fontSize: 28,
      fontWeight: FontWeight.Normal,
      btnWidth: 70,
      btnHeight: 56,
      onClickAction: (): void => {
        this.onKeyClick(digit);
      }
    })
  }

  // 截图1核心：右下角实心蓝色大圆形 = 键
  @Builder
  EqualBigCircleKey() {
    Button() {
      Text('=')
        .fontSize(32)
        .fontColor('#FFFFFF')
        .fontWeight(FontWeight.Normal)
    }
    .width(62)
    .height(62)
    .borderRadius(31)
    .backgroundColor(this.currentTheme.primaryColor)
    .shadow({ radius: 8, color: this.currentTheme.primaryColor + '40', offsetY: 3 })
    .onClick((): void => {
      this.onEqualClick();
    })
  }
}