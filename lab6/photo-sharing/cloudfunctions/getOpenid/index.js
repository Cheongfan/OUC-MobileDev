// cloudfunctions/getOpenid/index.js
const cloud = require('wx-server-sdk');

// 初始化云环境（DYNAMIC_CURRENT_ENV 自动指向当前环境，移植性更强）
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();

  return {
    code: 0,
    msg: 'success',
    openid: wxContext.OPENID,
    appid: wxContext.APPID,
    unionid: wxContext.UNIONID || null
  };
};