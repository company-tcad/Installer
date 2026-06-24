import React, { useState } from "react";
import { 
  FileCode, Cpu, Code2, Layers, Play, Check, Copy, Wand2, Sparkles, 
  HelpCircle, RefreshCw, AlertCircle, FileJson, Settings, ShieldCheck 
} from "lucide-react";
import { AppMetadata, GeneratedFiles, UpdateManifest } from "../types";

interface ManifestBuilderProps {
  onGenerate: (files: GeneratedFiles) => void;
  metadata: AppMetadata;
  setMetadata: React.Dispatch<React.SetStateAction<AppMetadata>>;
}

const PRESET_PERMISSIONS = [
  { value: "android.permission.INTERNET", label: "Internet (INTERNET)", desc: "Acesso à rede" },
  { value: "android.permission.READ_EXTERNAL_STORAGE", label: "Ler Armazenamento", desc: "Acesso a arquivos" },
  { value: "android.permission.WRITE_EXTERNAL_STORAGE", label: "Gravar Armazenamento", desc: "Salvar arquivos" },
  { value: "android.permission.CAMERA", label: "Câmera (CAMERA)", desc: "Capturar fotos/vídeos" },
  { value: "android.permission.ACCESS_FINE_LOCATION", label: "Localização GPS", desc: "Localização precisa" },
  { value: "android.permission.RECORD_AUDIO", label: "Microfone (RECORD_AUDIO)", desc: "Gravar voz" },
];

