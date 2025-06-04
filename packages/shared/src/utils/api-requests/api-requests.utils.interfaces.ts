export interface ApiRequestValues {
  method: string;
  url: string;
  payload?: any;
  headers?: any;
  params?: any;
}

export interface MaskRequestOptions {
  params?: string[];
  query?: string[];
  requestPayloadFields?: string[];
  requestHeaders?: string[];
  responsePayloadFields?: string[];
  responseHeaders?: string[];
}
export interface RequestOptions {
  maskOptions?: MaskRequestOptions;
}

export interface ApiResponse<T> {
  status: number;
  data?: T;
  error?: {
    code: string;
    message: string;
    status?: number | null;
    data?: any;
  };
}
