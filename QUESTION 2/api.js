import axios from 'axios';

const BASE_URL = 'https://api.affordmed.in/stock-assignment';

const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiZXhwIjoxNzQ3MDU1MTYzLCJpYXQiOjE3NDcwNTQ4NjMsImlzcyI6IkFmZm9yZG1lZCIsImp0aSI6IjdlMzhjMzUyLTRjZmMtNDY2YS04MjExLTM4MjlkYTRiN2JjMiIsInN1YiI6Im1vaGFucmFqdi5hZ24yMUBnbWFpbC5jb20ifSwiZW1haWwiOiJtb2hhbnJhanYuYWduMjFAZ21haWwuY29tIiwibmFtZSI6Im1vaGFucmFqIHZlbmthdGVzYW4iLCJyb2xsTm8iOiJjaC5lbi51NGN5czIyMDMzIiwiYWNjZXNzQ29kZSI6IlN3dXVLRSIsImNsaWVudElEIjoiN2UzOGMzNTItNGNmYy00NjZhLTgyMTEtMzgyOWRhNGI3YmMyIiwiY2xpZW50U2VjcmV0IjoiQ3FaWEpHeGRmZE1qcFVmdiJ9.cPZqd14k52-_qjEg5NlHH8eg9qzWnMjo0caitXngepg`
  },
  timeout: 10000,
});

export const stockService = {
  async getStockPrices(timeFrame) {
    try {
      const response = await apiClient.get(`/stock-prices?timeFrame=${timeFrame}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching stock prices:', error);
      throw error;
    }
  },

  async getCorrelationMatrix(timeFrame) {
    try {
      const response = await apiClient.get(`/correlation-matrix?timeFrame=${timeFrame}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching correlation matrix:', error);
      throw error;
    }
  }
};

export default apiClient;