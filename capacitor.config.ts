import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
    appId: "fr.goralys.app",
    appName: "Goralys",
    webDir: "out",
    server: { hostname: "app.goralys.fr", androidScheme: "https" },
    android: {
        webContentsDebuggingEnabled: true,
    },
};

export default config;
