const fs = require('fs');
const path = require('path');

const controllersDir = path.join(process.cwd(), 'backend', 'src', 'controllers');
const routesDir = path.join(process.cwd(), 'backend', 'src', 'routes');

const controllerFiles = fs.readdirSync(controllersDir).filter(f => f.endsWith('.ts'));
const routeFiles = fs.readdirSync(routesDir).filter(f => f.endsWith('.ts'));

// Gather all method names from all controllers
const allMethods = {}; // { 'controllerFilename': ['method1', 'method2'] }
for (const file of controllerFiles) {
  const content = fs.readFileSync(path.join(controllersDir, file), 'utf8');
  const baseName = path.basename(file, '.ts'); // e.g. 'bookController'
  
  // Try to find the exported instance name, e.g. export const bookController = new BookController();
  const match = content.match(/export const (\w+) = new/);
  const instanceName = match ? match[1] : baseName;

  const methods = new Set();
  
  // Match `async methodName(req...`
  const methodRegex = /async\s+(\w+)\s*\(/g;
  let m;
  while ((m = methodRegex.exec(content)) !== null) {
    methods.add(m[1]);
  }
  
  allMethods[instanceName] = Array.from(methods);
}

// Check which methods are actually called in routes
const wiredMethods = {}; // { 'instanceName': Set(['method1']) }
for (const file of routeFiles) {
  const content = fs.readFileSync(path.join(routesDir, file), 'utf8');
  for (const [instanceName, methods] of Object.entries(allMethods)) {
    if (!wiredMethods[instanceName]) wiredMethods[instanceName] = new Set();
    
    for (const method of methods) {
      // Look for instanceName.method or instanceName.method.bind
      if (content.includes(`${instanceName}.${method}`) || 
          content.includes(`Controller.${method}`) // For SearchController which is a class
      ) {
        wiredMethods[instanceName].add(method);
      }
    }
  }
}

// SearchController is special (static methods)
if (allMethods['searchController']) {
  const wired = wiredMethods['searchController'] || new Set();
  for (const file of routeFiles) {
    const content = fs.readFileSync(path.join(routesDir, file), 'utf8');
    if (content.includes('SearchController.search')) wired.add('search');
    if (content.includes('SearchController.suggest')) wired.add('suggest');
    if (content.includes('SearchController.reindex')) wired.add('reindex');
  }
  wiredMethods['searchController'] = wired;
}

// Print missing methods
console.log("=== WRITTEN BUT NOT WIRED ===");
for (const [instanceName, methods] of Object.entries(allMethods)) {
  const wired = wiredMethods[instanceName] || new Set();
  const notWired = methods.filter(m => !wired.has(m) && m !== 'constructor');
  if (notWired.length > 0) {
    console.log(`${instanceName}: ${notWired.join(', ')}`);
  }
}
