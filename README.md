<p align="center">
  <img src="pomodoro-electron/assets/icon.png" width="128" alt="Pomodoro Timer">
</p>

<h1 align="center">🍅 番茄钟 · Pomodoro Timer</h1>

<p align="center">
  <strong>优雅、强大、跨平台的桌面番茄钟应用</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/platform-Windows%20%7C%20macOS%20%7C%20Linux-brightgreen" alt="Platform">
  <img src="https://img.shields.io/badge/electron-33.4.0-9feaf9" alt="Electron">
  <img src="https://img.shields.io/badge/license-MIT-blue" alt="License">
  <img src="https://img.shields.io/badge/version-2.0.0-orange" alt="Version">
</p>

---

## ✨ 功能亮点

### 🍅 番茄工作法核心
- **专注模式** — 25 分钟深度专注（可自定义 1-120 分钟）
- **短休息** — 5 分钟放松（可自定义 1-60 分钟）
- **长休息** — 每 N 个番茄后自动进入长休（默认 4 个番茄后 15 分钟）
- **自动开始下一轮** — 完成一个阶段后自动切换，无需手动操作
- **番茄计数** — 可视化显示当前周期的完成进度，完成时带弹跳动画

### 🎨 深度主题定制
- **4 套预设主题** — 暗黑 / 森林 / 海洋 / 日落，一键切换
- **完全自由配色** — 自定义所有 UI 元素颜色（进度环、按钮、卡片、文字等）
- **背景类型** — 纯色 / 渐变（自定义方向和颜色）/ 网络图片
- **实时预览** — 修改主题时即时看到效果
- **主题持久化** — 自动保存，下次启动自动加载

### 💬 内置名言语录
- **30 条精选名言** — 中英双语，激励专注
- **轮换策略** — 每次完成 / 随机 / 手动 三种方式
- **自定义名言** — 自由添加、删除、管理你的专属语录
- **名言卡片** — 界面上优雅展示当前名言

### 🖥️ 桌面应用特性
- **系统托盘** — 最小化到托盘，后台运行不打扰
- **托盘菜单** — 右键托盘图标快速 开始/暂停/跳过/置顶
- **窗口置顶** — 一键将番茄钟钉在屏幕最前
- **窗口记忆** — 记住上次的窗口位置和大小
- **关闭到托盘** — 关闭窗口时自动收起（可关闭）

### 🔊 音效与通知
- **Web Audio 合成** — 无需音频文件，纯代码合成提示音
- **完成旋律** — 番茄完成时播放 C-E-G-C 上行音阶
- **倒计时滴答** — 最后 3 秒滴答提醒
- **桌面通知** — 系统原生通知，休息和工作提醒
- **自定义音量** — 0-100% 可调节

### ⌨️ 键盘快捷键

| 按键 | 功能 |
|------|------|
| `空格` | 开始 / 暂停 |
| `R` | 重置当前计时 |
| `→` | 跳过当前阶段 |
| `1` | 切换到专注模式 |
| `2` | 切换到短休模式 |
| `3` | 切换到长休模式 |
| `Esc` | 关闭设置面板 |

---

## 📥 安装

### 下载安装包（推荐）

前往 [📦 Releases](https://github.com/yi-san-spce/pomodoro/releases) 页面下载最新版本：

| 文件 | 说明 |
|------|------|
| `Pomodoro-Timer-Setup-x.x.x.exe` | Windows 安装程序（NSIS） |
| `Pomodoro-Timer-Portable-x.x.x.exe` | 绿色便携版，无需安装 |

### 从源码运行

```bash
# 克隆仓库
git clone git@github.com:yi-san-spce/pomodoro.git
cd pomodoro/pomodoro-electron

# 安装依赖
npm install

# 启动应用
npm start
```

---

## 🛠 开发

### 项目结构

```
pomodoro-electron/
├── src/
│   ├── main/              # Electron 主进程
│   │   ├── main.js        # 应用入口 & 窗口管理
│   │   ├── store.js       # 持久化存储（JSON 文件）
│   │   ├── tray.js        # 系统托盘
│   │   ├── ipc-handlers.js # IPC 通信处理
│   │   └── assets-init.js  # 图标自动生成
│   ├── preload/
│   │   └── preload.js     # 安全上下文桥接
│   └── renderer/          # 渲染进程（前端界面）
│       ├── index.html     # 主界面
│       ├── css/           # 样式表
│       │   ├── base.css   # CSS 变量 & 重置
│       │   ├── timer.css  # 计时器 & 卡片
│       │   └── settings.css # 设置面板
│       └── js/            # 前端逻辑
│           ├── app.js     # 启动引导 & 事件绑定
│           ├── timer.js   # 计时器状态机
│           ├── audio.js   # Web Audio 音效
│           ├── themes.js  # 主题引擎
│           ├── quotes.js  # 名言语录管理
│           ├── settings.js # 设置面板逻辑
│           ├── storage.js  # IPC 存储封装
│           └── notifications.js # Toast & 桌面通知
├── data/
│   └── default-quotes.json # 内置名言库（30条）
├── assets/                # 图标（自动生成）
├── package.json
└── electron-builder.yml   # 构建配置
```

### 可用命令

```bash
npm start          # 启动开发模式
npm run dev        # 开发模式（可开启 DevTools）
npm run pack       # 打包到 dist/（不压缩）
npm run dist       # 构建所有平台的安装包
npm run dist:win   # 仅构建 Windows 安装包
```

---

## 🧱 技术栈

- **框架**: [Electron](https://www.electronjs.org/) 33
- **构建**: [electron-builder](https://www.electron.build/) 25
- **存储**: JSON 文件（`electron-store` 风格的自实现）
- **音效**: Web Audio API（零依赖合成）
- **前端**: 纯 HTML/CSS/JS，零框架，零运行时依赖
- **安全**: `contextIsolation: true`, `nodeIntegration: false`, CSP 头

---

## 🎯 番茄工作法

> 番茄工作法（Pomodoro Technique）由 Francesco Cirillo 于 1980 年代创立。

1. **选择一个任务** — 决定你要做什么
2. **设置 25 分钟** — 一个「番茄」的默认时长
3. **专注工作** — 直到计时器响起，中途不分心
4. **短休息 5 分钟** — 离开座位，放松大脑
5. **每 4 个番茄** — 进行一次长休息（15-30 分钟）

---

## 📄 许可

MIT License © 2026

---

<p align="center">
  <sub>Made with 🍅 and ☕</sub>
</p>
