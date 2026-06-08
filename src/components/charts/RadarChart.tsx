import ReactECharts from 'echarts-for-react';
import { useTheme } from '@/hooks/useTheme';
import type { EChartsOption } from 'echarts';

interface RadarIndicator {
  name: string;
  max: number;
}

interface RadarData {
  name: string;
  value: number[];
  color?: string;
  areaStyle?: boolean;
}

interface RadarChartProps {
  indicators: RadarIndicator[];
  data: RadarData[];
  title?: string;
  showLegend?: boolean;
  height?: string | number;
  radius?: string | number;
}

export const RadarChart: React.FC<RadarChartProps> = ({
  indicators,
  data,
  title,
  showLegend = true,
  height = 300,
  radius = '65%',
}) => {
  const { isDark } = useTheme();

  const option: EChartsOption = {
    title: title
      ? {
          text: title,
          textStyle: {
            fontSize: 14,
            fontWeight: 600,
            color: isDark ? '#E2E8F0' : '#1E293B',
          },
          left: 0,
          top: 0,
        }
      : undefined,
    tooltip: {
        trigger: 'item',
        backgroundColor: isDark ? 'rgba(15, 23, 42, 0.9)' : 'rgba(255, 255, 255, 0.9)',
        borderColor: isDark ? '#334155' : '#E2E8F0',
        textStyle: {
          color: isDark ? '#E2E8F0' : '#1E293B',
        },
      },
    legend: showLegend
      ? {
          data: data.map((d) => d.name),
          textStyle: {
            color: isDark ? '#94A3B8' : '#64748B',
          },
          bottom: 0,
        }
      : undefined,
    radar: {
      indicator: indicators.map((ind) => ({
        ...ind,
      })),
      radius,
      center: ['50%', '45%'],
      splitNumber: 4,
      axisName: {
        color: isDark ? '#94A3B8' : '#64748B',
      },
      splitArea: {
        areaStyle: {
          color: isDark
            ? ['rgba(51, 65, 85, 0.2)', 'rgba(51, 65, 85, 0.1)']
            : ['rgba(241, 245, 249, 0.5)', 'rgba(226, 232, 240, 0.3)'],
        },
      },
      splitLine: {
        lineStyle: {
          color: isDark ? '#334155' : '#E2E8F0',
        },
      },
      axisLine: {
        lineStyle: {
          color: isDark ? '#334155' : '#E2E8F0',
        },
      },
    },
    series: [
      {
        type: 'radar',
        data: data.map((item) => ({
          value: item.value,
          name: item.name,
          symbol: 'circle',
          symbolSize: 6,
          lineStyle: {
            width: 2,
            color: item.color || '#3B82F6',
          },
          itemStyle: {
            color: item.color || '#3B82F6',
          },
          areaStyle: item.areaStyle
            ? {
                color: (item.color || '#3B82F6') + '30',
              }
            : undefined,
        })),
      },
    ],
  };

  return (
    <ReactECharts
      option={option}
      style={{ height }}
      opts={{ renderer: 'canvas' }}
      theme={isDark ? 'dark' : undefined}
    />
  );
};
