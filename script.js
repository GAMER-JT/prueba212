// Lista de canales disponibles
const availableChannels = [
  {
    id: 1,
    name: "Sony Novelas",
    logo: "https://www.cxtv.com.br/img/Tvs/Logo/webp-m/a3bd552eca6645942a60a053fe61fafb.webp",
    country: "Series",
    genre: "Series",
    currentShow: "Estados Unidos",
    language: "Español",
    streamUrl:
      "https://a89829b8dca2471ab52ea9a57bc28a35.mediatailor.us-east-1.amazonaws.com/v1/master/0fb304b2320b25f067414d481a779b77db81760d/CanelaTV_SonyCanalNovelas/playlist.m3u8",
    isLive: true,
    category: "Series",
    viewCount: 12500,
  },
  {
    id: 2,
    name: "Telemundo Miami",
    logo: "https://www.cxtv.com.br/img/Tvs/Logo/webp-m/70ef4b19ce0f5b973ff48dffd540d3d8.webp",
    country: "Noticias",
    genre: "Noticias",
    currentShow: "Estados Unidos",
    language: "Español",
    streamUrl:
      "https://d2kowtvrzzi7ps.cloudfront.net/manifest/3fec3e5cac39a52b2132f9c66c83dae043dc17d4/prod_default_nbc/5a817dba-a6f1-4dac-9871-91e9e76e1762/2.m3u8",
    isLive: true,
    category: "Noticias",
    viewCount: 18700,
  },
  // Añadir más canales aquí...
]

// Elementos del DOM
const videoElement = document.getElementById("main-video")
const playPauseButton = document.getElementById("play-pause")
const muteButton = document.getElementById("mute-button")
const volumeSlider = document.getElementById("volume-slider")
const progressBar = document.getElementById("progress-bar")
const timeDisplay = document.getElementById("time-display")
const fullscreenButton = document.getElementById("fullscreen-button")
const favoriteButton = document.getElementById("favorite-button")
const infoButton = document.getElementById("info-button")
const loadingSpinner = document.getElementById("loading-spinner")
const mobilePlayOverlay = document.getElementById("mobile-play-overlay")
const categoriesContainer = document.getElementById("categories-container")
const channelsGrid = document.getElementById("channels-grid")
const searchInput = document.getElementById("search-input")
const searchButton = document.getElementById("search-button")
const searchResultsContainer = document.getElementById("search-results-container")
const favoritesContainer = document.getElementById("favorites-container")
const infoModal = document.getElementById("info-modal")
const closeModalButton = document.getElementById("close-modal")
const modalCloseButton = document.getElementById("modal-close-button")
const tabButtons = document.querySelectorAll(".tab-button")
const tabPanes = document.querySelectorAll(".tab-pane")

// Variables de estado
let isPlaying = false
let isMuted = false
let currentChannel = availableChannels[0]
let favorites = []
let currentCategory = "All"

// Cargar favoritos desde localStorage
function loadFavorites() {
  const storedFavorites = localStorage.getItem("favoriteChannels")
  if (storedFavorites) {
    favorites = JSON.parse(storedFavorites)
  }
  updateFavoriteButton()
}

// Guardar favoritos en localStorage
function saveFavorites() {
  localStorage.setItem("favoriteChannels", JSON.stringify(favorites))
}

// Verificar si un canal está en favoritos
function isChannelFavorite(channelId) {
  return favorites.some((fav) => fav.id === channelId)
}

// Actualizar el botón de favoritos
function updateFavoriteButton() {
  if (isChannelFavorite(currentChannel.id)) {
    favoriteButton.innerHTML = '<i class="fas fa-heart"></i>'
    favoriteButton.classList.add("favorite-active")
  } else {
    favoriteButton.innerHTML = '<i class="far fa-heart"></i>'
    favoriteButton.classList.remove("favorite-active")
  }
}

