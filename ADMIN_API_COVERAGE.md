# Admin 接口与前端覆盖说明

依据 Apipost 导出文档（`https://api.celing.cc`）。认证：除 `/admin/public`、`/admin/login` 外，请求携带 `Authorization: Bearer <token>`；登录成功后 token 从 `data.token` 或 `data.access_token` 等字段解析（文档未写明时需与后端确认）。

**HTTP 封装：**`src/api/admin.ts` 已覆盖 `src/api/adminDebugCatalog.ts` 中列出的全部 `/admin/*` 路径（与文档一致）。缺口主要在**页面是否调用**与**是否仍为演示数据**。

## 环境

| 变量 | 说明 |
|------|------|
| `VITE_API_BASE_URL` | 默认 `/api`：开发时由 Vite 代理到 `https://api.celing.cc`；生产需在 `vercel.json` 将 `/api` 反代到后端，或改为完整 API 域名并配置 CORS |
| `VITE_USE_MOCK_ADMIN_AUTH` | `true` 时不请求登录接口，写入本地 mock token |
| `VITE_USE_ADMIN_MOCK_DATA` | `true` 时管理员账号/表单/权限树仍用内置 Mock；`false` 时列表、新增/编辑走真实接口 |
| `VITE_USE_END_USER_MOCK` | `true` 时用户管理/详情仍用本地 userDirectory Mock |

## 接口清单与 UI 状态

| 接口 | `admin.ts` | 主要 UI |
|------|------------|---------|
| GET `/admin/public` | 有 | API 调试 |
| POST `/admin/login` | 有 | 登录页 |
| POST `/admin/logout` | 有 | 退出（随登录态） |
| GET `/admin/account/profile` | 有 | 系统配置 → 当前账户 |
| GET `/admin/account/menus` | 有 | 同上 |
| GET `/admin/account/permissions` | 有 | 同上 |
| GET `/admin/admin-user/list` | 有 | 管理员列表（非 Mock） |
| GET `/admin/admin-user/detail` | 有 | 管理员新增/编辑页（非 Mock，编辑时拉取） |
| POST `/admin/admin-user/save` | 有 | 管理员新增/编辑页（非 Mock） |
| POST `/admin/admin-user/status` | 有 | 管理员列表启用/停用 |
| POST `/admin/admin-user/delete` | 有 | 仅 API 调试（未做列表内删除按钮） |
| GET `/admin/role/list` | 有 | 角色与资源（JSON）、管理员表单内角色多选（options 为空时回退 list） |
| GET `/admin/role/options` | 有 | 管理员表单角色下拉 |
| GET `/admin/role/resource-ids` | 有 | 仅 API 调试 |
| POST `/admin/role/save` 等 | 有 | 仅 API 调试 |
| GET `/admin/resource/list`、`/tree` | 有 | 角色与资源（JSON） |
| POST `/admin/resource/*` | 有 | 仅 API 调试 |
| GET `/admin/transaction/list` | 有 | 转账明细（动态列） |
| GET `/admin/transaction/stats/overview` | 有 | 转账统计：KPI 解析 + 底部 JSON |
| GET `/admin/transaction/stats/trend` | 有 | 转账统计：折线图（解析成功时）+ 底部 JSON |
| GET `/admin/transaction/stats/top-users` | 有 | 转账统计：饼图（解析成功时）+ 底部 JSON |
| POST `/admin/transaction/sync` | 有 | 转账统计「同步」 |

**stats/* 与图表：**`src/api/txStatsChart.ts` 负责把 `overview` / `trend` / `top-users` 的 `data` 解析为 KPI、折线、饼图（支持嵌套 `data`、`summary`、`dates`+`counts`、`top_users` 等）。若某块仍为占位曲线，请对照统计页 JSON 扩展映射。

### Admin End User（前台用户）

| 接口 | `admin.ts` | 前端 |
|------|------------|------|
| GET `/admin/user/list` | 有 | 用户管理列表；`keyword`、`status`(1/0) |
| GET `/admin/user/detail` | 有 | 用户详情「接口字段」 |
| POST `/admin/user/status` | 有 | 详情启用/禁用 |
| POST `/admin/user/password` | 有 | 详情重置密码 |

转账明细支持 URL `?user_id=`，对应文档 `user_id` 筛选。

## 仍为 Mock / 文档无对应 `/admin/*` 的模块

| 模块 | 说明 |
|------|------|
| 总览仪表盘 | 无独立 stats 接口对接；图表与 KPI 为演示数据，可跳转转账统计看真实接口 |
| 邀请码 | `src/api/inviteCodes.ts` 本地逻辑，无文档接口 |
| 资产管理 | 依赖 userDirectory Mock |
| 预测合约 / 风控 / 节点监控 | `src/api/mock/*` |
| 系统配置 → 基础配置（转账燃料等） | Mock |
| 操作日志 | Mock 占位 |
| 管理员「配置权限」树 | **仍为 Mock**；线上角色与菜单/资源绑定请用 **role_ids**（管理员表单）+「角色与资源」只读 JSON + **API 调试** 调用 `resource-ids` / `role/save` 等 |

## 预置「API 调试」

系统配置 → **API 调试**：可选文档中全部接口，编辑 Query / Body 后发送，查看完整 JSON 响应。
