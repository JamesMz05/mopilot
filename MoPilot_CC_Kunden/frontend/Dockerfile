FROM node:20-alpine AS deps
WORKDIR /app
COPY MoPilot_CC_Kunden/frontend/package.json ./
RUN npm install

FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY shared-ui/ ./shared-ui/
COPY MoPilot_CC_Kunden/frontend/ .
ARG NEXT_PUBLIC_BACKEND_URL=https://api.cc-kunden.mopilot.website
ENV NEXT_PUBLIC_BACKEND_URL=$NEXT_PUBLIC_BACKEND_URL
ARG NEXT_PUBLIC_AUTH_API_URL=https://api.mopilot.website
ENV NEXT_PUBLIC_AUTH_API_URL=$NEXT_PUBLIC_AUTH_API_URL
ARG BACKEND_INTERNAL_URL=http://mopilot-cc-backend:8000
ENV BACKEND_INTERNAL_URL=$BACKEND_INTERNAL_URL
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV HOSTNAME=0.0.0.0
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
EXPOSE 3000
CMD ["node", "server.js"]
