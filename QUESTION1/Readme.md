# Stock Price Aggregation Microservice

This FastAPI microservice provides two main endpoints:

1. *Average Stock Price*: /stocks/{ticker}?minutes=m&aggregation=average
2. *Stock Correlation*: /stockcorrelation?minutes=m&ticker=A&ticker=B

## How to Run

```bash
pip install -r requirements.txt
uvicorn main:app --reload
