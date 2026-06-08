import ReactECharts from 'echarts-for-react';
import { useTheme } from '@/hooks/useTheme';
import type { EChartsOption } from 'echarts';

interface BarChartProps {
  data: Array<{ name: string; value: number; category?: string }>;
  xField: string;
  yField: string;
  title?: string;
  seriesName?: string;
  color?: string;
  horizontal?: boolean;
  showGrid?: boolean;
  showLegend?: boolean;
  height?: string | number;
  yAxisFormatter?: (value: number) => string;
  xAxisFormatter?: (value: string) => string;
}

export const BarChart: React.FC<BarChartProps> = ({
  data,
  xField,
  yField,
  title,
  seriesName = '数据',
  color = '#3B82F6',
  horizontal = false,
  showGrid = true,
  showLegend = false,
  height = 300,
  yAxisFormatter,
  xAxisFormatter,
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
      trigger: horizontal ? 'axis' : 'item',
      backgroundColor: isDark ? 'rgba(15, 23, 42, 0.9)' : 'rgba(255, 255, 255, 0.9)',
      borderColor: isDark ? '#334155' : '#E2E8F0',
      textStyle: {
        color: isDark ? '#E2E8F0' : '#1E293B',
      },
    },
    legend: showLegend
      ? {
          data: [seriesName],
          textStyle: {
            color: isDark ? '#94A3B8' : '#64748B',
          },
        }
      : undefined,
    grid: showGrid
      ? {
          left: '3%',
          right: '4%',
          bottom: '3%',
          top: title ? 40 : 10,
          containLabel: true,
        }
      : undefined,
    xAxis: horizontal
      ? {
          type: 'value',
          axisLine: { show: false },
          axisLabel: {
            color: isDark ? '#94A3B8' : '#64748B',
            fontSize: 11,
            formatter: yAxisFormatter,
          },
          splitLine: {
            lineStyle: {
              color: isDark ? '#1E293B' : '#F1F5F9',
              type: 'dashed',
            },
          },
        }
      : {
          type: 'category',
          data: data.map((d) => d[xField as keyof typeof d]),
          axisLine: {
            lineStyle: {
              color: isDark ? '#334155' : '#E2E8F0',
            },
          },
          axisLabel: {
            color: isDark ? '#94A3B8' : '#64748B',
            fontSize: 11,
            formatter: xAxisFormatter,
            rotate: data.length > 6 ? 30 : 0,
          },
        },
    yAxis: horizontal
      ? {
          type: 'category',
          data: data.map((d) => d[xField as keyof typeof d]),
          axisLine: {
            lineStyle: {
              color: isDark ? '#334155' : '#E2E8F0',
            },
          },
          axisLabel: {
            color: isDark ? '#94A3B8' : '#64748B',
            fontSize: 11,
            formatter: xAxisFormatter,
          },
        }
      : {
          type: 'value',
          axisLine: { show: false },
          axisLabel: {
            color: isDark ? '#94A3B8' : '#64748B',
            fontSize: 11,
            formatter: yAxisFormatter,
          },
          splitLine: {
            lineStyle: {
              color: isDark ? '#1E293B' : '#F1F5F9',
              type: 'dashed',
            },
          },
        },
    series: [
      {
        name: seriesName,
        type: 'bar',
        data: data.map((d) => ({
          value: d[yField as keyof typeof d],
        })),
        barWidth: '50%',
        itemStyle: {
          borderRadius: [4, 4, 0, 0],
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: color },
              { offset: 1, color: color + '80' },
            ],
          },
        },
        emphasis: {
          itemStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: color },
                { offset: 1, color: color + '80' },
              ],
            },
          },
        },
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
