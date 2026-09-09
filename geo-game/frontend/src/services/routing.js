const OSRM_BASE_URL = 'https://router.project-osrm.org/route/v1/driving'
const OSRM_NEAREST_URL = 'https://router.project-osrm.org/nearest/v1/driving'

export async function findNearestRoutablePoint(position) {
  const [latitude, longitude] = position
  const url = `${OSRM_NEAREST_URL}/${longitude},${latitude}?number=1`

  let response

  try {
    response = await fetch(url)
  } catch {
    throw new Error('Could not connect to the routing service.')
  }

  if (!response.ok) {
    throw new Error('The routing service returned an error.')
  }

  const data = await response.json()
  const snappedCoordinates = data.waypoints?.[0]?.location

  if (data.code !== 'Ok' || snappedCoordinates?.length !== 2) {
    return null
  }

  const [snappedLongitude, snappedLatitude] = snappedCoordinates
  return [snappedLatitude, snappedLongitude]
}

export async function getRoute(startPosition, endPosition) {
  const [startLatitude, startLongitude] = startPosition
  const [endLatitude, endLongitude] = endPosition
  const coordinates = `${startLongitude},${startLatitude};${endLongitude},${endLatitude}`
  const url = `${OSRM_BASE_URL}/${coordinates}?overview=full&geometries=geojson`

  let response

  try {
    response = await fetch(url)
  } catch {
    throw new Error('Could not connect to the routing service.')
  }

  if (!response.ok) {
    throw new Error('The routing service returned an error.')
  }

  const data = await response.json()
  const route = data.routes?.[0]

  if (data.code !== 'Ok' || !route?.geometry?.coordinates?.length) {
    return null
  }

  return route.geometry
}
