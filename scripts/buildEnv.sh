#!/usr/bin/env bash
cd .. && touch .env
echo "GOOGLE_IOS_ID=${{ secrets.GOOGLE_IOS_ID }}" >> .env
echo "GOOGLE_WEB_ID=${{ secrets.GOOGLE_WEB_ID }}" >> .env
echo "GOOGLE_API_KEY=${{ secrets.GOOGLE_API_KEY }}" >> .env