# Admin 接口与前端覆盖说明

依据 Apipost 导出文档（`https://api.celing.cc`）。认证：除 `/admin/public`、`/admin/login` 外，请求携带 `Authorization: Bearer <token>`；登录成功后 token 从 `data.token` 或 `data.access_token` 等字段解析（文档未写明时需与后端确认）。

## 环境

| 变量 | 说明 |
|------|------|
| `VITE_API_BASE_URL` | 默认 `/api`：开发时由 Vite 代理到 `https://api.celing.cc` |
| `VITE_USE_MOCK_ADMIN_AUTH` | `true` 时不请求登录接口，写入本地 mock token |
| `VITE_USE_ADMIN_MOCK_DATA` | `true` 时转账明细、管理员列表仍用内置 Mock 表 |
| `VITE_USE_END_USER_MOCK` | `true` 时用户管理/详情仍用本地 userDirectory Mock |

## 接口清单与 UI 状态

| 接口 | 前端能力 |
|------|----------|
| GET `/admin/public` | API 调试、可手动调用 |
| POST `/admin/login` | 登录页 |
| POST `/admin/logout` | 退出登录 |
| GET `/admin/account/profile` | 系统配置 → 账户接口 |
| GET `/admin/account/menus` | 同上 |
| GET `/admin/account/permissions` | 同上 |
| GET `/admin/admin-user/list` | 系统配置 → 管理员（非 Mock 模式） |
| GET `/admin/admin-user/detail` | 仅 API 调试 |
| POST `/admin/admin-user/save` | 仅 API 调试（表单页仍为 Mock） |
| POST `/admin/admin-user/status` | 管理员列表「启用/停用」（非 Mock） |
| POST `/admin/admin-user/delete` | 仅 API 调试 |
| GET `/admin/role/list` | 系统配置 → 角色与资源 |
| GET `/admin/role/options` | 仅 API 调试 |
| GET `/admin/role/resource-ids` | 仅 API 调试 |
| POST `/admin/role/save` 等写入 | 仅 API 调试 |
| GET `/admin/resource/list`、`/tree` | 系统配置 → 角色与资源 |
| POST `/admin/resource/*` | 仅 API 调试 |
| GET `/admin/transaction/list` | 转账明细（默认对接，动态列） |
| GET `/admin/transaction/stats/overview` | 转账统计页底部 JSON |
| GET `/admin/transaction/stats/trend` | 同上 |
| GET `/admin/transaction/stats/top-users` | 同上 |
| POST `/admin/transaction/sync` | 转账统计页「POST 同步」 |

**stats/* 与图表：**`src/api/txStatsChart.ts` 负责把 `overview` / `trend` / `top-users` 的 `data` 解析为 KPI、折线、饼图（支持 `data` 再包一层、`summary`、并行 `dates`+`counts`、`top_users` 数组等）。统计页「接口数据」卡片上会显示各块是否已绑定；若仍为 Mock，请对照同页 JSON 扩展该文件的字段映射。

### Admin End User（前台用户，文档截图「Admin End User (4)」）

| 接口 | 前端 |
|------|------|
| GET `/admin/user/list` | 用户管理列表（默认对接）；`keyword`、`status`(1/0) |
| GET `/admin/user/detail` | 用户详情页 `接口字段` |
| POST `/admin/user/status` | 详情页启用/禁用 |
| POST `/admin/user/password` | 详情页重置密码 |

转账明细支持 URL 查询参数 `?user_id=`，对应文档中的 `user_id` 筛选。

## 仍为 Mock / 未对接后端的模块

- 总览仪表盘、邀请码、资产、合约、风控、节点监控、基础配置、操作日志等页面：无文档中对应 `/admin/*` 时仍为原 Mock 或占位。
- 用户管理：设置 `VITE_USE_END_USER_MOCK=true` 时回到本地 Mock；否则走 `/admin/user/*`。
- 管理员「添加/编辑表单」「权限配置」树：仍为本地 Mock；与真实 `resource` / `role` 绑定需后续对接。
- 转账统计页顶部 KPI 与 ECharts：仍为 Mock；仅底部展示接口原始 JSON。

## 预置「API 调试」

系统配置 → **API 调试**：可选文档中全部接口，编辑 Query / Body 后发送，查看完整 JSON 响应。
