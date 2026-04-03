const { app, BrowserWindow, Menu } = require('electron');
const http = require('http');
const fs = require('fs');
const path = require('path');

const HOST = '127.0.0.1';
const PORT = 3000;
const APP_DIR = path.join(__dirname, 'app');

let server;

function getContentType(filePath) {
  const extension = path.extname(filePath).toLowerCase();

  switch (extension) {
    case '.html':
      return 'text/html; charset=utf-8';
    case '.js':
      return 'application/javascript; charset=utf-8';
    case '.css':
      return 'text/css; charset=utf-8';
    case '.json':
      return 'application/json; charset=utf-8';
    case '.svg':
      return 'image/svg+xml';
    case '.png':
      return 'image/png';
    case '.jpg':
    case '.jpeg':
      return 'image/jpeg';
    case '.ico':
      return 'image/x-icon';
    default:
      return 'application/octet-stream';
  }
}

function safeJoin(baseDir, targetPath) {
  const normalized = path.normalize(targetPath).replace(/^(\.\.[/\\])+/, '');
  return path.join(baseDir, normalized);
}

function startStaticServer() {
  return new Promise((resolve, reject) => {
    server = http.createServer((request, response) => {
      const requestPath = request.url === '/' ? '/index.html' : request.url.split('?')[0];
      let filePath = safeJoin(APP_DIR, requestPath);

      if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
        filePath = path.join(APP_DIR, 'index.html');
      }

      fs.readFile(filePath, (error, content) => {
        if (error) {
          response.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
          response.end('Unable to load application files.');
          return;
        }

        response.writeHead(200, { 'Content-Type': getContentType(filePath) });
        response.end(content);
      });
    });

    server.once('error', reject);
    server.listen(PORT, HOST, () => resolve());
  });
}

async function createWindow() {
  await startStaticServer();

  const win = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1100,
    minHeight: 720,
    backgroundColor: '#f4f8ff',
    webPreferences: {
      contextIsolation: true,
      sandbox: true
    }
  });

  Menu.setApplicationMenu(null);
  await win.loadURL(`http://${HOST}:${PORT}`);
}

app.whenReady().then(createWindow).catch((error) => {
  console.error(error);
  app.quit();
});

app.on('window-all-closed', () => {
  if (server) {
    server.close();
  }

  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow().catch((error) => {
      console.error(error);
      app.quit();
    });
  }
});
