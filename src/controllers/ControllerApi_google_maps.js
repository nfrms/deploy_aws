const sequelize = require('sequelize');
const database = require('../db');

let storedLocations = [];
let currentLocation = { latitude: null, longitude: null };

exports.saveLocations = async (req, res) => {
    try {
        const { locations, currentLatitude, currentLongitude } = req.body;
        storedLocations = locations;
        currentLocation = { latitude: currentLatitude, longitude: currentLongitude };
        res.status(200).send('Locations e coordenadas atuais recebidas com sucesso');
    } catch (erro) {
        console.error('Erro ao salvar locations: ', erro);
        res.status(500).send('Erro ao salvar locations');
    }
};

exports.List = async (req, res) => {
    try {
        const data = await database.query('SELECT * FROM [dbo].[View_chave_api_google_maps]', { type: sequelize.QueryTypes.SELECT });
        const apiKey = data.length > 0 ? data[0].chave : null; 
        if (!apiKey) {
            return res.status(500).send('Chave da API não encontrada');
        }

        const waypoints = storedLocations.map(location => {
            const isCurrentPoint = location.latitude === currentLocation.latitude && location.longitude === currentLocation.longitude;
            return {
                lat: location.latitude,
                lng: location.longitude,
                isHighlighted: isCurrentPoint
            };
        });

        if (waypoints.length === 0) {
            return res.status(400).send('Nenhum waypoint disponível.');
        }

        const centerIndex = Math.ceil(waypoints.length / 2) - 1;
        const centerPoint = waypoints[centerIndex];

        const currentPoint = currentLocation.latitude && currentLocation.longitude ? {
            lat: currentLocation.latitude,
            lng: currentLocation.longitude
        } : centerPoint;

        const mapHTML = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Mapa com Rota</title>
            <script src="https://maps.googleapis.com/maps/api/js?key=${apiKey}"></script>
            <style>
                #map {
                    height: 100vh;
                    width: 100%;
                }
            </style>
        </head>
        <body>
            <div id="map"></div>
            <script>
                function initMap() {
                    const center = { lat: ${currentPoint.lat}, lng: ${currentPoint.lng} };
                    const map = new google.maps.Map(document.getElementById('map'), {
                        zoom: 14,
                        center: center
                    });

                    const waypoints = ${JSON.stringify(waypoints)};

                    const directionsService = new google.maps.DirectionsService();
                    const directionsRenderer = new google.maps.DirectionsRenderer({
                        map: map,
                        suppressMarkers: true
                    });

                    const start = waypoints[0];
                    const end = waypoints[waypoints.length - 1];
                    const waypointLocations = waypoints.slice(1, -1).map(point => ({
                        location: { lat: point.lat, lng: point.lng },
                        stopover: true
                    }));

                    directionsService.route({
                        origin: { lat: start.lat, lng: start.lng },
                        destination: { lat: end.lat, lng: end.lng },
                        waypoints: waypointLocations,
                        travelMode: google.maps.TravelMode.WALKING
                    }, (response, status) => {
                        if (status === google.maps.DirectionsStatus.OK) {
                            directionsRenderer.setDirections(response);
                        } else {
                            console.error('Erro ao traçar a rota: ' + status);
                        }
                    });

                    waypoints.forEach((point) => {
                        new google.maps.Marker({
                            position: { lat: point.lat, lng: point.lng },
                            map: map,
                            icon: point.isHighlighted ? {
                                 url: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQRW3I5vucptTSbw5S54ui3z8L-P2OHoEC03A&s',
                                scaledSize: new google.maps.Size(80, 80), // Ajusta o tamanho da imagem (largura x altura)
                            } : null
                        });
                    });
                }

                window.onload = initMap;
            </script>
        </body>
        </html>
        `;

        res.status(200).send(mapHTML);
    } catch (erro) {
        console.error('Erro ao listar locations: ', erro);
        res.status(500).send('Erro ao listar locations');
    }
};


