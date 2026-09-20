# 选用官方极简轻量的 Node.js 18 镜像
FROM node:18-alpine

# 设置容器工作目录
WORKDIR /app

# 复制依赖定义文件
COPY package*.json ./

# 安装生产依赖（使用国内镜像源加速）
RUN npm install --production --registry=https://registry.npmmirror.com

# 拷贝代码文件
COPY . .

# 暴露端口
EXPOSE 80

# 启动命令
CMD ["node", "proxy-server.js"]