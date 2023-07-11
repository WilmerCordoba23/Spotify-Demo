const clientId = 'TU_CLIENT_ID';
const clientSecret = 'TU_CLIENT_SECRET';
const redirectUri = 'http://127.0.0.1:5500/index.html';

// Obtener token de acceso
async function getAccessToken() {
    const response = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            Authorization: 'Basic ' + btoa(clientId + ':' + clientSecret),
        },
        body: 'grant_type=client_credentials',
    });

    const data = await response.json();
    return data.access_token;
}

// Realizar búsqueda de canciones
async function searchSongs(searchTerm) {
    const accessToken = await getAccessToken();

    const response = await fetch(
        `https://api.spotify.com/v1/search?q=${encodeURIComponent(searchTerm)}&type=track`,
        {
            headers: {
                Authorization: 'Bearer ' + accessToken,
            },
        }
    );
    const data = await response.json();
    return data.tracks.items;
}

// Mostrar resultados de búsqueda
function displaySearchResults(results) {
    const searchResults = document.getElementById('search-results');
    searchResults.innerHTML = '';
    results.forEach((result) => {
        const item = document.createElement('li');
        item.textContent = result.name;
        item.addEventListener('click', () => {
            displaySongDetails(result);
        });

        searchResults.appendChild(item);
    });
}

const spotifyButton = document.getElementById('spotify-button');
spotifyButton.style.display = 'none';

// Mostrar detalles de una canción
function displaySongDetails(song) {

    const coverImage = document.getElementById('cover-image');
    const songName = document.getElementById('song-name');
    const artistName = document.getElementById('artist-name');
    const albumName = document.getElementById('album-name');
    const albumTime = document.getElementById('album-time');

    const songData = {
        coverImageURL: song.album.images[0].url,
        name: song.name,
        artist: song.artists[0].name,
        album: song.album.name,
        albumTime: msToMinutesAndSeconds(song.duration_ms),
        preview_url: song.preview_url,
        external_urls: song.external_urls.spotify
    };

    redirectToSpotify(songData.external_urls)
    playPreview(songData.preview_url)
    coverImage.alt = songData.name;
    coverImage.src = songData.coverImageURL;
    songName.textContent = songData.name;
    artistName.textContent = songData.artist;
    albumName.textContent = songData.album;
    albumTime.textContent = songData.albumTime;
    spotifyButton.style.display = 'block';
}

// Convertir milisegundos a minutos y segundos
function msToMinutesAndSeconds(ms) {
    const minutes = Math.floor(ms / 60000);
    const seconds = ((ms % 60000) / 1000).toFixed(0);
    return minutes + ':' + (seconds < 10 ? '0' : '') + seconds;
}

// Manejar la búsqueda
const searchForm = document.getElementById('search-form');
const searchInput = document.getElementById('search-input');

searchForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const searchTerm = searchInput.value;
    const searchResults = await searchSongs(searchTerm);
    displaySearchResults(searchResults);
});

const audioPlayer = document.getElementById('audio-player');

function playPreview(url) {
    // Establece la URL de la vista previa en el reproductor de audio
    audioPlayer.src = url;

    // Reproduce la canción
    audioPlayer.play();
}

// Función para detener la reproducción
function stopPlayback() {
    audioPlayer.pause();
    audioPlayer.currentTime = 0;
}

let spotifyLink;

function redirectToSpotify(link) {
    spotifyLink = link;
}

spotifyButton.addEventListener('click', (event) => {
    window.location.href = spotifyLink;
});

const overlay = document.getElementById('overlay');

overlay.addEventListener('click', (event) => {
    stopPlayback()
});