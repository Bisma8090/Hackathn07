'use client';
import { Suspense } from 'react';
import AppLayout from '@/components/AppLayout';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemIcon from '@mui/material/ListItemIcon';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import PaletteIcon from '@mui/icons-material/Palette';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import GridViewIcon from '@mui/icons-material/GridView';
import NotificationsIcon from '@mui/icons-material/Notifications';
import LockIcon from '@mui/icons-material/Lock';
import InfoIcon from '@mui/icons-material/Info';
import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import IconButton from '@mui/material/IconButton';
import CircularProgress from '@mui/material/CircularProgress';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import {
  useGetProductsQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
  useGetRawMaterialsQuery,
} from '@/lib/api';

const CATEGORIES = ['Hot Dishes', 'Cold Dishes', 'Soup', 'Grill', 'Appetizer', 'Dessert'];
const emptyForm = {
  name: '',
  price: 0,
  category: 'Hot Dishes',
  imageUrl: '',
  recipe: [] as { rawMaterialId: string; quantity: number }[],
};

function ProductsManagementContent() {
  const { data: products = [], isLoading } = useGetProductsQuery();
  const { data: rawMaterials = [] } = useGetRawMaterialsQuery();
  const [createProduct] = useCreateProductMutation();
  const [updateProduct] = useUpdateProductMutation();
  const [deleteProduct] = useDeleteProductMutation();

  const [activeCategory, setActiveCategory] = useState('Hot Dishes');
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/upload/image`, { method: 'POST', body: formData });
      const data = await res.json();
      setForm((prev) => ({ ...prev, imageUrl: data.url }));
    } catch { alert('Image upload failed'); }
    finally { setUploading(false); }
  };

  const filtered = products.filter((p: any) => p.category === activeCategory);

  const handleOpen = (product?: any) => {
    if (product) {
      setEditId(product._id);
      setForm({ name: product.name, price: product.price, category: product.category, imageUrl: product.imageUrl || '', recipe: product.recipe || [] });
    } else {
      setEditId(null);
      setForm({ ...emptyForm, category: activeCategory });
    }
    setOpen(true);
  };

  const handleSave = async () => {
    if (editId) await updateProduct({ id: editId, data: form });
    else await createProduct(form);
    setOpen(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this product?')) await deleteProduct(id);
  };

  const addIngredient = () => setForm({ ...form, recipe: [...form.recipe, { rawMaterialId: '', quantity: 0 }] });
  const updateIngredient = (index: number, field: string, value: any) => {
    const updated = [...form.recipe];
    updated[index] = { ...updated[index], [field]: value };
    setForm({ ...form, recipe: updated });
  };
  const removeIngredient = (index: number) => setForm({ ...form, recipe: form.recipe.filter((_, i) => i !== index) });

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6" fontWeight={700} color="white">Products Management</Typography>
        <Button variant="outlined" sx={{ borderColor: '#3D4060', color: 'white' }}>Manage Categories</Button>
      </Box>

      <Box display="flex" gap={3} mb={2} sx={{ borderBottom: '1px solid #3D4060', pb: 1, overflowX: 'auto', '&::-webkit-scrollbar': { height: 0 } }}>
        {CATEGORIES.map((cat) => (
          <Typography key={cat} variant="body2" onClick={() => setActiveCategory(cat)}
            sx={{ cursor: 'pointer', color: activeCategory === cat ? '#E8734A' : '#9CA3AF', borderBottom: activeCategory === cat ? '2px solid #E8734A' : '2px solid transparent', pb: 0.5, fontWeight: activeCategory === cat ? 600 : 400, whiteSpace: 'nowrap' }}>
            {cat}
          </Typography>
        ))}
      </Box>

      {isLoading ? (
        <Box display="flex" justifyContent="center" mt={4}><CircularProgress sx={{ color: '#E8734A' }} /></Box>
      ) : (
        <Grid container spacing={2}>
          <Grid item xs={12} sm={4}>
            <Card onClick={() => handleOpen()} sx={{ bgcolor: 'transparent', border: '2px dashed #E8734A', cursor: 'pointer', minHeight: 220, display: 'flex', alignItems: 'center', justifyContent: 'center', '&:hover': { bgcolor: 'rgba(232,115,74,0.05)' } }}>
              <Box textAlign="center">
                <AddIcon sx={{ color: '#E8734A', fontSize: 32 }} />
                <Typography variant="body2" color="#E8734A" fontWeight={600} mt={1}>Add new dish</Typography>
              </Box>
            </Card>
          </Grid>
          {filtered.map((product: any) => (
            <Grid item key={product._id} xs={12} sm={4}>
              <Card sx={{ bgcolor: '#252836', minHeight: 220, borderRadius: 2 }}>
                <CardContent sx={{ textAlign: 'center', p: 2 }}>
                  <Box sx={{ width: 100, height: 100, borderRadius: '50%', bgcolor: '#3D4060', mx: 'auto', mb: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36, overflow: 'hidden' }}>
                    {product.imageUrl ? <img src={product.imageUrl} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : '🍜'}
                  </Box>
                  <Typography variant="body2" fontWeight={600} color="white" mb={0.5}>{product.name}</Typography>
                  <Typography variant="caption" color="#E8734A" display="block">${product.price.toFixed(2)}</Typography>
                  <Typography variant="caption" color="#9CA3AF" display="block" mb={1}>{product.availableUnits} available</Typography>
                  <Button fullWidth size="small" startIcon={<EditIcon />} onClick={() => handleOpen(product)}
                    sx={{ bgcolor: 'rgba(232,115,74,0.18)', color: '#E8734A', borderRadius: 2, '&:hover': { bgcolor: 'rgba(232,115,74,0.28)' } }}>
                    Edit dish
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { bgcolor: '#1F1D2B', borderRadius: 3 } }}>
        <DialogTitle sx={{ color: 'white', fontWeight: 700 }}>{editId ? 'Edit Product' : 'Add New Product'}</DialogTitle>
        <DialogContent>
          <TextField label="Product Name" fullWidth value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} sx={{ mb: 2, mt: 1, '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: '#3D4060' } } }} />
          <TextField label="Price ($)" type="number" fullWidth value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} sx={{ mb: 2, '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: '#3D4060' } } }} />
          <TextField select label="Category" fullWidth value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} sx={{ mb: 2, '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: '#3D4060' } } }}>
            {CATEGORIES.map((cat) => <MenuItem key={cat} value={cat}>{cat}</MenuItem>)}
          </TextField>
          <Box mb={2}>
            <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImageUpload} />
            <Box display="flex" alignItems="center" gap={2}>
              <Box sx={{ width: 72, height: 72, borderRadius: 2, bgcolor: '#3D4060', border: '2px dashed #E8734A', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}>
                {form.imageUrl ? <img src={form.imageUrl} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <CloudUploadIcon sx={{ color: '#E8734A', fontSize: 28 }} />}
              </Box>
              <Box>
                <Button variant="outlined" size="small" onClick={() => fileInputRef.current?.click()} disabled={uploading}
                  startIcon={uploading ? <CircularProgress size={14} sx={{ color: '#E8734A' }} /> : <CloudUploadIcon />}
                  sx={{ borderColor: '#E8734A', color: '#E8734A', mb: 0.5 }}>
                  {uploading ? 'Uploading...' : 'Upload Image'}
                </Button>
                <Typography variant="caption" color="text.secondary" display="block">JPG, PNG up to 5MB</Typography>
              </Box>
            </Box>
          </Box>
          <Typography variant="body2" color="text.secondary" mb={1} fontWeight={600}>Recipe (Ingredients)</Typography>
          {form.recipe.map((ing, i) => (
            <Box key={i} display="flex" gap={1} mb={1} alignItems="center">
              <TextField select label="Raw Material" size="small" value={ing.rawMaterialId} onChange={(e) => updateIngredient(i, 'rawMaterialId', e.target.value)} sx={{ flex: 2, '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: '#3D4060' } } }}>
                {rawMaterials.map((m: any) => <MenuItem key={m._id} value={m._id}>{m.name} ({m.unit})</MenuItem>)}
              </TextField>
              <TextField label="Qty" type="number" size="small" value={ing.quantity} onChange={(e) => updateIngredient(i, 'quantity', Number(e.target.value))} sx={{ flex: 1, '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: '#3D4060' } } }} />
              <IconButton size="small" onClick={() => removeIngredient(i)} sx={{ color: '#F44336' }}><DeleteIcon fontSize="small" /></IconButton>
            </Box>
          ))}
          <Button startIcon={<AddIcon />} size="small" onClick={addIngredient} sx={{ color: '#E8734A', mt: 0.5 }}>Add Ingredient</Button>
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button onClick={() => setOpen(false)} variant="outlined" sx={{ borderColor: '#3D4060', color: 'white' }}>Cancel</Button>
          <Button onClick={handleSave} variant="contained" sx={{ bgcolor: '#E8734A', '&:hover': { bgcolor: '#d4623b' } }}>{editId ? 'Update' : 'Create'}</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

const MENU_ITEMS = [
  { icon: <PaletteIcon />, label: 'Appearance', sub: 'Dark and Light mode, Font size' },
  { icon: <RestaurantIcon />, label: 'Your Restaurant', sub: 'Dark and Light mode, Font size' },
  { icon: <GridViewIcon />, label: 'Products Management', sub: 'Manage your product, pricing, etc', active: true },
  { icon: <NotificationsIcon />, label: 'Notifications', sub: 'Customize your notifications' },
  { icon: <LockIcon />, label: 'Security', sub: 'Configure Password, PIN etc' },
  { icon: <InfoIcon />, label: 'About Us', sub: 'Find out more about Posly' },
];

export default function SettingsPage() {
  return (
    <Suspense fallback={null}>
      <SettingsContent />
    </Suspense>
  );
}

function SettingsContent() {
  const searchParams = useSearchParams();
  const [active, setActive] = useState('Products Management');

  useEffect(() => {
    const section = searchParams.get('section');
    if (section === 'products') setActive('Products Management');
  }, [searchParams]);

  return (
    <AppLayout>
      <Typography variant="h4" fontWeight={700} color="white" mb={3}>
        Settings
      </Typography>
      <Box display="flex" gap={2} flexDirection={{ xs: 'column', md: 'row' }}>
        {/* Left Menu */}
        <Card sx={{ bgcolor: '#1F1D2B', width: { xs: '100%', md: 260 }, flexShrink: 0 }}>
          <List dense>
            {MENU_ITEMS.map((item) => (
              <ListItem
                key={item.label}
                onClick={() => setActive(item.label)}
                sx={{
                  cursor: 'pointer',
                  borderRadius: 2,
                  mx: 1,
                  my: 0.5,
                  bgcolor: active === item.label ? 'rgba(232,115,74,0.15)' : 'transparent',
                  borderLeft: active === item.label ? '3px solid #E8734A' : '3px solid transparent',
                  '&:hover': { bgcolor: 'rgba(232,115,74,0.08)' },
                }}
              >
                <ListItemIcon sx={{ color: active === item.label ? '#E8734A' : '#9CA3AF', minWidth: 36 }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Typography
                      variant="body2"
                      fontWeight={600}
                      color={active === item.label ? '#E8734A' : 'white'}
                    >
                      {item.label}
                    </Typography>
                  }
                  secondary={
                    <Typography variant="caption" color="text.secondary">
                      {item.sub}
                    </Typography>
                  }
                />
              </ListItem>
            ))}
          </List>
        </Card>

        {/* Right Content */}
        <Card sx={{ bgcolor: '#1F1D2B', flex: 1, minWidth: 0 }}>
          <CardContent>
            {active === 'Products Management' ? (
              <ProductsManagementContent />
            ) : (
              <>
                <Typography variant="h6" fontWeight={700} color="white" mb={2}>
                  {active}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Configure {active.toLowerCase()} settings here.
                </Typography>
              </>
            )}
          </CardContent>
        </Card>
      </Box>
    </AppLayout>
  );
}
