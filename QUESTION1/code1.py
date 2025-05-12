import asyncio
import math
from datetime import datetime, timedelta
from typing import List, Dict, Optional

import httpx
from fastapi import FastAPI, HTTPException, Query
from pydantic import BaseModel


BASE_URL = "http://20.244.56.144/evaluation-service"
ACCESS_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiZXhwIjoxNzQ3MDYwNTYzLCJpYXQiOjE3NDcwNjAyNjMsImlzcyI6IkFmZm9yZG1lZCIsImp0aSI6IjdlMzhjMzUyLTRjZmMtNDY2YS04MjExLTM4MjlkYTRiN2JjMiIsInN1YiI6Im1vaGFucmFqdi5hZ24yMUBnbWFpbC5jb20ifSwiZW1haWwiOiJtb2hhbnJhanYuYWduMjFAZ21haWwuY29tIiwibmFtZSI6Im1vaGFucmFqIHZlbmthdGVzYW4iLCJyb2xsTm8iOiJjaC5lbi51NGN5czIyMDMzIiwiYWNjZXNzQ29kZSI6IlN3dXVLRSIsImNsaWVudElEIjoiN2UzOGMzNTItNGNmYy00NjZhLTgyMTEtMzgyOWRhNGI3YmMyIiwiY2xpZW50U2VjcmV0IjoiQ3FaWEpHeGRmZE1qcFVmdiJ9.xuF_PbVqABjEnnLGx84PHbZR3KkzEIgZi9sQtJADQ-A" 

class StockPrice(BaseModel):
    price: float
    lastUpdatedAt: str

class StockPriceResponse(BaseModel):
    averageStockPrice: float
    priceHistory: List[StockPrice]

class StockCorrelationResponse(BaseModel):
    correlation: float
    stocks: Dict[str, Dict[str, float | List[StockPrice]]]

class StockClient:
    def __init__(self, base_url: str, access_token: str):
        self.base_url = base_url
        self.headers = {
            "Authorization": f"Bearer {access_token}"
        }

    async def get_stocks(self) -> Dict[str, str]:
        async with httpx.AsyncClient() as client:
            response = await client.get(f"{self.base_url}/stocks", headers=self.headers)
            response.raise_for_status()
            return response.json()['stocks']

    async def get_stock_prices(self, ticker: str, minutes: int = 50) -> List[StockPrice]:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{self.base_url}/stocks/{ticker}?minutes={minutes}",
                headers=self.headers
            )
            response.raise_for_status()
            return [StockPrice(**price) for price in response.json()]

app = FastAPI(title="Stock Price Microservice")
stock_client = StockClient(BASE_URL, ACCESS_TOKEN)

@app.get("/stocks/{ticker}", response_model=StockPriceResponse)
async def get_average_stock_price(
    ticker: str,
    minutes: int = Query(default=50, ge=1, le=120)
):


    try:
        # Fetch stock prices
        prices = await stock_client.get_stock_prices(ticker, minutes)

        # Calculate average stock price
        average_price = sum(price.price for price in prices) / len(prices) if prices else 0

        return {
            "averageStockPrice": average_price,
            "priceHistory": prices
        }
    except httpx.HTTPStatusError as e:
        raise HTTPException(status_code=e.response.status_code, detail=str(e))

@app.get("/stockcorrelation", response_model=StockCorrelationResponse)
async def get_stock_correlation(
    minutes: int = Query(default=50, ge=1, le=120),
    ticker: List[str] = Query(min_length=2, max_length=2)
):
    """
    Calculate correlation between two stock prices
    """
    if len(ticker) != 2:
        raise HTTPException(status_code=400, detail="Exactly two tickers must be provided")

    try:
      
        prices_tasks = [stock_client.get_stock_prices(t, minutes) for t in ticker]
        stock_prices = await asyncio.gather(*prices_tasks)

       
        def calculate_correlation(x: List[float], y: List[float]):
            
            min_length = min(len(x), len(y))
            x, y = x[:min_length], y[:min_length]

           
            mean_x = sum(x) / len(x)
            mean_y = sum(y) / len(y)

            
            covariance = sum((xi - mean_x) * (yi - mean_y) for xi, yi in zip(x, y)) / (len(x) - 1)

            
            std_x = math.sqrt(sum((xi - mean_x) ** 2 for xi in x) / (len(x) - 1))
            std_y = math.sqrt(sum((yi - mean_y) ** 2 for yi in y) / (len(y) - 1))

            
            correlation = covariance / (std_x * std_y) if std_x * std_y != 0 else 0

            return correlation

      
        prices_x = [price.price for price in stock_prices[0]]
        prices_y = [price.price for price in stock_prices[1]]

        
        correlation = calculate_correlation(prices_x, prices_y)

        return {
            "correlation": correlation,
            "stocks": {
                ticker[0]: {
                    "averagePrice": sum(prices_x) / len(prices_x),
                    "priceHistory": stock_prices[0]
                },
                ticker[1]: {
                    "averagePrice": sum(prices_y) / len(prices_y),
                    "priceHistory": stock_prices[1]
                }
            }
        }
    except httpx.HTTPStatusError as e:
        raise HTTPException(status_code=e.response.status_code, detail=str(e))


@app.on_event("startup")
async def startup_event():
    try:
        stocks = await stock_client.get_stocks()
        print(f"Connected successfully. Total stocks available: {len(stocks)}")
    except Exception as e:
        print(f"Failed to connect to stock exchange: {e}")

