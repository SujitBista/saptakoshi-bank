ALTER TABLE product_papers
  DROP COLUMN IF EXISTS version,
  DROP COLUMN IF EXISTS effective_date;

DROP INDEX IF EXISTS product_papers_effective_date_idx;
