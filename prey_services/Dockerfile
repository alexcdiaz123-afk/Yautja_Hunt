FROM python:3.11-slim

# Install system utilities (ping, curl, netcat for diagnostics)
RUN apt-get update && apt-get install -y --no-install-recommends \
    iputils-ping \
    curl \
    netcat-openbsd \
    sqlite3 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

RUN chmod +x start_services.sh

EXPOSE 80 1987

CMD ["./start_services.sh"]
