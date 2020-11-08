echo "GOOGLE_IOS_ID=${{ secrets.GOOGLE_IOS_ID }}" >> .env
echo "GOOGLE_WEB_ID=${{ secrets.GOOGLE_WEB_ID }}" >> .env
echo "GOOGLE_API_KEY_ANDROID=${{ secrets.GOOGLE_API_KEY_ANDROID }}" >> .env
echo "GOOGLE_API_KEY_IOS=${{ secrets.GOOGLE_API_KEY_IOS }}" >> .env
cd android/app
echo ${{ secrets.GOOGLE_SERVICES_JSON }} >> google-services.json
cd ..
echo "MYAPP_RELEASE_KEY_ALIAS=${{ secrets.MYAPP_RELEASE_KEY_ALIAS }}" >> gradle.properties
echo "MYAPP_RELEASE_STORE_FILE=${{ secrets.MYAPP_RELEASE_STORE_FILE }}" >> gradle.properties
echo "MYAPP_RELEASE_STORE_PASSWORD=${{ secrets.MYAPP_RELEASE_STORE_PASSWORD }}" >> gradle.properties
echo "MYAPP_RELEASE_KEY_PASSWORD=${{ secrets.MYAPP_RELEASE_KEY_PASSWORD }}" >> gradle.properties