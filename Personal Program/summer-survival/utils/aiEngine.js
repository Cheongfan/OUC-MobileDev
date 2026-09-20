// utils/aiEngine.js

// 微信云托管服务配置（与你的控制台完全对齐）
const CLOUD_CONTAINER_CONFIG = {
  env: 'your-env-id',               // 你的环境 ID
  service: 'deepseek-proxy', // 你的云托管服务名
  path: '/api/debate'        // 容器内接口路径
};

/**
 * 纯端侧轻量级 UTF-8 ArrayBuffer 解码器
 */
function decodeUtf8(arrayBuffer) {
  const bytes = new Uint8Array(arrayBuffer);
  let str = '';
  let i = 0;
  while (i < bytes.length) {
    const b1 = bytes[i++];
    if (b1 < 0x80) {
      str += String.fromCharCode(b1);
    } else if (b1 > 0xBF && b1 < 0xE0) {
      const b2 = bytes[i++];
      str += String.fromCharCode(((b1 & 0x1F) << 6) | (b2 & 0x3F));
    } else if (b1 > 0xDF && b1 < 0xF0) {
      const b2 = bytes[i++];
      const b3 = bytes[i++];
      str += String.fromCharCode(((b1 & 0x0F) << 12) | ((b2 & 0x3F) << 6) | (b3 & 0x3F));
    } else {
      const b2 = bytes[i++];
      const b3 = bytes[i++];
      const b4 = bytes[i++];
      let cp = ((b1 & 0x07) << 18) | ((b2 & 0x3F) << 12) | ((b3 & 0x3F) << 6) | (b4 & 0x3F);
      cp -= 0x10000;
      str += String.fromCharCode(0xD800 + (cp >> 10), 0xDC00 + (cp & 0x3FF));
    }
  }
  return str;
}

/**
 * L2 离线降级规则库
 */
const OFFLINE_RULES = [
  {
    keywords: ['学习', '作业', '高数', '复习', '考研', '考证'],
    speech: '“少拿假学习糊弄我！看你这黑眼圈，分明就是在刷短视频！”',
    data: { stamina: -5, money: 0, sanity: -5, momRage: -10, title: '急中生智', passed: true }
  },
  {
    keywords: ['拖地', '洗碗', '倒垃圾', '家务', '做饭'],
    speech: '“行了行了，明天早上看你表现，赶紧把手机放下睡！”',
    data: { stamina: -10, money: 0, sanity: +5, momRage: -20, title: '孝感动天', passed: true }
  },
  {
    keywords: ['饿', '低血糖', '胃疼', '头晕', '难受'],
    speech: '“平时喊你吃正餐你不吃，半夜作妖！冰箱里还有苹果，别点外卖了！”',
    data: { stamina: +10, money: -15, sanity: 0, momRage: +5, title: '苦肉巧计', passed: true }
  }
];

const DEFAULT_FALLBACK = {
  speech: '“嘟嘟囔囔说些什么鬼话呢？当场人赃俱获，还敢狡辩！”',
  data: { stamina: -15, money: -10, sanity: -15, momRage: +25, title: '苍白狡辩', passed: false }
};

function clamp(val, min, max) {
  return Math.max(min, Math.min(max, val));
}

/**
 * 工业级容错提取器：彻底抛弃脆弱的 JSON.parse
 * 采用字段级正则容错提取，免疫大模型漏冒号、漏引号、键名拼写错误与末尾截断
 */
