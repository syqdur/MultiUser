Quellcode scannen & lernen & bereits umgesetzten fortschritt erkennen

Lies README.md + README_SPOTIFY_SETUP.md.

Prüfe Struktur: src/, public/, docs/, components/, services/.

Öffne src/App.tsx und verstehe das komplette UI-Konzept
(Timeline-Grid, Spotify-Einbettung, Recap-Balken, Tailwind-Layout).

Notiere, welche Teile statisch/hard-coded sind und welche bereits dynamisch.

Ergebnis deines Scans

Erstelle ein kurzes Architecture-Diagramm (optional mermaid oder markdown).

Liste vorhandene Features (Spotify-OAuth, Timeline-Anzeige, Dankeskarten, Recap-Player).

Liste alle fehlenden Features, die für Multi-User-Betrieb notwendig sind
(Auth, Galerie-Isolation, Firestore-Queries, Storage-Uploads etc.).

1 · Projektziel (Business & Technik)
WeddingPix wird von einer Single-User-Demo zu einer geschäftsfähigen Multi-User-Galerieplattform ausgebaut.
Nach Registrierung erhält jeder Nutzer eine vollkommen isolierte Galerie mit eigenem Link, in die er Fotos, Videos, Stories hochlädt, Spotify-Playlists einbettet und Recap-Videos generiert – alles im bestehenden Tailwind-Design von App.tsx.

2 · Tech-Stack (Soll-Architektur)
Ebene	Lösung / Framework
Frontend	React 18 + Vite + TypeScript + Tailwind
Auth + DB + Storage	Firebase (Auth, Firestore, Storage, optional Functions)
Hosting FE	Netlify (bereits eingerichtet)
Analytics	Firebase Analytics
Musik	Spotify Web API + OAuth2

3 · Firebase-Integration (verbindlich implementieren)
3.1 Pakete installieren
bash

npm i firebase         # runtime-SDK
# optionale Typen & Helpers
npm i -D @firebase/firestore @firebase/storage
3.2 Environment-Variablen (.env.local + .env.example)
env

VITE_FIREBASE_API_KEY=AIzaSyCqDlIxPDp-QU6mzthkWnmzM6rZ8rnJdiI
VITE_FIREBASE_AUTH_DOMAIN=dev1-b3973.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=dev1-b3973
VITE_FIREBASE_STORAGE_BUCKET=dev1-b3973.appspot.com     # ← Domainfix
VITE_FIREBASE_MESSAGING_SENDER_ID=658150387877
VITE_FIREBASE_APP_ID=1:658150387877:web:ac90e7b1597a45258f5d4c
VITE_FIREBASE_MEASUREMENT_ID=G-7W2BNH8MQ7
3.3 Zentrale Initialisierung (src/lib/firebase.ts)
ts

import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics, isSupported } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

const app       = initializeApp(firebaseConfig);
export const auth     = getAuth(app);
export const db       = getFirestore(app);
export const storage  = getStorage(app);

isSupported().then(ok => ok && getAnalytics(app));
3.4 Storage-Regeln (storage.rules)
bash
Kopieren
Bearbeiten
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Medien pro Nutzer
    match /users/{userId}/{allPaths=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    // Galerie-Assets pro Nutzer
    match /galleries/{userId}/{allPaths=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
3.5 Firestore-Regeln (firestore.rules)
bash
Kopieren
Bearbeiten
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    match /users/{userId} {
      allow read, write: if request.auth.uid == userId;
      allow create: if request.auth != null;     // erstes Anlegen
    }

    match /galleries/{userId}/{doc=**} {
      allow read, write: if request.auth.uid == userId;
    }
  }
}
3.6 Auth-Hooks (Beispiel)
ts
Kopieren
Bearbeiten
// src/hooks/useAuth.ts
import { onAuthStateChanged } from 'firebase/auth';
import { useEffect, useState } from 'react';
import { auth } from '@/lib/firebase';

export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, u => { setUser(u); setLoading(false); });
    return unsub;
  }, []);

  return { user, loading };
}
4 · Datenmodell Firestore (Collections)
Collection / Doc	Felder (Auszug)
users/{uid}	email, displayName, createdAt
galleries/{uid}	title, theme, public, coverUrl
galleries/{uid}/media/{mid}	type (photo/video), url, createdAt, caption
galleries/{uid}/stories/{sid}	url, expiresAt, thumbUrl
galleries/{uid}/recaps/{rid}	videoUrl, createdAt, songTitle
spotify_tokens/{uid}	access, refresh, expiresAt

5 · Feature-Roadmap (Sprint-Priorität)
Sprint	Deliverable	Kern-Tasks
01	Auth-MVP + PrivateRoute	Signup, Login, Logout UI · Firestore users Doc · /gallery/:uid private Route
02	Galerie-Isolation	Firestore galleries Doc anlegen beim Signup · Default-Gallery-View dynamisch aus App.tsx
03	Media-Upload	Uploader (Drag & Drop) → Storage /users/{uid}/… · Firestore-Media-Entry · Timeline-Query
04	Spotify-pro-User	OAuth-Flow pro Nutzer · Token-Save · Einbettung in Galerie
05	Stories	Ablauf-Logik 24 h · UI-Carousel
06	Recap-Generator	Auswahl-Wizard, Render-Pipeline (ffmpeg-Cloud / client-side)
07	Öffentliche Galerie + Passwortschutz	Toggle in galleries Doc · Public Route /p/:uid
08	Admin-Panel & CI/CD	Übersicht Nutzer / Speicher · Netlify build hook · Tests

6 · Design-Guidelines
Nutze 100 % das bestehende Tailwind-Layout von App.tsx.

Bewahre Farben, Shadow-Stufen, Animations-Timing.

Passe nur an, wenn nötig (bspw. Login-Form, Uploader-DragArea).

Responsives Verhalten ≥ 320 px sicherstellen.

7 · Akzeptanzkriterien je Feature
Login/Signup: Neuregistrierter User landet auf leerer, persönlichen Galerie → URL /gallery/<uid> und sieht „Noch keine Medien“-Placeholder.

Isolation: Auth-User A kann /gallery/uid-B nicht aufrufen (Redirect → 404 / login).

Upload: Nach Upload wird Medium sofort in Timeline angezeigt; File liegt im Storage-Pfad /users/<uid>/….

Spotify: Nach Verbinden erscheint eingebettete Playlist; Token-Refresh nach Ablauf funktioniert.

Story: Ablauf nach 24 h; abgelaufene Stories werden in Firestore gelöscht oder mit expired:true markiert.

Recap: Wizard erzeugt MP4-URL im Storage, Medienquellen im Firestore-Dokument geloggt.

8 · Kommunikation & Doku
Commits in Englisch, Präfix Conventional Commits (feat:, fix:, chore:).

Notion / README-Abschnitt pro Sprint mit technischen Entscheidungen.

Environment-Secrets NIEMALS committen.

