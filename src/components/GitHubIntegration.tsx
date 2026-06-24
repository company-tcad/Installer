import React, { useState } from "react";
import { Github, Search, Download, AlertTriangle, Check, RefreshCw, FileCode, ExternalLink } from "lucide-react";
import { ReleaseInfo, UpdateManifest } from "../types";

interface GitHubIntegrationProps {
  onLoadManifest: (manifest: UpdateManifest, apkUrl?: string) => void;
}

export default function GitHubIntegration({ onLoadManifest }: GitHubIntegrationProps) {
  const [repoInput, setRepoInput] = useState("Acode-Android/Acode");
  const [customJsonUrl, setCustomJsonUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [releases, setReleases] = useState<ReleaseInfo[]>([]);
  const [activeTab, setActiveTab] = useState<"repo" | "url">("repo");

  // Fetch Releases from GitHub Repo
  const handleFetchRepo = async () => {
    if (!repoInput.includes("/")) {
      setError("Por favor, digite o repositório no formato 'usuario/repositorio'");
      return;
    }
    setLoading(true);
    setError(null);
    setReleases([]);

    try {
      const response = await fetch(`https://api.github.com/repos/${repoInput}/releases`);
      if (!response.ok) {
        throw new Error("Não foi possível encontrar este repositório ou os limites da API do GitHub foram atingidos.");
      }
      const data = await response.json();
      
      if (!Array.isArray(data) || data.length === 0) {
        throw new Error("Nenhum lançamento (Release) encontrado neste repositório.");
      }

      const formattedReleases: ReleaseInfo[] = data.map((release: any) => {
        // Find APK assets
        const apkAsset = release.assets?.find((asset: any) => asset.name.endsWith(".apk"));
        return {
          id: release.id,
          name: release.name || release.tag_name,
          tagName: release.tag_name,
          body: release.body || "",
          apkUrl: apkAsset ? apkAsset.browser_download_url : "",
          apkName: apkAsset ? apkAsset.name : "Nenhum APK anexado",
          publishedAt: new Date(release.published_at).toLocaleDateString("pt-BR"),
          downloadCount: apkAsset ? apkAsset.download_count : 0,
        };
      });

      setReleases(formattedReleases);
      
      // Auto-load update.json if available
      tryToLoadRepoUpdateJson(repoInput, formattedReleases[0]?.apkUrl);
    } catch (err: any) {
      setError(err.message || "Erro de conexão com o GitHub.");
    } finally {
      setLoading(false);
    }
  };

  // Try to load raw update.json from the main/master branch of the repo
  const tryToLoadRepoUpdateJson = async (repo: string, fallbackApkUrl: string) => {
    const branches = ["main", "master", "dev"];
    for (const branch of branches) {
      try {
        const url = `https://raw.githubusercontent.com/${repo}/${branch}/update.json`;
        const res = await fetch(url);
        if (res.ok) {
          const manifest: UpdateManifest = await res.json();
          onLoadManifest(manifest, fallbackApkUrl);
          return;
        }
      } catch (e) {
        // quiet fallback
      }
    }
    
    // If update.json not found in repo, generate a virtual update manifest based on latest release
    if (releases.length > 0) {
      const latest = releases[0];
      const mockManifest: UpdateManifest = {
        appName: repo.split("/")[1],
        packageName: `com.github.${repo.replace("/", ".")}`,
        version: latest.tagName.replace("v", ""),
        versionCode: 1,
        apkUrl: latest.apkUrl || "https://example.com/mock.apk",
        changelog: latest.body || "Atualização obtida do GitHub",
        minSdkVersion: 21,
        requiredPermissions: ["android.permission.INTERNET"]
      };
      onLoadManifest(mockManifest, latest.apkUrl);
    }
  };

  // Fetch Manifest directly from custom URL
  const handleFetchCustomJson = async () => {
    if (!customJsonUrl.startsWith("http")) {
      setError("Por favor, digite uma URL válida começando com http/https");
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(customJsonUrl);
      if (!response.ok) {
        throw new Error("Não foi possível acessar esta URL. Verifique as configurações de CORS ou digite novamente.");
      }
      const manifest: UpdateManifest = await response.json();
      
      if (!manifest.appName || !manifest.version) {
        throw new Error("JSON inválido. O arquivo precisa conter pelo menos appName e version.");
      }

      onLoadManifest(manifest, manifest.apkUrl);
    } catch (err: any) {
      setError(err.message || "Erro ao ler dados JSON externos.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-900/40 border border-gray-800 rounded-2xl p-6 space-y-6" id="github-integration-card">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-emerald-400 mb-1">
          <Github className="w-5 h-5" />
          <h3 className="font-semibold text-white text-lg">Integração GitHub & Fontes de Dados</h3>
        </div>
        <p className="text-xs text-gray-400">
          Sincronize com um repositório GitHub para baixar APKs e ler metadados dinâmicos hospedados online.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-800 p-0.5 bg-gray-950/60 rounded-lg">
        <button
          onClick={() => setActiveTab("repo")}
          className={`flex-1 py-2 text-xs font-medium rounded-md transition-all ${
            activeTab === "repo"
              ? "bg-gray-900 text-white shadow-sm border border-gray-800/80"
              : "text-gray-400 hover:text-white"
          }`}
        >
          Repositório do GitHub
        </button>
        <button
          onClick={() => setActiveTab("url")}
          className={`flex-1 py-2 text-xs font-medium rounded-md transition-all ${
            activeTab === "url"
              ? "bg-gray-900 text-white shadow-sm border border-gray-800/80"
              : "text-gray-400 hover:text-white"
          }`}
        >
          URL do Manifest Customizado (JSON)
        </button>
      </div>

      {/* Body Inputs */}
      {activeTab === "repo" ? (
        <div className="space-y-3">
          <label className="block text-xs font-medium text-gray-400">Repositório do GitHub (usuário/projeto)</label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <span className="absolute inset-y-0 left-3 flex items-center text-gray-500">
                github.com/
              </span>
              <input
                type="text"
                value={repoInput}
                onChange={(e) => setRepoInput(e.target.value)}
                placeholder="Acode-Android/Acode"
                className="w-full pl-28 pr-4 py-2.5 bg-gray-950/80 border border-gray-800 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500/80 transition-colors font-mono"
              />
            </div>
            <button
              onClick={handleFetchRepo}
              disabled={loading}
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-800 text-gray-950 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              {loading ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  Sincronizar
                </>
              )}
            </button>
          </div>
          <p className="text-[10px] text-gray-500">
            A sincronização tentará ler os lançamentos (Releases) de APKs oficiais e arquivos <code>update.json</code> na raiz para o simulador.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <label className="block text-xs font-medium text-gray-400">URL Raw do JSON (update.json ou manifest.json)</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={customJsonUrl}
              onChange={(e) => setCustomJsonUrl(e.target.value)}
              placeholder="https://raw.githubusercontent.com/usuario/projeto/main/update.json"
              className="flex-1 px-4 py-2.5 bg-gray-950/80 border border-gray-800 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500/80 transition-colors font-mono"
            />
            <button
              onClick={handleFetchCustomJson}
              disabled={loading}
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-800 text-gray-950 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              {loading ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <FileCode className="w-4 h-4" />
                  Carregar
                </>
              )}
            </button>
          </div>
          <p className="text-[10px] text-gray-500">
            Útil para testar seu próprio arquivo de configuração dinâmica hospedado no GitHub Pages, Gist, Vercel ou outro host.
          </p>
        </div>
      )}

      {/* States */}
      {error && (
        <div className="p-3 bg-red-950/20 border border-red-900/30 rounded-xl flex gap-2 items-start text-xs text-red-400">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          <div>{error}</div>
        </div>
      )}

      {/* Releases Output */}
      {activeTab === "repo" && releases.length > 0 && (
        <div className="space-y-3 border-t border-gray-800/80 pt-4">
          <h4 className="text-xs font-semibold text-white flex items-center gap-1.5">
            <Check className="w-4 h-4 text-emerald-400" />
            Lançamentos Encontrados no GitHub:
          </h4>
          
          <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
            {releases.map((release, idx) => (
              <div
                key={release.id}
                className={`p-3 rounded-xl border transition-colors ${
                  idx === 0 
                    ? "bg-emerald-500/5 border-emerald-500/20" 
                    : "bg-gray-950/40 border-gray-800"
                }`}
              >
                <div className="flex justify-between items-start gap-2 mb-1.5">
                  <div>
                    <span className="text-xs font-semibold text-white flex items-center gap-1">
                      {release.name}
                      {idx === 0 && (
                        <span className="text-[9px] px-1.5 py-0.5 bg-emerald-500/15 text-emerald-400 rounded-full font-medium">
                          Mais Recente
                        </span>
                      )}
                    </span>
                    <span className="text-[10px] text-gray-500">Publicado em {release.publishedAt}</span>
                  </div>
                  <span className="text-[10px] font-mono text-gray-400 bg-gray-900 px-2 py-0.5 rounded-md border border-gray-800">
                    {release.tagName}
                  </span>
                </div>

                <div className="flex justify-between items-center text-[11px] text-gray-400 mt-2 bg-gray-950/80 p-2 rounded-lg border border-gray-800/40">
                  <div className="flex items-center gap-1.5 truncate">
                    <Download className="w-3.5 h-3.5 text-gray-500" />
                    <span className="truncate max-w-[200px] font-mono text-gray-300">{release.apkName}</span>
                  </div>
                  {release.apkUrl ? (
                    <div className="flex gap-2 shrink-0">
                      <span className="text-[10px] text-gray-500 mt-0.5">{release.downloadCount} downloads</span>
                      <button
                        onClick={() => {
                          const mockManifest: UpdateManifest = {
                            appName: repoInput.split("/")[1],
                            packageName: `com.github.${repoInput.replace("/", ".")}`,
                            version: release.tagName.replace("v", ""),
                            versionCode: 1,
                            apkUrl: release.apkUrl,
                            changelog: release.body || "Lançamento do GitHub",
                            minSdkVersion: 21,
                            requiredPermissions: ["android.permission.INTERNET"]
                          };
                          onLoadManifest(mockManifest, release.apkUrl);
                        }}
                        className="px-2 py-0.5 bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-gray-950 text-[10px] font-medium rounded-md border border-emerald-500/20 hover:border-transparent transition-all cursor-pointer"
                      >
                        Carregar no Simulador
                      </button>
                    </div>
                  ) : (
                    <span className="text-[10px] text-amber-500 font-medium">Nenhum .apk nesta release</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
