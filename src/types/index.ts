import type { ContractType, ContractSeo, ContractTemplate, TemplateField, FieldType } from "@prisma/client";

export type { FieldType };

export type ContractWithAll = ContractType & {
  seo: ContractSeo | null;
  template:
    | (ContractTemplate & {
        fields: TemplateField[];
      })
    | null;
};

export type ContractListItem = ContractType & {
  seo: ContractSeo | null;
};
