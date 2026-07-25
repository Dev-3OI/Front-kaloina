// ProblemsSection.jsx
//
// Section "PROBLÈMES" à insérer entre <section className="parallax-section">
// et <div className="globe-scroll-wrap"> dans App.jsx.
//
// Principe général : identique à ta section globe. Une div "wrap" de
// plusieurs hauteurs d'écran (400vh) contient une section "sticky" plein
// écran. Pendant qu'on scroll à l'intérieur du wrap, on calcule un
// progress 0→1 qui pilote :
//   - la photo de la sécheresse (héros), plein écran au départ, qui se
//     rétracte vers le centre pour devenir la pièce centrale du collage.
//   - les 4 autres photos, qui arrivent une par une aux 4 coins en 3D
//     (elles émergent inclinées puis se redressent en douceur) pour
//     former le collage, chacune avec sa légende.
//   - deux calques décoratifs (feuilles + points dorés) en parallaxe,
//     comme dans la section précédente, pour garder la même ambiance.
//
// ===== Copie tes 5 images dans src/assets/problems/ (mêmes noms que
//       tes fichiers uploadés, ou adapte les imports ci-dessous) =====

import { useEffect, useRef, useState } from 'react';

import './ProblemsSection.css';
import secheresseImg from './assets/problems/secheresse.jpg';
import agricoleImg from './assets/problems/Madagascar.jpg';
import faimImg from './assets/problems/faim.jpg';
import routesImg from './assets/problems/routes.jpg';
import slashBurnImg from './assets/problems/Slash_and_Burn_Agriculture_Morondava_Madagascar.jpg';

// Les 4 photos qui viennent former le collage autour de la photo héros.
// `corner` définit leur position finale ET le sens de leur inclinaison 3D
// (chaque coin s'incline "vers l'extérieur"), `start` la fraction du
// scroll à partir de laquelle elles commencent à apparaître.

// Image principale
const COLLAGE_ITEMS = [
    {
        img: agricoleImg,
        alt: 'Dégradation des sols',
        index: '01',
        title: 'Des sols qui s’appauvrissent',
        text: "La dégradation des sols réduit leur fertilité et limite durablement les rendements agricoles.",
        corner: 'top-left',
        start: 0.16,
    },
    {
        img: faimImg,
        alt: 'Insécurité alimentaire',
        index: '02',
        title: 'L’insécurité alimentaire',
        text: "Des récoltes insuffisantes fragilisent la sécurité alimentaire de nombreuses communautés.",
        corner: 'top-right',
        start: 0.32,
    },
    {
        img: routesImg,
        alt: 'Enclavement des zones rurales',
        index: '03',
        title: 'L’enclavement rural',
        text: "Des infrastructures limitées compliquent l’accès aux marchés, aux services et aux opportunités.",
        corner: 'bottom-left',
        start: 0.48,
    },
    {
        img: slashBurnImg,
        alt: 'Déforestation',
        index: '04',
        title: 'La déforestation',
        text: "La culture sur brûlis accélère la disparition des forêts et fragilise les écosystèmes.",
        corner: 'bottom-right',
        start: 0.64,
    },
];
// Inclinaison 3D "au repos" (une fois la photo bien installée) pour chaque
// coin : chaque photo penche légèrement vers l'extérieur, comme posée sur
// une table — et pas totalement à plat, pour garder un vrai effet 3D en
// permanence, pas seulement pendant l'apparition.
const CORNER_TILT = {
    'top-left': { restRX: 4, restRY: 10 },
    'top-right': { restRX: 4, restRY: -10 },
    'bottom-left': { restRX: -4, restRY: 10 },
    'bottom-right': { restRX: -4, restRY: -10 },
};

const FADE = 0.16; // durée (en fraction de scroll) de l'apparition de chaque photo
const HERO_SHRINK_END = 0.22; // fraction à laquelle la photo héros a fini de se rétracter

// easeOutCubic : démarre vite, ralentit en approchant de la position finale
const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

