// 海大新闻模拟数据源
const news = [
  {
    id: '264692',
    category: '海大要闻',
    title: '山东省人民政府副省长、党组成员闫剑波来校调研',
    poster: 'https://news.ouc.edu.cn/_upload/article/images/30/6b/13f1209e40608a955d175ac5dd02/f24f725e-9573-4bc8-a65b-bb7717917c1d.jpg',
    content: '本站讯 8月27日，山东省人民政府副省长、党组成员闫剑波来校调研。学校党委书记李明陪同调研。',
    add_date: '2026-08-28'
  },
  {
    id: '264693',
    category: '海大要闻',
    title: '中国船舶集团有限公司董事长、党组书记徐鹏来校调研',
    poster: 'https://news.ouc.edu.cn/_upload/article/images/e0/1a/0f1277ee4eb8afe3cc2f9fb37777/dba374ab-3182-4713-bb7b-bf2621b9db4f.jpg',
    content: '本站讯 8月27日，中国船舶集团有限公司董事长、党组书记徐鹏来校调研。学校党委书记李明陪同调研并座谈。',
    add_date: '2026-08-28'
  },
  {
    id: '264793',
    category: '学术竞赛',
    title: '中国海洋大学在俯冲带火山活动的深部驱动机制研究方面取得新进展',
    poster: 'https://news.ouc.edu.cn/_upload/article/images/74/d6/b14f185544daadfce33d3cee6d26/62d99082-7905-433d-ac56-852d8d4e3e31.jpg',
    content: '本站讯 近日，中国海洋大学海洋地球科学学院在国际权威学术期刊Nature Communications（《自然-通讯》）在线发表了题为“Slab thermal transitions in the Aeolian arc driven by sub-slab mantle upwelling in the early Pleistocene”（早更新世板下地幔上涌驱动的伊奥利亚俯冲板块热状态转变）的研究论文。该研究首次揭示了地中海伊奥利亚岛弧火山活动记录的一次俯冲板块热状态快速转变，建立了板块撕裂诱发的热地幔上涌与弧岩浆成分演化之间的关联。',
    add_date: '2026-08-28'
  },
  {
    id: '264797',
    category: '学术竞赛',
    title: '中国海洋大学在海洋生态修复综合成效评估领域取得新进展',
    poster: 'https://news.ouc.edu.cn/_upload/article/images/7b/00/0be69d454261a65d0507c1ff72ee/486fb8f0-c341-4607-bbaf-29862ac171a5.jpg',
    content: '本站讯 8月18日至20日，2026年第二届“中控杯”智能制造挑战赛全国总决赛在杭州白马湖国际会展中心举行。本届大赛共吸引来自浙江大学、华中科技大学、大连理工大学、中国海洋大学等全国103所高校的近400支队伍报名参赛。在化学化工学院副教授周鑫、副教授林子昕老师的指导下，2025级硕士研究生唐敬、2024级本科生郝杰、2025级本科生唐启成和刘紫钰组成中国海洋大学“溯川求理”团队，凭借“丙烯两步氧化制丙烯酸全流程智能优化设计”项目以总分第二的成绩荣获全国总决赛一等奖。',
    add_date: '2026-08-26'
  },
  {
    id: '264696',
    category: '学术竞赛',
    title: '化学化工学院学子获第二届“中控杯”智能制造挑战赛全国总决赛获佳绩',
    poster: 'https://news.ouc.edu.cn/_upload/article/images/16/68/295a5b2044e09f2cb04ed509fb53/6c8a3409-10e9-4b7b-9e7c-1d1081295d0a.jpg',
    content: '本站讯 8月18日至20日，2026年第二届“中控杯”智能制造挑战赛全国总决赛在杭州白马湖国际会展中心举行。本届大赛共吸引来自浙江大学、华中科技大学、大连理工大学、中国海洋大学等全国103所高校的近400支队伍报名参赛。在化学化工学院副教授周鑫、副教授林子昕老师的指导下，2025级硕士研究生唐敬、2024级本科生郝杰、2025级本科生唐启成和刘紫钰组成中国海洋大学“溯川求理”团队，凭借“丙烯两步氧化制丙烯酸全流程智能优化设计”项目以总分第二的成绩荣获全国总决赛一等奖。',
    add_date: '2026-08-25'
  },
  {
    id: '264694',
    category: '迎新工作',
    title: '中国海洋大学2026级研究生开学典礼举行',
    poster: 'https://news.ouc.edu.cn/_upload/article/images/dc/f8/06c1b91d4f12876219c149ce1f4f/b2b9662a-1b49-4650-ba3d-093ab20ad9bd.jpg',
    content: '本站讯 海纳新知，逐梦启航。8月24日，中国海洋大学2026级研究生开学典礼在崂山校区综合体育馆举行。党委书记李明，党委副书记、校长张峻峰，党委副书记范其伟，党委常委、副校长林旭升，党委副书记、纪委书记俞黎阳，党委副书记蒋秋飚，党委常委、副校长李岩出席。党委常委、副校长王雪鹏主持。1134名博士研究生、5092名硕士研究生胸怀蓝色梦想，跨越五湖四海，齐聚海大园，开启新征程。',
    add_date: '2026-08-24'
  },
  {
    id: '264695',
    category: '迎新工作',
    title: '乘风向海，展新篇章——中国海洋大学2026级研究生入学报到',
    poster: 'https://news.ouc.edu.cn/_upload/article/images/04/fc/40152f984da09ba706215eadcc92/2bf4a754-69f3-4899-9746-6a31f16304fa.jpg',
    content: '本站讯 8月23日，中国海洋大学校园里处处洋溢着崭新的朝气，2026级研究生新生迎新工作如期开展。怀揣求知热忱与学术理想的莘莘学子从祖国各地汇聚于此，即将在海大园开启属于自己的逐梦之旅。学校党委书记李明，校长张峻峰，副校长林旭升、王雪鹏与相关单位负责人分别来到迎新现场，欢迎来校报到的研究生新生，慰问参与迎新工作的师生员工。',
    add_date: '2026-08-24'
  },
  {
    id: '264797',
    category: '学术竞赛',
    title: '中国海洋大学在赤道印度洋生物生产力与深海环流耦合机制研究领域取得新进展',
    poster: 'https://news.ouc.edu.cn/_upload/article/images/82/02/0a67e43e47b399bf9e3285aacd3e/65853662-38ad-4778-89a9-1515348a3a0a.jpg',
    content: '本站讯 近日，中国海洋大学海底科学与探测技术教育部重点实验室姜兆霞教授团队在Nature（《自然》）旗下期刊Communications Earth & Environment（《通讯·地球与环境》）在线发表了题为“Equatorial Indian Ocean productivity over the last 200,000 years and links to deep circulation variations”（过去20万年赤道印度洋生物生产力演化及其与深海环流的关系）的研究成果。',
    add_date: '2026-08-24'
  },
  {
    id: '264697',
    category: '海大要闻',
    title: '学校领导班子2026年暑期工作会召开',
    poster: 'https://news.ouc.edu.cn/_upload/article/images/6e/8c/20d25c3344e2ae02d6fb30fbfdc6/48820d45-f3fc-463f-adfe-830785abf5b4.jpg',
    content: '本站讯 8月22日，学校领导班子召开2026年暑期工作会，研究部署下半年学校重点工作，凝心聚力推动“十五五”实现良好开局。党委书记李明、校长张峻峰主持会议并讲话。学校领导班子成员、党委常委、校长助理出席会议。',
    add_date: '2026-08-24'
  },
  {
    id: '264698',
    category: '海大要闻',
    title: '华鲁集团参访团访问中国海洋大学',
    poster: 'https://news.ouc.edu.cn/_upload/article/images/10/78/b4baab744d4ea6d44c2704434d98/1c3b4915-fcfb-43d0-95f3-f5ea973258eb.jpg',
    content: '本站讯 8月20日，华鲁控股集团有限公司党委委员、副总经理，（香港）华鲁集团有限公司总经理程学展一行到访学校。学校党委书记李明在崂山校区会见来访客人。',
    add_date: '2026-08-22'
  }
];

// 获取新闻列表
function getNewList() {
  return news;
}

// 获取新闻详情
function getNewsDetail(newsID) {
  let message = {
    code: '404',
    news: {}
  };
  for (let i = 0; i < news.length; i++) {
    if (newsID == news[i].id) {
      message.code = '200';
      message.news = news[i];
      break;
    }
  }
  return message;
}

// 导出接口
module.exports = {
  getNewList: getNewList,
  getNewsDetail: getNewsDetail
}