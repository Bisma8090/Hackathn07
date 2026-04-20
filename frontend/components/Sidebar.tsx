'use client';
import { Suspense } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import Box from '@mui/material/Box';
import Tooltip from '@mui/material/Tooltip';

const navItems = [
  { src: '/icons/Home.png', path: '/pos', label: 'POS' },
  { src: '/icons/Discount.png', path: '/dashboard', label: 'Dashboard' },
  { src: '/icons/Discount.png', path: '/raw-materials', label: 'Raw Materials' },
  { src: '/icons/Discount.png', path: '/settings?section=products', label: 'Products' },
  { src: '/icons/Discount.png', path: '/orders', label: 'Orders' },
];

const bottomItems = [
  { src: '/icons/Setting.png', path: '/settings', label: 'Settings' },
];

function SidebarInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();

  const isActive = (item: typeof navItems[0]) => {
    const basePath = item.path.split('?')[0];
    const section = item.path.includes('?') ? new URLSearchParams(item.path.split('?')[1]).get('section') : null;
    if (section) {
      return pathname === basePath && searchParams.get('section') === section;
    }
    return pathname.startsWith(basePath);
  };

  const NavIcon = ({ item }: { item: typeof navItems[0] }) => {
    const active = isActive(item);
    return (
      <Tooltip key={item.path} title={item.label} placement="right">
        <Box
          onClick={() => router.push(item.path)}
          sx={{
            width: 44, height: 44, borderRadius: 2,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer',
            bgcolor: active ? 'rgba(234,124,105,0.18)' : 'transparent',
            border: active ? '1px solid rgba(234,124,105,0.45)' : '1px solid transparent',
            transition: 'all 0.15s',
            '&:hover': { bgcolor: 'rgba(234,124,105,0.12)' },
          }}
        >
          <img
            src={item.src} alt={item.label}
            style={{ width: 22, height: 22, objectFit: 'contain', opacity: active ? 1 : 0.45 }}
            onError={(e) => {
              const el = e.target as HTMLImageElement;
              el.style.display = 'none';
              el.parentElement!.innerHTML = `<span style="color:${active ? '#EA7C69' : '#6B7280'};font-size:18px">●</span>`;
            }}
          />
        </Box>
      </Tooltip>
    );
  };

  return (
    <Box sx={{
      width: 100, minHeight: '100vh', bgcolor: '#1F1D2B',
      borderRight: '1px solid #2D3048', display: 'flex', flexDirection: 'column',
      alignItems: 'center', py: 2, position: 'fixed', left: 0, top: 0, zIndex: 100,
    }}>
      {/* Logo */}
      <Box
        onClick={() => router.push('/dashboard')}
        sx={{
          width: 44, height: 44, bgcolor: '#443229', borderRadius: 2,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          mb: 3, cursor: 'pointer', overflow: 'hidden', flexShrink: 0,
        }}
      >
        <img src="/icons/bx_bxs-store-alt.png" alt="logo"
          style={{ width: 28, height: 28, objectFit: 'contain' }}
          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
        />
      </Box>

      {/* Top nav icons */}
      <Box display="flex" flexDirection="column" alignItems="center" gap={1} flex={1}>
        {navItems.map((item) => <NavIcon key={item.path} item={item} />)}
      </Box>

      {/* Bottom settings icon */}
      <Box display="flex" flexDirection="column" alignItems="center" gap={1} mt={2}>
        {bottomItems.map((item) => <NavIcon key={item.path} item={item} />)}
      </Box>
    </Box>
  );
}

export default function Sidebar() {
  return (
    <Suspense fallback={null}>
      <SidebarInner />
    </Suspense>
  );
}
