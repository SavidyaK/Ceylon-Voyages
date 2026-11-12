/**
 * Ceylon Voyages - Main JavaScript
 * G.C.E. A/L ICT Web Project
 * Clean, accessible, vanilla JavaScript
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Current Year in Footer
  const yearSpans = document.querySelectorAll('.current-year');
  const thisYear = new Date().getFullYear();
  yearSpans.forEach(span => {
    span.textContent = thisYear;
  });

  // 2. Mobile Menu Toggle
  const mobileToggle = document.querySelector('.mobile-toggle');
  const mainNav = document.querySelector('.main-nav');

  if (mobileToggle && mainNav) {
    mobileToggle.addEventListener('click', () => {
      const isExpanded = mobileToggle.getAttribute('aria-expanded') === 'true';
      mobileToggle.classList.toggle('active');
      mainNav.classList.toggle('active');
      mobileToggle.setAttribute('aria-expanded', !isExpanded);
    });

    // Close when clicking a nav link
    const navLinks = mainNav.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        mobileToggle.classList.remove('active');
        mainNav.classList.remove('active');
        mobileToggle.setAttribute('aria-expanded', 'false');
      });
    });

    // Close when clicking outside
    document.addEventListener('click', (e) => {
      if (!mainNav.contains(e.target) && !mobileToggle.contains(e.target) && mainNav.classList.contains('active')) {
        mobileToggle.classList.remove('active');
        mainNav.classList.remove('active');
        mobileToggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  // 3. Currency Converter (USD, EUR, GBP, AUD, LKR)
  const currencySelect = document.getElementById('currencySelect');
  if (currencySelect) {
    // Exchange rates relative to 1 USD
    const rates = {
      USD: { rate: 1.0, symbol: '$', prefix: true },
      EUR: { rate: 0.92, symbol: '€', prefix: true },
      GBP: { rate: 0.79, symbol: '£', prefix: true },
      AUD: { rate: 1.52, symbol: 'A$', prefix: true },
      LKR: { rate: 310.0, symbol: 'Rs. ', prefix: true }
    };

    currencySelect.addEventListener('change', () => {
      const selectedCurrency = currencySelect.value;
      const currencyData = rates[selectedCurrency] || rates.USD;

      // Update package row cards
      const packageRows = document.querySelectorAll('.package-row-card');
      packageRows.forEach(row => {
        const basePrice = parseFloat(row.getAttribute('data-base-price'));
        if (!isNaN(basePrice)) {
          const converted = Math.round(basePrice * currencyData.rate);
          const costAmountEl = row.querySelector('.cost-amount');
          if (costAmountEl) {
            costAmountEl.innerHTML = `${currencyData.symbol}${converted.toLocaleString()} <span class="cost-unit">/ person</span>`;
          }
        }
      });

      // Show toast
      showToast(`Currency updated to ${selectedCurrency} (${currencyData.symbol})`);
    });
  }

  // 5. Package Filtering on packages.html
  const filterPills = document.querySelectorAll('.filter-pill');
  const packageCards = document.querySelectorAll('.package-row-card');

  if (filterPills.length > 0 && packageCards.length > 0) {
    const applyFilter = (category) => {
      filterPills.forEach(pill => {
        if (pill.getAttribute('data-filter') === category) {
          pill.classList.add('active');
          pill.setAttribute('aria-selected', 'true');
        } else {
          pill.classList.remove('active');
          pill.setAttribute('aria-selected', 'false');
        }
      });

      packageCards.forEach(card => {
        const cardCategory = card.getAttribute('data-category');
        if (category === 'all' || cardCategory === category) {
          card.style.display = 'grid';
        } else {
          card.style.display = 'none';
        }
      });
    };

    filterPills.forEach(pill => {
      pill.addEventListener('click', () => {
        const category = pill.getAttribute('data-filter');
        applyFilter(category);
      });
    });

    // Check URL parameters for pre-selected category (e.g. packages.html?category=cultural)
    const urlParams = new URLSearchParams(window.location.search);
    const categoryParam = urlParams.get('category');
    if (categoryParam) {
      applyFilter(categoryParam);
    }
  }

  // 6. Quick Booking Modal Functionality
  const bookingModal = document.getElementById('bookingModal');
  const bookNowBtns = document.querySelectorAll('.btn-book-now');
  const modalClose = document.querySelector('.modal-close');
  const modalPackageInput = document.getElementById('modalPackage');

  if (bookingModal) {
    const openModal = (pkgName = '') => {
      if (modalPackageInput && pkgName) {
        modalPackageInput.value = pkgName;
      }
      bookingModal.classList.add('active');
      document.body.style.overflow = 'hidden';
    };

    const closeModal = () => {
      bookingModal.classList.remove('active');
      document.body.style.overflow = '';
    };

    bookNowBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const pkg = btn.getAttribute('data-package') || 'Custom Tour';
        openModal(pkg);
      });
    });

    if (modalClose) {
      modalClose.addEventListener('click', closeModal);
    }

    bookingModal.addEventListener('click', (e) => {
      if (e.target === bookingModal) {
        closeModal();
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && bookingModal.classList.contains('active')) {
        closeModal();
      }
    });

    const modalBookingForm = document.getElementById('modalBookingForm');
    if (modalBookingForm) {
      modalBookingForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('modalName').value.trim();
        const email = document.getElementById('modalEmail').value.trim();

        if (!name || !email) {
          showToast('Please fill in your name and email address.');
          return;
        }

        closeModal();
        showToast(`Thank you, ${name}! Your booking request for "${modalPackageInput.value}" has been received.`);
        modalBookingForm.reset();
      });
    }
  }

  // 7. Contact Form Validation on contact.html
  const contactForm = document.getElementById('mainContactForm');
  if (contactForm) {
    // Check if query parameter pre-selects package (e.g. contact.html?package=kandy-nuwara-eliya)
    const urlParams = new URLSearchParams(window.location.search);
    const pkgParam = urlParams.get('package');
    const pkgSelect = document.getElementById('contactPackage');
    if (pkgParam && pkgSelect) {
      for (let opt of pkgSelect.options) {
        if (opt.value.toLowerCase().includes(pkgParam.toLowerCase())) {
          pkgSelect.value = opt.value;
          break;
        }
      }
    }

    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const nameInput = document.getElementById('contactName');
      const emailInput = document.getElementById('contactEmail');
      const messageInput = document.getElementById('contactMessage');

      let isValid = true;

      // Validate Name
      if (!nameInput.value.trim()) {
        nameInput.classList.add('error');
        isValid = false;
      } else {
        nameInput.classList.remove('error');
      }

      // Validate Email
      const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRe.test(emailInput.value.trim())) {
        emailInput.classList.add('error');
        isValid = false;
      } else {
        emailInput.classList.remove('error');
      }

      // Validate Message
      if (!messageInput.value.trim()) {
        messageInput.classList.add('error');
        isValid = false;
      } else {
        messageInput.classList.remove('error');
      }

      if (isValid) {
        showToast(`Thank you, ${nameInput.value.trim()}! Your travel message has been sent successfully.`);
        contactForm.reset();
      }
    });

    // Remove errors on input
    const inputs = contactForm.querySelectorAll('.form-input');
    inputs.forEach(input => {
      input.addEventListener('input', () => {
        if (input.classList.contains('error')) {
          input.classList.remove('error');
        }
      });
    });
  }

  // 8. FAQ Accordion on contact.html
  const faqTriggers = document.querySelectorAll('.faq-trigger');
  faqTriggers.forEach(btn => {
    btn.addEventListener('click', () => {
      const box = btn.closest('.faq-box');
      const isActive = box.classList.contains('active');

      document.querySelectorAll('.faq-box').forEach(b => {
        b.classList.remove('active');
        b.querySelector('.faq-trigger').setAttribute('aria-expanded', 'false');
      });

      if (!isActive) {
        box.classList.add('active');
        btn.setAttribute('aria-expanded', 'true');
      }
    });
  });

  // Helper: Toast Message
  function showToast(text) {
    let toast = document.querySelector('.toast-msg');
    if (!toast) {
      toast = document.createElement('div');
      toast.className = 'toast-msg';
      toast.innerHTML = `<span>✓</span> <span class="toast-text"></span>`;
      document.body.appendChild(toast);
    }
    toast.querySelector('.toast-text').textContent = text;
    toast.classList.add('show');

    setTimeout(() => {
      toast.classList.remove('show');
    }, 4500);
  }
});
