import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Quote } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import PageTitile from "@/components/PageTitile";

// Reference images
import ref1 from "@/assets/references/reference-1.webp";
import ref2 from "@/assets/references/reference-2.webp";
import ref3 from "@/assets/references/reference-3.webp";

// const references = [
//   {
//     project: "XFJ-3 i bolighus, Oslo",
//     testimonial: "Spar plass og strøm – anbefales! Vi installerte COAX i vårt bad og kjøkken. Perfekt løsning.",
//     type: "Bolig"
//   },
//   {
//     project: "Hytte i fjellheimen",
//     testimonial: "Ingen tank å tømme, minimal plass, varmt vann når vi trenger det. Perfekt for hytta!",
//     type: "Hytte"
//   },
//   {
//     project: "Leilighet i Bergen",
//     testimonial: "Kompakt og effektiv. XFJ-2 passer perfekt i vårt lille bad. Varmtvann på sekunder.",
//     type: "Leilighet"
//   },
//   {
//     project: "Verksted og industrihall",
//     testimonial: "Pålitelig løsning for våre ansatte. Vedlikeholdsfri og energieffektiv drift.",
//     type: "Industri"
//   },
//   {
//     project: "Sommerhus ved kysten",
//     testimonial: "XFJ-2-55 med lavt forbruk fungerer utmerket på vår begrensede el-tilkobling.",
//     type: "Fritidsbolig"
//   },
//   {
//     project: "Hotell i Trondheim",
//     testimonial: "Flere COAX-enheter installert. Gjestene er fornøyde, og vi sparer på driftskostnadene.",
//     type: "Hotell"
//   }
// ];

const references = [
  {
    id: "ref-1",
    caption: "Kompakt modell i hytte, Geilo",
    testimonial:
      '"Perfekt for vår lille hytte. Enkel å tømme før vinteren, og gir en luksusfølelse med varm dusj på fjellet."',
    image: ref1,
  },
  {
    id: "ref-2",
    caption: "XFJ-3 i bolighus, Oslo",
    testimonial:
      '"Sparer utrolig mye plass på vaskerommet og har aldri gått tom for varmtvann siden. Anbefales på det sterkeste!"',
    image: ref2,
  },
  {
    id: "ref-3",
    caption: "Plassbesparende løsning, Bergen",
    testimonial:
      '"Vi byttet ut en 200L tank med denne lille boksen. Utrolig hvor mye gulvplass vi plutselig fikk!"',
    image: ref3,
  },
];

const References = () => {
  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="mx-auto">
        {/* Header */}
        <PageTitile
          title="Fornøyde kunder i over 20 år"
          text="Fra hytter til industri – se hvordan COAX har gjort en forskjell"
        />

        {/* References Grid */}
        <section className="pb-16 md:pb-24">
          <div className="container max-w-6xl mx-auto px-4">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {references.map((ref) => (
                <Card key={ref.id}>
                  {ref.image && (
                    <CardContent className="p-0">
                      <div className="relative aspect-video w-full overflow-hidden rounded-t-lg">
                        <img
                          src={ref.image}
                          alt={ref.caption}
                          className="w-full h-full object-cover object-center"
                        />
                      </div>
                    </CardContent>
                  )}
                  <CardFooter className="flex-col items-start p-6">
                    <p className="font-semibold text-foreground">
                      {ref.caption}
                    </p>
                    <blockquote className="mt-2 text-sm text-muted-foreground border-l-2 border-primary italic pl-4">
                      {ref.testimonial}
                    </blockquote>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 md:py-24 bg-muted text-foreground">
          <div className="container max-w-6xl mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold">
              Se hvordan COAX passer inn i ditt prosjekt.
            </h2>
            <p className="mt-4 max-w-xl mx-auto text-lg text-muted-foreground">
              Klar for å oppgradere? Vi hjelper deg med å finne den beste
              løsningen.
            </p>
            <div className="mt-8">
              <Button asChild size="lg" className="gap-2">
                <Link to="/kontakt">Snakk med en ekspert</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Installation Examples */}
        {/* <section>
          <div className="container max-w-6xl mx-auto px-4 mt-16">
            <h2 className="text-3xl font-bold text-center text-primary mb-8">
              Installasjonseksempler
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Card>
                <CardContent className="pt-6">
                  <h3 className="font-bold text-xl mb-3">
                    Liten hytte (XFJ-2-55)
                  </h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• Elektriker: 4 timer installasjon</li>
                    <li>• Rørlegger: 2 timer tilkobling</li>
                    <li>• Total investering: Ca. 8 000 kr inkl. arbeid</li>
                    <li>• Sparing per år: 2 000-3 000 kr vs. tank</li>
                  </ul>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <h3 className="font-bold text-xl mb-3">
                    Helårsbolig (XFJ-3 18kW)
                  </h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• Elektriker: 6 timer med ny sikring</li>
                    <li>• Rørlegger: 3 timer tilkobling</li>
                    <li>• Total investering: Ca. 15 000 kr inkl. arbeid</li>
                    <li>• Sparing per år: 4 000-6 000 kr vs. tank</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </section> */}
      </div>
    </div>
  );
};

export default References;
