export const MIN_GOAL_DISTANCE_KM = 1
export const MAX_GOAL_DISTANCE_KM = 10
export const EARTH_RADIUS_KM = 6371

const toRadians = (degrees) => (degrees * Math.PI) / 180
const toDegrees = (radians) => (radians * 180) / Math.PI

export function getDistanceKm(startPosition, endPosition) {
  const [startLatitude, startLongitude] = startPosition.map(toRadians)
  const [endLatitude, endLongitude] = endPosition.map(toRadians)
  const latitudeDifference = endLatitude - startLatitude
  const longitudeDifference = endLongitude - startLongitude

  const haversine =
    Math.sin(latitudeDifference / 2) ** 2 +
    Math.cos(startLatitude) *
      Math.cos(endLatitude) *
      Math.sin(longitudeDifference / 2) ** 2

  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(haversine))
}

export function generateRandomGoal([latitude, longitude]) {
  const distanceKm =
    MIN_GOAL_DISTANCE_KM +
    Math.random() * (MAX_GOAL_DISTANCE_KM - MIN_GOAL_DISTANCE_KM)
  const bearing = Math.random() * 2 * Math.PI
  const angularDistance = distanceKm / EARTH_RADIUS_KM
  const startLatitude = toRadians(latitude)
  const startLongitude = toRadians(longitude)

  const destinationLatitude = Math.asin(
    Math.sin(startLatitude) * Math.cos(angularDistance) +
      Math.cos(startLatitude) *
        Math.sin(angularDistance) *
        Math.cos(bearing),
  )

  const destinationLongitude =
    startLongitude +
    Math.atan2(
      Math.sin(bearing) *
        Math.sin(angularDistance) *
        Math.cos(startLatitude),
      Math.cos(angularDistance) -
        Math.sin(startLatitude) * Math.sin(destinationLatitude),
    )

  return [toDegrees(destinationLatitude), toDegrees(destinationLongitude)]
}
