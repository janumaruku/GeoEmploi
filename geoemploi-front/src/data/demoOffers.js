const offers = [
  {
    id: 'paris-front-end', title: 'Développeur Front-End', company: 'Atelier Numérique Seine',
    address: '12 rue Réaumur, 75003 Paris', latitude: 48.8655, longitude: 2.3576,
    description: 'Vous développerez des interfaces web accessibles et responsives au sein d’une équipe produit pluridisciplinaire. Vous participerez aux revues de code et à l’amélioration continue des composants React. Une bonne maîtrise de JavaScript, HTML et CSS ainsi qu’un goût pour le travail en équipe sont recherchés.',
  },
  {
    id: 'paris-support', title: 'Technicien Support Informatique', company: 'Hexagone Services',
    address: '24 avenue de Clichy, 75018 Paris', latitude: 48.8872, longitude: 2.3261,
    description: 'Vous accompagnerez les collaborateurs dans la résolution de leurs incidents matériels et logiciels. Vous préparerez les postes de travail et assurerez le suivi des demandes dans l’outil de support. Le poste demande de la pédagogie, de la rigueur et de bonnes bases en environnement Windows.',
  },
  {
    id: 'paris-data', title: 'Data Analyst Junior', company: 'ClairVue Conseil',
    address: '8 rue de Londres, 75009 Paris', latitude: 48.8765, longitude: 2.3294,
    description: 'Vous préparerez et analyserez les données nécessaires au pilotage des activités de nos clients. Vous réaliserez des tableaux de bord simples et présenterez vos conclusions aux équipes métiers. Une première pratique de SQL, d’un outil de visualisation et des qualités de synthèse sont attendues.',
  },
  {
    id: 'paris-admin', title: 'Assistant administratif', company: 'Bureau Central Paris',
    address: '31 boulevard Diderot, 75012 Paris', latitude: 48.8467, longitude: 2.3782,
    description: 'Vous assurerez le suivi des dossiers, la préparation des documents et l’organisation des rendez-vous. Vous serez en contact avec les partenaires et contribuerez au bon fonctionnement quotidien du service. Une expression écrite soignée et une bonne maîtrise des outils bureautiques sont indispensables.',
  },
  {
    id: 'paris-communication', title: 'Chargé de communication', company: 'Studio Rive Gauche',
    address: '18 rue Monge, 75005 Paris', latitude: 48.8479, longitude: 2.3518,
    description: 'Vous participerez à la création des contenus éditoriaux et à l’animation des réseaux sociaux de l’agence. Vous coordonnerez le calendrier de publication avec les équipes créatives et les chefs de projet. Nous recherchons une personne organisée, curieuse et à l’aise avec la rédaction numérique.',
  },
  {
    id: 'paris-comptable', title: 'Comptable junior', company: 'Fiduciaire Montparnasse',
    address: '42 rue de Rennes, 75006 Paris', latitude: 48.8517, longitude: 2.3307,
    description: 'Vous prendrez en charge la saisie comptable, le rapprochement bancaire et la préparation des pièces de clôture. Vous travaillerez avec un responsable de portefeuille qui vous accompagnera dans votre progression. Une formation en comptabilité et un bon sens de l’organisation sont demandés.',
  },
  {
    id: 'paris-projet', title: 'Chef de projet digital', company: 'Passerelle Créative',
    address: '15 rue du Faubourg Saint-Antoine, 75011 Paris', latitude: 48.8535, longitude: 2.3728,
    description: 'Vous coordonnerez des projets web depuis la définition du besoin jusqu’à leur mise en ligne. Vous organiserez les échanges entre les clients, les designers et les développeurs en veillant au respect du planning. Une première expérience de gestion de projet et un excellent relationnel sont souhaités.',
  },
  {
    id: 'paris-vente', title: 'Vendeur conseil', company: 'Maison Belleville',
    address: '67 rue de Belleville, 75019 Paris', latitude: 48.8758, longitude: 2.3863,
    description: 'Vous accueillerez les clients, identifierez leurs besoins et les conseillerez dans leurs achats. Vous participerez à la mise en valeur des produits et au suivi des stocks du magasin. Le sens du service, l’écoute et l’envie de travailler en équipe sont essentiels pour ce poste.',
  },
  {
    id: 'marseille-web', title: 'Développeur Web', company: 'Calanque Digitale',
    address: '10 rue de la République, 13001 Marseille', latitude: 43.2986, longitude: 5.3741,
    description: 'Vous réaliserez des sites et applications web pour des entreprises de la région. Vous contribuerez aux choix techniques, aux tests et à la maintenance des projets livrés. Nous recherchons une bonne connaissance de JavaScript et une personne attentive à la qualité du code.',
  },
  {
    id: 'marseille-commercial', title: 'Assistant commercial', company: 'Provence Solutions',
    address: '22 boulevard Charles Livon, 13007 Marseille', latitude: 43.2912, longitude: 5.3598,
    description: 'Vous préparerez les propositions commerciales et assurerez le suivi administratif des commandes. Vous répondrez aux demandes des clients et mettrez à jour les informations dans le logiciel de gestion. Une bonne organisation, de l’aisance téléphonique et un esprit d’équipe sont attendus.',
  },
  {
    id: 'marseille-tech', title: 'Technicien informatique', company: 'Méditerranée Systèmes',
    address: '45 avenue du Prado, 13006 Marseille', latitude: 43.2848, longitude: 5.3825,
    description: 'Vous installerez et maintiendrez les équipements informatiques chez nos clients professionnels. Vous diagnostiquerez les incidents courants et rédigerez des comptes rendus d’intervention clairs. Le poste convient à une personne autonome possédant de bonnes bases en réseaux et systèmes.',
  },
  {
    id: 'marseille-clientele', title: 'Chargé de clientèle', company: 'Comptoir du Vieux-Port',
    address: '6 quai du Port, 13002 Marseille', latitude: 43.2969, longitude: 5.3697,
    description: 'Vous accueillerez et accompagnerez les clients dans le suivi de leurs demandes. Vous proposerez des solutions adaptées et assurerez la transmission des dossiers aux services concernés. Nous recherchons une personne dynamique, fiable et dotée d’un excellent sens du contact.',
  },
]

