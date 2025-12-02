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
import {
  getFirestore,
  collection,
  getDocs,
  query,
  orderBy,
} from "firebase/firestore";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function loadEnvVars(): Promise<Record<string, string>> {
  const envFile = resolve(__dirname, "../.env");
  const envVars: Record<string, string> = {};

  try {
    const { readFile } = await import("fs/promises");
    const envContent = await readFile(envFile, "utf-8");
    envContent.split("\n").forEach((line) => {
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
    apiKey:
      envVars.NEXT_PUBLIC_FIREBASE_API_KEY ||
      process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain:
      envVars.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ||
      process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId:
      envVars.NEXT_PUBLIC_FIREBASE_PROJECT_ID ||
      process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket:
      envVars.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ||
      process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId:
      envVars.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ||
      process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId:
      envVars.NEXT_PUBLIC_FIREBASE_APP_ID ||
      process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
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

  // Validate Firebase config
  const hasFirebaseConfig =
    firebaseConfig.apiKey &&
    firebaseConfig.authDomain &&
    firebaseConfig.projectId &&
    firebaseConfig.storageBucket &&
    firebaseConfig.messagingSenderId &&
    firebaseConfig.appId;

  if (!hasFirebaseConfig) {
    console.warn(
      "⚠️  Firebase configuration incomplete, using static routes only"
    );
    console.warn("   Missing env vars:", {
      apiKey: !firebaseConfig.apiKey,
      authDomain: !firebaseConfig.authDomain,
      projectId: !firebaseConfig.projectId,
      storageBucket: !firebaseConfig.storageBucket,
      messagingSenderId: !firebaseConfig.messagingSenderId,
      appId: !firebaseConfig.appId,
    });

    const outputPath = resolve(__dirname, "../src/config/sitemapRoutes.json");
    writeFileSync(outputPath, JSON.stringify(staticRoutes, null, 2), "utf-8");
    console.log(`✅ Generated ${staticRoutes.length} static sitemap routes`);
    return;
  }

  try {
    // Initialize Firebase
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);

    console.log(
      `📡 Connecting to Firebase project: ${firebaseConfig.projectId}`
    );

    // Fetch products - try with orderBy("model") like the app does, fallback to simple query
    const productsRef = collection(db, "products");
    let querySnapshot;

    try {
      // Use orderBy("model") to match how the app fetches products
      const q = query(productsRef, orderBy("model"));
      querySnapshot = await getDocs(q);
    } catch (orderError) {
      // If ordering fails (e.g., no "model" field or index missing), try without ordering
      console.warn(
        "⚠️  Could not order by 'model', fetching without order:",
        orderError instanceof Error ? orderError.message : String(orderError)
      );
      querySnapshot = await getDocs(productsRef);
    }

    console.log(`📦 Found ${querySnapshot.docs.length} products in Firestore`);

    if (querySnapshot.docs.length === 0) {
      console.warn("⚠️  No products found in Firestore collection 'products'");
      console.warn("   Possible reasons:");
      console.warn("   1. Products collection is empty");
      console.warn("   2. Firestore security rules blocking reads");
      console.warn("   3. Products were deleted");
      console.warn("   Check Firebase Console to verify products exist");
    } else {
      // Log first few product IDs for debugging
      const productIds = querySnapshot.docs.slice(0, 5).map((doc) => doc.id);
      console.log(
        `   Sample product IDs: ${productIds.join(", ")}${
          querySnapshot.docs.length > 5 ? "..." : ""
        }`
      );
    }

    // Generate product routes
    const productRoutes = querySnapshot.docs.map(
      (doc) => `/produkter/${doc.id}`
    );

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

    console.log(
      `✅ Generated ${allRoutes.length} sitemap routes (${productRoutes.length} products)`
    );
  } catch (error) {
    console.error("⚠️  Failed to fetch products, using static routes only");
    console.error(
      "   Error details:",
      error instanceof Error ? error.message : String(error)
    );

    // Write static routes as fallback
    const outputPath = resolve(__dirname, "../src/config/sitemapRoutes.json");
    writeFileSync(outputPath, JSON.stringify(staticRoutes, null, 2), "utf-8");

    console.log(`✅ Generated ${staticRoutes.length} static sitemap routes`);
  }
}

generateRoutes().catch(console.error);
