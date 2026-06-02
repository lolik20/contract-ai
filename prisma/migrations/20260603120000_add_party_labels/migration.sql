ALTER TABLE "contract_templates"
  ADD COLUMN "party1Label" TEXT NOT NULL DEFAULT 'Сторона 1',
  ADD COLUMN "party2Label" TEXT NOT NULL DEFAULT 'Сторона 2';
