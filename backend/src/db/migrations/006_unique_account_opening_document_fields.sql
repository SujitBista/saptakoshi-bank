-- Normalize existing values before enforcing uniqueness.
UPDATE account_opening_documents
SET
  client_code = UPPER(TRIM(client_code)),
  citizen_no = TRIM(citizen_no),
  mobile_number = TRIM(mobile_number);

-- Keep the earliest row per value; suffix later duplicates with the row id.
WITH ranked_client_codes AS (
  SELECT
    id,
    ROW_NUMBER() OVER (PARTITION BY client_code ORDER BY id) AS row_num
  FROM account_opening_documents
)
UPDATE account_opening_documents AS document
SET client_code = LEFT(document.client_code, 50 - LENGTH('-' || document.id::text))
  || '-' || document.id::text
FROM ranked_client_codes AS ranked
WHERE document.id = ranked.id
  AND ranked.row_num > 1;

WITH ranked_citizen_numbers AS (
  SELECT
    id,
    ROW_NUMBER() OVER (PARTITION BY citizen_no ORDER BY id) AS row_num
  FROM account_opening_documents
)
UPDATE account_opening_documents AS document
SET citizen_no = LEFT(document.citizen_no, 50 - LENGTH('-' || document.id::text))
  || '-' || document.id::text
FROM ranked_citizen_numbers AS ranked
WHERE document.id = ranked.id
  AND ranked.row_num > 1;

WITH ranked_mobile_numbers AS (
  SELECT
    id,
    ROW_NUMBER() OVER (PARTITION BY mobile_number ORDER BY id) AS row_num
  FROM account_opening_documents
)
UPDATE account_opening_documents AS document
SET mobile_number = LEFT(document.mobile_number, 20 - LENGTH('-' || document.id::text))
  || '-' || document.id::text
FROM ranked_mobile_numbers AS ranked
WHERE document.id = ranked.id
  AND ranked.row_num > 1;

DROP INDEX IF EXISTS account_opening_documents_client_code_idx;

ALTER TABLE account_opening_documents
  ADD CONSTRAINT account_opening_documents_client_code_key UNIQUE (client_code);

ALTER TABLE account_opening_documents
  ADD CONSTRAINT account_opening_documents_citizen_no_key UNIQUE (citizen_no);

ALTER TABLE account_opening_documents
  ADD CONSTRAINT account_opening_documents_mobile_number_key UNIQUE (mobile_number);
