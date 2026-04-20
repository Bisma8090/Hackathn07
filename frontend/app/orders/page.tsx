'use client';
import AppLayout from '@/components/AppLayout';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Avatar from '@mui/material/Avatar';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import { useGetOrdersQuery, useUpdateOrderStatusMutation } from '@/lib/api';

const STATUS_COLORS: Record<string, string> = {
  Completed: '#4CAF50',
  Preparing: '#9C27B0',
  Pending: '#FF9800',
  Cancelled: '#F44336',
};

const STATUSES = ['Pending', 'Preparing', 'Completed', 'Cancelled'];

export default function OrdersPage() {
  const { data: orders = [], isLoading } = useGetOrdersQuery(undefined, {
    pollingInterval: 10000,
  });
  const [updateOrderStatus] = useUpdateOrderStatusMutation();

  return (
    <AppLayout>
      <Box>
        <Typography variant="h4" fontWeight={700} color="white" mb={1}>
          Orders
        </Typography>
        <Typography variant="body2" color="text.secondary" mb={3}>
          All orders history
        </Typography>

        <Card sx={{ bgcolor: '#1F1D2B' }}>
          <CardContent sx={{ p: 0 }}>
            {isLoading ? (
              <Box display="flex" justifyContent="center" p={4}>
                <CircularProgress sx={{ color: '#E8734A' }} />
              </Box>
            ) : (
              <Box sx={{ overflowX: 'auto' }}>
                <Table sx={{ minWidth: 700 }}>
                <TableHead>
                  <TableRow>
                    {['Order #', 'Customer', 'Items', 'Total', 'Type', 'Payment', 'Status', 'Date'].map((h) => (
                      <TableCell
                        key={h}
                        sx={{ color: '#9CA3AF', borderColor: '#3D4060', fontWeight: 600, fontSize: 13 }}
                      >
                        {h}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {orders.map((order: any) => (
                    <TableRow key={order._id} sx={{ '&:hover': { bgcolor: '#2D3048' } }}>
                      <TableCell sx={{ color: '#E8734A', borderColor: '#3D4060', fontWeight: 600, fontSize: 13 }}>
                        {order.orderNumber}
                      </TableCell>
                      <TableCell sx={{ color: 'white', borderColor: '#3D4060' }}>
                        <Box display="flex" alignItems="center" gap={1}>
                          <Avatar sx={{ width: 28, height: 28, bgcolor: '#E8734A', fontSize: 12 }}>
                            {(order.customerName || 'C')[0].toUpperCase()}
                          </Avatar>
                          <Typography variant="body2">{order.customerName || 'Walk-in'}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell sx={{ color: '#9CA3AF', borderColor: '#3D4060', fontSize: 13 }}>
                        {order.items?.map((i: any) => i.productName).join(', ').slice(0, 30)}
                        {order.items?.length > 1 ? '...' : ''}
                      </TableCell>
                      <TableCell sx={{ color: 'white', borderColor: '#3D4060', fontWeight: 600 }}>
                        ${order.total?.toFixed(2)}
                      </TableCell>
                      <TableCell sx={{ color: '#9CA3AF', borderColor: '#3D4060', fontSize: 13 }}>
                        {order.orderType}
                      </TableCell>
                      <TableCell sx={{ color: '#9CA3AF', borderColor: '#3D4060', fontSize: 13 }}>
                        {order.paymentMethod}
                      </TableCell>
                      <TableCell sx={{ borderColor: '#3D4060' }}>
                        <Select
                          value={order.status}
                          size="small"
                          onChange={(e) => updateOrderStatus({ id: order._id, status: e.target.value })}
                          sx={{
                            color: STATUS_COLORS[order.status],
                            bgcolor: STATUS_COLORS[order.status] + '22',
                            fontWeight: 600,
                            fontSize: 12,
                            borderRadius: 2,
                            '.MuiOutlinedInput-notchedOutline': { borderColor: STATUS_COLORS[order.status] + '55' },
                            '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: STATUS_COLORS[order.status] },
                            '.MuiSvgIcon-root': { color: STATUS_COLORS[order.status] },
                          }}
                        >
                          {STATUSES.map((s) => (
                            <MenuItem key={s} value={s} sx={{ fontSize: 12 }}>
                              <Chip
                                label={s}
                                size="small"
                                sx={{
                                  bgcolor: STATUS_COLORS[s] + '33',
                                  color: STATUS_COLORS[s],
                                  fontWeight: 600,
                                  fontSize: 11,
                                  cursor: 'pointer',
                                }}
                              />
                            </MenuItem>
                          ))}
                        </Select>
                      </TableCell>
                      <TableCell sx={{ color: '#9CA3AF', borderColor: '#3D4060', fontSize: 12 }}>
                        {new Date(order.createdAt).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
                </Table>
              </Box>
            )}
          </CardContent>
        </Card>
      </Box>
    </AppLayout>
  );
}
