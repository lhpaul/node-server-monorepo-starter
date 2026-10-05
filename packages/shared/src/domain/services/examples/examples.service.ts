// Internal modules (farthest path first, then alphabetical)
import { Example } from '../../entities';
import {
  CreateExampleDocumentInput,
  ExampleDocument,
  ExampleQueryInput,
  ExamplesRepository,
  UpdateExampleDocumentInput,
} from '../../../repositories';
import { DomainModelService } from '../../../utils/services';

// Local imports (alphabetical)
import {
  CreateExampleInput,
  UpdateExampleInput,
  FilterExampleInput,
} from './examples.service.interfaces';

/**
 * Example service implementation - Replace with your actual business logic
 *
 * This is a minimal example showing the structure for domain services.
 * Replace this with your actual business logic implementations.
 */

export class ExamplesService extends DomainModelService<Example, ExampleDocument, CreateExampleInput, CreateExampleDocumentInput, UpdateExampleInput, UpdateExampleDocumentInput, FilterExampleInput, ExampleQueryInput> implements ExamplesService {
  private static instance: ExamplesService;
  public static getInstance(): ExamplesService {
    if (!this.instance) {
      this.instance = new ExamplesService(ExamplesRepository.getInstance(), Example);
    }
    return this.instance;
  }
}
