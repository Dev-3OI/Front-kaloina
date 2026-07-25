// // App.jsx
// import { useEffect, useRef, useState } from 'react';
// import videoSrc from './assets/video.mp4';
// import './App.css';

// function App() {
//   const videoRef = useRef(null);
//   const [isVideoReady, setIsVideoReady] = useState(false);
//   const [displayProgress, setDisplayProgress] = useState(0);

//   // La vidéo (raccord de boucle "seamless") fond au noir sur sa dernière ~1.5s
//   // et fond depuis le noir sur sa première ~1.5s. On exclut ces deux zones du
//   // scrubbing pour ne jamais afficher une frame quasi noire pendant le scroll.
//   const VIDEO_MIN_TIME = 2;   // s — juste après le fondu d'entrée
//   const VIDEO_MAX_TIME = 32;  // s — juste avant le fondu de sortie

//   const targetProgress = useRef(0);
//   const smoothProgress = useRef(0);
//   const rafId = useRef(null);
//   const isSeeking = useRef(false);

//   // Chargement de la vidéo
//   useEffect(() => {
//     const video = videoRef.current;
//     if (!video) return;

//     const handleLoaded = () => {
//       setIsVideoReady(true);
//       video.pause();
//       // On démarre sur une frame lumineuse (voir VIDEO_MAX_TIME plus bas),
//       // pas sur la toute fin du fichier qui est presque noire (raccord de boucle).
//       if (video.duration && !isNaN(video.duration)) {
//         video.currentTime = Math.min(VIDEO_MAX_TIME, video.duration);
//       }
//     };

//     if (video.readyState >= 1) {
//       handleLoaded();
//     } else {
//       video.addEventListener('loadedmetadata', handleLoaded);
//     }

//     return () => {
//       video.removeEventListener('loadedmetadata', handleLoaded);
//     };
//   }, []);

//   // Suivi du seek natif
//   useEffect(() => {
//     const video = videoRef.current;
//     if (!video) return;

//     const onSeeking = () => { isSeeking.current = true; };
//     const onSeeked = () => { isSeeking.current = false; };

//     video.addEventListener('seeking', onSeeking);
//     video.addEventListener('seeked', onSeeked);

//     return () => {
//       video.removeEventListener('seeking', onSeeking);
//       video.removeEventListener('seeked', onSeeked);
//     };
//   }, []);

//   // Scroll → target
//   useEffect(() => {
//     const updateTarget = () => {
//       const scrollY = window.scrollY || window.pageYOffset;
//       const docHeight = document.documentElement.scrollHeight - window.innerHeight;
//       targetProgress.current = docHeight > 0
//         ? Math.max(0, Math.min(scrollY / docHeight, 1))
//         : 0;
//     };

//     window.addEventListener('scroll', updateTarget, { passive: true });
//     window.addEventListener('resize', updateTarget, { passive: true });
//     updateTarget();

//     return () => {
//       window.removeEventListener('scroll', updateTarget);
//       window.removeEventListener('resize', updateTarget);
//     };
//   }, []);

//   // Boucle rAF pour scrubbing fluide
//   useEffect(() => {
//     const EASE = 0.14;
//     const SEEK_THRESHOLD = 0.008;

//     const tick = () => {
//       const diff = targetProgress.current - smoothProgress.current;
//       smoothProgress.current += Math.abs(diff) < 0.0001 ? 0 : diff * EASE;

//       setDisplayProgress(smoothProgress.current);

//       const video = videoRef.current;
//       if (
//         video &&
//         isVideoReady &&
//         video.duration &&
//         !isNaN(video.duration) &&
//         !isSeeking.current
//       ) {
//         const clippedSpan = VIDEO_MAX_TIME - VIDEO_MIN_TIME;
//         const targetTime = VIDEO_MIN_TIME + (1 - smoothProgress.current) * clippedSpan;
//         if (Math.abs(video.currentTime - targetTime) > SEEK_THRESHOLD) {
//           video.currentTime = targetTime;
//         }
//       }

//       rafId.current = requestAnimationFrame(tick);
//     };

//     rafId.current = requestAnimationFrame(tick);
//     return () => cancelAnimationFrame(rafId.current);
//   }, [isVideoReady]);

