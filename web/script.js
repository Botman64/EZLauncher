const { ipcRenderer } = require('electron');
let statsInterval;
let refreshInterval = 10000;

async function loadConfig() {
  const config = await ipcRenderer.invoke('getConfig');

  refreshInterval = config.statsRefreshInterval || 10000;

  const startColor = config.backgroundGradient?.enabled ? config.backgroundGradient.startColor : "transparent";
  const endColor = config.backgroundGradient?.enabled ? config.backgroundGradient.endColor : config.backgroundColor;

  const bottomContainer = document.getElementById('bottom-container');
  if (config.backgroundGradient?.enabled) {
    const gradientDirection = config.backgroundGradient.angle === 180 ? 'to bottom' :
      config.backgroundGradient.angle === 90 ? 'to right' :
        config.backgroundGradient.angle === 270 ? 'to left' :
          config.backgroundGradient.angle === 0 ? 'to top' :
            `${config.backgroundGradient.angle}deg`;

    bottomContainer.style.background = `linear-gradient(${gradientDirection}, ${startColor}, ${endColor})`;
  } else {
    bottomContainer.style.backgroundColor = endColor;
  }

  const container = document.getElementById('container');
  container.style.background = 'transparent';

  document.documentElement.style.setProperty('--background-gradient-start', startColor);
  document.documentElement.style.setProperty('--background-gradient-end', endColor);
  document.documentElement.style.setProperty('--background-color', "transparent");

  document.documentElement.style.setProperty('--header-bar-color', config.headerBarColor);
  document.documentElement.style.setProperty('--header-button-color', config.headerButtonColor);
  document.documentElement.style.setProperty('--header-button-hover-color', config.headerButtonHoverColor);
  document.documentElement.style.setProperty('--header-button-active-color', config.headerButtonActiveColor);
  document.documentElement.style.setProperty('--city-button-color', config.cityButtonColor);
  document.documentElement.style.setProperty('--city-button-hover-color', config.cityButtonHoverColor);
  document.documentElement.style.setProperty('--city-button-active-color', config.cityButtonActiveColor);
  document.documentElement.style.setProperty('--discord-button-color', config.discordButtonColor);
  document.documentElement.style.setProperty('--discord-button-hover-color', config.discordButtonHoverColor);
  document.documentElement.style.setProperty('--discord-button-active-color', config.discordButtonActiveColor);

  document.documentElement.style.setProperty('--stat-item-background-color', config.statItemBackgroundColor || 'rgba(0, 0, 0, 0.2)');
  document.documentElement.style.setProperty('--text-color', config.textColor || '#ffffff');
  document.documentElement.style.setProperty('--secondary-text-color', config.secondaryTextColor || 'rgba(255, 255, 255, 0.8)');
  document.documentElement.style.setProperty('--border-color', config.borderColor || config.headerBarColor);
  document.documentElement.style.setProperty('--border-radius', config.borderRadius || '25px');

  document.documentElement.style.setProperty('--title-font-size', config.titleFontSize || '1.5rem');
  document.documentElement.style.setProperty('--title-color', config.titleColor || config.textColor || '#ffffff');
  document.documentElement.style.setProperty('--button-border-radius', config.buttonBorderRadius || '5px');
  document.documentElement.style.setProperty('--button-text-color', config.buttonTextColor || '#ffffff');
  document.documentElement.style.setProperty('--button-font-weight', config.buttonFontWeight || 'bold');
  document.documentElement.style.setProperty('--stat-item-border-radius', config.statItemBorderRadius || '5px');
  document.documentElement.style.setProperty('--stat-label-font-size', config.statLabelFontSize || '0.8rem');
  document.documentElement.style.setProperty('--stat-value-font-size', config.statValueFontSize || '1.1rem');
  document.documentElement.style.setProperty('--stat-value-font-weight', config.statValueFontWeight || 'bold');
  document.documentElement.style.setProperty('--status-online-color', config.statusOnlineColor || '#4caf50');
  document.documentElement.style.setProperty('--status-offline-color', config.statusOfflineColor || '#f44336');
  document.documentElement.style.setProperty('--status-starting-color', config.statusStartingColor || '#ff9800');
  document.documentElement.style.setProperty('--header-bar-height', config.headerBarHeight || '30px');
  document.documentElement.style.setProperty('--header-button-font-weight', config.headerButtonFontWeight || 'bold');

  document.getElementById('title').innerText = config.title;
  document.getElementById('left-slot').style.backgroundImage = `url(../${config.leftImage})`;
  document.getElementById('right-slot').style.backgroundImage = `url(../${config.rightImage})`;
  document.getElementById('center-image').src = `../${config.centerLogo}`;
  document.getElementById('join-city').innerText = config.joinCityText;
  document.getElementById('join-discord').innerText = config.joinDiscordText;

  document.getElementById('join-city').onclick = () => {
    require('electron').shell.openExternal(config.fivemConnectUrl);
  };

  document.getElementById('join-discord').onclick = () => {
    require('electron').shell.openExternal(config.joinDiscordUrl);
  };

  updateServerStats();
  if (statsInterval) clearInterval(statsInterval);
  statsInterval = setInterval(updateServerStats, refreshInterval);
}

async function updateServerStats() {
  try {
    const stats = await ipcRenderer.invoke('getServerStats');
    if (stats.maxPlayers === 'Error Occurred') stats.status = 'Offline';

    const statusElement = document.getElementById('server-status');
    statusElement.innerText = stats.status;

    if (stats.status === 'Offline' || stats.status !== 'Online') {
      document.getElementById('player-count').innerText = '0/0';
    } else {
      document.getElementById('player-count').innerText = `${stats.currentPlayers}/${(stats.maxPlayers === 'Error Occurred') ? '0' : stats.maxPlayers}`;
    }

    statusElement.classList.remove('status-online', 'status-offline', 'status-starting');

    if (stats.status === 'Online') {
      statusElement.classList.add('status-online');
    } else if (stats.status === 'Starting') {
      statusElement.classList.add('status-starting');
    } else {
      statusElement.classList.add('status-offline');
    }
  } catch (error) {
    console.error('Failed to update server stats:', error);

    document.getElementById('player-count').innerText = '0/0';

    const statusElement = document.getElementById('server-status');
    statusElement.innerText = 'Offline';
    statusElement.classList.remove('status-online', 'status-starting');
    statusElement.classList.add('status-offline');
  }
}

function minimize() {
  ipcRenderer.send('minimize-window');
}

function closeApp() {
  ipcRenderer.send('close-window');
}

// Clean up interval when window is unloaded
window.addEventListener('beforeunload', () => {
  if (statsInterval) {
    clearInterval(statsInterval);
  }
});

loadConfig();