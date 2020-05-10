/* eslint-disable */
export const displayMap = locations => {
  mapboxgl.accessToken =
    'pk.eyJ1IjoidmlraXpheCIsImEiOiJjazh4YWhyeTAwNDZkM2dtdnh4NWR0c3ZmIn0.CQO00LQOaoGPAMx-qHDTaw';

  const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/vikizax/ck8xapjvh0t0o1ip9d3w4krql'
    //   center: [-118.113491, 34.111745],
    //   zoom: 10,
    //   interactive: false
  });

  const bounds = new mapboxgl.LngLatBounds();

  locations.forEach(loc => {
    // create a marker element
    const el = document.createElement('div');
    el.className = 'marker';

    // add a marker
    new mapboxgl.Marker({
      element: el,
      anchor: 'bottom'
    })
      .setLngLat(loc.coordinates)
      .addTo(map);

    bounds.extend(loc.coordinates);
  });

  map.fitBounds(bounds, {
    padding: {
      top: 200,
      bottom: 200,
      left: 100,
      right: 100
    }
  });
};
