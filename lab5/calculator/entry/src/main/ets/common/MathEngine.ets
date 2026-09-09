// entry/src/main/ets/common/MathEngine.ets

class EvalToken {
  public isOperator: boolean = false;
  public isFunction: boolean = false;
  public numValue: number = 0;
  public symbol: string = '';

  constructor(isOp: boolean, isFunc: boolean, num: number, sym: string) {
    this.isOperator = isOp;
    this.isFunction = isFunc;
    this.numValue = num;
    this.symbol = sym;
  }
}

export class MathEngine {
  private static getPrecedence(op: string): number {
    if (op === '+' || op === '-') return 1;
    if (op === '×' || op === '*' || op === '÷' || op === '/' || op === '%') return 2;
    if (op === '^' || op === 'nroot') return 3; // 方幂与开任意次方根具有最高优先级
    return 0;
  }

  private static isFunction(name: string): boolean {
    return ['sin', 'cos', 'tan', 'asin', 'acos', 'atan', 'sinh', 'cosh', 'tanh', 'ln', 'lg', 'log2', 'sqrt', 'fact'].includes(name);
  }

  public static formatDisplayNumber(value: number | string): string {
    if (value === '' || value === undefined || value === null) return '0';
    const str: string = value.toString();
    if (str === '错误' || str === 'NaN' || str === 'Infinity') return '错误';

    const parts: string[] = str.split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    if (parts.length > 1) {
      let dec: string = parts[1].slice(0, 8);
      dec = dec.replace(/0+$/, '');
      return dec.length > 0 ? `${parts[0]}.${dec}` : parts[0];
    }
    return parts[0];
  }

