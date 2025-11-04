import PageTitile from "@/components/PageTitile";

import ProductsList from "@/components/ProductsList";
import CtaSection from "@/components/chatbot/CtaSection";


const Products = () => {
  return (
    <div className="min-h-screen pt-24">
      {/* Header */}
      <PageTitile
        title="Energieffektive vannvarmere – våre produkter"
        text="Velg fra modeller tilpasset ditt behov og el-anlegg."
      />

      {/* Product Grid */}
      <section className="pb-16 md:pb-24 bg-muted">
        <ProductsList />
      </section>

      {/* CTA Section */}

      <div className="container px-4 max-w-6xl mx-auto">
        <CtaSection isHeader={false} />
      </div>
    </div>
  );
};

export default Products;
