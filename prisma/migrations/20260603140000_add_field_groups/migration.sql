CREATE TABLE "field_groups" (
    "id" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "field_groups_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "field_groups" ADD CONSTRAINT "field_groups_templateId_fkey"
  FOREIGN KEY ("templateId") REFERENCES "contract_templates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "template_fields" ADD COLUMN "groupId" TEXT;

ALTER TABLE "template_fields" ADD CONSTRAINT "template_fields_groupId_fkey"
  FOREIGN KEY ("groupId") REFERENCES "field_groups"("id") ON DELETE SET NULL ON UPDATE CASCADE;