  public static evaluate(expr: string): string {
    if (!expr || expr.trim() === '') return '';

    try {
      let sanitized: string = expr.trim();

      // 1. 后缀阶乘语法转换 (如 5! -> fact(5))
      sanitized = sanitized.replace(/(\d+(\.\d+)?)!/g, 'fact($1)');

      // 2. 将流派 B 的 "3√(8)" 转换为标准的双目开方 token "3 nroot 8"
      sanitized = sanitized.replace(/(\d+(\.\d+)?)\s*√\s*\(/g, '$1 nroot (');

      // 3. 剥除末尾未完成的运算符
      while (['+', '-', '×', '÷', '*', '/', '^', '√'].includes(sanitized.slice(-1))) {
        sanitized = sanitized.slice(0, -1);
      }
      if (!sanitized) return '';

      // 4. 自动补齐末尾缺失的右括号
      let openCount: number = 0;
      let closeCount: number = 0;
      for (let i = 0; i < sanitized.length; i++) {
        if (sanitized.charAt(i) === '(') openCount++;
        if (sanitized.charAt(i) === ')') closeCount++;
      }
      while (openCount > closeCount) {
        sanitized += ')';
        closeCount++;
      }

      const tokens: EvalToken[] = MathEngine.tokenize(sanitized);
      const rpnQueue: EvalToken[] = MathEngine.shuntingYard(tokens);
      const result: number = MathEngine.executeRPN(rpnQueue);

      if (isNaN(result) || !isFinite(result)) {
        return '错误';
      }

      const cleanResult: number = Math.round(result * 10000000000) / 10000000000;
      return MathEngine.formatDisplayNumber(cleanResult);
    } catch (e) {
      return '';
    }
  }

  private static tokenize(expr: string): EvalToken[] {
    const tokens: EvalToken[] = [];
    let i: number = 0;

    while (i < expr.length) {
      const char: string = expr.charAt(i);

      if (char === ' ') {
        i++;
        continue;
      }

      // 数字解析
      if ('0123456789.'.includes(char)) {
        let numStr: string = '';
        while (i < expr.length && '0123456789.'.includes(expr.charAt(i))) {
          numStr += expr.charAt(i);
          i++;
        }
        tokens.push(new EvalToken(false, false, parseFloat(numStr), ''));
        continue;
      }

      // 常数 π 与 e
      if (char === 'π') {
        tokens.push(new EvalToken(false, false, Math.PI, ''));
        i++;
        continue;
      }
      if (char === 'e' && (i === expr.length - 1 || !/[a-zA-Z]/.test(expr.charAt(i + 1)))) {
        tokens.push(new EvalToken(false, false, Math.E, ''));
        i++;
        continue;
      }

      // 函数名与操作符标识
      if (/[a-zA-Z]/.test(char)) {
        let funcStr: string = '';
        while (i < expr.length && /[a-zA-Z0-9]/.test(expr.charAt(i))) {
          funcStr += expr.charAt(i);
          i++;
        }
        if (funcStr === 'nroot') {
          tokens.push(new EvalToken(true, false, 0, 'nroot'));
        } else if (MathEngine.isFunction(funcStr)) {
          tokens.push(new EvalToken(false, true, 0, funcStr));
        }
        continue;
      }

      if ('+-×÷*/^%()√'.includes(char)) {
        if (char === '√') {
          // 单目开平方
          tokens.push(new EvalToken(false, true, 0, 'sqrt'));
          i++;
          continue;
        }

        const stdOp: string = (char === '*') ? '×' : ((char === '/') ? '÷' : char);

        if (stdOp === '-') {
          const isUnary: boolean = (tokens.length === 0) ||
            (tokens[tokens.length - 1].isOperator) ||
            (tokens[tokens.length - 1].symbol === '(');
          if (isUnary) {
            tokens.push(new EvalToken(false, false, -1, ''));
            tokens.push(new EvalToken(true, false, 0, '×'));
            i++;
            continue;
          }
        }

        tokens.push(new EvalToken(stdOp !== '(' && stdOp !== ')', false, 0, stdOp));
        i++;
        continue;
      }

      i++;
    }

    return tokens;
  }

  private static shuntingYard(tokens: EvalToken[]): EvalToken[] {
    const outputQueue: EvalToken[] = [];
    const operatorStack: EvalToken[] = [];

    for (let i = 0; i < tokens.length; i++) {
      const token: EvalToken = tokens[i];

      if (!token.isOperator && !token.isFunction && token.symbol !== '(' && token.symbol !== ')') {
        outputQueue.push(token);
      } else if (token.isFunction) {
        operatorStack.push(token);
      } else if (token.isOperator) {
        while (
          operatorStack.length > 0 &&
            operatorStack[operatorStack.length - 1].symbol !== '(' &&
            (operatorStack[operatorStack.length - 1].isFunction ||
              MathEngine.getPrecedence(operatorStack[operatorStack.length - 1].symbol) >= MathEngine.getPrecedence(token.symbol))
        ) {
          const popped: EvalToken | undefined = operatorStack.pop();
          if (popped) outputQueue.push(popped);
        }
        operatorStack.push(token);
      } else if (token.symbol === '(') {
        operatorStack.push(token);
      } else if (token.symbol === ')') {
        while (operatorStack.length > 0 && operatorStack[operatorStack.length - 1].symbol !== '(') {
          const popped: EvalToken | undefined = operatorStack.pop();
          if (popped) outputQueue.push(popped);
        }
        operatorStack.pop();
        if (operatorStack.length > 0 && operatorStack[operatorStack.length - 1].isFunction) {
          const poppedFunc: EvalToken | undefined = operatorStack.pop();
          if (poppedFunc) outputQueue.push(poppedFunc);
        }
      }
    }

    while (operatorStack.length > 0) {
      const popped: EvalToken | undefined = operatorStack.pop();
      if (popped) outputQueue.push(popped);
    }

    return outputQueue;
  }

  private static executeRPN(rpnQueue: EvalToken[]): number {
    const stack: number[] = [];

    for (let i = 0; i < rpnQueue.length; i++) {
      const token: EvalToken = rpnQueue[i];

      if (!token.isOperator && !token.isFunction) {
        stack.push(token.numValue);
      } else if (token.isFunction) {
        const val: number = stack.pop() || 0;
        let res: number = 0;
        if (token.symbol === 'sin') res = Math.sin(val * Math.PI / 180);
        else if (token.symbol === 'cos') res = Math.cos(val * Math.PI / 180);
        else if (token.symbol === 'tan') res = Math.tan(val * Math.PI / 180);
        else if (token.symbol === 'asin') res = Math.asin(val) * 180 / Math.PI; // 角度制
        else if (token.symbol === 'acos') res = Math.acos(val) * 180 / Math.PI;
        else if (token.symbol === 'atan') res = Math.atan(val) * 180 / Math.PI;
        else if (token.symbol === 'sinh') res = Math.sinh(val);
        else if (token.symbol === 'cosh') res = Math.cosh(val);
        else if (token.symbol === 'tanh') res = Math.tanh(val);
        else if (token.symbol === 'ln') res = Math.log(val);
        else if (token.symbol === 'lg') res = Math.log10(val);
        else if (token.symbol === 'log2') res = Math.log2(val);
        else if (token.symbol === 'sqrt') res = Math.sqrt(val);
        else if (token.symbol === 'fact') res = MathEngine.factorial(val);
        stack.push(res);
      } else if (token.isOperator) {
        const right: number = stack.pop() || 0;
        const left: number = stack.pop() || 0;
        let res: number = 0;
        if (token.symbol === '+') res = left + right;
        else if (token.symbol === '-') res = left - right;
        else if (token.symbol === '×') res = left * right;
        else if (token.symbol === '÷') {
          if (right === 0) return NaN;
          res = left / right;
        } else if (token.symbol === '%') res = left % right;
        else if (token.symbol === '^') res = Math.pow(left, right);
        else if (token.symbol === 'nroot') {
          // 流派 B 核心运算：left √ right 即 right 的 1/left 次方
          if (left === 0) return NaN;
          res = Math.pow(right, 1 / left);
        }
        stack.push(res);
      }
    }

    return stack.length > 0 ? stack[0] : 0;
  }

  private static factorial(n: number): number {
    if (n < 0) return NaN;
    if (n === 0 || n === 1) return 1;
    let res: number = 1;
    for (let i = 2; i <= Math.min(n, 20); i++) {
      res *= i;
    }
    return res;
  }
}