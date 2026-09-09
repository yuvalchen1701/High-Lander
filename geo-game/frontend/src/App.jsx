import { useEffect, useState } from 'react'
import L from 'leaflet'
import {
  GeoJSON,
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMap,
} from 'react-leaflet'
import ballImage from './assets/ball.jpeg'
import goalImage from './assets/goal.jpeg'
import { getRoute } from './services/routing.js'
import { generateRandomGoal } from './utils/geo.js'
import 'leaflet/dist/leaflet.css'
import './App.css'

const MAX_GOAL_GENERATION_ATTEMPTS = 10

const playerIcon = L.icon({
  iconUrl: ballImage,
  iconSize: [42, 42],
  iconAnchor: [21, 21],
  popupAnchor: [0, -21],
})

const goalIcon = L.icon({
  iconUrl: goalImage,
  iconSize: [46, 46],
  iconAnchor: [23, 23],
  popupAnchor: [0, -23],
})

function FitRoute({ routeGeometry }) {
  const map = useMap()

  useEffect(() => {
    const routeBounds = L.geoJSON(routeGeometry).getBounds()
    map.fitBounds(routeBounds, { padding: [40, 40] })
  }, [map, routeGeometry])

  return null
}

export default function App() {
  const [playerPosition, setPlayerPosition] = useState(null)
  const [goalPosition, setGoalPosition] = useState(null)
  const [routeGeometry, setRouteGeometry] = useState(null)
  const [isFindingRoute, setIsFindingRoute] = useState(false)
  const [locationError, setLocationError] = useState(() =>
    navigator.geolocation
      ? ''
      : 'Geolocation is not supported by this browser.',
  )
  const [routingError, setRoutingError] = useState('')

  useEffect(() => {
    if (!navigator.geolocation) {
      return
    }

    let isActive = true

    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        if (isActive) {
          setPlayerPosition([coords.latitude, coords.longitude])
        }
      },
      (error) => {
        if (!isActive) {
          return
        }

        if (error.code === error.PERMISSION_DENIED) {
          setLocationError(
            'Location permission was denied. Please allow location access and reload the page.',
          )
          return
        }

        setLocationError(`Unable to retrieve your location: ${error.message}`)
      },
      { enableHighAccuracy: true },
    )

    return () => {
      isActive = false
    }
  }, [])

  useEffect(() => {
    if (!playerPosition) {
      return
    }

    let isActive = true

    async function findReachableGoal() {
      setIsFindingRoute(true)

      try {
        for (
          let attempt = 1;
          attempt <= MAX_GOAL_GENERATION_ATTEMPTS;
          attempt += 1
        ) {
          const candidateGoal = generateRandomGoal(playerPosition)
          const candidateRoute = await getRoute(playerPosition, candidateGoal)

          if (candidateRoute) {
            if (isActive) {
              setGoalPosition(candidateGoal)
              setRouteGeometry(candidateRoute)
              setIsFindingRoute(false)
            }
            return
          }
        }

        if (isActive) {
          setRoutingError(
            `Could not find a reachable goal after ${MAX_GOAL_GENERATION_ATTEMPTS} attempts.`,
          )
          setIsFindingRoute(false)
        }
      } catch (error) {
        if (isActive) {
          setRoutingError(error.message)
          setIsFindingRoute(false)
        }
      }
    }

    findReachableGoal()

    return () => {
      isActive = false
    }
  }, [playerPosition])

  if (locationError) {
    return (
      <main className="status-message" role="alert">
        <h1>Location unavailable</h1>
        <p>{locationError}</p>
      </main>
    )
  }

  if (!playerPosition) {
    return (
      <main className="status-message" aria-live="polite">
        <p>Getting your location…</p>
      </main>
    )
  }

  if (routingError) {
    return (
      <main className="status-message" role="alert">
        <h1>Route unavailable</h1>
        <p>{routingError}</p>
      </main>
    )
  }

  return (
    <main className="game">
      <MapContainer center={playerPosition} zoom={15} className="map">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={playerPosition} icon={playerIcon}>
          <Popup>You are here</Popup>
        </Marker>
        {goalPosition && (
          <Marker position={goalPosition} icon={goalIcon}>
            <Popup>Your goal</Popup>
          </Marker>
        )}
        {routeGeometry && (
          <>
            <GeoJSON data={routeGeometry} />
            <FitRoute routeGeometry={routeGeometry} />
          </>
        )}
      </MapContainer>
      {isFindingRoute && (
        <p className="route-status" aria-live="polite">
          Finding a reachable goal…
        </p>
      )}
    </main>
  )
}
