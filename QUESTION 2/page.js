import {
    Box,
    FormControl,
    Grid,
    InputLabel,
    MenuItem,
    Paper,
    Select,
    Typography
} from '@mui/material';
import React, { useEffect } from 'react';
import {
    CartesianGrid,
    Legend,
    Line,
    LineChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis
} from 'recharts';

import LoadingSpinner from '../components/common/LoadingSpinner';
import { useStockContext } from '../contexts/StockContext';

const StockChartTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const stockData = payload[0].payload;
    return (
      <Paper elevation={3} sx={{ p: 2, backgroundColor: 'background.paper' }}>
        <Typography variant="subtitle2" color="primary">
          {label}
        </Typography>
        {payload.map((entry) => (
          <Box key={entry.dataKey}>
            <Typography variant="body2">
              {entry.name}: {entry.value.toFixed(2)}
            </Typography>
          </Box>
        ))}
        {stockData.average && (
          <Typography variant="body2" color="text.secondary">
            Average: {stockData.average.toFixed(2)}
          </Typography>
        )}
      </Paper>
    );
  }
  return null;
};

const StockPage = () => {
  const { 
    stocks, 
    loading, 
    fetchStockData, 
    timeFrame, 
    updateTimeFrame 
  } = useStockContext();

  const timeFrameOptions = [
    { value: '5m', label: 'Last 5 Minutes' },
    { value: '15m', label: 'Last 15 Minutes' },
    { value: '1h', label: 'Last Hour' },
    { value: '4h', label: 'Last 4 Hours' },
    { value: '1d', label: 'Last Day' }
  ];

  const handleTimeFrameChange = (event) => {
    updateTimeFrame(event.target.value);
  };

  useEffect(() => {
    fetchStockData(timeFrame);
  }, [fetchStockData, timeFrame]);

  if (loading) return <LoadingSpinner />;

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Typography variant="h4" gutterBottom>
            Stock Prices
          </Typography>
        </Grid>

        <Grid item xs={12}>
          <FormControl variant="outlined" fullWidth>
            <InputLabel>Time Frame</InputLabel>
            <Select
              value={timeFrame}
              onChange={handleTimeFrameChange}
              label="Time Frame"
            >
              {timeFrameOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12}>
          <Paper 
            elevation={3} 
            sx={{ 
              p: 2, 
              height: 500, 
              backgroundColor: 'background.paper' 
            }}
          >
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={stocks}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="timestamp" />
                <YAxis />
                <Tooltip content={<StockChartTooltip />} />
                <Legend />
                {stocks[0] && Object.keys(stocks[0])
                  .filter(key => key !== 'timestamp' && key !== 'average')
                  .map((stockKey, index) => (
                    <Line
                      key={stockKey}
                      type="monotone"
                      dataKey={stockKey}
                      stroke={`hsl(${index * 60}, 70%, 50%)`}
                      activeDot={{ r: 8 }}
                    />
                  ))
                }
                <Line
                  type="monotone"
                  dataKey="average"
                  stroke="#ff0000"
                  strokeWidth={3}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default StockPage;