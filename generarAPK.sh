cd /home/lito/remoteProjects/dondereciclo/
rm -rf ./platforms/android/build/outputs/apk/android-armv7-release-unsigned.apk
cordova build --release android
jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore ./my-releasedondereciclo.keystore ./platforms/android/build/outputs/apk/android-armv7-release-unsigned.apk alias_name
cp ./platforms/android/build/outputs/apk/android-armv7-release-unsigned.apk ./dondeReciclo.apk
