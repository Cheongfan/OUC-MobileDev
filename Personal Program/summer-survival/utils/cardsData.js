/**
 * 暑假 60 天真实事件决策题库
 * 属性影响说明：
 * stamina: 精力 (-100 ~ +100)
 * money: 钱包 (-100 ~ +100)
 * sanity: San值 (-100 ~ +100)
 * rage: 妈见打 (-100 ~ +100)
 */
const CARDS_DATA = [
  {
    id: 'CARD_01',
    title: '科目二的召唤',
    character: '咆哮驾校教练 🚗',
    desc: '清晨 6:00，教练在微信群连环夺命 Call：“今天练倒车入库，七点不到的直接排到大中午晒脱皮！”',
    left: {
      text: '继续装死睡大觉',
      impact: { stamina: 15, money: 0, sanity: 10, rage: 25 },
      toast: '老妈抄起了鸡毛掸子'
    },
    right: {
      text: '垂死病中惊坐起',
      impact: { stamina: -25, money: -10, sanity: -15, rage: -10 },
      toast: '在烈日下被教练骂得狗血淋头',
      triggerMiniGame: 'drive' // 关联小游戏触发
    }
  },
  {
    id: 'CARD_02',
    title: '特种兵夜爬泰山',
    character: '户外狂热室友 🧗',
    desc: '室友发来链接：“特惠硬座直达！晚上11点爬泰山看日出，下山直接赶高铁回，纯玩不睡觉！”',
    left: {
      text: '脆皮大学生拒绝送命',
      impact: { stamina: 10, money: 0, sanity: 5, rage: 0 },
      toast: '在空调房安全苟活'
    },
    right: {
      text: '青春没有售价！走！',
      impact: { stamina: -45, money: -30, sanity: 20, rage: 15 },
      toast: '双腿已离家出走，肌肉溶解警告'
    }
  },
  {
    id: 'CARD_03',
    title: '深夜疯狂星期四',
    character: '饥肠辘辘的胃 🍗',
    desc: '凌晨 1:30，群里有人发肯德基拼单：“v我50，今晚夜宵管饱，来不来？”',
    left: {
      text: '喝凉水忍住，要减肥',
      impact: { stamina: -10, money: 0, sanity: -20, rage: 0 },
      toast: '饿得在床上翻来覆去发癫'
    },
    right: {
      text: '狠狠拼单！犒劳自己',
      impact: { stamina: 15, money: -25, sanity: 25, rage: 15 },
      toast: '老妈晨起发现了油腻的骨头垃圾'
    }
  },
  {
    id: 'CARD_04',
    title: '母上大人的嫌弃',
    character: '双手叉腰的老妈 ⚡',
    desc: '“你看看现在几点了？太阳都晒屁股了还不起床！整天就捧着那个手机，饭也不吃！”',
    left: {
      text: '顶嘴反驳：“暑假不睡啥时睡”',
      impact: { stamina: 0, money: 0, sanity: -10, rage: 40 },
      toast: '危险发言！老妈怒气值暴涨！'
    },
    right: {
      text: '火速翻身起床主动拖地',
      impact: { stamina: -15, money: 10, sanity: -5, rage: -30 },
      toast: '成功感化母上，怒气清空并被赏零花钱'
    }
  },
  {
    id: 'CARD_05',
    title: '12306特惠抢票',
    character: '同城死党 🚄',
    desc: '“去海边的直达动车开票了！只剩5秒开抢，再不抢暑假就只能蹲家里看朋友圈了！”',
    left: {
      text: '没钱，家里蹲挺香',
      impact: { stamina: 5, money: 10, sanity: -10, rage: -5 },
      toast: '看着别人发朋友圈看海默默流泪'
    },
    right: {
      text: '手速全开，神之右手！',
      impact: { stamina: -10, money: -35, sanity: 25, rage: 10 },
      toast: '抢到了！但是钱包被瞬间掏空',
      triggerMiniGame: 'rush'
    }
  },
  {
    id: 'CARD_06',
    title: '凌晨三点的被窝',
    character: '熬夜修仙神魂 📱',
    desc: '凌晨 3:15，刷视频正上头。突然，走廊传来了老妈上厕所的拖鞋声，正向你房间靠近！',
    left: {
      text: '把头蒙进被子闭眼装死',
      impact: { stamina: -5, money: 0, sanity: 5, rage: -10 },
      toast: '心跳飙升，成功逃过一劫',
      triggerMiniGame: 'sneak'
    },
    right: {
      text: '屏幕太精彩，多看一秒',
      impact: { stamina: -15, money: 0, sanity: -20, rage: 45 },
      toast: '房门被猛地推开！当场人赃并获！'
    }
  },
  {
    id: 'CARD_07',
    title: '暑期兼职的诱惑',
    character: '奶茶店店长 🧋',
    desc: '“招暑假工兼职，时薪18元，包两杯奶茶，但需要连续站立8小时摇冰沙。”',
    left: {
      text: '溜了溜了，在家摆烂',
      impact: { stamina: 10, money: -5, sanity: 5, rage: 15 },
      toast: '老妈嫌你在家吃白食'
    },
    right: {
      text: '为了暴富，打工魂燃烧！',
      impact: { stamina: -35, money: 40, sanity: -15, rage: -20 },
      toast: '腰酸背痛，但钱包逐渐鼓起'
    }
  },
  {
    id: 'CARD_08',
    title: '小学同学聚会',
    character: '热心班长 🍻',
    desc: '“多年不见，今晚海鲜大排档AA制聚餐，据说当年的校花校草也来哦！”',
    left: {
      text: '社恐发作，找借口推掉',
      impact: { stamina: 10, money: 0, sanity: 10, rage: 0 },
      toast: '安心享受独处宁静'
    },
    right: {
      text: '盛装出席，狠狠社交',
      impact: { stamina: -20, money: -30, sanity: -10, rage: 15 },
      toast: '不仅尴尬AA还花了巨款'
    }
  },
  {
    id: 'CARD_09',
    title: '驾校半坡起步',
    character: '暴躁教练 🚦',
    desc: '“定点停车到了！前面就是陡坡，离合抬不好就要熄火溜车撞后车，踩死刹车！”',
    left: {
      text: '一脚油门到底',
      impact: { stamina: -20, money: -40, sanity: -30, rage: 20 },
      toast: '撞倒了护栏，教练血压拉满'
    },
    right: {
      text: '小心翼翼微抬离合',
      impact: { stamina: -15, money: 0, sanity: 15, rage: -5 },
      toast: '平稳起步，难得听见教练说了句“还行”'
    }
  },
  {
    id: 'CARD_10',
    title: '连夜赶开学大作业',
    character: '专业课课代表 💻',
    desc: '“温馨提醒：还有3天开学，老师布置的万字社会实践调查报告该交了。”',
    left: {
      text: '连夜通宵，键字如飞',
      impact: { stamina: -40, money: 0, sanity: -35, rage: -10 },
      toast: '黑眼圈比熊猫还深，但保住了学分'
    },
    right: {
      text: '最后一天再说，接着奏乐',
      impact: { stamina: 10, money: 0, sanity: 15, rage: 25 },
      toast: '心怀忐忑的享受短暂快感'
    }
  },
  {
    id: 'CARD_11',
    title: '疯狂健身卡推销',
    character: '肌肉型男销售 🏋️',
    desc: '“同学，暑假逆袭最好的时候！办张季卡，开学让所有人惊艳怎么样？”',
    left: {
      text: '“我不办，我天生骨骼惊奇”',
      impact: { stamina: 5, money: 0, sanity: 5, rage: 0 },
      toast: '成功守住钱包'
    },
    right: {
      text: '脑子一热全款拿下',
      impact: { stamina: -20, money: -45, sanity: 10, rage: 20 },
      toast: '去了一天后，卡就再也没拿出来过'
    }
  },
  {
    id: 'CARD_12',
    title: '夏日雷雨断电',
    character: '窗外狂风暴雨 ⛈️',
    desc: '下午4点，突然一声巨雷，空调和 Wi-Fi 同时断开！屋里瞬间像蒸笼一样热。',
    left: {
      text: '躺在凉席上心静自然凉',
      impact: { stamina: -10, money: 0, sanity: -15, rage: 0 },
      toast: '热成红烧大学生'
    },
    right: {
      text: '冲向商场蹭免费冷气',
      impact: { stamina: -15, money: -20, sanity: 20, rage: -5 },
      toast: '吹着冷气顺便买了杯冰柠檬茶'
    }
  }
];

module.exports = CARDS_DATA;