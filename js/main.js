// Digira Esports - Main JavaScript

// ========================================
// Mobile Menu Toggle
// ========================================
const mobileMenuToggle = document.getElementById("mobileMenuToggle")
const navLinks = document.getElementById("navLinks")

if (mobileMenuToggle) {
  mobileMenuToggle.addEventListener("click", () => {
    navLinks.classList.toggle("active")
    mobileMenuToggle.classList.toggle("active")
  })

  // Close menu when clicking on a link
  const links = navLinks.querySelectorAll(".nav-link")
  links.forEach((link) => {
    link.addEventListener("click", () => {
      navLinks.classList.remove("active")
      mobileMenuToggle.classList.remove("active")
    })
  })
}

// ========================================
// Navbar Scroll Effect
// ========================================
const navbar = document.getElementById("navbar")
let lastScroll = 0

window.addEventListener("scroll", () => {
  const currentScroll = window.pageYOffset

  if (currentScroll <= 0) {
    navbar.style.boxShadow = "none"
  } else {
    navbar.style.boxShadow = "0 2px 10px rgba(0, 0, 0, 0.3)"
  }

  lastScroll = currentScroll
})

// ========================================
// Smooth Scroll for Anchor Links
// ========================================
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", function (e) {
    const href = this.getAttribute("href")
    if (href !== "#" && href !== "") {
      e.preventDefault()
      const target = document.querySelector(href)
      if (target) {
        target.scrollIntoView({
          behavior: "smooth",
          block: "start",
        })
      }
    }
  })
})

// ========================================
// Scroll Reveal Animation
// ========================================
const observerOptions = {
  threshold: 0.1,
  rootMargin: "0px 0px -50px 0px",
}

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = "1"
      entry.target.style.transform = "translateY(0)"
    }
  })
}, observerOptions)

// Observe all elements with fade-in-up class
document.querySelectorAll(".fade-in-up").forEach((el) => {
  el.style.opacity = "0"
  el.style.transform = "translateY(30px)"
  el.style.transition = "opacity 0.6s ease-out, transform 0.6s ease-out"
  observer.observe(el)
})

// ========================================
// Contact Form Handling logic has been moved to contact.html for EmailJS integration


// ========================================
// Set Active Navigation Link
// ========================================
const currentLocation = window.location.pathname
const navItems = document.querySelectorAll(".nav-link")

