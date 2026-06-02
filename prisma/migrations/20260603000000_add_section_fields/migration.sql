CREATE TABLE "section_fields" (
    "id" TEXT NOT NULL,
    "sectionId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "type" "FieldType" NOT NULL DEFAULT 'TEXT',
    "placeholder" TEXT,
    "defaultValue" TEXT,
    "required" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,
    "options" TEXT,
    CONSTRAINT "section_fields_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "section_fields" ADD CONSTRAINT "section_fields_sectionId_fkey"
  FOREIGN KEY ("sectionId") REFERENCES "contract_sections"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE UNIQUE INDEX "section_fields_sectionId_name_key" ON "section_fields"("sectionId", "name");
