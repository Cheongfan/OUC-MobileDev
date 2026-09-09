// cloudfunctions/secCheck/index.js
const cloud = require('wx-server-sdk');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

exports.main = async (event, context) => {
  const { type, content, fileID } = event;

  try {
    // 1. 文本合规性检测（防敏感词、辱骂、违规引流）
    if (type === 'text') {
      if (!content || content.trim().length === 0) {
        return { pass: true };
      }
      const textRes = await cloud.openapi.security.msgSecCheck({
        content: content
      });
      if (textRes.errCode !== 0) {
        return { pass: false, reason: '文案包含敏感违规内容，请修改' };
      }
      return { pass: true };
    }

    // 2. 图像合规性检测（防涉黄、涉暴、涉政）
    if (type === 'image') {
      if (!fileID) {
        return { pass: false, reason: '缺少图片资源标识' };
      }
      // 从云存储中将图片读取为 Buffer
      const downloadRes = await cloud.downloadFile({
        fileID: fileID
      });
      const imgBuffer = downloadRes.fileContent;

      const imgRes = await cloud.openapi.security.imgSecCheck({
        media: {
          contentType: 'image/jpeg',
          value: imgBuffer
        }
      });

      if (imgRes.errCode !== 0) {
        return { pass: false, reason: '图片包含违规内容，已被系统拦截' };
      }
      return { pass: true };
    }

    return { pass: false, reason: '未知检测类型' };
  } catch (err) {
    console.error('安全检测触发拦截:', err);
    // 微信官方违规错误码 87014 代表内容违规
    if (err.errCode === 87014) {
      return { 
        pass: false, 
        reason: type === 'text' ? '文本包含敏感信息' : '图片存在违规内容，无法发布' 
      };
    }
    // 其它网络超时或云端异常，给予降级兜底提示
    return { pass: false, reason: '内容安全检测未通过，请检查后重试' };
  }
};