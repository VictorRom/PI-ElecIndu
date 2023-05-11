# test routes
import requests # pip install requests
from datetime import datetime

baseURL = "http://localhost:8080"

def test_trail(dts, dte):
    r = requests.get("{base}/trail/dts={dts}&dte={dte}".format(base=baseURL,dts=dts, dte=dte))
    print(r.json())

def test_live():
    r = requests.get("{base}/live".format(base=baseURL))
    print(r.json())

def init_db():
    requests.get("{base}/insert_data".format(base=baseURL))


if __name__ == "__main__":
    start = datetime(2023, 4, 25, 16, 0, 0)
    print(start)
    end = datetime(2023, 4, 25, 16, 30, 0)
    init_db()
    test_live()
    test_trail(start, end)