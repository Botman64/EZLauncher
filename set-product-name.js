const fs = require('fs');
const path = require('path');

try {
  const configPath = path.join(__dirname, 'config.json');
  let exeName = 'EZLauncher';
  if (fs.existsSync(configPath)) {
    const configData = fs.readFileSync(configPath, 'utf-8');
    const configCleaned = configData.replace(/\\"|"(?:\\"|[^"])*"|(\/\/.*|\/\*[\s\S]*?\*\/)/g, (m, g) => g ? "" : m);
    const config = JSON.parse(configCleaned);
    console.log(config.exeName)
    if (config.exeName && typeof config.exeName === 'string' && config.exeName.trim()) {
      exeName = config.exeName.trim();
    }
  }

  const packagePath = path.join(__dirname, 'package.json');
  const packageData = JSON.parse(fs.readFileSync(packagePath, 'utf-8'));
  packageData.build.productName = exeName;
  packageData.build.win.artifactName = `${exeName}.exe`;
  fs.writeFileSync(packagePath, JSON.stringify(packageData, null, 2));

  fs.writeFileSync(
    path.join(__dirname, 'build-config.js'),
    `console.log('Building with product name: ${exeName}');\nmodule.exports = { productName: '${exeName}' };`
  );

  module.exports = { productName: exeName };
} catch (error) {
  console.error('Error in set-product-name.js:', error);
  module.exports = { productName: 'EZLauncher' };
}
