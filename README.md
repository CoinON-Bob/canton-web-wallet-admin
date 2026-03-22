# Canton Chain Wallet Admin

Vue 3 + TypeScript + Element Plus + Vue Router + Pinia + ECharts 的后台管理前端项目。

## 快速开始

```bash
npm install
npm run dev
```

默认地址: http://localhost:5173

## 构建

```bash
npm run build
npm run preview
```

## 部署到 Vercel

**推荐（全自动）**：在 [Vercel Dashboard](https://vercel.com) 把本仓库 **Import** 进项目并关联 GitHub。之后每次 `git push` 到生产分支会自动构建部署，**无需 CLI、无需在聊天里发 Token**。

**CLI（本机一条命令）**：不要把 Token 写进仓库或发给别人。在本机配置一次环境变量即可：

```bash
# ~/.zshrc 等（仅本机）
export VERCEL_TOKEN="你的_token"

cd canton-web-wallet-admin
npm run deploy:prod
```

`npm run deploy:prod` 会执行 `build` + `npx vercel --prod --yes`，CLI 会读取环境变量中的 `VERCEL_TOKEN`。

## 账号登录

- 本项目为纯前端 Mock，无真实接口。
- **管理员登录**：输入任意非空账号/密码即可进入后台；勾选记住密码后使用 `localStorage`，否则 `sessionStorage`。
- **用户注册**：登录页切换到「用户注册」，必须填写后台 **邀请码管理** 中生成的有效邀请码；注册数据写入浏览器 `localStorage`，并在 **用户管理** 列表中展示（含所用邀请码）。用户不能自行生成邀请码。

## 目录结构

- `src/views/` 页面视图
- `src/components/` 公共组件、布局
- `src/router/` 路由与登录守卫
- `src/store/` Pinia 状态
- `src/api/mock/` Mock 数据

## 已实现页面

- `/login` 管理员登录 / 用户注册（邀请码必填）
- `/dashboard` 仪表盘
- `/users` 用户管理
- `/users/:id` 用户详情
- `/invite-codes` 邀请码管理（生成次数、列表、作废）
- `/assets` 资产管理
- `/transfer/stats` 转账统计
- `/transfer/list` 转账明细（含详情弹窗）
- `/contracts` 预测合约
- `/risk` 风控安全
- `/monitor` 系统监控
- `/settings` 系统配置（重定向至 `/settings/general`）
  - `/settings/general` 基础配置
  - `/settings/admins` 管理员列表（流程起点）
  - `/settings/admins/new` 添加管理员 → 自动跳转权限页
  - `/settings/admins/:id/edit` 编辑管理员
  - `/settings/admins/:id/permissions` **选择该管理员后配置并保存权限**
  - `/settings/logs` 操作日志
