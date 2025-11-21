/* ATLAS v3.1.1 — Dark Hybrid Fusion (uuendatud)
   Parallax: ainult hiirega (scroll-parallax eemaldatud)
   Transformi pipeline ühtlustatud: üks koht, mis liigutab kihte.
   Prefers-reduced-motion arvestatud kõikjal.
   Mobiilimenüü, lehtelementide avaldamine, parallaxid - Reimo Zukker
   Kommentaaride süsteem - Nikolas Arro
   */

(() => {
  const prefersReduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ----------------------------------------------------------
     MOBIILIMENÜÜ – BURGERI AVAMINE/SULGEMINE
     ---------------------------------------------------------- */

  const burger = document.querySelector('[data-burger]');
  const nav = document.querySelector('[data-nav]');

  if (burger && nav) {
    burger.addEventListener('click', () => {
      // Lülitame menüüd ja burgeri animatsiooni
      nav.classList.toggle('open');
      burger.classList.toggle('open');
    });
  }

  /* ----------------------------------------------------------
     LEHELEMENTIDE AVALDAMINE SCROLLIMISEL (fade + unblur)
     ---------------------------------------------------------- */

  const revealElements = document.querySelectorAll('[data-reveal]');

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;   // ainult element, mis on ekraanil

      const el = entry.target;

      if (prefersReduced) {
        // Kui kasutaja soovib vähem liikumist → täisnähtav kohe
        el.style.opacity = 1;
        el.style.filter = 'none';
      } else {
        // Sujuv ilmumine (blur → selge)
        el.animate(
          [
            { opacity: 0, filter: 'blur(8px)' },
            { opacity: 1, filter: 'blur(0)' }
          ],
          {
            duration: 700,
            easing: 'cubic-bezier(.2,.8,.2,1)',
            fill: 'forwards'
          }
        );
      }

      // Lõplik klass, mida saab CSS-is kasutada
      el.classList.add('reveal');

      // Ei ole vaja uuesti jälgida
      observer.unobserve(el);
    });
  }, { threshold: 0.1 });

  // Märgime kõik ilmuvad elemendid vaatlejale
  revealElements.forEach(el => observer.observe(el));

  /* ----------------------------------------------------------
     COMBINED PARALLAX – MOUSE + SCROLL
     ----------------------------------------------------------
     – Hiire liikumine tekitab X/Y nihke
     – Scrollimine tekitab vertikaalse sügavuse
     – Mõlemad töötavad koos ühe transform-iga
     ---------------------------------------------------------- */

  const layers = document.querySelectorAll('[data-parallax]');
  const light = document.querySelector('.layer.light');
  
  let mouseX = 0;
  let mouseY = 0;
  let scrollY = 0;

  const intensity = 25; // mouse parallax tugevus

  if (!prefersReduced) {
    // ekraani keskpunkt
    const midX = window.innerWidth / 2;
    const midY = window.innerHeight / 2;

    // Hiire liikumise kuulamine
    window.addEventListener('mousemove', e => {
      mouseX = (e.clientX - midX) / midX;
      mouseY = (e.clientY - midY) / midY;
    });
  }

  // Scrolli kuulamine
  window.addEventListener('scroll', () => {
    scrollY = window.scrollY;
  }, { passive: true });

  // Ühtne animatsioonitsükkel – kombineerib mõlemad efektid
  const tick = () => {
    if (prefersReduced) return;

    layers.forEach(el => {
      const r = parseFloat(el.dataset.parallax) || 0.06;

      // MOUSE PARALLAX
      const moveX = -mouseX * intensity * r;
      const moveY = -mouseY * intensity * (r * 0.4);

      // SCROLL PARALLAX (layers move at different speeds creating depth)
      // Lower parallax values = slower = appear farther
      // Higher parallax values = faster = appear closer
      const scrollOffset = scrollY * r;

      // Kombineeritud transform
      el.style.transform = `translate(${moveX}px, ${moveY + scrollOffset}px)`;
    });

    // Light layer opacity
    if (light) {
      const glow = 0.5 + mouseX * 0.4;
      light.style.opacity = Math.max(0.2, Math.min(0.9, glow));
    }

    requestAnimationFrame(tick);
  };

  if (!prefersReduced) {
    tick();
  }

  /* ----------------------------------------------------------
     KOMMENTAARIDE SÜSTEEM (lihtne lokaalne lisamine)
     ---------------------------------------------------------- */

  const commentForm = document.querySelector('#comment-form');
  const commentList = document.querySelector('#comment-list');

  if (commentForm && commentList) {
    commentForm.addEventListener('submit', e => {
      e.preventDefault();

      const nameInput = commentForm.querySelector('input[name="name"]');
      const commentInput = commentForm.querySelector('textarea[name="comment"]');

      const name = nameInput.value.trim();
      const comment = commentInput.value.trim();
      if (!name || !comment) return; // mõlemad väljad peavad olema täidetud

      // Loome ühe kommentaari bloki
      const entry = document.createElement('div');
      entry.className = 'comment-entry';

      const strong = document.createElement('strong');
      strong.textContent = name;

      const p = document.createElement('p');
      p.textContent = comment;

      entry.appendChild(strong);
      entry.appendChild(p);
      commentList.append(entry);

      commentForm.reset(); // puhastame vormi
    });
  }

})();

/* ----------------------------------------------------------
   REVEAL SYSTEM 2.0 — Stagger + Micro-Parallax
   ---------------------------------------------------------- */

(() => {

  const prefersReduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const revealEls = document.querySelectorAll('[data-reveal]');

  let staggerDelay = 0;

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;

      const el = entry.target;

      // Stagger (0ms → 150ms → 300ms → 450ms …)
      staggerDelay += 150;

      if (prefersReduced) {
        el.style.opacity = 1;
        el.style.filter = "none";
        el.style.transform = "none";
      } else {
        el.style.transitionDelay = staggerDelay + "ms";
        el.classList.add("reveal");
      }

      // Micro-parallax (väga õrn sügavusefekt)
      el.addEventListener("mousemove", e => {
        const rect = el.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width - 0.5) * 5;
        const y = ((e.clientY - rect.top) / rect.height - 0.5) * 5;
        el.style.transform = `translateY(0) translate(${x}px, ${y}px)`;
      });

      el.addEventListener("mouseleave", () => {
        el.style.transform = "translateY(0)";
      });

      observer.unobserve(el);
    });
  }, { threshold: 0.2 });

  revealEls.forEach(el => observer.observe(el));

})();
