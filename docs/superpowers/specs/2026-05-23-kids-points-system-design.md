# 儿童积分管理系统 — 设计文档

> **项目代号**：ui-web-child
> **日期**：2026-05-23
> **目标用户**：6 岁宝宝家庭
> **使命**：让每一个好习惯都被记录，让每一份努力都有回报

---

## 0. 项目背景与设计原则

### 0.1 背景
家长希望通过可视化、即时反馈的方式记录 6 岁宝宝的好习惯，将抽象的"努力"转化为可见的积分与奖励，培养自律和正向激励。

### 0.2 设计原则（基于儿童心理学与代币法理论）

1. **即时反馈**：6 岁儿童前额叶发育未成熟，延迟满足耐受度低。打卡当下立即可见进展。
2. **任务具体可视化**：避免抽象描述（"认真听课"），改为可量化的行为（"专注 5 分钟"、"朗读 15 分钟"）。
3. **只加分，不扣分**：正向激励为主，避免打击宝宝积极性。
4. **21 / 66 天定律**：21 天初步形成习惯，66 天自动化。前 3 周尤其关键。
5. **奖励分层**：日常贴纸/小奖励（即时） + 周/月里程碑徽章（延迟满足训练）。
6. **快照机制**：任务/奖励改名改分后，历史明细仍保留原值，确保数据可追溯。
7. **单一数据源**：累计总分 = 所有打卡加分之和；当前余额 = 累计 − 已花费。不冗余存储。

---

## 1. 技术栈与目录结构

### 1.1 技术栈

| 层 | 选型 | 说明 |
|---|---|---|
| 构建 | Vite + React 18 + TypeScript | 启动快、生态成熟 |
| 路由 | React Router v6 | 多页面导航 |
| 状态 | Zustand + persist + immer 中间件 | 单 store + slice 模式，自动持久化到 localStorage |
| 样式 | Tailwind CSS + CSS 变量 | 童趣主题色 |
| 2D 动画 | Framer Motion | 卡片过渡、加分弹跳 |
| 3D 场景 | React Three Fiber (R3F) + @react-three/drei + three | 吉祥物、徽章解锁、宝箱 |
| Lottie 微动画 | lottie-react | 烟花、撒花、开箱 |
| 图表 | Recharts | 统计图表 |
| 图标 | Microsoft Fluent Emoji 3D（黏土风 webp） + Lucide React（功能图标） | 统一童话风格 |
| 工具 | dayjs（日期）、nanoid（ID）、zod（schema 校验） | — |
| 测试 | Vitest + @testing-library/react | 单测 + 组件测试 |

### 1.2 目录结构

```
ui-web-child/
├── src/
│   ├── main.tsx
│   ├── App.tsx                        # 路由壳
│   ├── pages/
│   │   ├── TodayPage/                 # 今日打卡（首页）
│   │   ├── HistoryPage/               # 积分明细
│   │   ├── ShopPage/                  # 积分商店
│   │   ├── StatsPage/                 # 统计图表
│   │   └── SettingsPage/              # 任务/奖励/宝宝设置
│   ├── components/
│   │   ├── Icon.tsx                   # 统一图标组件
│   │   ├── ScoreCard.tsx
│   │   ├── TaskItem.tsx
│   │   ├── ShopCard.tsx
│   │   ├── BadgeIcon.tsx
│   │   ├── NavBar.tsx
│   │   ├── Toast.tsx
│   │   └── scenes/
│   │       ├── MascotScene.tsx        # 吉祥物 3D 场景
│   │       ├── MilestoneScene.tsx     # 解锁徽章场景
│   │       └── TreasureChestScene.tsx # 开宝箱场景
│   ├── store/
│   │   ├── index.ts
│   │   ├── childSlice.ts
│   │   ├── tasksSlice.ts
│   │   ├── recordsSlice.ts
│   │   ├── rewardsSlice.ts
│   │   ├── redemptionsSlice.ts
│   │   ├── milestonesSlice.ts
│   │   ├── uiSlice.ts
│   │   └── selectors.ts
│   ├── types/
│   │   └── index.ts
│   ├── utils/
│   │   ├── date.ts
│   │   ├── milestones.ts
│   │   └── exportImport.ts
│   ├── constants/
│   │   ├── categories.ts
│   │   ├── presetTasks.ts
│   │   ├── presetRewards.ts
│   │   └── presetMilestones.ts
│   ├── hooks/
│   │   ├── useDayChange.ts            # 跨日检测
│   │   └── useDeviceTier.ts           # 低端机降级
│   └── styles/
│       ├── theme.css                  # 童话色板
│       └── globals.css
├── public/
│   └── assets/
│       ├── models/                    # glTF 模型
│       ├── lottie/                    # Lottie JSON
│       ├── icons/                     # 3D 黏土风图标
│       │   ├── tasks/
│       │   ├── categories/
│       │   ├── rewards/
│       │   └── milestones/
│       └── audio/                     # 音效
├── index.html
├── tailwind.config.ts
├── tsconfig.json
└── vite.config.ts
```

