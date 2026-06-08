const fs = require('fs');
const path = require('path');

const fixRegionsInFile = (filePath, fieldName) => {
  let content = fs.readFileSync(filePath, 'utf-8');
  
  content = content.replace(/region:\s*['"]华东区['"]/g, `region: '亚太'`);
  content = content.replace(/region:\s*['"]华南区['"]/g, `region: '亚太'`);
  content = content.replace(/region:\s*['"]华北区['"]/g, `region: '亚太'`);
  content = content.replace(/region:\s*['"]华中区['"]/g, `region: '亚太'`);
  content = content.replace(/region:\s*['"]西南区['"]/g, `region: '亚太'`);
  content = content.replace(/region:\s*['"]西北区['"]/g, `region: '亚太'`);
  content = content.replace(/region:\s*['"]东北区['"]/g, `region: '亚太'`);
  
  fs.writeFileSync(filePath, content);
  console.log(`${filePath} fixed successfully!`);
};

fixRegionsInFile(path.join(__dirname, 'src/mock/data/inquiries.ts'));
fixRegionsInFile(path.join(__dirname, 'src/mock/data/orders.ts'));
