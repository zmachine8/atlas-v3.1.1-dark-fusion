/* ATLAS v3.1.1 — Dark Hybrid Fusion (bugfix)
   Fix: tekst ei muutu enam läbipaistvaks, kui shine efekt käivitub.
   Lähenemine: shine efekt töötab ::after overlay peal; pealkiri hoiab kindlat värvi.
*/
(()=>{
  const prefersReduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Mobile nav
  const burger = document.querySelector('[data-burger]');
  const nav = document.querySelector('[data-nav]');
  if (burger && nav){
    burger.addEventListener('click', ()=>{
      nav.classList.toggle('open');
      burger.setAttribute('aria-expanded', nav.classList.contains('open'));
    });
  }

/* ==========================================================
   SCROLL PARALLAX — lisab sügavust vastavalt scrollimisele
   ----------------------------------------------------------
   - mõjutab kõiki elemente, millel on [data-parallax]
   - liikumine on väga pehme (muudetav intensity väärtus)
   ========================================================== */
  const parallaxEls = Array.from(document.querySelectorAll('[data-parallax]'));
  const onScroll = ()=>{
    if (prefersReduced) return;
    const y = window.scrollY;
    for (const el of parallaxEls){
      const r = parseFloat(el.dataset.parallax || '0.08');
      el.style.transform = `translateY(${-(y*r)}px)`;
    }
  };
  document.addEventListener('scroll', onScroll, {passive:true});
  onScroll();

  // Blur-in reveal (shine handled in CSS ::after animation)
  const io = new IntersectionObserver((entries)=>{
    for (const e of entries){
      if (e.isIntersecting){
        const el = e.target;
        if (!prefersReduced){
          el.animate(
            [{ filter:'blur(8px)', opacity:0 }, { filter:'blur(0px)', opacity:1 }],
            { duration: 700, easing:'cubic-bezier(.2,.8,.2,1)', fill:'forwards' }
          );
        } else {
          el.style.opacity = 1;
        }
        el.classList.add('reveal'); // triggers ::after shine sweep once
        io.unobserve(el);
      }
    }
  }, {threshold: 0.25});
  document.querySelectorAll('[data-reveal]').forEach(el=>io.observe(el));
})();

/* ==========================================================
   MOUSE PARALLAX — lisab sügavust vastavalt hiire liikumisele
   ----------------------------------------------------------
   - mõjutab kõiki elemente, millel on [data-parallax]
   - liikumine on väga pehme (muudetav intensity väärtus)
   ========================================================== */
(() => {
  const layers = document.querySelectorAll('[data-parallax]');
  const light = document.querySelector('.layer.light');
  const intensity = 25; // ⟵ suurem = tugevam liikumine
  let mouseX = 0, mouseY = 0;

  // reaalne akna keskpunkt
  const midX = window.innerWidth / 2;
  const midY = window.innerHeight / 2;

  window.addEventListener('mousemove', (e) => {
    // arvuta nihke suhe (-1 ... +1)
    const relX = (e.clientX - midX) / midX;
    const relY = (e.clientY - midY) / midY;
    mouseX = relX;
    mouseY = relY;
  });

  // sujuv animatsioon — rakendatakse igale frame’ile
  const update = () => {
    layers.forEach(el => {
      const r = parseFloat(el.dataset.parallax || '0.05');
      // lisame hiireefekti — väiksem mõju kaugematel kihtidel
      const moveX = -mouseX * intensity * r;
      const moveY = -mouseY * intensity * r;
      // ühendame olemasoleva scroll-parallax transformi
      const currentY = el.style.transform.match(/translateY\(([-0-9.]+)px\)/);
      const scrollY = currentY ? parseFloat(currentY[1]) : 0;
      el.style.transform = `translate(${moveX}px, ${scrollY + moveY}px)`;
    });

    /* ==========================================================
   VALGUSLOOGIKA - VALGUSE INTENSIIVSUS HIIRE SUUNA JÄRGI
   ========================================================== */
    if (light) {
    // arvuta uus läbipaistmatus (väärtus 0.2–0.9)
      const opacity = 0.5 + mouseX * 0.4;
      light.style.opacity = Math.max(0.2, Math.min(0.9, opacity));
    }

    requestAnimationFrame(update);
  };
  update();
})();
