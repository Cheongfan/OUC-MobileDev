// utils/util.js

/**
 * 格式化相对时间（让社区具有生命力）
 */
function formatRelativeTime(timestamp) {
  if (!timestamp) return '';
  const now = Date.now();
  const diff = (now - timestamp) / 1000; // 秒数差

  if (diff < 60) return '刚刚';
  if (diff < 3600) return `${Math.floor(diff / 60)} 分钟前`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} 小时前`;
  if (diff < 259200) return `${Math.floor(diff / 86400)} 天前`;

  const d = new Date(timestamp);
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  const date = d.getDate().toString().padStart(2, '0');
  return `${month}-${date}`;
}

/**
 * 格式化年月日
 */
function formatDate(date = new Date()) {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * 生成安全的随机云存储文件名，带原始后缀
 */
function genCloudPath(folder, originalPath) {
  const extMatch = originalPath.match(/\.[^.]+?$/);
  const ext = extMatch ? extMatch[0] : '.jpg';
  const randomStr = Date.now() + '_' + Math.random().toString(36).substring(2, 8);
  return `${folder}/${randomStr}${ext}`;
}

module.exports = {
  formatRelativeTime,
  formatDate,
  genCloudPath
};