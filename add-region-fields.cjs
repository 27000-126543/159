const fs = require('fs');
const path = require('path');

const countryToRegion = {
  '中国': '亚太',
  '日本': '亚太',
  '韩国': '亚太',
  '新加坡': '亚太',
  '印度': '亚太',
  '澳大利亚': '亚太',
  '德国': '欧洲',
  '法国': '欧洲',
  '英国': '欧洲',
  '意大利': '欧洲',
  '西班牙': '欧洲',
  '荷兰': '欧洲',
  '瑞士': '欧洲',
  '瑞典': '欧洲',
  '美国': '北美',
  '加拿大': '北美',
  '墨西哥': '北美',
  '巴西': '南美',
  '阿根廷': '南美',
  '南非': '非洲',
  '埃及': '非洲',
};

const addressToRegion = (address) => {
  const lowerAddress = address.toLowerCase();
  if (lowerAddress.includes('上海') || lowerAddress.includes('北京') || lowerAddress.includes('深圳') ||
      lowerAddress.includes('广州') || lowerAddress.includes('杭州') || lowerAddress.includes('苏州') ||
      lowerAddress.includes('成都') || lowerAddress.includes('武汉') || lowerAddress.includes('西安') ||
      lowerAddress.includes('南京') || lowerAddress.includes('中国') || lowerAddress.includes('shanghai') ||
      lowerAddress.includes('beijing') || lowerAddress.includes('shenzhen') || lowerAddress.includes('china')) {
    return '亚太';
  }
  if (lowerAddress.includes('慕尼黑') || lowerAddress.includes('柏林') || lowerAddress.includes('德国') ||
      lowerAddress.includes('巴黎') || lowerAddress.includes('法国') || lowerAddress.includes('伦敦') ||
      lowerAddress.includes('英国') || lowerAddress.includes('米兰') || lowerAddress.includes('意大利') ||
      lowerAddress.includes('慕尼黑') || lowerAddress.includes('germany') || lowerAddress.includes('france') ||
      lowerAddress.includes('uk') || lowerAddress.includes('london') || lowerAddress.includes('paris')) {
    return '欧洲';
  }
  if (lowerAddress.includes('波士顿') || lowerAddress.includes('纽约') || lowerAddress.includes('美国') ||
      lowerAddress.includes('洛杉矶') || lowerAddress.includes('旧金山') || lowerAddress.includes('boston') ||
      lowerAddress.includes('new york') || lowerAddress.includes('usa') || lowerAddress.includes('us')) {
    return '北美';
  }
  if (lowerAddress.includes('东京') || lowerAddress.includes('日本') || lowerAddress.includes('首尔') ||
      lowerAddress.includes('韩国') || lowerAddress.includes('singapore') || lowerAddress.includes('日本')) {
    return '亚太';
  }
  return '亚太';
};

const processInquiries = () => {
  const filePath = path.join(__dirname, 'src/mock/data/inquiries.ts');
  let content = fs.readFileSync(filePath, 'utf-8');
  
  const lines = content.split('\n');
  const result = [];
  let inArray = false;
  let objectStart = -1;
  let braceCount = 0;
  let currentObject = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    if (line.includes('export const inquiries: Inquiry[] = [')) {
      inArray = true;
      result.push(line);
      continue;
    }
    
    if (!inArray) {
      result.push(line);
      continue;
    }
    
    if (line.trim() === '{' && objectStart === -1) {
      objectStart = i;
      braceCount = 1;
      currentObject = [line];
      continue;
    }
    
    if (objectStart !== -1) {
      currentObject.push(line);
      if (line.includes('{')) braceCount++;
      if (line.includes('}')) braceCount--;
      
      if (braceCount === 0) {
        let hasRegion = false;
        let deliveryAddress = '';
        let subCategoryLine = -1;
        
        for (let j = 0; j < currentObject.length; j++) {
          const objLine = currentObject[j];
          if (objLine.includes('region:')) hasRegion = true;
          if (objLine.includes('deliveryAddress:')) {
            const match = objLine.match(/deliveryAddress:\s*['"]([^'"]+)['"]/);
            if (match) deliveryAddress = match[1];
          }
          if (objLine.includes('subCategory:')) subCategoryLine = j;
        }
        
        if (!hasRegion && subCategoryLine !== -1) {
          const region = addressToRegion(deliveryAddress);
          currentObject.splice(subCategoryLine + 1, 0, `    region: '${region}',`);
        }
        
        result.push(...currentObject);
        objectStart = -1;
        currentObject = [];
      }
      continue;
    }
    
    result.push(line);
  }
  
  fs.writeFileSync(filePath, result.join('\n'));
  console.log('Inquiries processed successfully!');
};

