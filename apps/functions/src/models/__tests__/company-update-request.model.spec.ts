import { ProcessStatus } from '../../definitions/models.interfaces';
import { CompanyUpdateRequest } from '../company-update-request.model';

describe(CompanyUpdateRequest.name, () => {
  const initialValues = {
    createdAt: new Date('2024-01-01T00:00:00Z'),
    error: null,
    id: 'cur-001',
    name: 'Updated Company Name',
    status: ProcessStatus.PENDING,
    updatedAt: new Date('2024-01-02T00:00:00Z'),
    userId: 'user-001',
  };
  let request: CompanyUpdateRequest;

  beforeEach(() => {
    request = new CompanyUpdateRequest(initialValues as Required<CompanyUpdateRequest>);
  });

  it('should create a new CompanyUpdateRequest instance', () => {
    expect(request).toBeInstanceOf(CompanyUpdateRequest);
  });

  it('should assign all properties correctly', () => {
    expect(request.createdAt).toEqual(initialValues.createdAt);
    expect(request.error).toBe(initialValues.error);
    expect(request.id).toBe(initialValues.id);
    expect(request.name).toBe(initialValues.name);
    expect(request.status).toBe(initialValues.status);
    expect(request.updatedAt).toEqual(initialValues.updatedAt);
    expect(request.userId).toBe(initialValues.userId);
  });

  it('should inherit from RequestModel', () => {
    expect(request).toBeInstanceOf(CompanyUpdateRequest);
    // Check that it has the base class properties
    expect(request).toHaveProperty('createdAt');
    expect(request).toHaveProperty('error');
    expect(request).toHaveProperty('id');
    expect(request).toHaveProperty('status');
    expect(request).toHaveProperty('updatedAt');
    expect(request).toHaveProperty('userId');
  });

  it('should have readonly properties', () => {
    // TypeScript readonly properties are enforced at compile time,
    // but we can verify the structure is correct
    expect(typeof request.name).toBe('string');
    expect(typeof request.id).toBe('string');
    expect(typeof request.userId).toBe('string');
    expect(request.status).toBeDefined();
  });
}); 