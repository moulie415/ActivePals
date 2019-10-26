#!/usr/bin/env bash
cd ios
# Builds the app into an archive  
xcodebuild -workspace Anyone.xcworkspace -scheme Anyone -configuration Release -archivePath "~/personal_projects/ActivePals/export/ActivePals.xcarchive" archive  
  
# Exports the archive according to the export options specified by the plist  
xcodebuild -exportArchive -archivePath "~/personal_projects/ActivePals/export/ActivePals.xcarchive" -exportPath "~/personal_projects/ActivePals/export" -exportOptionsPlist export.plist

cd ..

# upload to firebase app distribution
firebase appdistribution:distribute export/Anyone.ipa --app 1:623262962635:ios:f2386de9b06ebad2 --testers-file testersIOS.txt
