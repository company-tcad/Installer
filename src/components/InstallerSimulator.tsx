import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Smartphone, ShieldAlert, DownloadCloud, AlertCircle, Play, X,
  CheckCircle2, ArrowRight, RefreshCw, FileJson, Info, HelpCircle, Flame, Server, Wifi
} from "lucide-react";
import { UpdateManifest } from "../types";

interface InstallerSimulatorProps {
  currentManifest: UpdateManifest | null;
}

export default function InstallerSimulator({ currentManifest }: InstallerSimulatorProps) {
  // Simulator State
  const [activeTab, setActiveTab] = useState<"screen" | "server">("screen");
  
  // Hosted Server state (mimicking the raw.githubusercontent.com dynamic configuration)
  const [hostedAppName, setHostedAppName] = useState("");
  const [hostedVersion, setHostedVersion] = useState("1.0.0");
  const [hostedVersionCode, setHostedVersionCode] = useState(1);
  const [hostedPermissions, setHostedPermissions] = useState<string[]>([]);
  const [hostedChangelog, setHostedChangelog] = useState("");
  const [hostedApkUrl, setHostedApkUrl] = useState("");

  // Simulated Device State
  const [isAppInstalled, setIsAppInstalled] = useState(false);
  const [installedVersion, setInstalledVersion] = useState("");
  const [installedVersionCode, setInstalledVersionCode] = useState(0);
  const [installedPermissions, setInstalledPermissions] = useState<string[]>([]);
  const [isAppRunning, setIsAppRunning] = useState(false);
  
  // Installer progress/dialog state
  const [installProgress, setInstallProgress] = useState(0);
  const [installing, setInstalling] = useState(false);
  const [installerStep, setInstallerStep] = useState<"prompt" | "progress" | "success" | "none">("none");
  const [isUpdateNoticeVisible, setIsUpdateNoticeVisible] = useState(false);

  // Sync simulated GitHub raw server configuration whenever a new manifest is loaded
  useEffect(() => {
    if (currentManifest) {
      setHostedAppName(currentManifest.appName || "My Acode App");
      setHostedVersion(currentManifest.version || "1.0.0");
      setHostedVersionCode(currentManifest.versionCode || 1);
      setHostedPermissions(currentManifest.requiredPermissions || ["android.permission.INTERNET"]);
      setHostedChangelog(currentManifest.changelog || "Primeira versão estável.");
      setHostedApkUrl(currentManifest.apkUrl || "https://github.com/usuario/repositorio/releases/download/v1.0.0/app.apk");

      // Reset simulated device
      setIsAppInstalled(false);
      setIsAppRunning(false);
      setInstallerStep("prompt");
    } else {
      // Default placeholder initial manifest
      setHostedAppName("Acode Video Player");
      setHostedVersion("1.0.0");
      setHostedVersionCode(1);
      setHostedPermissions(["android.permission.INTERNET", "android.permission.READ_EXTERNAL_STORAGE"]);
      setHostedChangelog("Versão inicial do reprodutor com aceleração de renderização C++");
      setHostedApkUrl("https://github.com/Acode-Android/Acode/releases/download/v1.0.0/app-release.apk");
      
      setInstallerStep("prompt");
    }
  }, [currentManifest]);

  // Handle fresh installation / update installation sequence
  const startInstallation = () => {
    setInstallerStep("progress");
    setInstalling(true);
    setInstallProgress(0);

    const interval = setInterval(() => {
      setInstallProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setInstalling(false);
          setInstallerStep("success");
          setIsAppInstalled(true);
          
          // Save installed specs
          setInstalledVersion(hostedVersion);
          setInstalledVersionCode(hostedVersionCode);
          setInstalledPermissions(hostedPermissions);
          setIsUpdateNoticeVisible(false);
          return 100;
        }
        return prev + 8;
      });
    }, 120);
  };

  // Simulated app running checking updates
  const checkUpdatesFromInsideApp = () => {
    if (hostedVersionCode > installedVersionCode) {
      setIsUpdateNoticeVisible(true);
    } else {
      alert(`Você já está na versão mais recente (${installedVersion})! Nenhuma atualização pendente no GitHub.`);
    }
  };

  // Simulate updating the hosted JSON directly on the cloud server
  const simulateHostingBump = () => {
    // Automatically bump version code and version string on our mock "GitHub raw"
    const nextCode = hostedVersionCode + 1;
    const nextVersion = `1.${nextCode - 1}.0`;
    setHostedVersionCode(nextCode);
    setHostedVersion(nextVersion);
    setHostedChangelog(`v${nextVersion} lançada com sucesso no GitHub:\n- Correção de bugs de NDK\n- Redução no consumo de memória RAM\n- Novas otimizações de vídeo`);
    
    // Alert the user
    alert(`Metadados do GitHub atualizados! Você modificou o 'update.json' hospedado para a v${nextVersion}.`);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="simulator-grid-container">
      {/* LEFT COLUMN: Controls, mock Github server configuration */}
      <div className="lg:col-span-5 space-y-6">
        {/* Simulator controls */}
        <div className="bg-gray-900/40 border border-gray-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-2 text-emerald-400">
            <Server className="w-5 h-5" />
            <h3 className="font-semibold text-white text-base">Modificar Dados Hospedados</h3>
          </div>
          <p className="text-xs text-gray-400 leading-relaxed">
            Aqui você gerencia o <code>update.json</code> simulando seu host online (como GitHub Pages). Altere os parâmetros abaixo para ver o aplicativo instalado reagir e alertar sobre atualizações em tempo real!
          </p>

          <div className="space-y-3 bg-gray-950 p-4 rounded-xl border border-gray-850">
            <div className="flex justify-between items-center text-xs">
              <span className="text-gray-400 font-mono">update.json (No Servidor)</span>
              <span className="flex items-center gap-1 text-emerald-500 font-medium">
                <Wifi className="w-3.5 h-3.5 animate-pulse" /> Live Host
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div>
                <label className="block text-[10px] text-gray-500">Versão Hospedada (String)</label>
                <input
                  type="text"
                  value={hostedVersion}
                  onChange={e => setHostedVersion(e.target.value)}
                  className="w-full px-2 py-1 bg-gray-900 border border-gray-800 rounded text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-[10px] text-gray-500">Código de Versão (Version Code)</label>
                <input
                  type="number"
                  value={hostedVersionCode}
                  onChange={e => setHostedVersionCode(parseInt(e.target.value) || 1)}
                  className="w-full px-2 py-1 bg-gray-900 border border-gray-800 rounded text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-[10px] text-gray-500">Changelog / Novidades</label>
                <textarea
                  value={hostedChangelog}
                  onChange={e => setHostedChangelog(e.target.value)}
                  rows={2}
                  className="w-full px-2 py-1 bg-gray-900 border border-gray-800 rounded text-white text-[11px] resize-none"
                />
              </div>
            </div>

            {/* Quick Actions */}
            <div className="pt-2">
              <button
                onClick={simulateHostingBump}
                className="w-full py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <Flame className="w-4 h-4 text-orange-400 animate-pulse" />
                Simular Nova Versão (Bump v{hostedVersionCode + 1})
              </button>
            </div>
          </div>

          <div className="p-3 bg-gray-950/40 rounded-xl border border-gray-800 text-[10px] text-gray-500 flex gap-2">
            <Info className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
            <div>
              <strong>Como testar:</strong> <br />
              1. Instale o APK no smartphone à direita.<br />
              2. Abra o aplicativo.<br />
              3. Clique em <strong>"Simular Nova Versão"</strong> acima para simular que você subiu uma nova versão no GitHub.<br />
              4. Toque no botão de buscar atualizações no celular para ver o update OTA rodando!
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: Realistic interactive Android smartphone mockup */}
      <div className="lg:col-span-7 flex justify-center">
        <div className="relative w-[310px] h-[610px] bg-gray-950 rounded-[44px] p-3 shadow-2xl border-[6px] border-gray-800 flex flex-col overflow-hidden" id="android-device-mock">
          {/* Speaker / Camera Notch */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-gray-800 rounded-b-2xl z-40 flex items-center justify-center gap-2">
            <div className="w-12 h-1.5 bg-gray-900 rounded-full"></div>
            <div className="w-2.5 h-2.5 bg-gray-900 rounded-full"></div>
          </div>

          {/* Android Screen Container */}
          <div className="w-full h-full bg-gray-900 rounded-[38px] overflow-hidden relative flex flex-col pt-6 pb-2 text-white font-sans">
            {/* Simulated Android Status Bar */}
            <div className="flex justify-between items-center px-4 text-[10px] text-gray-400 py-1.5 border-b border-gray-800/20">
              <span className="font-mono">10:42 AM</span>
              <div className="flex items-center gap-1.5">
                <Wifi className="w-3 h-3 text-emerald-400" />
                <span className="font-mono text-[9px] bg-emerald-500/10 text-emerald-400 px-1 rounded">5G</span>
                <span className="font-mono">87%</span>
              </div>
            </div>

            {/* SCREEN CONTENT AREA */}
            <div className="flex-1 overflow-y-auto p-4 flex flex-col relative bg-gray-900/95 scrollbar-none">
              <AnimatePresence mode="wait">
                
                {/* 1. FRESH INSTALL DIALOG (Android Package Installer) */}
                {installerStep === "prompt" && (
                  <motion.div
                    key="installer-prompt"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    className="flex-1 flex flex-col justify-between py-2"
                  >
                    <div className="space-y-5">
                      {/* App Header */}
                      <div className="flex items-center gap-3 border-b border-gray-800 pb-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center font-bold text-gray-950 text-xl shadow-lg shadow-emerald-500/10 shrink-0">
                          {hostedAppName.charAt(0)}
                        </div>
                        <div>
                          <h4 className="font-semibold text-sm text-white">{hostedAppName}</h4>
                          <span className="text-[10px] text-gray-500 font-mono block leading-tight">{hostedVersion} (v{hostedVersionCode})</span>
                          <span className="text-[9px] text-emerald-500 font-mono">Modificável via GitHub</span>
                        </div>
                      </div>

                      {/* Prompt Question */}
                      <p className="text-xs text-gray-300">
                        Deseja instalar uma atualização para este aplicativo existente? Seus dados existentes não serão perdidos.
                      </p>

                      {/* Permissions warning */}
                      <div className="bg-gray-950 p-3.5 rounded-xl border border-gray-850 space-y-2">
                        <span className="text-[10px] font-semibold text-amber-500 flex items-center gap-1 uppercase tracking-wider">
                          <ShieldAlert className="w-3.5 h-3.5" /> Permissões Solicitadas
                        </span>
                        
                        <div className="space-y-1">
                          {hostedPermissions.length > 0 ? (
                            hostedPermissions.map(p => (
                              <div key={p} className="text-[9px] text-gray-400 flex items-center gap-1 font-mono truncate">
                                <span className="text-emerald-500 font-bold">•</span> {p.replace("android.permission.", "")}
                              </div>
                            ))
                          ) : (
                            <span className="text-[9px] text-gray-500">Nenhuma permissão especial</span>
                          )}
                        </div>
                      </div>

                      {/* Changelog visual box */}
                      <div className="bg-gray-950 p-3.5 rounded-xl border border-gray-850 text-[10px] text-gray-400 space-y-1 font-mono">
                        <span className="text-white block text-[9px] font-bold">HISTÓRICO / MUDANÇAS:</span>
                        <p className="leading-normal whitespace-pre-line text-gray-400">
                          {hostedChangelog}
                        </p>
                      </div>
                    </div>

                    {/* Bottom Actions */}
                    <div className="flex gap-2 pt-4 border-t border-gray-850">
                      <button
                        onClick={() => setInstallerStep("none")}
                        className="flex-1 py-2 bg-gray-950 hover:bg-gray-900 border border-gray-800 rounded-xl text-xs text-gray-400 cursor-pointer text-center"
                      >
                        Cancelar
                      </button>
                      <button
                        onClick={startInstallation}
                        className="flex-1 py-2 bg-emerald-500 hover:bg-emerald-600 text-gray-950 text-xs font-semibold rounded-xl cursor-pointer text-center"
                      >
                        Instalar
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* 2. PROGRESS DIALOG */}
                {installerStep === "progress" && (
                  <motion.div
                    key="installer-progress"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex-1 flex flex-col justify-center items-center space-y-6"
                  >
                    <DownloadCloud className="w-12 h-12 text-emerald-400 animate-bounce" />
                    
                    <div className="text-center space-y-2">
                      <h4 className="text-sm font-semibold text-white">Instalando...</h4>
                      <p className="text-[10px] text-gray-400 font-mono">Escrevendo APK e alocando pacotes</p>
                    </div>

                    {/* Progress Bar container */}
                    <div className="w-48 h-2 bg-gray-950 rounded-full overflow-hidden border border-gray-850">
                      <div 
                        className="h-full bg-emerald-500 transition-all duration-100 rounded-full"
                        style={{ width: `${installProgress}%` }}
                      ></div>
                    </div>
                    <span className="text-[10px] text-gray-400 font-mono">{installProgress}%</span>
                  </motion.div>
                )}

                {/* 3. SUCCESS DIALOG */}
                {installerStep === "success" && (
                  <motion.div
                    key="installer-success"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex-1 flex flex-col justify-center items-center space-y-6 text-center"
                  >
                    <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                      <CheckCircle2 className="w-8 h-8" />
                    </div>

                    <div className="space-y-1">
                      <h4 className="text-sm font-semibold text-white">App Instalado!</h4>
                      <p className="text-[10px] text-gray-400">O pacote {hostedAppName} v{hostedVersion} já está pronto.</p>
                    </div>

                    <button
                      onClick={() => {
                        setInstallerStep("none");
                        setIsAppRunning(true);
                      }}
                      className="px-6 py-2 bg-emerald-500 hover:bg-emerald-600 text-gray-950 text-xs font-semibold rounded-xl flex items-center gap-1 transition-all cursor-pointer"
                    >
                      Abrir Aplicativo <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </motion.div>
                )}

                {/* 4. RUNNING THE INSTALLED APP (The C++ / Webview Interface simulation) */}
                {isAppRunning && installerStep === "none" && (
                  <motion.div
                    key="app-interface"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex-1 flex flex-col justify-between"
                  >
                    {/* Simulated Application Appbar */}
                    <div className="flex justify-between items-center bg-gray-950 px-3 py-2 rounded-xl border border-gray-850">
                      <div className="flex items-center gap-1.5">
                        <div className="w-6 h-6 rounded-md bg-emerald-500 flex items-center justify-center text-gray-950 text-[11px] font-bold">
                          {hostedAppName.charAt(0)}
                        </div>
                        <span className="text-xs font-bold text-white truncate max-w-[130px]">{hostedAppName}</span>
                      </div>
                      <span className="text-[8px] text-gray-500 font-mono bg-gray-900 px-1.5 py-0.5 rounded border border-gray-800">
                        v{installedVersion}
                      </span>
                    </div>

                    {/* Simulated Application Canvas/View */}
                    <div className="flex-1 my-4 bg-gray-950 rounded-2xl border border-gray-850 p-4 flex flex-col justify-center items-center text-center space-y-4">
                      {/* App graphic based on type */}
                      <div className="w-14 h-14 rounded-full bg-emerald-500/5 flex items-center justify-center text-emerald-400">
                        <Smartphone className="w-6 h-6" />
                      </div>

                      <div className="space-y-1">
                        <h5 className="text-xs font-bold text-white">Executando Atividade</h5>
                        <p className="text-[9px] text-gray-400 leading-normal max-w-[200px]">
                          Esta tela simula o seu código C++ NDK compilado ou sua WebView React rodando no Android.
                        </p>
                      </div>

                      <div className="space-y-2 w-full pt-2">
                        {/* Interactive check updates inside client code */}
                        <button
                          onClick={checkUpdatesFromInsideApp}
                          className="w-full py-2 bg-emerald-500 hover:bg-emerald-600 text-gray-950 text-[10px] font-bold rounded-lg transition-colors cursor-pointer"
                        >
                          Buscar Atualizações no GitHub
                        </button>
                        
                        <button
                          onClick={() => {
                            setIsAppRunning(false);
                            setInstallerStep("prompt");
                          }}
                          className="w-full py-1.5 bg-gray-900 hover:bg-gray-850 text-gray-400 text-[9px] rounded-lg border border-gray-800 transition-colors cursor-pointer"
                        >
                          Sair do Aplicativo
                        </button>
                      </div>
                    </div>

                    {/* Bottom Status Panel */}
                    <div className="p-2.5 bg-emerald-950/10 border border-emerald-900/10 rounded-xl text-center text-[9px] text-gray-400">
                      Permissões Ativas: {installedPermissions.map(p => p.replace("android.permission.", "")).join(", ")}
                    </div>
                  </motion.div>
                )}

                {/* 5. APP NOT INSTALLED DEFAULT PREVIEW */}
                {!isAppInstalled && installerStep === "none" && !isAppRunning && (
                  <motion.div
                    key="uninstalled-preview"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex-1 flex flex-col justify-center items-center text-center space-y-4 py-8"
                  >
                    <Smartphone className="w-12 h-12 text-gray-700" />
                    <div className="space-y-1">
                      <h4 className="text-sm font-semibold text-white">Nenhum APK Instalado</h4>
                      <p className="text-[10px] text-gray-500 leading-normal max-w-[180px]">
                        Nenhum aplicativo foi carregado no smartphone virtual ainda.
                      </p>
                    </div>

                    <button
                      onClick={() => setInstallerStep("prompt")}
                      className="px-4 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 rounded-xl text-[10px] font-semibold transition-all cursor-pointer"
                    >
                      Abrir Instalador APK
                    </button>
                  </motion.div>
                )}

              </AnimatePresence>
            </div>

            {/* Simulated Android Navigation Bar */}
            <div className="flex justify-around items-center px-6 pt-1">
              <button 
                onClick={() => {
                  if (isAppRunning) {
                    setIsAppRunning(false);
                    setInstallerStep("none");
                  } else {
                    setInstallerStep("prompt");
                  }
                }}
                className="w-3.5 h-3.5 border-2 border-gray-500 rounded-sm hover:border-white transition-colors cursor-pointer"
                title="Voltar"
              ></button>
              <button 
                onClick={() => {
                  setIsAppRunning(false);
                  setInstallerStep("none");
                }}
                className="w-3.5 h-3.5 border-2 border-gray-500 rounded-full hover:border-white transition-colors cursor-pointer"
                title="Home"
              ></button>
              <button 
                onClick={() => {
                  if (isAppInstalled) {
                    setIsAppRunning(true);
                    setInstallerStep("none");
                  }
                }}
                className="w-3.5 h-3.5 bg-gray-500 hover:bg-white rounded-full transition-colors cursor-pointer"
                title="Apps Recentes"
              ></button>
            </div>
          </div>

          {/* OVERLAY: OTA Android Dynamic System Dialog Update alert */}
          <AnimatePresence>
            {isUpdateNoticeVisible && (
              <motion.div
                initial={{ opacity: 0, y: 120 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 120 }}
                className="absolute inset-x-4 bottom-14 bg-gray-950 rounded-2xl border border-emerald-500/30 p-4 shadow-xl z-50 space-y-3"
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-1.5 text-emerald-400 font-semibold text-[11px]">
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Atualização Disponível!</span>
                  </div>
                  <button 
                    onClick={() => setIsUpdateNoticeVisible(false)}
                    className="text-gray-500 hover:text-white"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-white font-mono block">
                    Nova versão: v{hostedVersion} (v{hostedVersionCode})
                  </span>
                  <div className="text-[9px] text-gray-400 bg-gray-900 p-2 rounded-lg max-h-20 overflow-y-auto font-mono whitespace-pre-line leading-normal border border-gray-850">
                    {hostedChangelog}
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => setIsUpdateNoticeVisible(false)}
                    className="flex-1 py-1 bg-gray-900 hover:bg-gray-850 text-gray-400 text-[10px] rounded-lg border border-gray-800 cursor-pointer"
                  >
                    Agora Não
                  </button>
                  <button
                    onClick={() => {
                      setIsUpdateNoticeVisible(false);
                      setIsAppRunning(false);
                      setInstallerStep("prompt");
                    }}
                    className="flex-1 py-1 bg-emerald-500 hover:bg-emerald-600 text-gray-950 text-[10px] font-bold rounded-lg cursor-pointer"
                  >
                    Atualizar (OTA)
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
