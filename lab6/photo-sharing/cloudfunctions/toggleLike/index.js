// cloudfunctions/toggleLike/index.js
const cloud = require('wx-server-sdk');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

const db = cloud.database();
const _ = db.command;

exports.main = async (event, context) => {
  const { photoId } = event;
  const wxContext = cloud.getWXContext();
  const openid = wxContext.OPENID;

  if (!photoId) {
    return { success: false, msg: '缺少 photoId' };
  }

  try {
    // 1. 获取当前图片的点赞人集合
    const photoRecord = await db.collection('photos').doc(photoId).get();
    const likedUsers = photoRecord.data.likedUsers || [];
    const isCurrentlyLiked = likedUsers.includes(openid);

    if (isCurrentlyLiked) {
      // 2. 已点赞 -> 取消点赞（原子操作：移出 openid，likeCount 减 1）
      await db.collection('photos').doc(photoId).update({
        data: {
          likedUsers: _.pull(openid),
          likeCount: _.inc(-1)
        }
      });
      return {
        success: true,
        action: 'unliked',
        isLiked: false,
        likeCount: Math.max(0, (photoRecord.data.likeCount || 1) - 1)
      };
    } else {
      // 3. 未点赞 -> 点赞（原子操作：压入 openid，likeCount 加 1）
      await db.collection('photos').doc(photoId).update({
        data: {
          likedUsers: _.addToSet(openid),
          likeCount: _.inc(1)
        }
      });
      return {
        success: true,
        action: 'liked',
        isLiked: true,
        likeCount: (photoRecord.data.likeCount || 0) + 1
      };
    }
  } catch (err) {
    console.error('点赞事务执行异常:', err);
    return {
      success: false,
      msg: '操作失败，请稍后重试'
    };
  }
};