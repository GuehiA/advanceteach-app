-- =========================================================
-- ADVANCETEACH - BASE DE DONNÉES POSTGRESQL
-- =========================================================

-- Supprime les tables si elles existent déjà
DROP TABLE IF EXISTS research_requests CASCADE;
DROP TABLE IF EXISTS training_requests CASCADE;
DROP TABLE IF EXISTS quote_requests CASCADE;
DROP TABLE IF EXISTS contact_requests CASCADE;
DROP TABLE IF EXISTS media CASCADE;
DROP TABLE IF EXISTS offers CASCADE;
DROP TABLE IF EXISTS projects CASCADE;
DROP TABLE IF EXISTS services CASCADE;
DROP TABLE IF EXISTS pages CASCADE;
DROP TABLE IF EXISTS admins CASCADE;

-- =========================================================
-- TABLE ADMINS
-- =========================================================
CREATE TABLE admins (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    email VARCHAR(150) UNIQUE,
    password_hash TEXT NOT NULL,
    full_name VARCHAR(150),
    role VARCHAR(50) NOT NULL DEFAULT 'admin',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- =========================================================
-- TABLE PAGES
-- =========================================================
CREATE TABLE pages (
    id SERIAL PRIMARY KEY,
    slug VARCHAR(150) NOT NULL UNIQUE,
    title_fr VARCHAR(255) NOT NULL,
    title_en VARCHAR(255) NOT NULL,
    content_fr TEXT,
    content_en TEXT,
    meta_title_fr VARCHAR(255),
    meta_title_en VARCHAR(255),
    meta_description_fr TEXT,
    meta_description_en TEXT,
    hero_image VARCHAR(255),
    is_published BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- =========================================================
-- TABLE SERVICES
-- =========================================================
CREATE TABLE services (
    id SERIAL PRIMARY KEY,
    slug VARCHAR(150) NOT NULL UNIQUE,
    title_fr VARCHAR(255) NOT NULL,
    title_en VARCHAR(255) NOT NULL,
    short_desc_fr TEXT,
    short_desc_en TEXT,
    full_desc_fr TEXT,
    full_desc_en TEXT,
    icon VARCHAR(100),
    image_path VARCHAR(255),
    display_order INT NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    is_featured BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- =========================================================
-- TABLE PROJECTS / REALISATIONS
-- =========================================================
CREATE TABLE projects (
    id SERIAL PRIMARY KEY,
    slug VARCHAR(150) NOT NULL UNIQUE,
    title_fr VARCHAR(255) NOT NULL,
    title_en VARCHAR(255) NOT NULL,
    category VARCHAR(100),
    client_or_context VARCHAR(255),
    short_desc_fr TEXT,
    short_desc_en TEXT,
    full_desc_fr TEXT,
    full_desc_en TEXT,
    solution_fr TEXT,
    solution_en TEXT,
    results_fr TEXT,
    results_en TEXT,
    technologies TEXT,
    image_path VARCHAR(255),
    external_url VARCHAR(255),
    is_featured BOOLEAN NOT NULL DEFAULT FALSE,
    is_published BOOLEAN NOT NULL DEFAULT TRUE,
    project_date DATE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- =========================================================
-- TABLE OFFERS
-- Ce sont TES offres publiées sur le site
-- =========================================================
CREATE TABLE offers (
    id SERIAL PRIMARY KEY,
    slug VARCHAR(150) NOT NULL UNIQUE,
    title_fr VARCHAR(255) NOT NULL,
    title_en VARCHAR(255) NOT NULL,
    short_desc_fr TEXT,
    short_desc_en TEXT,
    full_desc_fr TEXT,
    full_desc_en TEXT,
    image_path VARCHAR(255),
    document_path VARCHAR(255),
    status VARCHAR(30) NOT NULL DEFAULT 'draft',
    is_featured BOOLEAN NOT NULL DEFAULT FALSE,
    published_at TIMESTAMP,
    expires_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT offers_status_check CHECK (status IN ('draft', 'published', 'archived'))
);

-- =========================================================
-- TABLE MEDIA
-- Pour images, PDF, documents uploadés
-- =========================================================
CREATE TABLE media (
    id SERIAL PRIMARY KEY,
    filename VARCHAR(255) NOT NULL,
    original_name VARCHAR(255) NOT NULL,
    mime_type VARCHAR(150),
    file_path VARCHAR(255) NOT NULL,
    alt_text_fr VARCHAR(255),
    alt_text_en VARCHAR(255),
    uploaded_by INT REFERENCES admins(id) ON DELETE SET NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- =========================================================
-- TABLE CONTACT REQUESTS
-- Formulaire de contact
-- =========================================================
CREATE TABLE contact_requests (
    id SERIAL PRIMARY KEY,
    full_name VARCHAR(150) NOT NULL,
    organization VARCHAR(150),
    email VARCHAR(150) NOT NULL,
    phone VARCHAR(50),
    subject VARCHAR(255),
    request_type VARCHAR(100) DEFAULT 'contact',
    message TEXT NOT NULL,
    language VARCHAR(10) NOT NULL DEFAULT 'fr',
    status VARCHAR(30) NOT NULL DEFAULT 'new',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT contact_requests_status_check CHECK (status IN ('new', 'read', 'processed', 'archived'))
);

-- =========================================================
-- TABLE QUOTE REQUESTS
-- Demandes de devis / projet
-- =========================================================
CREATE TABLE quote_requests (
    id SERIAL PRIMARY KEY,
    full_name VARCHAR(150) NOT NULL,
    organization VARCHAR(150),
    email VARCHAR(150) NOT NULL,
    phone VARCHAR(50),
    requested_service VARCHAR(150),
    estimated_budget VARCHAR(100),
    desired_timeline VARCHAR(100),
    project_description TEXT NOT NULL,
    language VARCHAR(10) NOT NULL DEFAULT 'fr',
    status VARCHAR(30) NOT NULL DEFAULT 'new',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT quote_requests_status_check CHECK (status IN ('new', 'read', 'processed', 'archived'))
);

-- =========================================================
-- TABLE TRAINING REQUESTS
-- Demandes de formation
-- =========================================================
CREATE TABLE training_requests (
    id SERIAL PRIMARY KEY,
    full_name VARCHAR(150) NOT NULL,
    organization VARCHAR(150) NOT NULL,
    email VARCHAR(150) NOT NULL,
    phone VARCHAR(50),
    training_topic VARCHAR(255) NOT NULL,
    participants_count INT,
    preferred_format VARCHAR(50),
    message TEXT,
    language VARCHAR(10) NOT NULL DEFAULT 'fr',
    status VARCHAR(30) NOT NULL DEFAULT 'new',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT training_requests_status_check CHECK (status IN ('new', 'read', 'processed', 'archived'))
);

-- =========================================================
-- TABLE RESEARCH REQUESTS
-- Demandes liées aux chercheurs / projets scientifiques
-- =========================================================
CREATE TABLE research_requests (
    id SERIAL PRIMARY KEY,
    full_name VARCHAR(150) NOT NULL,
    institution VARCHAR(200) NOT NULL,
    email VARCHAR(150) NOT NULL,
    phone VARCHAR(50),
    research_field VARCHAR(255),
    requested_platform_type VARCHAR(255),
    project_description TEXT NOT NULL,
    estimated_budget VARCHAR(100),
    desired_timeline VARCHAR(100),
    language VARCHAR(10) NOT NULL DEFAULT 'fr',
    status VARCHAR(30) NOT NULL DEFAULT 'new',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT research_requests_status_check CHECK (status IN ('new', 'read', 'processed', 'archived'))
);

-- =========================================================
-- INDEXES
-- =========================================================
CREATE INDEX idx_pages_slug ON pages(slug);
CREATE INDEX idx_services_slug ON services(slug);
CREATE INDEX idx_projects_slug ON projects(slug);
CREATE INDEX idx_offers_slug ON offers(slug);

CREATE INDEX idx_services_display_order ON services(display_order);
CREATE INDEX idx_projects_featured ON projects(is_featured);
CREATE INDEX idx_offers_status ON offers(status);

CREATE INDEX idx_contact_requests_status ON contact_requests(status);
CREATE INDEX idx_quote_requests_status ON quote_requests(status);
CREATE INDEX idx_training_requests_status ON training_requests(status);
CREATE INDEX idx_research_requests_status ON research_requests(status);

-- =========================================================
-- DONNÉES DE BASE
-- =========================================================

-- Admin initial
-- IMPORTANT : remplace le password_hash plus tard avec un vrai hash bcrypt
INSERT INTO admins (username, email, password_hash, full_name, role)
VALUES (
    'admin',
    'admin@advanceteach.com',
    '$2b$10$abcdefghijklmnopqrstuv1234567890abcdefghijklmnopqrstuv',
    'Administrateur AdvanceTeach',
    'superadmin'
);

-- Pages de base
INSERT INTO pages (slug, title_fr, title_en, content_fr, content_en) VALUES
('home', 'Accueil', 'Home', 'Contenu de la page accueil', 'Home page content'),
('about', 'À propos', 'About', 'Contenu de la page à propos', 'About page content'),
('services', 'Services', 'Services', 'Contenu de la page services', 'Services page content'),
('research', 'Solutions chercheurs', 'Research Solutions', 'Contenu de la page chercheurs', 'Research page content'),
('projects', 'Réalisations', 'Projects', 'Contenu de la page réalisations', 'Projects page content'),
('training', 'Formations', 'Training', 'Contenu de la page formations', 'Training page content'),
('offers', 'Appels d’offres / Opportunités', 'Tenders / Opportunities', 'Contenu de la page offres', 'Offers page content'),
('contact', 'Contact', 'Contact', 'Contenu de la page contact', 'Contact page content');

-- Services de base
INSERT INTO services (
    slug, title_fr, title_en, short_desc_fr, short_desc_en, display_order, is_active, is_featured
) VALUES
(
    'consultance-ia',
    'Consultance en intelligence artificielle',
    'Artificial Intelligence Consulting',
    'Accompagnement stratégique pour intégrer l’IA dans vos activités.',
    'Strategic support to integrate AI into your operations.',
    1, TRUE, TRUE
),
(
    'plateformes-intelligentes',
    'Conception de plateformes intelligentes',
    'Intelligent Platform Design',
    'Développement de plateformes numériques intelligentes pour l’éducation, la recherche et les organisations.',
    'Development of intelligent digital platforms for education, research, and organizations.',
    2, TRUE, TRUE
),
(
    'applications-intelligentes',
    'Développement d’applications intelligentes',
    'Smart Application Development',
    'Création d’applications web intelligentes et de solutions sur mesure.',
    'Creation of smart web applications and custom solutions.',
    3, TRUE, TRUE
),
(
    'formations-ia',
    'Formation professionnelle en IA',
    'Professional AI Training',
    'Formations adaptées aux entreprises, institutions et équipes.',
    'Training tailored for companies, institutions, and teams.',
    4, TRUE, TRUE
),
(
    'ecoles-virtuelles',
    'Conception d’écoles virtuelles et intelligentes',
    'Virtual and Intelligent School Design',
    'Création d’environnements d’apprentissage innovants et intelligents.',
    'Creation of innovative and intelligent learning environments.',
    5, TRUE, FALSE
),
(
    'solutions-recherche',
    'Solutions pour chercheurs',
    'Research Solutions',
    'Plateformes sur mesure pour projets scientifiques et recherche en IA.',
    'Custom platforms for scientific projects and AI research.',
    6, TRUE, TRUE
);

-- Réalisations de base
INSERT INTO projects (
    slug, title_fr, title_en, category, client_or_context, short_desc_fr, short_desc_en, is_featured, is_published
) VALUES
(
    'tutoratai',
    'Tutoratai',
    'Tutoratai',
    'plateforme',
    'AdvanceTeach',
    'Plateforme intelligente liée à l’accompagnement et à l’apprentissage.',
    'Intelligent platform for support and learning.',
    TRUE,
    TRUE
),
(
    'teachsharing',
    'TeachSharing',
    'TeachSharing',
    'plateforme',
    'AdvanceTeach',
    'Plateforme de partage et de collaboration pédagogique.',
    'Platform for educational sharing and collaboration.',
    TRUE,
    TRUE
);

-- Exemple d’offre
INSERT INTO offers (
    slug, title_fr, title_en, short_desc_fr, short_desc_en, status, is_featured, published_at
) VALUES
(
    'accompagnement-ia-institutions',
    'Accompagnement IA pour institutions',
    'AI Support for Institutions',
    'Offre d’accompagnement pour intégrer l’IA dans les institutions éducatives et organisationnelles.',
    'Support offer to integrate AI into educational and organizational institutions.',
    'published',
    TRUE,
    CURRENT_TIMESTAMP
);