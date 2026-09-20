/**
 * 暑假重开结局图鉴数据
 */
const ENDINGS_DATA = {
  // 属性耗尽/暴表结局
  END_STAMINA_ZERO: {
    id: 'END_STAMINA_ZERO',
    title: '【特种兵特等伤员】',
    tag: '精力耗尽',
    desc: '你的精力彻底归零！在日行三万步的夜爬山道上直挺挺倒下，被热心消防员用担架抬下山，光荣登上同城热搜。',
    icon: '🚑',
    level: 'B'
  },
  END_MONEY_ZERO: {
    id: 'END_MONEY_ZERO',
    title: '【疯狂星期四难民】',
    tag: '钱包破产',
    desc: '钱包清零！在连续几轮外卖与冲动消费后，你的微信余额甚至凑不出一张回校的地铁票，只能在奶茶店连夜刷杯子抵债。',
    icon: '💸',
    level: 'C'
  },
  END_SANITY_ZERO: {
    id: 'END_SANITY_ZERO',
    title: '【发疯文学学术泰斗】',
    tag: '精神崩塌',
    desc: '精神状态彻底清零！由于长期的作息颠倒与情绪暴跌，你已经能在社交媒体熟练用火星文与外星人交流，被全家人视为医学奇迹。',
    icon: '🤪',
    level: 'D'
  },
  END_MOM_RAGE: {
    id: 'END_MOM_RAGE',
    title: '【逐出家门流动人口】',
    tag: '母上震怒',
    desc: '老妈的怒气值突破天际！伴随着一声怒喝，你的行李箱已经被整齐码放在门外，不得不拖着拖鞋在小区凉亭度过余生。',
    icon: '🧹',
    level: 'F'
  },
  // 特殊判定结局
  END_DRIVE_FAIL: {
    id: 'END_DRIVE_FAIL',
    title: '【科目二焊死在车底】',
    tag: '车神折戟',
    desc: '你在倒车入库时再次精准压线，教练一怒之下给驾校校长打电话：“这孩子命硬，建议先回去练自行车。”',
    icon: '🚗',
    level: 'C'
  },
  // 完美通关结局（活过 60 天）
  END_SUMMER_VICTORY: {
    id: 'END_SUMMER_VICTORY',
    title: '【天选之子·暑假生存大师】',
    tag: '奇迹生还',
    desc: '你以惊人的意志力、极限拉扯的走位与高超的察言观色能力，成功在 60 天酷暑、老妈怒火与各种意外中苟活到开学！你就是这片校园最硬的脆皮大学生！',
    icon: '👑',
    level: 'SSS'
  }
};

module.exports = ENDINGS_DATA;