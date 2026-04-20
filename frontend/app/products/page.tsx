'use client';
import { useState, useRef } from 'react';
import AppLayout from '@/components/AppLayout';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
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

export default function ProductsPage() {
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
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/upload/image`,
        { method: 'POST', body: formData },
      );
      const data = await res.json();
      setForm((prev) => ({ ...prev, imageUrl: data.url }));
    } catch {
      alert('Image upload failed');
    } finally {
      setUploading(false);
    }
  };

  const filtered = products.filter((p: any) => p.category === activeCategory);

  const handleOpen = (product?: any) => {
    if (product) {
      setEditId(product._id);
      setForm({
        name: product.name,
        price: product.price,
        category: product.category,
        imageUrl: product.imageUrl || '',
        recipe: product.recipe || [],
      });
    } else {
      setEditId(null);
      setForm({ ...emptyForm, category: activeCategory });
    }
    setOpen(true);
  };

  const handleSave = async () => {
    if (editId) {
      await updateProduct({ id: editId, data: form });
    } else {
      await createProduct(form);
    }
    setOpen(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this product?')) await deleteProduct(id);
  };

  const addIngredient = () => {
    setForm({
      ...form,
      recipe: [...form.recipe, { rawMaterialId: '', quantity: 0 }],
    });
  };

  const updateIngredient = (index: number, field: string, value: any) => {
    const updated = [...form.recipe];
    updated[index] = { ...updated[index], [field]: value };
    setForm({ ...form, recipe: updated });
  };

  const removeIngredient = (index: number) => {
    setForm({ ...form, recipe: form.recipe.filter((_, i) => i !== index) });
  };

  return (
    <AppLayout>
      <Box>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h4" fontWeight={700} color="white">
            Products Management
          </Typography>
          <Button
            variant="outlined"
            sx={{ borderColor: '#3D4060', color: 'white' }}
          >
            Manage Categories
          </Button>
        </Box>

        {/* Category Tabs */}
        <Box display="flex" gap={3} mb={3} sx={{ borderBottom: '1px solid #3D4060', pb: 1, overflowX: 'auto', '&::-webkit-scrollbar': { height: 0 } }}>
          {CATEGORIES.map((cat) => (
            <Typography
              key={cat}
              variant="body2"
              onClick={() => setActiveCategory(cat)}
              sx={{
                cursor: 'pointer',
                color: activeCategory === cat ? '#E8734A' : '#9CA3AF',
                borderBottom: activeCategory === cat ? '2px solid #E8734A' : '2px solid transparent',
                pb: 0.5,
                fontWeight: activeCategory === cat ? 600 : 400,
                whiteSpace: 'nowrap',
              }}
            >
              {cat}
            </Typography>
          ))}
        </Box>

        {isLoading ? (
          <Box display="flex" justifyContent="center" mt={4}>
            <CircularProgress sx={{ color: '#E8734A' }} />
          </Box>
        ) : (
          <Grid container spacing={2}>
            {/* Add New Card */}
            <Grid item xs={6} sm={4} md={3} lg={2}>
              <Card
                onClick={() => handleOpen()}
                sx={{
                  bgcolor: 'transparent',
                  border: '2px dashed #E8734A',
                  cursor: 'pointer',
                  borderRadius: 3,
                  height: 220,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  '&:hover': { bgcolor: 'rgba(232,115,74,0.05)' },
                }}
              >
                <Box textAlign="center">
                  <AddIcon sx={{ color: '#E8734A', fontSize: 32 }} />
                  <Typography variant="body2" color="#E8734A" fontWeight={600} mt={1}>
                    Add new dish
                  </Typography>
                </Box>
              </Card>
            </Grid>

            {filtered.map((product: any) => (
              <Grid item key={product._id} xs={6} sm={4} md={3} lg={2}>
                <Card
                  sx={{
                    bgcolor: '#1F1D2B',
                    borderRadius: 3,
                    height: 220,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    p: 2,
                    boxSizing: 'border-box',
                    position: 'relative',
                  }}
                >
                  {/* Edit/Delete icons */}
                  <Box sx={{ position: 'absolute', top: 8, right: 8, display: 'flex', gap: 0.5 }}>
                    <IconButton
                      size="small"
                      onClick={() => handleOpen(product)}
                      sx={{ color: '#9CA3AF', '&:hover': { color: '#E8734A' }, p: 0.5 }}
                    >
                      <EditIcon sx={{ fontSize: 16 }} />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDelete(product._id)}
                      sx={{ color: '#9CA3AF', '&:hover': { color: '#F44336' }, p: 0.5 }}
                    >
                      <DeleteIcon sx={{ fontSize: 16 }} />
                    </IconButton>
                  </Box>

                  {/* Circular image */}
                  <Box
                    sx={{
                      width: 100,
                      height: 100,
                      borderRadius: '50%',
                      bgcolor: '#3D4060',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 36,
                      overflow: 'hidden',
                      flexShrink: 0,
                      mt: 1,
                    }}
                  >
                    {product.imageUrl ? (
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    ) : (
                      '🍜'
                    )}
                  </Box>

                  {/* Text info */}
                  <Box textAlign="center" sx={{ width: '100%' }}>
                    <Typography
                      variant="body2"
                      fontWeight={600}
                      color="white"
                      mb={0.3}
                      sx={{
                        overflow: 'hidden',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        lineHeight: 1.3,
                        fontSize: '0.8rem',
                      }}
                    >
                      {product.name}
                    </Typography>
                    <Typography variant="caption" color="#E8734A" fontWeight={600}>
                      $ {product.price.toFixed(2)}
                    </Typography>
                    <Typography variant="caption" color="#6B7280" display="block" fontSize="0.7rem">
                      {product.availableUnits ?? 0} available
                    </Typography>
                  </Box>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}

        <Box display="flex" gap={2} mt={3}>
          <Button variant="outlined" sx={{ borderColor: '#E8734A', color: '#E8734A' }}>
            Discard Changes
          </Button>
          <Button variant="contained" sx={{ bgcolor: '#E8734A', '&:hover': { bgcolor: '#d4623b' } }}>
            Save Changes
          </Button>
        </Box>
      </Box>

      {/* Add/Edit Product Dialog */}
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { bgcolor: '#1F1D2B', borderRadius: 3 } }}
      >
        <DialogTitle sx={{ color: 'white', fontWeight: 700 }}>
          {editId ? 'Edit Product' : 'Add New Product'}
        </DialogTitle>
        <DialogContent>
          <TextField
            label="Product Name"
            fullWidth
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            sx={{ mb: 2, mt: 1, '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: '#3D4060' } } }}
          />
          <TextField
            label="Price ($)"
            type="number"
            fullWidth
            value={form.price}
            onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
            sx={{ mb: 2, '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: '#3D4060' } } }}
          />
          <TextField
            select
            label="Category"
            fullWidth
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            sx={{ mb: 2, '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: '#3D4060' } } }}
          >
            {CATEGORIES.map((cat) => (
              <MenuItem key={cat} value={cat}>{cat}</MenuItem>
            ))}
          </TextField>
          {/* Image Upload */}
          <Box mb={2}>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleImageUpload}
            />
            <Box display="flex" alignItems="center" gap={2}>
              <Box
                sx={{
                  width: 72,
                  height: 72,
                  borderRadius: 2,
                  bgcolor: '#3D4060',
                  border: '2px dashed #E8734A',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                  flexShrink: 0,
                }}
              >
                {form.imageUrl ? (
                  <img
                    src={form.imageUrl}
                    alt="preview"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <CloudUploadIcon sx={{ color: '#E8734A', fontSize: 28 }} />
                )}
              </Box>
              <Box>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  startIcon={uploading ? <CircularProgress size={14} sx={{ color: '#E8734A' }} /> : <CloudUploadIcon />}
                  sx={{ borderColor: '#E8734A', color: '#E8734A', mb: 0.5 }}
                >
                  {uploading ? 'Uploading...' : 'Upload Image'}
                </Button>
                <Typography variant="caption" color="text.secondary" display="block">
                  JPG, PNG up to 5MB
                </Typography>
              </Box>
            </Box>
          </Box>

          <Typography variant="body2" color="text.secondary" mb={1} fontWeight={600}>
            Recipe (Ingredients)
          </Typography>
          {form.recipe.map((ing, i) => (
            <Box key={i} display="flex" gap={1} mb={1} alignItems="center">
              <TextField
                select
                label="Raw Material"
                size="small"
                value={ing.rawMaterialId}
                onChange={(e) => updateIngredient(i, 'rawMaterialId', e.target.value)}
                sx={{ flex: 2, '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: '#3D4060' } } }}
              >
                {rawMaterials.map((m: any) => (
                  <MenuItem key={m._id} value={m._id}>
                    {m.name} ({m.unit})
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                label="Qty"
                type="number"
                size="small"
                value={ing.quantity}
                onChange={(e) => updateIngredient(i, 'quantity', Number(e.target.value))}
                sx={{ flex: 1, '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: '#3D4060' } } }}
              />
              <IconButton size="small" onClick={() => removeIngredient(i)} sx={{ color: '#F44336' }}>
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Box>
          ))}
          <Button
            startIcon={<AddIcon />}
            size="small"
            onClick={addIngredient}
            sx={{ color: '#E8734A', mt: 0.5 }}
          >
            Add Ingredient
          </Button>
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button onClick={() => setOpen(false)} variant="outlined" sx={{ borderColor: '#3D4060', color: 'white' }}>
            Cancel
          </Button>
          <Button onClick={handleSave} variant="contained" sx={{ bgcolor: '#E8734A', '&:hover': { bgcolor: '#d4623b' } }}>
            {editId ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </AppLayout>
  );
}
