import ReactECharts from 'echarts-for-react';
import { useTheme } from '@/hooks/useTheme';
import type { EChartsOption } from 'echarts';

interface PieChartProps {
  data: Array<{ name: string; value: number }>;
  title?: string;
  colors?: string[];
  showLegend?: boolean;
  height?: string | number;
  radius?: string[] | string;
  center?: string[];
  labelFormatter?: (params: any) => string;
}

const DEFAULT_COLORS = [
  '#3B82F6',
  '#10B981',
  '#F59E0B',
  '#EF4444',
  '#8B5CF6',
  '#EC4899',
  '#06B6D4',
  '#84CC16',
];

export const PieChart: React.FC<PieChartProps> = ({
  data,
  title,
  colors = DEFAULT_COLORS,
  showLegend = true,
  height = 300,
  radius = ['45%', '70%'],
  center = ['50%', '50%'],
  labelFormatter,
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
      formatter: '{b}: {c} ({d}%)',
    },
    legend: showLegend
      ? {
          orient: 'vertical',
          right: '5%',
          top: 'center',
          textStyle: {
            color: isDark ? '#94A3B8' : '#64748B',
            fontSize: 12,
          },
        }
      : undefined,
    color: colors,
    series: [
      {
        name: '占比',
        type: 'pie',
        radius,
        center,
        avoidLabelOverlap: true,
        itemStyle: {
          borderRadius: 6,
          borderColor: isDark ? '#0F172A' : '#FFFFFF',
          borderWidth: 2,
        },
        label: {
          show: !showLegend,
          position: 'outside',
          formatter: labelFormatter || '{b}\n{d}%',
          color: isDark ? '#94A3B8' : '#64748B',
          fontSize: 11,
        },
        labelLine: {
          show: !showLegend,
          length: 10,
          length2: 15,
          lineStyle: {
            color: isDark ? '#334155' : '#CBD5E1',
          },
        },
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.3)',
          },
          label: {
            show: true,
            fontSize: 14,
            fontWeight: 'bold',
          },
        },
        data: data.map((item, index) => ({
          ...item,
          itemStyle: {
            color: colors[index % colors.length],
          },
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