export default function ManifestBuilder({ onGenerate, metadata, setMetadata }: ManifestBuilderProps) {
  const [description, setDescription] = useState(
    "Um player de vídeo local minimalista acelerado por hardware para Acode Android com suporte a carregar legendas externas."
  );
  const [aiGenerating, setAiGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<keyof GeneratedFiles | "all">("androidManifest");
  const [files, setFiles] = useState<GeneratedFiles | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  // Fallback / standard static generation if API is not accessible
  const generateStaticFallback = (meta: AppMetadata, desc: string): GeneratedFiles => {
    const isCpp = meta.templateType === "native_cpp";
    const isWebview = meta.templateType === "react_webview";
    
    const manifestXml = `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="${meta.packageName}"
    android:versionCode="${meta.versionCode}"
    android:versionName="${meta.version}">

    <!-- Permissões Requeridas -->
    ${meta.permissions.map(p => `<uses-permission android:name="${p}" />`).join("\n    ")}

    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="@string/app_name"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@android:style/Theme.DeviceDefault.NoActionBar">
        
        ${isCpp ? `
        <!-- Native C++ Activity Container -->
        <activity
            android:name="android.app.NativeActivity"
            android:configChanges="orientation|keyboardHidden|screenSize"
            android:exported="true"
            android:hardwareAccelerated="true">
            
            <!-- Carrega o arquivo compilado libmain.so -->
            <meta-data android:name="android.app.lib_name" android:value="main" />
            
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>` : `
        <!-- Standard Android Activity container -->
        <activity
            android:name=".MainActivity"
            android:configChanges="orientation|keyboardHidden|screenSize"
            android:exported="true">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>`}
    </application>
</manifest>`;

    const sourceCode = isCpp ? `/**
 * MainActivity.cpp - Boilerplate Native C++ para Acode APK Compiler
 * Desenvolvido para rodar de forma leve e minimalista no Android NDK.
 */
#include <android/log.h>
#include <android_native_app_glue.h>
#include <jni.h>

#define LOG_TAG "AcodeNativeApp"
#define LOGI(...) __android_log_print(ANDROID_LOG_INFO, LOG_TAG, __VA_ARGS__)
#define LOGE(...) __android_log_print(ANDROID_LOG_ERROR, LOG_TAG, __VA_ARGS__)

/**
 * Ponto de Entrada da Atividade Nativa C++
 */
void android_main(struct android_app* state) {
    LOGI("Aplicativo Nativa C++ para Acode inicializado!");
    
    // Certifique-se de que a cola do app não seja descartada
    app_dummy();

    // Loop de eventos nativo do Android
    while (1) {
        int ident;
        int events;
        struct android_poll_source* source;

        // Processa todos os eventos de sistema pendentes
        while ((ident = ALooper_pollAll(0, nullptr, &events, (void**)&source)) >= 0) {
            if (source != nullptr) {
                source->process(state, source);
            }

            // Se a atividade estiver sendo finalizada, encerra o loop nativo
            if (state->destroyRequested != 0) {
                LOGI("Atividade finalizada. Liberando NDK e C++!");
                return;
            }
        }

        // Loop de renderização / lógica do app nativo aqui
        // Exemplo: glClear(GL_COLOR_BUFFER_BIT);
    }
}` : isWebview ? `package ${meta.packageName};

import android.app.Activity;
import android.os.Bundle;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;

/**
 * MainActivity.java - Renderizador de React Webview para o Acode
 */
public class MainActivity extends Activity {
    private WebView myWebView;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        
        // Cria a instância do WebView programaticamente para máxima performance
        myWebView = new WebView(this);
        WebSettings webSettings = myWebView.getSettings();
        
        // Permite Javascript para o SPA (React, Vue, etc)
        webSettings.setJavaScriptEnabled(true);
        webSettings.setDomStorageEnabled(true);
        webSettings.setDatabaseEnabled(true);
        webSettings.setAllowFileAccess(true);
        webSettings.setAllowContentAccess(true);
        
        // Mantém o WebViewClient para abrir links dentro da própria aplicação
        myWebView.setWebViewClient(new WebViewClient());
        
        // Carrega o index.html gerado na pasta assets
        myWebView.loadUrl("file:///android_asset/www/index.html");
        
        setContentView(myWebView);
    }

    @Override
    public void onBackPressed() {
        // Trata o botão de voltar no histórico do WebView se aplicável
        if (myWebView.canGoBack()) {
            myWebView.goBack();
        } else {
            super.onBackPressed();
        }
    }
}` : `/**
 * Acode Plugin API Integration - plugin.js
 */
const acode = window.acode;

class MyAcodePlugin {
    async init() {
        acode.addInitCallback((editor) => {
            console.log("Acode APK Builder Plugin Carregado!");
            this.registerCommands();
        });
    }

    registerCommands() {
        acode.defineCommand("Build APK", () => {
            acode.alert("Iniciando build do APK", "Gerando Manifest e compilando código nativo...");
            // Comunicação direta com a API de compilação
        });
    }

    async destroy() {
        acode.removeCommand("Build APK");
    }
}

if (window.acode) {
    const plugin = new MyAcodePlugin();
    acode.setPluginInit(plugin.init.bind(plugin), plugin.destroy.bind(plugin));
}`;

    const stringsXml = `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <string name="app_name">${meta.name}</string>
    <string name="app_package">${meta.packageName}</string>
    <string name="welcome_message">Bem-vindo ao ${meta.name}!</string>
</resources>`;

    const updateJson = `{
  "appName": "${meta.name}",
  "packageName": "${meta.packageName}",
  "version": "${meta.version}",
  "versionCode": ${meta.versionCode},
  "apkUrl": "https://raw.githubusercontent.com/${meta.githubRepo || "usuario/repositorio"}/main/releases/app-release.apk",
  "changelog": "Build inicial do projeto via Acode APK Installer Companion.\\n\\n- Versão gerada em tempo real.\\n- Modifique este JSON e hospede-o em seu repositório para testar atualizações automáticas.",
  "minSdkVersion": 21,
  "requiredPermissions": ${JSON.stringify(meta.permissions, null, 4)}
}`;

    const setupSteps = [
      "1. Instale o Acode editor no seu celular Android.",
      "2. Crie uma nova pasta chamada 'AndroidProject' no seu dispositivo.",
      "3. Cole o arquivo 'AndroidManifest.xml' gerado no diretório raiz do projeto.",
      `4. Crie uma pasta 'src' e adicione o arquivo '${isCpp ? "main.cpp" : isWebview ? "MainActivity.java" : "plugin.js"}' com o código-fonte nativo fornecido nesta ferramenta.`,
      "5. Use o plugin do Acode ou um emulador termux rodando Gradle para invocar a tarefa 'assembleRelease'.",
      "6. Publique o APK compilado no GitHub Releases e copie o link direto.",
      "7. Crie o arquivo 'update.json' com as URLs finais e publique no GitHub Pages ou branch principal.",
      "8. Carregue o link do seu 'update.json' no Simulador para testar o sistema de atualização OTA instantâneo!"
    ];

    return {
      androidManifest: manifestXml,
      sourceCode,
      sourceFileName: isCpp ? "main.cpp" : isWebview ? "MainActivity.java" : "plugin.js",
      stringsXml,
      updateJson,
      setupSteps,
      configXml: isWebview ? `<?xml version='1.0' encoding='utf-8'?>\n<widget id="${meta.packageName}" version="${meta.version}" xmlns="http://www.w3.org/ns/widgets">\n    <name>${meta.name}</name>\n    <description>${desc}</description>\n    <content src="index.html" />\n    <preference name="HardwareAccelerated" value="true" />\n</widget>` : "",
      buildGradle: `apply plugin: 'com.android.application'\n\nandroid {\n    compileSdkVersion 33\n    defaultConfig {\n        applicationId "${meta.packageName}"\n        minSdkVersion 21\n        targetSdkVersion 33\n        versionCode ${meta.versionCode}\n        versionName "${meta.version}"\n    }\n}`
    };
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setAiGenerating(true);
    setError(null);

    try {
      const response = await fetch("/api/generate-manifest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          description,
          metadata
        }),
      });

      if (!response.ok) {
        throw new Error("API indisponível ou erro no servidor Gemini.");
      }

      const generated: GeneratedFiles = await response.json();
      setFiles(generated);
      onGenerate(generated);
    } catch (err: any) {
      console.warn("Fainting back to local high-fidelity generator templates...");
      // Seamlessly fall back to client-side high fidelity template generator
      const generated = generateStaticFallback(metadata, description);
      setFiles(generated);
      onGenerate(generated);
    } finally {
      setAiGenerating(false);
    }
  };

  const handleCopy = (text: string, tabName: string) => {
    navigator.clipboard.writeText(text);
    setCopied(tabName);
    setTimeout(() => setCopied(null), 2000);
  };

  const handlePermissionToggle = (perm: string) => {
    setMetadata(prev => {
      const hasPerm = prev.permissions.includes(perm);
      const newPerms = hasPerm 
        ? prev.permissions.filter(p => p !== perm)
        : [...prev.permissions, perm];
      return { ...prev, permissions: newPerms };
    });
  };

  return (
    <div className="bg-gray-900/40 border border-gray-800 rounded-2xl p-6 space-y-6" id="manifest-builder-card">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-emerald-400 mb-1">
          <Sparkles className="w-5 h-5 text-emerald-400" />
          <h3 className="font-semibold text-white text-lg">Configuração da APK & IA Manifest</h3>
        </div>
        <p className="text-xs text-gray-400">
          Edite as opções básicas ou descreva o funcionamento do seu app para a IA gerar todos os manifests estruturados.
        </p>
      </div>

      <form onSubmit={handleGenerate} className="space-y-4">
        {/* Basic Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="block text-xs font-medium text-gray-400">Nome do Aplicativo</label>
            <input
              type="text"
              value={metadata.name}
              onChange={e => setMetadata(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Ex: Player de Video Acode"
              className="w-full px-3 py-2 bg-gray-950/80 border border-gray-800 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500/80 transition-colors"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-medium text-gray-400">ID do Pacote (Package ID)</label>
            <input
              type="text"
              value={metadata.packageName}
              onChange={e => setMetadata(prev => ({ ...prev, packageName: e.target.value }))}
              placeholder="Ex: com.acode.videoplayer"
              className="w-full px-3 py-2 bg-gray-950/80 border border-gray-800 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500/80 transition-colors font-mono"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-medium text-gray-400">Versão</label>
            <input
              type="text"
              value={metadata.version}
              onChange={e => setMetadata(prev => ({ ...prev, version: e.target.value }))}
              placeholder="Ex: 1.0.0"
              className="w-full px-3 py-2 bg-gray-950/80 border border-gray-800 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500/80 transition-colors"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-medium text-gray-400">Versão de Código (Version Code)</label>
            <input
              type="number"
              value={metadata.versionCode}
              onChange={e => setMetadata(prev => ({ ...prev, versionCode: parseInt(e.target.value) || 1 }))}
              className="w-full px-3 py-2 bg-gray-950/80 border border-gray-800 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500/80 transition-colors"
              required
            />
          </div>
        </div>

        {/* Template Type Selector */}
        <div className="space-y-2">
          <label className="block text-xs font-medium text-gray-400">Arquitetura de Compilação (Acode Plugin, Webview ou C++)</label>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => setMetadata(prev => ({ ...prev, templateType: "native_cpp" }))}
              className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                metadata.templateType === "native_cpp"
                  ? "bg-emerald-500/15 border-emerald-500/60 text-white shadow-sm"
                  : "bg-gray-950/40 border-gray-800 text-gray-400 hover:text-white"
              }`}
            >
              <Cpu className="w-4 h-4 mx-auto mb-1 text-emerald-400" />
              <div className="text-xs font-semibold">C++ Nativo</div>
              <div className="text-[9px] text-gray-500 mt-0.5">Android NDK</div>
            </button>

            <button
              type="button"
              onClick={() => setMetadata(prev => ({ ...prev, templateType: "react_webview" }))}
              className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                metadata.templateType === "react_webview"
                  ? "bg-emerald-500/15 border-emerald-500/60 text-white shadow-sm"
                  : "bg-gray-950/40 border-gray-800 text-gray-400 hover:text-white"
              }`}
            >
              <Code2 className="w-4 h-4 mx-auto mb-1 text-purple-400" />
              <div className="text-xs font-semibold">React WebView</div>
              <div className="text-[9px] text-gray-500 mt-0.5">Híbrido Cordova</div>
            </button>

            <button
              type="button"
              onClick={() => setMetadata(prev => ({ ...prev, templateType: "acode_plugin" }))}
              className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                metadata.templateType === "acode_plugin"
                  ? "bg-emerald-500/15 border-emerald-500/60 text-white shadow-sm"
                  : "bg-gray-950/40 border-gray-800 text-gray-400 hover:text-white"
              }`}
            >
              <Layers className="w-4 h-4 mx-auto mb-1 text-sky-400" />
              <div className="text-xs font-semibold">Acode Plugin</div>
              <div className="text-[9px] text-gray-500 mt-0.5">Acode Extensão</div>
            </button>
          </div>
        </div>

        {/* Permissions Select Checklist */}
        <div className="space-y-1.5">
          <label className="block text-xs font-medium text-gray-400">Permissões de Sistema (AndroidManifest)</label>
          <div className="grid grid-cols-2 gap-2 bg-gray-950/60 p-3 rounded-xl border border-gray-800">
            {PRESET_PERMISSIONS.map(perm => {
              const checked = metadata.permissions.includes(perm.value);
              return (
                <button
                  type="button"
                  key={perm.value}
                  onClick={() => handlePermissionToggle(perm.value)}
                  className={`flex items-start text-left gap-2 p-1.5 rounded-lg transition-colors cursor-pointer ${
                    checked ? "bg-emerald-500/5 text-emerald-300" : "text-gray-400 hover:text-white"
                  }`}
                >
                  <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                    checked ? "border-emerald-500 bg-emerald-500" : "border-gray-700 bg-transparent"
                  }`}>
                    {checked && <Check className="w-2.5 h-2.5 text-gray-950 stroke-[3]" />}
                  </div>
                  <div>
                    <span className="text-[11px] font-semibold block leading-tight">{perm.label}</span>
                    <span className="text-[9px] text-gray-500">{perm.desc}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Natural Language AI Prompt */}
        <div className="space-y-1">
          <label className="block text-xs font-medium text-gray-400 flex justify-between">
            <span>Descrição do Aplicativo (Instruções para IA)</span>
            <span className="text-[10px] text-gray-500 font-mono">Modifique para personalizar códigos nativos</span>
          </label>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            rows={2}
            className="w-full px-3 py-2 bg-gray-950/80 border border-gray-800 rounded-lg text-xs text-white focus:outline-none focus:border-emerald-500/80 transition-colors resize-none"
            placeholder="Descreva o que o app fará para o C++ e Manifest se ajustarem..."
            required
          />
        </div>

        {/* Action Button */}
        <button
          type="submit"
          disabled={aiGenerating}
          className="w-full py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 disabled:from-emerald-800 disabled:to-teal-900 text-gray-950 text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md"
        >
          {aiGenerating ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Processando & Compilando Estrutura com Gemini...</span>
            </>
          ) : (
            <>
              <Wand2 className="w-4 h-4" />
              <span>Gerar Arquivos Manifest & Código Nativo</span>
            </>
          )}
        </button>
      </form>

      {/* Generated Code Display Panels */}
      {files && (
        <div className="space-y-4 border-t border-gray-800/80 pt-4" id="manifest-builder-results">
          {/* File Tab selectors */}
          <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-none">
            <button
              onClick={() => setActiveTab("androidManifest")}
              className={`px-3 py-1.5 text-[10px] font-medium rounded-md whitespace-nowrap transition-colors flex items-center gap-1 cursor-pointer ${
                activeTab === "androidManifest"
                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                  : "bg-transparent text-gray-400 hover:text-white border border-transparent"
              }`}
            >
              <FileCode className="w-3.5 h-3.5" />
              AndroidManifest.xml
            </button>

            <button
              onClick={() => setActiveTab("sourceCode")}
              className={`px-3 py-1.5 text-[10px] font-medium rounded-md whitespace-nowrap transition-colors flex items-center gap-1 cursor-pointer ${
                activeTab === "sourceCode"
                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                  : "bg-transparent text-gray-400 hover:text-white border border-transparent"
              }`}
            >
              <Code2 className="w-3.5 h-3.5" />
              {files.sourceFileName}
            </button>

            <button
              onClick={() => setActiveTab("stringsXml")}
              className={`px-3 py-1.5 text-[10px] font-medium rounded-md whitespace-nowrap transition-colors flex items-center gap-1 cursor-pointer ${
                activeTab === "stringsXml"
                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                  : "bg-transparent text-gray-400 hover:text-white border border-transparent"
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              strings.xml
            </button>

            <button
              onClick={() => setActiveTab("updateJson")}
              className={`px-3 py-1.5 text-[10px] font-medium rounded-md whitespace-nowrap transition-colors flex items-center gap-1 cursor-pointer ${
                activeTab === "updateJson"
                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                  : "bg-transparent text-gray-400 hover:text-white border border-transparent"
              }`}
            >
              <FileJson className="w-3.5 h-3.5" />
              update.json (Dados Hospedados)
            </button>

            {files.buildGradle && (
              <button
                onClick={() => setActiveTab("buildGradle")}
                className={`px-3 py-1.5 text-[10px] font-medium rounded-md whitespace-nowrap transition-colors flex items-center gap-1 cursor-pointer ${
                  activeTab === "buildGradle"
                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                    : "bg-transparent text-gray-400 hover:text-white border border-transparent"
                }`}
              >
                <Settings className="w-3.5 h-3.5" />
                build.gradle
              </button>
            )}
          </div>

          {/* Active Tab Content Viewer */}
          <div className="relative bg-gray-950 p-4 rounded-xl border border-gray-850">
            {/* Action panel inside viewer */}
            <div className="absolute top-3 right-3 flex items-center gap-2 z-10">
              <button
                onClick={() => {
                  let textToCopy = "";
                  if (activeTab === "androidManifest") textToCopy = files.androidManifest;
                  else if (activeTab === "sourceCode") textToCopy = files.sourceCode;
                  else if (activeTab === "stringsXml") textToCopy = files.stringsXml;
                  else if (activeTab === "updateJson") textToCopy = files.updateJson;
                  else if (activeTab === "buildGradle") textToCopy = files.buildGradle || "";
                  
                  handleCopy(textToCopy, activeTab);
                }}
                className="p-1.5 bg-gray-900 hover:bg-gray-800 text-gray-400 hover:text-emerald-400 rounded-md border border-gray-800/60 transition-colors cursor-pointer"
                title="Copiar Código"
              >
                {copied === activeTab ? (
                  <span className="text-[10px] text-emerald-400 px-1 font-semibold flex items-center gap-1">
                    <Check className="w-3 h-3" /> Copiado!
                  </span>
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
            </div>

            {/* Render active content */}
            <pre className="text-[11px] font-mono leading-relaxed text-gray-300 overflow-x-auto max-h-[350px] pt-4 scrollbar">
              {activeTab === "androidManifest" && files.androidManifest}
              {activeTab === "sourceCode" && files.sourceCode}
              {activeTab === "stringsXml" && files.stringsXml}
              {activeTab === "updateJson" && files.updateJson}
              {activeTab === "buildGradle" && files.buildGradle}
            </pre>
          </div>

          {/* Setup steps guide */}
          {files.setupSteps && files.setupSteps.length > 0 && (
            <div className="bg-emerald-950/10 border border-emerald-900/20 p-4 rounded-xl space-y-2">
              <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1">
                <Check className="w-4 h-4" /> Passo-a-passo sugerido pela IA:
              </span>
              <ul className="space-y-1 text-[11px] text-gray-400 list-none pl-0">
                {files.setupSteps.map((step, idx) => (
                  <li key={idx} className="flex gap-2">
                    <span className="text-emerald-500 font-bold font-mono shrink-0">✓</span>
                    <span>{step}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
