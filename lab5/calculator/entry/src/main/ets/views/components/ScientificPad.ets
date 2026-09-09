// entry/src/main/ets/views/components/ScientificPad.ets
import { CalcConstants, KeyType } from '../../common/CalcConstants';
import { CalcKey } from './CalcKey';

@Component
export struct ScientificPad {
  @Prop themeColor: string = CalcConstants.COLOR_PRIMARY_BLUE;
  onScientificAction: (funcName: string) => void = (funcName: string): void => {};

  build() {
    Column({ space: 8 }) {
      // 科学排 1: sin, cos, tan, √
      Row() {
        this.SciKey('sin')
        this.SciKey('cos')
        this.SciKey('tan')
        this.SciKey('sqrt', '√')
      }
      .width('100%')
      .justifyContent(FlexAlign.SpaceAround)

      // 科学排 2: ln, log, π, e
      Row() {
        this.SciKey('ln')
        this.SciKey('log')
        this.SciKey('π')
        this.SciKey('e')
      }
      .width('100%')
      .justifyContent(FlexAlign.SpaceAround)

      // 科学排 3: (, ), ^
      Row() {
        this.SciKey('(')
        this.SciKey(')')
        this.SciKey('^', 'xʸ')
        this.SciKey('%')
      }
      .width('100%')
      .justifyContent(FlexAlign.SpaceAround)
    }
    .width('100%')
    .padding({ top: 4, bottom: 8 })
    .backgroundColor('#F1F3F6')
    .borderRadius(14)
  }

  @Builder
  SciKey(funcName: string, label?: string) {
    CalcKey({
      text: label ? label : funcName,
      fontColor: '#4E5969',
      fontSize: 18,
      fontWeight: FontWeight.Medium,
      btnWidth: 54,
      btnHeight: 40,
      bgColor: '#FFFFFF',
      keyType: KeyType.SCIENTIFIC,
      onClickAction: (): void => {
        this.onScientificAction(funcName);
      }
    })
  }
}