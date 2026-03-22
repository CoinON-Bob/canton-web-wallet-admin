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

## 账号登录

- 本项目为纯前端 Mock，无真实接口。
- 登录页输入任意非空账号/密码即可进入。
- 勾选记住密码后使用 `localStorage` 保持登录，否则使用 `sessionStorage`。

## 目录结构

- `src/views/` 页面视图
- `src/components/` 公共组件、布局
- `src/router/` 路由与登录守卫
- `src/store/` Pinia 状态
- `src/api/mock/` Mock 数据

## 已实现页面

- `/login` 登录
- `/dashboard` 仪表盘
- `/users` 用户管理
- `/users/:id` 用户详情
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
