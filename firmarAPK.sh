cd /home/lito/remoteProjects/dondereciclo
rm -rf dondeRecicloApp.apk
/opt/android-sdk/build-tools/23.0.1/zipalign -v 4 dondeReciclo.apk dondeRecicloApp.apk
