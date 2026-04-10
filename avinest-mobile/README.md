# Avinest Mobile

Flutter mobile client for the Avinest backend APIs.

## What is scaffolded

- Login flow against `/api/auth/login`
- Token persistence using secure storage
- Automatic access-token refresh using `/api/auth/refresh`
- Student home page fetching:
  - `/api/me/profile`
  - `/api/me/student/enrolled-courses`

## Prerequisites

- Flutter SDK installed and available on PATH
- Backend running on port `8080`

## Run

```bash
cd avinest-mobile
flutter pub get
flutter run --dart-define=API_BASE_URL=http://10.0.2.2:8080/api
```

For physical devices or iOS simulator, adjust `API_BASE_URL` to a reachable host.

## Next steps

- Add marks, timetable, and grades screens
- Add sync actions (`/api/me/student/sync/*`)
- Add role-based routing for faculty views