//   const scrollProgress = displayProgress;
//   // Le titre se révèle et repart très vite : le site doit être "installé" dans
//   // l'ambiance du premier texte dès le tout début du scroll, pas après 1/3 de page.
//   const heroProgress = Math.min(scrollProgress * 10, 1);
//   const videoOpacity = isVideoReady ? Math.min(heroProgress * 1.5, 1) : 0;
//   const contentFadeIn = Math.max(0, Math.min((scrollProgress - 0.02) / 0.06, 1));

//   const getRevealStyle = (delay = 0, duration = 0.3) => {
//     const p = Math.max(0, Math.min((heroProgress - delay) / duration, 1));
//     return {
//       transform: `translateY(${40 * (1 - p)}px)`,
//       opacity: p,
//     };
//   };

//   // Phrases glassmorph — alternance gauche/droite. Séquentiel : chaque élément
//   // (titre puis phrase 1, 2, 3) disparaît COMPLÈTEMENT avant que le suivant ne
//   // commence à apparaître — pas de chevauchement.
//   // Le titre finit de s'effacer à scrollProgress ≈ 0.08 (voir contentFadeIn).
//   const phrases = [
//     { text: "Chaque pas vous rapproche du mystère", start: 0.16, end: 0.30, align: 'left' },
//     { text: "La lumière danse entre les feuilles", start: 0.44, end: 0.58, align: 'right' },
//     { text: "Le silence de la forêt raconte mille histoires", start: 0.72, end: 0.90, align: 'left' },
//   ];

//   // Chaque carte "émerge" de la profondeur de la vidéo (translateZ négatif → 0),
//   // se redresse (rotateY tiltBase → 0) comme si elle se posait bien à plat sur
//   // une feuille ou une branche, grandit (scale) et se met au point (blur) à
//   // mesure que la caméra s'en approche, puis repart en profondeur en s'estompant.
//   const getPhraseStyle = (start, end, align, fade = 0.07) => {
//     let visibility = 0;
//     if (scrollProgress >= start && scrollProgress <= end) {
//       visibility = 1;
//     } else if (scrollProgress >= start - fade && scrollProgress < start) {
//       visibility = (scrollProgress - (start - fade)) / fade;
//     } else if (scrollProgress > end && scrollProgress <= end + fade) {
//       visibility = 1 - (scrollProgress - end) / fade;
//     }
//     visibility = Math.max(0, Math.min(visibility, 1));

//     const tiltBase = align === 'left' ? 18 : -18;
//     const rotateY = tiltBase * (1 - visibility);
//     const translateZ = -160 + visibility * 160;
//     const scale = 0.8 + visibility * 0.2;
//     const blurPx = (1 - visibility) * 6;
//     const translateY = (1 - visibility) * 32;

//     return {
//       anchorStyle: {
//         opacity: visibility,
//         transform: `translateZ(${translateZ}px) translateY(${translateY}px) scale(${scale}) rotateY(${rotateY}deg)`,
//         filter: `blur(${blurPx}px)`,
//       },
//       shadowOpacity: visibility * 0.55,
//     };
//   };

//   return (
//     <div className="landing-container">
//       {/* ===== HERO SECTION (sticky) ===== */}
//       <section className="hero-section">
//         <video
//           ref={videoRef}
//           muted
//           playsInline
//           webkit-playsinline="true"
//           preload="auto"
//           className="bg-video"
//           style={{ opacity: videoOpacity }}
//         >
//           <source src={videoSrc} type="video/mp4" />
//         </video>

//         <div className="overlay-vignette" />
//         <div className="overlay-gradient" />

//         <div className="particles">
//           {[...Array(12)].map((_, i) => (
//             <span key={i} className="particle" style={{
//               left: `${Math.random() * 100}%`,
//               animationDelay: `${Math.random() * 10}s`,
//               animationDuration: `${8 + Math.random() * 10}s`
//             }} />
//           ))}
//         </div>

//         {/* Hero content initial */}
//         <div className="hero-content" style={{ opacity: 1 - contentFadeIn }}>
//           <h1 className="hero-title">
//             <span className="reveal-line" style={getRevealStyle(0)}>
//               Perdez-vous
//             </span>
//             <span className="reveal-line" style={getRevealStyle(0.12)}>
//               dans la jungle
//             </span>
//           </h1>

//           <p className="hero-subtitle" style={getRevealStyle(0.3, 0.25)}>
//             Une balade immersive au cœur de la forêt tropicale
//           </p>

//           <div className="hero-cta" style={getRevealStyle(0.5, 0.25)}>
//             <button className="cta-button">
//               <span>Commencer l'exploration</span>
//               <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
//                 <path d="M7 17L17 7M17 7H7M17 7V17" />
//               </svg>
//             </button>
//           </div>
//         </div>

