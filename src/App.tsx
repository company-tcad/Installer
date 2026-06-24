import React, { useState, useEffect } from "react";
import { 
  Terminal, Cpu, Code2, Layers, Github, BookOpen, Smartphone, 
  Settings, Sparkles, Wand2, Info, ArrowRight, Play
} from "lucide-react";

import GitHubIntegration from "./components/GitHubIntegration";
import ManifestBuilder from "./components/ManifestBuilder";
import InstallerSimulator from "./components/InstallerSimulator";
import AcodeGuide from "./components/AcodeGuide";
import { AppMetadata, GeneratedFiles, UpdateManifest } from "./types";

export default function App() {
  // Main active view tab for the left configuration panel
  const [activeTab, setActiveTab] = useState<"builder" | "github" | "guide">("builder");

  // Shared state between panels
  const [metadata, setMetadata] = useState<AppMetadata>({
    name: "Acode Video Player",
    packageName: "com.acode.videoplayer",
    version: "1.0.0",
    versionCode: 1,
    permissions: ["android.permission.INTERNET", "android.permission.READ_EXTERNAL_STORAGE"],
    templateType: "native_cpp",
    githubRepo: "Acode-Android/Acode"
  });

  const [currentManifest, setCurrentManifest] = useState<UpdateManifest | null>(null);

  // Sync initial manifest representation for the simulator
  useEffect(() => {
    const initialManifest: UpdateManifest = {
      appName: metadata.name,
      packageName: metadata.packageName,
      version: metadata.version,
      versionCode: metadata.versionCode,
      apkUrl: `https://raw.githubusercontent.com/${metadata.githubRepo || "usuario/repo"}/main/releases/app-release.apk`,
      changelog: "Build inicial gerada via painel do Acode Companion.",
      minSdkVersion: 21,
      requiredPermissions: metadata.permissions
    };
    setCurrentManifest(initialManifest);
  }, []);

  // Callback when AI or presets generate code
  const handleGeneratedFiles = (files: GeneratedFiles) => {
    try {
      const parsed: UpdateManifest = JSON.parse(files.updateJson);
      setCurrentManifest(parsed);
    } catch (e) {
      // Fallback if parsing fails
      setCurrentManifest({
        appName: metadata.name,
        packageName: metadata.packageName,
        version: metadata.version,
        versionCode: metadata.versionCode,
        apkUrl: "https://example.com/app.apk",
        changelog: "Metadados gerados pelo assistente.",
        minSdkVersion: 21,
        requiredPermissions: metadata.permissions
      });
    }
  };

  // Callback when a manifest/APK is fetched from GitHub or a custom URL
  const handleLoadManifestFromRemote = (manifest: UpdateManifest, apkUrl?: string) => {
    setCurrentManifest({
      ...manifest,
      apkUrl: apkUrl || manifest.apkUrl
    });
    // Update basic form fields as well
    setMetadata(prev => ({
      ...prev,
      name: manifest.appName || prev.name,
      packageName: manifest.packageName || prev.packageName,
      version: manifest.version || prev.version,
      versionCode: manifest.versionCode || prev.versionCode,
      permissions: manifest.requiredPermissions || prev.permissions
    }));
  };

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 flex flex-col font-sans" id="app-root-container">
      {/* Top Navigation bar */}
      <header className="border-b border-gray-900 bg-gray-950/80 backdrop-blur-md sticky top-0 z-50 px-6 py-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Terminal className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-white tracking-tight flex items-center gap-2">
                Acode APK Companion & Installer
                <span className="text-[10px] font-mono bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  v1.2.0 Stable
                </span>
              </h1>
              <p className="text-xs text-gray-400">
                Configure manifestos de C++, Cordova e React. Simule instalações OTA integradas ao GitHub.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs bg-gray-900/60 p-2 rounded-xl border border-gray-800">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            <span className="text-gray-400">Simulador de APK Online Conectado</span>
          </div>
        </div>
      </header>

      {/* Main Content Dashboard Layout */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 grid grid-cols-1 xl:grid-cols-12 gap-6">
        
        {/* Left Side: Controller Workspace Panel (Col size 7) */}
        <div className="xl:col-span-7 flex flex-col space-y-6">
          
          {/* Main Workspace Navigation Tabs */}
          <div className="flex border-b border-gray-900 pb-0.5 space-x-1 overflow-x-auto scrollbar-none">
            <button
              onClick={() => setActiveTab("builder")}
              className={`pb-3 text-xs font-semibold px-4 border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === "builder"
                  ? "border-emerald-500 text-white"
                  : "border-transparent text-gray-400 hover:text-white"
              }`}
            >
              <Wand2 className="w-4 h-4 text-emerald-400" />
              Configuração & IA Manifest
            </button>

            <button
              onClick={() => setActiveTab("github")}
              className={`pb-3 text-xs font-semibold px-4 border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === "github"
                  ? "border-emerald-500 text-white"
                  : "border-transparent text-gray-400 hover:text-white"
              }`}
            >
              <Github className="w-4 h-4 text-purple-400" />
              Sincronização GitHub
            </button>

            <button
              onClick={() => setActiveTab("guide")}
              className={`pb-3 text-xs font-semibold px-4 border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === "guide"
                  ? "border-emerald-500 text-white"
                  : "border-transparent text-gray-400 hover:text-white"
              }`}
            >
              <BookOpen className="w-4 h-4 text-sky-400" />
              Guia Acode & Compilação
            </button>
          </div>

          {/* Active View Port */}
          <div className="flex-1">
            {activeTab === "builder" && (
              <ManifestBuilder 
                onGenerate={handleGeneratedFiles} 
                metadata={metadata} 
                setMetadata={setMetadata} 
              />
            )}
            
            {activeTab === "github" && (
              <GitHubIntegration onLoadManifest={handleLoadManifestFromRemote} />
            )}

            {activeTab === "guide" && (
              <AcodeGuide />
            )}
          </div>
        </div>

        {/* Right Side: Smartphone Simulation Panel (Col size 5) */}
        <div className="xl:col-span-5 flex flex-col space-y-6 border-t xl:border-t-0 xl:border-l border-gray-900 pt-6 xl:pt-0 xl:pl-6">
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-white flex items-center gap-1.5">
              <Smartphone className="w-4 h-4 text-emerald-400" />
              Smartphone Virtual Android (Simulador OTA)
            </h3>
            <p className="text-xs text-gray-400">
              Veja em tempo real como o seu instalador e o mecanismo de atualização do GitHub Pages se comportam.
            </p>
          </div>

          {/* Live Mobile Frame & Server Controls */}
          <InstallerSimulator currentManifest={currentManifest} />
        </div>

      </main>

      {/* Footer bar */}
      <footer className="border-t border-gray-900 py-6 px-6 bg-gray-950/40 text-center text-[11px] text-gray-500 max-w-7xl w-full mx-auto">
        <p>
          Acode APK Companion & Installer • Desenvolvido com React, Tailwind CSS e Google Gemini 3.5.
        </p>
        <p className="mt-1">
          Hospede dados JSON do manifesto no GitHub de forma pública e obtenha caminhos de modificação e atualizações OTA instantâneas.
        </p>
      </footer>
    </div>
  );
}