const details = {
  'paris-front-end': {
    contract: 'CDI',
    missions: ['Développer et maintenir les interfaces React du produit.', 'Transformer les maquettes en pages accessibles et responsives.', 'Participer aux revues de code et aux tests avant mise en ligne.'],
    profile: 'Vous maîtrisez JavaScript, HTML et CSS et connaissez les bases de React. Vous êtes rigoureux, curieux et appréciez le travail en équipe.',
  },
  'paris-support': {
    contract: 'CDI',
    missions: ['Diagnostiquer les incidents matériels et logiciels des utilisateurs.', 'Installer et préparer les postes de travail et leurs périphériques.', 'Documenter les interventions et suivre les demandes jusqu’à leur résolution.'],
    profile: 'Vous possédez de bonnes bases en environnement Windows et en réseau. Votre pédagogie, votre patience et votre sens du service feront la différence.',
  },
  'paris-data': {
    contract: 'CDD · 12 mois',
    missions: ['Nettoyer et structurer les données issues des outils métiers.', 'Créer des tableaux de bord clairs pour suivre les indicateurs.', 'Présenter les analyses et les principaux enseignements aux équipes.'],
    profile: 'Vous avez une première pratique de SQL et d’un outil de visualisation de données. Vous aimez comprendre les chiffres et savez expliquer simplement vos conclusions.',
  },
  'paris-admin': {
    contract: 'CDD · 8 mois',
    missions: ['Préparer, classer et mettre à jour les dossiers administratifs.', 'Organiser les rendez-vous et assurer le suivi des échéances.', 'Répondre aux sollicitations des partenaires par téléphone et par e-mail.'],
    profile: 'Vous maîtrisez les outils bureautiques et possédez une expression écrite soignée. Vous êtes organisé, fiable et à l’aise dans les échanges professionnels.',
  },
  'paris-communication': {
    contract: 'CDI',
    missions: ['Rédiger des contenus pour le site et les réseaux sociaux.', 'Préparer le calendrier éditorial avec les équipes créatives.', 'Suivre les résultats des publications et proposer des améliorations.'],
    profile: 'Vous aimez écrire et connaissez les usages des principaux réseaux sociaux. Créativité, autonomie et sens de l’organisation sont attendus.',
  },
  'paris-comptable': {
    contract: 'CDI',
    missions: ['Saisir et contrôler les pièces comptables courantes.', 'Effectuer les rapprochements bancaires et suivre les règlements.', 'Préparer les éléments nécessaires aux clôtures avec le responsable.'],
    profile: 'Vous êtes titulaire d’une formation en comptabilité et utilisez avec aisance les outils bureautiques. Votre précision et votre respect des délais sont essentiels.',
  },
  'paris-projet': {
    contract: 'CDI',
    missions: ['Recueillir le besoin du client et définir les étapes du projet.', 'Coordonner les designers et développeurs autour du planning.', 'Suivre les livraisons, les tests et la mise en ligne des solutions.'],
    profile: 'Vous avez une première expérience en gestion de projet numérique. Vous savez communiquer avec différents interlocuteurs et gérer plusieurs priorités.',
  },
  'paris-vente': {
    contract: 'CDD · 6 mois',
    missions: ['Accueillir les clients et les conseiller selon leurs besoins.', 'Mettre en valeur les produits et veiller à la bonne tenue du magasin.', 'Participer à la réception des marchandises et au suivi des stocks.'],
    profile: 'Vous appréciez le contact avec le public et le travail en équipe. Une première expérience de vente est appréciée, mais une formation est prévue à l’arrivée.',
  },
  'marseille-web': {
    contract: 'CDI',
    missions: ['Développer des sites et applications web adaptés aux besoins clients.', 'Corriger les anomalies et améliorer les fonctionnalités existantes.', 'Participer aux tests techniques et à la documentation des projets.'],
    profile: 'Vous connaissez JavaScript et les principes du développement web moderne. Vous êtes autonome, méthodique et attentif à la qualité du code livré.',
  },
  'marseille-commercial': {
    contract: 'CDD · 9 mois',
    missions: ['Préparer les devis et enregistrer les commandes des clients.', 'Mettre à jour les dossiers et suivre les délais de livraison.', 'Assister l’équipe commerciale dans la préparation de ses rendez-vous.'],
    profile: 'Vous êtes à l’aise au téléphone et maîtrisez les outils bureautiques courants. Votre réactivité et votre sens de l’organisation sont indispensables.',
  },
  'marseille-tech': {
    contract: 'CDI',
    missions: ['Installer et configurer les postes et équipements réseau.', 'Identifier les pannes et réaliser les interventions de premier niveau.', 'Rédiger un compte rendu clair après chaque intervention client.'],
    profile: 'Vous avez une formation en informatique et de bonnes bases en systèmes et réseaux. Le poste demande autonomie, ponctualité et sens du service.',
  },
  'marseille-clientele': {
    contract: 'CDD · 6 mois',
    missions: ['Accueillir les clients et comprendre précisément leurs demandes.', 'Assurer le suivi des dossiers avec les différents services.', 'Informer les clients de l’avancement et garantir une réponse claire.'],
    profile: 'Vous avez un excellent relationnel et savez conserver votre calme dans les situations délicates. Vous êtes fiable, dynamique et à l’aise avec les outils numériques.',
  },
}

export const demoOffers = offers.map((offer) => ({ ...offer, ...details[offer.id] }))
