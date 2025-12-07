import React from "react";

const SectionTitle = ({ title, text, className }: { title: string; text: string; className?: string }) => {
  return (
    <div className="text-center mb-12">
      <h2 className={`text-2xl md:text-3xl text-foreground ${className}`}>
        {title}
      </h2>
      <p className={`mt-2 text-lg text-muted-foreground ${className}`}>
        {text}
      </p>
    </div>
  );
};

export default SectionTitle;