### 1.3 单文件 ≤ 500 行硬约束

任何文件预估超过 500 行立刻拆分：
- UI 拆 `components/` 子组件
- 业务逻辑超 50 行抽 Custom Hook 到 `hooks/`
- 类型、常量分别放 `types.ts` / `constants.ts`

---

## 2. 数据模型

### 2.1 核心实体（TypeScript 类型）

```typescript
// 任务分类
type CategoryId = 'study' | 'life' | 'sport';
type TimeSlot = 'morning' | 'daytime' | 'evening';

interface Category {
  id: CategoryId;
  name: string;           // 学习 / 生活 / 运动
  icon: string;           // 大图标 key
  color: string;          // 主题色（Tailwind 类）
  accentColor: string;    // 边框高亮色
}

// 任务定义（家长配置的"可打卡项"）
interface Task {
  id: string;             // nanoid
  categoryId: CategoryId;
  name: string;           // "刷牙"
  icon: string;           // 图标 key，如 'toothbrush'
  points: number;         // 单次打卡得分
  repeatable: 'daily' | 'once';
  timeSlot: TimeSlot;     // 今日页面分组展示
  weeklyLimit?: number;   // 一周最多打卡次数（once 任务用）
  active: boolean;        // 停用不删，保留历史
  createdAt: number;
}

// 打卡记录（每次加分都生成一条）
interface Record {
  id: string;
  taskId: string;
  taskSnapshot: {         // 快照：防止任务改名后历史显示错乱
    name: string;
    icon: string;
    categoryId: CategoryId;
    points: number;
  };
  points: number;         // 实际加分（=快照分）
  date: string;           // 'YYYY-MM-DD' 本地日期
  timestamp: number;
  note?: string;
}

// 奖励（商店商品）
interface Reward {
  id: string;
  name: string;
  icon: string;
  cost: number;
  stock: number | null;   // null = 不限量
  active: boolean;
  createdAt: number;
}

// 兑换记录
interface Redemption {
  id: string;
  rewardId: string;
  rewardSnapshot: { name: string; icon: string; cost: number };
  cost: number;
  timestamp: number;
  status: 'pending' | 'fulfilled' | 'cancelled';
}

// 里程碑徽章
interface Milestone {
  id: string;
  threshold: number;
  name: string;
  icon: string;
  model3d?: string;       // glTF 路径
  description: string;
}

interface UnlockedMilestone {
  milestoneId: string;
  unlockedAt: number;
}

// 宝宝信息
interface Child {
  name: string;
  icon: string;           // 头像 key
  birthday?: string;
}
```

### 2.2 关键设计点

- **快照机制**：`Record.taskSnapshot` 与 `Redemption.rewardSnapshot` 保留事件发生时的状态。
- **累计 vs 余额**：`totalEarned` = sum of records.points；`balance` = totalEarned − sum of fulfilled/pending redemptions.cost；里程碑只看累计，不受兑换影响。
- **停用而非删除**：`active: false` 保留历史关联。
- **localStorage key**：统一 `ui-web-child:v1`。
- **日期边界**：以本地时区计算。
  - **日**：`YYYY-MM-DD`，由 `dayjs().format('YYYY-MM-DD')` 取本机日期。当日重置时刻 = 本地 00:00。
  - **周**：周一 00:00 至周日 23:59:59（ISO 周）。`weeklyLimit` 计数窗口对齐 ISO 周边界。
  - 用户跨时区飞行不做特殊处理；以打卡时浏览器本地时间为准。

### 2.3 预设数据

