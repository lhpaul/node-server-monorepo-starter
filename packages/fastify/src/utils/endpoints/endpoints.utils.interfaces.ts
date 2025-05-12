export interface IEndpointOptions {
  maskOptions?: {
    params?: string[];
    query?: string[];
    requestPayloadFields?: string[];
    requestHeaders?: string[];
    responsePayloadFields?: string[];
    responseHeaders?: string[];
  };
}
