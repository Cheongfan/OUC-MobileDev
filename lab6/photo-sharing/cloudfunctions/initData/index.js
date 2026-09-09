// cloudfunctions/initData/index.js
const cloud = require('wx-server-sdk');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

const db = cloud.database();

exports.main = async (event, context) => {
  try {
    const countRes = await db.collection('photos').count();
    // 数据库已有数据时不重复写入
    if (countRes.total > 0 && !event.force) {
      return { success: true, msg: '数据库已有数据，无需初始化', total: countRes.total };
    }

    const seeds = [
      {
        photoUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80',
        caption: '海浪拍打礁石的声音，晚风路过橘子色的海。',
        voiceUrl: 'https://web-ext-storage.dcloud.net.cn/uni-app/uni-test-audio.mp3',
        voiceDuration: 6,
        location: { placeName: '三亚 · 太阳湾度假区', latitude: 18.213, longitude: 109.638 },
        isBlurred: true,
        likeCount: 42,
        likedUsers: [],
        userInfo: {
          nickName: '海风旅人',
          avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&q=80'
        },
        _openid: 'user_haifeng_sanya',
        addDate: '2026-09-07',
        createTime: 1725700000000
      },
      {
        photoUrl: 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800&q=80',
        caption: '乘一叶扁舟渡过碧蓝峡湾，天地只剩呼吸。',
        voiceUrl: '',
        voiceDuration: 0,
        location: { placeName: '恩施 · 屏山峡谷', latitude: 29.897, longitude: 109.782 },
        isBlurred: false,
        likeCount: 28,
        likedUsers: [],
        userInfo: {
          nickName: '海风旅人',
          avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&q=80'
        },
        _openid: 'user_haifeng_sanya',
        addDate: '2026-09-06',
        createTime: 1725613600000
      },
      {
        photoUrl: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800&q=80',
        caption: '雨夜街角的小酒馆，咖啡香气混着民谣吉他。',
        voiceUrl: 'https://web-ext-storage.dcloud.net.cn/uni-app/uni-test-audio.mp3',
        voiceDuration: 8,
        location: { placeName: '上海 · 武康大楼', latitude: 31.205, longitude: 121.442 },
        isBlurred: false,
        likeCount: 18,
        likedUsers: [],
        userInfo: {
          nickName: '胶片小贝',
          avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&q=80'
        },
        _openid: 'user_xiaobei_shanghai',
        addDate: '2026-09-07',
        createTime: 1725690000000
      },
      {
        photoUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&q=80',
        caption: '晨雾中的雪山倒影，像一场不会醒来的梦。',
        voiceUrl: '',
        voiceDuration: 0,
        location: { placeName: '川西 · 四姑娘山景区', latitude: 31.107, longitude: 102.903 },
        isBlurred: true,
        likeCount: 56,
        likedUsers: [],
        userInfo: {
          nickName: '雪原行者',
          avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&q=80'
        },
        _openid: 'user_xueyuan_chuanxi',
        addDate: '2026-09-05',
        createTime: 1725527200000
      }
    ];

    for (const item of seeds) {
      await db.collection('photos').add({ data: item });
    }

    return { success: true, count: seeds.length, msg: '云端种子用户数据初始化成功！' };
  } catch (err) {
    return { success: false, error: err };
  }
};