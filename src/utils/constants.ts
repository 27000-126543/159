export const STANDARD_REGIONS = ['亚太', '欧洲', '北美', '其他'] as const;
export type Region = typeof STANDARD_REGIONS[number];

export const COUNTRY_TO_REGION: Record<string, Region> = {
  '中国': '亚太',
  '日本': '亚太',
  '韩国': '亚太',
  '新加坡': '亚太',
  '马来西亚': '亚太',
  '泰国': '亚太',
  '越南': '亚太',
  '印度': '亚太',
  '印度尼西亚': '亚太',
  '菲律宾': '亚太',
  '澳大利亚': '亚太',
  '新西兰': '亚太',
  '德国': '欧洲',
  '法国': '欧洲',
  '英国': '欧洲',
  '意大利': '欧洲',
  '瑞士': '欧洲',
  '西班牙': '欧洲',
  '荷兰': '欧洲',
  '比利时': '欧洲',
  '瑞典': '欧洲',
  '挪威': '欧洲',
  '丹麦': '欧洲',
  '芬兰': '欧洲',
  '奥地利': '欧洲',
  '葡萄牙': '欧洲',
  '希腊': '欧洲',
  '波兰': '欧洲',
  '捷克': '欧洲',
  '匈牙利': '欧洲',
  '美国': '北美',
  '加拿大': '北美',
  '墨西哥': '北美',
  '巴西': '其他',
  '阿根廷': '其他',
  '智利': '其他',
  '南非': '其他',
  '埃及': '其他',
  '尼日利亚': '其他',
  '肯尼亚': '其他',
  '摩洛哥': '其他',
  '阿联酋': '其他',
  '沙特阿拉伯': '其他',
  '土耳其': '其他',
  '以色列': '其他',
  '俄罗斯': '其他',
  '乌克兰': '其他',
};

export const getRegionByCountry = (country: string): Region => {
  return COUNTRY_TO_REGION[country] || '其他';
};

export const REGION_CARRIER_MAP: Record<string, string[]> = {
  '亚太': ['顺丰国际', '中远海运'],
  '欧洲': ['DHL', '马士基'],
  '北美': ['FedEx', 'UPS'],
};

export const COUNTRY_CITY_MAP: Record<string, string[]> = {
  '中国': ['深圳', '上海'],
  '德国': ['汉堡'],
  '日本': ['东京'],
  '美国': ['洛杉矶'],
  '韩国': ['首尔'],
  '法国': ['巴黎'],
  '瑞士': ['苏黎世'],
  '意大利': ['米兰'],
};

export const getCarrierByRegion = (region: string): string => {
  const carriers = REGION_CARRIER_MAP[region];
  if (!carriers || carriers.length === 0) return '默认物流商';
  return carriers[Math.floor(Math.random() * carriers.length)];
};

export const getOriginCityByCountry = (country: string): string => {
  const cities = COUNTRY_CITY_MAP[country];
  if (!cities || cities.length === 0) return '上海';
  return cities[Math.floor(Math.random() * cities.length)];
};

export const determineTransportMethod = (
  originCountry: string,
  destinationCountry: string,
  originRegion?: string
): 'air' | 'sea' | 'land' | 'rail' | 'express' => {
  const isCrossBorder = originCountry !== destinationCountry;
  const isEuropean = originRegion === '欧洲' && destinationCountry === '中国';

  if (isCrossBorder) {
    if (isEuropean) {
      return Math.random() > 0.5 ? 'rail' : 'air';
    }
    return Math.random() > 0.5 ? 'air' : 'sea';
  } else {
    return Math.random() > 0.5 ? 'land' : 'express';
  }
};

export const extractCityFromAddress = (address: string): string => {
  const cityPatterns = [
    /([\u4e00-\u9fa5]{2,3}市)/,
    /([\u4e00-\u9fa5]{2,3}区)/,
    /([A-Za-z\s]+)[,\s]+([A-Za-z]{2})?\s*\d+/,
  ];

  for (const pattern of cityPatterns) {
    const match = address.match(pattern);
    if (match) {
      return match[1].replace(/市|区$/, '');
    }
  }

  const provinceCityMatch = address.match(/([\u4e00-\u9fa5]{2,})(省|自治区|特别行政区)?([\u4e00-\u9fa5]{2,})(市|州)?/);
  if (provinceCityMatch && provinceCityMatch[3]) {
    return provinceCityMatch[3];
  }

  return '上海';
};
