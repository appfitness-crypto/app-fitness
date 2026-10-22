#!/usr/bin/env python3
"""Metas diarias y reparto por comida según la skill nutricion-deportiva.

No aplica el filtro de seguridad: ese paso va antes y lo decide quien llama.
Todas las reglas marcadas (D) son reglas de diseño configurables, no evidencia.
"""
import argparse
import json

# Reparto de kcal por número de comidas (D). Valores medios de cada rango.
REPARTO = {
    3: [("Desayuno", .30), ("Comida", .40), ("Cena", .30)],
    4: [("Desayuno", .25), ("Comida", .35), ("Colación PM", .15), ("Cena", .25)],
    5: [("Desayuno", .225), ("Colación AM", .10), ("Comida", .325), ("Colación PM", .10), ("Cena", .25)],
    6: [("Desayuno", .20), ("Colación AM", .10), ("Comida", .30), ("Colación PM", .10), ("Cena", .20), ("Pre-sueño", .10)],
}

# CHO g/kg por etiqueta del día y perfil (D, mapeado de ACSM 2016). Punto medio.
CHO_PERFIL = {
    "fuerza":      {"descanso": 3, "ligero": 3.5, "moderado": 4.5, "pesado": 5.5, "doble": 6},
    "mixto":       {"descanso": 3, "ligero": 4.5, "moderado": 5.5, "pesado": 7, "doble": 8},
    "resistencia": {"descanso": 3.5, "ligero": 4.5, "moderado": 6, "pesado": 8.5, "doble": 9},
}

SUPERAVIT_NIVEL = {"novato": .175, "intermedio": .125, "avanzado": .075}  # (D)
PISO_KCAL = {"f": 1200, "m": 1500}  # PENDIENTE: sin fuente primaria


def tmr(sexo, edad, peso, talla, grasa=None):
    if grasa is not None:
        mlg = peso * (1 - grasa / 100)
        return 500 + 22 * mlg, "Cunningham", mlg
    base = 10 * peso + 6.25 * talla - 5 * edad
    return base + (5 if sexo == "m" else -161), "Mifflin-St Jeor", None


def metas(a):
    bmr, formula, mlg = tmr(a.sexo, a.edad, a.peso, a.talla, a.grasa)
    tdee = bmr * a.actividad
    notas = []
    obj = a.objetivo

    if obj == "masa":
        kcal = tdee * (1 + SUPERAVIT_NIVEL[a.nivel])
        prot_kg, grasa_kg = 1.9, 0.9
    elif obj == "definicion":
        deficit = min(tdee * .225, 500)  # (D) el menor entre 20–25 % y 500
        kcal = tdee - deficit
        prot_kg = 2.2
        if mlg:
            prot_kg = max(prot_kg, 2.7 * mlg / a.peso)
        grasa_kg = None
    elif obj == "recomposicion":
        kcal = tdee * .925  # mantenimiento a −10–15 % (D)
        prot_kg, grasa_kg = 2.2, None
    elif obj == "rendimiento":
        kcal = tdee
        prot_kg, grasa_kg = 1.6, None
    elif obj == "rehabilitacion":
        kcal = max(tdee, 27.5 * a.peso)  # 25–30 kcal/kg, sin déficit
        prot_kg = 2.5 if a.inmovilizado else 1.9
        grasa_kg = None
    else:
        raise SystemExit("objetivo no válido")

    piso = max(PISO_KCAL[a.sexo], bmr)
    if kcal < piso:
        notas.append(f"kcal subidas al piso ({piso:.0f}): no bajar de TMR ni de 1,200/1,500 (piso PENDIENTE)")
        kcal = piso

    prot = prot_kg * a.peso
    if obj == "rendimiento":
        hc = CHO_PERFIL[a.perfil][a.carga] * a.peso
        grasa = max((kcal - prot * 4 - hc * 4) / 9, 0.2 * kcal / 9)
        kcal = prot * 4 + hc * 4 + grasa * 9
        notas.append(f"CHO por carga '{a.carga}' perfil '{a.perfil}'; kcal recalculadas desde macros")
        if kcal > tdee * 1.1:
            notas.append("kcal >10 % sobre el TDEE: el factor de actividad quizá no refleja este día; "
                         "revisar factor o carga antes de tratarlo como superávit")
    else:
        if grasa_kg is None:
            grasa = max(.25 * kcal / 9, .6 * a.peso)  # ≥ máx(15–20 % kcal, 0.5–0.6 g/kg)
        else:
            grasa = grasa_kg * a.peso
        hc = (kcal - prot * 4 - grasa * 9) / 4
        if obj == "masa" and hc < 3 * a.peso:
            notas.append("HC por debajo de 3 g/kg: revisar grasa o superávit")

    tiempos = reparto(a.comidas, a.entreno, kcal, hc)
    agua = (32.5 * a.peso + 750 * a.horas_entreno) / 1000

    return {
        "formula": formula,
        "tmr": round(bmr),
        "tdee": round(tdee),
        "tdee_rango": [round(tdee * .9), round(tdee * 1.1)],
        "kcal": round(kcal),
        "proteina_g": round(prot),
        "proteina_g_kg": round(prot / a.peso, 2),
        "grasa_g": round(grasa),
        "hc_g": round(hc),
        "hc_g_kg": round(hc / a.peso, 2),
        "proteina_min_por_comida_principal_g": round(.25 * a.peso),
        "agua_L": round(agua, 1),
        "comidas": tiempos,
        "notas": notas,
    }


