# Canton Admin 重构指令（详细版）

## 一、设计系统规范

### 颜色体系
```css
--bg-base: #0A0E1A;        /* 页面背景 */
--bg-card: #0F1629;        /* 卡片背景 */
--bg-card2: #111826;       /* 次要卡片 */
--border: #1E2D4A;         /* 边框 */
--gold: #C9A227;           /* 主金色（沉稳） */
--gold-dim: rgba(201,162,39,0.15);  /* 金色淡化背景 */
--teal: #00D4B1;           /* 成功/在线 */
--red: #FF4D6D;            /* 危险/错误 */
--text: #E8EDF5;           /* 主文字 */
--text-dim: #7A8BA8;       /* 次要文字 */
```

### 字体系统
```html
<!-- index.html head 中添加 -->
<link href="https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=Space+Mono:wght@400;700&family=Syne:wght@400;600;700;800&display=swap" rel="stylesheet">
```

使用规则：
- 标题/Logo：'DM Serif Display', serif
- 正文/UI：'Syne', sans-serif  
- 数字/地址：'Space Mono', monospace

### 全局噪点纹理
```css
body::before {
  content: '';
  position: fixed;
  inset: 0;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.03'/%3E%3C/svg%3E");
  pointer-events: none;
  z-index: 9999;
  opacity: 0.4;
}
```

---

## 二、侧边栏重构 (SideNav.vue)

### 结构
```
Canton Chain    ← DM Serif Display
ADMIN CONSOLE   ← Space Mono, 9px, 金色, letter-spacing: 0.25em

Dashboard       ← 分组标签，9px, 大写, #7A8BA8
- 总览          ← 激活时左边框 2px 金色 + 金色背景15%

用户与资产      ← 分组标签
- 用户管理
- 资产管理

交易            ← 分组标签
- CC 转账
- 预测合约

运营 & 系统     ← 分组标签
- 风控安全      ← 带红色徽章 "3"
- 节点监控
- 系统配置

[底部管理员卡片]
头像(SU) + Super Admin + canton.admin.root
```

### Logo 样式
- 六边形金色背景，36px，内文字 "CC"
- 右侧文字两行：Canton Chain + ADMIN CONSOLE

### 导航项样式
- 高度：44px
- 默认：#7A8BA8，左边框透明
- Hover：#E8EDF5，左边框 rgba(201,162,39,0.4)
- 激活：#C9A227，左边框 2px 金色，背景 rgba(201,162,39,0.15)

---

## 三、Topbar 重构 (AdminLayout.vue)

### 背景
```css
background: rgba(10,14,26,0.8);
backdrop-filter: blur(20px);
border-bottom: 1px solid #1E2D4A;
height: 60px;
```

### 内容
- 左侧：标题 "总览仪表盘"（DM Serif Display, 18px）
- 中间：链状态
  ```
  [绿色脉冲点] Canton Mainnet · Block #8,412,037
  ```
  脉冲点动画：
  ```css
  @keyframes pulse {
    0%, 100% { opacity: 1; box-shadow: 0 0 0 0 rgba(0,212,177,0.4); }
    50% { opacity: 0.7; box-shadow: 0 0 0 4px rgba(0,212,177,0); }
  }
  ```
- 右侧：三个按钮（刷新、通知带红点、帮助），34px 圆形，#0F1629 背景

---

## 四、KPI 卡片重构 (StatCard.vue)

### 结构
```
┌───────────────────────────────┐
│ ▔▔▔▔▔▔ 金色渐变条 2px        │  ← ::before 伪元素
│                               │
│ 平台总 CC 持有量          +2.4% │  ← 标签大写 10px，趋势右上角
│                               │
│ 482,310,000                   │  ← Space Mono, 32px, #C9A227
│ ≈ $12,057,750 USDT            │  ← 副标签 10px, #7A8BA8
│                               │
│          [装饰图标 28px]      │  ← 右下角，opacity 0.06
└───────────────────────────────┘
```

### 渐变条
```css
.stat-card::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 2px;
  background: linear-gradient(90deg, var(--gold), transparent);
}
```

### 类型颜色
- 主卡片（hero）：金色渐变条
- 用户：teal 渐变条
- 风险：red 渐变条
- 普通：无边框条或灰色

---

## 五、表格重构

