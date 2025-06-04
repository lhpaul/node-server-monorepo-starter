import { MaskOptions } from './mask.utils.interfaces';

/**
 * Masks a given string by replacing the last `maskLength` characters with the specified `maskChar`.
 * If the string's length is less than or equal to `maskLength`, the entire string is masked.
 *
 * @param str - The input string to be masked.
 * @param config - An optional configuration object containing `maskChar` (default: '*') and `maskLength` (default: 4).
 * @returns The masked string with the specified number of characters replaced by the mask character.
 */
export function maskString(str: string, config?: MaskOptions): string {
  const { maskChar = '*', maskLength = 4 } = config || {};
  if (!config?.maskLength || str.length <= maskLength) {
    return str.replace(/./g, maskChar);
  }
  const visiblePart = str.slice(0, maskLength);
  const maskedPart = str.slice(maskLength).replace(/./g, maskChar);
  return visiblePart + maskedPart;
}

/**
 * Masks specified fields in a JSON object by replacing the last few characters of their values
 * with a mask character. Uses the `maskString` function for masking.
 *
 * @param jsonObject - The input object containing fields to be masked. The object is not mutated.
 * @param fieldsToMask - An array of field names in the object that should be masked. If a field does not exist, it is ignored.
 * @param config - An optional configuration object containing:
 *   - `maskChar` (default: '*'): The character used for masking.
 *   - `maskLength` (default: 4): The number of characters to mask from the beginning of the string.
 * @returns A new object with the specified fields masked. Fields not listed in `fieldsToMask` remain unchanged.
 */
export function maskFields(
  jsonObject: any,
  fieldsToMask: string[],
  config?: MaskOptions,
): Record<string, any> {
  if (typeof jsonObject !== 'object' || jsonObject === null) {
    return jsonObject;
  }
  const maskedObject = { ...jsonObject };
  fieldsToMask.forEach((field) => {
    if (field in maskedObject) {
      maskedObject[field] = maskString(maskedObject[field], config);
    }
  });

  return maskedObject;
}
