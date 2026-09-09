// entry/src/main/ets/CalcEngine.ets

/**
 * 历史记录数据模型
 */
export class HistoryItem {
  id: string = '';
  expression: string = '';
  result: string = '';
  timestamp: string = '';

  constructor(expression: string, result: string) {
    this.id = Date.now().toString() + Math.floor(Math.random() * 10000).toString();
    this.expression = expression;
    this.result = result;
    const now: Date = new Date();
    const h: string = now.getHours().toString().padStart(2, '0');
    const m: string = now.getMinutes().toString().padStart(2, '0');
    this.timestamp = `${h}:${m}`;
  }
}

/**
 * 币种数据模型
 */
export interface Currency {
  code: string;
  name: string;
  symbol: string;
  rateToUSD: number; // 相对美元基准汇率
}

export const SUPPORTED_CURRENCIES: Currency[] = [
  { code: 'USD', name: '美元', symbol: '$', rateToUSD: 1.0 },
  { code: 'CNY', name: '人民币', symbol: '¥', rateToUSD: 7.2350 },
  { code: 'EUR', name: '欧元', symbol: '€', rateToUSD: 0.9210 },
  { code: 'JPY', name: '日元', symbol: '円', rateToUSD: 154.60 },
  { code: 'GBP', name: '英镑', symbol: '£', rateToUSD: 0.7890 },
  { code: 'HKD', name: '港元', symbol: 'HK$', rateToUSD: 7.8210 }
];

/**
 * 内部解析强类型 Token，避免联合类型带来的推断隐患
 */
class Token {
  isOperator: boolean = false;
  numberValue: number = 0;
  opSymbol: string = '';

  constructor(isOp: boolean, num: number, op: string) {
    this.isOperator = isOp;
    this.numberValue = num;
    this.opSymbol = op;
  }
}

/**
 * 高精度安全计算引擎（严格符合 ArkTS 静态类型检查）
 */
export class CalcEngine {
  /**
   * 实时安全求值
   */
  public static evaluateExpression(expr: string): string {
    if (!expr || expr.trim() === '') {
      return '';
    }

    try {
      // 替换界面符号为标准数学符号
      let sanitized: string = expr
        .replace(/×/g, '*')
        .replace(/÷/g, '/')
        .replace(/%/g, '*0.01');

      // 去除末尾未输入完的操作符
      while (['+', '-', '*', '/'].includes(sanitized.slice(-1))) {
        sanitized = sanitized.slice(0, -1);
      }

      if (!sanitized) {
        return '';
      }

      const result: number = CalcEngine.simpleEval(sanitized);
      if (isNaN(result) || !isFinite(result)) {
        return '错误';
      }
      return CalcEngine.formatNumber(result);
    } catch (e) {
      return '';
    }
  }

  /**
   * 千分位格式化
   */
  public static formatNumber(num: number | string): string {
    const str: string = num.toString();
    const parts: string[] = str.split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    if (parts.length > 1 && parts[1].length > 8) {
      parts[1] = parts[1].slice(0, 8);
    }
    return parts.join('.');
  }

  /**
   * 四则运算解析器（严格强类型处理，无 any/unknown）
   */
  private static simpleEval(fnStr: string): number {
    // 递归处理括号，显式声明正则替换函数入参类型
    while (fnStr.includes('(')) {
      fnStr = fnStr.replace(/\(([^()]+)\)/g, (_: string, match: string): string => {
        return CalcEngine.simpleEval(match).toString();
      });
    }

    const tokens: Token[] = [];
    let numBuffer: string = '';

    for (let i = 0; i < fnStr.length; i++) {
      const char: string = fnStr.charAt(i);
      if ('+-*/'.includes(char)) {
        if (numBuffer !== '') {
          tokens.push(new Token(false, parseFloat(numBuffer), ''));
          numBuffer = '';
        } else if (char === '-' && (i === 0 || '+-*/'.includes(fnStr.charAt(i - 1)))) {
          // 处理负数符号
          numBuffer += '-';
          continue;
        }
        tokens.push(new Token(true, 0, char));
      } else {
        numBuffer += char;
      }
    }

    if (numBuffer !== '') {
      tokens.push(new Token(false, parseFloat(numBuffer), ''));
    }

    if (tokens.length === 0) {
      return 0;
    }

    // 1. 先算乘除
    for (let i = 0; i < tokens.length; i++) {
      if (tokens[i].isOperator && (tokens[i].opSymbol === '*' || tokens[i].opSymbol === '/')) {
        const op: string = tokens[i].opSymbol;
        const prev: number = tokens[i - 1].numberValue;
        const next: number = tokens[i + 1].numberValue;
        let res: number = 0;
        if (op === '*') {
          res = prev * next;
        } else {
          if (next === 0) {
            return NaN; // 除零返回错误
          }
          res = prev / next;
        }
        tokens.splice(i - 1, 3, new Token(false, res, ''));
        i--;
      }
    }

    // 2. 后算加减
    let finalResult: number = tokens[0].numberValue;
    for (let i = 1; i < tokens.length; i += 2) {
      const op: string = tokens[i].opSymbol;
      const next: number = tokens[i + 1].numberValue;
      if (op === '+') {
        finalResult += next;
      }
      if (op === '-') {
        finalResult -= next;
      }
    }

    return finalResult;
  }
}