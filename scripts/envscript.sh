#!/usr/bin/env bash
cd ..
if [ "$ENV" == "production"  ];
then
  echo "Switching to Firebase Production environment"
  yes | cp -rf "firebase_prod/google-services.json" android/app
  yes | cp -rf "firebase_prod/GoogleService-Info.plist" ios/
  yes | cp .env.prod .env
else
  echo "Switching to Firebase Dev environment"
  yes | cp -rf "firebase_dev/google-services.json" android/app
  yes | cp -rf "firebase_dev/GoogleService-Info.plist" ios/
  yes | cp .env.dev .env
fi
