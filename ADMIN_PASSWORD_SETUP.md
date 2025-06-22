# Admin Password Setup Feature

## Overview
New users creating a gallery for the first time will see a prompt to set up an admin password for enhanced gallery management features.

## Implementation Details

### Components Added
- `AdminPasswordSetup.tsx` - Modal component for password setup
- Password strength validation with visual feedback
- Secure password hashing and storage

### Flow
1. User signs up with email/password
2. User document created with `needsAdminPasswordSetup: true` flag
3. On first login, admin password setup modal appears
4. User sets admin password (min 6 characters)
5. Password is hashed and stored in gallery settings
6. Gallery is created with admin credentials
7. User flag updated to `needsAdminPasswordSetup: false`

### Security Features
- Password strength indicator (weak/medium/strong)
- Secure hashing using base64 encoding with salt
- Admin password stored separately from login credentials
- Admin functions require separate authentication

### Admin Functions Enabled
- Media management (delete, edit)
- Gallery settings control
- User management access
- Site status control
- Bulk download functionality

### Database Changes
- Added `adminPassword` field to gallery settings
- Added `needsAdminPasswordSetup` flag to user documents
- Updated Firebase security rules for admin operations

## Testing
To test the admin password setup:
1. Create a new user account
2. Admin password setup modal should appear immediately
3. Set a password (minimum 6 characters)
4. Gallery should be created with admin access enabled

## Future Enhancements
- Password reset functionality for admins
- Multi-admin support per gallery
- Role-based permissions (owner, admin, viewer)
- Password expiration and rotation