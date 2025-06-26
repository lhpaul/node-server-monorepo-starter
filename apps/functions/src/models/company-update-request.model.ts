import { RequestModel } from '../utils/models/request-model.classes';

export class CompanyUpdateRequest extends RequestModel {
  public readonly name: string;

  constructor(companyUpdateRequest: Required<CompanyUpdateRequest>) {
    super();
    Object.assign(this, companyUpdateRequest);
  }
}