#### 预设分类
```typescript
PRESET_CATEGORIES = [
  { id: 'study', name: '学习', icon: 'study',  color: 'sky',     accentColor: '#7DD3FC' },
  { id: 'life',  name: '生活', icon: 'life',   color: 'amber',   accentColor: '#FCD34D' },
  { id: 'sport', name: '运动', icon: 'sport',  color: 'emerald', accentColor: '#A7F3D0' },
];
```

#### 预设任务（18 项日常 + 3 项周末加分）

研究依据：北京市《3-6 岁儿童学习与发展指南》、澎湃新闻《1-6 年级习惯养成一览表》、美国 KidPointz 儿童任务表、代币法行为矫正研究。

```typescript
PRESET_TASKS = [
  // 学习 📚
  { category: 'study', name: '朗读 15 分钟',       icon: 'book-open',       points: 8,  timeSlot: 'daytime', repeatable: 'daily' },
  { category: 'study', name: '数学小练习 10 分钟',  icon: 'input-numbers',   points: 8,  timeSlot: 'daytime', repeatable: 'daily' },
  { category: 'study', name: '控笔/写字练习',      icon: 'pencil',          points: 6,  timeSlot: 'daytime', repeatable: 'daily' },
  { category: 'study', name: '亲子共读 20 分钟',   icon: 'books',           points: 10, timeSlot: 'evening', repeatable: 'daily' },
  { category: 'study', name: '英文分级阅读',       icon: 'abc',             points: 8,  timeSlot: 'daytime', repeatable: 'daily' },
  { category: 'study', name: '专注完成作业',       icon: 'memo',            points: 10, timeSlot: 'daytime', repeatable: 'daily' },
  // 生活 🏠
  { category: 'life',  name: '7:00 自主起床',      icon: 'sunrise',         points: 5,  timeSlot: 'morning', repeatable: 'daily' },
  { category: 'life',  name: '自己穿衣叠被',       icon: 'shirt',           points: 5,  timeSlot: 'morning', repeatable: 'daily' },
  { category: 'life',  name: '刷牙洗脸',           icon: 'toothbrush',      points: 3,  timeSlot: 'morning', repeatable: 'daily' },
  { category: 'life',  name: '吃完早餐不挑食',     icon: 'bowl-of-food',    points: 5,  timeSlot: 'morning', repeatable: 'daily' },
  { category: 'life',  name: '整理玩具/书桌',      icon: 'teddy-bear',      points: 5,  timeSlot: 'daytime', repeatable: 'daily' },
  { category: 'life',  name: '帮忙做一项家务',     icon: 'broom',           points: 6,  timeSlot: 'daytime', repeatable: 'daily' },
  { category: 'life',  name: '屏幕时间 ≤ 30 分钟', icon: 'mobile-phone',    points: 5,  timeSlot: 'evening', repeatable: 'daily' },
  { category: 'life',  name: '21:00 前洗漱完毕',   icon: 'soap',            points: 3,  timeSlot: 'evening', repeatable: 'daily' },
  { category: 'life',  name: '21:30 入睡',         icon: 'sleeping-face',   points: 5,  timeSlot: 'evening', repeatable: 'daily' },
  // 运动 ⚽
  { category: 'sport', name: '跳绳 100-200 下',    icon: 'jumping-rope',    points: 8,  timeSlot: 'daytime', repeatable: 'daily' },
  { category: 'sport', name: '户外活动 ≥ 1 小时',  icon: 'runner',          points: 10, timeSlot: 'daytime', repeatable: 'daily' },
  { category: 'sport', name: '体能小练习',         icon: 'flexed-biceps',   points: 6,  timeSlot: 'daytime', repeatable: 'daily' },
];

PRESET_WEEKLY_TASKS = [
  { category: 'study', name: '本周读完一本绘本', icon: 'closed-book', points: 30, repeatable: 'once', weeklyLimit: 1 },
  { category: 'sport', name: '周末爬山/远足',     icon: 'mountain',    points: 30, repeatable: 'once', weeklyLimit: 1 },
  { category: 'life',  name: '完整一周作息打卡', icon: 'trophy',      points: 50, repeatable: 'once', weeklyLimit: 1 },
];
```

**每日满分 ≈ 116 分**；实际预期 40-70 分/天合理。

