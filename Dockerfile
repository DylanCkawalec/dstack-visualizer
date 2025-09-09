# TEE Trust Validator - Production Docker Image
FROM node:18-alpine

# Install Python and required packages
RUN apk add --no-cache python3 py3-pip

WORKDIR /app

# Copy frontend build
COPY templates/remote-attestation-template/out/ ./out/
COPY templates/remote-attestation-template/public/ ./public/

# Copy backend API
COPY simple-python-api.py ./

# Install Python dependencies
RUN python3 -m venv /venv && \
    /venv/bin/pip install dstack-sdk==0.5.1

# Create startup script
RUN echo '#!/bin/sh' > /start.sh && \
    echo 'source /venv/bin/activate' >> /start.sh && \
    echo 'npx serve out -l 3000 &' >> /start.sh && \
    echo 'python3 simple-python-api.py' >> /start.sh && \
    chmod +x /start.sh

# Install serve for static hosting
RUN npm install -g serve

# Expose ports
EXPOSE 3000 8000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:8000/api/health || exit 1

# Start services
CMD ["/start.sh"]