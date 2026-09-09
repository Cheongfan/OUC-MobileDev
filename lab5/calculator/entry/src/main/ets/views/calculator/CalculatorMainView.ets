// entry/src/main/ets/views/calculator/CalculatorMainView.ets
import { CalcConstants } from '../../common/CalcConstants';
import { MathEngine } from '../../common/MathEngine';
import { HistoryItem } from '../../model/HistoryModel';
import { RightOperatorColumn } from '../components/RightOperatorColumn';
import { CalcDisplayView } from './CalcDisplayView';
import { HistoryCardView } from './HistoryCardView';
import { StandardKeypadView } from './StandardKeypadView';

@Component
export struct CalculatorMainView {
  @Prop themeColor: string = CalcConstants.COLOR_PRIMARY_BLUE;
  @Link historyList: Array<HistoryItem>;

  // 内部计算状态
  @State expression: string = '6÷';
  @State previewResult: string = '6';
  @State isShowHistory: boolean = false;
  @State isScientificMode: boolean = false;
  @State memoryValue: number = 0;
  @State activeOperator: string = '÷';

  build() {
    Column() {
      // 1. 结果自适应显示屏
      CalcDisplayView({
        expression: this.expression,
        previewResult: this.previewResult
      })

      // 2. 中间辅助操作条 (图 3 风格撤回/时钟切换 + MODE 按钮)
      Row({ space: 20 }) {
        // 核心图标：常态是时钟🕒，展开历史时变成撤销↩
        Text(this.isShowHistory ? '↩' : '🕒')
          .fontSize(22)
          .fontColor('#5E6470')
          .padding({ left: 4, right: 4 })
          .onClick((): void => {
            this.isShowHistory = !this.isShowHistory;
          })

        // MODE 切换按钮
        Text(this.isScientificMode ? 'MODE [科学]' : 'MODE')
          .fontSize(13)
          .fontWeight(FontWeight.Medium)
          .fontColor(this.isScientificMode ? this.themeColor : '#5E6470')
          .border({
            width: 1,
            color: this.isScientificMode ? this.themeColor : '#A0A6B2',
            radius: 4
          })
          .padding({ left: 6, right: 6, top: 2, bottom: 2 })
          .onClick((): void => {
            this.isScientificMode = !this.isScientificMode;
          })

        Blank()
      }
      .width('100%')
      .padding({ left: 24, right: 24, bottom: 6 })

      // 3. 左右分栏核心键盘区 (Row 左右切分布局)
      Row() {
        // 左侧自适应容器 (75% 宽度)：历史卡片 vs 数字键盘平滑替换
        Column() {
          if (this.isShowHistory) {
            HistoryCardView({
              historyList: $historyList,
              themeColor: this.themeColor,
              onItemClick: (val: string): void => {
                this.expression = val;
                this.previewResult = '';
                this.activeOperator = '';
                this.isShowHistory = false; // 回填后切回键盘
              },
              onClearClick: (): void => {
                this.historyList = [];
              }
            })
          } else {
            StandardKeypadView({
              themeColor: this.themeColor,
              isScientificMode: this.isScientificMode,
              hasMemory: this.memoryValue !== 0,
              onNumberInput: (digit: string): void => {
                this.handleDigit(digit);
              },
              onActionClick: (action: string): void => {
                this.handleAction(action);
              },
              onMemoryClick: (op: string): void => {
                this.handleMemory(op);
              },
              onScientificFunc: (func: string): void => {
                this.handleScientificFunc(func);
              }
            })
          }
        }
        .layoutWeight(3)
        .height('100%')

        // 右侧固定操作符列 (25% 宽度)：退格、÷、×、-、+、= 始终可见
        Column() {
          RightOperatorColumn({
            themeColor: this.themeColor,
            activeOp: this.activeOperator,
            onOperatorClick: (op: string): void => {
              this.handleOperator(op);
            },
            onBackspaceClick: (): void => {
              this.handleBackspace();
            },
            onEqualClick: (): void => {
              this.handleEqual();
            }
          })
        }
        .layoutWeight(1)
        .height('100%')
      }
      .layoutWeight(1)
      .width('100%')
      .padding({ left: 12, right: 12, bottom: 16 })
    }
    .width('100%')
    .height('100%')
  }

  // ==========================================
  //  核心计算业务逻辑
  // ==========================================

  private handleDigit(digit: string): void {
    if (this.expression === '0' && digit !== '.') {
      this.expression = digit;
    } else {
      this.expression += digit;
    }
    this.activeOperator = '';
    this.previewResult = MathEngine.evaluate(this.expression);
  }

  private handleOperator(op: string): void {
    if (this.expression === '' && op !== '-') return;

    const lastChar: string = this.expression.slice(-1);
    if (['+', '-', '×', '÷'].includes(lastChar)) {
      this.expression = this.expression.slice(0, -1) + op;
    } else {
      this.expression += op;
    }
    this.activeOperator = op;
    this.previewResult = MathEngine.evaluate(this.expression);
  }

  private handleBackspace(): void {
    if (this.expression.length > 0) {
      this.expression = this.expression.slice(0, -1);
      this.previewResult = MathEngine.evaluate(this.expression);
      const lastChar: string = this.expression.slice(-1);
      this.activeOperator = ['+', '-', '×', '÷'].includes(lastChar) ? lastChar : '';
    }
  }

  private handleAction(action: string): void {
    if (action === 'AC') {
      this.expression = '';
      this.previewResult = '';
      this.activeOperator = '';
    } else if (action === '+/-') {
      if (!this.expression) return;
      if (this.expression.startsWith('-')) {
        this.expression = this.expression.slice(1);
      } else {
        this.expression = '-' + this.expression;
      }
      this.previewResult = MathEngine.evaluate(this.expression);
    } else if (action === '%') {
      this.expression += '%';
      this.previewResult = MathEngine.evaluate(this.expression);
    } else if (action === '(') {
      this.expression += '(';
    }
  }

  private handleMemory(op: string): void {
    const currentVal: number = parseFloat(this.previewResult || this.expression) || 0;
    if (op === 'mc') {
      this.memoryValue = 0;
    } else if (op === 'm+') {
      this.memoryValue += currentVal;
    } else if (op === 'm-') {
      this.memoryValue -= currentVal;
    } else if (op === 'mr') {
      this.expression += this.memoryValue.toString();
      this.previewResult = MathEngine.evaluate(this.expression);
    }
  }

  private handleScientificFunc(func: string): void {
    if (func === 'π' || func === 'e') {
      this.expression += func;
    } else if (func === '^') {
      this.expression += '^';
    } else if (func === ')') {
      this.expression += ')';
    } else {
      // 科学函数如 sin, cos, tan, sqrt, ln, log
      this.expression += `${func}(`;
    }
    this.previewResult = MathEngine.evaluate(this.expression);
  }

  private handleEqual(): void {
    if (!this.expression) return;

    const result: string = MathEngine.evaluate(this.expression);
    if (result && result !== '错误') {
      // 插入历史记录最前端
      this.historyList.unshift(new HistoryItem(this.expression, result));
      this.expression = result;
      this.previewResult = '';
      this.activeOperator = '';
    }
  }
}