### 表头
- 字体：Space Mono, 9px
- 大写 + letter-spacing: 0.15em
- 颜色：#7A8BA8
- 背景：rgba(255,255,255,0.01)
- 底部边框：#1E2D4A

### 表格行
- 高度：48px
- 文字：13px, #E8EDF5
- Hover：背景 rgba(255,255,255,0.02)
- 底部边框：rgba(30,45,74,0.5)

### 地址显示格式
```
0x4f2e...a9c1  ← 前6位...后4位，Space Mono
```

### 状态徽章（带图标）
```
[✓] 已确认   ← 绿色，背景 rgba(0,212,177,0.12)，边框 rgba(0,212,177,0.2)
[⏱] 待确认   ← 金色，背景 rgba(201,162,39,0.12)
[✕] 失败     ← 红色，背景 rgba(255,77,109,0.12)
```

徽章样式：
```css
.badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 8px;
  border-radius: 3px;
  font-size: 10px;
  font-family: 'Space Mono', monospace;
  font-weight: 700;
  letter-spacing: 0.05em;
  border: 1px solid;
}
```

### 金额显示
```
250,000  ← Space Mono, #C9A227, font-weight: 700
```

---

## 六、合约池进度条

### 样式
一个进度条里两种颜色：
```
[████████████░░░░░░░░]  ← 左边 teal（看涨），右边 red（看跌）
 62%          38%
```

```css
.pool-bar {
  height: 8px;
  background: #1E2D4A;
  border-radius: 4px;
  overflow: hidden;
  display: flex;
}
.pool-bull { background: #00D4B1; }  /* 看涨 */
.pool-bear { background: #FF4D6D; }  /* 看跌 */
```

### 信息行
- 上方：Round #2041 + 倒计时 00:14:22（金色 badge）
- 下方：看涨 62% · 4.8M CC / 看跌 38% · 2.9M CC

---

## 七、风控告警卡片

### 严重（critical）
- 左边框：3px #FF4D6D
- 背景：rgba(255,77,109,0.07)
- 图标：辐射符号，红色

### 警告（warning）
- 左边框：3px #FFAB00
- 背景：rgba(255,171,0,0.07)
- 图标：三角感叹号，橙色

### 信息（info）
- 左边框：3px #00D4B1
- 背景：rgba(0,212,177,0.07)
- 图标：信息图标，teal

结构：
```
[图标] 标题                    [时间]
      描述文字（Space Mono）
                              [处理按钮]
```

---

## 八、节点监控卡片

### 结构
顶部 2px 状态线 + 内容

```
━━━━━━  ← node-status-line，在线 teal，警告 orange

[服务器图标] Node-Primary-01
状态       在线
延迟       12ms
CPU        38%
出块数     41,280
[进度条]
```

```css
.node-status-line {
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 2px;
}
.node-status-line.ok { background: #00D4B1; }
.node-status-line.warn { background: #FFAB00; }
```

---

## 九、按钮规范

### 主按钮（Primary）
```css
background: #C9A227;
color: #000;
border: none;
border-radius: 6px;
font-size: 12px;
font-weight: 700;
padding: 9px 16px;
```

### 次要按钮（Outline）
```css
background: transparent;
color: #7A8BA8;
border: 1px solid #1E2D4A;
border-radius: 6px;
font-size: 12px;
padding: 9px 14px;
```
Hover：color: #E8EDF5, border-color: #C9A227

---

## 十、检查清单

全局：
- [ ] 所有数字用 Space Mono
- [ ] 所有标签大写 + letter-spacing: 0.1-0.2em
- [ ] 卡片 hover 边框变金色
- [ ] 表格行 hover 背景 rgba(255,255,255,0.02)
- [ ] 滚动条 6px，#1E2D4A 颜色
- [ ] 圆角统一 6px（按钮）/ 8px（卡片）

页面逐个检查：
- [ ] Dashboard：KPI 渐变条、合约池双色条、系统健康进度条
- [ ] 用户管理：头像 + 脱敏手机号 + 徽章
- [ ] 转账明细：地址格式 + 徽章 + 复制按钮
- [ ] 风控：三种颜色左边框告警卡片
- [ ] 节点：顶部状态线
- [ ] 设置：深色树形控件

完成后运行（勿将 Token 写入仓库，请用环境变量）：
```bash
npm run build && npx vercel --prod --yes
# 或使用：export VERCEL_TOKEN="你的_token" 后再部署
```
