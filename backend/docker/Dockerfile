FROM python:3.12-slim

# Set working directory
WORKDIR /app

# Install uv
COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/

# Copy dependency files to temporary folders
COPY pyproject.toml /app/pyproject.toml
COPY uv.lock /app/uv.lock

# within the container, we want the uv environment and the system environment to
# be the same
ENV UV_PROJECT_ENVIRONMENT=/usr/local

# Change to the temp directory and install dependencies globally
RUN --mount=type=cache,target=/root/.cache/uv \
    uv sync --frozen --no-dev --no-install-project

# Change back to app directory
WORKDIR /app

# Copy the source code
COPY src/ ./src/

# copy the launcher
COPY launch_api.sh /opt/launch_api.sh

# Expose port 8000
EXPOSE 8000

# Set the default command to run the application
CMD ["/opt/launch_api.sh"]
