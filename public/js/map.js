
    
    const map = new mapboxgl.Map({
        accessToken: mapToken,
        container: 'map',
        style: 'mapbox://styles/mapbox/standard', // Use the standard style for the map
        projection: 'globe', // display the map as a globe
        zoom: 11, // initial zoom level, 0 is the world view, higher values zoom in
        center: listing.geometry.coordinates // center the map on this longitude and latitude
    });

    map.addControl(new mapboxgl.NavigationControl());
    // map.scrollZoom.disable();

    map.on('style.load', () => {
        map.setFog({}); // Set the default atmosphere style
    });
     
    // Create a default Marker and add it to the map.
    const marker1 = new mapboxgl.Marker({color: "red"})
        .setLngLat(listing.geometry.coordinates)  // Listing.geometry.coordinates
        .setPopup(new mapboxgl.Popup({offset: 25 })
            .setHTML(
             `<h4> ${listing.title} </h4> <p>Exact location will be provided after booking!</p>`
            )
        )
        .addTo(map);

