#!/usr/bin/env bash
cd ios
# Builds the app into an archive  
xcodebuild -workspace ActivePals.xcworkspace -scheme ActivePals -configuration Release -archivePath "~/personal_projects/ActivePals/export/ActivePals.xcarchive" archive  
  
# Exports the archive according to the export options specified by the plist  
xcodebuild -exportArchive -archivePath "~/personal_projects/ActivePals/export/ActivePals.xcarchive" -exportPath "~/personal_projects/ActivePals/export" -exportOptionsPlist export.plist

cd ..

# upload to firebase app distribution
firebase appdistribution:distribute export/ActivePals.ipa --app 1:623262962635:ios:656bf5879c8bad806cdc4e  --testers-file testersIOS.txt
