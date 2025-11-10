import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import Seo from "@/components/Seo";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted">
      <Seo
        title="COAX | Siden ble ikke funnet"
        description="Vi fant ikke siden du leter etter. Gå tilbake til forsiden for å utforske COAX sine løsninger."
        noIndex
      />
      <div className="text-center">
        <h1 className="mb-4 text-4xl font-bold">Oops!</h1>
        <p className="mb-4 text-xl text-gray-600">Vi finner ikke siden</p>
        <Button asChild>
          <Link to="/">Ta meg hjem</Link>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
