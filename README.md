# Фабрика: Рубеж

2D-игра: строишь фабрику и обороняешь базу. Работает в браузере, можно установить как PWA. Играть: https://shaman-atta.github.io/Factory/

## Облачные сохранения (Firebase) — по умолчанию выключены
Сейчас работают только локальные профили и экспорт/импорт сохранений. Пока в `firebase-config.js` стоит `null`, вход через облако показан как «скоро».

Как включить:
1. На https://console.firebase.google.com создайте проект и добавьте веб-приложение (</>).
2. В Authentication → Sign-in method включите **Google** и **Email/Password**.
3. В Authentication → Settings → Authorized domains добавьте `shaman-atta.github.io`.
4. Создайте Firestore Database и задайте правила:
```
rules_version = '2';
service cloud.firestore {
  match /databases/{db}/documents {
    match /saves/{uid} {
      allow read, write: if request.auth != null && request.auth.uid == uid;
    }
  }
}
```
5. Впишите конфиг веб-приложения в `firebase-config.js`:
```js
window.FIREBASE_CONFIG = { apiKey: "...", authDomain: "...", projectId: "...", appId: "..." };
```
6. Увеличьте версию кэша в `sw.js` и запушьте изменения.

## Android APK

[Скачать APK](https://github.com/Shaman-ATTA/Factory/releases/latest/download/Factory-Rubezh.apk) — офлайн-приложение. При установке разрешите «Установка из неизвестных источников». Исходники обёртки: `android/` (сборка: `android/build.sh`).
