import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-initialized Gemini API client
let aiClient: GoogleGenAI | null = null;
function getAI(): GoogleGenAI {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error("GEMINI_API_KEY environment variable is required. Please set it in Settings > Secrets.");
    }
    aiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

// API endpoint to generate APK manifest and build files
app.post("/api/generate-manifest", async (req, res) => {
  try {
    const { description, metadata } = req.body;
    
    if (!description) {
      res.status(400).json({ error: "Description is required" });
      return;
    }

    const ai = getAI();
    const appName = metadata.name || "My Acode App";
    const packageName = metadata.packageName || "com.acode.myapp";
    const versionName = metadata.version || "1.0.0";
    const versionCode = metadata.versionCode || 1;
    const permissions = metadata.permissions || ["android.permission.INTERNET"];
    const templateType = metadata.templateType || "native_cpp";

    let templatePrompt = "";
    if (templateType === "native_cpp") {
      templatePrompt = `Generate a Native C++ Android application template.
      Include a C++ source file (sourceFileName: 'main.cpp') using standard Android NDK headers like <android/log.h>, <android_native_app_glue.h>, or standard JNI entry points.
      Make sure the AndroidManifest.xml has <activity android:name="android.app.NativeActivity"> and references the native library name "main".`;
    } else if (templateType === "react_webview") {
      templatePrompt = `Generate an Android Hybrid Webview wrapper (ideal for React apps).
      Include a Java source file (sourceFileName: 'MainActivity.java') which initializes an android.webkit.WebView, enables Javascript, loads a local index.html, and handles custom hardware back button triggers.
      Provide a 'config.xml' for Cordova compatibility.`;
    } else {
      templatePrompt = `Generate an Acode IDE Custom Android App Plugin.
      Include a javascript source file (sourceFileName: 'plugin.js') showing how to hook into the Acode IDE api to bundle, preview, and build an APK via custom toolchains.
      Provide a 'plugin.json' manifest defining properties, author, and entries.`;
    }

    const systemInstruction = `You are an expert mobile developer specializing in Android NDK (C++), Cordova/React hybrid WebViews, and custom toolchains for Acode IDE.
    Your task is to generate complete, high-quality boilerplate code and configuration files matching the specified application parameters.
    Keep the files fully commented, explaining the purpose of each native configuration, especially permissions and manifests.
    The response MUST be a clean, valid JSON object matching the requested schema. Do not truncate the code.`;

    const prompt = `
    User wishes to build an app described as: "${description}"
    
    App Specifications:
    - App Name: ${appName}
    - Package Name: ${packageName}
    - Version: ${versionName} (Code: ${versionCode})
    - Template Type: ${templateType}
    - Permissions needed: ${permissions.join(", ")}
    
    ${templatePrompt}
    
    Also generate a configuration file 'update.json' which acts as the hosted data source (e.g. on GitHub Pages/raw).
    The 'update.json' is a manifest that allows this app (once compiled) to dynamically fetch update files, display changelogs, check versions, and verify permissions. It should have fields:
    "appName", "packageName", "version", "versionCode", "apkUrl", "changelog", "minSdkVersion", "requiredPermissions"
    
    Generate detailed, practical build instructions 'setupSteps' for how to use these files in Acode IDE with the APK compilation tools or terminal.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            androidManifest: { 
              type: Type.STRING, 
              description: "Full content of AndroidManifest.xml with appropriate headers, tags, application, activity declarations, and user-specified permissions." 
            },
            sourceCode: { 
              type: Type.STRING, 
              description: "Complete, valid main source code (C++ native activity loop, WebView Java launcher, or Acode plugin integration code)." 
            },
            sourceFileName: { 
              type: Type.STRING, 
              description: "The file name of the source code (e.g. main.cpp, MainActivity.java, plugin.js)." 
            },
            stringsXml: { 
              type: Type.STRING, 
              description: "Content of res/values/strings.xml holding the app_name string and custom labels." 
            },
            updateJson: { 
              type: Type.STRING, 
              description: "Raw JSON content for update.json update manifest. Include realistic fallback urls pointing to a simulated GitHub release or raw master file." 
            },
            configXml: { 
              type: Type.STRING, 
              description: "Content of config.xml or plugin.json depending on template type. Leave empty if not applicable." 
            },
            buildGradle: { 
              type: Type.STRING, 
              description: "Simplified app/build.gradle script detailing dependencies, compileSdkVersion, and NDK config." 
            },
            setupSteps: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Step-by-step human instructions in Portuguese on how to use, upload to GitHub, customize, and build this template inside Acode."
            }
          },
          required: ["androidManifest", "sourceCode", "sourceFileName", "stringsXml", "updateJson", "setupSteps"]
        }
      }
    });

    const content = response.text;
    res.json(JSON.parse(content));
  } catch (error: any) {
    console.error("Error generating manifest:", error);
    res.status(500).json({ error: error.message || "An unexpected error occurred." });
  }
});

// Start the server
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
