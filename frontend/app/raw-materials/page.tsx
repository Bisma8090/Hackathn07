'use client';
import { useState } from 'react';
import AppLayout from '@/components/AppLayout';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import IconButton from '@mui/material/IconButton';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import WarningIcon from '@mui/icons-material/Warning';
import {
  useGetRawMaterialsQuery,
  useCreateRawMaterialMutation,
  useUpdateRawMaterialMutation,
  useDeleteRawMaterialMutation,
} from '@/lib/api';

const UNITS = ['g', 'ml', 'pcs', 'kg', 'L'];

const emptyForm = { name: '', unit: 'g', quantity: 0, minStockAlert: 0, costPerUnit: 0 };

export default function RawMaterialsPage() {
  const { data: materials = [], isLoading } = useGetRawMaterialsQuery();
  const [createMaterial] = useCreateRawMaterialMutation();
  const [updateMaterial] = useUpdateRawMaterialMutation();
  const [deleteMaterial] = useDeleteRawMaterialMutation();

  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  const handleOpen = (mat?: any) => {
    if (mat) {
      setEditId(mat._id);
      setForm({
        name: mat.name,
        unit: mat.unit,
        quantity: mat.quantity,
        minStockAlert: mat.minStockAlert,
        costPerUnit: mat.costPerUnit,
      });
    } else {
      setEditId(null);
      setForm(emptyForm);
    }
    setOpen(true);
  };

  const handleSave = async () => {
    if (editId) {
      await updateMaterial({ id: editId, data: form });
    } else {
      await createMaterial(form);
    }
    setOpen(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this raw material?')) {
      await deleteMaterial(id);
    }
  };

  return (
    <AppLayout>
      <Box>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Box>
            <Typography variant="h4" fontWeight={700} color="white">
              Raw Materials
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Manage your inventory raw materials
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpen()}
            sx={{ bgcolor: '#E8734A', '&:hover': { bgcolor: '#d4623b' } }}
          >
            Add Material
          </Button>
        </Box>

        {/* Low Stock Alert */}
        {materials.filter((m: any) => m.quantity <= m.minStockAlert && m.minStockAlert > 0).length > 0 && (
          <Card sx={{ bgcolor: 'rgba(255,152,0,0.1)', border: '1px solid #FF9800', mb: 2 }}>
            <CardContent sx={{ py: 1.5 }}>
              <Box display="flex" alignItems="center" gap={1}>
                <WarningIcon sx={{ color: '#FF9800' }} />
                <Typography variant="body2" color="#FF9800" fontWeight={600}>
                  {materials.filter((m: any) => m.quantity <= m.minStockAlert && m.minStockAlert > 0).length} materials are running low on stock
                </Typography>
              </Box>
            </CardContent>
          </Card>
        )}

        <Card sx={{ bgcolor: '#1F1D2B' }}>
          <CardContent sx={{ p: 0 }}>
            {isLoading ? (
              <Box display="flex" justifyContent="center" p={4}>
                <CircularProgress sx={{ color: '#E8734A' }} />
              </Box>
            ) : (
              <Box sx={{ overflowX: 'auto' }}>
                <Table sx={{ minWidth: 600 }}>
                <TableHead>
                  <TableRow>
                    {['Name', 'Unit', 'Current Stock', 'Min Alert', 'Cost/Unit', 'Status', 'Actions'].map((h) => (
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
                  {materials.map((mat: any) => {
                    const isLow = mat.minStockAlert > 0 && mat.quantity <= mat.minStockAlert;
                    return (
                      <TableRow key={mat._id} sx={{ '&:hover': { bgcolor: '#2D3048' } }}>
                        <TableCell sx={{ color: 'white', borderColor: '#3D4060' }}>
                          {mat.name}
                        </TableCell>
                        <TableCell sx={{ color: '#9CA3AF', borderColor: '#3D4060' }}>
                          {mat.unit}
                        </TableCell>
                        <TableCell sx={{ color: 'white', borderColor: '#3D4060', fontWeight: 600 }}>
                          {mat.quantity.toLocaleString()} {mat.unit}
                        </TableCell>
                        <TableCell sx={{ color: '#9CA3AF', borderColor: '#3D4060' }}>
                          {mat.minStockAlert} {mat.unit}
                        </TableCell>
                        <TableCell sx={{ color: '#9CA3AF', borderColor: '#3D4060' }}>
                          ${mat.costPerUnit}
                        </TableCell>
                        <TableCell sx={{ borderColor: '#3D4060' }}>
                          <Chip
                            label={isLow ? 'Low Stock' : 'In Stock'}
                            size="small"
                            sx={{
                              bgcolor: isLow ? 'rgba(255,152,0,0.15)' : 'rgba(76,175,80,0.15)',
                              color: isLow ? '#FF9800' : '#4CAF50',
                              fontWeight: 600,
                              fontSize: 11,
                            }}
                          />
                        </TableCell>
                        <TableCell sx={{ borderColor: '#3D4060' }}>
                          <IconButton
                            size="small"
                            onClick={() => handleOpen(mat)}
                            sx={{ color: '#E8734A', mr: 0.5 }}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => handleDelete(mat._id)}
                            sx={{ color: '#F44336' }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
                </Table>
              </Box>
            )}
          </CardContent>
        </Card>
      </Box>

      {/* Add/Edit Dialog */}
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        PaperProps={{ sx: { bgcolor: '#1F1D2B', borderRadius: 3, minWidth: 400 } }}
      >
        <DialogTitle sx={{ color: 'white', fontWeight: 700 }}>
          {editId ? 'Edit Raw Material' : 'Add Raw Material'}
        </DialogTitle>
        <DialogContent>
          <TextField
            label="Name"
            fullWidth
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            sx={{ mb: 2, mt: 1, '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: '#3D4060' } } }}
          />
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Unit</InputLabel>
            <Select
              value={form.unit}
              label="Unit"
              onChange={(e) => setForm({ ...form, unit: e.target.value })}
              sx={{ '& .MuiOutlinedInput-notchedOutline': { borderColor: '#3D4060' } }}
            >
              {UNITS.map((u) => (
                <MenuItem key={u} value={u}>{u}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            label="Current Quantity"
            type="number"
            fullWidth
            value={form.quantity}
            onChange={(e) => setForm({ ...form, quantity: Number(e.target.value) })}
            sx={{ mb: 2, '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: '#3D4060' } } }}
          />
          <TextField
            label="Min Stock Alert"
            type="number"
            fullWidth
            value={form.minStockAlert}
            onChange={(e) => setForm({ ...form, minStockAlert: Number(e.target.value) })}
            sx={{ mb: 2, '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: '#3D4060' } } }}
          />
          <TextField
            label="Cost Per Unit ($)"
            type="number"
            fullWidth
            value={form.costPerUnit}
            onChange={(e) => setForm({ ...form, costPerUnit: Number(e.target.value) })}
            sx={{ '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: '#3D4060' } } }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button
            onClick={() => setOpen(false)}
            variant="outlined"
            sx={{ borderColor: '#3D4060', color: 'white' }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            variant="contained"
            sx={{ bgcolor: '#E8734A', '&:hover': { bgcolor: '#d4623b' } }}
          >
            {editId ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </AppLayout>
  );
}
