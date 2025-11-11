import Link from "next/link";

const NotFound = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted">
      <div className="text-center">
        <h1 className="mb-4 text-4xl font-bold">Oops!</h1>
        <p className="mb-4 text-xl text-gray-600">Vi finner ikke siden</p>
        <Link
          href="/"
          className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-primary-foreground transition hover:bg-primary/90"
        >
          Ta meg hjem
        </Link>
      </div>
    </div>
  );
};

export default NotFound;

