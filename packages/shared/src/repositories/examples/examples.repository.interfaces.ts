import {
  DocumentModel,
  QueryInput,
  QueryItem,
} from '../../definitions/repositories.interfaces';

export interface ExampleDocument extends DocumentModel {
  description: string | null;
  name: string;
}

export interface CreateExampleDocumentInput {
  description: string | null;
  name: string;
}

export interface UpdateExampleDocumentInput {
  description?: string;
  name?: string;
}

export interface ExampleQueryInput extends QueryInput {
  description?: QueryItem<string>[];
  name?: QueryItem<string>[];
}