import React from "react";
import { BookOpen, Code, Github, Terminal, Info, Cpu, CheckCircle } from "lucide-react";

export default function AcodeGuide() {
  return (
    <div className="space-y-6 text-gray-300" id="acode-guide-container">
      {/* Header */}
      <div className="border-b border-gray-800 pb-4">
        <h2 className="text-xl font-semibold text-white flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-emerald-400" />
          Guia de Compilação & Hospedagem APK
        </h2>
        <p className="text-sm text-gray-400 mt-1">
          Aprenda a compilar seu código no Acode Android, hospedar seus dados no GitHub e habilitar atualizações dinâmicas.
        </p>
      </div>

      {/* Steps Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gray-900/60 p-5 rounded-xl border border-gray-800 space-y-3">
          <div className="flex items-center gap-2 text-emerald-400 font-medium text-sm">
            <span className="w-6 h-6 rounded-full bg-emerald-500/10 flex items-center justify-center text-xs">1</span>
            Instalação no Acode
          </div>
          <p className="text-xs text-gray-400">
            Abra o editor <strong>Acode</strong> no seu celular Android. Vá em Configurações &gt; Plugins, pesquise por plugins de compilação ou integre terminal como o <strong>Termux</strong> via API de atalhos do Acode para rodar compiladores NDK ou Cordova.
          </p>
        </div>

        <div className="bg-gray-900/60 p-5 rounded-xl border border-gray-800 space-y-3">
          <div className="flex items-center gap-2 text-emerald-400 font-medium text-sm">
            <span className="w-6 h-6 rounded-full bg-emerald-500/10 flex items-center justify-center text-xs">2</span>
            Hospedagem Dinâmica no GitHub
          </div>
          <p className="text-xs text-gray-400">
            Hospede o arquivo <code>update.json</code> na branch principal do seu repositório. O link "Raw" do GitHub servirá como API. Toda vez que você lançar uma versão nova, modifique esse arquivo no GitHub e o aplicativo instalado detectará automaticamente!
          </p>
        </div>
      </div>

      {/* Code Snippet for Dynamic Update Checking */}
      <div className="bg-gray-950 p-5 rounded-xl border border-gray-800 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-white flex items-center gap-2">
            <Code className="w-4 h-4 text-purple-400" />
            Código C++ ou Java para Verificação de Updates
          </h3>
          <span className="text-xs text-gray-500 font-mono">OTA Engine</span>
        </div>
        <p className="text-xs text-gray-400">
          Você pode incluir esta rotina de rede no seu código nativo (C++ ou Java) ou React (JavaScript) para verificar periodicamente o arquivo JSON hospedado no GitHub e disparar o instalador do sistema:
        </p>
        <pre className="text-[11px] font-mono bg-gray-900/80 p-3 rounded-lg overflow-x-auto text-emerald-300 border border-gray-800 max-h-60">
{`// Exemplo em JavaScript / React Hybrid para checar atualizações
async function checkUpdates() {
  const GITHUB_RAW_URL = "https://raw.githubusercontent.com/seu-usuario/seu-repositorio/main/update.json";
  try {
    const response = await fetch(GITHUB_RAW_URL);
    const data = await response.json();
    
    const INSTALLED_VERSION_CODE = 1; // Código local da versão
    
    if (data.versionCode > INSTALLED_VERSION_CODE) {
      console.log("Nova versão encontrada: " + data.version);
      
      // Abre o diálogo do Android para instalar o APK apontado
      if (window.AndroidBridge) {
        window.AndroidBridge.promptApkInstall(data.apkUrl);
      } else {
        // Fallback para abrir no navegador
        window.open(data.apkUrl, "_blank");
      }
    }
  } catch (error) {
    console.error("Erro ao buscar atualizações dinâmicas", error);
  }
}`}
        </pre>
      </div>

      {/* Tips */}
      <div className="bg-emerald-950/20 p-4 rounded-xl border border-emerald-900/30 space-y-2">
        <h4 className="text-sm font-medium text-emerald-400 flex items-center gap-1.5">
          <Info className="w-4 h-4" />
          Vantagem de Dados Hospedados
        </h4>
        <p className="text-xs text-gray-400 leading-relaxed">
          Como o <strong>update.json</strong> é lido em tempo real de onde estiver hospedado (GitHub, Vercel ou servidor próprio), você não precisa recompilar o APK inteiro para anunciar um update crítico ou alterar os metadados do aplicativo. O instalador inteligente lê esses parâmetros dinamicamente, permitindo modificação instantânea de banners, avisos de manutenção, changelogs e rotas de download.
        </p>
      </div>
    </div>
  );
}
