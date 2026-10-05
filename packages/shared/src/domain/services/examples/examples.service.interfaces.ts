import { FilterInput, FilterItem  } from '../../../definitions/domain.interfaces';

export interface CreateExampleInput {
  description: string | null;
  name: string;
}

export interface UpdateExampleInput {
  description?: string;
  name?: string;
}

export interface FilterExampleInput extends FilterInput  {
  description?: FilterItem<string>[];
  name?: FilterItem<string>[];
}