#### 预设里程碑

| 阈值 | 名称 | 图标 |
|---|---|---|
| 100 | 习惯新星 | rising-star |
| 300 | 坚持小达人 | shooting-star |
| 500 | 五百精英 | medal |
| 1000 | 千分大师 | trophy |
| 2000 | 两千传奇 | crown |
| 5000 | 五千王者 | diamond |

#### 预设奖励商店（11 项）

```typescript
PRESET_REWARDS = [
  // 小奖励（即时满足，20-30 分）
  { name: '看动画片 20 分钟', icon: 'tv',           cost: 30 },
  { name: '挑选今晚水果',     icon: 'strawberry',   cost: 20 },
  { name: '小贴纸一张',       icon: 'sticker',      cost: 25 },
  // 中奖励（60-100 分）
  { name: '亲子游戏 1 小时',  icon: 'game-dice',    cost: 60 },
  { name: '选今晚菜单',       icon: 'bento',        cost: 80 },
  { name: '周末晚睡 30 分钟', icon: 'moon',         cost: 80 },
  { name: '小玩具一个',       icon: 'gift',         cost: 100 },
  // 大奖励（500-1500 分，延迟满足训练）
  { name: '乐高一盒',         icon: 'lego',         cost: 500 },
  { name: '电影院看电影',     icon: 'movie',        cost: 600 },
  { name: '游乐场半日游',     icon: 'roller',       cost: 800 },
  { name: '心愿礼物',         icon: 'sparkles',     cost: 1500 },
];
```

---

## 3. 功能模块与页面

### 3.1 页面结构（5 页 + 底部 Tab）

**底部导航**：今日 📅 / 明细 📋 / 商店 🛒 / 统计 📊 / 设置 ⚙️

#### 页面 1 — 今日打卡 `TodayPage`（默认首页）

**顶部**：
- 宝宝头像 + 名字
- 大号显示「今日得分」「累计总分」「可用余额」
- 进度条：距离下一里程碑还差 XX 分

**中部**：按 `timeSlot` 分组的任务卡片
- 🌅 早晨 / 📅 白天 / 🌙 晚间
- 卡片显示：图标 + 任务名 + 分数 + 操作按钮

**交互**：
- 点卡片 → 加分动效（数字飞向总分 + 粒子撒花）
- 已打卡置灰显示「已完成 ✅」
- 5 分钟内可撤销
- 触发里程碑 → 全屏徽章解锁动画

#### 页面 2 — 积分明细 `HistoryPage`

- 按日期倒序列出所有 `Record`
- 筛选：日期范围（今日/本周/本月/全部）、分类
- 列表项：图标 + 任务名 + 分数 + 时间
- 长按删除（家长修正误打卡）

#### 页面 3 — 积分商店 `ShopPage`

- 顶部：当前可用余额
- 3 列网格：每个奖励 = 3D 宝箱（木 / 银 / 金 / 钻石，按 cost 档位）
- 兑换按钮：余额够 → 亮起；不够 → 显示「还差 XX 分」
- Tab 切换：可兑换 / 兑换记录
- 兑换记录可标记「已发放」（pending → fulfilled），pending 可取消（返还积分）

#### 页面 4 — 统计图表 `StatsPage`

3 张 Recharts 图表：
1. 近 7 天每日得分（柱状图）
2. 本周分类占比（饼图）
3. 近 30 天累计积分趋势（折线图，标注里程碑解锁点）

顶部数字卡片：连续打卡天数 🔥、已解锁徽章数 🏅、本周总得分、总累计分。

#### 页面 5 — 设置 `SettingsPage`

4 个子区：
1. **宝宝信息**：名字、头像、生日
2. **任务管理**：增删改查、启停、恢复预设
3. **奖励管理**：增删改查、启停、恢复预设
4. **数据管理**：导出 JSON、导入 JSON、清空数据（二次确认）

---

## 3.5 3D 童话视觉系统

### 视觉技术分层

| 用途 | 技术 |
|---|---|
| 主场景 3D（吉祥物、宝箱、徽章） | React Three Fiber + drei |
| 轻量 3D（卡片倾斜、按钮浮起） | CSS 3D transforms + perspective |
| 复杂动画（开宝箱、烟花） | Lottie |
| 粒子（撒花、星屑） | tsparticles / R3F instanced mesh |
| 过渡补间 | Framer Motion |

