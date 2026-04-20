'use client';
import { useState, useEffect } from 'react';
import AppLayout from '@/components/AppLayout';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Alert from '@mui/material/Alert';
import useMediaQuery from '@mui/material/useMediaQuery';
import Drawer from '@mui/material/Drawer';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import SearchIcon from '@mui/icons-material/Search';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import { useGetProductsQuery, useCreateOrderMutation } from '@/lib/api';
import { useDispatch, useSelector } from 'react-redux';
import {
  addItem, removeItem, updateQuantity, updateNote,
  setOrderType, setDiscount, setTableNo, setCustomerName,
  setPaymentMethod, clearCart, selectCartSubtotal,
} from '@/lib/cartSlice';
import type { RootState } from '@/lib/store';

const CATEGORIES = ['Hot Dishes', 'Cold Dishes', 'Soup', 'Grill', 'Appetizer', 'Dessert'];

function ProductImage({ src, alt, size = 110 }: { src?: string; alt: string; size?: number }) {
  return (
    <Box sx={{
      width: size, height: size, borderRadius: '50%', bgcolor: '#45442fff',
      mx: 'auto', overflow: 'hidden', display: 'flex',
      alignItems: 'center', justifyContent: 'center', fontSize: size * 0.4, flexShrink: 0,
      boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
      mt: `-${size * 0.5}px`,
      mb: 1.5,
      position: 'relative',
      zIndex: 1,
    }}>
      {src ? <img src={src} alt={alt} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : '🍜'}
    </Box>
  );
}

