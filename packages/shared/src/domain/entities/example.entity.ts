import { EntityModel } from '../../definitions/domain.interfaces';

/**
 * Example domain model - Replace with your actual business entities
 *
 * This is a minimal example showing the structure for domain models.
 * Replace this with your actual business entities.
 */
export class Example implements EntityModel {
  public readonly createdAt: Date;
  public readonly description: string | null;
  public readonly id: string;
  public readonly name: string;
  public readonly updatedAt: Date;

  constructor(data: Required<Example>) {
    this.id = data.id;
    this.name = data.name;
    this.description = data.description;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }
}