### 性能边界
- R3F 场景仅用于 4 个「重要时刻」：解锁徽章、开宝箱、加分主屏、首次启动 logo
- 日常列表/按钮用 CSS 3D（GPU 合成层）
- 低端机降级：`navigator.hardwareConcurrency < 4` → 2D fallback

### 3D 视觉元素

1. **童话吉祥物**：4 个角色（熊 🐻 / 狐狸 🦊 / 兔子 🐰 / 恐龙 🦖），状态机驱动动作
2. **3D 任务卡**：跟随鼠标/手指倾斜；打卡时弹起翻转
3. **加分粒子流**：分数 + emoji 沿贝塞尔轨迹飞向总分
4. **里程碑解锁场景**：全屏 3D 徽章旋转 + 烟花 + 吉祥物举徽
5. **积分商店宝箱**：4 档颜色，悬停半开，兑换 Lottie 开箱动画
6. **统计页 3D 包装**：卡片悬浮、玻璃管进度条、火焰连续天数
7. **童话色板**：
   ```css
   --color-sky:   #7DD3FC;  --color-mint:  #A7F3D0;
   --color-peach: #FECACA;  --color-gold:  #FCD34D;
   --color-grape: #C4B5FD;  --color-cream: #FEF3C7;
   --shadow-3d:   0 10px 0 #d4d4d4, 0 15px 25px rgba(0,0,0,0.2);
   --radius-big:  24px;     --radius-huge: 40px;
   ```
8. **字体**：标题「站酷快乐体」/「霞鹜文楷」；正文系统默认
9. **音效**（可关）：打卡叮、里程碑欢呼、宝箱开启

### 资源准备清单
```
public/assets/
├── models/  *.glb（吉祥物、徽章、宝箱）
├── lottie/  *.json（confetti / chest-open / fireworks）
└── audio/   *.mp3
```

MVP 阶段：免费资源（Sketchfab CC0、LottieFiles 免费）。

---

## 3.6 图标系统

替换全部 Emoji 为 3D 黏土风图标（统一渲染、跨平台一致）。

### 图标三档分级

| 层级 | 用途 | 资源 |
|---|---|---|
| L1 主角色 | 吉祥物、徽章、宝箱 | glTF 3D 模型 |
| L2 内容图标 | 任务、分类、奖励 | 256×256 webp |
| L3 功能图标 | 导航、按钮 | Lucide React SVG |

### L2 资源选型

**首选**：Microsoft Fluent Emoji 3D（MIT 开源）
- 覆盖所有任务（牙刷、书、跳绳、太阳…）
- 统一 3D 风格，全套商用免费

### 统一图标组件

```typescript
// components/Icon.tsx
interface IconProps {
  type: 'task' | 'reward' | 'milestone' | 'category';
  name: string;
  size?: number;
  animated?: boolean;
}

export function Icon({ type, name, size = 64, animated }: IconProps) {
  const src = `/assets/icons/${type}s/${name}.webp`;
  return (
    <motion.img
      src={src}
      width={size}
      height={size}
      whileHover={animated ? { scale: 1.15, rotate: [0, -5, 5, 0] } : undefined}
      transition={{ duration: 0.3 }}
      loading="lazy"
      alt={name}
    />
  );
}
```

### 渐进加载
- WebP 格式 + `loading="lazy"`
- 首屏预载今日任务图标（preload link）
- 长列表 IntersectionObserver 懒加载

---

## 3.7 自定义任务 / 奖励 UX

家长可在「设置」页内完整管理任务和奖励，不限于预设。

### 3.7.1 任务编辑表单

入口：设置页 → 任务管理 → 「+ 新增任务」 / 点击已有任务卡片。

字段：

| 字段 | 控件 | 校验 | 备注 |
|---|---|---|---|
| 任务名 | 文本输入 | 必填，1-20 字 | 例如「练琴 20 分钟」 |
| 分类 | 三选一卡片选择器 | 必选 | 学习 / 生活 / 运动 |
| 图标 | 图标选择器（网格弹窗） | 必选 | 从图标库选 256×256 webp |
| 分数 | 数字输入（步进按钮） | 1-100 整数 | 默认 5 |
| 重复方式 | 二选一 | 必选 | 每日 / 一次性 |
| 时段 | 三选一 | 必选 | 早晨 / 白天 / 晚间 |
| 周限次数 | 数字输入（仅"一次性"显示） | 1-7 | 默认 1 |
| 启用状态 | 开关 | 默认 ON | 关闭后不出现在今日页，历史保留 |

