# TEE Trust Validator - Final Production Dockerfile
FROM node:18-alpine

# Install Python and pip for the API
RUN apk add --no-cache python3 py3-pip

# Set working directory
WORKDIR /app

# Copy Next.js static build
COPY templates/remote-attestation-template/out/ ./out/
COPY templates/remote-attestation-template/public/ ./public/

# Copy Python API
COPY simple-python-api.py ./

# Install dStack SDK and serve
RUN python3 -m venv /venv && \
    /venv/bin/pip install dstack-sdk==0.5.1 && \
    npm install -g serve

# Create startup script
RUN echo '#!/bin/sh' > /start.sh && \
    echo 'source /venv/bin/activate' >> /start.sh && \
    echo 'python3 simple-python-api.py &' >> /start.sh && \
    echo 'sleep 2' >> /start.sh && \
    echo 'serve -s out -l 3000' >> /start.sh && \
    chmod +x /start.sh

EXPOSE 3000 8000

CMD ["/start.sh"]
