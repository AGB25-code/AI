/* ===========================
   AMBIENTE INTERIORES - AI
   Main JavaScript
   =========================== */

document.addEventListener('DOMContentLoaded', () => {

  // --- Cookie Popup ---
  // Definida primeiro para estar disponível ao ser chamada pelo preloader
  function initCookiePopup() {
    const cookiePopup = document.getElementById('cookiePopup');
    if (!cookiePopup) return;

    const cookieAccept = document.getElementById('cookieAccept');
    const cookieReject = document.getElementById('cookieReject');

    let hasConsent = false;
    try { hasConsent = !!localStorage.getItem('cookieConsent'); } catch(e) {}

    if (!hasConsent) {
      setTimeout(() => {
        cookiePopup.classList.add('active');
      }, 800);
    }

    const closeCookiePopup = (choice) => {
      try { localStorage.setItem('cookieConsent', choice); } catch(e) {}
      cookiePopup.classList.remove('active');
    };

    if (cookieAccept) cookieAccept.addEventListener('click', () => closeCookiePopup('accepted'));
    if (cookieReject) cookieReject.addEventListener('click', () => closeCookiePopup('rejected'));
  }

  // --- Preloader ---
  const preloader = document.getElementById('preloader');
  const preloaderVideo = document.getElementById('preloaderVideo');
  const preloaderBar = document.getElementById('preloaderBar');
  const preloaderSkip = document.getElementById('preloaderSkip');

  if (preloader && preloaderVideo) {
    // Só mostrar o preloader uma vez por sessão
    if (sessionStorage.getItem('preloaderShown')) {
      preloader.remove();
      initCookiePopup();
    } else {
      document.body.style.overflow = 'hidden';

      let dismissed = false;
      const dismiss = () => {
        if (dismissed) return;
        dismissed = true;
        sessionStorage.setItem('preloaderShown', '1');
        preloader.classList.add('fade-out');
        document.body.style.overflow = '';
        setTimeout(() => {
          preloader.remove();
          initCookiePopup();
        }, 700);
      };

      // Fallback: se o vídeo não arrancar em 45s, dispensar automaticamente
      const fallbackTimer = setTimeout(dismiss, 45000);

      preloaderVideo.addEventListener('timeupdate', () => {
        if (preloaderVideo.duration) {
          preloaderBar.style.width = (preloaderVideo.currentTime / preloaderVideo.duration * 100) + '%';
        }
      });

      preloaderVideo.addEventListener('ended', () => {
        clearTimeout(fallbackTimer);
        dismiss();
      });

      preloaderVideo.addEventListener('error', () => {
        clearTimeout(fallbackTimer);
        dismiss();
      });

      if (preloaderSkip) preloaderSkip.addEventListener('click', () => {
        clearTimeout(fallbackTimer);
        dismiss();
      });
    }
  } else {
    initCookiePopup();
  }

  // --- Hero video mobile autoplay fallback ---
  var heroVideo = document.querySelector('.hero__video');
  if (heroVideo) {
    var playPromise = heroVideo.play();
    if (playPromise !== undefined) {
      playPromise.catch(function() {
        // Autoplay blocked — show fallback image
        heroVideo.style.display = 'none';
        var fallback = document.querySelector('.hero__bg--fallback');
        if (fallback) fallback.style.zIndex = '0';
      });
    }
  }

  // --- Header scroll effect ---
  const header = document.getElementById('header');

  if (header && !header.classList.contains('scrolled')) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 60) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    });
  }

  // --- Scroll indicator hide on scroll ---
  const scrollIndicator = document.getElementById('scrollIndicator');
  if (scrollIndicator) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 80) {
        scrollIndicator.classList.add('hidden');
      } else {
        scrollIndicator.classList.remove('hidden');
      }
    }, { passive: true });
  }

  // --- Mobile hamburger menu ---
  const hamburger = document.getElementById('hamburger');
  const mobileNav = document.getElementById('mobileNav');

  if (hamburger && mobileNav) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('active');
      mobileNav.classList.toggle('open');
    });

    // Close on link click
    mobileNav.querySelectorAll('.nav__link').forEach(link => {
      link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        mobileNav.classList.remove('open');
      });
    });
  }

  // --- Scroll animations (Intersection Observer) ---
  const animatedElements = document.querySelectorAll('.fade-in, .fade-in-left, .fade-in-right');

  if (animatedElements.length > 0) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.15,
      rootMargin: '0px 0px -50px 0px'
    });

    animatedElements.forEach(el => observer.observe(el));
  }

  // --- Portfolio Lightbox Slider ---
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightboxImg');
  const lightboxClose = document.getElementById('lightboxClose');
  const lightboxPrev = document.getElementById('lightboxPrev');
  const lightboxNext = document.getElementById('lightboxNext');
  const lightboxCounter = document.getElementById('lightboxCounter');

  if (lightbox) {
    let galleryImages = [];
    let currentIndex = 0;

    function collectVisibleImages() {
      galleryImages = [];
      document.querySelectorAll('.portfolio__item:not(.hidden), .pro-showcase__item').forEach(function(item) {
        // Only collect from visible sections
        var section = item.closest('.portfolio__section, .pro-showcase');
        if (section && section.classList.contains('hidden')) return;
        var img = item.querySelector('img');
        if (img) galleryImages.push({ src: img.src, alt: img.alt });
      });
    }

    function showImage(index) {
      if (index < 0) index = galleryImages.length - 1;
      if (index >= galleryImages.length) index = 0;
      currentIndex = index;
      lightboxImg.style.opacity = '0';
      setTimeout(function() {
        lightboxImg.src = galleryImages[currentIndex].src;
        lightboxImg.alt = galleryImages[currentIndex].alt;
        lightboxImg.style.opacity = '1';
      }, 150);
      if (lightboxCounter) {
        lightboxCounter.textContent = (currentIndex + 1) + ' / ' + galleryImages.length;
      }
    }

    function openLightbox(imgSrc) {
      collectVisibleImages();
      currentIndex = galleryImages.findIndex(function(g) { return g.src === imgSrc; });
      if (currentIndex === -1) currentIndex = 0;
      showImage(currentIndex);
      lightbox.classList.add('active');
      document.body.style.overflow = 'hidden';
    }

    // Click on portfolio items
    document.querySelectorAll('.portfolio__item, .pro-showcase__item').forEach(function(item) {
      item.addEventListener('click', function() {
        var img = item.querySelector('img');
        if (img) openLightbox(img.src);
      });
    });

    var closeLightbox = function() {
      lightbox.classList.remove('active');
      document.body.style.overflow = '';
    };

    if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
    if (lightboxPrev) lightboxPrev.addEventListener('click', function(e) { e.stopPropagation(); showImage(currentIndex - 1); });
    if (lightboxNext) lightboxNext.addEventListener('click', function(e) { e.stopPropagation(); showImage(currentIndex + 1); });

    lightbox.addEventListener('click', function(e) {
      if (e.target === lightbox) closeLightbox();
    });

    // Keyboard navigation
    document.addEventListener('keydown', function(e) {
      if (!lightbox.classList.contains('active')) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') showImage(currentIndex - 1);
      if (e.key === 'ArrowRight') showImage(currentIndex + 1);
    });

    // Touch swipe
    var touchStartX = 0;
    var touchEndX = 0;

    lightbox.addEventListener('touchstart', function(e) {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    lightbox.addEventListener('touchend', function(e) {
      touchEndX = e.changedTouches[0].screenX;
      var diff = touchStartX - touchEndX;
      if (Math.abs(diff) > 50) {
        if (diff > 0) showImage(currentIndex + 1);
        else showImage(currentIndex - 1);
      }
    }, { passive: true });
  }

  // --- Before & After Sliders ---
  document.querySelectorAll('.beforeafter__slider').forEach(function(slider) {
    var beforeImg = slider.querySelector('.beforeafter__img--before');
    var handle = slider.querySelector('.beforeafter__handle');
    var isDragging = false;

    function updatePosition(x) {
      var rect = slider.getBoundingClientRect();
      var pos = (x - rect.left) / rect.width;
      pos = Math.max(0.05, Math.min(0.95, pos));
      var pct = pos * 100;
      beforeImg.style.clipPath = 'inset(0 ' + (100 - pct) + '% 0 0)';
      handle.style.left = pct + '%';
    }

    slider.addEventListener('mousedown', function(e) {
      e.preventDefault();
      isDragging = true;
      updatePosition(e.clientX);
    });

    window.addEventListener('mousemove', function(e) {
      if (!isDragging) return;
      updatePosition(e.clientX);
    });

    window.addEventListener('mouseup', function() {
      isDragging = false;
    });

    slider.addEventListener('touchstart', function(e) {
      isDragging = true;
      updatePosition(e.touches[0].clientX);
    }, { passive: true });

    slider.addEventListener('touchmove', function(e) {
      if (!isDragging) return;
      updatePosition(e.touches[0].clientX);
    }, { passive: true });

    slider.addEventListener('touchend', function() {
      isDragging = false;
    });
  });

  // --- FAQ Accordion ---
  const faqItems = document.querySelectorAll('.faq__item');
  if (faqItems.length > 0) {
    faqItems.forEach(item => {
      const question = item.querySelector('.faq__question');
      if (question) {
        question.addEventListener('click', () => {
          const isActive = item.classList.contains('active');
          // Close all other items
          faqItems.forEach(other => other.classList.remove('active'));
          // Toggle current
          if (!isActive) {
            item.classList.add('active');
          }
        });
      }
    });
  }

  // --- Contact form (basic) ---
  const contactForm = document.getElementById('contactForm');

  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const btn = contactForm.querySelector('.contactos__submit');
      const originalText = btn.textContent;
      btn.textContent = 'Mensagem Enviada!';
      btn.style.background = '#4a7c59';
      btn.style.color = '#fff';

      setTimeout(() => {
        btn.textContent = originalText;
        btn.style.background = '';
        btn.style.color = '';
        contactForm.reset();
      }, 3000);
    });
  }

});
