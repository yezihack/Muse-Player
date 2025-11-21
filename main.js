const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const initSqlJs = require('sql.js');
const { Menu } = require('electron');

let mainWindow;
let db;
let SQL;

// 初始化数据库
async function initDatabase() {
  const dbPath = path.join(app.getPath('userData'), 'muse.db');
  
  // 初始化 sql.js
  SQL = await initSqlJs();
  
  // 检查数据库文件是否存在
  let buffer;
  if (fs.existsSync(dbPath)) {
    buffer = fs.readFileSync(dbPath);
    db = new SQL.Database(buffer);
  } else {
    db = new SQL.Database();
  }
  
  // 创建表结构
  db.run(`
    CREATE TABLE IF NOT EXISTS tracks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      path TEXT NOT NULL,
      folder_id INTEGER,
      plays INTEGER DEFAULT 0,
      loved INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      last_played DATETIME
    )
  `);
  
  db.run(`
    CREATE TABLE IF NOT EXISTS folders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      path TEXT NOT NULL UNIQUE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
  
  db.run(`
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT
    )
  `);
  
  // 保存数据库
  saveDatabase(dbPath);
  
  console.log('Database initialized at:', dbPath);
}

// 保存数据库到文件
function saveDatabase(dbPath) {
  if (!dbPath) dbPath = path.join(app.getPath('userData'), 'muse.db');
  const data = db.export();
  const buffer = Buffer.from(data);
  fs.writeFileSync(dbPath, buffer);
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true
    },
    backgroundColor: '#0f0c29',
    frame: true,
    icon: path.join(__dirname, 'icon.png'),
    title: 'Muse Player'
  });

  mainWindow.loadFile('index.html');
  
  // 窗口关闭前保存播放状态
  mainWindow.on('close', () => {
    mainWindow.webContents.send('save-play-state');
  });
  
  // 创建自定义菜单
  const menuTemplate = [
    {
      label: '文件',
      submenu: [
        {
          label: '添加文件夹',
          accelerator: 'CmdOrCtrl+O',
          click: () => {
            mainWindow.webContents.send('trigger-add-folder');
          }
        },
        {
          label: '导入音乐',
          accelerator: 'CmdOrCtrl+I',
          click: () => {
            mainWindow.webContents.send('trigger-import-files');
          }
        },
        { type: 'separator' },
        {
          label: '退出',
          accelerator: 'Alt+F4',
          click: () => {
            app.quit();
          }
        }
      ]
    },
    {
      label: '播放',
      submenu: [
        {
          label: '播放/暂停',
          accelerator: 'Space',
          click: () => {
            mainWindow.webContents.send('trigger-play-pause');
          }
        },
        {
          label: '上一曲',
          accelerator: 'P',
          click: () => {
            mainWindow.webContents.send('trigger-prev');
          }
        },
        {
          label: '下一曲',
          accelerator: 'N',
          click: () => {
            mainWindow.webContents.send('trigger-next');
          }
        },
        { type: 'separator' },
        {
          label: '后退15秒',
          accelerator: 'Left',
          click: () => {
            mainWindow.webContents.send('trigger-rewind');
          }
        },
        {
          label: '前进15秒',
          accelerator: 'Right',
          click: () => {
            mainWindow.webContents.send('trigger-forward');
          }
        }
      ]
    },
    {
      label: '视图',
      submenu: [
        {
          label: '重新加载',
          accelerator: 'CmdOrCtrl+R',
          click: () => {
            mainWindow.reload();
          }
        },
        {
          label: '开发者工具',
          accelerator: 'F12',
          click: () => {
            mainWindow.webContents.openDevTools();
          }
        }
      ]
    },
    {
      label: '帮助',
      submenu: [
        {
          label: '关于',
          click: () => {
            dialog.showMessageBox(mainWindow, {
              type: 'info',
              title: '关于 Muse Player',
              message: 'Muse Player v1.0.0',
              detail: '一个简洁优雅的桌面音乐播放器\n\n功能特性：\n• 音量控制\n• AB循环\n• 倒计时停止\n• 文件夹管理\n• 收藏功能\n• 键盘快捷键',
              buttons: ['确定']
            });
          }
        }
      ]
    }
  ];
  
  const menu = Menu.buildFromTemplate(menuTemplate);
  Menu.setApplicationMenu(menu);
  
  // 开发模式下打开 DevTools
  if (process.argv.includes('--dev')) {
    mainWindow.webContents.openDevTools();
  }
}

app.whenReady().then(async () => {
  await initDatabase();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    saveDatabase();
    app.quit();
  }
});

// 在应用退出前保存播放状态
app.on('before-quit', () => {
  saveDatabase();
});

// IPC 处理器
ipcMain.handle('db:getTrack', (event, name) => {
  const stmt = db.prepare('SELECT * FROM tracks WHERE name = ?');
  stmt.bind([name]);
  const result = stmt.step() ? stmt.getAsObject() : { plays: 0, loved: 0 };
  stmt.free();
  return result;
});

ipcMain.handle('db:saveTrack', (event, name, path, folderId) => {
  db.run(`
    INSERT INTO tracks (name, path, folder_id, plays, loved) 
    VALUES (?, ?, ?, 0, 0)
    ON CONFLICT(name) DO UPDATE SET 
      path = ?,
      folder_id = ?
  `, [name, path, folderId, path, folderId]);
  saveDatabase();
  return true;
});

ipcMain.handle('db:updatePlays', (event, name, path) => {
  db.run(`
    INSERT INTO tracks (name, path, plays, last_played) 
    VALUES (?, ?, 1, CURRENT_TIMESTAMP)
    ON CONFLICT(name) DO UPDATE SET 
      plays = plays + 1,
      last_played = CURRENT_TIMESTAMP
  `, [name, path]);
  saveDatabase();
  return true;
});

ipcMain.handle('db:toggleLove', (event, name, path) => {
  const stmt = db.prepare('SELECT loved FROM tracks WHERE name = ?');
  stmt.bind([name]);
  const track = stmt.step() ? stmt.getAsObject() : null;
  stmt.free();
  
  const newLoved = track ? (track.loved === 1 ? 0 : 1) : 1;
  
  db.run(`
    INSERT INTO tracks (name, path, loved) 
    VALUES (?, ?, ?)
    ON CONFLICT(name) DO UPDATE SET loved = ?
  `, [name, path, newLoved, newLoved]);
  
  saveDatabase();
  return newLoved === 1;
});

ipcMain.handle('db:getAllTracks', () => {
  const stmt = db.prepare('SELECT * FROM tracks ORDER BY last_played DESC');
  const results = [];
  while (stmt.step()) {
    results.push(stmt.getAsObject());
  }
  stmt.free();
  return results;
});

ipcMain.handle('db:getTracksByFolder', (event, folderId) => {
  const stmt = db.prepare('SELECT * FROM tracks WHERE folder_id = ? ORDER BY name');
  stmt.bind([folderId]);
  const results = [];
  while (stmt.step()) {
    results.push(stmt.getAsObject());
  }
  stmt.free();
  return results;
});

ipcMain.handle('db:addFolder', (event, folderPath) => {
  const folderName = path.basename(folderPath);
  try {
    db.run(`
      INSERT INTO folders (name, path) VALUES (?, ?)
      ON CONFLICT(path) DO NOTHING
    `, [folderName, folderPath]);
    saveDatabase();
    
    // 返回新添加的文件夹ID
    const stmt = db.prepare('SELECT id FROM folders WHERE path = ?');
    stmt.bind([folderPath]);
    const result = stmt.step() ? stmt.getAsObject() : null;
    stmt.free();
    
    return { success: true, folderId: result ? result.id : null };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

ipcMain.handle('db:getFolders', () => {
  const stmt = db.prepare('SELECT * FROM folders ORDER BY created_at DESC');
  const results = [];
  while (stmt.step()) {
    results.push(stmt.getAsObject());
  }
  stmt.free();
  return results;
});

// 删除文件夹
ipcMain.handle('db:deleteFolder', (event, folderId) => {
  try {
    // 删除文件夹关联的歌曲
    db.run('DELETE FROM tracks WHERE folder_id = ?', [folderId]);
    // 删除文件夹
    db.run('DELETE FROM folders WHERE id = ?', [folderId]);
    saveDatabase();
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

ipcMain.handle('dialog:openFolder', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory']
  });
  return result.filePaths[0];
});

ipcMain.handle('dialog:openFiles', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openFile', 'multiSelections'],
    filters: [
      { name: 'Audio Files', extensions: ['mp3', 'wav', 'ogg', 'flac', 'm4a', 'aac', 'wma', 'mp4', 'webm'] }
    ]
  });
  return result.filePaths;
});

// 扫描文件夹中的音乐文件
ipcMain.handle('folder:scanMusic', async (event, folderPath) => {
  const audioExtensions = ['.mp3', '.wav', '.ogg', '.flac', '.m4a', '.aac', '.wma', '.mp4', '.webm'];
  const musicFiles = [];
  
  function scanDirectory(dirPath) {
    try {
      const files = fs.readdirSync(dirPath);
      
      for (const file of files) {
        const fullPath = path.join(dirPath, file);
        try {
          const stat = fs.statSync(fullPath);
          
          if (stat.isDirectory()) {
            // 递归扫描子文件夹
            scanDirectory(fullPath);
          } else if (stat.isFile()) {
            const ext = path.extname(file).toLowerCase();
            if (audioExtensions.includes(ext)) {
              musicFiles.push({
                path: fullPath,
                name: path.basename(file, ext)
              });
            }
          }
        } catch (err) {
          console.error(`Error processing ${fullPath}:`, err.message);
        }
      }
    } catch (err) {
      console.error(`Error reading directory ${dirPath}:`, err.message);
    }
  }
  
  scanDirectory(folderPath);
  return musicFiles;
});

ipcMain.handle('db:saveSetting', (event, key, value) => {
  db.run(`
    INSERT INTO settings (key, value) VALUES (?, ?)
    ON CONFLICT(key) DO UPDATE SET value = ?
  `, [key, value, value]);
  saveDatabase();
  return true;
});

ipcMain.handle('db:getSetting', (event, key) => {
  const stmt = db.prepare('SELECT value FROM settings WHERE key = ?');
  stmt.bind([key]);
  const result = stmt.step() ? stmt.getAsObject() : null;
  stmt.free();
  return result ? result.value : null;
});

// 保存播放状态
ipcMain.handle('db:savePlayState', (event, state) => {
  const stmt = db.prepare(`
    INSERT INTO settings (key, value) VALUES ('playState', ?)
    ON CONFLICT(key) DO UPDATE SET value = ?
  `);
  const stateJson = JSON.stringify(state);
  stmt.run(stateJson, stateJson);
  saveDatabase();
  return true;
});

// 获取播放状态
ipcMain.handle('db:getPlayState', () => {
  const stmt = db.prepare('SELECT value FROM settings WHERE key = ?');
  stmt.bind(['playState']);
  const result = stmt.step() ? stmt.getAsObject() : null;
  stmt.free();
  if(result && result.value) {
    try {
      return JSON.parse(result.value);
    } catch(e) {
      return null;
    }
  }
  return null;
});
