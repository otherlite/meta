import { promises as fs } from "fs";
import path from "path";
import { LocalMCP } from "types/mcp";

export async function discoverProjectMCPs(
  projectRoot: string
): Promise<LocalMCP[]> {
  const mcps: LocalMCP[] = [];

  // Look for MCPs in project root mcps directory
  const projectMCPsDir = path.join(projectRoot, "mcps");

  try {
    await fs.access(projectMCPsDir);
    const files = await fs.readdir(projectMCPsDir);
    const mcpFiles = files.filter(
      (file) =>
        file.endsWith(".ts") || file.endsWith(".js") || file.endsWith(".mcp.ts")
    );

    for (const file of mcpFiles) {
      try {
        const mcp = await loadMCPFromFile(path.join(projectMCPsDir, file));
        if (mcp) {
          mcps.push(mcp);
        }
      } catch (error) {
        console.warn(`Failed to load MCP from ${file}:`, error);
      }
    }
  } catch (error) {
    // Directory might not exist, that's ok
    console.log(`No project MCPs directory found at ${projectMCPsDir}`);
  }

  return mcps;
}

export async function loadMCP(
  mcpId: string,
  projectRoot: string
): Promise<LocalMCP | null> {
  // Try different locations
  const possiblePaths = [
    path.join(projectRoot, "mcps", `${mcpId}.ts`),
    path.join(projectRoot, "mcps", `${mcpId}.js`),
    path.join(projectRoot, "mcps", `${mcpId}.mcp.ts`),
    path.join(projectRoot, "mcps", `${mcpId}/index.ts`),
    path.join(projectRoot, "mcps", `${mcpId}/index.js`),
  ];

  for (const filePath of possiblePaths) {
    try {
      await fs.access(filePath);
      return await loadMCPFromFile(filePath);
    } catch {
      // File doesn't exist, try next location
      continue;
    }
  }

  return null;
}

async function loadMCPFromFile(filePath: string): Promise<LocalMCP> {
  // In a real implementation, you would need to compile TypeScript files
  // For now, we assume JavaScript files or use a TypeScript runtime
  try {
    // Dynamic import
    const module = await import(filePath);

    // Find the default export or a class ending with MCP
    let MCPClass = module.default;
    if (!MCPClass) {
      // Look for a class ending with MCP
      const mcpClassKey = Object.keys(module).find(
        (key) => key.endsWith("MCP") && typeof module[key] === "function"
      );
      if (mcpClassKey) {
        MCPClass = module[mcpClassKey];
      }
    }

    if (!MCPClass) {
      throw new Error(`No MCP class found in ${filePath}`);
    }

    const instance = new MCPClass();

    // Check if it has the required methods
    if (!instance.definition || !instance.execute) {
      throw new Error(
        `Invalid MCP class in ${filePath}. Must have 'definition' and 'execute' properties.`
      );
    }

    return {
      definition: instance.definition,
      execute: instance.execute.bind(instance),
      validate: instance.validate?.bind(instance),
    };
  } catch (error) {
    throw new Error(
      `Failed to load MCP from ${filePath}: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}