操作：
- **保存**：新建走 `addTask`，编辑走 `updateTask`
- **删除**：二次确认；若有历史记录提示「已打卡 X 次，历史仍保留」
- **复制**：基于现有任务快速创建新任务（图标/分类预填）

### 3.7.2 图标选择器

弹窗组件 `<IconPicker>`：
- 按分类分组展示（学习/生活/运动/通用）
- 顶部搜索框（按 key 模糊匹配）
- 网格 6 列，每个图标 72×72 预览
- 点击选中即关闭，回填到表单

图标库基于 Microsoft Fluent Emoji 3D 全套（200+ 图标）。

### 3.7.3 奖励编辑表单

入口：设置页 → 奖励管理 → 「+ 新增奖励」 / 点击已有奖励卡片。

| 字段 | 控件 | 校验 |
|---|---|---|
| 奖励名 | 文本输入 | 必填，1-20 字 |
| 图标 | 图标选择器 | 必选 |
| 兑换分数 | 数字输入 | 1-9999 整数 |
| 库存 | 数字输入 + 「无限量」开关 | 开关 ON 时存 null |
| 启用状态 | 开关 | 默认 ON |

操作同任务：保存、删除（有兑换记录则保留历史）、复制。

### 3.7.4 恢复预设

每个管理页底部固定按钮「恢复预设任务 / 奖励」：
- 仅添加缺失的预设项（按 name 去重），不覆盖现有
- 二次确认：「将添加 N 个未出现的预设项，已有自定义不受影响」

### 3.7.5 自定义里程碑（v1.1，MVP 不含）

MVP 阶段里程碑固定 6 级；v1.1 开放：
- 自定义阈值（≥ 当前累计）
- 自定义名称与徽章图标
- 不可修改已解锁的里程碑

---



### 4.1 Store 结构

单 store + slice 模式 + persist + immer 中间件。

```typescript
// store/index.ts
export const useStore = create<AppStore>()(
  persist(
    immer((...args) => ({
      ...createChildSlice(...args),
      ...createTasksSlice(...args),
      ...createRecordsSlice(...args),
      ...createRewardsSlice(...args),
      ...createRedemptionsSlice(...args),
      ...createMilestonesSlice(...args),
      ...createUiSlice(...args),
    })),
    {
      name: 'ui-web-child:v1',
      storage: createJSONStorage(() => localStorage),
      version: 1,
      partialize: (state) => ({
        child: state.child,
        tasks: state.tasks,
        records: state.records,
        rewards: state.rewards,
        redemptions: state.redemptions,
        unlockedMilestones: state.unlockedMilestones,
        settings: state.settings,
      }),
      migrate: (persisted, version) => persisted as AppStore,
    },
  ),
);
```

### 4.2 Slice 职责

| Slice | 职责 |
|---|---|
| `childSlice` | 宝宝信息 CRUD |
| `tasksSlice` | 任务定义 CRUD + 启停 + 恢复预设 |
| `recordsSlice` | **核心**：打卡、撤销、删除 |
| `rewardsSlice` | 奖励商品 CRUD + 启停 + 恢复预设 |
| `redemptionsSlice` | 兑换、标记发放、取消（返还积分） |
| `milestonesSlice` | 里程碑列表 + 检查解锁 + 初始化预设 (`initPresetMilestones`) |
| `uiSlice` | 临时态：最近解锁徽章、加分动效坐标（不持久化） |

### 4.3 checkIn 关键逻辑

```typescript
checkIn(taskId: string, note?: string): Record | null {
  // 1. 校验 taskId 存在且 active=true
  // 2. repeatable 校验：
  //    - 'daily' → 当日已打卡则拒绝（返回 null）
  //    - 'once' → 检查 weeklyLimit（本周计数）
  // 3. 写入 record（含 taskSnapshot）
  // 4. 触发 checkMilestones()，若有新解锁推到 uiSlice.recentlyUnlocked
  // 5. 返回新 record
}
```

### 4.4 派生数据（Selector）

