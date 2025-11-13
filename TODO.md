# OAuth Login Integration Tasks

## 1. Install Dependencies
- [x] Install passport, passport-google-oauth20, passport-linkedin-oauth2, passport-apple

## 2. Update server.js
- [x] Add Passport.js setup
- [x] Add OAuth strategies for Google, LinkedIn, and Apple
- [x] Add routes: /auth/google, /auth/google/callback, /auth/linkedin, /auth/linkedin/callback, /auth/apple, /auth/apple/callback
- [x] Handle user creation/login on OAuth callbacks
- [x] Ensure JWT token generation for OAuth users

## 3. Update AuthContext.jsx
- [x] Add loginWithGoogle function that redirects to /auth/google
- [x] Add loginWithLinkedIn function that redirects to /auth/linkedin
- [x] Add loginWithApple function that redirects to /auth/apple

## 4. Update Auth.jsx
- [x] Add OAuth login buttons (Google, LinkedIn, Apple) below the existing forms
- [x] Style the buttons appropriately

## 5. Followup Steps
- [x] Install dependencies (npm install)
- [ ] Test OAuth flows (requires real API keys)
- [ ] Ensure CORS and redirects work properly
