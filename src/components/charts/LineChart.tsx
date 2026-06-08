import ReactECharts from 'echarts-for-react';
import { useTheme } from '@/hooks/useTheme';
import type { EChartsOption } from 'echarts';

interface LineChartProps {
  data: Array<{ date: string; value: number; name?: string }>;
  xField: string;
  yField: string;
  title?: string;
  seriesName?: string;
  color?: string;
  smooth?: boolean;
  showGrid?: boolean;
  showLegend?: boolean;
  height?: string | number;
  areaStyle?: boolean;
  yAxisFormatter?: (value: number) => string;
}

export const LineChart: React.FC<LineChartProps> = ({
  data,
  xField,
  yField,
  title,
  seriesName = '数据',
  color = '#3B82F6',
  smooth = true,
  showGrid = true,
  showLegend = false,
  height = 300,
  areaStyle = false,
  yAxisFormatter,
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
      trigger: 'axis',
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
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: data.map((d) => d[xField as keyof typeof d]),
      axisLine: {
        lineStyle: {
          color: isDark ? '#334155' : '#E2E8F0',
        },
      },
      axisLabel: {
        color: isDark ? '#94A3B8' : '#64748B',
        fontSize: 11,
      },
    },
    yAxis: {
      type: 'value',
      axisLine: {
        show: false,
      },
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
        type: 'line',
        smooth,
        symbol: 'circle',
        symbolSize: 6,
        data: data.map((d) => d[yField as keyof typeof d]),
        lineStyle: {
          width: 3,
          color,
        },
        itemStyle: {
          color,
          borderWidth: 2,
          borderColor: isDark ? '#0F172A' : '#FFFFFF',
        },
        areaStyle: areaStyle
          ? {
              color: {
                type: 'linear',
                x: 0,
                y: 0,
                x2: 0,
                y2: 1,
                colorStops: [
                  { offset: 0, color: color + '40' },
                  { offset: 1, color: color + '05' },
                ],
              },
            }
          : undefined,
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
