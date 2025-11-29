export const calculatorDescription = `

## Oversikt

COAX Forbrukskalkulator sammenligner energiforbruk, vannbruk og driftskostnader mellom COAX gjennomstrømningsvarmere og tradisjonelle tankvarmere. Kalkulatoren bruker fysikkbaserte beregninger for å estimere reelle ytelsesforskjeller mellom disse to systemene.

---

## Grunnleggende beregningsformel

Kalkulatoren er basert på den grunnleggende fysikkformelen for oppvarming av vann:

**Påkrevd energi = (Volum × Spesifikk varme × Temperaturøkning) ÷ Effektivitet**

Hvor:

- **Volum**: Totalt antall liter varmtvann brukt per dag  
- **Spesifikk varme**: 1,162 Wh/L/°C (energi nødvendig for å varme 1 liter vann 1°C)  
- **Temperaturøkning (ΔT)**:  
  - **COAX**: Måltemperatur - Inntakstemperatur (40°C - 10°C = 30°C)  
    - Varmer vann direkte til brukstemperatur  
  - **Tank**: Lagringstemperatur - Inntakstemperatur (65°C - 10°C = 55°C)  
    - Vannet lagres på høyere temperatur (60-70°C), og blandes deretter med kaldt vann for å oppnå brukstemperatur  
- **Effektivitet**: Systemets effektivitet (hvor mye elektrisitet som omdannes til varme)

---

## Nøkkelberegninger

### 1. Daglig vannvolum

For hvert system summerer kalkulatoren vannforbruk fra flere kilder:

**Dusjvolum** = Antall dusjer × minutter per dusj × strømningshastighet (L/min)

**Kjøkkenvolum** = Kjøkkenbruk × (Varighet i sekunder ÷ 60) × strømningshastighet

**Baderomsservant-volum** = servantbruk × (Varighet i sekunder ÷ 60) × strømningshastighet

**Rørspyling** = Totalt antall bruk per dag × Rørlengde (m) × 0,15 L/m × Isoleringsfaktor

**Totalt daglig volum** = Sum av alle volumene over

Rørspyling volumet tar hensyn til kaldt vann som må skylles ut av rørene før varmt vann når kranen.

### 2. Ventetid og vannsløsing

Vann som går til spille mens man venter på varmt vann:

**Vannsløsing ved venting** = Totalt antall bruk per dag × (Ventetid i sekunder ÷ 60) × strømningshastighet (L/min)

Dette representerer kaldt vann som renner ned i avløpet før varmt vann kommer.

### 3. Daglig energiforbruk

**COAX (gjennomstrømningsvarmer):**

\`\`\`
Daglig energi (kWh) = (Daglig volum × 1,162 × ΔT_bruk) ÷ 0,99 ÷ 1000
\`\`\`

Hvor:  
- **ΔT_bruk** = Måltemperatur - Inntakstemperatur (40°C - 10°C = 30°C)  
- COAX varmer vann direkte til brukstemperatur (40°C)  
- Varmer kun vann ved bruk  
- Ingen standby-tap

**Tanksystem:**

\`\`\`
Blandingsforhold = (Måltemp - Inntakstemp) ÷ (Lagringstemp - Inntakstemp)
Påkrevd varmtvannvolum = Daglig volum × Blandingsforhold
Daglig energi (kWh) = (Påkrevd varmtvannvolum × 1,162 × ΔT_lagring) ÷ 0,93 ÷ 1000
\`\`\`

Hvor:  
- **ΔT_lagring** = Lagringstemperatur - Inntakstemperatur (65°C - 10°C = 55°C)  
- **Blandingsforhold** = (40°C - 10°C) ÷ (65°C - 10°C) = 30 ÷ 55 ≈ 54,5%  
- Tanker lagrer vann ved 60-70°C (standard 65°C) for å hindre bakterievekst  
- Varmt vann blandes med kaldt ved kranen for å oppnå brukstemperatur (40°C)  
- Bare nødvendig volum varmt vann må varmes til lagringstemperatur  
- Pluss standby-tap (vann holdes varmt 24/7)

### 4. Justering for standby-tap

Tanksystemer mister varme kontinuerlig. Kalkulatoren justerer for romtemperatur:

\`\`\`
Justeringsfaktor = 1 + (20°C - Romtemperatur) ÷ 10
Justert standby = Basis standby × Justeringsfaktor
\`\`\`

**Eksempler:**

- 15°C rom (kjeller): 1,5× basis standby (mer varmetap)  
- 20°C rom (typisk): 1,0× basis standby  
- 21°C rom (kjøkken/bad): 0,9× basis standby (mindre varmetap)

### 5. Årlige beregninger

\`\`\`
Årlig energi (kWh) = Daglig energi × 365 + Årlige standby-tap
Årlig kostnad (NOK) = Årlig energi × Strømpris
Besparelse = Tankens årlige kostnad - COAX årlige kostnad
\`\`\`

---

## Standardforutsetninger

### Husholdningsbruk (Standard norsk husholdning)

- **3 personer** i husholdningen  
- **1 dusj per person per dag** (6 minutter hver)  
- **4 kjøkkenbruk per person per dag** (37 sekunder hver)  
- **6 Baderomsservant-bruk per person per dag** (20 sekunder hver)

### Vanntemperaturer

- **Inntakstemperatur**: 10°C (typisk norsk kaldtvann) (8°C på vinterdager, 12°C på sommerdager)  
- **Mål-/brukstemperatur**: 40°C (komfortabelt varmt vann ved kran)  
- **COAX oppvarmingstemperatur**: 40°C (varmer direkte til brukstemperatur)  
- **Tank lagringstemperatur**: 65°C (lagres på høyere temperatur, blandes deretter med kaldt vann)  
  - Høy lagringstemperatur (60-70°C) hindrer bakterievekst (Legionella)  
  - Blandes med kaldt vann ved kranen for å oppnå 40°C  
  - Blandingsforhold: ~54,5% varmt + 45,5% kaldt = 40°C

### Fysiske konstanter

- **Rørkapasitet**: 0,15 L/m (typiske 15 mm rør)  
- **Rørisolering**: Valgfritt (reduserer varmetap med 50 % hvis aktivert)

### Økonomiske forutsetninger

- **Strømpris**: 1,5 NOK/kWh (justerbar, reflekterer dagens norske marked)

---

## Systemspesifikke standardverdier og begrunnelser

### COAX (Gjennomstrømningsvarmer) standardverdier

#### Strømningshastighet: 6 L/min

**Begrunnelse:** COAX-systemer er designet for desentralisert installasjon nær brukspunkt. Dette gir:

- **Vannsparende kraner**: Lavere strømningshastighet fungerer fordi varmt vann kommer raskt (3 sekunder vs 10+ sek for tanker)  
- **Effektiv bruk**: Brukere trenger ikke høy strømning for å "føle" varmt vann raskt  
- **Miljøfordel**: Lavere strømningshastighet reduserer total vannbruk

**Merk:** Høyere strømningshastigheter (9-12 L/min) er mulig, men mindre vanlig med COAX på grunn av vannsparende design.

#### Rørlengde: 2 meter

**Begrunnelse:** Desentralisert installasjon betyr at COAX-enheter plasseres:

- **Nær brukspunkt**: Under kjøkkenvask, i baderomsskap eller ved dusjer  
- **Kort rørstrekk**: Reduserer varmetap og ventetid  
- **Flere enheter mulig**: Kan installere separate enheter for ulike områder

#### Romtemperatur: 21°C (implisitt i sammenligning)

**Begrunnelse:** COAX-enheter installeres typisk i:

- **Kjøkken**: Romtemperatur eller varmere (20-22°C)  
- **Bad**: Oppvarmede rom (20-24°C)  
- **Oppholdsrom**: Klimakontrollerte miljøer

Høyere omgivelsestemperatur reduserer varmetap fra enheten (selv om COAX har minimal varmetap fordi den kun varmer ved bruk).

#### Ventetid: 3 sekunder

**Begrunnelse:**

- **Nær kran**: Kort rør = varmt vann kommer nesten umiddelbart  
- **Ingen tank å fylle**: Direkte oppvarming = umiddelbar varmt vannstrøm  
- **Brukeropplevelse**: Hovedfordel med desentralisert installasjon

#### Effektivitet: 99%

**Begrunnelse:**

- **Direkte oppvarming**: Ingen lagring = minimalt varmetap  
- **Moderne teknologi**: Avanserte varmeelementer med minimal energisløsing  
- **Ingen standby-tap**: Forbruker kun energi ved aktiv oppvarming

---

### Tanksystem standardverdier

#### Strømningshastighet: 9 L/min

**Begrunnelse:** Tradisjonelle tanksystemer bruker typisk:

- **Standardkraner**: Høyere strømning vanlig  
- **Lengre ventetid**: Brukere øker ofte strømning for å få varmt vann raskere  
- **Sentralisert design**: Krever høyere strømning for flere samtidige bruk

#### Rørlengde: 10 meter

**Begrunnelse:** Sentralisert installasjon betyr:

- **Én plassering**: Tank i vaskerom, kjeller eller teknisk rom  
- **Langt rørstrekk**: Vannet må transporteres til flere kraner  
- **Flere grener**: Én tank for hele huset, lengre rør

#### Romtemperatur: 15°C

**Begrunnelse:** Tanker installeres ofte i:

- **Kjeller/vaskerom**: Typisk 10-15°C  
- **Tekniske rom**: Ofte uoppvarmet eller minimalt oppvarmet  
- **Garasje/uthus**: Eksponert for utetemperatur

Lavere temperatur øker standby-varmetap, da tanken må jobbe hardere for å holde vann varmt.

#### Ventetid: 10 sekunder (standard, justerbar 5-45s)

**Begrunnelse:**

- **Avstand til kran**: Langt rør = betydelig ventetid  
- **Rørvolum**: Kaldt vann må skylles ut før varmt vann kommer  
- **Variabel**: Faktisk ventetid avhenger av installasjon

#### Effektivitet: 93%

**Begrunnelse:**

- **Lagringstap**: Noe varmetap under oppvarming  
- **Eldre teknologi**: Mindre effektive oppvarmingsmetoder  
- **Standby-tap**: Kontinuerlig varmetap fra lagret vann (beregnes separat)

#### Lagringstemperatur: 65°C (standard, justerbar 55-75°C)

**Begrunnelse:**

- **Helsekrav**: Vann må lagres 60-70°C for å hindre bakterievekst  
- **Blanding ved kran**: Lagringsvann (65°C) blandes med kaldt vann (10°C) for å oppnå 40°C  
- **Blandingsforhold**: Ca. 54,5% varmt + 45,5% kaldt = 40°C  
- **Energi**: Tank må varme vann til 65°C, ikke bare 40°C  
- **Beregning**: Basert på lagringstemperatur (65°C - 10°C = 55°C økning)

#### Standby-tap: 1000 kWh/år (basis, justert for romtemp)

**Begrunnelse:**

- **24/7 drift**: Tank holder vann varmt kontinuerlig  
- **Varmetap**: Vannet kjøles ned og må varmes opp igjen  
- **Temperaturavhengig**: Lavere romtemp øker tap

---

## Ytterligere skjevheter og begrunnelser

### 1. Ingen standby-tap for COAX

**Skjevhet:** COAX har 0 kWh/år vs Tankens 1000+ kWh/år

**Begrunnelse:** Ikke en skjevhet, men en grunnleggende forskjell:

- COAX varmer kun kranen er åpen - ingen lagring = ingen standby-tap  
- Tanker må holde vann varmt 24/7 = kontinuerlig energibruk  
- Største faktor for energibesparelse

### 2. Ventetid

**Skjevhet:** COAX 3 sek vs Tank 10 sek

**Begrunnelse:**

- **COAX**: Nær brukspunkt, korte rør = minimal ventetid  
- **Tank**: Sentralisert, lange rør = betydelig ventetid  
- **Vannsløsing**: Lengre ventetid = mer kaldt vann ned i avløpet  
- **Justering**: Tankens ventetid kan tilpasses (5-45s)

### 3. Effektivitet

**Skjevhet:** COAX 99% vs Tank 93%

**Begrunnelse:** Reflekterer realistisk ytelse:

- **COAX**: Moderne direkte oppvarming, minimalt tap  
- **Tank**: Lagring med visse tap under oppvarming  
- **Bransjestandard**: Typisk ytelse for moderne systemer

### 4. Lagringstemperatur

**Skjevhet:** COAX 40°C vs Tank 65°C

**Begrunnelse:**

- **COAX**: Varmer direkte til brukstemperatur (40°C)  
  - Ingen behov for høy lagringstemperatur  
  - Energi: (Volum × 1,162 × 30°C) ÷ effektivitet  

- **Tank**: Lagrer 60-70°C (65°C) for helse  
  - Hindrer bakterievekst  
  - Blandes med kaldt vann til 40°C  
  - Energi: (Påkrevd varmtvann × 1,162 × 55°C) ÷ effektivitet  
  - **Effekt**: Tank må varme 83% mer (55°C vs 30°C), men kun ~54,5% av volumet

**Dette er en grunnleggende forskjell, ikke en skjevhet:**
- Tanker krever høy lagringstemperatur for helse  
- COAX kan varme direkte til brukstemperatur  
- Gir betydelige energibesparelser for COAX

### 5. Rørlengde

**Skjevhet:** COAX 2m vs Tank 10m

**Begrunnelse:**

- **COAX**: Desentralisert = flere enheter med korte rør  
- **Tank**: Sentralisert = én enhet med lange distribusjonsrør  
- **Realistiske scenarier**: Typisk installasjonsmønster  
- **Justering**: Kan tilpasses faktiske installasjoner

### 6. Strømningshastighet

**Skjevhet:** COAX 6 L/min vs Tank 9 L/min

**Begrunnelse:**

- **COAX**: Vannsparende design, lav strømning mulig pga rask levering  
- **Tank**: Standard strømning, brukere øker ofte for å kompensere ventetid  
- **Miljøfordel**: Reduserer total vannbruk  
- **Brukeropplevelse**: COAXs raske levering gjør lav strømning akseptabel

---

## Beregningsbegrensninger og forenklinger

### Inkludert:

✅ Driftskostnader (oppvarming)  
✅ Standby-tap for tank  
✅ Rørvarmetap  
✅ Vannsløsing ved venting  
✅ Romtemperaturens effekt på standby  
✅ Flere brukstyper (dusj, kjøkken, vask)  
✅ Årlige prognoser (365 dager)

### Ikke inkludert:

❌ Installasjonskostnader  
❌ Vedlikeholdskostnader  
❌ Forskjeller i levetid  
❌ Sesongvariasjon i bruk  
❌ Topplast-scenarier  
❌ Vannoppvarming annet enn strøm  
❌ Miljøpåvirkning utover energi/vann

### Forenklinger:

- **Gjennomsnittlig daglig bruk**: Konstant mønster (ikke sesongvariasjoner)  
- **Konstant inntakstemperatur**: Antar 10°C året rundt  
- **Fast effektivitet**: Antar ingen reduksjon over tid. Tradisjonelle tankvarmere kan miste effektivitet etter hvert, blant annet på grunn av oppsamling av avleiringer og slam i tanken.
- **Lineær standby-justering**: Forenklet temperaturformel

---

## Hvorfor COAX viser høyere besparelse

Kalkulatoren viser betydelige besparelser for COAX pga:

1. **Ingen standby-tap** (største faktor)  
   - Tank: 1000+ kWh/år  
   - COAX: 0 kWh/år

2. **Lavere oppvarmingstemperatur**  
   - COAX: 40°C (30°C økning)  
   - Tank: 65°C (55°C økning), men bare ~54,5% av volumet oppvarmes

3. **Høyere effektivitet**  
   - COAX: 99%  
   - Tank: 93%  
   - 6% forskjell

4. **Kortere ventetid**  
   - COAX: 3 sek = mindre vannsløsing  
   - Tank: 10+ sek = mer vannsløsing

5. **Lavere strømning**  
   - COAX: 6 L/min  
   - Tank: 9 L/min  
   - Reduserer vannforbruk

6. **Kortere rørstrekk**  
   - COAX: 2 m  
   - Tank: 10 m  
   - Mindre varmetap og spyling

7. **Bedre installasjonsplassering**  
   - COAX: Kjøkken/bad (21°C)  
   - Tank: Kjeller/teknisk rom (15°C)  
   - Lavere omgivelsestemp øker standby-tap

**Samlet effekt:** Typisk **30-50% energibesparelse** med COAX, avhengig av bruksmønster og installasjon.

---

## Hvordan bruke kalkulatoren

1. **Start med standardverdier**: Basert på typiske norske husholdninger  
2. **Justér nøkkelparametere**: Endre antall personer, dusjfrekvens og strømpris  
3. **Finjustér ved behov**: Bruk "Avanserte parametere" for tekniske justeringer  
4. **Sammenlign resultater**: Se årlig energi, kostnad og vannbesparelse

---

## Transparensnotat

Kalkulatoren bruker realistiske standardverdier. Disse kan favorisere COAX fordi de representerer **tiltenkt bruk**:

- **COAX**: Desentralisert, effektiv, vannsparende  
- **Tank**: Sentralisert, tradisjonell installasjon

Alle parametere kan justeres for din situasjon. Kalkulatoren viser realistiske sammenligninger, ikke kunstige fordeler.

## Viktige ikke-energihensyn

**COAX fordeler (ikke beregnet):**  
- ✓ Plassbesparelse (ingen stor tank)  
- ✓ Ubegrenset varmtvann  
- ✓ Ingen legionellarisk (ingen lagret vann)  
- ✓ Flere enheter for redundans  
- ✓ Lavere installasjonskostnader i nybygg

**Tank fordeler (ikke beregnet):**  
- ✓ Flere samtidige høystrømsbruk  
- ✓ Enkel installasjon i eksisterende hjem  
- ✓ Lavere belastning på strømnettet  
- ✓ Fungerer med lavere kapasitet på elektriske kurser  
- ✓ Bevist teknologi med lang historikk

---

#### Effektivitet: 99% (COAX) vs 93% (Tank)

**Begrunnelse:**  
- **COAX 99%**: Moderne direkte oppvarming, minimal varmetap  
- **Tank 93%**: Inkluderer oppvarmingstap (ikke standby, beregnes separat)

**Klarering:**  
- Kun oppvarmingseffektivitet  
- Tank standby-tap beregnes separat (1000 kWh/år)  
- Total effektivitetstap for tank = lavere oppvarmingseffektivitet + standby-tap  
- COAX effektivitet reflekterer konvertering av strøm til varme i elementet

**Bransjekontekst:**  
- Moderne gjennomstrømningsvarmere: 98-99%  
- Moderne tanker: 90-95% (kun oppvarming)  
- Total tankeffektivitet (inkl. standby): ofte 60-75%`;
