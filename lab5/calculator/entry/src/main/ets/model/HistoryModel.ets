// entry/src/main/ets/model/HistoryModel.ets

/**
 * 单条历史计算记录
 */
export class HistoryItem {
  public id: string = '';
  public expression: string = '';
  public result: string = '';
  public timestamp: string = '';
  public fullDate: string = '';

  constructor(expression: string, result: string) {
    this.id = Date.now().toString() + Math.floor(Math.random() * 100000).toString();
    this.expression = expression;
    this.result = result;

    const date: Date = new Date();
    const h: string = date.getHours().toString().padStart(2, '0');
    const m: string = date.getMinutes().toString().padStart(2, '0');
    const s: string = date.getSeconds().toString().padStart(2, '0');
    this.timestamp = `${h}:${m}`;
    this.fullDate = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')} ${h}:${m}:${s}`;
  }
}