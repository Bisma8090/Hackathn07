'use client';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

const ORDER_TYPE_COLORS = ['#FF6B9D', '#FFB347', '#4FC3F7'];

interface Props {
  pieData: { name: string; value: number }[];
}

export default function OrderPieChart({ pieData }: Props) {
  return (
    <>
      <Box sx={{ position: 'relative' }}>
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={85}
              paddingAngle={4}
              dataKey="value"
              strokeWidth={0}
            >
              {pieData.map((_, index) => (
                <Cell key={index} fill={ORDER_TYPE_COLORS[index]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{ backgroundColor: '#252836', border: 'none', borderRadius: 8, color: 'white' }}
              itemStyle={{ color: 'white' }}
            />
          </PieChart>
        </ResponsiveContainer>
      </Box>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 1 }}>
        {pieData.map((entry, i) => (
          <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: ORDER_TYPE_COLORS[i], flexShrink: 0 }} />
            <Typography variant="caption" sx={{ color: '#9CA3AF', flex: 1 }}>{entry.name}</Typography>
            <Typography variant="caption" sx={{ color: 'white', fontWeight: 600 }}>{entry.value} customers</Typography>
          </Box>
        ))}
      </Box>
    </>
  );
}
