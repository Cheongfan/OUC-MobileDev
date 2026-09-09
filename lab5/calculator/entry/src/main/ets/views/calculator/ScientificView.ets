// entry/src/main/ets/views/calculator/ScientificView.ets
import { ThemeConfig } from '../../common/CalcConstants';
import { CalcKey } from '../components/CalcKey';

@Component
export struct ScientificView {
  @Prop currentTheme: ThemeConfig;
  onKeyClick: (key: string) => void = (key: string): void => {};
  onEqualClick: () => void = (): void => {};

  // 2nd 换挡响应式状态
  @State isSecondActive: boolean = false;

  build() {
    Column() {
      // 行 1: 2nd, (, ), 10^x, mc, m+, m-, mr
      Row() {
        // 2nd 按键：激活时高亮变蓝
        CalcKey({
          text: '2nd',
          fontColor: this.isSecondActive ? '#FFFFFF' : this.currentTheme.primaryColor,
          bgColor: this.isSecondActive ? this.currentTheme.primaryColor : Color.Transparent,
          fontSize: 15,
          fontWeight: FontWeight.Bold,
          btnWidth: 44,
          btnHeight: 44,
          onClickAction: (): void => {
            this.isSecondActive = !this.isSecondActive;
          }
        })

        this.StaticSciKey('(')
        this.StaticSciKey(')')
        this.StaticSciKey('10^x')
        this.BlueKey('mc')
        this.BlueKey('m+')
        this.BlueKey('m-')
        this.BlueKey('mr')
      }
      .width('100%')
      .justifyContent(FlexAlign.SpaceAround)

      // 行 2: 1/x, x², x³, y^x, AC, ←, +/-, ÷
      Row() {
        this.StaticSciKey('1/x')
        this.StaticSciKey('x²')
        this.StaticSciKey('x³')
        this.StaticSciKey('y^x')
        this.BlueKey('AC')
        this.BlueKey('←')
        this.BlueKey('+/-')
        this.BlueKey('÷')
      }
      .width('100%')
      .justifyContent(FlexAlign.SpaceAround)

      // 行 3: x!, √, x√y, lg, 7, 8, 9, ×
      Row() {
        this.StaticSciKey('x!')
        this.StaticSciKey('√')
        this.StaticSciKey('x√y')
        this.StaticSciKey('lg')
        this.NumberKey('7')
        this.NumberKey('8')
        this.NumberKey('9')
        this.BlueKey('×')
      }
      .width('100%')
      .justifyContent(FlexAlign.SpaceAround)

      // 行 4: 直连状态变量，2nd 激活时变身 asin, acos, atan, log2！
      Row() {
        // sin / asin
        CalcKey({
          text: this.isSecondActive ? 'asin' : 'sin',
          fontColor: this.isSecondActive ? this.currentTheme.primaryColor : this.currentTheme.textColorPrimary,
          fontSize: this.isSecondActive ? 13 : 15,
          fontWeight: this.isSecondActive ? FontWeight.Bold : FontWeight.Normal,
          btnWidth: 44,
          btnHeight: 44,
          onClickAction: (): void => {
            this.onKeyClick(this.isSecondActive ? 'asin' : 'sin');
          }
        })

        // cos / acos
        CalcKey({
          text: this.isSecondActive ? 'acos' : 'cos',
          fontColor: this.isSecondActive ? this.currentTheme.primaryColor : this.currentTheme.textColorPrimary,
          fontSize: this.isSecondActive ? 13 : 15,
          fontWeight: this.isSecondActive ? FontWeight.Bold : FontWeight.Normal,
          btnWidth: 44,
          btnHeight: 44,
          onClickAction: (): void => {
            this.onKeyClick(this.isSecondActive ? 'acos' : 'cos');
          }
        })

        // tan / atan
        CalcKey({
          text: this.isSecondActive ? 'atan' : 'tan',
          fontColor: this.isSecondActive ? this.currentTheme.primaryColor : this.currentTheme.textColorPrimary,
          fontSize: this.isSecondActive ? 13 : 15,
          fontWeight: this.isSecondActive ? FontWeight.Bold : FontWeight.Normal,
          btnWidth: 44,
          btnHeight: 44,
          onClickAction: (): void => {
            this.onKeyClick(this.isSecondActive ? 'atan' : 'tan');
          }
        })

        // ln / log2
        CalcKey({
          text: this.isSecondActive ? 'log2' : 'ln',
          fontColor: this.isSecondActive ? this.currentTheme.primaryColor : this.currentTheme.textColorPrimary,
          fontSize: this.isSecondActive ? 13 : 15,
          fontWeight: this.isSecondActive ? FontWeight.Bold : FontWeight.Normal,
          btnWidth: 44,
          btnHeight: 44,
          onClickAction: (): void => {
            this.onKeyClick(this.isSecondActive ? 'log2' : 'ln');
          }
        })

        this.NumberKey('4')
        this.NumberKey('5')
        this.NumberKey('6')
        this.BlueKey('-')
      }
      .width('100%')
      .justifyContent(FlexAlign.SpaceAround)

      // 行 5: 直连状态变量，2nd 激活时 e^x 变身 2^x！
      Row() {
        this.StaticSciKey('sinh')
        this.StaticSciKey('cosh')
        this.StaticSciKey('tanh')

        // e^x / 2^x
        CalcKey({
          text: this.isSecondActive ? '2^x' : 'e^x',
          fontColor: this.isSecondActive ? this.currentTheme.primaryColor : this.currentTheme.textColorPrimary,
          fontSize: 14,
          fontWeight: this.isSecondActive ? FontWeight.Bold : FontWeight.Normal,
          btnWidth: 44,
          btnHeight: 44,
          onClickAction: (): void => {
            this.onKeyClick(this.isSecondActive ? '2^x' : 'e^x');
          }
        })

        this.NumberKey('1')
        this.NumberKey('2')
        this.NumberKey('3')
        this.BlueKey('+')
      }
      .width('100%')
      .justifyContent(FlexAlign.SpaceAround)

      // 行 6: Rad, π, e, Rand, %, 0, ., =
      Row() {
        this.StaticSciKey('Rad')
        this.StaticSciKey('π')
        this.StaticSciKey('e')
        this.StaticSciKey('Rand')
        this.NumberKey('%')
        this.NumberKey('0')
        this.NumberKey('.')
        this.EqualKey()
      }
      .width('100%')
      .justifyContent(FlexAlign.SpaceAround)
    }
    .width('100%')
    .height('100%')
    .justifyContent(FlexAlign.SpaceAround)
    .padding({ left: 4, right: 4, bottom: 10 })
  }

