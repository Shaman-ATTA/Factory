#!/bin/bash
# Builds Factory-Rubezh APK without Gradle. Needs JDK 17+ and Android SDK (platform 34, build-tools 34).
set -e
SDK=${ANDROID_SDK:-/workspace/android-sdk}; BT=$SDK/build-tools/34.0.0; JAR=$SDK/platforms/android-34/android.jar
KS=${KEYSTORE:-/workspace/factory-apk/keystore/release.jks}; KSPASS=${KSPASS_FILE:-/workspace/factory-apk/keystore/password.txt}
D=$(cd "$(dirname "$0")" && pwd); B=$D/build; rm -rf $B; mkdir -p $B/assets/www $B/classes $B/res
cd $D/..; cp index.html style.css *.js manifest.json icon-*.png $B/assets/www/; rm -f $B/assets/www/test*.mjs
$BT/aapt2 compile --dir $D/res -o $B/res.zip
$BT/aapt2 link -o $B/base.apk -I $JAR --manifest $D/AndroidManifest.xml -A $B/assets $B/res.zip --java $B/gen
javac -source 8 -target 8 -nowarn -classpath $JAR -d $B/classes $(find $D/src $B/gen -name '*.java') 2>&1 | grep -v warning || true
$BT/d8 --min-api 24 --lib $JAR --output $B $(find $B/classes -name '*.class')
cd $B && cp base.apk u.apk && python3 -c "import zipfile;zipfile.ZipFile('u.apk','a',zipfile.ZIP_DEFLATED).write('classes.dex')" && $BT/zipalign -f 4 u.apk a.apk
$BT/apksigner sign --ks $KS --ks-pass file:$KSPASS --out $B/Factory-Rubezh.apk a.apk
echo built