```typescript
selectTotalEarned    // 累计总分（永不减）
selectTotalSpent     // 已花费（含 pending + fulfilled，不含 cancelled）
selectBalance        // earned - spent
selectTodayPoints    // 今日得分
selectTodayCheckedTaskIds  // Set<taskId>
selectStreak         // 连续打卡天数
selectNextMilestone  // 最近未解锁阈值
```

组件用 `useStore(selectBalance)` + shallow 比较，避免无谓 rerender。

### 4.5 首次启动初始化

```typescript
useEffect(() => {
  const s = useStore.getState();
  if (s.tasks.length === 0) s.restorePresetTasks();
  if (s.rewards.length === 0) s.restorePresetRewards();
  if (s.milestones.length === 0) s.initPresetMilestones();
}, []);
```

### 4.6 版本迁移

`version: 1` 写入 persist 配置。后续 schema 变更：
- 改 `version: 2`
- 在 `migrate` 函数处理 v1 → v2 字段映射
- 旧用户打开自动升级

### 4.7 单一职责约束
- 每 slice ≤ 300 行；超出抽到 `store/logic/` 工具
- 选择器集中 `store/selectors.ts`
- 类型集中 `types/index.ts`

---

## 5. 错误处理与边界情况

### 5.1 用户操作错误

| 场景 | 处理 |
|---|---|
| 重复打卡（同任务同日） | 按钮置灰「今日已完成」，不允许再点 |
| 误打卡 | 5 分钟内卡片显示「撤销」按钮；过期入明细长按删除 |
| 兑换余额不足 | 按钮置灰显示「还差 XX 分」 |
| 兑换误操作 | pending 可取消返还；fulfilled 不可撤销 |
| 删除有历史的任务 | 弹窗提示「该任务已打卡 X 次，历史仍保留」 |
| 任务名空 / 分数 ≤ 0 | 表单校验，不可提交 |
| 清空数据 | 二次输入「确认清空」文字才生效 |

### 5.2 数据完整性

| 场景 | 处理 |
|---|---|
| localStorage 被禁用 | 启动检测，全屏提示 |
| localStorage 配额超限 | 弹窗建议导出备份后清理 |
| JSON 解析失败 | `onRehydrateStorage` 钩子捕获，进入恢复流程 |
| 版本不兼容 | migrate 函数兜底 |
| 引用完整性（task 删但 record 存） | 用快照，永远可读 |
| 时间戳异常 | 以本地 `dayjs()` 当下为准 |
| 导入 JSON 不合法 | zod schema 校验，不覆盖现有数据 |

### 5.3 资源加载错误

| 场景 | 处理 |
|---|---|
| 3D 模型加载失败 | R3F `<Suspense fallback={<Icon2D />}>` 降级 2D |
| Lottie 失败 | try/catch + 静态备用图 |
| 图标 webp 404 | `<img onError>` 回退默认图标 |
| 音效失败 | 静默忽略 |
| 首屏白屏 | React `<ErrorBoundary>` 兜底 |

### 5.4 设备/浏览器边界

| 场景 | 处理 |
|---|---|
| 低端机（< 4 核） | 关闭 R3F，仅 CSS 3D + Lottie |
| 不支持 webp | `<picture>` 提供 PNG fallback |
| 多 Tab 打开 | persist 自动同步 + checkIn 守卫去重 |
| 跨日切换 | 每分钟 `setInterval` 检查日期，触发今日页重置 |
| 离线 | 完全可用（无网络依赖） |

### 5.5 反馈 UI

- **Toast**：success / error / warning / info 四级，圆角童趣样式
- **Modal**：关键错误（数据损坏、清空、兑换二次确认）
- 浏览器端 `console.error`，不接远程日志

---

## 6. 测试策略

### 6.1 测试栈
- **Vitest**：单元测试（store / selectors / utils）
- **@testing-library/react**：关键组件测试
- E2E（v1.1 可选）：Playwright

### 6.2 必测覆盖

**Store 逻辑层**：
- `recordsSlice`：checkIn 成功/重复/停用/不存在/周限；undoRecord 5 分钟内外；removeRecord
- `redemptionsSlice`：redeem 余额足/不足；fulfill；cancel 返还；fulfilled 不可 cancel
- `milestonesSlice`：阈值解锁；不重复解锁；兑换不影响
- `selectors`：earned / balance / todayPoints / streak / nextMilestone

