FROM node:22
RUN apt update && apt-get install -y \
    python3 \
    python3-pip \
    python3-venv \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

RUN python3 -m venv /opt/venv

RUN /opt/venv/bin/pip install --upgrade pip && \
    /opt/venv/bin/pip install pdfminer.six pandas

ENV PATH="/opt/venv/bin:$PATH"

RUN npm run build
EXPOSE 5000
CMD ["npm", "start"]
