'use client';
import dynamic from 'next/dynamic';
import { Suspense } from 'react';
import AppLayout from '@/components/AppLayout';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import { useGetDashboardStatsQuery } from '@/lib/api';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import FilterListIcon from '@mui/icons-material/FilterList';

const OrderPieChart = dynamic(() => import('./OrderPieChart'), { ssr: false });

const STATUS_COLORS: Record<string, string> = {
  Completed: '#4CAF50',
  Preparing: '#9C27B0',
  Pending: '#FF9800',
  Cancelled: '#F44336',
};

function DashboardContent() {
  const { data: stats, isLoading } = useGetDashboardStatsQuery(undefined, {
    pollingInterval: 10000,
  });

  if (isLoading) {
    return (
      <AppLayout>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
          <CircularProgress sx={{ color: '#E8734A' }} />
        </Box>
      </AppLayout>
    );
  }

  const pieData = stats
    ? [
        { name: 'Dine In', value: stats.orderTypeBreakdown?.['Dine In'] || 0 },
        { name: 'To Go', value: stats.orderTypeBreakdown?.['To Go'] || 0 },
        { name: 'Delivery', value: stats.orderTypeBreakdown?.['Delivery'] || 0 },
      ]
    : [];

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long', day: 'numeric', month: 'short', year: 'numeric',
  });

  const revenue = (stats?.totalRevenue || 0).toLocaleString('en-US', { minimumFractionDigits: 2 });

  return (
    <AppLayout>
      <Box>
        <Typography variant="h4" sx={{ fontWeight: 700, color: 'white' }}>Dashboard</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>{today}</Typography>

        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={12} sm={4}>
                <StatCard label="Total Revenue" value={revenue} change="+32.40%" positive icon="💰" />
              </Grid>
              <Grid item xs={12} sm={4}>
                <StatCard label="Total Dish Ordered" value={(stats?.totalOrders || 0).toLocaleString()} change="-12.40%" positive={false} icon="🍽️" />
              </Grid>
              <Grid item xs={12} sm={4}>
                <StatCard label="Total Customer" value={(stats?.totalCustomers || 0).toLocaleString()} change="+2.40%" positive icon="👥" />
              </Grid>
            </Grid>

            <Card sx={{ bgcolor: '#1F1D2B' }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>Order Report</Typography>
                  <Button startIcon={<FilterListIcon />} variant="outlined" size="small" sx={{ borderColor: '#3D4060', color: 'white' }}>
                    Filter Order
                  </Button>
                </Box>
                <Box sx={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr>
                        {['Customer', 'Menu', 'Total Payment', 'Status'].map((h) => (
                          <th key={h} style={{ textAlign: 'left', padding: '8px 12px', color: '#9CA3AF', fontSize: 13, fontWeight: 500, borderBottom: '1px solid #3D4060' }}>
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {(stats?.recentOrders || []).map((order: any) => (
                        <tr key={order._id}>
                          <td style={{ padding: '12px', color: 'white', fontSize: 14 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Avatar sx={{ width: 32, height: 32, bgcolor: '#E8734A', fontSize: 13 }}>
                                {(order.customerName || 'C')[0].toUpperCase()}
                              </Avatar>
                              {order.customerName || 'Customer'}
                            </Box>
                          </td>
                          <td style={{ padding: '12px', color: 'white', fontSize: 14 }}>{order.items?.[0]?.productName || '-'}</td>
                          <td style={{ padding: '12px', color: 'white', fontSize: 14 }}>${order.total?.toFixed(2)}</td>
                          <td style={{ padding: '12px' }}>
                            <Chip label={order.status} size="small" sx={{ bgcolor: STATUS_COLORS[order.status] + '33', color: STATUS_COLORS[order.status], fontWeight: 600, fontSize: 12 }} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card sx={{ bgcolor: '#1F1D2B', mb: 2 }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>Most Ordered</Typography>
                  <Button size="small" variant="outlined" sx={{ borderColor: '#3D4060', color: 'white', fontSize: 12 }}>Today</Button>
                </Box>
                {(stats?.mostSoldProducts || []).map((p: any, i: number) => (
                  <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1.5 }}>
                    <Avatar
                      src={p.imageUrl || undefined}
                      sx={{ width: 48, height: 48, bgcolor: '#3D4060', fontSize: 22, borderRadius: '12px' }}
                    >
                      {!p.imageUrl && '🍜'}
                    </Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: 'white' }}>{p.name}</Typography>
                      <Typography variant="caption" color="text.secondary">{p.count} dishes ordered</Typography>
                    </Box>
                  </Box>
                ))}
                <Button fullWidth variant="outlined" sx={{ mt: 1, borderColor: '#E8734A', color: '#E8734A' }}>View All</Button>
              </CardContent>
            </Card>

            <Card sx={{ bgcolor: '#1F1D2B' }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>Most Type of Order</Typography>
                  <Button size="small" variant="outlined" sx={{ borderColor: '#3D4060', color: 'white', fontSize: 12 }}>Today</Button>
                </Box>
                <OrderPieChart pieData={pieData} />
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </AppLayout>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={null}>
      <DashboardContent />
    </Suspense>
  );
}

function StatCard({ label, value, change, positive, icon }: { label: string; value: string; change: string; positive: boolean; icon: string }) {
  return (
    <Card sx={{ bgcolor: '#1F1D2B' }}>
      <CardContent sx={{ p: '12px !important' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box sx={{ width: 28, height: 28, borderRadius: '50%', bgcolor: 'rgba(232,115,74,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>
            {icon}
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Typography variant="caption" sx={{ color: positive ? '#4CAF50' : '#F44336', fontWeight: 600, fontSize: 11 }}>{change}</Typography>
            {positive ? <TrendingUpIcon sx={{ fontSize: 12, color: '#4CAF50' }} /> : <TrendingDownIcon sx={{ fontSize: 12, color: '#F44336' }} />}
          </Box>
        </Box>
        <Typography variant="h6" sx={{ fontWeight: 700, color: 'white', mt: 0.5, fontSize: '1.1rem' }}>{value}</Typography>
        <Typography variant="caption" color="text.secondary" sx={{ fontSize: 11 }}>{label}</Typography>
      </CardContent>
    </Card>
  );
}
