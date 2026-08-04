FROM node:22.20.0-alpine3.22@sha256:dbcedd8aeab47fbc0f4dd4bffa55b7c3c729a707875968d467aaaea42d6225af

ENV NODE_ENV=production
WORKDIR /app/services/site-audit-runner

COPY services/site-audit-runner/package.json ./package.json
COPY services/site-audit-runner/src ./src
COPY worker/site-audit-core.js /app/worker/site-audit-core.js

USER node
EXPOSE 8080
CMD ["node", "src/server.js"]