**Utils**：
- 日期格式化、周边界、跨日检测
- 里程碑计算

**组件**：
- `TaskItem`：渲染、点击触发、已完成态、撤销按钮过期
- `ShopCard`：余额足/不足、兑换确认 modal

### 6.3 不必测
3D 场景细节、动画时序、视觉样式、第三方库内部行为。

### 6.4 测试数据工厂

```typescript
// test/factories.ts
export const makeTask = (overrides?) => ({ ...defaults, ...overrides });
export const makeRecord = (...) => ({ ... });
export const makeReward = (...) => ({ ... });

// beforeEach 重置 store
beforeEach(() => {
  useStore.setState({ tasks: [], records: [], rewards: [], ... });
});
```

### 6.5 手测清单（MVP 上线前）

1. 新建任务 → 设置图标 → 保存 → 出现在今日页
2. 打卡 → 加分动画 → 总分 + 余额变化
3. 同任务再点击 → 已完成、不能再加分
4. 撤销 → 5 分钟内可撤、超时按钮消失
5. 累计到 100 → 解锁动画触发
6. 兑换商品 → 余额扣减 → 进入 pending
7. 标记已发放 → fulfilled
8. 取消 pending → 余额返还
9. 跨日刷新 → 今日页重置、明细保留
10. 关闭浏览器重开 → 数据完整
11. 导出 JSON → 清空 → 导入恢复 → 一致
12. 低端机 → 降级 2D 流畅

---

## 7. 研究来源（设计依据）

- [3-6 岁儿童学习与发展指南 — 北京市政府](https://www.beijing.gov.cn/fuwu/bmfw/bmzt/yyerq/shzl/ye/202406/t20240614_3712723.html)
- [新学期 1-6 年级孩子习惯养成一览表 — 澎湃新闻](https://www.thepaper.cn/newsDetail_forward_19868374)
- [代币奖励法在儿童行为矫正中的应用 — 艺得好儿童发展中心](https://m.bbchild.fun/cn/nd.jsp?id=170)
- [代币奖励兑换频率：每日或每周 — M4919 健康网](https://m4919.com/2025/07/6018/)
- [代币制：小学生良好行为习惯养成的助推器 — 新浪博客](https://blog.sina.com.cn/s/blog_65eebb900100qkee.html)
- [102 Chore Chart Reward Ideas for Kids — Mommy On Purpose](https://mommyonpurpose.com/102-chore-chart-reward-ideas-for-kids/)
- [Simple Chore & Reward System Kids Will Love — Clean Mama](https://cleanmama.com/simple-chore-and-reward-system-your-kids-will-love-free-printables/)
- [21 Child Reward System Ideas — Money Prodigy](https://www.moneyprodigy.com/child-reward-system-ideas/)
- [小学生日程管理手册（参考 KidPointz） — 知乎](https://zhuanlan.zhihu.com/p/409699371)
- [小花生 — 阅读记录阅读打卡](https://app.mi.com/details?id=com.huili.readingclub)

---

## 8. MVP 范围与后续迭代

### v1.0（MVP）— 本设计文档范围
- 5 页面：今日 / 明细 / 商店 / 统计 / 设置
- 多分类任务 + 只加分 + 商店兑换 + 里程碑徽章
- localStorage 持久化
- 3D 童话视觉 + 童趣音效
- 18 项预设任务 + 11 项预设奖励 + 6 级里程碑

### v1.1 可选
- PWA 支持（离线、桌面图标）
- 导出 JSON → 二维码分享（备份）
- E2E 测试

### v2.0+（不在本规划）
- 多宝宝档案
- 云端同步（Supabase）
- 多家长协作
- 自定义里程碑

---

## 9. 实施约束摘要

1. **单文件 ≤ 500 行**：超出立即拆分
2. **UI / 逻辑 / 类型 / 常量分离**：组件、Hook、types.ts、constants.ts
3. **快照不变**：历史记录不依赖外键
4. **单一数据源**：余额从记录派生，不冗余存
5. **图标统一组件**：所有 `<img>` 走 `<Icon />`
6. **3D 降级机制**：低端机走 2D
7. **错误统一 Toast + Modal**：禁止散落 alert
