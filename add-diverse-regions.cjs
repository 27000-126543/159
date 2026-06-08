const fs = require('fs');
const path = require('path');

const addDiverseRegions = (filePath) => {
  let content = fs.readFileSync(filePath, 'utf-8');
  
  const lines = content.split('\n');
  let regionCount = 0;
  const regions = ['亚太', '亚太', '亚太', '欧洲', '北美'];
  
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes("region: '亚太'")) {
      const regionIndex = regionCount % regions.length;
      if (regionIndex >= 3) {
        lines[i] = lines[i].replace("region: '亚太'", `region: '${regions[regionIndex]}'`);
      }
      regionCount++;
    }
  }
  
  fs.writeFileSync(filePath, lines.join('\n'));
  console.log(`${filePath}: Modified ${Math.floor(regionCount * 0.4)} entries to have diverse regions`);
};

addDiverseRegions(path.join(__dirname, 'src/mock/data/inquiries.ts'));
addDiverseRegions(path.join(__dirname, 'src/mock/data/orders.ts'));
