/* ── cosmos.js — shared animation engine ── */

// ── CUSTOM CURSOR ──────────────────────────────────────────
(function initCursor() {
  const dot  = document.createElement('div');
  const ring = document.createElement('div');
  dot.className  = 'cursor';
  ring.className = 'cursor-ring';
  document.body.append(dot, ring);

  let mx = -100, my = -100, rx = -100, ry = -100;

  document.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    dot.style.left = mx + 'px';
    dot.style.top  = my + 'px';
  });

  (function animRing() {
    rx += (mx - rx) * 0.14;
    ry += (my - ry) * 0.14;
    ring.style.left = rx + 'px';
    ring.style.top  = ry + 'px';
    requestAnimationFrame(animRing);
  })();

  document.querySelectorAll('a, button, .card').forEach(el => {
    el.addEventListener('mouseenter', () => {
      dot.style.transform  = 'translate(-50%,-50%) scale(2)';
      ring.style.width  = '56px';
      ring.style.height = '56px';
      ring.style.opacity = '0.6';
    });
    el.addEventListener('mouseleave', () => {
      dot.style.transform  = 'translate(-50%,-50%) scale(1)';
      ring.style.width  = '36px';
      ring.style.height = '36px';
      ring.style.opacity = '1';
    });
  });
})();

// ── STAR FIELD CANVAS ─────────────────────────────────────
(function initStars() {
  const canvas = document.getElementById('star-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let W, H, stars = [], shooters = [];

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  function makeStar() {
    return {
      x: Math.random() * W,
      y: Math.random() * H,
      r: Math.random() * 1.4 + 0.2,
      alpha: Math.random(),
      speed: Math.random() * 0.4 + 0.05,
      pulse: Math.random() * Math.PI * 2,
    };
  }

  function makeShooter() {
    return {
      x: Math.random() * W,
      y: Math.random() * H * 0.5,
      len: Math.random() * 180 + 80,
      speed: Math.random() * 14 + 8,
      angle: Math.PI / 5 + Math.random() * 0.3,
      alpha: 1,
      life: 1,
    };
  }

  function init() {
    resize();
    stars = Array.from({ length: 260 }, makeStar);
    setInterval(() => {
      if (Math.random() < 0.35) shooters.push(makeShooter());
    }, 1400);
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    const t = Date.now() * 0.001;

    // stars
    stars.forEach(s => {
      s.pulse += s.speed * 0.04;
      const a = 0.25 + 0.75 * (0.5 + 0.5 * Math.sin(s.pulse));
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(200,220,255,${a})`;
      ctx.fill();
    });

    // shooting stars
    shooters = shooters.filter(s => {
      s.x += Math.cos(s.angle) * s.speed;
      s.y += Math.sin(s.angle) * s.speed;
      s.life -= 0.022;
      s.alpha = s.life;
      if (s.life <= 0) return false;

      const grd = ctx.createLinearGradient(
        s.x, s.y,
        s.x - Math.cos(s.angle) * s.len,
        s.y - Math.sin(s.angle) * s.len
      );
      grd.addColorStop(0, `rgba(0,212,255,${s.alpha})`);
      grd.addColorStop(1, 'rgba(0,212,255,0)');

      ctx.beginPath();
      ctx.moveTo(s.x, s.y);
      ctx.lineTo(s.x - Math.cos(s.angle) * s.len, s.y - Math.sin(s.angle) * s.len);
      ctx.strokeStyle = grd;
      ctx.lineWidth = 1.5;
      ctx.stroke();
      return true;
    });

    requestAnimationFrame(draw);
  }

  window.addEventListener('resize', resize);
  init();
  draw();
})();

// ── HAMBURGER MENU ────────────────────────────────────────
(function initHamburger() {
  const toggle = document.querySelector('.nav-toggle');
  const menu   = document.querySelector('.navbar ul');
  if (!toggle || !menu) return;

  toggle.addEventListener('click', () => {
    const open = menu.classList.toggle('open');
    toggle.classList.toggle('open', open);
    toggle.setAttribute('aria-expanded', open);
  });

  // Close when a link is tapped
  menu.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      menu.classList.remove('open');
      toggle.classList.remove('open');
      toggle.setAttribute('aria-expanded', false);
    });
  });

  // Close on outside tap
  document.addEventListener('click', e => {
    if (!toggle.contains(e.target) && !menu.contains(e.target)) {
      menu.classList.remove('open');
      toggle.classList.remove('open');
      toggle.setAttribute('aria-expanded', false);
    }
  });
})();

// ── NAVBAR SCROLL ─────────────────────────────────────────
(function initNavbar() {
  const nav  = document.querySelector('.navbar');
  const bar  = document.getElementById('progress-bar');
  const links = document.querySelectorAll('.navbar a');
  const page = location.pathname.split('/').pop();

  links.forEach(a => {
    if (a.getAttribute('href') === page) a.classList.add('active');
  });

  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 30);
    if (bar) {
      const pct = window.scrollY / (document.body.scrollHeight - window.innerHeight) * 100;
      bar.style.width = pct + '%';
    }
  });
})();

// ── SCROLL REVEAL ─────────────────────────────────────────
(function initReveal() {
  const obs = new IntersectionObserver(entries => {
    entries.forEach((e, i) => {
      if (e.isIntersecting) {
        e.target.style.transitionDelay = (i * 0.08) + 's';
        e.target.classList.add('visible');
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.12 });

  document.querySelectorAll('section, .card').forEach(el => obs.observe(el));
})();

// ── CONTACT FORM TOAST ────────────────────────────────────
(function initForm() {
  const form = document.querySelector('.contato form');
  if (!form) return;

  form.addEventListener('submit', e => {
    e.preventDefault();
    showToast('✦ Mensagem enviada com sucesso!');
    form.reset();
  });
})();

function showToast(msg) {
  const t = document.createElement('div');
  t.className = 'toast';
  t.textContent = msg;
  document.body.appendChild(t);
  requestAnimationFrame(() => t.classList.add('show'));
  setTimeout(() => {
    t.classList.remove('show');
    setTimeout(() => t.remove(), 500);
  }, 3500);
}
