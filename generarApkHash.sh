cd /home/lito/remoteProjects/dondereciclo/
keytool -exportcert -alias alias_name -keystore ./my-releasedondereciclo.keystore | openssl sha1 -binary | openssl base64
