#!/bin/bash

# Unraid user script: pulls the repo and rebuilds the container when GitHub moved ahead or
# the container is not up. No compose file, the image needs no volume and no second service.

REPO_DIR="/mnt/user/appdata/proton-mail-tweaks"
LOG_FILE="$REPO_DIR/deploy.log"
IMAGE="proton-mail-tweaks"
CONTAINER="proton-mail-tweaks"
PORT="9030"
ORIGIN="https://proton-mail-tweaks.henkys.dev"

git config --global --add safe.directory $REPO_DIR

cd $REPO_DIR
git fetch

LOCAL=$(git rev-parse HEAD)
REMOTE=$(git rev-parse @{u})
IS_RUNNING=$(docker ps -q -f "name=^${CONTAINER}$")

if [ "$LOCAL" != "$REMOTE" ] || [ -z "$IS_RUNNING" ]; then
    git pull > $LOG_FILE 2>&1

    # Only replace a running container once the new image is actually there
    if docker build -t $IMAGE $REPO_DIR >> $LOG_FILE 2>&1; then
        docker rm -f $CONTAINER >> $LOG_FILE 2>&1
        docker run -d --name $CONTAINER --restart unless-stopped \
            -p $PORT:3000 \
            -e ORIGIN=$ORIGIN \
            $IMAGE >> $LOG_FILE 2>&1
        docker image prune -f >> $LOG_FILE 2>&1
    fi
fi
