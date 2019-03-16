#!/usr/bin/env bash

if [ "$ENV" == "production"  ];
then
  echo "Switching to Firebase Production environment"
  yes | cp -rf "firebase_prod/google-services.json" android/app
  yes | cp -rf "firebase_prod/GoogleService-Info.plist" ios/
else
  echo "Switching to Firebase Dev environment"
  yes | cp -rf "firebase_dev/google-services.json" android/app
  yes | cp -rf "firebase_dev/GoogleService-Info.plist" ios/
fi
