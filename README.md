# EZ Launcher

A customizable electron-based launcher for FiveM servers. This launcher provides server owners with an easy way to distribute a branded launcher application to their players.

![Launcher Preview](https://raw.githubusercontent.com/Botman64/EZLauncher/refs/heads/main/docs/peview.png)
<br>*EZLauncher Preview Image*

## Features

- Fully customizable user interface
- Real-time server status and player count
- Custom branding (colors, logos, images)
- One-click server connection
- Discord integration
- Transparent window with modern design
- Easy configuration through JSON

## Installation & Setup (For Server Owners)

### Requirements

- [Node.js](https://nodejs.org/) (version 14 or newer)
- Basic knowledge of JSON for configuration

### Setup Process

1. **Download the Source Code**
   - Clone or download this repository to your local machine

2. **Configure Your Launcher**
   - Open the `config.json` file in any text editor
   - Modify the settings according to your server's requirements (see Configuration Reference below)
   - At minimum, you should update:
     - `exeName`: The name of your executable (e.g., "YourServerLauncher")
     - `title`: The welcome text displayed to users
     - `fivemConnectUrl`: Your server's connection URL (e.g., "fivem://connect/serverIP:PORT" or you can use your connect url)
     - `joinDiscordUrl`: Your Discord server invitation link
     - `serverIP`: Your server's IP address or domain
     - `serverPort`: Your server's port (default: 30120)

3. **Add Custom Images**
   - Place your custom images in the `assets` folder:
     - `icon.ico`: Application icon (used for taskbar and exe)
     - `logo-template.png`: Center logo (16:9 aspect ratio recommended)
     - `left-new.png`: Left character/image (3:4 aspect ratio recommended)
     - `right-new.png`: Right character/image (3:4 aspect ratio recommended)

4. **Build the Launcher**
   - Simply run the `build.bat` file by double-clicking it
   - The build process will automatically:
     - Install all required dependencies
     - Configure the launcher with your settings
     - Create a placeholder icon if you didn't provide one
     - Build a portable executable with your chosen name
     - Package the source code (required for licensing)
     - Create a ZIP file containing both the executable and source code

5. **Distribute to Your Players**
   - Share the generated ZIP file (e.g., `YourServerLauncher.zip`) with your players
   - Players only need to extract and run the executable to connect

### Server Connection Settings

For the launcher to connect to your server properly, ensure these settings in `config.json` are correctly configured:

```json
{
  "serverIP": "your-server-ip-or-domain",
  "serverPort": "30120",
  "fivemConnectUrl": "fivem://connect/your-server-ip-or-domain:30120"
}
```

- `serverIP`: Can be an IP address (e.g., "123.45.67.89") or domain name (e.g., "play.yourserver.com")
- `serverPort`: Default FiveM port is 30120, change if your server uses a different port
- `fivemConnectUrl`: Must use the format `fivem://connect/address:port`

## Distribution Guidelines

When distributing your launcher to players:

1. **Use the Complete Package**
   - Distribute the ZIP file generated in the `dist` folder
   - This contains both the executable and source code (required for licensing compliance)

2. **Provide Clear Instructions**
   - Tell your players they only need to extract and run the .exe file
   - No installation is required
   - The launcher will automatically connect to your server when they click "Join City"

3. **Troubleshooting Info for Players**
   - If the launcher shows "Offline" status: The server might be down or unreachable
   - If connection fails: Ensure they have FiveM installed and properly configured
   - Window control: The launcher can be minimized or closed using the buttons in the top-right

## Configuration Reference

The `config.json` file allows for complete customization of your launcher:

| Setting | Description | Example Value |
|---------|-------------|---------------|
| `exeName` | Name of the executable file | `"MyServerLauncher"` |
| `title` | Welcome text displayed to users | `"Welcome to My Roleplay Server"` |
| `joinCityText` | Text for the server connection button | `"Join Server"` |
| `joinDiscordText` | Text for the Discord button | `"Join Discord"` |
| `fivemConnectUrl` | URL to connect to your FiveM server | `"fivem://connect/play.myserver.com:30120"` |
| `joinDiscordUrl` | URL to your Discord server | `"https://discord.gg/yourinvitecode"` |
| `leftImage` | Path to left side image | `"assets/left-new.png"` |
| `rightImage` | Path to right side image | `"assets/right-new.png"` |
| `centerLogo` | Path to center logo | `"assets/logo-template.png"` |
| `serverIP` | Server IP or domain for status checking | `"play.myserver.com"` |
| `serverPort` | Server port | `"30120"` |
| `maxPlayers` | Maximum players (fallback) | `64` |
| `enableServerStats` | Enable/disable server stats display | `true` |

### Visual Customization Settings

The launcher includes extensive color and styling options:

| Setting | Description | Example Value |
|---------|-------------|---------------|
| `backgroundColor` | Main background color | `"transparent"` |
| `backgroundGradient.enabled` | Enable gradient background | `true` |
| `backgroundGradient.startColor` | Gradient start color | `"#ffa600"` |
| `backgroundGradient.endColor` | Gradient end color | `"#23272a"` |
| `backgroundGradient.angle` | Gradient direction angle | `135` |
| `textColor` | Main text color | `"#ffffff"` |
| `secondaryTextColor` | Secondary text color | `"rgba(255, 255, 255, 0.8)"` |
| `borderColor` | Border color | `"#2c2f33"` |
| `borderRadius` | Border rounding | `"25px"` |
| `headerBarColor` | Header bar background color | `"#2c2f33"` |
| `cityButtonColor` | Server join button color | `"#5b5b5b"` |
| `discordButtonColor` | Discord button color | `"#5b5b5b"` |
| `statItemBackgroundColor` | Stats background color | `"rgba(44, 47, 51, 0.2)"` |

For a full list of customization options, refer to the complete `config.json` file.

## Advanced Usage

### Custom Development

If you want to modify the launcher beyond configuration:

1. Install dependencies: `npm install`
2. Start the development version: `npm start`
3. Make your code changes
4. Build a new version using `build.bat`

### Troubleshooting Build Issues

If you encounter issues during the build:

1. Make sure Node.js is properly installed (v14+ recommended)
2. The build script will attempt to clear and reinstall dependencies automatically
3. If the automatic build fails, try these manual steps:
   - Delete the `node_modules` folder and `package-lock.json`
   - Run `npm install`
   - Run `npm install --save-dev electron electron-builder`
   - Run `build.bat` again

## License and Attribution

This launcher is licensed under the Apache License 2.0 with an additional requirement that it must be distributed with its source code. When distributing to users, include both the executable and source code, which the `build.bat` script packages together automatically.

---

For support, create an issue on the GitHub repository
