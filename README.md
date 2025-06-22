# WeddingPix - Multi-User Gallery Platform

A sophisticated multi-user wedding gallery platform built with React, TypeScript, and Firebase. Each user gets their own isolated gallery with Spotify integration, stories, and recap generation.

## Architecture Overview

```
Frontend: React 18 + Vite + TypeScript + Tailwind CSS
Backend: Firebase (Auth, Firestore, Storage, Analytics)
Music: Spotify Web API + OAuth2
Hosting: Replit Deployment
```

## Features

### Core Features
- **Multi-user authentication** with email/password
- **Isolated user galleries** with unique URLs (`/gallery/:uid`)
- **Media upload** (photos, videos) with Firebase Storage
- **Real-time comments and likes** via Firestore
- **Stories with 24h expiration** 
- **Spotify playlist integration** per user
- **Timeline feature** for relationship milestones
- **Recap video generation** from selected media
- **Public gallery sharing** with optional password protection

### User Experience
- **Responsive design** optimized for mobile and desktop
- **Dark/light mode** support
- **Real-time updates** for collaborative viewing
- **Bulk media download** functionality
- **Admin panel** for user management

## Data Model

### Firestore Collections

#### `/users/{uid}`
```typescript
{
  email: string
  displayName: string
  createdAt: Date
  uid: string
}
```

#### `/galleries/{uid}`
```typescript
{
  title: string
  theme: 'elegant' | 'modern' | 'rustic' | 'romantic'
  public: boolean
  coverUrl?: string
  settings: {
    allowComments: boolean
    allowLikes: boolean
    allowStories: boolean
    passwordProtected: boolean
    password?: string
  }
}
```

#### `/users/{uid}/media/{mediaId}`
```typescript
{
  type: 'photo' | 'video' | 'note'
  url: string
  createdAt: Date
  caption?: string
  tags: string[]
}
```

#### `/users/{uid}/stories/{storyId}`
```typescript
{
  url: string
  expiresAt: Date
  thumbUrl: string
}
```

#### `/spotify_tokens/{uid}`
```typescript
{
  access: string
  refresh: string
  expiresAt: Date
}
```

## Security

### Firebase Security Rules
- **Authentication required** for all user data access
- **User isolation** - users can only access their own data
- **Storage path isolation** - `/users/{uid}/` and `/galleries/{uid}/`

### Environment Variables
```env
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-domain
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-storage-bucket
VITE_SPOTIFY_CLIENT_ID=your-spotify-client-id
VITE_SPOTIFY_CLIENT_SECRET=your-spotify-client-secret
```

## Development

### Setup
```bash
npm install
npm run dev
```

### Database Migration
```bash
npm run db:push
```

### Build
```bash
npm run build
```

## Sprint Progress

### ✅ Sprint 01: Auth-MVP + PrivateRoute
- Firebase authentication integration
- Email/password signup and signin
- Protected routes with authentication
- User document creation in Firestore

### ✅ Sprint 02: Gallery-Isolation  
- User-specific gallery creation
- Firestore gallery document structure
- Default gallery view from existing UI

### 🔄 Sprint 03: Media-Upload (Current)
- Drag & drop upload interface
- Firebase Storage integration with user isolation
- Firestore media document creation
- Timeline integration with user data

### 📋 Upcoming Sprints
- **Sprint 04**: Spotify OAuth per user
- **Sprint 05**: Stories with expiration logic
- **Sprint 06**: Recap video generation
- **Sprint 07**: Public galleries with password protection
- **Sprint 08**: Admin panel and CI/CD

## Key Technologies

- **React 18** with TypeScript for type safety
- **Vite** for fast development and building
- **Tailwind CSS** for responsive styling
- **Firebase** for backend services
- **Spotify Web API** for music integration
- **Radix UI** for accessible components
- **Framer Motion** for smooth animations

## Deployment

The application is configured for Replit deployment with:
- Automatic builds on push
- Environment variable management
- Health checks and monitoring
- Custom domain support