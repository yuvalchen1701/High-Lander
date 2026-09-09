import { GameMap } from './components/GameMap.jsx'
import { useGame } from './hooks/useGame.js'
import { useGeolocation } from './hooks/useGeolocation.js'
import './App.css'

export default function App() {
  const {
    position: playerPosition,
    initialPosition,
    error: locationError,
    loading: isLocatingPlayer,
  } = useGeolocation()
  const {
    goalPosition,
    routeGeometry,
    isFindingRoute,
    goalReached,
    error: routingError,
  } = useGame(initialPosition, playerPosition)

  if (locationError) {
    return (
      <main className="status-message" role="alert">
        <h1>Location unavailable</h1>
        <p>{locationError}</p>
      </main>
    )
  }

  if (isLocatingPlayer) {
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
      <GameMap
        playerPosition={playerPosition}
        goalPosition={goalPosition}
        routeGeometry={routeGeometry}
      />
      {isFindingRoute && (
        <p className="route-status" aria-live="polite">
          Finding a reachable goal…
        </p>
      )}
      {goalReached && (
        <p className="goal-reached" role="status">
          Goal Reached!
        </p>
      )}
    </main>
  )
}
