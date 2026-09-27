import {
  BriefcaseBusiness,
  Building2,
  Compass,
  GraduationCap,
  Handshake,
  Landmark,
  LucideIcon,
  PackageSearch,
  Plane,
  UsersRound,
} from "lucide-react";

export type Service = {
  slug: string;
  label: string;
  shortLabel: string;
  eyebrow: string;
  description: string;
  longDescription: string;
  icon: LucideIcon;
  accent: string;
  outcomes: string[];
  tabs: string[];
  subservices: string[][];
  architecture: "strategic" | "pipeline" | "people" | "trade" | "academic" | "property" | "network";
};

export type Program = {
  id: number;
  country: string;
  university: string;
  city: string;
  level: "Bachelor" | "Master" | "Doctorat";
  field: string;
  intake: string;
  cost: string;
  website: string;
  description: string;
  documents: string[];
  tags: string[];
};

const commonDocs = ["Passeport", "Diplôme ou relevés", "CV", "Lettre de motivation"];

export const services: Service[] = [
  {
    slug: "expertise-internationale", architecture: "network", label: "Expertise internationale", shortLabel: "International", eyebrow: "01 / regard global",
    description: "Lire les marchés, relier les opportunités, sécuriser les décisions.", longDescription: "Nous transformons les enjeux transfrontaliers en feuilles de route lisibles : étude de contexte, mise en relation qualifiée et coordination des parties prenantes.", icon: Compass, accent: "from-amber-500/20 to-orange-400/10", outcomes: ["Cartographie d’opportunités", "Veille sectorielle ciblée", "Coordination multi-pays"], tabs: ["Présentation", "Domaines d’intervention", "Méthodologie", "Secteurs", "Nous contacter"],
    subservices: [["Diagnostic international", "Cadrage de projet", "Note de contexte"], ["Étude de marché", "Veille concurrentielle", "Recherche de partenaires"], ["Cartographie des risques", "Feuille de route", "Comité de suivi"], ["Éducation", "Commerce", "Mobilité & talents"], ["Brief de qualification", "Devis d’accompagnement", "Espace sécurisé"]],
  },
  {
    slug: "conseil-business", architecture: "strategic", label: "Conseil en entreprise", shortLabel: "Business", eyebrow: "02 / clarté stratégique", description: "Donner une structure concrète aux ambitions de croissance.", longDescription: "De la structuration d’entreprise au développement de marché, ICX apporte un cadre de décision précis, adapté à la réalité opérationnelle de chaque dirigeant.", icon: BriefcaseBusiness, accent: "from-violet-500/20 to-fuchsia-400/10", outcomes: ["Diagnostic de positionnement", "Plan d’action 90 jours", "Structuration commerciale"], tabs: ["Présentation", "Accompagnement stratégique", "Structuration", "Développement de marché", "Nous contacter"],
    subservices: [["Diagnostic express", "Objectifs & indicateurs", "Plan de priorités"], ["Business plan", "Go-to-market", "Pilotage 90 jours"], ["Création & formalités", "Processus internes", "Organisation commerciale"], ["Partenariats B2B", "Prospection internationale", "Canaux de distribution"], ["Consultation dirigeant", "Atelier équipe", "Proposition sur mesure"]],
  },
  {
    slug: "sourcing", architecture: "pipeline", label: "Sourcing", shortLabel: "Sourcing", eyebrow: "03 / fiabilité terrain", description: "Identifier les bons fournisseurs et vérifier ce qui compte.", longDescription: "Notre approche relie recherche, qualification et contrôle qualité pour réduire les risques d’approvisionnement et créer des relations durables.", icon: PackageSearch, accent: "from-orange-500/20 to-rose-400/10", outcomes: ["Recherche fournisseurs", "Audit documentaire", "Contrôle qualité"], tabs: ["Présentation", "Fournisseurs", "Produits", "Audit qualité", "Nous contacter"],
    subservices: [["Brief achat", "Cahier des charges", "Budget cible"], ["Recherche multi-pays", "Shortlist qualifiée", "Vérification d’existence"], ["Échantillons", "Négociation", "Incoterms & livraison"], ["Audit documentaire", "Inspection avant expédition", "Suivi des non-conformités"], ["Demande de sourcing", "Mise en relation", "Suivi commande"]],
  },
  {
    slug: "ressources-humaines", architecture: "people", label: "Ressources humaines", shortLabel: "RH", eyebrow: "04 / talents & mobilité", description: "Relier les compétences, les organisations et les opportunités.", longDescription: "Nous accompagnons les besoins en ressources humaines, mobilité et placement avec un regard international, une qualification attentive et un suivi documenté.", icon: UsersRound, accent: "from-rose-500/20 to-pink-400/10", outcomes: ["Identification de profils", "Mobilité internationale", "Suivi employeur / candidat"], tabs: ["Présentation", "Besoins RH", "Mobilité internationale", "Placement", "Nous contacter"],
    subservices: [["Analyse du besoin", "Référentiel de poste", "Plan de recrutement"], ["Sourcing de talents", "Préqualification", "Entretiens structurés"], ["Mobilité Europe", "Onboarding", "Coordination documentaire"], ["Mise en relation", "Suivi candidat", "Suivi employeur"], ["Brief RH", "Partenariat entreprise", "Espace confidentiel"]],
  },
  {
    slug: "commerce-international", architecture: "trade", label: "Commerce international", shortLabel: "Commerce", eyebrow: "05 / flux maîtrisés", description: "Fluidifier l’import-export, de la négociation à la livraison.", longDescription: "Nous accompagnons les flux internationaux avec une attention particulière portée aux partenaires, aux documents, à la logistique et aux points de passage critiques.", icon: Plane, accent: "from-cyan-500/20 to-teal-400/10", outcomes: ["Import / export", "Logistique & douane", "Partenariats commerciaux"], tabs: ["Présentation", "Import / Export", "Logistique", "Partenariats", "Nous contacter"],
    subservices: [["Étude de flux", "Choix du marché", "Plan commercial"], ["Incoterms", "Documentation export", "Coordination douanière"], ["Transport multimodal", "Transitaires", "Suivi des délais"], ["Partenaires locaux", "Distributeurs", "Accords de coopération"], ["Brief import-export", "Analyse de faisabilité", "Devis"]],
  },
  {
    slug: "etudes", architecture: "academic", label: "Études & admissions", shortLabel: "Études", eyebrow: "06 / trajectoires académiques", description: "Orienter chaque projet d’études vers une candidature réaliste.", longDescription: "Un espace de recherche et de suivi pour comparer des programmes, préparer ses documents et suivre chaque étape d’un dossier d’admission.", icon: GraduationCap, accent: "from-emerald-500/20 to-lime-400/10", outcomes: ["Filtrage multi-critères", "Dossier documentaire", "Suivi de candidature"], tabs: ["Présentation", "Explorer les programmes", "Documents requis", "Suivi du dossier", "Nous contacter"],
    subservices: [["Bilan académique", "Choix du pays", "Plan d’orientation"], ["Universités", "Programmes", "Calendriers & budgets"], ["Diplômes & relevés", "Langues", "Visa & logement"], ["Dossier de candidature", "Relances", "Préparation entretien"], ["Contacter un conseiller", "Ouvrir un dossier", "Demander une shortlist"]],
  },
  {
    slug: "immobilier", architecture: "property", label: "Immobilier", shortLabel: "Immobilier", eyebrow: "07 / ancrage local", description: "Éclairer les choix immobiliers avec méthode et discernement.", longDescription: "Pour un projet résidentiel ou d’investissement, nous réunissons lecture du besoin, analyse d’opportunité et accompagnement dans la prise de décision.", icon: Building2, accent: "from-yellow-500/20 to-amber-400/10", outcomes: ["Recherche de biens", "Lecture d’opportunité", "Investissement immobilier"], tabs: ["Présentation", "Types de biens", "Investissement", "Accompagnement", "Nous contacter"],
    subservices: [["Cadrage du budget", "Zone de recherche", "Critères de décision"], ["Résidentiel", "Commercial", "Terrains & projets"], ["Rendement locatif", "Analyse de marché", "Due diligence"], ["Visites", "Coordination partenaires", "Lecture documentaire"], ["Brief immobilier", "Mise en relation", "Accompagnement"]],
  },
];

