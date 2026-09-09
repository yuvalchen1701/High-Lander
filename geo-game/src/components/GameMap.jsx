import { useEffect } from 'react'
import L from 'leaflet'
import {
  GeoJSON,
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMap,
} from 'react-leaflet'
import ballImage from '../assets/ball.jpeg'
import goalImage from '../assets/goal.jpeg'
import 'leaflet/dist/leaflet.css'

const playerIcon = L.divIcon({
  className: 'custom-marker-icon',
  html: `<div class="player-marker"><img src="${ballImage}" alt="" /></div>`,
  iconSize: [52, 52],
  iconAnchor: [26, 26],
  popupAnchor: [0, -28],
})

const goalIcon = L.divIcon({
  className: 'custom-marker-icon',
  html: `<div class="goal-marker"><img src="${goalImage}" alt="" /></div>`,
  iconSize: [68, 68],
  iconAnchor: [34, 34],
  popupAnchor: [0, -36],
})

const routeOutlineStyle = {
  color: '#ffffff',
  weight: 10,
  opacity: 0.95,
  lineCap: 'round',
  lineJoin: 'round',
}

const routeStyle = {
  color: '#1677ff',
  weight: 6,
  opacity: 1,
  lineCap: 'round',
  lineJoin: 'round',
}

function FitRoute({ routeGeometry }) {
  const map = useMap()

  useEffect(() => {
    const routeBounds = L.geoJSON(routeGeometry).getBounds()
    map.fitBounds(routeBounds, { padding: [40, 40] })
  }, [map, routeGeometry])

  return null
}

export function GameMap({ playerPosition, goalPosition, routeGeometry }) {
  return (
    <MapContainer center={playerPosition} zoom={15} className="map">
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={playerPosition} icon={playerIcon} zIndexOffset={1000}>
        <Popup>You are here</Popup>
      </Marker>
      {goalPosition && (
        <Marker position={goalPosition} icon={goalIcon} zIndexOffset={1100}>
          <Popup>Goal</Popup>
        </Marker>
      )}
      {routeGeometry && (
        <>
          <GeoJSON data={routeGeometry} style={routeOutlineStyle} />
          <GeoJSON data={routeGeometry} style={routeStyle} />
          <FitRoute routeGeometry={routeGeometry} />
        </>
      )}
    </MapContainer>
  )
}
