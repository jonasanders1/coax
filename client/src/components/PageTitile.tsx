

const PageTitile = ({title, text}: {title: string, text: string}) => {
  return (
    <div className="text-center my-12">
      <h1 className="text-4xl font-bold text-primary mb-4">
        {title}
      </h1>
      <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
        {text}
      </p>
    </div>
  );
};

export default PageTitile;
