// App.jsx
import { useEffect, useRef, useState } from 'react';
import videoSrc from './assets/video2.mp4';
import madagascarImg from './assets/madagascar-agriculture.webp';
import SplineGlobe from './SplineGlobe';
import './App.css';
import ProblemsSection from './ProblemsSection.jsx'
import mapPinIcon from './assets/icons/map.png';
import rainCloudIcon from './assets/icons/climat.png';
import phoneChartIcon from './assets/icons/stats.png';
import savannaSunIcon from './assets/icons/zone.png';
import { Routes, Route } from 'react-router-dom';
import { Link } from 'react-router-dom';
import FeaturesPage from './FeaturesPage.jsx';

const SOLUTIONS = [
  {
    title: 'Reforestation',
    text: "Plantation d'arbres endémiques pour restaurer les corridors forestiers et freiner l'érosion des sols.",
    color: '#b98f4e',
    icon: savannaSunIcon,
  },
  {
    title: 'Agriculture durable',
    text: 'Des techniques agricoles qui préservent les sols au lieu de les épuiser, pour des récoltes qui durent.',
    color: '#d9b877',
    icon: rainCloudIcon,
  },
  {
    title: 'Énergie propre',
    text: "Des solutions solaires locales pour réduire la dépendance au bois de chauffe et protéger la forêt.",
    color: '#5a8fa8',
    icon: savannaSunIcon,
  },
  {
    title: 'Éducation & communautés',
    text: 'Former les habitants aux enjeux de conservation pour que la protection de la forêt vienne du terrain.',
    color: '#a87c5a',
    icon: phoneChartIcon,
  },
  {
    title: 'Écotourisme responsable',
    text: 'Un tourisme qui finance la préservation plutôt que de l\'épuiser, au bénéfice des communautés locales.',
    color: '#8a6fa8',
    icon: mapPinIcon,
  },
];


