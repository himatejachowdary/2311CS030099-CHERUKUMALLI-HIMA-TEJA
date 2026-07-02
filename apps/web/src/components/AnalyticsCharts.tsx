import React from 'react';
import { useTheme } from '@mui/material/styles';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';

// Cast Recharts components to 'any' to bypass JSX typing mismatch conflicts
const ResponsiveContainerAny = ResponsiveContainer as any;
const PieChartAny = PieChart as any;
const PieAny = Pie as any;
const CellAny = Cell as any;
const BarChartAny = BarChart as any;
const BarAny = Bar as any;
const XAxisAny = XAxis as any;
const YAxisAny = YAxis as any;
const CartesianGridAny = CartesianGrid as any;
const TooltipAny = Tooltip as any;
const LegendAny = Legend as any;

interface ChartDataPoint {
  name: string;
  value: number;
}

interface AnalyticsChartsProps {
  typeData: ChartDataPoint[];
  priorityData: ChartDataPoint[];
}

export function AnalyticsCharts({ typeData, priorityData }: AnalyticsChartsProps) {
  const theme = useTheme();

  // Curated premium HSL-tailored colors
  const PIE_COLORS = [
    '#6366f1', // Indigo
    '#06b6d4', // Cyan
    '#f59e0b', // Amber
    '#10b981', // Emerald
    '#ec4899', // Pink
    '#8b5cf6', // Purple
    '#3b82f6', // Blue
    '#ef4444', // Red
    '#64748b'  // Slate
  ];

  const BAR_COLORS = {
    High: theme.palette.error.main,
    Medium: theme.palette.warning.main,
    Low: theme.palette.info.main
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div style={{
          backgroundColor: theme.palette.background.paper,
          color: theme.palette.text.primary,
          padding: '10px 14px',
          border: `1px solid ${theme.palette.divider}`,
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
        }}>
          <p style={{ margin: 0, fontWeight: 700, fontSize: '0.85rem' }}>
            {`${payload[0].name}`}
          </p>
          <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: theme.palette.primary.main, fontWeight: 600 }}>
            {`Count: ${payload[0].value}`}
          </p>
        </div>
      );
    }
    return null;
  };

  // Safe checks for empty datasets
  const hasTypeData = typeData.some(d => d.value > 0);
  const hasPriorityData = priorityData.some(d => d.value > 0);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
      
      {/* Category Breakdown (Pie Chart) */}
      <div style={{
        padding: '24px',
        backgroundColor: theme.palette.background.paper,
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: '16px',
        minHeight: '340px',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <h4 style={{ margin: '0 0 16px 0', fontSize: '1.1rem', fontWeight: 700, color: theme.palette.text.primary }}>
          Categories Distribution
        </h4>
        
        {hasTypeData ? (
          <div style={{ width: '100%', height: 260 }}>
            <ResponsiveContainerAny>
              <PieChartAny>
                <PieAny
                  data={typeData.filter(d => d.value > 0)}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {typeData.map((entry, index) => (
                    <CellAny key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </PieAny>
                <TooltipAny content={<CustomTooltip />} />
                <LegendAny 
                  layout="horizontal" 
                  verticalAlign="bottom" 
                  align="center"
                  iconSize={8}
                  iconType="circle"
                  wrapperStyle={{ fontSize: '0.75rem', fontWeight: 600 }}
                />
              </PieChartAny>
            </ResponsiveContainerAny>
          </div>
        ) : (
          <div style={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: '0.85rem', color: theme.palette.text.secondary }}>No category data available</span>
          </div>
        )}
      </div>

      {/* Priority Breakdown (Bar Chart) */}
      <div style={{
        padding: '24px',
        backgroundColor: theme.palette.background.paper,
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: '16px',
        minHeight: '340px',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <h4 style={{ margin: '0 0 16px 0', fontSize: '1.1rem', fontWeight: 700, color: theme.palette.text.primary }}>
          Priority Levels
        </h4>

        {hasPriorityData ? (
          <div style={{ width: '100%', height: 260 }}>
            <ResponsiveContainerAny>
              <BarChartAny
                data={priorityData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <CartesianGridAny strokeDasharray="3 3" vertical={false} stroke={theme.palette.divider} />
                <XAxisAny 
                  dataKey="name" 
                  tickLine={false} 
                  stroke={theme.palette.text.secondary}
                  style={{ fontSize: '0.75rem', fontWeight: 600 }} 
                />
                <YAxisAny 
                  tickLine={false} 
                  axisLine={false} 
                  stroke={theme.palette.text.secondary}
                  style={{ fontSize: '0.75rem', fontWeight: 600 }} 
                />
                <TooltipAny content={<CustomTooltip />} cursor={{ fill: 'rgba(99, 102, 241, 0.04)' }} />
                <BarAny dataKey="value" radius={[6, 6, 0, 0]}>
                  {priorityData.map((entry, index) => {
                    const color = BAR_COLORS[entry.name as keyof typeof BAR_COLORS] || theme.palette.primary.main;
                    return <CellAny key={`cell-${index}`} fill={color} />;
                  })}
                </BarAny>
              </BarChartAny>
            </ResponsiveContainerAny>
          </div>
        ) : (
          <div style={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: '0.85rem', color: theme.palette.text.secondary }}>No priority data available</span>
          </div>
        )}
      </div>

    </div>
  );
}
export default AnalyticsCharts;