function ProblemsSection() {
    const wrapRef = useRef(null);
    const sectionRef = useRef(null);
    const [progress, setProgress] = useState(0);
    const [parallaxOffset, setParallaxOffset] = useState(0);

    // Progression du scroll à l'intérieur du wrap (0 → 1), pilote le collage.
    useEffect(() => {
        let raf = null;

        const update = () => {
            const el = wrapRef.current;
            if (el) {
                const rect = el.getBoundingClientRect();
                const vh = window.innerHeight;
                const total = rect.height - vh;
                const scrolled = -rect.top;
                const p = total > 0 ? Math.max(0, Math.min(scrolled / total, 1)) : 0;
                setProgress(p);
            }
            raf = requestAnimationFrame(update);
        };

        raf = requestAnimationFrame(update);
        return () => cancelAnimationFrame(raf);
    }, []);

    // Parallaxe décorative des calques d'arrière-plan (feuilles + points),
    // même principe que la section parallaxe précédente : distance entre le
    // centre de la section et le centre de l'écran → chaque calque se
    // déplace à une vitesse différente proportionnelle à cette distance.
    useEffect(() => {
        let raf = null;

        const updateParallax = () => {
            const el = sectionRef.current;
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

    // ----- Photo héros (sécheresse) : plein écran au début, puis se
    // rétracte vers le centre du collage -----
    const heroShrinkT = Math.min(progress / HERO_SHRINK_END, 1);
    const heroEased = easeOutCubic(heroShrinkT);
    // Le scale final (0.46) laisse 27% de marge de chaque côté autour de la
    // photo centrale — assez pour que les 4 coins (20% x 20%, décalés de 5%
    // du bord, donc bord extérieur à 25%) ne la touchent jamais.
    const heroScale = 1 - heroEased * 0.62; // 1 (plein écran) → 0.46 (centre du collage)
    const heroRadius = heroEased * 32; // 0px (plein écran) → 32px
    const heroBrightness = 1 - heroEased * 0.22;

    // ----- Titre d'intro : visible seulement au tout début -----
    const headingOpacity = Math.max(0, 1 - progress / 0.14);

    // ----- Style 3D de chaque photo du collage : émerge inclinée et de
    // profil, grandit, puis se redresse en douceur vers son inclinaison de
    // repos (jamais totalement à plat → effet 3D permanent) -----
    const getItemStyle = (start, corner) => {
        const t = Math.max(0, Math.min((progress - start) / FADE, 1));
        const eased = easeOutCubic(t);
        const { restRX, restRY } = CORNER_TILT[corner];

        // Au départ (eased=0) : inclinaison ~3x plus marquée que le repos.
        // À l'arrivée (eased=1) : inclinaison de repos (restRX / restRY).
        const rotateX = restRX + (1 - eased) * (restRX * 2.5);
        const rotateY = restRY + (1 - eased) * (restRY * 1.6);
        const translateZ = -160 + eased * 160;
        const scale = 0.78 + eased * 0.22;
        const translateY = (1 - eased) * 34;

        return {
            opacity: eased,
            transform: `translateZ(${translateZ}px) translateY(${translateY}px) scale(${scale}) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
            pointerEvents: eased > 0.6 ? 'auto' : 'none',
        };
    };

    // Le sous-titre final apparaît quand le collage est presque complet
    const outroOpacity = Math.max(0, Math.min((progress - 0.82) / 0.14, 1));

    return (
        <div className="problems-wrap" ref={wrapRef}>
            <section className="problems-section" ref={sectionRef}>
                {/* Calques décoratifs en parallaxe, même esprit que la section précédente */}
                <div
                    className="problems-parallax-layer layer-back"
                    style={{ transform: `translateY(${parallaxOffset * 0.1}px)` }}
                >
                    <span className="deco-leaf leaf-1" />
                    <span className="deco-leaf leaf-2" />
                </div>
                <div
                    className="problems-parallax-layer layer-mid"
                    style={{ transform: `translateY(${parallaxOffset * 0.22}px)` }}
                >
                    <span className="deco-dot dot-1" />
                    <span className="deco-dot dot-2" />
                    <span className="deco-dot dot-3" />
                </div>

                <div className="problems-heading" style={{ opacity: headingOpacity }}>
                    <span className="parallax-eyebrow">Les défis de notre agriculture</span>
                    <h2 className="parallax-title">Une réalité qui appelle des solutions durables</h2>
                </div>

                <div className="collage-stage">
                    <div
                        className="collage-hero"
                        style={{
                            transform: `scale(${heroScale})`,
                            borderRadius: `${heroRadius}px`,
                            filter: `brightness(${heroBrightness})`,
                        }}
                    >
                        <img src={secheresseImg} alt="Sécheresse et terres craquelées à Madagascar" />
                        <div className="collage-hero-caption" style={{ opacity: heroEased }}>
                            <span className="problem-index">00</span>
                            <h3>La sécheresse craquelle la terre</h3>
                            <p>Des rizières entières transformées en désert d'argile fissurée.</p>
                        </div>
                    </div>

                    {COLLAGE_ITEMS.map((item) => (
                        <div
                            key={item.index}
                            className={`collage-item corner-${item.corner}`}
                            style={getItemStyle(item.start, item.corner)}
                        >
                            <img src={item.img} alt={item.alt} />
                            <div className="collage-item-caption">
                                <span className="problem-index">{item.index}</span>
                                <h3>{item.title}</h3>
                                <p>{item.text}</p>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="problems-outro" style={{ opacity: outroOpacity }}>
                    <p>Cinq visages d'une même urgence.</p>
                </div>
            </section>
        </div>
    );
}

export default ProblemsSection;