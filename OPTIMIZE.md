# Canton Admin 深度优化指令

## 问题清单（对照参考图检查）

### 1. 浏览器适配
- [ ] 1920x1080 全屏显示正常
- [ ] 1366x768 笔记本正常
- [ ] 1440x900 Mac正常
- [ ] 无横向滚动条
- [ ] 图表自适应容器

### 2. 视觉还原（严格对照参考图）

**颜色修正**：
- 页面背景：#0B0E14（更 pure 的黑）
- 卡片背景：#151922（带 subtle 边框 #1E2330）
- 主金色：#F0B90B（Binance 金）
- 蓝色：#2B6AFF（更 vibrant）
- 成功：#00C087 / 失败：#FF6B6B / 待确认：#FFB800

**字体层级**：
- KPI 数字：36px bold #F0B90B
- KPI 标签：12px #848E9C uppercase
- 趋势标签：11px 带 +/- 符号
- 卡片标题：14px #FFFFFF semibold
- 表格文字：13px #A7B1BC
- 侧边栏：14px #848E9C，active #FFFFFF + 蓝色左边框 3px

**间距系统**：
- 页面 padding：24px
- 卡片间距：16px
- 卡片内部 padding：20px
- KPI 卡片高度：100px
- 图表区域高度：320px

**阴影 & 边框**：
- 卡片：border 1px solid #1E2330
- 无 box-shadow（保持 flat）
- 圆角：8px

### 3. 布局结构（像素级还原）

**顶部 Header**：
- 高度：56px
- 背景：#151922
- 底部边框：1px #1E2330
- 左侧：Canton Chain logo + ADMIN CONSOLE
- 中间：面包屑导航
- 右侧：搜索框（圆角 20px，背景 #0B0E14）+ 通知图标 + 用户头像下拉

**侧边栏**：
- 宽度：220px
- 背景：#0B0E14
- 右侧边框：1px #1E2330
- 菜单项高度：44px
- active 状态：蓝色左边框 3px + 背景 #151922
- 图标：20px，文字 14px，间距 12px

**KPI 卡片**：
```
┌─────────────────────────────────┐
│ 平台 CC 总量          ↑ +2.4%   │  ← 右上角趋势
│                                 │
│ 482,310,000 CC                  │  ← 36px 金色数字
│ +1.2%                           │  ← 12px 灰色副标签
└─────────────────────────────────┘
```

**图表区域**：
- 标题：14px semibold，左对齐，下方 16px 间距
- 折线图：黄色渐变填充（areaStyle）
- 网格线：#1E2330，虚线
- Tooltip：深色背景 + 金色高亮当前值

**表格**：
- 表头：12px uppercase #848E9C，背景 transparent
- 行高：48px
- 悬停：背景 #1A1F2A
- 状态标签：圆角 4px，padding 4px 8px
- TxHash：等宽字体 13px，#2B6AFF，hover underline
- 金额：右对齐，#F0B90B，13px

**进度条**：
- 高度：6px
- 圆角：3px
- 背景：#1E2330
- 填充：渐变色（根据类型）

### 4. 交互动效

**页面切换**：
- fade 过渡 200ms ease-out

**卡片悬停**：
- border 颜色过渡到 #2B6AFF
- 过渡时间 150ms

**按钮**：
- primary：蓝色渐变（#2B6AFF → #1E5AF5）
- hover：亮度提升 10%
- active：缩放 0.98
- 过渡 150ms

**表格行**：
- hover 背景色过渡 100ms

**数字变化**：
- KPI 数字变化时，带 countUp 动画

**加载状态**：
- 骨架屏：背景 shimmer 动画
- 表格：行占位符

### 5. 细节修复

**TxHash 显示**：
- 格式：0x7a8f...3e2d（中间省略）
- 右侧复制图标，点击反馈

**时间格式**：
- 相对时间：2分钟前 / 1小时前
- 绝对时间：2025-03-22 14:30

**空状态**：
- 图标 + 文字居中
- 文字：暂无数据 #5E6673

**滚动条**：
- 自定义：宽度 6px
- 轨道：transparent
- 滑块：#3A3F4B，hover #4A5060

### 6. 响应式断点

```css
/* 大屏 1920+ */
@media (min-width: 1920px) {
  .kpi-grid { grid-template-columns: repeat(5, 1fr); }
}

/* 标准 1366-1919 */
@media (min-width: 1366px) and (max-width: 1919px) {
  .kpi-grid { grid-template-columns: repeat(5, 1fr); }
  .chart-section { grid-template-columns: 2fr 1fr; }
}

/* 小屏 < 1366 */
@media (max-width: 1365px) {
  .sidebar { width: 64px; } /* 收起模式 */
  .kpi-grid { grid-template-columns: repeat(3, 1fr); }
}
```

## 检查清单

优化完成后逐项检查：
- [ ] 打开 F12，对比参考图颜色值
- [ ] 调整浏览器宽度，布局自适应
- [ ] KPI 数字字体大小 36px 加粗
- [ ] 所有卡片有 1px 边框
- [ ] 表格行 hover 有效果
- [ ] 按钮点击有反馈
- [ ] 页面切换有动画
- [ ] 滚动条样式统一
- [ ] 无 console 报错

## 优化命令

```bash
cd /Users/bob/AI-PROJECT/canton-web-wallet-admin
npm run dev
```

然后用浏览器打开，对照参考图逐个像素调整。
