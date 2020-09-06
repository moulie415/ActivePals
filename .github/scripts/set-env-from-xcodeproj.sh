#!/bin/bash

set -euo pipefail

cd ios
SCHEME="$(xcodebuild -list -json | jq -r '.project.schemes[0]')"
PRODUCT_NAME="$(xcodebuild -scheme "$SCHEME" -showBuildSettings | grep " PRODUCT_NAME " | sed "s/[ ]*PRODUCT_NAME = //")"
echo "::set-env name=PRODUCT_NAME::$PRODUCT_NAME"

cd ..
touch .env
touch .env.prod
echo "GOOGLE_IOS_ID=$GOOGLE_IOS_ID" >> .env.prod
echo "GOOGLE_WEB_ID=$GOOGLE_WEB_ID" >> .env.prod
echo "GOOGLE_API_KEY=$GOOGLE_API_KEY" >> .env.prod
cd scripts && ENV=production ./envscript.sh