navItems.forEach((item) => {
  const href = item.getAttribute("href");
  const cleanHref = href.replace(/^\//, ''); // Remove leading slash if any
  
  // Logic for matching current page:
  // 1. If current location contains the href (basic match)
  // 2. Special case for HOME: if href is 'index.html' and we are at root '/' or '/repo/' (ends with '/')
  const isHome = cleanHref === 'index.html';
  const isRoot = currentLocation === '/' || currentLocation.endsWith('/');
  
  if (currentLocation.includes(cleanHref) || (isHome && isRoot)) {
    item.classList.add("active")
  } else {
    item.classList.remove("active")
  }
})

// ========================================
// Custom Cursor - Sporty Gaming Crosshair
// ========================================
const customCursor = document.getElementById('customCursor');
const customCursorDot = document.getElementById('customCursorDot');
let cursorX = 0;
let cursorY = 0;
let dotX = 0;
let dotY = 0;
let trailInterval = null;
let lastTrailTime = 0;

if (customCursor && customCursorDot) {
  // Show custom cursor on desktop
  if (window.matchMedia('(pointer: fine)').matches) {
    customCursor.classList.add('active');
    customCursorDot.classList.add('active');

    // Create cursor trail
    function createTrail(x, y) {
      const now = Date.now();
      if (now - lastTrailTime < 16) return; // Limit to ~60fps
      lastTrailTime = now;

      const trail = document.createElement('div');
      trail.className = 'custom-cursor-trail';
      trail.style.left = x + 'px';
      trail.style.top = y + 'px';
      document.body.appendChild(trail);

      setTimeout(() => {
        trail.remove();
      }, 500);
    }

    document.addEventListener('mousemove', (e) => {
      cursorX = e.clientX;
      cursorY = e.clientY;
      
      // Smooth cursor movement
      requestAnimationFrame(() => {
        customCursor.style.left = cursorX + 'px';
        customCursor.style.top = cursorY + 'px';
      });

      // Smooth dot movement with slight delay for trailing effect
      setTimeout(() => {
        dotX = e.clientX;
        dotY = e.clientY;
        customCursorDot.style.left = dotX + 'px';
        customCursorDot.style.top = dotY + 'px';
      }, 30);

      // Create trail effect
      createTrail(e.clientX, e.clientY);
    });

    // Hover effects
    const hoverElements = document.querySelectorAll('a, button, .btn, .nav-link, input, textarea, .stat-card, .event-card, .benefit-card, .value-card');
    hoverElements.forEach((el) => {
      el.addEventListener('mouseenter', () => {
        customCursor.classList.add('hover');
        customCursorDot.classList.add('hover');
      });
      el.addEventListener('mouseleave', () => {
        customCursor.classList.remove('hover');
        customCursorDot.classList.remove('hover');
      });
    });

    // Click effect with animation
    document.addEventListener('mousedown', () => {
      customCursor.classList.add('click');
      customCursorDot.style.transform = 'translate(-50%, -50%) scale(0.8)';
    });
    document.addEventListener('mouseup', () => {
      customCursor.classList.remove('click');
      customCursorDot.style.transform = 'translate(-50%, -50%) scale(1)';
    });
  }
}

// ========================================
// Hero Section Interactive Effects
// ========================================
const heroSection = document.querySelector('.hero');
const heroContent = document.querySelector('.hero-content');

// Check if device is mobile
const isMobile = window.matchMedia('(max-width: 767px)').matches || 
                 window.matchMedia('(hover: none) and (pointer: coarse)').matches;

if (heroContent && !isMobile) {
  let mouseX = 0;
  let mouseY = 0;
  let currentX = 0;
  let currentY = 0;

  // Mouse move handler for parallax effect (desktop only)
  heroSection.addEventListener('mousemove', (e) => {
    const rect = heroSection.getBoundingClientRect();
    mouseX = (e.clientX - rect.left) / rect.width;
    mouseY = (e.clientY - rect.top) / rect.height;

    // Smooth parallax movement
    currentX += (mouseX - 0.5) * 0.02;
    currentY += (mouseY - 0.5) * 0.02;

    // Apply parallax to hero content
    const moveX = (mouseX - 0.5) * 20;
    const moveY = (mouseY - 0.5) * 20;
    
    heroContent.style.transform = `translate(${moveX}px, ${moveY}px)`;
    
    // Add tilt effect to logo
    const heroLogo = document.querySelector('.hero-logo-animated');
    if (heroLogo) {
      const tiltX = (mouseY - 0.5) * 10;
      const tiltY = (mouseX - 0.5) * -10;
      heroLogo.style.transform = `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg)`;
    }
  });

  // Reset on mouse leave
  heroSection.addEventListener('mouseleave', () => {
    heroContent.style.transform = 'translate(0, 0)';
    const heroLogo = document.querySelector('.hero-logo-animated');
    if (heroLogo) {
      heroLogo.style.transform = 'perspective(1000px) rotateX(0) rotateY(0)';
    }
  });

  // Add ripple effect on click (desktop only)
  heroSection.addEventListener('click', (e) => {
    const ripple = document.createElement('div');
    ripple.className = 'hero-ripple';
    const rect = heroSection.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    ripple.style.left = x + 'px';
    ripple.style.top = y + 'px';
    heroSection.appendChild(ripple);
    
    setTimeout(() => {
      ripple.remove();
    }, 1000);
  });
}

// ========================================
// Animated counter for stats (if on hero page)
// ========================================
function animateValue(element, start, end, duration) {
  let startTimestamp = null;
  const step = (timestamp) => {
    if (!startTimestamp) startTimestamp = timestamp;
    const progress = Math.min((timestamp - startTimestamp) / duration, 1);
    const value = Math.floor(progress * (end - start) + start);
    element.textContent = value + '+';
    if (progress < 1) {
      window.requestAnimationFrame(step);
    }
  };
  window.requestAnimationFrame(step);
}

// ========================================
// Console Welcome Message
// ========================================
console.log("%c🎮 Digira Esports", "color: #1E88D9; font-size: 24px; font-weight: bold;")
console.log("%cFueling Kathmandu's Esports Scene", "color: #5BB7F2; font-size: 14px;")
console.log(
  "%cInterested in joining our team? Contact us at digiraesports@gmail.com",
  "color: #9CA3AF; font-size: 12px;",
)
