// FeaturesPage.jsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import './FeaturesPage.css';

/* ===== Icônes en ligne (SVG), couleur héritée via currentColor ===== */
const IconMap = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
        <path d="M9 20l-6-3V4l6 3 6-3 6 3v13l-6-3-6 3z" strokeLinejoin="round" />
        <path d="M9 7v13M15 4v13" />
    </svg>
);

const IconStats = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
        <path d="M4 20V10M12 20V4M20 20v-7" strokeLinecap="round" />
        <path d="M4 20h16" strokeLinecap="round" />
    </svg>
);

const IconNature = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
        <path d="M12 3c3 3 5 6 5 9a5 5 0 0 1-10 0c0-3 2-6 5-9z" strokeLinejoin="round" />
        <path d="M12 12v9" strokeLinecap="round" />
    </svg>
);

const IconCompass = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
        <circle cx="12" cy="12" r="9" />
        <path d="M14.5 9.5l-2 5-5 2 2-5 5-2z" strokeLinejoin="round" />
    </svg>
);

const IconShield = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
        <path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3z" strokeLinejoin="round" />
    </svg>
);

const IconDownload = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
        <path d="M12 3v12m0 0l-4-4m4 4l4-4" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M5 19h14" strokeLinecap="round" />
    </svg>
);

/* ===== Données par onglet ===== */
const TABS = ['Capacités', 'Performance', 'Sécurité', 'Téléchargement'];

const CONTENT = {
    Capacités: [
        {
            title: 'Géolocalisation immersive',
            text: "Repère-toi en temps réel sur la carte et navigue naturellement d'une zone à l'autre pendant ton aventure.",
            Icon: IconMap,
            color: '#3FBFA8',
        },
        {
            title: 'Suivi & statistiques',
            text: 'Visualise ta progression, ta distance parcourue et tes performances au fil de tes explorations.',
            Icon: IconStats,
            color: '#F0A63B',
        },
        {
            title: 'Exploration nature',
            text: "Découvre des zones sauvages, des points d'intérêt et la faune locale à mesure que tu avances.",
            Icon: IconNature,
            color: '#8FBF5C',
        },
    ],
    Performance: [
        {
            title: 'Navigation fluide',
            text: 'Un rendu optimisé et réactif, même sur de grandes zones ouvertes.',
            Icon: IconCompass,
            color: '#C77DB0',
        },
        {
            title: 'Chargement rapide',
            text: 'Les cartes et données se chargent en arrière-plan sans interrompre ton exploration.',
            Icon: IconStats,
            color: '#F0A63B',
        },
        {
            title: 'Faible consommation',
            text: 'Pensé pour tenir toute une aventure, même en mobilité prolongée.',
            Icon: IconMap,
            color: '#3FBFA8',
        },
    ],
    Sécurité: [
        {
            title: 'Zones sécurisées',
            text: "Des alertes t'informent si tu t'approches d'une zone à risque ou hors sentier.",
            Icon: IconShield,
            color: '#8FBF5C',
        },
        {
            title: 'Partage de position',
            text: 'Partage ta localisation en temps réel avec un proche pendant ta sortie.',
            Icon: IconMap,
            color: '#3FBFA8',
        },
        {
            title: 'Mode hors-ligne',
            text: 'Garde un accès aux cartes essentielles même sans connexion.',
            Icon: IconCompass,
            color: '#C77DB0',
        },
    ],
    Téléchargement: [
        {
            title: 'Disponible partout',
            text: 'Sur iOS, Android et navigateur, avec synchronisation de ton compte.',
            Icon: IconDownload,
            color: '#F0A63B',
        },
        {
            title: 'Mises à jour régulières',
            text: 'De nouvelles zones et fonctionnalités ajoutées en continu.',
            Icon: IconStats,
            color: '#3FBFA8',
        },
        {
            title: 'Léger et rapide',
            text: "Une installation en quelques secondes, sans espace inutile.",
            Icon: IconShield,
            color: '#8FBF5C',
        },
    ],
};

function FeatureCard({ title, text, Icon, color }) {
    return (
        <div className="feature-card" style={{ '--icon-color': color }}>
            <div className="feature-icon-box">
                <Icon />
            </div>
            <h3 className="feature-title">{title}</h3>
            <p className="feature-text">{text}</p>
        </div>
    );
}

function FeaturesPage() {
    const [activeTab, setActiveTab] = useState(TABS[0]);

    return (
        <div className="features-page">
            <div className="features-parallax-layer">
                <span className="deco-leaf leaf-1" />
                <span className="deco-leaf leaf-2" />
                <span className="deco-leaf leaf-3" />
            </div>

            <Link to="/" className="features-back-nav">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M19 12H5M12 19l-7-7 7-7" />
                </svg>
                <span>Retour à l'accueil</span>
            </Link>

            <div className="features-header-row">
                <h1 className="features-title-inline">Fonctionnalités</h1>

                <div className="features-tabs">
                    {TABS.map((tab) => (
                        <button
                            key={tab}
                            className={`features-tab ${tab === activeTab ? 'active' : ''}`}
                            onClick={() => setActiveTab(tab)}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
            </div>

            <div className="features-grid">
                {CONTENT[activeTab].map((feature) => (
                    <FeatureCard key={feature.title} {...feature} />
                ))}
            </div>
        </div>
    );
}

export default FeaturesPage;