const processOrders = () => {
  const filePath = path.join(__dirname, 'src/mock/data/orders.ts');
  let content = fs.readFileSync(filePath, 'utf-8');
  
  const lines = content.split('\n');
  const result = [];
  let inArray = false;
  let objectStart = -1;
  let braceCount = 0;
  let currentObject = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    if (line.includes('export const orders: Order[] = [')) {
      inArray = true;
      result.push(line);
      continue;
    }
    
    if (!inArray) {
      result.push(line);
      continue;
    }
    
    if (line.trim() === '{' && objectStart === -1) {
      objectStart = i;
      braceCount = 1;
      currentObject = [line];
      continue;
    }
    
    if (objectStart !== -1) {
      currentObject.push(line);
      if (line.includes('{')) braceCount++;
      if (line.includes('}')) braceCount--;
      
      if (braceCount === 0) {
        let hasRegion = false;
        let deliveryAddress = '';
        let subCategoryLine = -1;
        
        for (let j = 0; j < currentObject.length; j++) {
          const objLine = currentObject[j];
          if (objLine.includes('region:')) hasRegion = true;
          if (objLine.includes('deliveryAddress:')) {
            const match = objLine.match(/deliveryAddress:\s*['"]([^'"]+)['"]/);
            if (match) deliveryAddress = match[1];
          }
          if (objLine.includes('subCategory:')) subCategoryLine = j;
        }
        
        if (!hasRegion && subCategoryLine !== -1) {
          const region = addressToRegion(deliveryAddress);
          currentObject.splice(subCategoryLine + 1, 0, `    region: '${region}',`);
        }
        
        result.push(...currentObject);
        objectStart = -1;
        currentObject = [];
      }
      continue;
    }
    
    result.push(line);
  }
  
  fs.writeFileSync(filePath, result.join('\n'));
  console.log('Orders processed successfully!');
};

const processSuppliers = () => {
  const filePath = path.join(__dirname, 'src/mock/data/suppliers.ts');
  let content = fs.readFileSync(filePath, 'utf-8');
  
  if (content.includes('region:')) {
    console.log('Suppliers already have region field!');
    return;
  }
  
  const lines = content.split('\n');
  const result = [];
  let inInterface = false;
  let interfaceEnd = -1;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    result.push(line);
    
    if (line.includes('export interface Supplier {')) {
      inInterface = true;
      continue;
    }
    
    if (inInterface && line.includes('countryCode:')) {
      result.push(`  region: string;`);
      continue;
    }
    
    if (inInterface && line.trim() === '}') {
      inInterface = false;
      interfaceEnd = i;
    }
  }
  
  let newContent = result.join('\n');
  
  const supplierLines = newContent.split('\n');
  const finalResult = [];
  let inArray = false;
  let objectStart = -1;
  let braceCount = 0;
  let currentObject = [];
  
  for (let i = 0; i < supplierLines.length; i++) {
    const line = supplierLines[i];
    
    if (line.includes('export const suppliers: Supplier[] = [')) {
      inArray = true;
      finalResult.push(line);
      continue;
    }
    
    if (!inArray) {
      finalResult.push(line);
      continue;
    }
    
    if (line.trim() === '{' && objectStart === -1) {
      objectStart = i;
      braceCount = 1;
      currentObject = [line];
      continue;
    }
    
    if (objectStart !== -1) {
      currentObject.push(line);
      if (line.includes('{')) braceCount++;
      if (line.includes('}')) braceCount--;
      
      if (braceCount === 0) {
        let hasRegion = false;
        let country = '';
        let countryCodeLine = -1;
        
        for (let j = 0; j < currentObject.length; j++) {
          const objLine = currentObject[j];
          if (objLine.includes('region:')) hasRegion = true;
          if (objLine.includes('country:')) {
            const match = objLine.match(/country:\s*['"]([^'"]+)['"]/);
            if (match) country = match[1];
          }
          if (objLine.includes('countryCode:')) countryCodeLine = j;
        }
        
        if (!hasRegion && countryCodeLine !== -1) {
          const region = countryToRegion[country] || '亚太';
          currentObject.splice(countryCodeLine + 1, 0, `    region: '${region}',`);
        }
        
        finalResult.push(...currentObject);
        objectStart = -1;
        currentObject = [];
      }
      continue;
    }
    
    finalResult.push(line);
  }
  
  fs.writeFileSync(filePath, finalResult.join('\n'));
  console.log('Suppliers processed successfully!');
};

processInquiries();
processOrders();
processSuppliers();
