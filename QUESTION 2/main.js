import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline, Box } from '@mui/material';

import StockPage from './pages/StockPage';
import CorrelationPage from './pages/CorrelationPage';

import Navbar from './components/layout/Navbar';
import Sidebar from './components/layout/Sidebar';

import { StockProvider } from './contexts/StockContext';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#1976d2',
    },
    background: {
      default: '#121212',
      paper: '#1e1e1e',
    },
  },
  typography: {
    fontFamily: 'Roboto, Arial, sans-serif',
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#1e1e1e',
        },
      },
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <StockProvider>
        <Router>
          <Box sx={{ display: 'flex' }}>
            <Navbar />
            <Sidebar />
            <Box 
              component="main" 
              sx={{ 
                flexGrow: 1, 
                p: 3, 
                width: { sm: `calc(100% - 240px)` },
                mt: 8,
                backgroundColor: theme.palette.background.default
              }}
            >
              <Routes>
                <Route path="/" element={<StockPage />} />
                <Route path="/correlation" element={<CorrelationPage />} />
              </Routes>
            </Box>
          </Box>
        </Router>
      </StockProvider>
    </ThemeProvider>
  );
}

export default App;