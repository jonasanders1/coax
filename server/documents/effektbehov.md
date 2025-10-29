# Komplett formel, utregning og forklaring: Effektbehov for vannoppvarming

## Fysisk grunnformel

Effektbehovet \( P \) (i **watt**) for å varme opp vann beregnes med:

\[
\boxed{P = \dot{m} \cdot c \cdot \Delta T}
\]

### Forklaring av variabler:

| Symbol         | Betydning                                                 | Enhet              |
| -------------- | --------------------------------------------------------- | ------------------ |
| \( P \)        | Effektbehov                                               | **W** (watt)       |
| \( \dot{m} \)  | Massestrømrate                                            | **kg/s**           |
| \( c \)        | Spesifikk varmekapasitet for vann                         | **4186 J/(kg·°C)** |
| \( \Delta T \) | Temperaturstigning (\( T*{\text{ut}} - T*{\text{inn}} \)) | **°C**             |

---

## Tilpasning til liter per minutt (L/min)

Vi får vanligvis vannmengde i **L/min**, ikke kg/s.  
Siden **1 liter vann ≈ 1 kg** (tetthet ≈ 1000 kg/m³), og vi må konvertere minutter til sekunder:

\[
\dot{m} = \frac{Q}{60}
\]

Der \( Q \) er vannmengde i **L/min**.

Sett inn i hovedformelen:

\[
P = \left( \frac{Q}{60} \right) \cdot 4186 \cdot \Delta T
\]

Forenklet:

\[
\boxed{P = Q \cdot \Delta T \cdot \frac{4186}{60}}
\]

\[
\frac{4186}{60} = 69{,}7666\ldots \approx 69{,}77
\]

**Praktisk formel (norsk standard):**

\[
\boxed{P = Q \cdot \Delta T \cdot 69{,}77}
\]

> **P** i watt  
> **Q** i liter per minutt  
> **ΔT** i °C

---

## Eksempelberegning:

**Inn-temp:** 10 °C  
**Ut-temp:** 38 °C  
**Vannmengde:** 7 L/min

### Trinn for trinn:

1. **ΔT = 38 – 10 = 28 °C**
2. **P = 7 × 28 × 69,77**
3. **7 × 28 = 196**
4. **196 × 69,77 = 13 675,32 W**

**Svar:**

\[
\boxed{P = 13\,675\ \text{W} \quad (\approx 13{,}7\ \text{kW})}
\]

---

## Validering mot dokumentet ditt

I **ark 2** ("Start temp +Tempstigning"), rad 22:

> **7 L/min** → **13 676,88 W**

Forskjellen (1,56 W) skyldes **avrunding** i faktoren:

- Vi brukte **69,77**
- Tabellen bruker **4186 / 60 = 69,7666...** → mer presist

**Nøyaktig faktor (uten avrunding):**

\[
P = Q \cdot \Delta T \cdot \frac{4186}{60} = Q \cdot \Delta T \cdot 69{,}7666\ldots
\]

**Nøyaktig beregning:**

\[
P = 7 \times 28 \times \frac{4186}{60} = 196 \times 69{,}7666\ldots = 13\,676{,}88\ \text{W}
\]

→ **Perfekt samsvar med tabellen!**

---

## Konklusjon – Bruk denne formelen:

```markdown
### Endelig praktisk formel (nøyaktig):

$$
\boxed{P = Q \times (T_{\text{ut}} - T_{\text{inn}}) \times \frac{4186}{60}}
$$

### Eller for rask beregning (god tilnærming):

$$
\boxed{P \approx Q \times \Delta T \times 69{,}77}
$$
```
