/**
 * Script to upload FAQ questions from faq.ts to Firebase
 * 
 * Run with: npx tsx scripts/ingestFaqs.ts
 * 
 * Requires admin credentials (email/password) to authenticate.
 * Set ADMIN_EMAIL and ADMIN_PASSWORD environment variables, or
 * the script will prompt for them.
 */
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";
import {
  getAuth,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { createInterface } from "readline";
import { faqs } from "../src/data/faq";

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

function promptInput(question: string): Promise<string> {
  const rl = createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer);
    });
  });
}

async function ingestFaqs() {
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

  // Validate Firebase config
  const hasFirebaseConfig =
    firebaseConfig.apiKey &&
    firebaseConfig.authDomain &&
    firebaseConfig.projectId &&
    firebaseConfig.storageBucket &&
    firebaseConfig.messagingSenderId &&
    firebaseConfig.appId;

  if (!hasFirebaseConfig) {
    console.error("❌ Firebase configuration incomplete");
    console.error("   Missing env vars:", {
      apiKey: !firebaseConfig.apiKey,
      authDomain: !firebaseConfig.authDomain,
      projectId: !firebaseConfig.projectId,
      storageBucket: !firebaseConfig.storageBucket,
      messagingSenderId: !firebaseConfig.messagingSenderId,
      appId: !firebaseConfig.appId,
    });
    process.exit(1);
  }

  // Get admin credentials
  let adminEmail =
    envVars.ADMIN_EMAIL || process.env.ADMIN_EMAIL;
  let adminPassword =
    envVars.ADMIN_PASSWORD || process.env.ADMIN_PASSWORD;

  if (!adminEmail) {
    adminEmail = await promptInput("Admin email: ");
  }
  if (!adminPassword) {
    adminPassword = await promptInput("Admin password: ");
  }

  try {
    // Initialize Firebase
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);
    const auth = getAuth(app);

    console.log(
      `📡 Connecting to Firebase project: ${firebaseConfig.projectId}`
    );

    // Authenticate
    console.log("🔐 Authenticating...");
    await signInWithEmailAndPassword(auth, adminEmail, adminPassword);
    console.log("✅ Authenticated successfully");

    const faqsRef = collection(db, "faqs");

    // Check if FAQs already exist
    const existingFaqs = await getDocs(faqsRef);
    if (!existingFaqs.empty) {
      console.log(
        `⚠️  Found ${existingFaqs.docs.length} existing FAQs in Firestore`
      );
      console.log("   Deleting existing FAQs before re-uploading...");
      for (const docSnapshot of existingFaqs.docs) {
        await deleteDoc(doc(db, "faqs", docSnapshot.id));
      }
      console.log("   ✅ Deleted existing FAQs");
    }

    // Upload all FAQs
    let totalUploaded = 0;
    for (const category of faqs) {
      for (const faq of category.questions) {
        const faqData = {
          question: faq.q,
          answer: faq.a,
          category: category.category,
          contentSegments: faq.contentSegments || null,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        };

        await addDoc(faqsRef, faqData);
        totalUploaded++;
      }
    }

    console.log(`✅ Successfully uploaded ${totalUploaded} FAQ questions`);
    console.log(`   Categories: ${faqs.length}`);
    console.log(
      `   Questions per category: ${faqs.map((c) => `${c.category} (${c.questions.length})`).join(", ")}`
    );
  } catch (error) {
    console.error("❌ Failed to upload FAQs");
    console.error(
      "   Error details:",
      error instanceof Error ? error.message : String(error)
    );
    if (error instanceof Error && error.message.includes("auth")) {
      console.error("\n   💡 Tip: Make sure you're using valid admin credentials");
      console.error("      Set ADMIN_EMAIL and ADMIN_PASSWORD environment variables");
    }
    process.exit(1);
  }
}

ingestFaqs().catch(console.error);

