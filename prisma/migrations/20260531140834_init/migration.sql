-- CreateEnum
CREATE TYPE "FieldType" AS ENUM ('TEXT', 'TEXTAREA', 'DATE', 'NUMBER', 'SELECT', 'EMAIL', 'PHONE');

-- CreateTable
CREATE TABLE "contract_types" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contract_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contract_seo" (
    "id" TEXT NOT NULL,
    "contractTypeId" TEXT NOT NULL,
    "pageTitle" TEXT NOT NULL,
    "metaDescription" TEXT NOT NULL,
    "keywords" TEXT,
    "ogTitle" TEXT,
    "ogDescription" TEXT,
    "h1" TEXT,
    "introText" TEXT,

    CONSTRAINT "contract_seo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contract_templates" (
    "id" TEXT NOT NULL,
    "contractTypeId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contract_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "template_fields" (
    "id" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "type" "FieldType" NOT NULL DEFAULT 'TEXT',
    "placeholder" TEXT,
    "defaultValue" TEXT,
    "required" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,
    "options" TEXT,

    CONSTRAINT "template_fields_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "contract_types_slug_key" ON "contract_types"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "contract_seo_contractTypeId_key" ON "contract_seo"("contractTypeId");

-- CreateIndex
CREATE UNIQUE INDEX "contract_templates_contractTypeId_key" ON "contract_templates"("contractTypeId");

-- CreateIndex
CREATE UNIQUE INDEX "template_fields_templateId_name_key" ON "template_fields"("templateId", "name");

-- AddForeignKey
ALTER TABLE "contract_seo" ADD CONSTRAINT "contract_seo_contractTypeId_fkey" FOREIGN KEY ("contractTypeId") REFERENCES "contract_types"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contract_templates" ADD CONSTRAINT "contract_templates_contractTypeId_fkey" FOREIGN KEY ("contractTypeId") REFERENCES "contract_types"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "template_fields" ADD CONSTRAINT "template_fields_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "contract_templates"("id") ON DELETE CASCADE ON UPDATE CASCADE;
