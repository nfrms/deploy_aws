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
        // Consulta ao banco de dados para obter a chave da API
        const data = await database.query('SELECT * FROM [dbo].[View_chave_api_google_maps]', { type: sequelize.QueryTypes.SELECT });
        const apiKey = data.length > 0 ? data[0].chave : null; 
        if (!apiKey) {
            return res.status(500).send('Chave da API não encontrada');
        }

        // Usa storedLocations diretamente e marca o ponto coincidente
        const waypoints = storedLocations.map(location => {
            const isCurrentPoint = location.latitude === currentLocation.latitude && location.longitude === currentLocation.longitude;
            return {
                lat: location.latitude,
                lng: location.longitude,
                isHighlighted: isCurrentPoint // Marca o ponto se for igual ao ponto atual
            };
        });

        // Verificar se existem waypoints válidos
        if (waypoints.length === 0) {
            return res.status(400).send('Nenhum waypoint disponível.');
        }

        // Calcula o ponto central baseado no comprimento do array
        const centerIndex = Math.ceil(waypoints.length / 2) - 1;
        const centerPoint = waypoints[centerIndex];

        // Se as coordenadas do ponto turístico atual foram fornecidas, use-as para centralizar o mapa
        const currentPoint = currentLocation.latitude && currentLocation.longitude ? {
            lat: currentLocation.latitude,
            lng: currentLocation.longitude
        } : centerPoint;

        // Construir o HTML para mostrar o mapa com a rota a pé e o ponto destacado
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

                    // Criação do DirectionsService e DirectionsRenderer para a rota
                    const directionsService = new google.maps.DirectionsService();
                    const directionsRenderer = new google.maps.DirectionsRenderer({
                        map: map,
                        suppressMarkers: true // Suprime os marcadores padrão para usar os personalizados
                    });

                    // Definir o ponto inicial e final, e os waypoints intermediários
                    const start = waypoints[0];
                    const end = waypoints[waypoints.length - 1];
                    const waypointLocations = waypoints.slice(1, -1).map(point => ({
                        location: { lat: point.lat, lng: point.lng },
                        stopover: true
                    }));

                    // Solicitar rota ao DirectionsService
                    directionsService.route({
                        origin: { lat: start.lat, lng: start.lng },
                        destination: { lat: end.lat, lng: end.lng },
                        waypoints: waypointLocations,
                        travelMode: google.maps.TravelMode.WALKING // Define como a rota a pé
                    }, (response, status) => {
                        if (status === google.maps.DirectionsStatus.OK) {
                            directionsRenderer.setDirections(response);
                        } else {
                            console.error('Erro ao traçar a rota: ' + status);
                        }
                    });

                    // Adicionar os marcadores personalizados (balões)
                    waypoints.forEach((point) => {
                        new google.maps.Marker({
                            position: { lat: point.lat, lng: point.lng },
                            map: map,
                            icon: {
                                url: point.isHighlighted ? 'http://maps.google.com/mapfiles/ms/icons/green-dot.png' : 'http://maps.google.com/mapfiles/ms/icons/red-dot.png', // Define o ícone do balão
                                scaledSize: new google.maps.Size(40, 40) // Ajusta o tamanho do balão
                            }
                        });
                    });
                }

                window.onload = initMap;
            </script>
        </body>
        </html>
        `;

        // Retornar o HTML construído
        res.status(200).send(mapHTML);
    } catch (erro) {
        console.error('Erro ao listar locations: ', erro);
        res.status(500).send('Erro ao listar locations');
    }
};




// const sequelize = require('sequelize');
// const database = require('../db');

// let storedLocations = [];
// let currentLocation = { latitude: null, longitude: null }; // Variável para armazenar o ponto turístico atual

// exports.saveLocations = async (req, res) => {
//     try {
//         const { locations, currentLatitude, currentLongitude } = req.body;
//         storedLocations = locations;
//         currentLocation = { latitude: currentLatitude, longitude: currentLongitude }; // Armazenar as coordenadas atuais
//         res.status(200).send('Locations e coordenadas atuais recebidas com sucesso');
//     } catch (erro) {
//         console.error('Erro ao salvar locations: ', erro);
//         res.status(500).send('Erro ao salvar locations');
//     }
// };

// exports.List = async (req, res) => {
//     try {
//         // Consulta ao banco de dados para obter a chave da API
//         const data = await database.query('SELECT * FROM [dbo].[View_chave_api_google_maps]', { type: sequelize.QueryTypes.SELECT });
//         const apiKey = data.length > 0 ? data[0].chave : null; 
//         if (!apiKey) {
//             return res.status(500).send('Chave da API não encontrada');
//         }

//         // Converte 'storedLocations' para 'lat' e 'lng'
//         const waypoints = storedLocations.map(location => ({
//             lat: location.latitude,
//             lng: location.longitude
//         }));

//         // Verificar se existem waypoints válidos
//         if (waypoints.length === 0) {
//             return res.status(400).send('Nenhum waypoint disponível.');
//         }

//         // Calcula o ponto central baseado no comprimento do array
//         const centerIndex = Math.ceil(waypoints.length / 2) - 1;
//         const centerPoint = waypoints[centerIndex];

//         // Se as coordenadas do ponto turístico atual foram fornecidas, use-as para centralizar o mapa
//         const currentPoint = currentLocation.latitude && currentLocation.longitude ? {
//             lat: currentLocation.latitude,
//             lng: currentLocation.longitude
//         } : centerPoint;

//         // Envia o HTML com a chave da API e os waypoints
//         res.send(`
//             <!DOCTYPE html>
//             <html>
//             <head>
//                 <title>Mapa do Google</title>
//                 <script src="https://maps.googleapis.com/maps/api/js?key=${apiKey}"></script>
//                 <style>
//                     html, body {
//                         height: 100%;
//                         margin: 0;
//                         padding: 0;
//                     }
//                     #map {
//                         height: 100%; /* Ocupar todo o espaço disponível */
//                         width: 100%;
//                     }
//                 </style>
//                 <script>
//                     // Define 'currentLocation' para uso no JavaScript
//                     var currentLocation = {
//                         latitude: ${currentLocation.latitude},
//                         longitude: ${currentLocation.longitude}
//                     };

