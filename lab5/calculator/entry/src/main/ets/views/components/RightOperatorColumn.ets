// entry/src/main/ets/views/components/RightOperatorColumn.ets
import { CalcConstants, KeyType } from '../../common/CalcConstants';
import { CalcKey } from './CalcKey';

@Component
export struct RightOperatorColumn {
  @Prop themeColor: string = CalcConstants.COLOR_PRIMARY_BLUE;
  @Prop activeOp: string = ''; // 当前处于激活等待状态的操作符

  // 操作回调
  onOperatorClick: (op: string) => void = (op: string): void => {};
  onBackspaceClick: () => void = (): void => {};
  onEqualClick: () => void = (): void => {};

  build() {
    Column() {
      // 1. 退格键
      CalcKey({
        text: CalcConstants.OP_BACKSPACE,
        fontColor: this.themeColor,
        fontSize: 28,
        fontWeight: FontWeight.Medium,
        btnWidth: 62,
        btnHeight: 56,
        keyType: KeyType.ACTION,
        onClickAction: (): void => {
          this.onBackspaceClick();
        }
      })

      // 2. 除号 ÷
      CalcKey({
        text: CalcConstants.OP_DIV,
        fontColor: this.activeOp === CalcConstants.OP_DIV ? '#FFFFFF' : this.themeColor,
        bgColor: this.activeOp === CalcConstants.OP_DIV ? this.themeColor : Color.Transparent,
        fontSize: 32,
        fontWeight: FontWeight.Regular,
        btnWidth: 62,
        btnHeight: 56,
        isCircular: true,
        keyType: KeyType.OPERATOR,
        onClickAction: (): void => {
          this.onOperatorClick(CalcConstants.OP_DIV);
        }
      })

      // 3. 乘号 ×
      CalcKey({
        text: CalcConstants.OP_MUL,
        fontColor: this.activeOp === CalcConstants.OP_MUL ? '#FFFFFF' : this.themeColor,
        bgColor: this.activeOp === CalcConstants.OP_MUL ? this.themeColor : Color.Transparent,
        fontSize: 30,
        fontWeight: FontWeight.Regular,
        btnWidth: 62,
        btnHeight: 56,
        isCircular: true,
        keyType: KeyType.OPERATOR,
        onClickAction: (): void => {
          this.onOperatorClick(CalcConstants.OP_MUL);
        }
      })

      // 4. 减号 -
      CalcKey({
        text: CalcConstants.OP_SUB,
        fontColor: this.activeOp === CalcConstants.OP_SUB ? '#FFFFFF' : this.themeColor,
        bgColor: this.activeOp === CalcConstants.OP_SUB ? this.themeColor : Color.Transparent,
        fontSize: 34,
        fontWeight: FontWeight.Regular,
        btnWidth: 62,
        btnHeight: 56,
        isCircular: true,
        keyType: KeyType.OPERATOR,
        onClickAction: (): void => {
          this.onOperatorClick(CalcConstants.OP_SUB);
        }
      })

      // 5. 加号 +
      CalcKey({
        text: CalcConstants.OP_ADD,
        fontColor: this.activeOp === CalcConstants.OP_ADD ? '#FFFFFF' : this.themeColor,
        bgColor: this.activeOp === CalcConstants.OP_ADD ? this.themeColor : Color.Transparent,
        fontSize: 30,
        fontWeight: FontWeight.Regular,
        btnWidth: 62,
        btnHeight: 56,
        isCircular: true,
        keyType: KeyType.OPERATOR,
        onClickAction: (): void => {
          this.onOperatorClick(CalcConstants.OP_ADD);
        }
      })

      // 6. 蓝色高亮大圆等号 =
      CalcKey({
        text: CalcConstants.OP_EQUAL,
        fontColor: CalcConstants.COLOR_WHITE,
        bgColor: this.themeColor,
        fontSize: 34,
        fontWeight: FontWeight.Normal,
        btnWidth: 62,
        btnHeight: 62,
        isCircular: true,
        keyType: KeyType.EQUAL,
        onClickAction: (): void => {
          this.onEqualClick();
        }
      })
    }
    .width('100%')
    .height('100%')
    .justifyContent(FlexAlign.SpaceBetween)
    .alignItems(HorizontalAlign.Center)
  }
}