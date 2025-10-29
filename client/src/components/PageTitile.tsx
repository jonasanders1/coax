const PageTitile = ({ title, text }: { title: string; text: string }) => {
  return (
    <div className="text-center my-12 px-4">
      <h1 className="text-2xl md:text-4xl font-bold text-foreground mb-4">
        {title}
      </h1>
      <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
        {text}
      </p>
    </div>
  );
};

export default PageTitile;
