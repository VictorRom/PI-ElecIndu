# test routes
import requests # pip install requests
from datetime import datetime

baseURL = "http://localhost:5050"

def test_trail(dts, dte):
    r = requests.get("{base}/trail/dts={dts}&dte={dte}&proto=1".format(base=baseURL,dts=dts, dte=dte))
    if r.status_code == 200:
        print(r.json())
    else :
        print(r.status_code)

def test_live():
    r = requests.get("{base}/live/proto=1".format(base=baseURL))
    if r.status_code == 200:
        print(r.json())
    else :
        print(r.status_code)

def init_db():
    r = requests.get("{base}/insert_data".format(base=baseURL))
    print(r.status_code)


if __name__ == "__main__":
    start = datetime(2023, 4, 25, 0, 0, 0)
    print(start)
    end = datetime(2023, 4, 25, 0, 0, 0)
    init_db()
    test_live()
    test_trail(start, end)