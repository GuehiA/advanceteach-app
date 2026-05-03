CREATE TABLE IF NOT EXISTS page_sections (
  id SERIAL PRIMARY KEY,
  page_slug VARCHAR(100) NOT NULL,
  section_key VARCHAR(100) NOT NULL,
  section_type VARCHAR(50) NOT NULL DEFAULT 'text',
  title_fr VARCHAR(255),
  title_en VARCHAR(255),
  content_fr TEXT,
  content_en TEXT,
  image_path VARCHAR(500),
  button_text_fr VARCHAR(150),
  button_text_en VARCHAR(150),
  button_link VARCHAR(500),
  display_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_page_sections_page_slug
    FOREIGN KEY (page_slug) REFERENCES pages(slug)
    ON DELETE CASCADE,
  CONSTRAINT uq_page_sections_page_key UNIQUE (page_slug, section_key)
);

CREATE INDEX IF NOT EXISTS idx_page_sections_page_slug
  ON page_sections(page_slug);

CREATE INDEX IF NOT EXISTS idx_page_sections_page_slug_order
  ON page_sections(page_slug, display_order);