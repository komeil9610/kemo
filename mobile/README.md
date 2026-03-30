# Tarkeeb Pro Mobile

Expo mobile app for field technicians, customer service, and the operations manager.

## Run

```bash
npm install
npm start
```

Optional targets:

```bash
npm run android
npm run ios
npm run web
```

## API

The app points to the deployed frontend worker proxy by default:

`https://tarkeeb-pro-frontend.bobkumeel.workers.dev/api`

That keeps mobile requests compatible with the existing Cloudflare proxy path.

## Structure

```text
mobile/
├── App.js
├── app.json
├── babel.config.js
├── package.json
└── src/
    └── App.js
```

## Current Scope

- Touch-first login screen with large tap targets
- Bottom navigation for mobile use
- Technician home with today's tasks, call, and map actions
- Customer service snapshot of recent orders
- Operations mobile snapshot with city distribution and latest requests

## Notes

- Session persistence is not stored locally yet; the app keeps the active session in memory for now.
- The mobile app uses the same backend roles and tokens as the web app.
