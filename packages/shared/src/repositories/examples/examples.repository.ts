import { FirestoreCollectionRepository } from '../../utils/repositories/firestore-collection-repository.class';
import { COLLECTION_PATH } from './examples.repository.constants';
import { ExampleDocument, CreateExampleDocumentInput, UpdateExampleDocumentInput, ExampleQueryInput } from './examples.repository.interfaces.js';

export class ExamplesRepository extends FirestoreCollectionRepository<ExampleDocument, CreateExampleDocumentInput, UpdateExampleDocumentInput, ExampleQueryInput> {
  static readonly COLLECTION_PATH = COLLECTION_PATH;
  private static instance: ExamplesRepository;
  public static getInstance(): ExamplesRepository {
    if (!this.instance) {
      this.instance = new ExamplesRepository();
    }
    return this.instance;
  }
  constructor() {
    super({ collectionPath: COLLECTION_PATH });
  }
}