// Alternar favorito
function toggleFavorite(channel) {
  const isFavorite = isChannelFavorite(channel.id)

  if (isFavorite) {
    // Eliminar de favoritos
    favorites = favorites.filter((fav) => fav.id !== channel.id)
  } else {
    // Añadir a favoritos
    favorites.push({ ...channel, addedAt: new Date().toISOString() })
  }

  saveFavorites()

  if (channel.id === currentChannel.id) {
    updateFavoriteButton()
  }

  // Actualizar la visualización de favoritos
  renderFavorites()
}

// Cargar un canal
function loadChannel(channel) {
  currentChannel = channel

  // Actualizar información del canal
  document.getElementById("channel-name").textContent = channel.name
  document.getElementById("channel-category").textContent = channel.category || channel.genre
  document.getElementById("channel-logo").src = channel.logo

  // Mostrar spinner de carga
  loadingSpinner.style.display = "flex"

  // Establecer el poster y la URL del stream
  videoElement.poster = channel.logo
  videoElement.src = channel.streamUrl

  // Cargar el video
  videoElement.load()

  // Actualizar botón de favoritos
  updateFavoriteButton()
}

// Formatear tiempo (segundos a MM:SS)
function formatTime(seconds) {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs < 10 ? "0" : ""}${secs}`
}

// Actualizar la barra de progreso y el tiempo
function updateProgress() {
  if (videoElement.duration) {
    const currentTime = videoElement.currentTime
    const duration = videoElement.duration

    // Actualizar barra de progreso
    progressBar.value = (currentTime / duration) * 100

    // Actualizar display de tiempo
    timeDisplay.textContent = `${formatTime(currentTime)} / ${formatTime(duration)}`
  } else {
    // Para streams en vivo, mostrar solo el tiempo actual
    timeDisplay.textContent = formatTime(videoElement.currentTime)
  }
}

// Cambiar la posición de reproducción
function setProgress() {
  if (videoElement.duration) {
    videoElement.currentTime = (progressBar.value / 100) * videoElement.duration
  }
}

// Alternar reproducción/pausa
function togglePlay() {
  if (videoElement.paused) {
    videoElement
      .play()
      .then(() => {
        isPlaying = true
        playPauseButton.innerHTML = '<i class="fas fa-pause"></i>'
        mobilePlayOverlay.classList.remove("visible")
      })
      .catch((error) => {
        console.error("Error al reproducir:", error)
      })
  } else {
    videoElement.pause()
    isPlaying = false
    playPauseButton.innerHTML = '<i class="fas fa-play"></i>'
    mobilePlayOverlay.classList.add("visible")
  }
}

// Alternar silencio
function toggleMute() {
  videoElement.muted = !videoElement.muted
  isMuted = videoElement.muted

  if (isMuted) {
    muteButton.innerHTML = '<i class="fas fa-volume-mute"></i>'
  } else {
    muteButton.innerHTML = '<i class="fas fa-volume-up"></i>'
  }
}

// Cambiar volumen
function changeVolume() {
  videoElement.volume = volumeSlider.value / 100

  if (videoElement.volume === 0) {
    muteButton.innerHTML = '<i class="fas fa-volume-mute"></i>'
    isMuted = true
    videoElement.muted = true
  } else {
    muteButton.innerHTML = '<i class="fas fa-volume-up"></i>'
    isMuted = false
    videoElement.muted = false
  }
}

// Alternar pantalla completa
function toggleFullscreen() {
  if (!document.fullscreenElement) {
    const videoPlayer = document.getElementById("video-player")
    if (videoPlayer.requestFullscreen) {
      videoPlayer.requestFullscreen()
    } else if (videoPlayer.webkitRequestFullscreen) {
      /* Safari */
      videoPlayer.webkitRequestFullscreen()
    } else if (videoPlayer.msRequestFullscreen) {
      /* IE11 */
      videoPlayer.msRequestFullscreen()
    }
    fullscreenButton.innerHTML = '<i class="fas fa-compress"></i>'
  } else {
    if (document.exitFullscreen) {
      document.exitFullscreen()
    } else if (document.webkitExitFullscreen) {
      /* Safari */
      document.webkitExitFullscreen()
    } else if (document.msExitFullscreen) {
      /* IE11 */
      document.msExitFullscreen()
    }
    fullscreenButton.innerHTML = '<i class="fas fa-expand"></i>'
  }
}

// Mostrar modal de información
function showInfoModal() {
  // Actualizar información en el modal
  document.getElementById("modal-channel-name").textContent = currentChannel.name
  document.getElementById("modal-channel-logo").src = currentChannel.logo
  document.getElementById("modal-channel-category").textContent = currentChannel.category || currentChannel.genre
  document.getElementById("modal-channel-country").textContent = currentChannel.country || "No disponible"
  document.getElementById("modal-channel-language").textContent = currentChannel.language || "No disponible"
  document.getElementById("modal-channel-viewers").textContent = currentChannel.viewCount
    ? currentChannel.viewCount.toLocaleString()
    : "0"

  // Mostrar el modal
  infoModal.style.display = "flex"
}

// Cerrar modal de información
function closeInfoModal() {
  infoModal.style.display = "none"
}

// Obtener categorías únicas
function getUniqueCategories() {
  const categories = new Set()
  categories.add("All") // Añadir "Todos" como primera categoría

  availableChannels.forEach((channel) => {
    if (channel.category) {
      categories.add(channel.category)
    } else if (channel.genre) {
      categories.add(channel.genre)
    }
  })

  return Array.from(categories)
}

// Renderizar categorías
function renderCategories() {
  const categories = getUniqueCategories()
  categoriesContainer.innerHTML = ""

  categories.forEach((category) => {
    const button = document.createElement("button")
    button.className = `category-button ${category === currentCategory ? "active" : ""}`

    // Asignar icono según la categoría
    let icon = "🌐" // Icono por defecto
    if (category === "All") icon = "🌐"
    else if (category === "Noticias") icon = "📰"
    else if (category === "Deportes") icon = "⚽"
    else if (category === "Cine" || category === "Películas") icon = "🎬"
    else if (category === "Música") icon = "🎵"
    else if (category === "Infantil") icon = "👶"
    else if (category === "Documentales" || category === "Documentary") icon = "🔍"
    else if (category === "Series") icon = "📺"

    button.innerHTML = `<span>${icon}</span> ${category}`

    button.addEventListener("click", () => {
      currentCategory = category

      // Actualizar botones de categoría
      document.querySelectorAll(".category-button").forEach((btn) => {
        btn.classList.remove("active")
      })
      button.classList.add("active")

      // Renderizar canales filtrados
      renderChannels()
    })

    categoriesContainer.appendChild(button)
  })
}

// Filtrar canales por categoría
function filterChannelsByCategory(category) {
  if (category === "All") {
    return availableChannels
  }

  return availableChannels.filter((channel) => channel.category === category || channel.genre === category)
}

// Agrupar canales en filas de 10
function groupChannelsInRows(channels) {
  const rows = []
  for (let i = 0; i < channels.length; i += 10) {
    rows.push(channels.slice(i, i + 10))
  }
  return rows
}

// Renderizar canales
function renderChannels() {
  const filteredChannels = filterChannelsByCategory(currentCategory)
  const channelRows = groupChannelsInRows(filteredChannels)

  channelsGrid.innerHTML = ""

  channelRows.forEach((row, rowIndex) => {
    const rowElement = document.createElement("div")
    rowElement.className = "channel-row"

    const rowContent = document.createElement("div")
    rowContent.className = "channel-row-content"

    row.forEach((channel) => {
      const channelCard = createChannelCard(channel)
      rowContent.appendChild(channelCard)
    })

    rowElement.appendChild(rowContent)
    channelsGrid.appendChild(rowElement)
  })
}

// Crear tarjeta de canal
function createChannelCard(channel) {
  const card = document.createElement("div")
  card.className = "channel-card"
  card.onclick = () => loadChannel(channel)

  const thumbnail = document.createElement("div")
  thumbnail.className = "channel-thumbnail"

  const img = document.createElement("img")
  img.src =
    channel.logo ||
    channel.thumbnail ||
    `/placeholder.svg?height=100&width=180&text=${encodeURIComponent(channel.name)}`
  img.alt = channel.name
  thumbnail.appendChild(img)

  if (channel.isLive) {
    const liveBadge = document.createElement("div")
    liveBadge.className = "live-badge"
    liveBadge.textContent = "EN VIVO"
    thumbnail.appendChild(liveBadge)
  }

  const favoriteBtn = document.createElement("button")
  favoriteBtn.className = `favorite-button ${isChannelFavorite(channel.id) ? "active" : ""}`
  favoriteBtn.innerHTML = isChannelFavorite(channel.id)
    ? '<i class="fas fa-heart"></i>'
    : '<i class="far fa-heart"></i>'

  favoriteBtn.onclick = (e) => {
    e.stopPropagation()
    toggleFavorite(channel)
    favoriteBtn.classList.toggle("active")
    favoriteBtn.innerHTML = isChannelFavorite(channel.id)
      ? '<i class="fas fa-heart"></i>'
      : '<i class="far fa-heart"></i>'
  }

  thumbnail.appendChild(favoriteBtn)
  card.appendChild(thumbnail)

  const details = document.createElement("div")
  details.className = "channel-details"

  const title = document.createElement("h3")
  title.textContent = channel.name
  details.appendChild(title)

  const category = document.createElement("p")
  category.textContent = channel.category || channel.genre
  details.appendChild(category)

  const viewers = document.createElement("p")
  viewers.textContent = `${channel.viewCount ? channel.viewCount.toLocaleString() : "0"} espectadores`
  details.appendChild(viewers)

  card.appendChild(details)

  return card
}

// Buscar canales
function searchChannels(query) {
  if (!query.trim()) return []

  const searchTerms = query.toLowerCase().split(" ")

  return availableChannels.filter((channel) => {
    const searchableText = [
      channel.name,
      channel.category,
      channel.genre,
      channel.country,
      channel.language,
      channel.currentShow,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase()

    return searchTerms.some((term) => searchableText.includes(term))
  })
}

// Renderizar resultados de búsqueda
function renderSearchResults(query) {
  const results = searchChannels(query)
  const resultRows = groupChannelsInRows(results)

  searchResultsContainer.innerHTML = ""

  if (query.trim() === "") {
    // Mostrar placeholder de búsqueda
    const placeholder = document.createElement("div")
    placeholder.className = "search-placeholder"
    placeholder.innerHTML = `
            <i class="fas fa-search search-icon"></i>
            <h3>Busca tus canales favoritos</h3>
            <p>Escribe el nombre de un canal o programa para comenzar</p>
        `
    searchResultsContainer.appendChild(placeholder)
    return
  }

  if (results.length === 0) {
    // Mostrar mensaje de no resultados
    const noResults = document.createElement("div")
    noResults.className = "search-placeholder"
    noResults.innerHTML = `
            <i class="fas fa-search search-icon"></i>
            <h3>No se encontraron resultados para "${query}"</h3>
            <p>Intenta buscar con otras palabras clave</p>
        `
    searchResultsContainer.appendChild(noResults)
    return
  }

  // Mostrar resultados
  const resultsHeader = document.createElement("p")
  resultsHeader.className = "results-header"
  resultsHeader.textContent = `${results.length} resultados para "${query}"`
  searchResultsContainer.appendChild(resultsHeader)

  resultRows.forEach((row, rowIndex) => {
    const rowElement = document.createElement("div")
    rowElement.className = "channel-row"

    const rowContent = document.createElement("div")
    rowContent.className = "channel-row-content"

    row.forEach((channel) => {
      const channelCard = createChannelCard(channel)
      rowContent.appendChild(channelCard)
    })

    rowElement.appendChild(rowContent)
    searchResultsContainer.appendChild(rowElement)
  })
}

// Renderizar favoritos
function renderFavorites() {
  favoritesContainer.innerHTML = ""

  if (favorites.length === 0) {
    // Mostrar placeholder de favoritos vacíos
    const placeholder = document.createElement("div")
    placeholder.className = "favorites-empty"
    placeholder.innerHTML = `
            <i class="far fa-heart favorites-icon"></i>
            <h3>No tienes favoritos aún</h3>
            <p>Agrega canales a tus favoritos para verlos aquí</p>
        `
    favoritesContainer.appendChild(placeholder)
    return
  }

  // Obtener canales favoritos completos
  const favoriteChannels = favorites.map((fav) => {
    // Buscar el canal en availableChannels
    const channel = availableChannels.find((c) => c.id === fav.id)
    // Si no se encuentra, usar el objeto favorito directamente
    return channel || fav
  })

  const favoriteRows = groupChannelsInRows(favoriteChannels)

  favoriteRows.forEach((row, rowIndex) => {
    const rowElement = document.createElement("div")
    rowElement.className = "channel-row"

    const rowContent = document.createElement("div")
    rowContent.className = "channel-row-content"

    row.forEach((channel) => {
      const channelCard = createChannelCard(channel)
      rowContent.appendChild(channelCard)
    })

    rowElement.appendChild(rowContent)
    favoritesContainer.appendChild(rowElement)
  })
}

// Cambiar pestaña
function changeTab(tabId) {
  // Actualizar botones de pestaña
  tabButtons.forEach((button) => {
    if (button.dataset.tab === tabId) {
      button.classList.add("active")
    } else {
      button.classList.remove("active")
    }
  })

  // Actualizar contenido de pestaña
  tabPanes.forEach((pane) => {
    if (pane.id === tabId) {
      pane.classList.add("active")
    } else {
      pane.classList.remove("active")
    }
  })
}

// Event Listeners
videoElement.addEventListener("loadeddata", () => {
  loadingSpinner.style.display = "none"
})

videoElement.addEventListener("waiting", () => {
  loadingSpinner.style.display = "flex"
})

videoElement.addEventListener("playing", () => {
  loadingSpinner.style.display = "none"
  isPlaying = true
  playPauseButton.innerHTML = '<i class="fas fa-pause"></i>'
  mobilePlayOverlay.classList.remove("visible")
})

videoElement.addEventListener("pause", () => {
  isPlaying = false
  playPauseButton.innerHTML = '<i class="fas fa-play"></i>'
  mobilePlayOverlay.classList.add("visible")
})

videoElement.addEventListener("timeupdate", updateProgress)

videoElement.addEventListener("error", () => {
  loadingSpinner.style.display = "none"
  alert("Error al cargar el video. Por favor, intente con otro canal.")
})

playPauseButton.addEventListener("click", togglePlay)
muteButton.addEventListener("click", toggleMute)
volumeSlider.addEventListener("input", changeVolume)
progressBar.addEventListener("input", setProgress)
fullscreenButton.addEventListener("click", toggleFullscreen)
favoriteButton.addEventListener("click", () => toggleFavorite(currentChannel))
infoButton.addEventListener("click", showInfoModal)
closeModalButton.addEventListener("click", closeInfoModal)
modalCloseButton.addEventListener("click", closeInfoModal)
mobilePlayOverlay.addEventListener("click", togglePlay)

// Búsqueda
searchButton.addEventListener("click", (e) => {
  e.preventDefault()
  changeTab("search-results")
  renderSearchResults(searchInput.value)
})

searchInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    e.preventDefault()
    changeTab("search-results")
    renderSearchResults(searchInput.value)
  }
})

// Cambio de pestañas
tabButtons.forEach((button) => {
  button.addEventListener("click", () => {
    changeTab(button.dataset.tab)
  })
})

// Inicialización
document.addEventListener("DOMContentLoaded", () => {
  loadFavorites()
  renderCategories()
  renderChannels()
  renderFavorites()
  loadChannel(availableChannels[0])

  // Detectar si es móvil
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
  if (isMobile) {
    mobilePlayOverlay.classList.add("visible")
  }
})

// Evento para cambios de pantalla completa
document.addEventListener("fullscreenchange", () => {
  if (document.fullscreenElement) {
    fullscreenButton.innerHTML = '<i class="fas fa-compress"></i>'
  } else {
    fullscreenButton.innerHTML = '<i class="fas fa-expand"></i>'
  }
})