//                     function initMap() {
//                         var map = new google.maps.Map(document.getElementById('map'), {
//                             zoom: 14,
//                             center: { lat: ${currentPoint.lat}, lng: ${currentPoint.lng} } // Ponto central calculado dinamicamente ou ponto atual
//                         });

//                         var directionsService = new google.maps.DirectionsService();
//                         var directionsRenderer = new google.maps.DirectionsRenderer();
//                         directionsRenderer.setMap(map);

//                         // Recebe os waypoints passados do servidor
//                         var waypoints = ${JSON.stringify(waypoints)};

//                         // Configuração da rota
//                         var request = {
//                             origin: waypoints[0],
//                             destination: waypoints[waypoints.length - 1],
//                             waypoints: waypoints.slice(1, -1).map(point => ({
//                                 location: point,
//                                 stopover: true
//                             })),
//                             travelMode: 'WALKING'
//                         };

//                         directionsService.route(request, function(result, status) {
//                             if (status === 'OK') {
//                                 directionsRenderer.setDirections(result);
//                             } else {
//                                 console.error('Erro ao calcular a rota:', status);
//                             }
//                         });

//                         // Adiciona marcadores para os waypoints
//                         waypoints.forEach(function(point) {
//                             // Verifica se as coordenadas do ponto atual são iguais ao currentLocation
//                             var isCurrentLocation = point.lat === currentLocation.latitude && point.lng === currentLocation.longitude;
                            
//                             var marker = new google.maps.Marker({
//                                 position: point,
//                                 map: map,
//                                 title: isCurrentLocation ? 'Ponto Atual' : 'Waypoint',
//                                 icon: {
//                                     // Usa um ícone maior e de outra cor se for o ponto atual
//                                     url: isCurrentLocation ? 'http://maps.google.com/mapfiles/ms/icons/green-dot.png' : 'http://maps.google.com/mapfiles/ms/icons/red-dot.png',
//                                     scaledSize: isCurrentLocation ? new google.maps.Size(50, 50) : new google.maps.Size(40, 40) // Tamanho do ícone
//                                 }
//                             });
//                         });
//                     }
//                 </script>
//             </head>
//             <body onload="initMap()">
//                 <div id="map"></div>
//             </body>
//             </html>
//         `);
//     } catch (erro) {
//         console.error('Erro na List: ', erro);
//         res.status(500).send('Erro ao carregar o mapa');
//     }
// };