//         {/* Phrases ancrées en 3D dans la scène */}
//         <div className="phrases-container">
//           {phrases.map((p, i) => {
//             const { anchorStyle, shadowOpacity } = getPhraseStyle(p.start, p.end, p.align);
//             return (
//               <div
//                 key={i}
//                 className={`phrase-anchor ${p.align}`}
//                 style={anchorStyle}
//               >
//                 <div className="phrase-card">
//                   <p className="phrase-text">{p.text}</p>
//                   <div className="phrase-line" />
//                 </div>
//                 <div className="phrase-shadow" style={{ opacity: shadowOpacity }} />
//               </div>
//             );
//           })}
//         </div>

//         <div className="scroll-hint" style={{ opacity: Math.max(0, 0.8 - heroProgress * 2) }}>
//           <div className="mouse">
//             <div className="wheel" />
//           </div>
//           <span>Scroll pour avancer</span>
//         </div>

//         <div className="progress-bar">
//           <div className="progress-fill" style={{ width: `${scrollProgress * 100}%` }} />
//         </div>
//       </section>

//       <div className="scroll-spacer" />
//     </div>
//   );
// }

// export default App;













import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import video1 from './assets/video1.mp4';
import video2 from './assets/video2.mp4';
import video3 from './assets/video3.mp4';
import video4 from './assets/video4.mp4';

import './App.css';
import SolutionsHub from './components/SolutionHub';

const VIDEOS = [
  {
    src: video1,
    label: 'Les racines',
  },
  {
    src: video2,
    label: 'Les communautés',
  },
  {
    src: video3,
    label: 'Intelligence locale',
  },
  {
    src: video4,
    label: 'Le futur',
  },
];

const STORY_TEXTS = [
  {
    videoIndex: 0,
    kicker: '01 — Nos racines',
    text: 'Tout commence par un territoire, une culture et une mémoire transmise de génération en génération.',
    start: 0.08,
    end: 0.28,
    align: 'left',
  },
  {
    videoIndex: 0,
    kicker: 'Observer',
    text: 'Les communautés connaissent déjà leur environnement. La technologie vient renforcer cette intelligence.',
    start: 0.4,
    end: 0.65,
    align: 'right',
  },
  {
    videoIndex: 0,
    kicker: 'Transmettre',
    text: 'Chaque savoir partagé devient une ressource capable de transformer demain.',
    start: 0.74,
    end: 0.92,
    align: 'left',
  },

  {
    videoIndex: 1,
    kicker: '02 — Connecter',
    text: 'La technologie rapproche les personnes lorsqu’elle répond à un besoin réel.',
    start: 0.08,
    end: 0.28,
    align: 'right',
  },
  {
    videoIndex: 1,
    kicker: 'Comprendre',
    text: 'Les langues, les cultures et les réalités locales doivent rester au centre de l’innovation.',
    start: 0.4,
    end: 0.65,
    align: 'left',
  },
  {
    videoIndex: 1,
    kicker: 'Collaborer',
    text: 'Les communautés deviennent actrices de leur propre transformation.',
    start: 0.74,
    end: 0.92,
    align: 'right',
  },

  {
    videoIndex: 2,
    kicker: '03 — Intelligence locale',
    text: 'Une intelligence artificielle adaptée au terrain comprend mieux les besoins locaux.',
    start: 0.08,
    end: 0.28,
    align: 'left',
  },
  {
    videoIndex: 2,
    kicker: 'Analyser',
    text: 'Les données peuvent aider à anticiper, comparer et prendre de meilleures décisions.',
    start: 0.4,
    end: 0.65,
    align: 'right',
  },
  {
    videoIndex: 2,
    kicker: 'Transformer',
    text: 'Agriculture, santé, mobilité et éducation deviennent plus accessibles.',
    start: 0.74,
    end: 0.92,
    align: 'left',
  },

  {
    videoIndex: 3,
    kicker: '04 — Construire demain',
    text: 'Le futur technologique africain sera pensé à partir des réalités africaines.',
    start: 0.08,
    end: 0.28,
    align: 'right',
  },
  {
    videoIndex: 3,
    kicker: 'Créer ici',
    text: 'Des solutions conçues par celles et ceux qui connaissent les défis du continent.',
    start: 0.4,
    end: 0.65,
    align: 'left',
  },
  {
    videoIndex: 3,
    kicker: 'Notre avenir',
    text: 'Une Afrique connectée, durable, créative et profondément humaine.',
    start: 0.74,
    end: 0.92,
    align: 'right',
  },
];

