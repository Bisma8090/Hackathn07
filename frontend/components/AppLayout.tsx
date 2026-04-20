'use client';
import { Suspense } from 'react';
import Box from '@mui/material/Box';
import Sidebar from './Sidebar';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#252836' }}>
      <Suspense fallback={null}>
        <Sidebar />
      </Suspense>
      <Box sx={{ flex: 1, ml: '100px', p: 3, overflowY: 'auto', display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        {children}
      </Box>
    </Box>
  );
}
