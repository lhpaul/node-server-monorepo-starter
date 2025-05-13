export class Company {
  id: string; // id of the company
  name: string; // name of the company
  constructor(company: Partial<Company>) {
    Object.assign(this, company);
  }
}
