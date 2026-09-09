// entry/src/main/ets/model/CurrencyModel.ets

/**
 * 币种模型
 */
export class CurrencyItem {
  public code: string = '';
  public name: string = '';
  public symbol: string = '';
  public rateToUSD: number = 1.0; // 相对美元基准汇率

  constructor(code: string, name: string, symbol: string, rate: number) {
    this.code = code;
    this.name = name;
    this.symbol = symbol;
    this.rateToUSD = rate;
  }
}

/**
 * 全量支持的主流币种数据库
 */
export const GLOBAL_CURRENCIES: CurrencyItem[] = [
  new CurrencyItem('USD', '美元', '$', 1.0),
  new CurrencyItem('CNY', '人民币', '¥', 7.2350),
  new CurrencyItem('EUR', '欧元', '€', 0.9215),
  new CurrencyItem('JPY', '日元', '円', 155.20),
  new CurrencyItem('GBP', '英镑', '£', 0.7895),
  new CurrencyItem('HKD', '港元', 'HK$', 7.8240),
  new CurrencyItem('KRW', '韩元', '₩', 1378.50),
  new CurrencyItem('AUD', '澳大利亚元', 'A$', 1.5120),
  new CurrencyItem('CAD', '加拿大元', 'C$', 1.3650),
  new CurrencyItem('SGD', '新加坡元', 'S$', 1.3520),
  new CurrencyItem('CHF', '瑞士法郎', 'CHF', 0.9080)
];