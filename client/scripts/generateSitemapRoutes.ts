/**
 * Build-time script to generate sitemap routes
 * Fetches products from Firebase and writes routes to a JSON file
 * 
 * Run with: npx tsx scripts/generateSitemapRoutes.ts
 */
import { writeFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, query, orderBy } from "firebase/firestore";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function loadEnvVars(): Promise<Record<string, string>> {
  const envFile = resolve(__dirname, "../.env");
  const envVars: Record<string, string> = {};

  try {
    const { readFile } = await import("fs/promises");
    const envContent = await readFile(envFile, "utf-8");
    envContent.split("\n").forEach(line => {
      const match = line.match(/^([^=]+)=(.*)$/);
      if (match) {
        envVars[match[1].trim()] = match[2].trim().replace(/^["']|["']$/g, "");
      }
    });
  } catch (error) {
    console.warn("Could not read .env file, using process.env");
  }

  return envVars;
}

async function generateRoutes() {
  const envVars = await loadEnvVars();

  const firebaseConfig = {
    apiKey: envVars.NEXT_PUBLIC_FIREBASE_API_KEY || process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: envVars.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: envVars.NEXT_PUBLIC_FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: envVars.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId:
      envVars.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ||
      process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: envVars.NEXT_PUBLIC_FIREBASE_APP_ID || process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  };
  // Note: "/" is excluded as vite-plugin-sitemap automatically adds it
  const staticRoutes = [
    "/produkter",
    "/velg-modell",
    "/faq",
    "/referanser",
    "/kalkulator",
    "/kalkulator/innstillinger",
    "/kalkulator/detaljer",
    "/kontakt",
    // "/takk",
  ];

  try {
    // Initialize Firebase
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);

    // Fetch products
    const productsRef = collection(db, "products");
    const q = query(productsRef, orderBy("name"));
    const querySnapshot = await getDocs(q);

    // Generate product routes
    const productRoutes = querySnapshot.docs.map((doc) => `/produkter/${doc.id}`);

    // Combine routes and remove duplicates
    const routeSet = new Set<string>();
    for (const route of staticRoutes) {
      routeSet.add(route);
    }
    for (const route of productRoutes) {
      routeSet.add(route);
    }
    const allRoutes = Array.from(routeSet);

    // Write to file
    const outputPath = resolve(__dirname, "../src/config/sitemapRoutes.json");
    writeFileSync(outputPath, JSON.stringify(allRoutes, null, 2), "utf-8");

    console.log(`✅ Generated ${allRoutes.length} sitemap routes (${productRoutes.length} products)`);
  } catch (error) {
    console.warn("⚠️  Failed to fetch products, using static routes only:", error);
    
    // Write static routes as fallback
    const outputPath = resolve(__dirname, "../src/config/sitemapRoutes.json");
    writeFileSync(outputPath, JSON.stringify(staticRoutes, null, 2), "utf-8");
    
    console.log(`✅ Generated ${staticRoutes.length} static sitemap routes`);
  }
}

generateRoutes().catch(console.error);

