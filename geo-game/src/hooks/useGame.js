import { useEffect, useState } from 'react'
import {
  findNearestRoutablePoint,
  getRoute,
} from '../services/routing.js'
import {
  generateRandomGoal,
  getDistanceKm,
  MAX_GOAL_DISTANCE_KM,
  MIN_GOAL_DISTANCE_KM,
} from '../utils/geo.js'

const MAX_GOAL_GENERATION_ATTEMPTS = 10
const GOAL_REACHED_DISTANCE_METERS = 50

export function useGame(initialPlayerPosition, playerPosition) {
  const [goalPosition, setGoalPosition] = useState(null)
  const [routeGeometry, setRouteGeometry] = useState(null)
  const [isFindingRoute, setIsFindingRoute] = useState(false)
  const [goalReached, setGoalReached] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!initialPlayerPosition) {
      return
    }

    let isActive = true

    async function initializeGame() {
      setIsFindingRoute(true)

      try {
        for (
          let attempt = 1;
          attempt <= MAX_GOAL_GENERATION_ATTEMPTS;
          attempt += 1
        ) {
          const candidateGoal = generateRandomGoal(initialPlayerPosition)
          const snappedGoal = await findNearestRoutablePoint(candidateGoal)

          if (!snappedGoal) {
            continue
          }

          const snappedDistanceKm = getDistanceKm(
            initialPlayerPosition,
            snappedGoal,
          )

          if (
            snappedDistanceKm < MIN_GOAL_DISTANCE_KM ||
            snappedDistanceKm > MAX_GOAL_DISTANCE_KM
          ) {
            continue
          }

          const route = await getRoute(initialPlayerPosition, snappedGoal)

          if (route) {
            if (isActive) {
              setGoalPosition(snappedGoal)
              setRouteGeometry(route)
              setIsFindingRoute(false)
            }
            return
          }
        }

        if (isActive) {
          setError(
            `Could not find a reachable goal after ${MAX_GOAL_GENERATION_ATTEMPTS} attempts.`,
          )
          setIsFindingRoute(false)
        }
      } catch (routingError) {
        if (isActive) {
          setError(routingError.message)
          setIsFindingRoute(false)
        }
      }
    }

    initializeGame()

    return () => {
      isActive = false
    }
  }, [initialPlayerPosition])

  useEffect(() => {
    if (
      !goalReached &&
      playerPosition &&
      goalPosition &&
      getDistanceKm(playerPosition, goalPosition) * 1000 <=
        GOAL_REACHED_DISTANCE_METERS
    ) {
      // Completion is intentionally latched and never reset by later GPS updates.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setGoalReached(true)
    }
  }, [goalPosition, goalReached, playerPosition])

  return {
    goalPosition,
    routeGeometry,
    isFindingRoute,
    goalReached,
    error,
  }
}
