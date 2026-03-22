/** 系统设置 / 管理员 / 权限 Mock（纯前端） */

export type TreeNode = { id: number; label: string; children?: TreeNode[] };

export type AdminRole = 'root' | 'risk_manager' | 'viewer';

export interface AdminAccount {
  id: string;
  login: string;
  displayName: string;
  role: AdminRole;
  status: 'active' | 'disabled';
  /** 已勾选的权限节点 id（叶子） */
  permissionIds: number[];
  phone?: string;
  lastLogin?: string;
}

/** 与后台菜单模块一一对应的完整权限树 */
export const rolePermissionTree: TreeNode[] = [
  {
    id: 100,
    label: '总览仪表盘',
    children: [
      { id: 101, label: '查看 KPI 与图表' },
      { id: 102, label: '导出报表（PDF / CSV）' },
    ],
  },
  {
    id: 200,
    label: '用户管理',
    children: [
      { id: 201, label: '用户列表与搜索' },
      { id: 202, label: '查看用户详情' },
      { id: 203, label: '编辑用户资料' },
      { id: 204, label: '冻结 / 解冻账户' },
    ],
  },
  {
    id: 300,
    label: '资产管理',
    children: [
      { id: 301, label: '资产总览' },
      { id: 302, label: '大户排行 TOP 查看' },
      { id: 303, label: '资产分布图表' },
      { id: 304, label: '导出资产快照' },
    ],
  },
  {
    id: 400,
    label: 'CC 转账',
    children: [
      { id: 401, label: '转账统计（KPI / 趋势）' },
      { id: 402, label: '转账明细查询' },
      { id: 403, label: '交易详情与哈希复制' },
      { id: 404, label: '导出转账记录' },
    ],
  },
  {
    id: 500,
    label: '预测合约',
    children: [
      { id: 501, label: '查看合约池与 Round' },
      { id: 502, label: '调整池参数（实验）' },
      { id: 503, label: '结算记录只读' },
    ],
  },
  {
    id: 600,
    label: '风控安全',
    children: [
      { id: 601, label: '风险统计与告警列表' },
      { id: 602, label: '处理 / 标记告警' },
      { id: 603, label: '风控规则配置' },
      { id: 604, label: '黑名单维护' },
    ],
  },
  {
    id: 700,
    label: '节点监控',
    children: [
      { id: 701, label: '节点状态与延迟' },
      { id: 702, label: '资源曲线只读' },
      { id: 703, label: '告警订阅' },
    ],
  },
  {
    id: 800,
    label: '系统配置',
    children: [
      { id: 801, label: '基础参数（站点 / Logo / 邮箱）' },
      { id: 802, label: '管理员账号管理' },
      { id: 803, label: '角色与权限分配' },
      { id: 804, label: '操作日志查看' },
      { id: 805, label: '审计日志导出' },
    ],
  },
];

const defaultByRole: Record<AdminRole, number[]> = {
  root: [
    101, 102, 201, 202, 203, 204, 301, 302, 303, 304, 401, 402, 403, 404, 501, 502, 503, 601, 602, 603, 604, 701, 702, 703,
    801, 802, 803, 804, 805,
  ],
  risk_manager: [101, 601, 602, 603, 604, 701, 702, 401, 402, 403],
  viewer: [101, 201, 202, 301, 401, 402, 501, 601, 701],
};

let admins: AdminAccount[] = [
  {
    id: '1',
    login: 'super.admin',
    displayName: 'Super Admin',
    role: 'root',
    status: 'active',
    permissionIds: [...defaultByRole.root],
    phone: '138****8888',
    lastLogin: '2026-03-22 09:12',
  },
  {
    id: '2',
    login: 'risk.ops',
    displayName: 'Risk Admin',
    role: 'risk_manager',
    status: 'active',
    permissionIds: [...defaultByRole.risk_manager],
    phone: '139****6620',
    lastLogin: '2026-03-22 08:40',
  },
  {
    id: '3',
    login: 'ops.viewer',
    displayName: 'Ops Viewer',
    role: 'viewer',
    status: 'disabled',
    permissionIds: [...defaultByRole.viewer],
    phone: '136****1100',
    lastLogin: '2026-03-20 14:03',
  },
];

let idSeq = 3;

export function listAdmins(): AdminAccount[] {
  return [...admins];
}

export function getAdmin(id: string): AdminAccount | undefined {
  return admins.find((a) => a.id === id);
}

export function updateAdminPermissions(id: string, permissionIds: number[]) {
  const a = admins.find((x) => x.id === id);
  if (a) a.permissionIds = [...permissionIds];
}

export function createAdmin(payload: {
  login: string;
  displayName: string;
  password: string;
  role: AdminRole;
  phone?: string;
}) {
  if (payload.role === 'root' && admins.some((a) => a.role === 'root')) {
    throw new Error('仅允许一位超级管理员');
  }
  idSeq += 1;
  const id = String(idSeq);
  admins.push({
    id,
    login: payload.login,
    displayName: payload.displayName,
    role: payload.role,
    status: 'active',
    permissionIds: [...defaultByRole[payload.role]],
    phone: payload.phone,
    lastLogin: '-',
  });
  return getAdmin(id)!;
}

export function updateAdmin(
  id: string,
  payload: Partial<Pick<AdminAccount, 'displayName' | 'role' | 'status' | 'phone'>> & { password?: string },
) {
  const a = admins.find((x) => x.id === id);
  if (!a) return;
  if (payload.displayName != null) a.displayName = payload.displayName;
  if (payload.role != null) {
    a.role = payload.role;
    a.permissionIds = [...defaultByRole[payload.role]];
  }
  if (payload.status != null) a.status = payload.status;
  if (payload.phone != null) a.phone = payload.phone;
}

export function applyRoleTemplate(adminId: string, role: AdminRole) {
  const a = admins.find((x) => x.id === adminId);
  if (!a) return;
  a.role = role;
  a.permissionIds = [...defaultByRole[role]];
}
