'use client';
import { Provider } from 'react-redux';
import { store } from '@/lib/store';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import EmotionCacheProvider from '@/lib/emotionCache';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#E8734A' },
    secondary: { main: '#E8734A' },
    background: {
      default: '#252836',
      paper: '#1F1D2B',
    },
    text: {
      primary: '#FFFFFF',
      secondary: '#9CA3AF',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: { textTransform: 'none', borderRadius: 8 },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: { borderRadius: 12, backgroundColor: '#1F1D2B', backgroundImage: 'none' },
      },
    },
  },
});

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <EmotionCacheProvider>
      <Provider store={store}>
        <ThemeProvider theme={darkTheme}>
          <CssBaseline />
          {children}
        </ThemeProvider>
      </Provider>
    </EmotionCacheProvider>
  );
}
