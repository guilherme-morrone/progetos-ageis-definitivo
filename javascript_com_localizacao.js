let map, directionsService, directionsRenderer;
let userMarker, busMarker1, busMarker2;

function initMap() {
    map = new google.maps.Map(document.getElementById("map"), {
        center: { lat: -22.2336, lng: -49.9342 },
        zoom: 13
    });

    directionsService = new google.maps.DirectionsService();
    directionsRenderer = new google.maps.DirectionsRenderer();
    directionsRenderer.setMap(map);

    // Solicitar a localização do usuário
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            function(position) {
                const usuarioCoords = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };
                atualizarMarcador(usuarioCoords); // Atualiza o marcador do usuário
            },
            function(error) {
                console.error("Erro ao obter a localização: ", error);
                alert("Não foi possível obter sua localização.");
            }
        );
    } else {
        console.error("Geolocalização não é suportada por este navegador.");
        alert("Geolocalização não é suportada por este navegador.");
    }
}

function obterRotas() {
    const usuarioCoords = userMarker.getPosition().toJSON();

    const rotaSelecionada = document.getElementById("rota").value;

    const rotas = {
        1: {
            origin: { lat: -22.218206235468088, lng: -49.951022095347625 },
            destination: { lat: -22.23352382272178, lng: -49.934065681044636 },
            busLocation: { lat: -22.22764533133667, lng: -49.94609013950738 }
        },
        2: {
            origin: { lat: -22.218206235468088, lng: -49.951022095347625 },
            destination: { lat: -22.236532801180672, lng: -49.96658792484941 },
            busLocation: { lat: -22.22802306983871, lng: -49.96464743357532 }
        }
    };

    atualizarMarcador(usuarioCoords);
    const rota = rotas[rotaSelecionada];
    calcularRota(rota.origin, rota.destination);
    atualizarMarcadorOnibus(rota.busLocation, rotaSelecionada);
    calcularDistanciaETempo(rota.busLocation, usuarioCoords);
}

function calcularRota(origin, destination) {
    const request = {
        origin: origin,
        destination: destination,
        travelMode: 'DRIVING'
    };

    directionsService.route(request, (result, status) => {
        if (status === 'OK') {
            directionsRenderer.setDirections(result);
            const distanciaKm = (result.routes[0].legs[0].distance.value / 1000).toFixed(2);
            document.getElementById('distancia-trajeto').innerText = `Distância da rota: ${distanciaKm} km`;
        } else {
            console.error('Erro ao obter a rota:', status);
        }
    });
}

function atualizarMarcador(usuarioCoords) {
    const userImage = '../static/images/user.png'; // Ícone do usuário

    if (userMarker) userMarker.setMap(null);

    userMarker = new google.maps.Marker({
        position: usuarioCoords,
        map: map,
        icon: {
            url: userImage,
            scaledSize: new google.maps.Size(35, 35)
        }
    });
}

function atualizarMarcadorOnibus(busCoords, rotaSelecionada) {
    const busImage = '../static/images/front-of-bus.png';

    if (busMarker1) busMarker1.setMap(null);
    if (busMarker2) busMarker2.setMap(null);

    const busMarker = new google.maps.Marker({
        position: busCoords,
        map: map,
        icon: {
            url: busImage,
            scaledSize: new google.maps.Size(35, 35)
        }
    });

    if (rotaSelecionada == 1) {
        busMarker1 = busMarker;
    } else if (rotaSelecionada == 2) {
        busMarker2 = busMarker;
    }
}

function calcularDistanciaETempo(busCoords, usuarioCoords) {
    const distanceService = new google.maps.DistanceMatrixService();

    const request = {
        origins: [busCoords],
        destinations: [usuarioCoords],
        travelMode: 'DRIVING',
        drivingOptions: {
            departureTime: new Date(Date.now())
        }
    };

    distanceService.getDistanceMatrix(request, (response, status) => {
        if (status === 'OK') {
            const distanciaKm = (response.rows[0].elements[0].distance.value / 1000).toFixed(2);
            const tempoSegundos = response.rows[0].elements[0].duration.value;
            const tempoMinutos = Math.floor(tempoSegundos / 60);
            const segundosRestantes = Math.round(tempoSegundos % 60);
            
            document.getElementById('distancia-onibus-usuario').innerText = `Distância até o usuário: ${distanciaKm} km`;
            document.getElementById('tempo-onibus-usuario').innerText = `Tempo estimado: ${tempoMinutos} minutos e ${segundosRestantes} segundos`;
        } else {
            console.error('Erro ao calcular a distância e tempo:', status);
        }
    });
}

function exibirSaudacao() {
    const agora = new Date();
    const hora = agora.getHours();
    let saudacao;

    if (hora < 12) {
        saudacao = "Bom dia!";
    } else if (hora < 18) {
        saudacao = "Boa tarde!";
    } else {
        saudacao = "Boa noite!";
    }

    const saudacaoElement = document.getElementById('saudacao');
    saudacaoElement.innerText = saudacao;
}

window.onload = function() {
    initMap();
    exibirSaudacao();
};
