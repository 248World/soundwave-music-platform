# SoundWave Music Platform

SoundWave is a full-stack music streaming platform built for listeners, artists, and administrators. The platform allows users to discover songs, follow artists, create playlists, like tracks, download music, and manage music content through role-based dashboards.

## Features

### Listener
- Browse public songs, artists, and playlists
- Search songs by title, artist, lyrics, country, genre, or keywords
- Play, pause, like, and download songs
- Create and manage personal playlists
- Add tracks to playlists
- Follow artists

### Artist
- Create an artist profile
- Edit artist name, country, bio, and profile image
- Upload tracks with audio file, cover image, genre, lyrics, and download settings
- Manage uploaded music from the dashboard
- View public artist profile

### Admin
- Monitor users, tracks, playlists, and platform activity
- Approve pending users
- Disable or delete users
- Hide or publish tracks
- Manage public playlists
- View platform statistics

## Tech Stack

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

## Project Structure

```txt
soundwave/
├── client/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── store/
│   │   └── api/
│   └── package.json
│
├── server/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── routes/
│   │   └── server.js
│   └── package.json
│
├── README.md
└── .gitignore