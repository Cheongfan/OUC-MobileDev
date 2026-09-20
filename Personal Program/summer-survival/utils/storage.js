// utils/storage.js

/**
 * 本地数据存储与归档管理器
 */
const KEYS = {
  SETTINGS: 'SUMMER_SURVIVAL_SETTINGS',
  HISTORY: 'SUMMER_SURVIVAL_HISTORY',
  UNLOCKED_ENDINGS: 'SUMMER_SURVIVAL_ENDINGS',
  MINIGAME_SCORES: 'SUMMER_SURVIVAL_MINI_SCORES',
  DEV_MODE: 'SUMMER_SURVIVAL_DEV',
  AI_QUOTES: 'SUMMER_AI_QUOTES',             // 历史成就/全局辩解语录库
  SESSION_AI_QUOTES: 'SUMMER_SESSION_QUOTES', // 🌟 本局专属辩解语录库
  AI_STATS: 'SUMMER_AI_STATS'
};

const DEFAULT_SETTINGS = {
  haptics: true,
  sfx: true,
  bgm: false,
  vibrationIntensity: 'medium',
  nightModeAuto: true
};

const Storage = {
  getSettings() {
    try {
      const res = wx.getStorageSync(KEYS.SETTINGS);
      return res ? Object.assign({}, DEFAULT_SETTINGS, res) : DEFAULT_SETTINGS;
    } catch (e) {
      return DEFAULT_SETTINGS;
    }
  },

  saveSettings(newSettings) {
    try {
      const current = this.getSettings();
      const merged = Object.assign({}, current, newSettings);
      wx.setStorageSync(KEYS.SETTINGS, merged);
      return true;
    } catch (e) {
      return false;
    }
  },

  getUnlockedEndings() {
    try {
      return wx.getStorageSync(KEYS.UNLOCKED_ENDINGS) || [];
    } catch (e) {
      return [];
    }
  },

  unlockEnding(endingId) {
    try {
      const endings = this.getUnlockedEndings();
      if (!endings.includes(endingId)) {
        endings.push(endingId);
        wx.setStorageSync(KEYS.UNLOCKED_ENDINGS, endings);
        return true;
      }
      return false;
    } catch (e) {
      return false;
    }
  },

  recordSurvivalRun(runData) {
    try {
      const history = wx.getStorageSync(KEYS.HISTORY) || [];
      const newRecord = {
        timestamp: Date.now(),
        daysSurvived: runData.days || 1,
        endingId: runData.endingId || 'UNKNOWN',
        stamina: runData.stamina || 0,
        money: runData.money || 0,
        sanity: runData.sanity || 0,
        rage: runData.rage || 0,
        deathReason: runData.deathReason || '正常完结'
      };
      history.unshift(newRecord);
      wx.setStorageSync(KEYS.HISTORY, history.slice(0, 30));
    } catch (e) {
      console.error('Record run failed:', e);
    }
  },

  getGlobalStats() {
    try {
      const history = wx.getStorageSync(KEYS.HISTORY) || [];
      const totalRuns = history.length;
      let maxDays = 0;
      history.forEach(item => {
        if (item.daysSurvived > maxDays) {
          maxDays = item.daysSurvived;
        }
      });
      return {
        totalRuns,
        maxDays,
        unlockedCount: this.getUnlockedEndings().length
      };
    } catch (e) {
      return { totalRuns: 0, maxDays: 0, unlockedCount: 0 };
    }
  },

  saveMiniGameScore(gameKey, score) {
    try {
      const scores = wx.getStorageSync(KEYS.MINIGAME_SCORES) || {};
      const prev = scores[gameKey] || 0;
      if (score > prev) {
        scores[gameKey] = score;
        wx.setStorageSync(KEYS.MINIGAME_SCORES, scores);
        return true;
      }
      return false;
    } catch (e) {
      return false;
    }
  },

  getMiniGameScores() {
    try {
      return wx.getStorageSync(KEYS.MINIGAME_SCORES) || {};
    } catch (e) {
      return {};
    }
  },

  clearAllData() {
    try {
      wx.removeStorageSync(KEYS.SETTINGS);
      wx.removeStorageSync(KEYS.HISTORY);
      wx.removeStorageSync(KEYS.UNLOCKED_ENDINGS);
      wx.removeStorageSync(KEYS.MINIGAME_SCORES);
      wx.removeStorageSync(KEYS.AI_QUOTES);
      wx.removeStorageSync(KEYS.SESSION_AI_QUOTES);
      wx.removeStorageSync(KEYS.AI_STATS);
      return true;
    } catch (e) {
      return false;
    }
  }
};

// 记录辩解：同时写入“全局成就库”与“本局临时高光库”
Storage.recordAIDebate = function(quoteItem) {
  const itemWithTime = { ...quoteItem, timestamp: Date.now() };

  // 1. 写入全局历史成就库
  const globalList = wx.getStorageSync(KEYS.AI_QUOTES) || [];
  globalList.unshift(itemWithTime);
  wx.setStorageSync(KEYS.AI_QUOTES, globalList.slice(0, 30));

  // 2. 写入本局临时高光库
  const sessionList = wx.getStorageSync(KEYS.SESSION_AI_QUOTES) || [];
  sessionList.unshift(itemWithTime);
  wx.setStorageSync(KEYS.SESSION_AI_QUOTES, sessionList);

  // 记录系统健壮性数据
  const stats = wx.getStorageSync(KEYS.AI_STATS) || { totalRequests: 0, fallbackCount: 0, passedCount: 0 };
  stats.totalRequests += 1;
  if (quoteItem.isFallback) stats.fallbackCount += 1;
  if (quoteItem.passed) stats.passedCount += 1;
  wx.setStorageSync(KEYS.AI_STATS, stats);
};

// 🌟 每局游戏开始时调用：清空上一局的临时高光
Storage.clearSessionAIQuotes = function() {
  wx.removeStorageSync(KEYS.SESSION_AI_QUOTES);
};

// 🌟 获取“本局”之内综合收益最高的一次辩解作为本局高光
Storage.getBestSessionAIQuote = function() {
  const sessionList = wx.getStorageSync(KEYS.SESSION_AI_QUOTES) || [];
  if (!sessionList || sessionList.length === 0) return null;

  let best = sessionList[0];
  let maxScore = -9999;

  sessionList.forEach(q => {
    const d = q.data || {};
    // 收益计算：正面体征累加，妈见打指数（momRage）扣分
    const gain = (d.stamina || 0) + (d.money || 0) + (d.sanity || 0) - (d.momRage || 0);
    if (gain > maxScore) {
      maxScore = gain;
      best = q;
    }
  });

  return best;
};

Storage.getAIDebateStats = function() {
  return wx.getStorageSync(KEYS.AI_STATS) || { totalRequests: 0, fallbackCount: 0, passedCount: 0 };
};

Storage.getAIQuotes = function() {
  return wx.getStorageSync(KEYS.AI_QUOTES) || [];
};

module.exports = Storage;