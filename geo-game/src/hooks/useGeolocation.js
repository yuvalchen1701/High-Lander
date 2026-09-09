import { useEffect, useState } from 'react'

export function useGeolocation() {
  const [position, setPosition] = useState(null)
  const [initialPosition, setInitialPosition] = useState(null)
  const [error, setError] = useState(() =>
    navigator.geolocation
      ? ''
      : 'Geolocation is not supported by this browser.',
  )

  useEffect(() => {
    if (!navigator.geolocation) {
      return
    }

    const watchId = navigator.geolocation.watchPosition(
      ({ coords }) => {
        const currentPosition = [coords.latitude, coords.longitude]

        setPosition(currentPosition)
        setInitialPosition((firstPosition) =>
          firstPosition ?? currentPosition,
        )
      },
      (geolocationError) => {
        if (geolocationError.code === geolocationError.PERMISSION_DENIED) {
          setError(
            'Location permission was denied. Please allow location access and reload the page.',
          )
          return
        }

        setError(
          `Unable to retrieve your location: ${geolocationError.message}`,
        )
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      },
    )

    return () => {
      navigator.geolocation.clearWatch(watchId)
    }
  }, [])

  return {
    position,
    initialPosition,
    error,
    loading: !position && !error,
  }
}
