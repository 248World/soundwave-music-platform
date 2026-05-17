# SoundWave Project Documentation

## 1. Project Overview

SoundWave is a full-stack music streaming platform built for listeners, artists, and administrators.

The platform allows users to discover songs, play music, like tracks, download songs, follow artists, create playlists, and manage music content through role-based dashboards.

## 2. Project Objective

The main objective of SoundWave is to provide a complete music platform where:

- Listeners can discover, play, like, download, and organize songs.
- Artists can upload tracks and manage their public profiles.
- Admins can monitor users, tracks, playlists, and platform activity.

## 3. User Roles

### Listener

Listeners can:

- Browse songs
- Search songs, artists, playlists, genres, lyrics, and countries
- Play and pause tracks
- Like songs
- Download songs
- Create playlists
- Add songs to playlists
- Follow artists

### Artist

Artists can:

- Edit their artist profile
- Upload tracks
- Add cover images
- Add lyrics or descriptions
- Set download permissions
- View their public artist page

### Admin

Admins can:

- View platform statistics
- Approve pending users
- Manage users
- Manage tracks
- Manage playlists
- Monitor platform activity

## 4. Technologies Used

### Frontend

- React
- Vite
- Tailwind CSS
- React Router
- Zustand
- Axios
- React Icons

### Backend

- Node.js
- Express.js
- MySQL
- JWT Authentication
- Multer File Upload

## 5. Development Process

### Step 1: Project Setup

The project was separated into frontend and backend folders.

The frontend was created using React and Vite, while the backend was created using Node.js and Express.js.

### Step 2: Authentication

Authentication was implemented using JWT. Users can register and log in based on their role.

### Step 3: Role-Based Access

Different dashboards and actions were created for listeners, artists, and admins.

### Step 4: Music Upload

Artists can upload audio files, cover images, lyrics, genre, and download settings.

### Step 5: Music Player

A floating music player was added with play, pause, next, previous, and track details.

### Step 6: Search System

Search was improved to support songs, artists, country, genre, lyrics, playlists, and related keywords.

### Step 7: Playlist System

Listeners can create playlists, view playlists, and add tracks to playlists.

### Step 8: Admin Dashboard

The admin dashboard allows user approval, user management, track management, playlist management, and platform monitoring.

### Step 9: UI/UX Improvements

The interface was redesigned with:

- Custom SoundWave logo
- Abstract blurred background
- Compact layouts
- Professional login and register pages
- Improved dashboards
- Better cards and forms
- Responsive sidebar
- Floating music player

## 6. Challenges Faced

Some challenges during development included:

- Fixing frontend and backend route mismatches
- Making search work across multiple data fields
- Handling file uploads correctly
- Keeping dashboards responsive
- Preventing content overlap
- Making the UI look professional and consistent

## 7. Final Result

The final result is a functional full-stack music streaming platform with role-based dashboards, music upload, playlists, search, likes, downloads, and admin management.