def reparto(n, entreno, kcal, hc):
    filas = [list(x) for x in REPARTO[n]]
    pre = post = None
    if entreno:
        h = int(entreno.split(":")[0])
        nombres = [f[0] for f in filas]
        if h < 10:
            pre, post = None, "Desayuno"
        elif h < 16:
            pre = "Colación AM" if "Colación AM" in nombres else None
            post = "Comida"
        else:
            pre = "Colación PM" if "Colación PM" in nombres else None
            post = "Cena"
        # Mueve ~10 % del día hacia pre/post desde las comidas no adyacentes (D)
        mover = .10
        receptores = [f for f in filas if f[0] in (pre, post)]
        donantes = [f for f in filas if f[0] not in (pre, post)]
        if receptores and donantes:
            tot_d = sum(f[1] for f in donantes)
            for f in donantes:
                f[1] -= mover * f[1] / tot_d
            for f in receptores:
                f[1] += mover / len(receptores)
    out = []
    for nombre, p in filas:
        rol = "pre" if nombre == pre else "post" if nombre == post else ""
        out.append({"tiempo": nombre, "pct": round(p * 100, 1), "kcal": round(kcal * p), "rol": rol})
    return out


def main():
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument("--sexo", choices=["f", "m"], required=True)
    p.add_argument("--edad", type=int, required=True)
    p.add_argument("--peso", type=float, required=True, help="kg")
    p.add_argument("--talla", type=float, required=True, help="cm")
    p.add_argument("--actividad", type=float, default=1.45, help="factor 1.2–1.9 (sesgar hacia abajo)")
    p.add_argument("--grasa", type=float, help="%% de grasa; activa Cunningham")
    p.add_argument("--objetivo", required=True,
                   choices=["masa", "definicion", "recomposicion", "rendimiento", "rehabilitacion"])
    p.add_argument("--nivel", default="intermedio", choices=list(SUPERAVIT_NIVEL))
    p.add_argument("--carga", default="moderado", choices=["descanso", "ligero", "moderado", "pesado", "doble"])
    p.add_argument("--perfil", default="mixto", choices=list(CHO_PERFIL))
    p.add_argument("--inmovilizado", action="store_true", help="bota o férula: proteína 2.5 g/kg")
    p.add_argument("--comidas", type=int, default=5, choices=[3, 4, 5, 6])
    p.add_argument("--entreno", help="hora HH:MM")
    p.add_argument("--horas-entreno", type=float, default=1.0)
    p.add_argument("--json", action="store_true")
    a = p.parse_args()
    if a.edad < 18:
        raise SystemExit("Menor de 18: modo educativo, sin metas de kcal (ver references/seguridad.md)")

    r = metas(a)
    if a.json:
        print(json.dumps(r, ensure_ascii=False, indent=2))
        return
    print(f"{r['formula']}: TMR {r['tmr']} · TDEE {r['tdee']} (rango {r['tdee_rango'][0]}–{r['tdee_rango'][1]})")
    print(f"Meta: {r['kcal']} kcal · P {r['proteina_g']} g ({r['proteina_g_kg']} g/kg) · "
          f"L {r['grasa_g']} g · HC {r['hc_g']} g ({r['hc_g_kg']} g/kg) · agua ~{r['agua_L']} L")
    print(f"Proteína mínima por comida principal: {r['proteina_min_por_comida_principal_g']} g")
    for c in r["comidas"]:
        rol = f"  [{c['rol']}]" if c["rol"] else ""
        print(f"  {c['tiempo']:<12} {c['pct']:>5}%  {c['kcal']:>5} kcal{rol}")
    for n in r["notas"]:
        print("Nota:", n)


if __name__ == "__main__":
    main()