function App() {
  const videoRef = useRef(null);
  const [isVideoReady, setIsVideoReady] = useState(false);
  const [displayProgress, setDisplayProgress] = useState(0);
  const parallaxRef = useRef(null);
  const [parallaxOffset, setParallaxOffset] = useState(0);
  const [cardTilt, setCardTilt] = useState({ rx: 0, ry: 0 });
  const globeWrapRef = useRef(null);
  const [globeProgress, setGlobeProgress] = useState(0);

  const handleCardMouseMove = (e) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;  // 0..1
    const y = (e.clientY - rect.top) / rect.height;  // 0..1
    setCardTilt({
      ry: (x - 0.5) * 18,   // gauche/droite → rotation autour de l'axe vertical
      rx: -(y - 0.5) * 18,  // haut/bas → rotation autour de l'axe horizontal
    });
  };

  const handleCardMouseLeave = () => {
    setCardTilt({ rx: 0, ry: 0 });
  };

  // La nouvelle vidéo n'a pas de fondu noir en début/fin, donc pas besoin de
  // clipper la plage de temps : on utilise le clip en entier, du début à la fin.

  const targetProgress = useRef(0);
  const smoothProgress = useRef(0);
  const rafId = useRef(null);
  const isSeeking = useRef(false);

  // Chargement de la vidéo
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoaded = () => {
      setIsVideoReady(true);
      video.pause();
      // On démarre au tout début de la vidéo
      video.currentTime = 0;
    };

    if (video.readyState >= 1) {
      handleLoaded();
    } else {
      video.addEventListener('loadedmetadata', handleLoaded);
    }

    return () => {
      video.removeEventListener('loadedmetadata', handleLoaded);
    };
  }, []);

  // Suivi du seek natif
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onSeeking = () => { isSeeking.current = true; };
    const onSeeked = () => { isSeeking.current = false; };

    video.addEventListener('seeking', onSeeking);
    video.addEventListener('seeked', onSeeked);

    return () => {
      video.removeEventListener('seeking', onSeeking);
      video.removeEventListener('seeked', onSeeked);
    };
  }, []);

  const landingRef = useRef(null);
  // Scroll → target
  useEffect(() => {
    const updateTarget = () => {
      const el = landingRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const total = rect.height - window.innerHeight;
      const scrolled = -rect.top;
      // On atteint 1 à 92% du scroll réel, ce qui laisse 8% de marge
      // pour que l'easing (smoothProgress) ait le temps de rattraper
      // targetProgress avant que la section sticky ne disparaisse.
      const rawProgress = total > 0 ? scrolled / total : 0;
      targetProgress.current = Math.max(0, Math.min(rawProgress / 0.92, 1));
    };

    window.addEventListener('scroll', updateTarget, { passive: true });
    window.addEventListener('resize', updateTarget, { passive: true });
    updateTarget();

    return () => {
      window.removeEventListener('scroll', updateTarget);
      window.removeEventListener('resize', updateTarget);
    };
  }, []);

  // // Boucle rAF pour scrubbing fluide
  // useEffect(() => {
  //   const EASE = 0.14;
  //   const SEEK_THRESHOLD = 0.008;

  //   const tick = () => {
  //     const diff = targetProgress.current - smoothProgress.current;
  //     smoothProgress.current += Math.abs(diff) < 0.0001 ? 0 : diff * EASE;

  //     setDisplayProgress(smoothProgress.current);

  //     const video = videoRef.current;
  //     if (
  //       video &&
  //       isVideoReady &&
  //       video.duration &&
  //       !isNaN(video.duration) &&
  //       !isSeeking.current
  //     ) {
  //       // Mapping direct : scroll 0 → début de la vidéo, scroll 1 → fin de la vidéo
  //       const targetTime = smoothProgress.current * video.duration;
  //       if (Math.abs(video.currentTime - targetTime) > SEEK_THRESHOLD) {
  //         video.currentTime = targetTime;
  //       }
  //     }

  //     rafId.current = requestAnimationFrame(tick);
  //   };

  //   rafId.current = requestAnimationFrame(tick);
  //   return () => cancelAnimationFrame(rafId.current);
  // }, [isVideoReady]);

  // Fraction du scroll (0 à 1) consacrée à faire jouer la vidéo en entier.
  // Au-delà de cette fraction, la vidéo reste figée sur sa dernière image
  // pendant le reste du scroll, ce qui garantit qu'elle a fini AVANT que
  // la section parallax n'apparaisse.
  // Boucle rAF pour scrubbing fluide — mapping direct sur toute la hauteur
  // du scroll (hero + spacer), donc la vidéo continue de jouer jusqu'à la
  // toute fin, pile au moment où la section suivante remonte par-dessus.
  useEffect(() => {
    const EASE = 0.22;
    const SEEK_THRESHOLD = 0.008;

    const tick = () => {
      const diff = targetProgress.current - smoothProgress.current;
      smoothProgress.current += Math.abs(diff) < 0.0001 ? 0 : diff * EASE;

      setDisplayProgress(smoothProgress.current);

      const video = videoRef.current;
      if (
        video &&
        isVideoReady &&
        video.duration &&
        !isNaN(video.duration) &&
        !isSeeking.current
      ) {
        const targetTime = smoothProgress.current * video.duration;
        if (Math.abs(video.currentTime - targetTime) > SEEK_THRESHOLD) {
          video.currentTime = targetTime;
        }
      }

      rafId.current = requestAnimationFrame(tick);
    };

    rafId.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId.current);
  }, [isVideoReady]);

  // Parallaxe de la section sombre : on calcule à quelle distance du centre
  // de l'écran se trouve la section, et chaque couche se déplace ensuite à
  // une vitesse différente proportionnelle à cette distance.
  useEffect(() => {
    let raf = null;

    const updateParallax = () => {
      const el = parallaxRef.current;
      if (el) {
        const rect = el.getBoundingClientRect();
        const viewportCenter = window.innerHeight / 2;
        const distanceFromCenter = rect.top + rect.height / 2 - viewportCenter;
        setParallaxOffset(distanceFromCenter);
      }
      raf = requestAnimationFrame(updateParallax);
    };

    raf = requestAnimationFrame(updateParallax);
    return () => cancelAnimationFrame(raf);
  }, []);

  // Progression du scroll à travers la section globe (sticky) : 0 quand la
  // section entre dans l'écran, 1 quand on a fini de la traverser.
  useEffect(() => {
    let raf = null;

    const updateGlobeProgress = () => {
      const el = globeWrapRef.current;
      if (el) {
        const rect = el.getBoundingClientRect();
        const vh = window.innerHeight;
        const total = rect.height - vh;
        const scrolled = -rect.top;
        const p = total > 0 ? Math.max(0, Math.min(scrolled / total, 1)) : 0;
        setGlobeProgress(p);
      }
      raf = requestAnimationFrame(updateGlobeProgress);
    };

    raf = requestAnimationFrame(updateGlobeProgress);
    return () => cancelAnimationFrame(raf);
  }, []);

  const scrollProgress = displayProgress;

  // Effet d'entrée 3D de la carte image : plus la section parallaxe est
  // proche du centre de l'écran, plus la carte "sort de l'écran" (translateZ,
  // scale et netteté augmentent). Réutilise parallaxOffset déjà calculé.
  const IMAGE_MAX_DIST = 550; // px — distance à partir de laquelle la carte est jugée "hors champ"
  const imageProximity = Math.max(0, 1 - Math.abs(parallaxOffset) / IMAGE_MAX_DIST);
  const imageScrollStyle = {
    opacity: 0.15 + imageProximity * 0.85,
    transform: `translateZ(${-220 + imageProximity * 220}px) scale(${0.82 + imageProximity * 0.18})`,
    filter: `blur(${(1 - imageProximity) * 8}px)`,
  };
  // Tilt piloté par le scroll : la carte s'incline comme au survol, mais en
  // fonction de la position de la section à l'écran plutôt que de la souris.
  // Elle "se redresse" à l'approche du centre, et s'incline selon le sens
  // d'où elle arrive (au-dessus / en dessous du centre de l'écran).
  const scrollTiltDirection = Math.sign(parallaxOffset) || 1;
  const scrollTiltX = scrollTiltDirection * (1 - imageProximity) * 10;
  const scrollTiltY = (1 - imageProximity) * 12;
  // Le titre se révèle et repart très vite : le site doit être "installé" dans
  // l'ambiance du premier texte dès le tout début du scroll, pas après 1/3 de page.
  const heroProgress = Math.min(scrollProgress * 10, 1);
  const videoOpacity = isVideoReady ? Math.min(heroProgress * 1.5, 1) : 0;
  const contentFadeIn = Math.max(0, Math.min((scrollProgress - 0.02) / 0.06, 1));

  const getRevealStyle = (delay = 0, duration = 0.3) => {
    const p = Math.max(0, Math.min((heroProgress - delay) / duration, 1));
    return {
      transform: `translateY(${40 * (1 - p)}px)`,
      opacity: p,
    };
  };

  // Phrases glassmorph — alternance gauche/droite. Séquentiel : chaque élément
  // (titre puis phrase 1, 2, 3) disparaît COMPLÈTEMENT avant que le suivant ne
  // commence à apparaître — pas de chevauchement.
  // Le titre finit de s'effacer à scrollProgress ≈ 0.08 (voir contentFadeIn).
  const phrases = [
    { text: "Chaque pas vous rapproche du mystère", start: 0.16, end: 0.30, align: 'left' },
    { text: "La lumière danse entre les feuilles", start: 0.44, end: 0.58, align: 'right' },
    { text: "Le silence de la forêt raconte mille histoires", start: 0.72, end: 0.90, align: 'left' },
  ];

  // Chaque carte "émerge" de la profondeur de la vidéo (translateZ négatif → 0),
  // se redresse (rotateY tiltBase → 0) comme si elle se posait bien à plat sur
  // une feuille ou une branche, grandit (scale) et se met au point (blur) à
  // mesure que la caméra s'en approche, puis repart en profondeur en s'estompant.
  const getPhraseStyle = (start, end, align, fade = 0.07) => {
    let visibility = 0;
    if (scrollProgress >= start && scrollProgress <= end) {
      visibility = 1;
    } else if (scrollProgress >= start - fade && scrollProgress < start) {
      visibility = (scrollProgress - (start - fade)) / fade;
    } else if (scrollProgress > end && scrollProgress <= end + fade) {
      visibility = 1 - (scrollProgress - end) / fade;
    }
    visibility = Math.max(0, Math.min(visibility, 1));

    const tiltBase = align === 'left' ? 18 : -18;
    const rotateY = tiltBase * (1 - visibility);
    const translateZ = -160 + visibility * 160;
    const scale = 0.8 + visibility * 0.2;
    const blurPx = (1 - visibility) * 6;
    const translateY = (1 - visibility) * 32;

    return {
      anchorStyle: {
        opacity: visibility,
        transform: `translateZ(${translateZ}px) translateY(${translateY}px) scale(${scale}) rotateY(${rotateY}deg)`,
        filter: `blur(${blurPx}px)`,
      },
      shadowOpacity: visibility * 0.55,
    };
  };

  // ===== Globe : rotation au scroll jusqu'à Madagascar, puis solutions =====
  const GLOBE_ARRIVE = 0.32; // fraction du scroll de la section à partir de laquelle le globe est "arrivé"
  const arriveT = Math.min(globeProgress / GLOBE_ARRIVE, 1);
  const easedArrive = 1 - Math.pow(1 - arriveT, 3); // easeOutCubic : ralentit en approchant de Madagascar
  const hasArrived = globeProgress >= GLOBE_ARRIVE;

  const globeScale = 0.72 + 0.28 * easedArrive;
  const globeOpacity = 0.2 + 0.8 * easedArrive;

  const postArriveProgress = hasArrived
    ? Math.min(Math.max((globeProgress - GLOBE_ARRIVE) / (1 - GLOBE_ARRIVE), 0), 1)
    : 0;
  const rawSolutionIndex = postArriveProgress * SOLUTIONS.length;
  const activeSolutionIndex = Math.min(SOLUTIONS.length - 1, Math.floor(rawSolutionIndex));
  const activeSolution = hasArrived ? SOLUTIONS[activeSolutionIndex] : null;
  const madagascarColor = activeSolution ? activeSolution.color : '#346733';

  return (
    <Routes>
      <Route path="/" element={
        <>
          <div className="landing-container" ref={landingRef}>
            {/* ===== HERO SECTION (sticky) ===== */}
            <section className="hero-section">
              <video
                ref={videoRef}
                muted
                playsInline
                webkit-playsinline="true"
                preload="auto"
                className="bg-video"
                style={{ opacity: videoOpacity }}
              >
                <source src={videoSrc} type="video/mp4" />
              </video>

              <div className="overlay-vignette" />
              <div className="overlay-gradient" />

              <div className="particles">
                {[...Array(12)].map((_, i) => (
                  <span key={i} className="particle" style={{
                    left: `${Math.random() * 100}%`,
                    animationDelay: `${Math.random() * 10}s`,
                    animationDuration: `${8 + Math.random() * 10}s`
                  }} />
                ))}
              </div>

              {/* Hero content initial */}
              <div className="hero-content" style={{ opacity: 1 - contentFadeIn }}>
                <h1 className="hero-title">
                  <span className="reveal-line" style={getRevealStyle(0)}>
                    Explorez
                  </span>
                  <span className="reveal-line" style={getRevealStyle(0.12)}>
                    le monde de l'agriculture
                  </span>
                </h1>

                <p className="hero-subtitle" style={getRevealStyle(0.3, 0.25)}>
                  Une expérience intelligente pour apprendre, cultiver et innover.
                </p>
              </div>

              {/* Phrases ancrées en 3D dans la scène */}
              <div className="phrases-container">
                {phrases.map((p, i) => {
                  const { anchorStyle, shadowOpacity } = getPhraseStyle(p.start, p.end, p.align);
                  return (
                    <div
                      key={i}
                      className={`phrase-anchor ${p.align}`}
                      style={anchorStyle}
                    >
                      <div className="phrase-card">
                        <p className="phrase-text">{p.text}</p>
                        <div className="phrase-line" />
                      </div>
                      <div className="phrase-shadow" style={{ opacity: shadowOpacity }} />
                    </div>
                  );
                })}
              </div>

              <div className="scroll-hint" style={{ opacity: Math.max(0, 0.8 - heroProgress * 2) }}>
                <div className="mouse">
                  <div className="wheel" />
                </div>
                <span>Scroll pour avancer</span>
              </div>
            </section>

            <div className="scroll-spacer" />
          </div>

          {/* ===== SECTION SOMBRE / PARALLAXE (s'enchaîne après la vidéo) ===== */}
          <section className="parallax-section" ref={parallaxRef}>
            <div
              className="parallax-layer layer-back"
              style={{ transform: `translateY(${parallaxOffset * 0.12}px)` }}
            >
              <span className="deco-leaf leaf-1" />
              <span className="deco-leaf leaf-2" />
              <span className="deco-leaf leaf-3" />
            </div>

            <div
              className="parallax-layer layer-mid"
              style={{ transform: `translateY(${parallaxOffset * 0.25}px)` }}
            >
              <span className="deco-dot dot-1" />
              <span className="deco-dot dot-2" />
              <span className="deco-dot dot-3" />
            </div>

            <div
              className="parallax-content-grid"
              style={{ transform: `translateY(${parallaxOffset * -0.08}px)` }}
            >
              {/* Carte image à gauche : profondeur au scroll + tilt 3D au survol */}
              <div className="image-card-wrap" style={imageScrollStyle}>
                <div
                  className="image-card"
                  onMouseMove={handleCardMouseMove}
                  onMouseLeave={handleCardMouseLeave}
                  style={{ transform: `rotateX(${cardTilt.rx + scrollTiltX}deg) rotateY(${cardTilt.ry + scrollTiltY}deg)` }}
                >
                  <img src={madagascarImg} alt="Agriculture traditionnelle à Madagascar" />
                  <div className="image-card-shine" />
                </div>
              </div>

              {/* Texte à droite */}
              <div className="parallax-text-col">
                <span className="parallax-eyebrow">Pour tous les acteurs du monde agricole</span>
                <h2 className="parallax-title">Une plateforme pensée pour faire évoluer l'agriculture</h2>
                <p className="parallax-text">
                  Nous connectons les données du terrain à l'intelligence artificielle pour aider chacun à diagnostiquer, comprendre et améliorer les pratiques agricoles de manière durable.
                </p>
                <button className="cta-button">
                  <span>Découvrir l'expérience complète</span>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M7 17L17 7M17 7H7M17 7V17" />
                  </svg>
                </button>
              </div>
            </div>
          </section>

          <ProblemsSection />

          {/* ===== SECTION GLOBE (sticky) : rotation jusqu'à Madagascar, puis 5 solutions ===== */}
          <div className="globe-scroll-wrap" ref={globeWrapRef}>
            <section className="globe-section" style={{ '--md-color': madagascarColor }}>
              <div className="globe-grid">
                <div className="globe-stage">
                  <div
                    className="globe-outer"
                    style={{
                      opacity: globeOpacity,
                      transform: `scale(${globeScale})`,
                    }}
                  >
                    <SplineGlobe />
                  </div>
                </div>

                <div className="solutions-col">
                  <span
                    className="solutions-eyebrow"
                    style={{ opacity: hasArrived ? 0 : 1 }}
                  >
                    Faites défiler pour atteindre Madagascar
                  </span>

                  <div className="solutions-stack">
                    {SOLUTIONS.map((solution, i) => (
                      <div
                        key={solution.title}
                        className={`solution-item${i === activeSolutionIndex && hasArrived ? ' active' : ''}`}
                        style={{ '--solution-color': solution.color }}
                      >
                        <img src={solution.icon} alt="" className="solution-icon" />
                        <span className="solution-index">
                          Solution {i + 1}/{SOLUTIONS.length}
                        </span>
                        <h3 className="solution-title">{solution.title}</h3>
                        <p className="solution-text">{solution.text}</p>
                        <div className="solution-bar" />
                      </div>
                    ))}
                  </div>

                  <div
                    className="solutions-cta-wrap"
                    style={{ opacity: hasArrived ? 1 : 0, pointerEvents: hasArrived ? 'auto' : 'none' }}
                  >
                    <Link to="/fonctionnalites" className="cta-button solutions-cta">
                      <span>Explorer</span>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M7 17L17 7M17 7H7M17 7V17" />
                      </svg>
                    </Link>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </>
      } />
      <Route path="/fonctionnalites" element={<FeaturesPage />} />
    </Routes>
  );
}

export default App;