const { app, BrowserWindow } = require('electron');
const path = require('path');
const { spawn } = require('child_process');

let mainWindow;
let serverProcess;

function startServer() {
  console.log('Launching local PC parts builder server...');
  // Spawn the server.ts using tsx (already installed in your project devDependencies)
  serverProcess = spawn('npx', ['tsx', 'server.ts'], {
    shell: true,
    env: { ...process.env, NODE_ENV: 'development' }
  });

  serverProcess.stdout.on('data', (data) => {
    console.log(`[Server stdout]: ${data}`);
  });

  serverProcess.stderr.on('data', (data) => {
    console.error(`[Server stderr]: ${data}`);
  });
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1300,
    height: 880,
    title: 'PC Parts Builder',
    icon: path.join(__dirname, 'public', 'favicon.ico'),
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    }
  });

  // Give the server 1.5 seconds to start up before loading the localhost page
  setTimeout(() => {
    mainWindow.loadURL('http://localhost:3000').catch((err) => {
      console.log('Server still loading, retrying in 1s...', err.message);
      setTimeout(() => {
        mainWindow.loadURL('http://localhost:3000');
      }, 1000);
    });
  }, 1500);

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  startServer();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (serverProcess) {
    serverProcess.kill('SIGINT');
  }
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
