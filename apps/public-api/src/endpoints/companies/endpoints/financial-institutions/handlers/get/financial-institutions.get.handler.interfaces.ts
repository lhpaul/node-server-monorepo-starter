export interface GetCompanyFinancialInstitutionParams {
  companyId: string;
  id: string;
}

export interface GetCompanyFinancialInstitutionResponse {
  companyId: string;
  credentials: any;
  createdAt: string;
  financialInstitution: {
    id: string;
    name: string;
  };
  id: string;
  updatedAt: string;
} 