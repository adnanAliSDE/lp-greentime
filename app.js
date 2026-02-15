const buttons = document.querySelectorAll('[data-os]')
const hint = document.getElementById('os-hint')

const GITHUB_REPO = 'adnanAliSDE/lp-greentime'
const WINDOWS_ASSET_MATCH = /setup\.exe$/i

const getOS = () => {
  const userAgent = navigator.userAgent.toLowerCase()
  if (userAgent.includes('windows')) return 'windows'
  if (userAgent.includes('mac')) return 'mac'
  if (userAgent.includes('linux')) return 'linux'
  return 'unknown'
}

const os = getOS()
const highlight = Array.from(buttons).find((button) => button.dataset.os === os)

if (highlight) {
  highlight.classList.add('highlight')
  if (hint) {
    hint.textContent = `We matched your device: ${highlight.textContent}.`
  }
}

const updateWindowsDownload = async () => {
  const windowsButtons = Array.from(buttons).filter((button) => button.dataset.os === 'windows')
  if (!windowsButtons.length) return

  try {
    const response = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/releases/latest`, {
      headers: { Accept: 'application/vnd.github+json' }
    })

    if (!response.ok) throw new Error('Failed to fetch latest release')

    const release = await response.json()
    const asset = (release.assets || []).find((item) => WINDOWS_ASSET_MATCH.test(item.name))

    if (asset?.browser_download_url) {
      windowsButtons.forEach((button) => {
        button.dataset.url = asset.browser_download_url
        button.dataset.version = release.tag_name || ''

        const versionBadge = button.querySelector('[data-version]')
        if (versionBadge && release.tag_name) {
          versionBadge.textContent = release.tag_name
          versionBadge.classList.add('is-visible')
        }
      })
      if (hint && os === 'windows' && release.tag_name) {
        hint.textContent = `Latest Windows build: ${release.tag_name}.`
      }
    }
  } catch (error) {
    console.warn('Unable to resolve latest Windows download:', error)
  }
}

updateWindowsDownload()

buttons.forEach((button) => {
  button.addEventListener('click', () => {
    const url = button.dataset.url
    const os = button.dataset.os
    
    if (!url || url.startsWith('tesDownload')) {
      showComingSoonModal(os)
      return
    }
    window.location.href = url
  })
})

// Coming Soon Modal
const modal = document.getElementById('comingSoonModal')
const modalClose = document.querySelector('.modal-close')
const modalPlatform = document.getElementById('modal-platform')

const showComingSoonModal = (os) => {
  const platformNames = {
    mac: 'macOS',
    linux: 'Linux',
    windows: 'Windows'
  }
  
  modalPlatform.textContent = platformNames[os] || 'This'
  modal.classList.add('is-open')
  modal.setAttribute('aria-hidden', 'false')
  document.body.style.overflow = 'hidden'
}

const closeModal = () => {
  modal.classList.remove('is-open')
  modal.setAttribute('aria-hidden', 'true')
  document.body.style.overflow = ''
}

modalClose?.addEventListener('click', closeModal)

modal?.addEventListener('click', (e) => {
  if (e.target === modal) closeModal()
})

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && modal.classList.contains('is-open')) {
    closeModal()
  }
})

const carousel = document.querySelector('.carousel')
const track = document.querySelector('.carousel-track')
const slides = document.querySelectorAll('.carousel-slide')
const prevButton = document.querySelector('.carousel-btn.prev')
const nextButton = document.querySelector('.carousel-btn.next')
const dots = document.querySelectorAll('.carousel-dot')

if (carousel && track && slides.length) {
  let currentIndex = 0
  let startX = 0
  let isPointerDown = false

  const updateCarousel = () => {
    track.style.transform = `translateX(-${currentIndex * 100}%)`
    dots.forEach((dot, index) => {
      dot.classList.toggle('is-active', index === currentIndex)
      dot.setAttribute('aria-current', index === currentIndex ? 'true' : 'false')
    })
  }

  const goToSlide = (index) => {
    const lastIndex = slides.length - 1
    if (index < 0) currentIndex = lastIndex
    else if (index > lastIndex) currentIndex = 0
    else currentIndex = index
    updateCarousel()
  }

  prevButton?.addEventListener('click', () => goToSlide(currentIndex - 1))
  nextButton?.addEventListener('click', () => goToSlide(currentIndex + 1))
  dots.forEach((dot) => {
    dot.addEventListener('click', () => {
      const target = Number.parseInt(dot.dataset.slide, 10)
      if (!Number.isNaN(target)) goToSlide(target)
    })
  })

  carousel.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowLeft') {
      event.preventDefault()
      goToSlide(currentIndex - 1)
    }
    if (event.key === 'ArrowRight') {
      event.preventDefault()
      goToSlide(currentIndex + 1)
    }
  })

  carousel.addEventListener('pointerdown', (event) => {
    if (event.pointerType === 'mouse' && event.button !== 0) return
    isPointerDown = true
    startX = event.clientX
  })

  carousel.addEventListener('pointerup', (event) => {
    if (!isPointerDown) return
    const deltaX = event.clientX - startX
    const threshold = 40
    if (deltaX > threshold) goToSlide(currentIndex - 1)
    if (deltaX < -threshold) goToSlide(currentIndex + 1)
    isPointerDown = false
  })

  carousel.addEventListener('pointerleave', () => {
    isPointerDown = false
  })

  updateCarousel()
}
