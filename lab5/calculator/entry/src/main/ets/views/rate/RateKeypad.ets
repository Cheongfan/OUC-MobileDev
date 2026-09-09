// entry/src/main/ets/views/rate/RateKeypad.ets
import { CalcConstants, KeyType } from '../../common/CalcConstants';
import { CalcKey } from '../components/CalcKey';

@Component
export struct RateKeypad {
  @Prop themeColor: string = CalcConstants.COLOR_PRIMARY_BLUE;

  onNumberClick: (digit: string) => void = (digit: string): void => {};
  onClearClick: () => void = (): void => {};
  onBackspaceClick: () => void = (): void => {};

  build() {
    Column({ space: 16 }) {
      // 第 1 排: 7, 8, 9, AC
      Row() {
        this.DigitKey('7')
        this.DigitKey('8')
        this.DigitKey('9')
        this.ActionKey('AC', this.themeColor, (): void => this.onClearClick())
      }
      .width('100%')
      .justifyContent(FlexAlign.SpaceAround)

      // 第 2 排: 4, 5, 6, 空白占位
      Row() {
        this.DigitKey('4')
        this.DigitKey('5')
        this.DigitKey('6')
        this.EmptyPlaceholder()
      }
      .width('100%')
      .justifyContent(FlexAlign.SpaceAround)

      // 第 3 排: 1, 2, 3, 空白占位
      Row() {
        this.DigitKey('1')
        this.DigitKey('2')
        this.DigitKey('3')
        this.EmptyPlaceholder()
      }
      .width('100%')
      .justifyContent(FlexAlign.SpaceAround)

      // 第 4 排: 0, 00, ., ←
      Row() {
        this.DigitKey('0')
        this.DigitKey('00')
        this.DigitKey('.')
        this.ActionKey(CalcConstants.OP_BACKSPACE, this.themeColor, (): void => this.onBackspaceClick())
      }
      .width('100%')
      .justifyContent(FlexAlign.SpaceAround)
    }
    .width('100%')
    .padding({ left: 16, right: 16, bottom: 24 })
  }

  @Builder
  DigitKey(text: string) {
    CalcKey({
      text: text,
      fontColor: CalcConstants.COLOR_TEXT_PRIMARY,
      fontSize: 28,
      fontWeight: FontWeight.Normal,
      btnWidth: 72,
      btnHeight: 56,
      keyType: KeyType.NUMBER,
      onClickAction: (): void => {
        this.onNumberClick(text);
      }
    })
  }

  @Builder
  ActionKey(text: string, color: ResourceColor, action: () => void) {
    CalcKey({
      text: text,
      fontColor: color,
      fontSize: 24,
      fontWeight: FontWeight.Medium,
      btnWidth: 72,
      btnHeight: 56,
      keyType: KeyType.ACTION,
      onClickAction: (): void => {
        action();
      }
    })
  }

  @Builder
  EmptyPlaceholder() {
    Stack()
      .width(72)
      .height(56)
  }
}