export const attackPathGraph = {
  nodes: [
    { id: "internet", name: "External access", type: "entry", description: "An attacker can reach the public-facing service.", severity: 3, exploitability: 8, assetImpact: 2, x: 90, y: 250 },
    { id: "weak-auth", name: "Weak admin authentication", type: "vulnerability", description: "The exposed admin portal accepts weak or reused credentials.", severity: 8, exploitability: 8, assetImpact: 7, x: 320, y: 150 },
    { id: "public-app", name: "Exploit public application", type: "technique", description: "The attacker exploits the exposed application to gain an initial foothold.", severity: 9, exploitability: 7, assetImpact: 8, x: 550, y: 150 },
    { id: "app-server", name: "Application server", type: "asset", description: "The application server hosts business logic and service credentials.", severity: 7, exploitability: 5, assetImpact: 8, x: 790, y: 150 },
    { id: "credential-theft", name: "Credential theft", type: "technique", description: "Credentials stored on the compromised server may be extracted and reused.", severity: 8, exploitability: 7, assetImpact: 9, x: 550, y: 350 },
    { id: "db-access", name: "Over-privileged database account", type: "vulnerability", description: "The service account has more database privileges than the application requires.", severity: 9, exploitability: 6, assetImpact: 10, x: 320, y: 450 },
    { id: "customer-db", name: "Customer database", type: "asset", description: "Stores sensitive customer records and account data.", severity: 10, exploitability: 5, assetImpact: 10, x: 790, y: 450 },
    { id: "legacy-host", name: "Legacy workstation", type: "asset", description: "An isolated lab asset with no valid transition from the external entry point.", severity: 5, exploitability: 2, assetImpact: 4, x: 90, y: 500 },
  ],
  edges: [
    { from: "internet", to: "weak-auth" },
    { from: "weak-auth", to: "public-app" },
    { from: "public-app", to: "app-server" },
    { from: "app-server", to: "credential-theft" },
    { from: "credential-theft", to: "db-access" },
    { from: "db-access", to: "customer-db" },
    { from: "db-access", to: "public-app" },
  ],
};
