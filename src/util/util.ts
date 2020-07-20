import { extensionContext } from '../extension';
import * as path from 'path';

let root: string | undefined;
export const getRoot = (): string => {
  if(root) return root;
  return ((root = extensionContext?.extensionPath) || '');
};


export function loadView(file: string): string {
  return path.join(getRoot(), 'webview', file);
}
