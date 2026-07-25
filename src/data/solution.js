export const solutionGroups = [
  {
    id: 'smart-city',
    number: '01',
    icon: '🏙️',
    title: 'Ville intelligente',
    subtitle: 'Planifier des villes plus accessibles, sûres et équilibrées.',
    features: [
      {
        id: 'traffic',
        icon: '🚦',
        title: 'Planification urbaine',
        description:
          'Analyser une zone et proposer des solutions pour réduire les embouteillages.',
        action: 'Analyser une zone',
        result: {
          title: 'Plan proposé',
          lines: [
            'Créer une voie réservée aux transports publics.',
            'Modifier le cycle des feux entre 7 h et 9 h.',
            'Ajouter une route secondaire vers le quartier Est.',
            'Créer deux zones de stationnement périphériques.',
          ],
        },
      },
      {
        id: 'security',
        icon: '🛡️',
        title: 'Sécurité communautaire',
        description:
          'Identifier les zones sensibles et proposer des itinéraires plus sûrs.',
        action: 'Afficher les zones',
        result: {
          title: 'Analyse de sécurité',
          lines: [
            'Trois zones nécessitent un meilleur éclairage.',
            'Une zone présente un manque de présence communautaire.',
            'Un itinéraire alternatif plus sûr a été identifié.',
          ],
        },
      },
      {
        id: 'resources',
        icon: '📍',
        title: 'Décentralisation des ressources',
        description:
          'Afficher les écoles, centres de santé, marchés et services disponibles.',
        action: 'Voir les ressources',
        result: {
          title: 'Ressources disponibles',
          lines: [
            'Centre de santé : 2,4 km.',
            'École publique : 1,1 km.',
            'Point d’eau : 700 mètres.',
            'Marché local : 1,8 km.',
          ],
        },
      },
    ],
  },

  {
    id: 'africa-connect',
    number: '02',
    icon: '🌍',
    title: 'Afrique connectée',
    subtitle: 'Connecter les communautés au-delà des barrières linguistiques.',
    features: [
      {
        id: 'local-news',
        icon: '📰',
        title: 'Actualités dans votre langue',
        description:
          'Résumer et adapter les actualités dans la langue choisie.',
        action: 'Générer les actualités',
        result: {
          title: 'Résumé local',
          lines: [
            'Actualités adaptées à votre région.',
            'Résumé dans une langue simple.',
            'Informations importantes mises en évidence.',
          ],
        },
      },
      {
        id: 'language-bridge',
        icon: '🗣️',
        title: 'Africa Language Bridge',
        description:
          'Traduire et adapter un message dans plusieurs langues africaines.',
        action: 'Traduire un message',
        result: {
          title: 'Message adapté',
          lines: [
            'Version française générée.',
            'Version malgache générée.',
            'Version swahilie générée.',
            'Le contexte culturel a été préservé.',
          ],
        },
      },
      {
        id: 'community',
        icon: '💬',
        title: 'Communauté africaine',
        description:
          'Un espace d’entraide, de discussion et de partage de ressources.',
        action: 'Ouvrir la communauté',
        result: {
          title: 'Discussions populaires',
          lines: [
            'Agriculture durable : 146 membres.',
            'Entrepreneuriat local : 98 membres.',
            'Technologie et formation : 213 membres.',
          ],
        },
      },
    ],
  },

  {
    id: 'smart-market',
    number: '03',
    icon: '📊',
    title: 'Marché intelligent',
    subtitle: 'Comparer les prix, les frais et les opportunités commerciales.',
    features: [
      {
        id: 'price-advisor',
        icon: '📉',
        title: 'Conseiller contre la hausse des prix',
        description:
          'Analyser une hausse de prix et proposer des alternatives.',
        action: 'Analyser un prix',
        result: {
          title: 'Solutions proposées',
          lines: [
            'Comparer avec trois fournisseurs locaux.',
            'Acheter en groupe pour réduire les coûts.',
            'Privilégier un produit local équivalent.',
          ],
        },
      },
      {
        id: 'import-calculator',
        icon: '🧮',
        title: 'Calculateur d’importation',
        description:
          'Estimer les frais liés à l’importation vers un pays africain.',
        action: 'Calculer les frais',
        result: {
          title: 'Estimation',
          lines: [
            'Prix du produit : 120 000 MGA.',
            'Transport estimé : 28 000 MGA.',
            'Taxes estimées : 19 000 MGA.',
            'Coût total estimé : 167 000 MGA.',
          ],
        },
      },
      {
        id: 'product-search',
        icon: '🔎',
        title: 'Comparateur de produits',
        description:
          'Rechercher le meilleur produit au prix le plus avantageux.',
        action: 'Comparer les produits',
        result: {
          title: 'Meilleure offre',
          lines: [
            'Produit A : meilleur prix.',
            'Produit B : livraison la plus rapide.',
            'Produit C : meilleure note des utilisateurs.',
          ],
        },
      },
    ],
  },

  {
    id: 'agri-business',
    number: '04',
    icon: '🌱',
    title: 'Agriculture et entrepreneuriat',
    subtitle: 'Transformer une idée locale en activité rentable.',
    features: [
      {
        id: 'farm-profit',
        icon: '🐔',
        title: 'Rentabilité agricole',
        description:
          'Comparer plusieurs cultures ou élevages selon le budget disponible.',
        action: 'Calculer la rentabilité',
        result: {
          title: 'Recommandation',
          lines: [
            'Élevage de poules pondeuses : rentabilité élevée.',
            'Investissement initial estimé : 1 800 000 MGA.',
            'Retour sur investissement estimé : 11 mois.',
          ],
        },
      },
      {
        id: 'business-generator',
        icon: '💼',
        title: 'Générateur de business model',
        description:
          'Créer un plan simple pour une activité d’achat et de revente.',
        action: 'Créer un business model',
        result: {
          title: 'Business model proposé',
          lines: [
            'Client cible : jeunes actifs urbains.',
            'Canal principal : réseaux sociaux et livraison.',
            'Marge recommandée : entre 20 % et 30 %.',
            'Premier test : vendre 30 unités sur 14 jours.',
          ],
        },
      },
    ],
  },
];