function parseDebateResult(rawText) {
  let speech = '';
  // 默认兜底数值
  let data = {
    stamina: -10,
    money: 0,
    sanity: -5,
    momRage: 15,
    title: '机智辩护',
    passed: false
  };

  if (!rawText || typeof rawText !== 'string') {
    return { speech: '面对你的荒唐理由，对方冷笑一声，甚至懒得反驳。', data };
  }

  // 1. 拆分台词与数据区（以最外层的 { 或者 <<<DATA>>> 作为分界）
  let cleanSpeechPart = rawText;
  let dataPart = '';

  const dataTagIndex = rawText.search(/<<<?\s*DATA\s*>>>?/i);
  const braceIndex = rawText.indexOf('{');

  if (braceIndex !== -1) {
    cleanSpeechPart = rawText.slice(0, braceIndex);
    dataPart = rawText.slice(braceIndex);
  } else if (dataTagIndex !== -1) {
    cleanSpeechPart = rawText.slice(0, dataTagIndex);
    dataPart = rawText.slice(dataTagIndex);
  }

  // 2. 清洗台词：彻底剥离 <<<SPEECH>>>、<<<DATA>>>、<<<END>>> 等一切协议标签
  speech = cleanSpeechPart
    .replace(/<<<?\s*SPEECH\s*>>>?/gi, '')
    .replace(/<<<?\s*DATA\s*>>>?/gi, '')
    .replace(/<<<?\s*END\s*>>>?/gi, '')
    .replace(/<<<?\s*>>>?/g, '')
    .replace(/^["'“”]/, '')
    .replace(/["'“”]$/, '')
    .trim();

  if (!speech) {
    speech = '对方被你的理由震惊得愣在原地，一时竟无法反驳。';
  }

  // 3. 【核心技术亮点】：正则精准字段捕获（容忍漏冒号、漏引号、数字带符号）
  const extractNum = (patterns) => {
    for (const pat of patterns) {
      const match = dataPart.match(pat);
      if (match && match[1] !== undefined) {
        const n = parseInt(match[1], 10);
        if (!isNaN(n)) return clamp(n, -30, 30);
      }
    }
    return 0;
  };

  // 提取 stamina（兼容 "stamina": -15, "stamina -15 等）
  data.stamina = extractNum([
    /"stamina"[^0-9\-+]*([-+]?\d+)/i,
    /stamina[^0-9\-+]*([-+]?\d+)/i
  ]);

  // 提取 money
  data.money = extractNum([
    /"money"[^0-9\-+]*([-+]?\d+)/i,
    /money[^0-9\-+]*([-+]?\d+)/i
  ]);

  // 提取 sanity（专门兼容大模型漏打冒号的 "sanity 5）
  data.sanity = extractNum([
    /"sanity"[^0-9\-+]*([-+]?\d+)/i,
    /sanity[^0-9\-+]*([-+]?\d+)/i
  ]);

  // 提取 momRage（专门兼容大模型拼写错误 "momage": 0）
  data.momRage = extractNum([
    /"momRage"[^0-9\-+]*([-+]?\d+)/i,
    /"momage"[^0-9\-+]*([-+]?\d+)/i, // 容错拼写
    /momRage[^0-9\-+]*([-+]?\d+)/i,
    /rage[^0-9\-+]*([-+]?\d+)/i
  ]);

  // 提取 title（兼容各种引号，截取前 6 个字）
  const titleMatch = dataPart.match(/"title"\s*[:\s]*["'“”]?([^"'“”,\}\n]+)["'“”]?/i) 
                  || dataPart.match(/title\s*[:\s]*["'“”]?([^"'“”,\}\n]+)["'“”]?/i);
  if (titleMatch && titleMatch[1]) {
    data.title = titleMatch[1].trim().slice(0, 6);
  } else {
    data.title = '脱水特种兵';
  }

  // 提取 passed（检测 true / false）
  if (/passed["'\s:]*true/i.test(dataPart)) {
    data.passed = true;
  } else if (/passed["'\s:]*false/i.test(dataPart)) {
    data.passed = false;
  } else {
    // 若未识别到 passed，则由妈怒指标自适应决定（妈怒 <= 0 为通过）
    data.passed = data.momRage <= 0;
  }

  return { speech, data };
}

class AIEngine {
  constructor() {
    this.env = CLOUD_CONTAINER_CONFIG.env;
    this.serviceName = CLOUD_CONTAINER_CONFIG.service;
    this.path = CLOUD_CONTAINER_CONFIG.path;
  }

  getServiceName() {
    return this.serviceName;
  }

  /**
   * 触发口胡辩解判决
   */
  judgeDebate({ eventTitle, eventDesc, userBargain, currentRole = '老妈', onChunk, onSuccess, onError }) {
    let isSettled = false;
    let fallbackTimer = null;

    const executeFallback = (reason) => {
      if (isSettled) return;
      isSettled = true;
      if (fallbackTimer) clearTimeout(fallbackTimer);

      console.warn(`[AI Engine] 触发降级机制:`, reason);

      const matched = OFFLINE_RULES.find(r => r.keywords.some(k => (userBargain || '').includes(k)));
      const fallbackResult = matched || DEFAULT_FALLBACK;

      if (onSuccess) {
        onSuccess({
          speech: fallbackResult.speech,
          data: fallbackResult.data,
          isFallback: true,
          fallbackReason: reason
        });
      }
    };

    fallbackTimer = setTimeout(() => {
      executeFallback('TIMEOUT_15000MS');
    }, 15000);

    try {
      if (!wx.cloud) {
        executeFallback('WX_CLOUD_NOT_AVAILABLE');
        return;
      }

      console.log(`[AI Engine] 正在向云托管发起请求... Service: ${this.serviceName}, Path: ${this.path}`);

      wx.cloud.callContainer({
        config: {
          env: this.env
        },
        path: this.path,
        header: {
          'X-WX-SERVICE': this.serviceName,
          'Content-Type': 'application/json'
        },
        method: 'POST',
        data: { eventTitle, eventDesc, userBargain, currentRole },
        success: (res) => {
          console.log('[AI Engine] 云托管完整响应返回:', res);

          if (isSettled) return;
          clearTimeout(fallbackTimer);
          isSettled = true;

          // 提取返回的文本
          let rawText = '';
          if (res.data && res.data.rawText) {
            rawText = res.data.rawText;
          } else if (typeof res.data === 'string') {
            rawText = res.data;
          }

          if (!rawText) {
            executeFallback('EMPTY_RAW_TEXT');
            return;
          }

          const result = parseDebateResult(rawText);

          // 模拟端侧打字机动效：让台词逐字蹦出！
          const speech = result.speech || '';
          let charIndex = 0;
          const typingTimer = setInterval(() => {
            charIndex++;
            if (onChunk) {
              onChunk(speech.slice(charIndex - 1, charIndex), speech.slice(0, charIndex));
            }
            if (charIndex >= speech.length) {
              clearInterval(typingTimer);
              if (onSuccess) {
                onSuccess({
                  speech: result.speech,
                  data: result.data,
                  isFallback: false
                });
              }
            }
          }, 35); // 35ms 逐字打印打字机
        },
        fail: (err) => {
          console.error('[AI Engine] callContainer 失败详情:', err);
          executeFallback(`CALL_CONTAINER_FAIL_${JSON.stringify(err)}`);
        }
      });

    } catch (e) {
      console.error('[AI Engine] 初始化异常:', e);
      executeFallback('INIT_EXCEPTION');
    }
  }

  /**
   * 云托管 Ping 延迟探测（修复 Invalid Host）
   */
  ping(callback) {
    const startTime = Date.now();
    try {
      if (!wx.cloud) {
        callback && callback(new Error('wx.cloud 未就绪'));
        return;
      }

      wx.cloud.callContainer({
        config: {
          env: this.env
        },
        path: this.path,
        header: {
          'X-WX-SERVICE': this.serviceName,
          'x-wx-service': this.serviceName,
          'Content-Type': 'application/json'
        },
        method: 'POST',
        data: {
          eventTitle: 'PingProbe',
          eventDesc: 'HealthCheck',
          userBargain: 'PING',
          currentRole: 'System'
        },
        timeout: 5000,
        success: (res) => {
          const latency = Date.now() - startTime;
          callback && callback(null, latency, res);
        },
        fail: (err) => {
          console.error('[AI Engine Ping 失败详情]:', err);
          callback && callback(err);
        }
      });
    } catch (err) {
      callback && callback(err);
    }
  }
}

module.exports = new AIEngine();