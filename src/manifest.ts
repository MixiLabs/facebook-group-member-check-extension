import { defineManifest } from "@crxjs/vite-plugin";

export default defineManifest({
  manifest_version: 3,
  name: "Facebook Group Member Check",
  version: "2.0.0",
  description:
    "Advanced Facebook group membership checker with queue processing and modern UI",
  permissions: [
    "sidePanel",
    "activeTab",
    "tabs",
    "storage",
    "alarms",
    "notifications",
  ],
  host_permissions: ["https://www.facebook.com/*"],
  side_panel: {
    default_path: "src/pages/sidebar/index.html",
  },
  background: {
    service_worker: "src/pages/background/index.ts",
  },
  content_scripts: [
    {
      matches: [
        "https://www.facebook.com/groups/*",
        "https://www.facebook.com/*",
      ],
      js: ["src/pages/content/index.ts"],
    },
  ],
  action: {
    default_title: "Open Group Member Check",
  },
  icons: {
    "16": "icon-16.png",
    "32": "icon-32.png",
    "48": "icon-48.png",
    "128": "icon-128.png",
  },
});
