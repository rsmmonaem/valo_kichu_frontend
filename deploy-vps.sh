#!/bin/bash

# Check if 'docker compose' or 'docker-compose' is available
if docker compose version >/dev/null 2>&1; then
    DOCKER_COMPOSE="docker compose"
else
    DOCKER_COMPOSE="docker-compose"
fi

# Determine which container is currently active
if grep -q "nextjs-app-blue" nginx/conf.d/upstream.conf; then
    ACTIVE="blue"
    INACTIVE="green"
else
    ACTIVE="green"
    INACTIVE="blue"
fi

echo "=============================="
echo "🚀 Starting Blue-Green Deployment"
echo "Active container: $ACTIVE"
echo "Target container: $INACTIVE"
echo "Using command: $DOCKER_COMPOSE"
echo "=============================="

# 1. Build and start the inactive container
echo "🏗️ Building nextjs-app-$INACTIVE..."
$DOCKER_COMPOSE build nextjs-app-$INACTIVE

echo "🏁 Starting nextjs-app-$INACTIVE..."
$DOCKER_COMPOSE up -d nextjs-app-$INACTIVE

# 2. Wait for the inactive container to start and become healthy
echo "⏳ Waiting for nextjs-app-$INACTIVE container to run..."
until [ "$(docker inspect -f '{{.State.Running}}' valokichu-frontend-$INACTIVE 2>/dev/null)" == "true" ]; do
    sleep 1
done

HEALTHY=false
echo "🔍 Performing health checks on nextjs-app-$INACTIVE..."
for i in {1..30}; do
    # Check if the container returns 200 OK internally
    if $DOCKER_COMPOSE exec -T nextjs-app-$INACTIVE wget --spider -q http://localhost:3000/; then
        echo "✅ nextjs-app-$INACTIVE is healthy and responding!"
        HEALTHY=true
        break
    fi
    echo "⌛ Waiting for application to start... ($i/30)"
    sleep 2
done

if [ "$HEALTHY" != "true" ]; then
    echo "❌ Deployment failed: nextjs-app-$INACTIVE did not become healthy."
    exit 1
fi

# 3. Swap Nginx upstream configuration
echo "🔄 Swapping Nginx upstream to nextjs-app-$INACTIVE..."
cat <<EOF > nginx/conf.d/upstream.conf
upstream nextjs_upstream {
    server nextjs-app-$INACTIVE:3000;
}
EOF

# Restart/Reload Nginx configuration without dropping active connections
echo "📡 Reloading Nginx..."
if [ "$(docker inspect -f '{{.State.Running}}' valokichu-nginx 2>/dev/null)" != "true" ]; then
    echo "🚀 Starting nginx-proxy..."
    $DOCKER_COMPOSE up -d nginx-proxy
else
    $DOCKER_COMPOSE exec -T nginx-proxy nginx -s reload
fi

# 4. Stop the old container
echo "🛑 Stopping nextjs-app-$ACTIVE..."
$DOCKER_COMPOSE stop nextjs-app-$ACTIVE

# 5. Clean up old unused images
echo "🧹 Pruning old Docker images..."
docker image prune -f

echo "=============================="
echo "🎉 Deployment Successful! Zero Downtime Achieved."
echo "=============================="
