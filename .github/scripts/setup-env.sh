#!/bin/bash

echo "GOOGLE_IOS_ID=$GOOGLE_IOS_ID" >> .env
echo "GOOGLE_WEB_ID=$GOOGLE_WEB_ID" >> .env
echo "GOOGLE_API_KEY_ANDROID=$GOOGLE_API_KEY_ANDROID" >> .env
echo "GOOGLE_API_KEY_IOS=$GOOGLE_API_KEY_IOS" >> .env
cd ios
echo $GOOGLE_SERVICE_INFO >> GoogleService-Info.plist