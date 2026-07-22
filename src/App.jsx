// App.jsx
import { useEffect, useRef, useState } from 'react';
import videoSrc from './assets/video.mp4';  // ← IMPORT ICI
import './App.css';

function App() {
  const videoRef = useRef(null);
  const [isVideoReady, setIsVideoReady] = useState(false);
  const [displayProgress, setDisplayProgress] = useState(0);

  // targetProgress = où le scroll dit qu'on devrait être (mis à jour instantanément)
  // smoothProgress = valeur réellement appliquée (interpolée en continu vers la cible)
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

  // Suivi de l'état de seek natif : tant qu'un seek précédent n'est pas fini,
  // on n'en déclenche pas un nouveau par-dessus (c'est ça qui crée les à-coups).
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

  // Le scroll ne fait QUE mettre à jour la cible (calcul pur, aucune écriture DOM lourde).
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

  // Boucle rAF PERMANENTE : elle tourne en continu (pas seulement pendant le scroll)
  // et rapproche smoothProgress de targetProgress à chaque frame. C'est ce qui rend
  // le scrubbing fluide même quand le scroll s'arrête brusquement (trackpad, molette...).
  useEffect(() => {
    // Plus bas = plus lissé (mais plus "en retard" derrière le scroll réel)
    // Plus haut = plus réactif (mais plus proche du scroll brut)
    const EASE = 0.14;
    const SEEK_THRESHOLD = 0.008; // en secondes, évite les écritures currentTime inutiles

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

  const scrollProgress = displayProgress;
  const heroProgress = Math.min(scrollProgress * 3, 1);
  const videoOpacity = Math.min(heroProgress * 1.5, 1);
  const contentFadeIn = Math.max(0, Math.min((scrollProgress - 0.15) / 0.2, 1));

  const getRevealStyle = (delay = 0, duration = 0.3) => {
    const p = Math.max(0, Math.min((heroProgress - delay) / duration, 1));
    return {
      transform: `translateY(${40 * (1 - p)}px)`,
      opacity: p,
    };
  };

  return (
    <div className="landing-container">
      {/* ===== HERO SECTION (sticky) ===== */}
      <section className="hero-section">
        {/* Vidéo avec import */}
        <video
          ref={videoRef}
          muted
          playsInline
          webkit-playsinline="true"
          preload="auto"
          className="bg-video"
          style={{ opacity: videoOpacity }}
        >
          <source src={videoSrc} type="video/mp4" />  {/* ← UTILISE LA VARIABLE */}
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

function FeatureCard({ icon, title, description, delay }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`feature-card ${visible ? 'visible' : ''}`}
      style={{ transitionDelay: `${delay}s` }}
    >
      <div className="feature-icon">{icon}</div>
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  );
}

export default App;