const clamp = (value, minimum = 0, maximum = 1) =>
  Math.max(minimum, Math.min(value, maximum));

function App() {
  const containerRef = useRef(null);
  const videoRefs = useRef([]);
  const storyRefs = useRef([]);

  const heroContentRef = useRef(null);
  const scrollHintRef = useRef(null);
  const progressFillRef = useRef(null);

  const targetProgressRef = useRef(0);
  const smoothProgressRef = useRef(0);

  const durationsRef = useRef(
    VIDEOS.map(() => 0),
  );

  const startTimesRef = useRef(
    VIDEOS.map(() => 0),
  );

  const totalDurationRef = useRef(0);
  const activeVideoRef = useRef(0);

  const rafRef = useRef(null);
  const lastSeekTimeRef = useRef(0);

  const [timelineReady, setTimelineReady] =
    useState(false);

  const [activeVideoIndex, setActiveVideoIndex] =
    useState(0);

  const particles = useMemo(
    () =>
      Array.from({ length: 8 }, (_, index) => ({
        id: index,
        left: Math.random() * 100,
        delay: Math.random() * 8,
        duration: 10 + Math.random() * 8,
        size: 2 + Math.random() * 3,
      })),
    [],
  );

  const calculateTimeline = () => {
    const durations = durationsRef.current;

    if (
      !durations.every(
        (duration) =>
          Number.isFinite(duration) &&
          duration > 0,
      )
    ) {
      return;
    }

    let accumulatedDuration = 0;

    startTimesRef.current = durations.map(
      (duration) => {
        const startTime = accumulatedDuration;
        accumulatedDuration += duration;

        return startTime;
      },
    );

    totalDurationRef.current =
      accumulatedDuration;

    /*
     * La durée totale des vidéos est conservée.
     * Cette valeur modifie seulement la longueur
     * physique du scroll.
     */
    if (containerRef.current) {
      const scrollHeight = Math.max(
        accumulatedDuration * 9,
        600,
      );

      containerRef.current.style.setProperty(
        '--story-height',
        `${scrollHeight}vh`,
      );
    }

    setTimelineReady(true);
  };

  const handleLoadedMetadata = (
    index,
    video,
  ) => {
    const duration = video.duration;

    if (
      !Number.isFinite(duration) ||
      duration <= 0
    ) {
      return;
    }

    video.pause();

    durationsRef.current[index] = duration;

    calculateTimeline();
  };

  const getTimelinePosition = (
    globalProgress,
  ) => {
    const totalDuration =
      totalDurationRef.current;

    if (!totalDuration) {
      return {
        activeIndex: 0,
        localTime: 0,
        localProgress: 0,
      };
    }

    const globalTime =
      clamp(globalProgress) * totalDuration;

    let activeIndex =
      VIDEOS.length - 1;

    for (
      let index = 0;
      index < VIDEOS.length;
      index += 1
    ) {
      const startTime =
        startTimesRef.current[index];

      const endTime =
        startTime +
        durationsRef.current[index];

      if (
        globalTime >= startTime &&
        globalTime < endTime
      ) {
        activeIndex = index;
        break;
      }
    }

    const duration =
      durationsRef.current[activeIndex];

    const localTime = clamp(
      globalTime -
        startTimesRef.current[activeIndex],
      0,
      duration,
    );

    return {
      activeIndex,
      localTime,
      localProgress:
        duration > 0
          ? clamp(localTime / duration)
          : 0,
    };
  };

  useEffect(() => {
    const updateTargetProgress = () => {
      const scrollableHeight =
        document.documentElement.scrollHeight -
        window.innerHeight;

      targetProgressRef.current =
        scrollableHeight > 0
          ? clamp(
              window.scrollY /
                scrollableHeight,
            )
          : 0;
    };

    window.addEventListener(
      'scroll',
      updateTargetProgress,
      {
        passive: true,
      },
    );

    window.addEventListener(
      'resize',
      updateTargetProgress,
    );

    updateTargetProgress();

    return () => {
      window.removeEventListener(
        'scroll',
        updateTargetProgress,
      );

      window.removeEventListener(
        'resize',
        updateTargetProgress,
      );
    };
  }, []);

  const updateStoryCard = (
    story,
    element,
    activeIndex,
    localProgress,
  ) => {
    if (!element) {
      return;
    }

    if (story.videoIndex !== activeIndex) {
      element.style.opacity = '0';
      element.style.visibility = 'hidden';
      element.style.pointerEvents = 'none';

      return;
    }

    const fadeDuration = 0.04;

    let visibility = 0;

    if (
      localProgress >= story.start &&
      localProgress <= story.end
    ) {
      visibility = 1;
    } else if (
      localProgress >=
        story.start - fadeDuration &&
      localProgress < story.start
    ) {
      visibility =
        (localProgress -
          (story.start - fadeDuration)) /
        fadeDuration;
    } else if (
      localProgress > story.end &&
      localProgress <=
        story.end + fadeDuration
    ) {
      visibility =
        1 -
        (localProgress - story.end) /
          fadeDuration;
    }

    visibility = clamp(visibility);

    const direction =
      story.align === 'left' ? -1 : 1;

    const translateX =
      direction * 45 * (1 - visibility);

    const translateY =
      30 * (1 - visibility);

    const scale =
      0.9 + visibility * 0.1;

    element.style.opacity =
      String(visibility);

    element.style.visibility =
      visibility > 0.01
        ? 'visible'
        : 'hidden';

    /*
     * Pas de filter: blur().
     * Le blur dynamique est coûteux pour le GPU.
     */
    element.style.transform = `
      translate3d(
        ${translateX}px,
        ${translateY}px,
        0
      )
      scale(${scale})
    `;
  };

  useEffect(() => {
    if (!timelineReady) {
      return undefined;
    }

    const SMOOTHING = 0.14;

    /*
     * On ne change plus currentTime 60 fois
     * par seconde.
     *
     * 55 ms donne environ 18 seeks par seconde,
     * ce qui est beaucoup plus fluide.
     */
    const SEEK_INTERVAL = 55;

    /*
     * Évite les seeks inutiles pour quelques
     * millisecondes de différence.
     */
    const SEEK_THRESHOLD = 0.045;

    const tick = (timestamp) => {
      const difference =
        targetProgressRef.current -
        smoothProgressRef.current;

      if (Math.abs(difference) < 0.0001) {
        smoothProgressRef.current =
          targetProgressRef.current;
      } else {
        smoothProgressRef.current +=
          difference * SMOOTHING;
      }

      const globalProgress = clamp(
        smoothProgressRef.current,
      );

      const {
        activeIndex,
        localTime,
        localProgress,
      } = getTimelinePosition(
        globalProgress,
      );

      /*
       * React n'est mis à jour que lorsque
       * la vidéo active change.
       */
      if (
        activeIndex !==
        activeVideoRef.current
      ) {
        activeVideoRef.current =
          activeIndex;

        setActiveVideoIndex(
          activeIndex,
        );
      }

      /*
       * Mise à jour directe de l'opacité.
       * Aucun rerender React à chaque frame.
       */
      videoRefs.current.forEach(
        (video, index) => {
          if (!video) {
            return;
          }

          video.style.opacity =
            index === activeIndex
              ? '1'
              : '0';

          video.style.zIndex =
            index === activeIndex
              ? '2'
              : '1';

          video.pause();
        },
      );

      const activeVideo =
        videoRefs.current[activeIndex];

      /*
       * Seek limité à environ 18 fois par seconde.
       */
      if (
        activeVideo &&
        timestamp -
          lastSeekTimeRef.current >=
          SEEK_INTERVAL &&
        !activeVideo.seeking
      ) {
        const differenceInSeconds =
          Math.abs(
            activeVideo.currentTime -
              localTime,
          );

        if (
          differenceInSeconds >
          SEEK_THRESHOLD
        ) {
          /*
           * fastSeek est utilisé seulement pour
           * les grands déplacements.
           */
          if (
            differenceInSeconds > 1 &&
            typeof activeVideo.fastSeek ===
              'function'
          ) {
            activeVideo.fastSeek(localTime);
          } else {
            activeVideo.currentTime =
              localTime;
          }

          lastSeekTimeRef.current =
            timestamp;
        }
      }

      /*
       * Animation du grand titre.
       */
      if (heroContentRef.current) {
        const introExit =
          activeIndex === 0
            ? clamp(
                (localProgress - 0.01) /
                  0.09,
              )
            : 1;

        heroContentRef.current.style.opacity =
          String(1 - introExit);

        heroContentRef.current.style.transform = `
          translate3d(
            0,
            ${-35 * introExit}px,
            0
          )
          scale(${
            1 - introExit * 0.04
          })
        `;

        heroContentRef.current.style.visibility =
          introExit >= 0.99
            ? 'hidden'
            : 'visible';
      }

      /*
       * Animation des textes sans setState().
       */
      STORY_TEXTS.forEach(
        (story, index) => {
          updateStoryCard(
            story,
            storyRefs.current[index],
            activeIndex,
            localProgress,
          );
        },
      );

      if (progressFillRef.current) {
        /*
         * transform est plus performant
         * qu'une modification de width.
         */
        progressFillRef.current.style.transform =
          `scaleX(${globalProgress})`;
      }

      if (scrollHintRef.current) {
        scrollHintRef.current.style.opacity =
          String(
            clamp(
              1 - globalProgress * 12,
            ),
          );
      }

      rafRef.current =
        requestAnimationFrame(tick);
    };

    rafRef.current =
      requestAnimationFrame(tick);

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(
          rafRef.current,
        );
      }
    };
  }, [timelineReady]);

