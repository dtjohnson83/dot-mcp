-- Add unique constraint to hazmat_classifications if not exists
-- Using DO block to safely handle cases where constraint may exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'hazmat_classifications_class_number_key'
  ) THEN
    ALTER TABLE hazmat_classifications ADD CONSTRAINT hazmat_classifications_class_number_key UNIQUE (class_number);
  END IF;
END $$;
