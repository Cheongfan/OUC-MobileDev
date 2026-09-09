// entry/src/main/ets/common/RateService.ets
import http from '@ohos.net.http';
import { CurrencyItem, GLOBAL_CURRENCIES } from '../model/CurrencyModel';

interface ExchangeRateApiResult {
  result: string;
  rates: Record<string, number>;
  time_last_update_utc: string;
}

export class RateService {
  // 开放免费的全球汇率接口 (以美元为基准)
  private static readonly API_URL: string = 'https://open.er-api.com/v6/latest/USD';

  /**
   * 从网络异步获取最新实时汇率
   */
  public static async fetchLatestRates(): Promise<string> {
    const httpRequest: http.HttpRequest = http.createHttp();

    try {
      const response: http.HttpResponse = await httpRequest.request(RateService.API_URL, {
        method: http.RequestMethod.GET,
        connectTimeout: 6000,
        readTimeout: 6000
      });

      if (response.responseCode === 200) {
        const rawText: string = response.result.toString();
        const json: ExchangeRateApiResult = JSON.parse(rawText) as ExchangeRateApiResult;

        if (json && json.rates) {
          // 动态刷新内存中所有货币的汇率
          for (let i = 0; i < GLOBAL_CURRENCIES.length; i++) {
            const code: string = GLOBAL_CURRENCIES[i].code;
            if (json.rates[code] !== undefined) {
              GLOBAL_CURRENCIES[i].rateToUSD = json.rates[code];
            }
          }

          const now: Date = new Date();
          const timeStr: string = `${now.getFullYear()}/${(now.getMonth() + 1).toString().padStart(2, '0')}/${now.getDate().toString().padStart(2, '0')} ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
          return `汇率已同步更新于: ${timeStr}`;
        }
      }
      return '网络同步失败，使用本地缓存汇率';
    } catch (err) {
      return '当前网络不可用，已加载基准汇率';
    } finally {
      httpRequest.destroy();
    }
  }
}