  // 静态按键专用 Builder
  @Builder
  StaticSciKey(label: string) {
    CalcKey({
      text: label,
      fontColor: this.currentTheme.textColorPrimary,
      fontSize: 15,
      fontWeight: FontWeight.Normal,
      btnWidth: 44,
      btnHeight: 44,
      onClickAction: (): void => {
        this.onKeyClick(label);
      }
    })
  }

  @Builder
  BlueKey(label: string) {
    CalcKey({
      text: label,
      fontColor: this.currentTheme.primaryColor,
      fontSize: 16,
      fontWeight: FontWeight.Medium,
      btnWidth: 44,
      btnHeight: 44,
      onClickAction: (): void => {
        this.onKeyClick(label);
      }
    })
  }

  @Builder
  NumberKey(digit: string) {
    CalcKey({
      text: digit,
      fontColor: this.currentTheme.textColorPrimary,
      fontSize: 20,
      fontWeight: FontWeight.Normal,
      btnWidth: 44,
      btnHeight: 44,
      onClickAction: (): void => {
        this.onKeyClick(digit);
      }
    })
  }

  @Builder
  EqualKey() {
    Button() {
      Text('=')
        .fontSize(22)
        .fontColor('#FFFFFF')
    }
    .width(42)
    .height(42)
    .borderRadius(21)
    .backgroundColor(this.currentTheme.primaryColor)
    .onClick((): void => {
      this.onEqualClick();
    })
  }
}