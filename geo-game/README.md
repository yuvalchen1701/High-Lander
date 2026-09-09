# GeoGame

GeoGame is a web-based navigation game built with React, Leaflet, OpenStreetMap and OSRM.

The game retrieves the player's real-time location, generates a random reachable goal within 1–10 km, calculates a valid route to the goal, and detects when the player reaches it.

## Features

- Real-time player location using the Browser Geolocation API
- Interactive map using Leaflet and OpenStreetMap
- Random goal generation within 1–10 km
- Goal snapping to the routable road network using OSRM
- Shortest route visualization
- Goal detection within 50 meters
- Docker Compose support

Dynamic route recalculation is not implemented because it is defined as bonus functionality.

## Architecture

```text
Browser Geolocation
        |
        v
     React
        |
        +---- Geographic calculations
        |
        +---- OSRM routing
        |
        v
React Leaflet + OpenStreetMap
```

The frontend is separated into:

- `components/` - map rendering
- `hooks/` - geolocation and game lifecycle
- `services/` - OSRM integration
- `utils/` - geographic calculations

## Requirements

- Docker
- Docker Compose
- Internet connection
- Browser with Geolocation support

## Run without Docker

```bash
cd frontend
npm install
npm run dev
```
Open the URL displayed by Vite.

## External Services

The current implementation uses:

- OpenStreetMap map tiles
- Public OSRM routing service

These services require an internet connection.

For a fully offline/local deployment, OSRM and map tiles can be self-hosted locally.
