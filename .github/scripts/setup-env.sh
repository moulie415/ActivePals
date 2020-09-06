#!/bin/bash

touch .env
touch .env.prod
echo "GOOGLE_IOS_ID=$GOOGLE_IOS_ID" >> .env.prod
echo "GOOGLE_WEB_ID=$GOOGLE_WEB_ID" >> .env.prod
echo "GOOGLE_API_KEY=$GOOGLE_API_KEY" >> .env.prod
cd scripts && ENV=production ./envscript.sh