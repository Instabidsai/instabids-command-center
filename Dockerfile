FROM directus/directus:10.10.7

USER root

# Install additional dependencies if needed
RUN apk add --no-cache bash

USER node

# Copy any custom extensions (we'll add these later)
# COPY --chown=node:node ./extensions /directus/extensions

# The rest is handled by the base Directus image
