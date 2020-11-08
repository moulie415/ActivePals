echo "GOOGLE_IOS_ID=$GOOGLE_IOS_ID" >> .env
echo "GOOGLE_WEB_ID=$GOOGLE_WEB_ID" >> .env
echo "GOOGLE_API_KEY_ANDROID=$GOOGLE_API_KEY_ANDROID" >> .env
echo "GOOGLE_API_KEY_IOS=$GOOGLE_API_KEY_IOS" >> .env
cat .env
cd android/app
echo $GOOGLE_SERVICES_JSON >> google-services.json
cd ..
echo "MYAPP_RELEASE_KEY_ALIAS=$MYAPP_RELEASE_KEY_ALIAS" >> gradle.properties
echo "MYAPP_RELEASE_STORE_FILE=$MYAPP_RELEASE_STORE_FILE" >> gradle.properties
echo "MYAPP_RELEASE_STORE_PASSWORD=$MYAPP_RELEASE_STORE_PASSWORD" >> gradle.properties
echo "MYAPP_RELEASE_KEY_PASSWORD=$MYAPP_RELEASE_KEY_PASSWORD" >> gradle.properties
ls
cat gradle.properties