return (
  <>
  <main
    ref={containerRef}
    className="landing-container"
  >
    <section className="hero-section">
        <div className="video-stack">
          {VIDEOS.map(
            (videoItem, index) => (
              <video
                key={videoItem.src}
                ref={(element) => {
                  videoRefs.current[index] =
                    element;
                }}
                src={videoItem.src}
                muted
                playsInline
                preload={
                  index ===
                    activeVideoIndex ||
                  index ===
                    activeVideoIndex + 1
                    ? 'auto'
                    : 'metadata'
                }
                className="bg-video"
                aria-hidden="true"
                onLoadedMetadata={(
                  event,
                ) =>
                  handleLoadedMetadata(
                    index,
                    event.currentTarget,
                  )
                }
              />
            ),
          )}
        </div>

        <div
          className={`video-loader ${
            timelineReady
              ? 'is-hidden'
              : ''
          }`}
        >
          <div className="loader-ring" />

          <span>
            Préparation du voyage
          </span>
        </div>

        <div className="overlay-vignette" />
        <div className="overlay-gradient" />

        <div className="particles">
          {particles.map(
            (particle) => (
              <span
                key={particle.id}
                className="particle"
                style={{
                  left: `${particle.left}%`,
                  width: `${particle.size}px`,
                  height: `${particle.size}px`,
                  animationDelay: `${particle.delay}s`,
                  animationDuration: `${particle.duration}s`,
                }}
              />
            ),
          )}
        </div>

        <div className="journey-navigation">
          {VIDEOS.map(
            (videoItem, index) => (
              <div
                key={videoItem.label}
                className={`journey-step ${
                  index ===
                  activeVideoIndex
                    ? 'is-active'
                    : ''
                } ${
                  index <
                  activeVideoIndex
                    ? 'is-complete'
                    : ''
                }`}
              >
                <span className="journey-dot" />

                <span className="journey-label">
                  {videoItem.label}
                </span>
              </div>
            ),
          )}
        </div>

        <div
          ref={heroContentRef}
          className="hero-content"
        >
          <p className="hero-kicker">
            Afrique · Intelligence · Innovation
          </p>

          <h1 className="hero-title">
            <span>L’Afrique</span>
            <span>imagine demain</span>
          </h1>

          <p className="hero-subtitle">
            Un voyage des racines
            ancestrales vers une
            intelligence artificielle
            locale, accessible et humaine.
          </p>
        </div>

        <div className="phrases-container">
          {STORY_TEXTS.map(
            (story, index) => (
              <article
                key={`${story.videoIndex}-${index}`}
                ref={(element) => {
                  storyRefs.current[index] =
                    element;
                }}
                className={`phrase-anchor ${story.align}`}
              >
                <div className="phrase-card">
                  <span className="phrase-kicker">
                    {story.kicker}
                  </span>

                  <p className="phrase-text">
                    {story.text}
                  </p>

                  <div className="phrase-line" />
                </div>
              </article>
            ),
          )}
        </div>

        <div
          ref={scrollHintRef}
          className="scroll-hint"
        >
          <div className="mouse">
            <div className="wheel" />
          </div>

          <span>
            Faites défiler pour voyager
          </span>
        </div>

        <div className="progress-bar">
          <div
            ref={progressFillRef}
            className="progress-fill"
          />
        </div>
      </section>
    </main>
    <SolutionsHub/>
    </>
  );
}

export default App;