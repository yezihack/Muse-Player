# Muse Desktop - 桌面音乐播放器

一个功能丰富的桌面音乐播放器，基于 Electron + SQLite 构建。

## ✨ 功能特性

### 核心功能
- 🎵 **多格式支持**: MP3, WAV, OGG, FLAC, M4A, AAC
- 📊 **音频可视化**: 频谱、波形、径向三种可视化效果
- 💾 **SQLite 数据库**: 持久化存储播放记录、收藏、统计数据
- 📁 **文件夹管理**: 支持添加和管理多个音乐文件夹

### 播放功能
- 🔁 **多种播放模式**:
  - 列表循环 (List Loop)
  - 单曲循环 (Single Loop)
  - 随机播放 (Shuffle)
  - 尝鲜模式 (Taste Mode) - 随机播放歌曲高潮片段20秒

- 🎚️ **音量控制**: 
  - 滑动条调节音量
  - 一键静音/恢复
  - 图标根据音量自动切换

- 🔄 **AB循环**: 
  - 设置A、B两点
  - 自动循环播放指定区间

- ⏱️ **倒计时停止**: 
  - 预设10/20/30/60分钟
  - 倒计时结束自动暂停

- ⏩ **快速跳转**: 
  - 前进/后退15秒
  - 精确进度条控制

### 数据统计
- 📈 **播放统计**: 记录每首歌的播放次数
- ❤️ **收藏功能**: 标记喜欢的歌曲
- 🕐 **最后播放**: 记录最近播放时间

### ⌨️ 键盘快捷键

| 快捷键 | 功能 |
|--------|------|
| `Space` | 播放/暂停 |
| `←` | 后退15秒 |
| `→` | 前进15秒 |
| `↑` | 音量+5% |
| `↓` | 音量-5% |
| `A` | 设置A点 |
| `B` | 设置B点 |
| `P` | 上一曲 |
| `N` | 下一曲 |
| `T` | 打开/关闭倒计时 |
| `M` | 静音/取消静音 |

## 🚀 安装和运行

### 1. 安装依赖

```bash
npm install
```

### 2. 运行开发模式

```bash
npm run dev
```

### 3. 运行生产模式

```bash
npm start
```

## 📦 打包分发

### 本地打包

```bash
npm run dist:win
```

### GitHub Actions 自动发布

1. **更新版本号**：修改 `package.json` 中的 `version`
2. **提交更改**：
   ```bash
   git add .
   git commit -m "Release v1.0.1"
   ```
3. **创建并推送标签**：
   ```bash
   git tag v1.0.1
   git push origin v1.0.1
   ```
4. GitHub Actions 会自动：
   - 构建 Windows 安装包（NSIS）
   - 构建绿色版（Portable）
   - 构建 ZIP 压缩包
   - 发布到 GitHub Releases

### 手动触发构建

在 GitHub 仓库的 **Actions** 标签页，选择 "Build and Release" 工作流，点击 "Run workflow"。

## 🗂️ 项目结构

```
MusicLocal/
├── main.js           # Electron 主进程
├── index.html        # 应用界面和逻辑
├── package.json      # 项目配置
└── README.md         # 说明文档
```

## 💾 数据存储

应用数据存储在系统的用户数据目录：

- **Windows**: `%APPDATA%/muse-desktop/muse.db`
- **macOS**: `~/Library/Application Support/muse-desktop/muse.db`
- **Linux**: `~/.config/muse-desktop/muse.db`

### 数据库表结构

**tracks** - 音乐轨道
- id, name, path, folder_id
- plays (播放次数)
- loved (收藏状态)
- created_at, last_played

**folders** - 文件夹
- id, name, path, created_at

**settings** - 设置
- key, value

## 🎨 界面特点

- 🌌 渐变玻璃态设计
- 🌈 紫色主题配色
- 💫 流畅动画效果
- 📱 响应式布局

## 🛠️ 技术栈

- **Electron**: 桌面应用框架
- **better-sqlite3**: SQLite 数据库
- **Web Audio API**: 音频处理和可视化
- **Font Awesome**: 图标库

## ⚠️ 注意事项

1. 首次运行时，数据库会自动创建
2. 音频文件路径使用绝对路径存储
3. 浏览器模式下部分功能（文件夹管理）不可用
4. 支持拖拽文件到窗口导入（开发中）

## 📝 更新日志

### v1.0.0
- ✅ 基础播放功能
- ✅ SQLite 数据库集成
- ✅ 音量控制
- ✅ AB循环
- ✅ 15秒前进/后退
- ✅ 倒计时停止
- ✅ 键盘快捷键
- ✅ 文件夹管理

## 📄 许可证

MIT License