export const programs: Program[] = [
  { id: 1, country: "France", university: "Université de Bordeaux", city: "Bordeaux", level: "Master", field: "Commerce international", intake: "Septembre 2027", cost: "3 770 € / an indicatif", website: "https://www.u-bordeaux.fr", description: "Un parcours pour comprendre les environnements commerciaux, les flux et les stratégies de développement à l’international.", documents: [...commonDocs, "Certificat TCF / TEF"], tags: ["France", "Business", "Anglais / Français"] },
  { id: 2, country: "France", university: "Université Paris Cité", city: "Paris", level: "Master", field: "Relations internationales", intake: "Septembre 2027", cost: "à préciser selon programme", website: "https://u-paris.fr", description: "Une formation pluridisciplinaire pour analyser les dynamiques internationales, les institutions et les projets transfrontaliers.", documents: [...commonDocs, "Relevés de notes", "Preuve de langue"], tags: ["France", "International", "Français"] },
  { id: 3, country: "France", university: "Université de Strasbourg", city: "Strasbourg", level: "Bachelor", field: "Sciences économiques et gestion", intake: "Septembre 2027", cost: "à préciser selon programme", website: "https://www.unistra.fr", description: "Un environnement européen pour construire des bases solides en économie, gestion et mobilité académique.", documents: [...commonDocs, "Diplôme secondaire", "Preuve de langue"], tags: ["France", "Europe"] },
  { id: 4, country: "Canada", university: "Université de Montréal", city: "Montréal", level: "Master", field: "Gestion internationale", intake: "Automne 2027", cost: "à préciser selon profil", website: "https://umontreal.ca", description: "Une formation ouverte sur les marchés mondiaux, l’innovation et la gestion de projets dans des contextes multiculturels.", documents: [...commonDocs, "Preuve de langue"], tags: ["Canada", "Gestion", "Français"] },
  { id: 5, country: "Canada", university: "Université Laval", city: "Québec", level: "Master", field: "Administration des affaires", intake: "Automne 2027", cost: "à préciser selon programme", website: "https://www.ulaval.ca", description: "Un parcours de gestion et de leadership dans un écosystème francophone nord-américain.", documents: [...commonDocs, "GMAT selon programme", "Preuve de langue"], tags: ["Canada", "MBA", "Français"] },
  { id: 6, country: "USA", university: "University of Illinois Chicago", city: "Chicago", level: "Bachelor", field: "Business Administration", intake: "Fall 2027", cost: "$34 000 / an indicatif", website: "https://www.uic.edu", description: "Une première expérience académique structurante, au cœur d’un écosystème entrepreneurial et international.", documents: [...commonDocs, "Diplôme secondaire", "TOEFL / IELTS"], tags: ["USA", "Business", "Anglais"] },
  { id: 7, country: "USA", university: "Arizona State University", city: "Tempe", level: "Master", field: "Global Management", intake: "Fall 2027", cost: "$32 000 / an indicatif", website: "https://www.asu.edu", description: "Un programme tourné vers le management global, l’innovation et les environnements professionnels multiculturels.", documents: [...commonDocs, "Diplôme Licence", "TOEFL / IELTS"], tags: ["USA", "Management", "Anglais"] },
  { id: 8, country: "Chine", university: "Zhejiang University", city: "Hangzhou", level: "Master", field: "International Business", intake: "Septembre 2027", cost: "à préciser selon programme", website: "https://www.zju.edu.cn", description: "Une université de recherche reconnue, avec une ouverture forte sur l’Asie et les chaînes de valeur mondiales.", documents: [...commonDocs, "Plan d’études", "Certificat de langue"], tags: ["Chine", "Asie", "Anglais"] },
  { id: 9, country: "Chine", university: "Tsinghua University", city: "Pékin", level: "Master", field: "Public Policy & Management", intake: "Septembre 2027", cost: "à préciser selon programme", website: "https://www.tsinghua.edu.cn", description: "Un environnement académique international pour comprendre politiques publiques, innovation et développement.", documents: [...commonDocs, "Plan d’études", "Certificat de langue"], tags: ["Chine", "Policy", "Anglais / Chinois"] },
  { id: 10, country: "Russie", university: "HSE University", city: "Moscou", level: "Master", field: "Management & Analytics", intake: "Septembre 2027", cost: "à préciser selon programme", website: "https://www.hse.ru", description: "Un environnement académique exigeant pour croiser management, données et compréhension des marchés.", documents: [...commonDocs, "Lettre de motivation"], tags: ["Russie", "Data", "Anglais / Russe"] },
  { id: 11, country: "Russie", university: "RUDN University", city: "Moscou", level: "Bachelor", field: "International Relations", intake: "Septembre 2027", cost: "à préciser selon programme", website: "https://www.rudn.ru", description: "Une communauté universitaire internationale et une orientation forte vers les relations entre régions du monde.", documents: [...commonDocs, "Diplôme secondaire", "Preuve de langue"], tags: ["Russie", "Relations internationales"] },
  { id: 12, country: "Roumanie", university: "Bucharest University of Economic Studies", city: "Bucarest", level: "Bachelor", field: "International Economics", intake: "Octobre 2027", cost: "2 800 € / an indicatif", website: "https://www.ase.ro", description: "Un parcours européen accessible pour bâtir des fondamentaux solides en économie et commerce international.", documents: [...commonDocs, "Diplôme secondaire", "Preuve de langue"], tags: ["Roumanie", "Europe", "Anglais"] },
  { id: 13, country: "Roumanie", university: "Babeș-Bolyai University", city: "Cluj-Napoca", level: "Master", field: "International Business Management", intake: "Septembre 2027", cost: "à préciser selon programme", website: "https://www.ubbcluj.ro", description: "L’Université Babeș-Bolyai de Cluj-Napoca propose un environnement académique multiculturel, avec des parcours en gestion, économie et études européennes.", documents: [...commonDocs, "Diplôme Licence", "Preuve de langue"], tags: ["Roumanie", "Cluj-Napoca", "Management"] },
  { id: 14, country: "Roumanie", university: "Alexandru Ioan Cuza University", city: "Iași", level: "Master", field: "European Studies", intake: "Septembre 2027", cost: "à préciser selon programme", website: "https://www.uaic.ro", description: "Une université historique de Iași pour approfondir les politiques européennes, la coopération et la mobilité.", documents: [...commonDocs, "Diplôme Licence", "Preuve de langue"], tags: ["Roumanie", "Iași", "Europe"] },
  { id: 15, country: "Pologne", university: "Kozminski University", city: "Varsovie", level: "Master", field: "Strategic Management", intake: "Octobre 2027", cost: "à préciser selon programme", website: "https://www.kozminski.edu.pl", description: "Un programme orienté décision, leadership et développement dans des environnements économiques en mouvement.", documents: [...commonDocs, "Lettre de recommandation"], tags: ["Pologne", "Management", "Anglais"] },
  { id: 16, country: "Pologne", university: "University of Warsaw", city: "Varsovie", level: "Bachelor", field: "International Relations", intake: "Octobre 2027", cost: "à préciser selon programme", website: "https://www.uw.edu.pl", description: "Un parcours international au cœur d’une capitale européenne, entre diplomatie, économie et société.", documents: [...commonDocs, "Diplôme secondaire", "Preuve de langue"], tags: ["Pologne", "International", "Anglais"] },
];

