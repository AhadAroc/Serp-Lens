import requests

r = requests.post("http://localhost:8000/api/rank", json={
    "keyword": "coffee shop",
    "domain": "starbucks.com",
    "location": "New York,New York,United States"
})
print(r.json())