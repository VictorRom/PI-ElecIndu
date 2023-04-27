FROM python:3.10-slim

COPY . /app
WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY transformer.py .

CMD ["python", "transformer.py"]