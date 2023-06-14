# test routes
import requests # pip install requests
from datetime import datetime, timezone

baseURL = "http://localhost:5050"

def test_trail(dts, dte):
    r = requests.get(f"{baseURL}/trail/dts={dts}&dte={dte}&proto=1")
    if r.status_code == 200:
        print(r.json())
    else :
        print(r.status_code)

def test_live():
    r = requests.get(f"{baseURL}/live/proto=1")
    if r.status_code == 200:
        print(r.json())
    else :
        print(r.status_code)

def init_db():
    r = requests.get("{base}/insert_data".format(base=baseURL))
    print(r.status_code)


if __name__ == "__main__":
    start = datetime(2023, 4, 15, 0, 0, 0)
    print(start)
    end = datetime(2023, 4, 25, 23, 0, 0)
    print(end)
    init_db()
    test_live()
    test_trail(start, end)