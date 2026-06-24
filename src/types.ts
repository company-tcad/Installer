/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface AppMetadata {
  name: string;
  packageName: string;
  version: string;
  versionCode: number;
  permissions: string[];
  templateType: 'native_cpp' | 'react_webview' | 'acode_plugin';
  githubRepo?: string;
}

export interface GeneratedFiles {
  androidManifest: string;
  sourceCode: string;
  sourceFileName: string;
  stringsXml: string;
  updateJson: string;
  configXml?: string;
  buildGradle?: string;
  setupSteps?: string[];
}

export interface ReleaseInfo {
  id: number;
  name: string;
  tagName: string;
  body: string;
  apkUrl: string;
  apkName: string;
  publishedAt: string;
  downloadCount: number;
}

export interface UpdateManifest {
  appName: string;
  packageName: string;
  version: string;
  versionCode: number;
  apkUrl: string;
  changelog: string;
  minSdkVersion: number;
  requiredPermissions: string[];
  forceUpdate?: boolean;
}
