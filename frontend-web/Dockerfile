# =============================================================================
# Yalla Buy - Frontend Dockerfile (Development)
# =============================================================================

FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files first (for better caching)
COPY package*.json ./

# Install dependencies with retry mechanism for network issues
# إعادة المحاولة في حالة مشاكل الشبكة
RUN npm install --legacy-peer-deps || \
    (sleep 5 && npm install --legacy-peer-deps) || \
    (sleep 10 && npm install --legacy-peer-deps)

# Copy source code
COPY . .

# Set environment variables
ENV NEXT_TELEMETRY_DISABLED=1
ENV WATCHPACK_POLLING=true

# Expose port
EXPOSE 3000

# Start development server with host binding
CMD ["npm", "run", "dev"]