export const countries = ["Tous les pays", "France", "Canada", "USA", "Chine", "Russie", "Roumanie", "Pologne"];
export const statusLabels = ["Reçu", "En cours d’analyse", "Documents complémentaires requis", "Accepté", "Clôturé"];
export const translations = {
  fr: { nav: ["Services", "Études", "Partenaires", "À propos"], login: "Se connecter", signup: "Créer un compte", heroKicker: "Plateforme d’accompagnement international", heroTitle: "Les bonnes connexions créent les bons horizons.", heroBody: "ICX Power Solutions accompagne les entreprises, les talents et les projets qui veulent avancer au-delà des frontières — avec méthode, exigence et proximité.", heroCta: "Découvrir notre approche", heroSecondary: "Explorer les programmes" },
  en: { nav: ["Services", "Studies", "Partners", "About"], login: "Sign in", signup: "Create account", heroKicker: "International support platform", heroTitle: "The right connections create new horizons.", heroBody: "ICX Power Solutions supports companies, talent and projects that want to move across borders — with method, rigor and proximity.", heroCta: "Discover our approach", heroSecondary: "Explore programmes" },
  zh: { nav: ["服务", "留学", "合作伙伴", "关于我们"], login: "登录", signup: "创建账户", heroKicker: "国际支持平台", heroTitle: "连接，让视野抵达更远的地方。", heroBody: "ICX Power Solutions 以严谨、专业和贴近客户的方式，支持企业、人才与跨境项目发展。", heroCta: "了解我们的方式", heroSecondary: "探索项目" },
  ro: { nav: ["Servicii", "Studii", "Parteneri", "Despre noi"], login: "Conectare", signup: "Creează cont", heroKicker: "Platformă de suport internațional", heroTitle: "Conexiunile potrivite deschid noi orizonturi.", heroBody: "ICX Power Solutions sprijină companii, talente și proiecte internaționale cu metodă, rigoare și proximitate.", heroCta: "Descoperă abordarea", heroSecondary: "Explorează programele" },
  pl: { nav: ["Usługi", "Studia", "Partnerzy", "O nas"], login: "Zaloguj się", signup: "Utwórz konto", heroKicker: "Międzynarodowa platforma wsparcia", heroTitle: "Dobre połączenia otwierają nowe horyzonty.", heroBody: "ICX Power Solutions wspiera firmy, talenty i projekty międzynarodowe — metodycznie, rzetelnie i blisko klienta.", heroCta: "Poznaj nasze podejście", heroSecondary: "Przeglądaj programy" },
  ar: { nav: ["الخدمات", "الدراسات", "الشركاء", "من نحن"], login: "تسجيل الدخول", signup: "إنشاء حساب", heroKicker: "منصة دعم دولية", heroTitle: "العلاقات الصحيحة تفتح آفاقاً جديدة.", heroBody: "تدعم ICX Power Solutions الشركات والمواهب والمشاريع العابرة للحدود بمنهجية وصرامة وقرب.", heroCta: "اكتشف نهجنا", heroSecondary: "استكشف البرامج" },
} as const;
export type Locale = keyof typeof translations;
