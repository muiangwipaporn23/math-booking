import { Base64 } from 'js-base64';

export const btoa = (str) => Base64.encode(str);
export const atob = (encodedStr) => Base64.decode(encodedStr);
