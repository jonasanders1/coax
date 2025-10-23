import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  createBrowserRouter,
  RouterProvider,
  ScrollRestoration,
} from "react-router-dom";
import "./index.css";
import Header from "./components/Header";
import Footer from "./components/Footer";
import ChatBot from "./components/chatbot/ChatBot";
import HomePage from "./pages/Home";
import Products from "./pages/Products";
import ProductDetails from "./pages/ProductDetails";
import ModelSelector from "./pages/ModelSelector";
import FAQ from "./pages/FAQ";
import References from "./pages/References";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";

import ScrollUp from "./components/ScrollUp";

import { AppProvider } from "@/context/AppContext";

const queryClient = new QueryClient();

// ✅ Define routes with Data Router
export const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <>
        <Header />
        <ScrollRestoration />
        <HomePage />
        <Footer />
      </>
    ),
  },
  {
    path: "/produkter",
    element: (
      <>
        <Header />
        <ScrollRestoration />
        <Products />
        <Footer />
      </>
    ),
  },
  {
    path: "/produkter/:id",
    element: (
      <>
        <Header />
        <ScrollRestoration />
        <ProductDetails />
        <Footer />
      </>
    ),
  },
  {
    path: "/velg-modell",
    element: (
      <>
        <Header />
        <ScrollRestoration />
        <ModelSelector />
        <Footer />
      </>
    ),
  },
  {
    path: "/faq",
    element: (
      <>
        <Header />
        <ScrollRestoration />
        <FAQ />
        <Footer />
      </>
    ),
  },
  {
    path: "/referanser",
    element: (
      <>
        <Header />
        <ScrollRestoration />
        <References />
        <Footer />
      </>
    ),
  },
  {
    path: "/kontakt",
    element: (
      <>
        <Header />
        <ScrollRestoration />
        <Contact />
        <Footer />
      </>
    ),
  },
  {
    path: "*",
    element: (
      <>
        <Header />
        <NotFound />
        <Footer />
      </>
    ),
  },
]);

// ✅ Main App component
const App = () => (
  <QueryClientProvider client={queryClient}>
    <AppProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 items-end justify-end">
          <ScrollUp />
          <ChatBot />
        </div>
        <RouterProvider router={router} />
      </TooltipProvider>
    </AppProvider>
  </QueryClientProvider>
);

export default App;