// ── Order Panel (right side) ──────────────────────────────────────────────────
function OrderPanel({
  cart, subtotal, orderNo,
  onPayment, dispatch,
}: {
  cart: RootState['cart']; subtotal: number; orderNo: string;
  onPayment: () => void; dispatch: ReturnType<typeof useDispatch>;
}) {
  return (
    <Box sx={{
      width: '100%', height: '100%', bgcolor: '#1F1D2B', borderRadius: 2,
      p: 2.5, display: 'flex', flexDirection: 'column', overflow: 'hidden',
    }}>
      {/* Title */}
      <Typography fontWeight={700} color="white" mb={2} fontSize={18}>
        Orders #{orderNo}
      </Typography>

      {/* Order type chips */}
      <Box display="flex" gap={1} mb={2.5}>
        {(['Dine In', 'To Go', 'Delivery'] as const).map((t) => (
          <Chip key={t} label={t} size="small"
            onClick={() => dispatch(setOrderType(t))}
            sx={{
              bgcolor: cart.orderType === t ? '#E8734A' : 'transparent',
              color: cart.orderType === t ? 'white' : '#9CA3AF',
              border: '1px solid',
              borderColor: cart.orderType === t ? '#E8734A' : '#4A5280',
              cursor: 'pointer', fontSize: 12, height: 28, px: 0.5,
              fontWeight: cart.orderType === t ? 600 : 400,
              borderRadius: '20px',
              '&:hover': { bgcolor: cart.orderType === t ? '#d4623b' : 'rgba(232,115,74,0.1)' },
            }}
          />
        ))}
      </Box>

      {/* Column headers */}
      <Box display="flex" alignItems="center" mb={1.5} px={0.5}>
        <Typography variant="caption" color="#6B7280" fontWeight={600} fontSize={12} flex={1}>Item</Typography>
        <Typography variant="caption" color="#6B7280" fontWeight={600} fontSize={12} sx={{ mr: 5 }}>Qty</Typography>
        <Typography variant="caption" color="#6B7280" fontWeight={600} fontSize={12}>Price</Typography>
      </Box>

      {/* Cart items */}
      <Box flex={1} overflow="auto" sx={{
        '&::-webkit-scrollbar': { width: 4 },
        '&::-webkit-scrollbar-thumb': { bgcolor: '#3D4060', borderRadius: 2 },
      }}>
        {cart.items.length === 0 ? (
          <Typography variant="body2" color="text.secondary" textAlign="center" mt={6} fontSize={13}>
            No items added yet
          </Typography>
        ) : (
          cart.items.map((item) => (
            <Box key={item.productId} mb={2}>
              {/* Item row */}
              <Box display="flex" alignItems="center" gap={1.2}>
                {/* Image */}
                <Box sx={{
                  width: 40, height: 40, borderRadius: '50%', bgcolor: '#3D4060',
                  overflow: 'hidden', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', flexShrink: 0, fontSize: 18,
                }}>
                  {item.imageUrl
                    ? <img src={item.imageUrl} alt={item.productName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : '🍜'}
                </Box>

                {/* Name + price */}
                <Box flex={1} minWidth={0}>
                  <Typography fontWeight={600} color="white" noWrap fontSize={13} lineHeight={1.3}>
                    {item.productName.length > 14 ? item.productName.slice(0, 14) + '...' : item.productName}
                  </Typography>
                  <Typography color="#9CA3AF" fontSize={12}>
                    ${item.price.toFixed(2)}
                  </Typography>
                </Box>

                {/* Qty controls */}
                <Box display="flex" alignItems="center" gap={0.5}>
                  <IconButton size="small"
                    onClick={() => {
                      if (item.quantity <= 1) dispatch(removeItem(item.productId));
                      else dispatch(updateQuantity({ productId: item.productId, quantity: item.quantity - 1 }));
                    }}
                    sx={{ bgcolor: '#252836', color: 'white', borderRadius: 1, p: 0, width: 26, height: 26 }}
                  >
                    <RemoveIcon sx={{ fontSize: 13 }} />
                  </IconButton>
                  <Box sx={{
                    bgcolor: '#252836', borderRadius: 1, minWidth: 28, height: 26,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', px: 0.5,
                  }}>
                    <Typography color="white" fontWeight={700} fontSize={13}>{item.quantity}</Typography>
                  </Box>
                  <IconButton size="small"
                    onClick={() => dispatch(updateQuantity({ productId: item.productId, quantity: item.quantity + 1 }))}
                    sx={{ bgcolor: '#252836', color: 'white', borderRadius: 1, p: 0, width: 26, height: 26 }}
                  >
                    <AddIcon sx={{ fontSize: 13 }} />
                  </IconButton>
                </Box>

                {/* Price */}
                <Typography color="white" fontWeight={600} fontSize={13} minWidth={44} textAlign="right">
                  ${(item.price * item.quantity).toFixed(2)}
                </Typography>
              </Box>

              {/* Note field + delete row */}
              <Box display="flex" alignItems="center" gap={1} mt={1}>
                <TextField
                  size="small"
                  placeholder="Order Note..."
                  value={item.note}
                  onChange={(e) => dispatch(updateNote({ productId: item.productId, note: e.target.value }))}
                  fullWidth
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      bgcolor: '#252836',
                      fontSize: 12,
                      borderRadius: 1.5,
                      '& fieldset': { borderColor: '#3D4060' },
                      '&:hover fieldset': { borderColor: '#5A6080' },
                      '&.Mui-focused fieldset': { borderColor: '#E8734A', borderWidth: 1.5 },
                    },
                    '& .MuiInputBase-input': { py: 0.9, px: 1.4, fontSize: 12, color: '#CBD5E1' },
                    '& .MuiInputBase-input::placeholder': { color: '#6B7280', opacity: 1 },
                  }}
                />
                {/* Delete button */}
                <IconButton size="small" onClick={() => dispatch(removeItem(item.productId))}
                  sx={{
                    color: '#E8734A', bgcolor: 'transparent',
                    border: '1.5px solid #E8734A', borderRadius: 1.5,
                    p: 0.6, width: 34, height: 34, flexShrink: 0,
                    '&:hover': { bgcolor: 'rgba(232,115,74,0.12)' },
                  }}
                >
                  <DeleteIcon sx={{ fontSize: 16 }} />
                </IconButton>
              </Box>
            </Box>
          ))
        )}
      </Box>

      <Divider sx={{ borderColor: '#2D3250', my: 1.5 }} />

      <Box display="flex" justifyContent="space-between" mb={0.8}>
        <Typography color="#9CA3AF" fontSize={14}>Discount</Typography>
        <Typography color="white" fontSize={14}>${cart.discount.toFixed(2)}</Typography>
      </Box>
      <Box display="flex" justifyContent="space-between" mb={2}>
        <Typography color="#9CA3AF" fontSize={14}>Sub total</Typography>
        <Typography color="white" fontWeight={700} fontSize={14}>${subtotal.toFixed(2)}</Typography>
      </Box>

      <Button fullWidth variant="contained"
        disabled={cart.items.length === 0}
        onClick={onPayment}
        sx={{
          bgcolor: '#E8734A', '&:hover': { bgcolor: '#d4623b' },
          '&:disabled': { bgcolor: '#4a3028', color: '#7a5040' },
          py: 1.4, fontWeight: 700, fontSize: 15, borderRadius: 2.5, textTransform: 'none',
          boxShadow: 'none',
        }}
      >
        Continue to Payment
      </Button>
    </Box>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function POSPage() {
  const [activeCategory, setActiveCategory] = useState('Hot Dishes');
  const [search, setSearch] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderError, setOrderError] = useState('');
  const [cartDrawerOpen, setCartDrawerOpen] = useState(false);

  const isMobile = useMediaQuery('(max-width:768px)');
  const isTablet = useMediaQuery('(max-width:1024px)');

  const { data: products = [], isLoading } = useGetProductsQuery(undefined, { pollingInterval: 5000 });
  const [createOrder, { isLoading: isOrdering }] = useCreateOrderMutation();

  const dispatch = useDispatch();
  const cart = useSelector((s: RootState) => s.cart);
  const subtotal = useSelector(selectCartSubtotal);

  const filtered = products.filter((p: any) => {
    const matchCat = p.category === activeCategory;
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const handleConfirmPayment = async () => {
    setOrderError('');
    try {
      await createOrder({
        items: cart.items.map((i) => ({ productId: i.productId, quantity: i.quantity, note: i.note })),
        discount: cart.discount, orderType: cart.orderType,
        tableNo: cart.tableNo, customerName: cart.customerName, paymentMethod: cart.paymentMethod,
      }).unwrap();
      dispatch(clearCart());
      setShowConfirmation(false);
      setCartDrawerOpen(false);
      setOrderSuccess(true);
      setTimeout(() => setOrderSuccess(false), 3000);
    } catch (err: any) {
      setOrderError(err?.data?.message || 'Order failed. Check stock availability.');
    }
  };

  const [today, setToday] = useState('');
  const [orderNo, setOrderNo] = useState('');
  useEffect(() => {
    setToday(new Date().toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' }));
    setOrderNo(String(Math.floor(Math.random() * 90000 + 10000)));
  }, []);

  const cartItemCount = cart.items.reduce((s, i) => s + i.quantity, 0);

  const orderPanelProps = { cart, subtotal, orderNo, onPayment: () => setShowConfirmation(true), dispatch };

  const inputSx = {
    '& .MuiOutlinedInput-root': {
      bgcolor: '#252836', borderRadius: 1.5, fontSize: 13,
      '& fieldset': { borderColor: '#3D4060' },
      '&:hover fieldset': { borderColor: '#5A6080' },
      '&.Mui-focused fieldset': { borderColor: '#E8734A', borderWidth: 1.5 },
    },
    '& .MuiInputBase-input': { color: 'white', py: 1.1, px: 1.4 },
    '& .MuiInputBase-input::placeholder': { color: '#6B7280', opacity: 1 },
  };

  const ConfirmationOverlay = (
    <Box sx={{
      position: 'fixed', inset: 0, zIndex: 1200,
      display: 'flex', alignItems: 'stretch',
      pointerEvents: 'none',
    }}>
      {/* Dark overlay */}
      <Box sx={{
        flex: 1, backdropFilter: 'blur(2px)', bgcolor: 'rgba(5,5,10,0.55)',
        pointerEvents: 'auto',
        cursor: 'pointer',
        display: { xs: 'none', md: 'block' },
      }} onClick={() => setShowConfirmation(false)} />

      {/* Mobile: full screen overlay tap to close */}
      <Box sx={{
        display: { xs: 'block', md: 'none' },
        position: 'fixed', inset: 0, zIndex: -1,
        bgcolor: 'rgba(5,5,10,0.55)', backdropFilter: 'blur(2px)',
        pointerEvents: 'auto',
      }} onClick={() => setShowConfirmation(false)} />

      {/* Confirmation Panel */}
      <Box sx={{
        width: { xs: '100%', md: 420 }, flexShrink: 0, bgcolor: '#1F1D2B',
        p: 2.5, flexDirection: 'column', overflow: 'hidden',
        pointerEvents: 'auto',
        borderLeft: { xs: 'none', md: '1px solid #2D3048' },
        borderTopLeftRadius: { xs: 0, md: 16 },
        borderBottomLeftRadius: { xs: 0, md: 16 },
        maxWidth: { xs: '100vw', md: 420 },
        position: { xs: 'fixed', md: 'relative' },
        top: { xs: 0, md: 'auto' },
        left: { xs: 0, md: 'auto' },
        right: { xs: 0, md: 'auto' },
        bottom: { xs: 0, md: 'auto' },
        zIndex: { xs: 1, md: 'auto' },
        display: { xs: 'none', md: 'flex' },
      }}>
        <Box display="flex" alignItems="center" gap={1} mb={0.5}>
          <IconButton size="small" onClick={() => setShowConfirmation(false)} sx={{ color: 'white', p: 0.5 }}>
            <ArrowBackIcon fontSize="small" />
          </IconButton>
          <Typography variant="h5" fontWeight={700} color="white" fontSize={22}>Confirmation</Typography>
        </Box>
        <Typography variant="caption" color="text.secondary" mb={2} display="block">
          Orders #{orderNo}
        </Typography>

        <Box flex={1} overflow="auto" sx={{
          '&::-webkit-scrollbar': { width: 4 },
          '&::-webkit-scrollbar-thumb': { bgcolor: '#3D4060', borderRadius: 2 },
        }}>
          {cart.items.map((item) => (
            <Box key={item.productId} mb={2}>
              <Box display="flex" alignItems="center" gap={1.5}>
                <Box sx={{
                  width: 46, height: 46, borderRadius: '50%', bgcolor: '#3D4060',
                  overflow: 'hidden', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', fontSize: 20, flexShrink: 0,
                }}>
                  {item.imageUrl
                    ? <img src={item.imageUrl} alt={item.productName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : '🍜'}
                </Box>
                <Box flex={1} minWidth={0}>
                  <Typography fontWeight={600} color="white" noWrap fontSize={13} lineHeight={1.3}>
                    {item.productName.slice(0, 22)}{item.productName.length > 22 ? '...' : ''}
                  </Typography>
                  <Typography variant="caption" color="#9CA3AF" fontSize={12}>${item.price.toFixed(2)}</Typography>
                </Box>
                <Box display="flex" alignItems="center" gap={0.6}>
                  <IconButton size="small"
                    onClick={() => {
                      if (item.quantity <= 1) dispatch(removeItem(item.productId));
                      else dispatch(updateQuantity({ productId: item.productId, quantity: item.quantity - 1 }));
                    }}
                    sx={{ bgcolor: '#252836', color: 'white', borderRadius: 1, p: 0, width: 26, height: 26 }}
                  >
                    <RemoveIcon sx={{ fontSize: 13 }} />
                  </IconButton>
                  <Box sx={{ bgcolor: '#252836', borderRadius: 1, minWidth: 30, height: 26, display: 'flex', alignItems: 'center', justifyContent: 'center', px: 0.5 }}>
                    <Typography color="white" fontWeight={700} fontSize={13}>{item.quantity}</Typography>
                  </Box>
                  <IconButton size="small"
                    onClick={() => dispatch(updateQuantity({ productId: item.productId, quantity: item.quantity + 1 }))}
                    sx={{ bgcolor: '#252836', color: 'white', borderRadius: 1, p: 0, width: 26, height: 26 }}
                  >
                    <AddIcon sx={{ fontSize: 13 }} />
                  </IconButton>
                </Box>
                <Typography color="white" fontWeight={600} fontSize={13} minWidth={52} textAlign="right">
                  ${(item.price * item.quantity).toFixed(2)}
                </Typography>
              </Box>
              <Box display="flex" alignItems="center" gap={1} mt={1}>
                <TextField
                  size="small" placeholder="Order Note..." value={item.note} fullWidth
                  onChange={(e) => dispatch(updateNote({ productId: item.productId, note: e.target.value }))}
                  sx={{
                    '& .MuiOutlinedInput-root': { bgcolor: '#252836', fontSize: 12, borderRadius: 1.5, '& fieldset': { borderColor: '#3D4060' }, '&:hover fieldset': { borderColor: '#5A6080' } },
                    '& .MuiInputBase-input': { py: 0.9, px: 1.4, fontSize: 12, color: '#CBD5E1' },
                    '& .MuiInputBase-input::placeholder': { color: '#6B7280', opacity: 1 },
                  }}
                />
                <IconButton size="small" onClick={() => dispatch(removeItem(item.productId))}
                  sx={{ color: '#E8734A', border: '1.5px solid #E8734A', borderRadius: 1.5, p: 0.5, width: 34, height: 34, flexShrink: 0, '&:hover': { bgcolor: 'rgba(232,115,74,0.12)' } }}
                >
                  <DeleteIcon sx={{ fontSize: 16 }} />
                </IconButton>
              </Box>
            </Box>
          ))}
        </Box>

        <Divider sx={{ borderColor: '#2D3250', my: 1.5 }} />
        <Box display="flex" justifyContent="space-between" mb={0.6}>
          <Typography color="#9CA3AF" fontSize={13}>Discount</Typography>
          <Typography color="white" fontSize={13}>${cart.discount.toFixed(2)}</Typography>
        </Box>
        <Box display="flex" justifyContent="space-between">
          <Typography color="#9CA3AF" fontSize={13}>Sub total</Typography>
          <Typography color="white" fontWeight={700} fontSize={13}>${subtotal.toFixed(2)}</Typography>
        </Box>
      </Box>

      {/* Payment Panel */}
      <Box sx={{
        width: { xs: '100vw', md: 400 }, flexShrink: 0, bgcolor: '#1F1D2B',
        p: 2.5, display: 'flex', flexDirection: 'column', overflow: 'auto',
        pointerEvents: 'auto',
        borderLeft: '1px solid #2D3048',
        position: { xs: 'fixed', md: 'relative' },
        top: { xs: 0, md: 'auto' },
        right: { xs: 0, md: 'auto' },
        bottom: { xs: 0, md: 'auto' },
        height: { xs: '100vh', md: 'auto' },
        '&::-webkit-scrollbar': { width: 4 },
        '&::-webkit-scrollbar-thumb': { bgcolor: '#3D4060', borderRadius: 2 },
      }}>
        <Typography variant="h5" fontWeight={700} color="white" mb={0.4} fontSize={22}>Payment</Typography>
        <Typography variant="caption" color="text.secondary" mb={2} display="block">
          3 payment method available
        </Typography>
        <Divider sx={{ borderColor: '#2D3250', mb: 2 }} />

        <Typography color="white" fontWeight={600} fontSize={14} mb={1.2}>Payment Method</Typography>
        <Box display="flex" gap={1} mb={2.5}>
          {(['Credit Card', 'Paypal', 'Cash'] as const).map((m) => (
            <Button key={m} size="small"
              onClick={() => dispatch(setPaymentMethod(m))}
              sx={{
                flex: 1, py: 1.1, flexDirection: 'column', gap: 0.3,
                bgcolor: cart.paymentMethod === m ? '#E8734A' : '#252836',
                border: '1.5px solid',
                borderColor: cart.paymentMethod === m ? '#E8734A' : '#3D4060',
                color: 'white', fontSize: 11, textTransform: 'none', borderRadius: 2,
                '&:hover': { bgcolor: cart.paymentMethod === m ? '#d4623b' : '#2D3048' },
              }}
            >
              {m === 'Credit Card' && <Box component="span" sx={{ fontSize: 16 }}>💳</Box>}
              {m === 'Paypal' && <Box component="span" sx={{ fontSize: 16 }}>🅿</Box>}
              {m === 'Cash' && <Box component="span" sx={{ fontSize: 16 }}>💵</Box>}
              {m}
            </Button>
          ))}
        </Box>

        {cart.paymentMethod === 'Credit Card' && (
          <>
            <Typography color="#9CA3AF" fontSize={12} mb={0.7}>Cardholder Name</Typography>
            <TextField size="small" fullWidth value={cart.customerName}
              onChange={(e) => dispatch(setCustomerName(e.target.value))}
              placeholder="e.g. John Doe"
              sx={{ mb: 1.8, ...inputSx }}
            />
            <Typography color="#9CA3AF" fontSize={12} mb={0.7}>Card Number</Typography>
            <TextField size="small" fullWidth placeholder="0000 0000 0000 0000"
              inputProps={{ maxLength: 19 }}
              sx={{ mb: 1.8, ...inputSx }}
            />
            <Box display="flex" gap={1.5} mb={1.8}>
              <Box flex={1}>
                <Typography color="#9CA3AF" fontSize={12} mb={0.7}>Expiration Date</Typography>
                <TextField size="small" fullWidth placeholder="MM/YYYY"
                  inputProps={{ maxLength: 7 }}
                  sx={inputSx}
                />
              </Box>
              <Box flex={1}>
                <Typography color="#9CA3AF" fontSize={12} mb={0.7}>CVV</Typography>
                <TextField size="small" fullWidth placeholder="• • •"
                  type="password" inputProps={{ maxLength: 4 }}
                  sx={inputSx}
                />
              </Box>
            </Box>
          </>
        )}

        {cart.paymentMethod !== 'Credit Card' && (
          <>
            <Typography color="#9CA3AF" fontSize={12} mb={0.7}>Customer Name</Typography>
            <TextField size="small" fullWidth value={cart.customerName}
              onChange={(e) => dispatch(setCustomerName(e.target.value))}
              sx={{ mb: 1.8, ...inputSx }}
            />
          </>
        )}

        <Box display="flex" gap={1.5} mb={1.8}>
          <Box flex={1}>
            <Typography color="#9CA3AF" fontSize={12} mb={0.7}>Order Type</Typography>
            <Select size="small" value={cart.orderType} fullWidth
              onChange={(e) => dispatch(setOrderType(e.target.value as any))}
              IconComponent={KeyboardArrowDownIcon}
              sx={{
                bgcolor: '#252836', color: 'white', borderRadius: 1.5, fontSize: 13,
                '& .MuiOutlinedInput-notchedOutline': { borderColor: '#3D4060' },
                '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#5A6080' },
                '& .MuiSvgIcon-root': { color: '#9CA3AF' },
                '& .MuiSelect-select': { py: 1.1, px: 1.4 },
              }}
            >
              <MenuItem value="Dine In">Dine In</MenuItem>
              <MenuItem value="To Go">To Go</MenuItem>
              <MenuItem value="Delivery">Delivery</MenuItem>
            </Select>
          </Box>
          <Box flex={1}>
            <Typography color="#9CA3AF" fontSize={12} mb={0.7}>Table no.</Typography>
            <TextField size="small" fullWidth value={cart.tableNo}
              onChange={(e) => dispatch(setTableNo(e.target.value))}
              sx={inputSx}
            />
          </Box>
        </Box>

        {orderError && <Alert severity="error" sx={{ mb: 2, fontSize: 12 }}>{orderError}</Alert>}

        <Box display="flex" gap={1.5} mt="auto" pt={1}>
          <Button fullWidth variant="outlined" onClick={() => setShowConfirmation(false)}
            sx={{
              borderColor: '#E8734A', color: '#E8734A', textTransform: 'none',
              py: 0.7, borderRadius: 2, fontWeight: 600, fontSize: 13,
              minHeight: 36, lineHeight: 1,
              '&:hover': { bgcolor: 'rgba(232,115,74,0.08)', borderColor: '#E8734A' },
            }}
          >
            Cancel
          </Button>
          <Button fullWidth variant="contained" onClick={handleConfirmPayment} disabled={isOrdering}
            sx={{
              bgcolor: '#E8734A', '&:hover': { bgcolor: '#d4623b' },
              textTransform: 'none', py: 0.7, borderRadius: 2, fontWeight: 600, fontSize: 13,
              boxShadow: 'none', minHeight: 36, lineHeight: 1, whiteSpace: 'nowrap',
            }}
          >
            {isOrdering ? <CircularProgress size={18} sx={{ color: 'white' }} /> : 'Confirm Payment'}
          </Button>
        </Box>
      </Box>
    </Box>
  );

  return (
    <AppLayout>
      <Box display="flex" gap={2} height="calc(100vh - 48px)" overflow="hidden" position="relative">

        {/* ── LEFT: Product Selection ── */}
        <Box flex={1} overflow="auto" px={3} pr={{ xs: 3, lg: 3 }}
          sx={{ '&::-webkit-scrollbar': { width: 4 }, '&::-webkit-scrollbar-thumb': { bgcolor: '#3D4060', borderRadius: 2 } }}
        >
          {/* Header */}
          <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2} flexWrap="wrap" gap={1}>
            <Box>
              <Typography variant="h5" fontWeight={700} color="white" lineHeight={1.2} fontSize={{ xs: 18, sm: 22 }}>
                Jaegar Resto
              </Typography>
              <Typography variant="caption" color="text.secondary">{today}</Typography>
            </Box>
            <Box display="flex" alignItems="center" gap={1} flex={1} justifyContent="flex-end">
              <TextField
                size="small"
                placeholder="Search for food, coffee, etc..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                InputProps={{ startAdornment: <SearchIcon sx={{ color: '#9CA3AF', mr: 1, fontSize: 18 }} /> }}
                sx={{
                  width: { xs: '100%', sm: 240 },
                  '& .MuiOutlinedInput-root': {
                    bgcolor: '#252836', borderRadius: 2, fontSize: 13,
                    '& fieldset': { borderColor: '#3D4060' },
                    '&:hover fieldset': { borderColor: '#E8734A' },
                  },
                }}
              />
              {/* Mobile cart FAB */}
              {(isMobile || isTablet) && (
                <IconButton onClick={() => setCartDrawerOpen(true)}
                  sx={{ bgcolor: '#E8734A', color: 'white', borderRadius: 2, position: 'relative', flexShrink: 0,
                    '&:hover': { bgcolor: '#d4623b' } }}
                >
                  <ShoppingCartIcon fontSize="small" />
                  {cartItemCount > 0 && (
                    <Box sx={{
                      position: 'absolute', top: -4, right: -4, bgcolor: 'white', color: '#E8734A',
                      borderRadius: '50%', width: 18, height: 18, fontSize: 10, fontWeight: 700,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      {cartItemCount}
                    </Box>
                  )}
                </IconButton>
              )}
            </Box>
          </Box>

          {/* Category Tabs */}
          <Box display="flex" gap={{ xs: 1.5, sm: 2.5 }} mb={2}
            sx={{ borderBottom: '1px solid #2D3048', pb: 1, overflowX: 'auto',
              '&::-webkit-scrollbar': { height: 0 } }}
          >
            {CATEGORIES.map((cat) => (
              <Typography key={cat} variant="body2" onClick={() => setActiveCategory(cat)}
                sx={{
                  cursor: 'pointer', color: activeCategory === cat ? '#E8734A' : '#9CA3AF',
                  borderBottom: activeCategory === cat ? '2px solid #E8734A' : '2px solid transparent',
                  pb: 0.5, fontWeight: activeCategory === cat ? 600 : 400,
                  whiteSpace: 'nowrap', fontSize: { xs: 12, sm: 13 }, transition: 'color 0.15s',
                }}
              >
                {cat}
              </Typography>
            ))}
          </Box>

          {/* Choose Dishes + order type toggle */}
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6" fontWeight={600} color="white" fontSize={{ xs: 14, sm: 16 }}>
              Choose Dishes
            </Typography>
            <Button endIcon={<KeyboardArrowDownIcon />}
              sx={{
                bgcolor: '#252836', color: 'white', border: '1px solid #3D4060',
                borderRadius: 2, px: 2, py: 0.6, fontSize: 13, textTransform: 'none',
                '&:hover': { bgcolor: '#1F1D2B' },
              }}
              onClick={() => {
                const types = ['Dine In', 'To Go', 'Delivery'] as const;
                const idx = types.indexOf(cart.orderType as any);
                dispatch(setOrderType(types[(idx + 1) % types.length]));
              }}
            >
              {cart.orderType}
            </Button>
          </Box>

          {orderSuccess && (
            <Alert severity="success" sx={{ mb: 2, fontSize: 13 }}>Order placed successfully!</Alert>
          )}

          {isLoading ? (
            <Box display="flex" justifyContent="center" mt={6}>
              <CircularProgress sx={{ color: '#E8734A' }} />
            </Box>
          ) : (
            <Grid container columnSpacing={4} rowSpacing={7} sx={{ overflow: 'visible', pt: { xs: '45px', sm: '60px' } }}>
              {filtered.map((product: any) => {
                const inStock = product.availableUnits == null || product.availableUnits > 0;
                return (
                  <Grid item key={product._id} xs={6} sm={4}
                    sx={{ overflow: 'visible' }}
                  >
                    <Card
                      elevation={0}
                      onClick={() => inStock && dispatch(addItem({
                        productId: product._id, productName: product.name,
                        price: product.price, imageUrl: product.imageUrl,
                      }))}
                      sx={{
                        bgcolor: '#1F1D2B', cursor: inStock ? 'pointer' : 'not-allowed',
                        opacity: inStock ? 1 : 0.45, transition: 'transform 0.15s, background 0.15s',
                        borderRadius: 3, border: '1px solid #2D3048',
                        overflow: 'visible',
                        height: 240,
                        '&:hover': inStock ? { transform: 'translateY(-2px)', bgcolor: '#2D3048', borderColor: '#3D4060' } : {},
                      }}
                    >
                      <CardContent sx={{
                        textAlign: 'center',
                        p: 4,
                        pb: '16px !important',
                        overflow: 'visible',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        height: '100%',
                        boxSizing: 'border-box',
                      }}>
                        <ProductImage src={product.imageUrl} alt={product.name} size={isMobile ? 80 : 130} />
                        <Typography variant="body2" fontWeight={600} color="white" mb={0.5}
                          sx={{
                            fontSize: { xs: 11, sm: 13 }, lineHeight: 1.4,
                            display: '-webkit-box', WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical', overflow: 'hidden',
                          }}
                        >
                          {product.name}
                        </Typography>
                        <Typography variant="body2" color="#E8734A" fontWeight={700} fontSize={{ xs: 12, sm: 14 }} mb={0.3}>
                          ${product.price.toFixed(2)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" fontSize={11}>
                          {product.availableUnits ?? 999} Bowls available
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>
          )}
        </Box>

        {/* ── RIGHT: Order Panel (desktop/large tablet) ── */}
        {!isMobile && !isTablet && !showConfirmation && (
          <Box sx={{ width: 320, flexShrink: 0 }}>
            <OrderPanel {...orderPanelProps} />
          </Box>
        )}

        {/* ── Confirmation + Payment overlay ── */}
      </Box>

      {showConfirmation && ConfirmationOverlay}

      {/* ── Mobile/Tablet Cart Drawer ── */}
      <Drawer
        anchor="right"
        open={cartDrawerOpen}
        onClose={() => setCartDrawerOpen(false)}
        PaperProps={{ sx: { width: { xs: '90vw', sm: 340 }, bgcolor: '#1F1D2B', p: 0 } }}
      >
        <Box height="100%" p={0}>
          <Box display="flex" alignItems="center" gap={1} p={2} pb={0}>
            <IconButton size="small" onClick={() => setCartDrawerOpen(false)} sx={{ color: 'white' }}>
              <ArrowBackIcon />
            </IconButton>
            <Typography variant="h6" fontWeight={700} color="white" fontSize={15}>Cart</Typography>
          </Box>
          <Box height="calc(100% - 48px)" p={1.5}>
            <OrderPanel {...orderPanelProps} />
          </Box>
        </Box>
      </Drawer>

    </AppLayout>
  );
}

