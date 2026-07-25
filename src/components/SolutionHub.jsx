import { useState } from 'react';
import { solutionGroups } from '../data/solution';
import '../components/SolutionHub.css'


function SolutionsHub() {
  const [activeGroupId, setActiveGroupId] = useState(
    solutionGroups[0].id,
  );

  const [activeFeature, setActiveFeature] = useState(null);
  const [showResult, setShowResult] = useState(false);

  const activeGroup = solutionGroups.find(
    (group) => group.id === activeGroupId,
  );

  const selectGroup = (groupId) => {
    setActiveGroupId(groupId);
    setActiveFeature(null);
    setShowResult(false);
  };

  const openFeature = (feature) => {
    setActiveFeature(feature);
    setShowResult(false);
  };

  const launchDemo = () => {
    setShowResult(false);

    // Simulation d'un traitement par l'IA.
    window.setTimeout(() => {
      setShowResult(true);
    }, 700);
  };

  return (
    <section id="solutions" className="solutions-section">
      <div className="solutions-heading">
        <span className="solutions-eyebrow">
          Une intelligence locale pour un impact réel
        </span>

        <h2>Explorez nos solutions</h2>

        <p>
          Choisissez un domaine et découvrez comment la
          technologie peut répondre aux réalités africaines.
        </p>
      </div>

      <div className="solution-tabs">
        {solutionGroups.map((group) => (
          <button
            key={group.id}
            type="button"
            className={`solution-tab ${
              activeGroupId === group.id ? 'active' : ''
            }`}
            onClick={() => selectGroup(group.id)}
          >
            <span className="tab-icon">{group.icon}</span>

            <span>
              <small>{group.number}</small>
              {group.title}
            </span>
          </button>
        ))}
      </div>

      <div className="active-group-heading">
        <div>
          <span>{activeGroup.number}</span>
          <h3>{activeGroup.title}</h3>
        </div>

        <p>{activeGroup.subtitle}</p>
      </div>

      <div className="feature-grid">
        {activeGroup.features.map((feature) => (
          <button
            type="button"
            key={feature.id}
            className="feature-card"
            onClick={() => openFeature(feature)}
          >
            <span className="feature-icon">
              {feature.icon}
            </span>

            <h4>{feature.title}</h4>

            <p>{feature.description}</p>

            <span className="feature-link">
              Découvrir
              <span aria-hidden="true">→</span>
            </span>
          </button>
        ))}
      </div>

      {activeFeature && (
        <div className="demo-panel">
          <button
            type="button"
            className="demo-close"
            onClick={() => {
              setActiveFeature(null);
              setShowResult(false);
            }}
            aria-label="Fermer"
          >
            ×
          </button>

          <div className="demo-information">
            <span className="feature-icon large">
              {activeFeature.icon}
            </span>

            <div>
              <span className="demo-label">
                Démonstration
              </span>

              <h3>{activeFeature.title}</h3>

              <p>{activeFeature.description}</p>
            </div>
          </div>

          <div className="demo-form">
            <label htmlFor="demo-request">
              Décrivez votre besoin
            </label>

            <textarea
              id="demo-request"
              placeholder="Exemple : je dispose d'un budget de 2 000 000 MGA et je souhaite commencer un petit élevage..."
            />

            <button
              type="button"
              className="demo-button"
              onClick={launchDemo}
            >
              {activeFeature.action}
            </button>
          </div>

          {showResult && (
            <div className="demo-result">
              <span className="result-status">
                Analyse terminée
              </span>

              <h4>{activeFeature.result.title}</h4>

              <ul>
                {activeFeature.result.lines.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>

              <p className="mock-notice">
                Résultat simulé pour la démonstration.
              </p>
            </div>
          )}
        </div>
      )}
    </section>
  );
}

export default SolutionsHub;