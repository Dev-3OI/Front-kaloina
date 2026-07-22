// App.jsx
import { useEffect, useRef, useState } from 'react';
import videoSrc from './assets/video.mp4';
import './App.css';

function App() {
  const videoRef = useRef(null);
  const [isVideoReady, setIsVideoReady] = useState(false);
  const [displayProgress, setDisplayProgress] = useState(0);

  // La vidéo (raccord de boucle "seamless") fond au noir sur sa dernière ~1.5s
  // et fond depuis le noir sur sa première ~1.5s. On exclut ces deux zones du
  // scrubbing pour ne jamais afficher une frame quasi noire pendant le scroll.
  const VIDEO_MIN_TIME = 2;   // s — juste après le fondu d'entrée
  const VIDEO_MAX_TIME = 32;  // s — juste avant le fondu de sortie

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
      // On démarre sur une frame lumineuse (voir VIDEO_MAX_TIME plus bas),
      // pas sur la toute fin du fichier qui est presque noire (raccord de boucle).
      if (video.duration && !isNaN(video.duration)) {
        video.currentTime = Math.min(VIDEO_MAX_TIME, video.duration);
      }
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

  // Scroll → target
  useEffect(() => {
    const updateTarget = () => {
      const scrollY = window.scrollY || window.pageYOffset;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      targetProgress.current = docHeight > 0
        ? Math.max(0, Math.min(scrollY / docHeight, 1))
        : 0;
    };

    window.addEventListener('scroll', updateTarget, { passive: true });
    window.addEventListener('resize', updateTarget, { passive: true });
    updateTarget();

    return () => {
      window.removeEventListener('scroll', updateTarget);
      window.removeEventListener('resize', updateTarget);
    };
  }, []);

  // Boucle rAF pour scrubbing fluide
  useEffect(() => {
    const EASE = 0.14;
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
        const clippedSpan = VIDEO_MAX_TIME - VIDEO_MIN_TIME;
        const targetTime = VIDEO_MIN_TIME + (1 - smoothProgress.current) * clippedSpan;
        if (Math.abs(video.currentTime - targetTime) > SEEK_THRESHOLD) {
          video.currentTime = targetTime;
        }
      }

      rafId.current = requestAnimationFrame(tick);
    };

    rafId.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId.current);
  }, [isVideoReady]);

  const scrollProgress = displayProgress;
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

  return (
    <div className="landing-container">
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
              Perdez-vous
            </span>
            <span className="reveal-line" style={getRevealStyle(0.12)}>
              dans la jungle
            </span>
          </h1>

          <p className="hero-subtitle" style={getRevealStyle(0.3, 0.25)}>
            Une balade immersive au cœur de la forêt tropicale
          </p>

          <div className="hero-cta" style={getRevealStyle(0.5, 0.25)}>
            <button className="cta-button">
              <span>Commencer l'exploration</span>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M7 17L17 7M17 7H7M17 7V17" />
              </svg>
            </button>
          </div>
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

        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${scrollProgress * 100}%` }} />
        </div>
      </section>

      <div className="scroll-spacer" />
    </div>
  );
}

export default App;