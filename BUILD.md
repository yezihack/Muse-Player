# Muse Player 打包说明

## 应用名称配置

应用已配置为 **Muse Player**

- **产品名称**: Muse Player
- **应用ID**: com.muse.player
- **窗口标题**: Muse Player

## 菜单配置

已移除不相关的菜单项，保留以下菜单：

### 文件菜单
- 添加文件夹 (Ctrl+O)
- 导入音乐 (Ctrl+I)
- 退出 (Alt+F4)

### 播放菜单
- 播放/暂停 (Space)
- 上一曲 (P)
- 下一曲 (N)
- 后退15秒 (←)
- 前进15秒 (→)

### 视图菜单
- 重新加载 (Ctrl+R)
- 开发者工具 (F12)

### 帮助菜单
- 关于

## 打包步骤

### 1. 安装依赖

```bash
npm install
```

这会安装 electron-builder 打包工具。

### 2. 打包方式

#### 方式一：同时生成安装包和绿色版（推荐）

```bash
npm run dist:win
```

这会在 `dist` 目录生成：
- **安装包**: `Muse Player Setup 1.0.0.exe` - 标准安装程序
- **绿色版**: `Muse Player-1.0.0-portable.exe` - 免安装版本

#### 方式二：仅测试打包（不生成安装程序）

```bash
npm run pack
```

这会生成未打包的文件夹，用于测试。

### 3. 输出文件说明

打包完成后，在 `dist` 目录会生成：

```
dist/
  ├── Muse Player Setup 1.0.0.exe      # 安装程序（NSIS）
  │   - 约 80-150 MB
  │   - 支持选择安装路径
  │   - 创建桌面快捷方式
  │   - 创建开始菜单项
  │
  └── Muse Player-1.0.0-portable.exe   # 绿色版（免安装）
      - 约 80-150 MB
      - 双击即可运行
      - 数据保存在用户目录
```

## 安装包特性

### NSIS 安装包
- ✅ 非一键安装（可自定义安装路径）
- ✅ 创建桌面快捷方式
- ✅ 创建开始菜单快捷方式
- ✅ 标准的安装/卸载流程

### Portable 绿色版
- ✅ 单个可执行文件
- ✅ 无需安装，双击运行
- ✅ 适合U盘携带使用
- ℹ️ 数据库文件保存在 `%APPDATA%\Roaming\muse-desktop\`

## 自定义配置

如需修改应用名称或配置，编辑 `package.json` 中的 `build` 部分：

```json
{
  "build": {
    "appId": "com.muse.player",      // 应用ID
    "productName": "Muse Player",     // 产品名称
    ...
  }
}
```

## 图标

应用使用 `icon.png` 作为图标。如需使用 `.ico` 格式：

1. 准备一个 256x256 的 PNG 图片
2. 使用在线工具转换为 .ico 格式
3. 保存为 `icon.ico`
4. package.json 已配置使用 icon.ico

## 常见问题

### 打包失败
- 确保已安装 `npm install`
- 确保网络畅通（electron-builder 需要下载依赖）
- Windows 需要安装 .NET Framework

### 打包太慢
- 首次打包需要下载 Electron 二进制文件（约 100MB）
- 后续打包会使用缓存，速度会快很多

### 文件太大
- 这是正常的，包含了完整的 Electron 运行环境
- 安装后占用空间约 150-200 MB

## 运行测试

打包前建议先测试：

```bash
npm start
```

开发模式（带开发者工具）：

```bash
npm run dev
```

## git workflow

```sh
# 1. 删除本地标签
git tag -d v1.0.0

# 2. 删除远程标签
git push origin :refs/tags/v1.0.0

# 3. 重新创建标签
git tag v1.0.0

# 4. 推送新标签
git push origin v1.0.0
```

## 自动生成图标

```sh
# 1. 安装依赖
npm install --save-dev electron-icon-maker

# 2. 在 package.json 添加脚本
"scripts": {
  "build-icons": "electron-icon-maker --input=./source-icon.png --output=./"
}

# 3. 准备一个 1024x1024 的源图标 source-icon.png
# 4. 运行
npm run build-icons
```