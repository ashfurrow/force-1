FROM node:12.14-alpine

WORKDIR /app

ENV CDN_PRODUCTION_URL=https://d1s2w0upia4e9w.cloudfront.net CDN_STAGING_URL=https://d1rmpw1xlv9rxa.cloudfront.net

# Install system dependencies
# Add deploy user
RUN apk --no-cache --quiet add \
      bash \
      build-base \
      curl \
      dumb-init \
      git \
      python && \
      adduser -D -g '' deploy

# Copy files required for installation of application dependencies
COPY package.json yarn.lock ./
COPY patches ./patches

# Install application dependencies
RUN yarn install --frozen-lockfile --quiet

# Copy application code
COPY . ./

# Build application
# Update file/directory permissions
RUN yarn assets && \
    yarn build:server && \
    chown -R deploy:deploy ./

# Switch to less-privileged user
USER deploy

ENTRYPOINT ["/usr/bin/dumb-init", "--"]
CMD ["yarn", "start"]
