import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { motion } from "framer-motion";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./index.css";
import { ThemeProvider } from "next-themes";

// import ChatBot from "./components/chatbot/ChatBot";
import HomePage from "./pages/Home";
import Products from "./pages/Products";
import ProductDetails from "./pages/ProductDetails";
import ModelSelector from "./pages/ModelSelector";
import FAQ from "./pages/FAQ";
import References from "./pages/References";
import Contact from "./pages/Contact";
import Calculator from "./pages/Calculator";
import NotFound from "./pages/NotFound";
import Thanks from "./pages/Thanks";
import ScrollUp from "./components/ScrollUp";
import Layout from "@/components/Layout";

import { AppProvider } from "@/context/AppContext";

const queryClient = new QueryClient();

// ✅ Define routes with Data Router
export const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: "produkter", element: <Products /> },
      { path: "produkter/:id", element: <ProductDetails /> },
      { path: "velg-modell", element: <ModelSelector /> },
      { path: "faq", element: <FAQ /> },
      { path: "referanser", element: <References /> },
      { path: "kontakt", element: <Contact /> },
      { path: "kalkulator", element: <Calculator /> },
      { path: "takk", element: <Thanks /> },
      { path: "*", element: <NotFound /> },
    ],
  },
]);

// Smooth initial animation variants
const appVariants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: {
      duration: 1,
      ease: [0.16, 0.3, 0.3, 1],
    },
  },
} as const;

// ✅ Main App component
const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AppProvider>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <motion.div
              initial="initial"
              animate="animate"
              variants={appVariants}
              className="min-h-screen"
            >
              <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 items-end justify-end">
                <ScrollUp />
                {/* <ChatBot /> */}
              </div>
              <RouterProvider router={router} />
            </motion.div>
          </TooltipProvider>
        </ThemeProvider>
      </AppProvider>
    </QueryClientProvider>
  );
};

export default App;
