'use client';
import Box from '@mui/material/Box';
import useMediaQuery from '@mui/material/useMediaQuery';
import Sidebar from './Sidebar';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const isMobile = useMediaQuery('(max-width:768px)');
  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#252836' }}>
      <Sidebar />
      <Box sx={{
        flex: 1,
        ml: isMobile ? 0 : '72px',
        mt: isMobile ? '56px' : 0,
        p: { xs: 2, sm: 3 },
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        minHeight: isMobile ? 'calc(100vh - 56px)' : '100vh',
      }}>
        {children}
      </Box>
    </Box>
  );
}
