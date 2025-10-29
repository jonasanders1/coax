# Creating a comparison calculator for "Direkte vannvarmer (CoaX)" vs "Tankbereder"
# The output will:
# - show a dataframe with key assumptions and annual results (kWh and NOK)
# - save a CSV the user can download
# - produce a bar chart comparing annual kWh and annual cost
# All text labels are in Norwegian.
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import os

# Parameters (default assumptions — bruk disse som utgangspunkt; du kan endre dem i CSV)
params = {
    "antall_personer": 2,
    "dusjer_per_person_per_dag": 1,
    "min_per_dusj": 4,  # minutter
    "tankless_power_kW": 18.0,  # kW (CoaX eksempel)
    "tankless_kWh_per_4min": 1.2,  # ditt tall: 1.2 kWh per 4 min
    "tank_kWh_per_4min": 3.0,  # ditt observasjon: 3 kWh per 4 min (inkl. tap)
    "standby_tap_tank_kWh_per_year": 900.0,  # estimat for 200L tank
    "strømpris_NOK_per_kWh": 1.5,  # NOK/kWh, juster etter behov
    "installasjonskostnad_tankless_NOK": 12000.0,  # eksempelinstallasjon kostnad
    "installasjonskostnad_tank_NOK": 5000.0,  # eksempel
    "år": 1
}

# Calculations
dusjer_per_dag_total = params["antall_personer"] * params["dusjer_per_person_per_dag"]
min_per_dag_total = dusjer_per_dag_total * params["min_per_dusj"]

# Energiforbruk per dusj (bruker oppgitte tall som basis)
tankless_kWh_per_dusj = params["tankless_kWh_per_4min"] * (params["min_per_dusj"] / 4.0)
tank_kWh_per_dusj = params["tank_kWh_per_4min"] * (params["min_per_dusj"] / 4.0)

# Daily & annual energy
tankless_kWh_per_day = tankless_kWh_per_dusj * dusjer_per_dag_total
tank_kWh_per_day = tank_kWh_per_dusj * dusjer_per_dag_total

tankless_kWh_per_year = tankless_kWh_per_day * 365
tank_kWh_per_year = tank_kWh_per_day * 365 + params["standby_tap_tank_kWh_per_year"]

# Cost
tankless_cost_per_year_NOK = tankless_kWh_per_year * params["strømpris_NOK_per_kWh"]
tank_cost_per_year_NOK = tank_kWh_per_year * params["strømpris_NOK_per_kWh"]

annual_savings_kWh = tank_kWh_per_year - tankless_kWh_per_year
annual_savings_NOK = tank_cost_per_year_NOK - tankless_cost_per_year_NOK

# Payback (enkelt eksempel)
installasjons_diff = params["installasjonskostnad_tankless_NOK"] - params["installasjonskostnad_tank_NOK"]
if annual_savings_NOK > 0:
    payback_years = installasjons_diff / annual_savings_NOK
else:
    payback_years = np.nan

# Result dataframe
df_results = pd.DataFrame([
    ["Antall personer", params["antall_personer"]],
    ["Dusjer per person per dag", params["dusjer_per_person_per_dag"]],
    ["Minutter per dusj", params["min_per_dusj"]],
    ["Totale dusjer per dag", dusjer_per_dag_total],
    ["Tankless (kWh per dusj)", round(tankless_kWh_per_dusj, 3)],
    ["Tank (kWh per dusj)", round(tank_kWh_per_dusj, 3)],
    ["Tankless kWh/år", round(tankless_kWh_per_year, 1)],
    ["Tank kWh/år (inkl. standby)", round(tank_kWh_per_year, 1)],
    ["Tankless kostnad/år (NOK)", round(tankless_cost_per_year_NOK, 1)],
    ["Tank kostnad/år (NOK)", round(tank_cost_per_year_NOK, 1)],
    ["Årlig besparelse (kWh)", round(annual_savings_kWh, 1)],
    ["Årlig besparelse (NOK)", round(annual_savings_NOK, 1)],
    ["Installasjonskostnad - tankless (NOK)", params["installasjonskostnad_tankless_NOK"]],
    ["Installasjonskostnad - tank (NOK)", params["installasjonskostnad_tank_NOK"]],
    ["Merpris installasjon (tankless - tank)", installasjons_diff],
    ["Anslått tilbakebetalingstid (år)", round(payback_years, 1)]
], columns=["Parameter", "Verdi"])

# Save CSV
out_dir = "/mnt/data"
os.makedirs(out_dir, exist_ok=True)
csv_path = os.path.join(out_dir, "coax_vs_tank_comparison.csv")
df_results.to_csv(csv_path, index=False)

# Create a bar chart comparing annual kWh and annual cost
labels = ["Direkte (CoaX)", "Tankbereder"]
annual_kWh = [tankless_kWh_per_year, tank_kWh_per_year]
annual_cost = [tankless_cost_per_year_NOK, tank_cost_per_year_NOK]

fig, ax = plt.subplots(figsize=(8,5))
x = np.arange(len(labels))
width = 0.35
bars1 = ax.bar(x - width/2, annual_kWh, width)
bars2 = ax.bar(x + width/2, annual_cost, width)
ax.set_xticks(x)
ax.set_xticklabels(labels)
ax.set_ylabel("Årlig kWh / Kostnad (NOK) — to ulike skalaer")
ax.set_title("Årlig energibruk (kWh) og kostnad (NOK) — Direkte vs Tank")
# Add annotation for bars
def annotate(bars):
    for bar in bars:
        h = bar.get_height()
        ax.annotate(f'{h:.0f}', xy=(bar.get_x() + bar.get_width() / 2, h),
                    xytext=(0, 3), textcoords="offset points", ha='center', va='bottom', fontsize=8)
annotate(bars1)
annotate(bars2)

# Save figure
fig_path = os.path.join(out_dir, "annual_comparison_coax_vs_tank.png")
plt.tight_layout()
plt.savefig(fig_path)
plt.close(fig)

# Display dataframe for the user
import caas_jupyter_tools as tools; tools.display_dataframe_to_user("Sammenligningsresultater: CoaX vs Tank", df_results)

# Show a small summary as output
print("Filen er lagret som:", csv_path)
print("Graf er lagret som:", fig_path)
