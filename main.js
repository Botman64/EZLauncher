const { app, BrowserWindow, ipcMain } = require('electron');
const fs = require('fs');
const path = require('path');

let FiveM;
try {
  FiveM = require("fivem-server-api");
} catch (error) {
  console.error("Failed to load fivem-server-api module:", error.message);
  FiveM = {
    getServerStatus: () => Promise.reject(new Error("Module not loaded")),
    getPlayers: () => Promise.reject(new Error("Module not loaded")),
    getMaxPlayers: () => Promise.reject(new Error("Module not loaded")),
    getServer: () => Promise.reject(new Error("Module not loaded"))
  };
}

function getIconPath() {
  let iconPath = path.join(__dirname, 'assets', 'icon.ico');
  if (!fs.existsSync(iconPath)) {
    iconPath = path.join(process.resourcesPath, 'assets', 'icon.ico');
    if (!fs.existsSync(iconPath)) {
      iconPath = null;
    }
  }
  return iconPath;
}

let config;
try {
  const configPath = path.join(__dirname, 'config.json');
  const configData = fs.readFileSync(configPath, 'utf-8');
  const configCleaned = configData.replace(/\\"|"(?:\\"|[^"])*"|(\/\/.*|\/\*[\s\S]*?\*\/)/g, (m, g) => g ? "" : m);
  config = JSON.parse(configCleaned);
} catch (error) {
  console.error("Failed to load config:", error.message);
  config = {
    title: "EZLauncher",
    serverIP: "localhost",
    serverPort: "30120",
    exeName: "EZLauncher",
    statsRefreshInterval: 10000
  };
}

const server = new FiveM(`${config.serverIP}:${config.serverPort}`);

let mainWindow;
let serverStatus = 'Starting';

function createWindow() {
  const iconPath = getIconPath();
  if (iconPath) {
    try {
      app.getFileIcon = () => iconPath;
    } catch (e) {
      console.error("Failed to set app icon:", e);
    }
  }

  mainWindow = new BrowserWindow({
    width: 800,
    height: 450,
    frame: false,
    transparent: true,
    resizable: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
    titleBarStyle: 'hidden',
    title: config.exeName || 'FiveM Server Launcher',
    icon: iconPath
  });

  // Set app name to match the exeName from config
  if (config.exeName) {
    app.setName(config.exeName);
  }

  if (process.platform === 'win32' && iconPath) mainWindow.setIcon(iconPath);

  ipcMain.handle('getConfig', () => config);

  ipcMain.handle('getServerStats', async () => {
    try {
      const stats = await fetchServerStats();

      if (serverStatus === 'Offline') {
        return {
          currentPlayers: 0,
          maxPlayers: 0,
          status: serverStatus
        };
      }

      const playerCount = Array.isArray(stats.players) ? stats.players.length : 0;
      return {
        currentPlayers: playerCount,
        maxPlayers: stats.svMaxclients || 0,
        status: serverStatus
      };
    } catch (error) {
      console.error('Error fetching server stats:', error);
      return {
        currentPlayers: 0,
        maxPlayers: 0,
        status: 'Offline'
      };
    }
  });

  ipcMain.on('minimize-window', () => {
    if (mainWindow) {
      mainWindow.minimize();
    }
  });

  ipcMain.on('close-window', () => {
    if (mainWindow) {
      mainWindow.close();
    }
  });

    mainWindow.loadFile('web/index.html');
}

function fetchServerStats() {
  return new Promise(async (resolve, reject) => {
    try {
      let players = [];
      let maxPlayers = 0;

      try {
        serverStatus = 'Offline';

        await server.getServerStatus()
          .then((status) => {
            serverStatus = 'Online';
          })
          .catch(err => {
            throw err;
          });

        if (serverStatus === 'Online') {
          try {
            players = await server.getPlayers() || [];
            if (typeof players === 'number') {
              players = Array(players).fill({});
            }
            maxPlayers = await server.getMaxPlayers() || 0;
          } catch (apiErr) {
            serverStatus = 'Offline';
            players = [];
            maxPlayers = 0;
          }
        }
      } catch (err) {
        serverStatus = 'Offline';
        players = [];
        maxPlayers = 0;
      }

      if (serverStatus === 'Offline') {
        resolve({
          players: [],
          svMaxclients: 0
        });
      } else {
        resolve({
          players: Array.isArray(players) ? players : [],
          svMaxclients: maxPlayers || 0
        });
      }
    } catch (error) {
      serverStatus = 'Offline';
      resolve({
        players: [],
        svMaxclients: 0
      });
    }
  });
}

function checkServerStatus() {
  server.getServerStatus()
    .then(() => {
      serverStatus = 'Online';
    })
    .catch((err) => {
      serverStatus = 'Offline';
    });
}

checkServerStatus();

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
