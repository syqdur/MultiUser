# replit.md

## Overview

This is a full-stack wedding gallery web application built with React and Express. The application provides an Instagram-style interface for wedding guests to share photos, videos, and messages. It features real-time functionality, Spotify integration for music wishlists, and comprehensive admin controls.

## System Architecture

The application follows a full-stack TypeScript architecture with:

- **Frontend**: React with Vite for fast development and building
- **Backend**: Express.js server with TypeScript
- **Database**: PostgreSQL with Drizzle ORM (configured but using memory storage currently)
- **Real-time Data**: Firebase Firestore for live updates
- **File Storage**: Firebase Storage for media files
- **External APIs**: Spotify Web API for music features
- **UI Framework**: Tailwind CSS with shadcn/ui components

## Key Components

### Frontend Architecture
- **React 18** with TypeScript and Vite for development
- **Tailwind CSS** for styling with dark mode support
- **shadcn/ui** components for consistent UI patterns
- **Custom hooks** for user management and dark mode
- **Firebase SDK** for real-time data and storage

### Backend Architecture
- **Express.js** server with TypeScript
- **Memory storage** for user data (with Drizzle schema prepared for PostgreSQL)
- **Static file serving** with Vite integration in development
- **API routing** structure ready for expansion

### Database Schema
- **Users table** with username, password, and ID fields
- **Drizzle ORM** configured for PostgreSQL with migration support
- **Type-safe** database operations with Zod validation

### Key Features
- **Instagram-style gallery** with posts, likes, and comments
- **Stories functionality** with 24-hour expiration
- **Video recording** with camera switching
- **Spotify integration** for music wishlists
- **Timeline feature** for relationship milestones
- **Admin panel** with comprehensive controls
- **Real-time user presence** indicators
- **Bulk media download** functionality
- **Responsive design** with mobile-first approach

## Data Flow

1. **User Authentication**: Device-based identification with username storage
2. **Media Upload**: Files uploaded to Firebase Storage with metadata in Firestore
3. **Real-time Updates**: Firebase listeners for live comments, likes, and stories
4. **Admin Controls**: Protected routes and functions for administrative tasks
5. **External APIs**: Spotify OAuth flow for playlist management

## External Dependencies

### Core Dependencies
- **React ecosystem**: React, React DOM, React Query for state management
- **UI Components**: Radix UI primitives with shadcn/ui abstractions
- **Styling**: Tailwind CSS with class-variance-authority
- **Database**: Drizzle ORM with PostgreSQL adapter
- **Firebase**: Firestore and Storage for real-time data and file storage
- **Development**: Vite, TypeScript, PostCSS

### Third-party Integrations
- **Spotify Web API**: Music wishlist functionality with OAuth 2.0 PKCE flow
- **Firebase**: Real-time database and cloud storage
- **Neon Database**: PostgreSQL hosting (configured via DATABASE_URL)

## Deployment Strategy

### Development Environment
- **Replit integration** with automatic module detection
- **Vite dev server** with HMR and runtime error overlay
- **PostgreSQL 16** module for database functionality
- **Port 5000** for the development server

### Production Build
- **Vite build** process generates optimized static files
- **esbuild** bundles the Express server for production
- **Autoscale deployment** target for dynamic scaling
- **Static file serving** from built assets

### Environment Configuration
- **NODE_ENV** switching between development and production
- **DATABASE_URL** for PostgreSQL connection
- **Spotify credentials** for API integration
- **Firebase configuration** embedded in client

## Development Roadmap

### Sprint Plan (Multi-User Platform Evolution)
1. **Sprint 01**: Auth-MVP + PrivateRoute (Signup, Login, Logout UI, Firestore users, /gallery/:uid private route)
2. **Sprint 02**: Gallery-Isolation (Firestore galleries doc, default gallery view)  
3. **Sprint 03**: Media-Upload (Drag & Drop → Storage /users/{uid}/..., Firestore media entry)
4. **Sprint 04**: Spotify-pro-User (OAuth flow per user, token save, gallery embedding)
5. **Sprint 05**: Stories (24h expiration logic, UI carousel)
6. **Sprint 06**: Recap-Generator (Selection wizard, render pipeline)
7. **Sprint 07**: Public Gallery + Password Protection (Toggle in galleries doc, public route /p/:uid)
8. **Sprint 08**: Admin-Panel & CI/CD (User overview, storage management)

### Current Status: Sprint 02 Complete - Firebase Setup Required
**Status**: Sprint 02 implementation complete, awaiting Firebase authentication configuration
**Previous**: Sprint 02 completed successfully, user-specific gallery isolation implemented
**Blocker**: Firebase email/password authentication needs to be enabled in Firebase Console

#### Sprint 01 Deliverables Completed:
- ✓ Firebase authentication integration with useAuth hook
- ✓ AuthModal component with email/password signup and signin
- ✓ PrivateRoute component for access control
- ✓ Enhanced error handling for authentication states
- ✓ User document creation in Firestore
- ✓ Automatic gallery creation for new users
- ✓ App.tsx refactored for authentication-based routing

#### Sprint 02 Deliverables Completed:
- ✓ User gallery service and data structure designed
- ✓ User-specific Firebase services implemented (userFirebaseService.ts)
- ✓ User-specific gallery service created (userGalleryService.ts)
- ✓ GalleryApp component migrated to use user-specific services
- ✓ Compatibility layer added for existing component interfaces
- ✓ Media upload, comments, and likes isolated per user
- ✓ User-specific data collections in Firestore structure

## Changelog

- June 22, 2025. Initial setup and migration from Bolt to Replit completed
- June 22, 2025. Started multi-user platform development roadmap
- June 22, 2025. Sprint 01 (Auth-MVP + PrivateRoute) implementation completed
- June 22, 2025. Sprint 02 (Gallery-Isolation) implementation completed with user-specific data services

## User Preferences

Preferred communication style: Simple, everyday language.
Project goal: Transform from single-user demo to multi-user wedding gallery platform with user isolation.