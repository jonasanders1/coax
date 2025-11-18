# Plan for Expanding the Calculator to Include Water Savings

## 1. Concept

The idea is that with a **tankless / point-of-use water heater**, water reaches the faucet or shower faster because:

- The heater is placed closer to the point of use.
- There is no need to wait for a tank full of cold water to flow out.

This reduces **wasted water**, which otherwise goes down the drain while waiting for hot water.

---

## 2. New Parameters

| Parameter                  | Description                                                      | Type                  | Realistic Default |
| -------------------------- | ---------------------------------------------------------------- | --------------------- | ----------------- |
| `pipeLengthMeters`         | Approximate length of pipe from water heater to point of use     | number (slider/input) | 10 m              |
| `pipeDiameterCm`           | Inner diameter of the pipe                                       | number (slider/input) | 2 cm              |
| `waitTimeSecondsPerShower` | Time it takes for water to reach the faucet before shower starts | number (slider/input) | 30 s              |
| `flowRateLPerMin`          | Average shower flow rate                                         | number                | 8 L/min           |
| `showersPerDay`            | Already existing parameter                                       | number                | -                 |
| `daysPerYear`              | Hardcoded                                                        | number                | 365               |

---

## 3. Calculation Formulas

1. **Pipe volume (water wasted in traditional system)**

\[
V\_{\text{pipe}} = \pi \cdot r^2 \cdot L
\]

- \(r\) = pipe radius in meters
- \(L\) = pipe length in meters

Example: 2 cm diameter pipe (1 cm radius), 10 m length:

\[
V\_{\text{pipe}} = \pi \cdot 0.01^2 \cdot 10 \approx 0.00314 \, m^3 \approx 3.14 L
\]

2. **Flow-time calculation (alternative)**

\[
V\_{\text{wasted}} = \text{flowRate} \cdot \text{waitTimeMinutes}
\]

- `waitTimeMinutes` = waitTimeSecondsPerShower ÷ 60

3. **Choose the larger value for each shower:**

\[
V*{\text{wasted per shower}} = \max(V*{\text{pipe}}, V\_{\text{wasted}})
\]

4. **Annual wasted water:**

\[
\text{annualWaste} = V\_{\text{wasted per shower}} \cdot \text{showersPerDay} \cdot \text{daysPerYear}
\]

5. **Water savings with tankless heater:**  
   Assume all of the above is saved.

---

## 4. Integration in the Calculator

1. **Add new state parameters:**

```ts
interface CalculationParams {
  ...
  pipeLengthMeters: number; // 10 default
  pipeDiameterCm: number; // 2 default
  waitTimeSecondsPerShower: number; // 30 default
  flowRateLPerMin: number; // 8 default
}
Add sliders/inputs in UI (Advanced settings):

Pipe length (m)

Pipe diameter (cm)

Wait time before hot water (s)

Average flow rate (L/min)

Calculate water savings in useMemo:
const pipeRadiusM = params.pipeDiameterCm / 100 / 2;
const pipeVolumeL = Math.PI * pipeRadiusM ** 2 * params.pipeLengthMeters * 1000; // m³ → L
const waitVolumeL = params.flowRateLPerMin * (params.waitTimeSecondsPerShower / 60);
const wastedPerShowerL = Math.max(pipeVolumeL, waitVolumeL);

const annualWaterWasteL = wastedPerShowerL * results.dusjerPerDagTotal * 365;

Display in results:
<p className="text-xl font-bold text-green-900 dark:text-green-100">
  { (annualWaterWasteL / 1000).toFixed(1) } m³ / år
</p>

5. Default Values Justification

Pipe length: 10 m → typical for a small to medium apartment.

Pipe diameter: 2 cm → common shower supply.

Wait time: 30 s → average time for hot water to reach the faucet from a tank.

Flow rate: 8 L/min → typical modern low-flow shower.

6. Optional Enhancements

Include cost savings from water: annualWaterWasteL * waterPricePerL.

Differentiate showers vs. taps for more granular savings.

Add a graph alongside the energy chart to visualize water savings per year.
```
