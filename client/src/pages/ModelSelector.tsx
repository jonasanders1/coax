import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { AlertCircle, CheckCircle, MessageCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useChatBot } from "@/hooks/useChatBot";
import PageTitile from "@/components/PageTitile";

const recommendations = [
  {
    minFlow: 0,
    maxFlow: 3,
    model: "Armatur 3,3kW",
    phase: "1-fase",
    fuse: "1x16A",
    usage: "Håndvask, oppvask",
  },
  {
    minFlow: 3,
    maxFlow: 5,
    model: "XFJ-2-55 (KH 55)",
    phase: "1-fase",
    fuse: "1x25A",
    usage: "Liten dusj, hytte",
  },
  {
    minFlow: 5,
    maxFlow: 7,
    model: "XFJ-2",
    phase: "1-fase",
    fuse: "1x25-32A",
    usage: "Dusj i leilighet",
  },
  {
    minFlow: 7,
    maxFlow: 9,
    model: "XFJ-3 12kW",
    phase: "3-fase",
    fuse: "3x20A",
    usage: "Dusj i bolig",
  },
  {
    minFlow: 9,
    maxFlow: 11,
    model: "XFJ-3 18kW",
    phase: "3-fase",
    fuse: "3x32A",
    usage: "Dusj + håndvask",
  },
  {
    minFlow: 11,
    maxFlow: 15,
    model: "XFJ-3 24kW",
    phase: "3-fase",
    fuse: "3x40A",
    usage: "Flere tappesteder",
  },
];

const ModelSelector = () => {
  const { openChat } = useChatBot();
  const [seconds, setSeconds] = useState<number>(60);
  const [result, setResult] = useState<(typeof recommendations)[0] | null>(
    null
  );
  const [flowRate, setFlowRate] = useState<number | null>(null);

  const calculateRecommendation = () => {
    // Calculate liters per minute for 10L bucket
    const lpm = 600 / seconds; // 10L * 60 seconds / seconds
    setFlowRate(Math.round(lpm * 10) / 10);

    // Find recommendation
    const rec = recommendations.find(
      (r) => lpm >= r.minFlow && lpm < r.maxFlow
    );
    setResult(rec || recommendations[recommendations.length - 1]);
  };

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <PageTitile
          title="Finn riktig COAX-modell med Bøttemetoden"
          text="Enkel test: Mål hvor raskt du fyller en 10L bøtte i dusjen – vi anbefaler modell 
            basert på flow og el-tilgang."
        />

        {/* Calculator */}
        <Card className="mb-8 border-2">
          <CardHeader>
            <CardTitle className="text-2xl">Bøttemetode-kalkulator</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg mb-6">
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-blue-600" />
                  Slik gjør du:
                </h3>
                <ol className="space-y-2 text-sm text-muted-foreground ml-7">
                  <li>1. Ta med deg en 10-liters bøtte i dusjen</li>
                  <li>2. Skru på vannet til ønsket dusjtemperatur og trykk</li>
                  <li>3. Start tidtaker og fyll bøtta helt opp</li>
                  <li>4. Stopp når bøtta er full og noter antall sekunder</li>
                  <li>
                    5. Fyll inn tiden under, så regner vi ut riktig modell
                  </li>
                </ol>
              </div>

              <div>
                <Label htmlFor="seconds" className="text-lg mb-4 block">
                  Tid for å fylle 10L bøtte: <strong>{seconds} sekunder</strong>
                </Label>
                <div className="space-y-4">
                  <Slider
                    id="seconds"
                    value={[seconds]}
                    onValueChange={(value) => setSeconds(value[0])}
                    min={10}
                    max={120}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>10 sek (veldig høy strøm)</span>
                    <span>120 sek (lav strøm)</span>
                  </div>
                  <Button
                    onClick={calculateRecommendation}
                    size="lg"
                    className="w-full"
                  >
                    Finn modell
                  </Button>
                </div>
              </div>

              {result && flowRate && (
                <Alert className="bg-green-50 dark:bg-green-950 border-green-600">
                  <AlertDescription>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        <strong className="text-lg">
                          Beregnet vannmengde: {flowRate} L/min
                        </strong>
                      </div>
                      <div className="bg-green-100 dark:bg-slate-800 p-4 rounded-lg">
                        <h4 className="font-bold text-xl text-primary mb-2">
                          Anbefalt modell: {result.model}
                        </h4>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="text-muted-foreground">Fase:</span>
                            <span className="ml-2 font-semibold">
                              {result.phase}
                            </span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">
                              Sikring:
                            </span>
                            <span className="ml-2 font-semibold">
                              {result.fuse}
                            </span>
                          </div>
                          <div className="col-span-2">
                            <span className="text-muted-foreground">
                              Ideell for:
                            </span>
                            <span className="ml-2 font-semibold">
                              {result.usage}
                            </span>
                          </div>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        <strong>Merk:</strong> Dette er en anbefaling. Kontakt
                        alltid en elektriker for en vurdering av ditt elektriske
                        anlegg.
                      </p>
                    </div>
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recommendations Table */}
        <Card>
          <CardHeader>
            <CardTitle>Anbefalingstabell</CardTitle>
            <p className="text-muted-foreground">
              Anbefalt modell per vannmengde
            </p>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3">Strålestørrelse (L/min)</th>
                    <th className="text-left p-3">Anbefalt modell</th>
                    <th className="text-left p-3">Sikring</th>
                    <th className="text-left p-3">Brukseksempler</th>
                  </tr>
                </thead>
                <tbody>
                  {recommendations.map((rec, idx) => (
                    <tr key={idx} className="border-b hover:bg-muted/50">
                      <td className="p-3">
                        {rec.minFlow}-{rec.maxFlow} L/min
                      </td>
                      <td className="p-3 font-semibold">{rec.model}</td>
                      <td className="p-3">{rec.fuse}</td>
                      <td className="p-3 text-muted-foreground">{rec.usage}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* CTA */}
        <div className="mt-8 bg-primary text-primary-foreground p-8 rounded-lg text-center">
          <h2 className="text-2xl font-bold mb-4">Trenger du personlig råd?</h2>
          <p className="mb-6">
            Vi hjelper deg gjerne med å velge riktig modell og planlegge
            installasjonen.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" variant="secondary">
              <a href="/kontakt">Kontakt oss</a>
            </Button>
            <Button
              onClick={openChat}
              size="lg"
              variant="outline"
              className="bg-transparent border-primary-foreground text-primary-foreground hover:bg-primary-foreground/10"
            >
              <MessageCircle className="mr-2 h-5 w-5" />
              Chat med ThermaBuddy
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModelSelector;
