export interface ListCompanyFinancialInstitutionsParams {
  companyId: string;
}

export interface ListCompanyFinancialInstitutionsResponse {
  data: Array<{
    companyId: string;
    credentials: any;
    createdAt: string;
    financialInstitution: {
      id: string;
      name: string;
    };
    id: string;
    updatedAt: string;
  }>;
} 