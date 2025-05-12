import React, { createContext, useCallback, useContext, useState } from 'react';
import { stockService } from '../services/apiService';

const StockContext = createContext();

export const StockProvider = ({ children }) => {
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [timeFrame, setTimeFrame] = useState('1h');

  const fetchStockData = useCallback(async (timeFrame) => {
    setLoading(true);
    setError(null);
    try {
      const response = await stockService.getStockPrices(timeFrame);
      setStocks(response);
    } catch (err) {
      setError(err.message || 'Failed to fetch stock data');
      setStocks([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCorrelationData = useCallback(async (timeFrame) => {
    setLoading(true);
    setError(null);
    try {
      const response = await stockService.getCorrelationMatrix(timeFrame);
      return response;
    } catch (err) {
      setError(err.message || 'Failed to fetch correlation data');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateTimeFrame = (newTimeFrame) => {
    setTimeFrame(newTimeFrame);
    fetchStockData(newTimeFrame);
  };

  const value = {
    stocks,
    loading,
    error,
    timeFrame,
    fetchStockData,
    fetchCorrelationData,
    updateTimeFrame,
  };

  return (
    <StockContext.Provider value={value}>
      {children}
    </StockContext.Provider>
  );
};

export const useStockContext = () => {
  const context = useContext(StockContext);
  if (!context) {
    throw new Error('useStockContext must be used within a StockProvider');
  }
  return context;
};