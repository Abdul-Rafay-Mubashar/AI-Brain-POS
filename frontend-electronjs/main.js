const { app, BrowserWindow, session } = require("electron");
const path = require("path");

app.commandLine.appendSwitch('disable-renderer-backgrounding');
app.commandLine.appendSwitch('disable-background-timer-throttling');
app.commandLine.appendSwitch('disable-backgrounding-occluded-windows');

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false
    },
    icon: path.join(__dirname, 'public/favicon.ico')
  });

  win.on('focus', () => {
    win.webContents.focus();
  });


  win.loadFile(path.join(__dirname, "build", "index.html"));
}

app.whenReady().then(() => {
  session.defaultSession.setPermissionRequestHandler((wc, permission, callback) => {
    if (permission === "media" || permission === "camera" || permission === "microphone") {
      callback(true);
    } else {
      callback(false);
    }
  });

  createWindow();
});