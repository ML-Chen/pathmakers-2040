# The Android app

The app is a thin WebView wrapper (`android/`) around the same single-file game the web build uses. `.github/workflows/android.yml` builds it on every push to `main` and attaches `Pathmakers2040.apk` to the **Android (latest)** release.

## Installing on a phone

1. On the phone, sign in to GitHub in the browser and open this repo's **Releases → Android (latest)**.
2. Tap `Pathmakers2040.apk`. When Android asks, allow your browser to "install unknown apps", then tap **Install**.
3. Newer builds install over the old one and keep progress, as long as they are signed with the same key (see below).

The game works fully offline: voices, music, fonts and saves are all inside the app. Progress saves on the phone. The Menu's save code moves a game between the phone and the web version.

## Chat with Byte

On Claude.ai the game asks Claude through the artifact's `sample` capability. The app has no Claude.ai account, so:

- **By default**, Byte answers with each mission's scripted replies.
- **Live chat (optional):** Menu → For grown-ups → Talking with Byte → paste an Anthropic API key and tap Save. The key stays in the phone's storage only (it is never in save codes), and calls go straight from the phone to the Anthropic API with the same kid-safe instructions. Usage is billed to that key, so create a key just for this with a low monthly spending limit in the Anthropic Console. Remove it from the same screen.

## Signing

- **Without secrets** (the default), CI signs with a "sideload" key it generates once and keeps in the Actions cache (`pm-sideload-keystore-v1`). Every build then has the same signature. GitHub drops a cache that goes unused for 7 days; if that happens the next build gets a new key, and the phone will refuse it as an update ("App not installed"). Uninstalling first works but erases progress on the phone, so copy the save code from the Menu before uninstalling.
- **For a permanent key**, create one and add it as repository secrets (Settings → Secrets and variables → Actions):

```sh
keytool -genkeypair -v -keystore pathmakers.jks -alias pathmakers -keyalg RSA -keysize 2048 -validity 10000
base64 -w0 pathmakers.jks   # paste the output as ANDROID_KEYSTORE_BASE64
```

Secrets: `ANDROID_KEYSTORE_BASE64`, `ANDROID_KEYSTORE_PASSWORD`, `ANDROID_KEY_ALIAS` (`pathmakers`), `ANDROID_KEY_PASSWORD`. Never commit the keystore. Switching keys also means one uninstall, so do it early.

## Building locally

Needs JDK 17, Gradle 8.7 and the Android SDK (platform 34):

```sh
python3 src/build.py dist/pathmakers.html
mkdir -p android/app/src/main/assets && cp dist/pathmakers.html android/app/src/main/assets/index.html
gradle -p android assembleRelease    # debug-signed unless PM_KEYSTORE_* variables are set
```

The launcher icon is rendered from Byte with `node tools/android_icon.js`.

## Updates
The app updates the game by itself. Each time it starts, it reads `version.json` from the game's GitHub Pages site
(https://ml-chen.github.io/pathmakers-2040/). If a newer build exists and the phone is on Wi-Fi (any unmetered
network), it downloads the new page in the background, shows "A new version of Pathmakers is ready", and opens it the
next time the app starts. Saves carry over because both copies load from the same in-app address. A newer APK always
wins over an older download. Reinstalling is only needed when the app's own code changes (this file will say so).
