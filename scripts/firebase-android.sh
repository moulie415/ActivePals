#!/usr/bin/env bash
cd .. && cd android && ./gradlew assembleRelease && cd ..
firebase appdistribution:distribute android/app/build/outputs/apk/release/app-release.apk --app 1:623262962635:android:2fbe72ef452479426cdc4e --testers-file testersAndroid.txt
