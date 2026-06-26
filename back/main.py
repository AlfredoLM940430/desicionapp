import json
import os
import logging
import math
import re
from typing import List, Optional
from http.client import BadStatusLine
from requests.exceptions import ConnectionError, Timeout
import requests
import sqlite3
from fastapi import FastAPI, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from pathlib import Path

load_dotenv()

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# 1. Directorio base absoluto
BASE_DIR = Path(__file__).resolve().parent
DB_PATH = BASE_DIR / "geomarket.db"
FILE_INGRESOS = os.getenv("INGRESOS_FILE", "datosIngresos.json")

TOKEN_INEGI = os.getenv("TOKEN_INEGI")
if not TOKEN_INEGI:
    logger.warning("⚠️ TOKEN_INEGI no configurado")

ENV = os.getenv("ENV", "development")

# Configuración de CORS
CORS_ORIGIN = os.getenv("CORS_ORIGIN", "http://localhost:5173").split(",")

app = FastAPI(title="SOCAP Geomarket API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGIN,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Función auxiliar para abrir conexión a SQLite y retornar filas tipo diccionario
def get_db_connection():
    if not DB_PATH.exists():
        raise HTTPException(status_code=500, detail="Base de datos geomarket.db no encontrada en el servidor.")
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

# Función auxiliar para cargar los ingresos (JSON de Diccionario)
def cargar_datos_ingresos_json():
    path_ingresos = BASE_DIR / FILE_INGRESOS
    if not path_ingresos.exists():
        raise HTTPException(status_code=500, detail=f"Archivo '{FILE_INGRESOS}' no encontrado en el servidor.")
    try:
        with open(path_ingresos, "r", encoding="utf-8") as file:
            return json.load(file)
    except json.JSONDecodeError:
        raise HTTPException(status_code=500, detail="Error al decodificar el archivo JSON de ingresos.")  

# Funciones matemáticas de cálculo geomarket
def calcular_distancia(lat1, lon1, lat2, lon2):
    R = 6371.0
    rad_lat1, rad_lon1, rad_lat2, rad_lon2 = map(math.radians, [lat1, lon1, lat2, lon2])
    dlat = rad_lat2 - rad_lat1
    dlon = rad_lon2 - rad_lon1
    a = math.sin(dlat / 2)**2 + math.cos(rad_lat1) * math.cos(rad_lat2) * math.sin(dlon / 2)**2
    return R * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    
def obtener_peso_estrato(estrato: str) -> int:
    if not estrato:
        return 0
    estrato_limpio = str(estrato).lower().strip()
    if "0 a 5" in estrato_limpio: return 1
    elif "6 a 10" in estrato_limpio: return 2
    elif "11 a 30" in estrato_limpio: return 3
    elif "31 a 50" in estrato_limpio: return 4
    elif "51 a 100" in estrato_limpio: return 5
    elif "101 a 250" in estrato_limpio: return 6
    elif "251 o más" in estrato_limpio or "251 o mas" in estrato_limpio: return 7
    return 0 

# --- ENDPOINTS ---

@app.get("/health")
def health():
    return {"status": "ok", "version": "1.0"}

@app.get("/ready")
def readiness():
    try:
        conn = get_db_connection()
        count = conn.execute("SELECT count(*) FROM localidades").fetchone()[0]
        conn.close()
        return {"status": "ready", "localidades": count}
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"Base de datos no disponible: {str(e)}")
        
@app.get("/api/ingresos")
def obtener_ingresos_por_estado(estado: str = Query(..., description="Nombre del estado a buscar")):
    datos = cargar_datos_ingresos_json()
    estado_normalizado = estado.strip()
    
    if estado_normalizado in datos:
        return datos[estado_normalizado]
        
    datos_keys_lower = {k.lower(): k for k in datos.keys()}
    if estado_normalizado.lower() in datos_keys_lower:
        real_key = datos_keys_lower[estado_normalizado.lower()]
        return datos[real_key]
        
    raise HTTPException(
        status_code=404, 
        detail=f"El estado '{estado}' no se encuentra en la base de datos de ingresos."
    )

@app.get("/api/localidad-cercana")
def obtener_localidad_cercana(
    lat: float = Query(..., description="Latitud enviada desde React"),
    lon: float = Query(..., description="Longitud enviada desde React")
):
    conn = get_db_connection()
    # Traemos solo las columnas necesarias para no saturar memoria
    rows = conn.execute("SELECT estado, municipio, localidad, coordenadas, demografia, gestion_riesgos FROM localidades").fetchall()
    conn.close()

    localidad_mas_cercana = None
    distancia_minima = float('inf')

    for row in rows:
        try:
            lat_str, lon_str = row["coordenadas"].split(",")
            lat_json = float(lat_str.strip())
            lon_json = float(lon_str.strip())
        except (ValueError, KeyError, TypeError):
            continue

        distancia = calcular_distancia(lat, lon, lat_json, lon_json)

        if distancia < distancia_minima:
            distancia_minima = distancia
            localidad_mas_cercana = {
                "estado": row["estado"],
                "municipio": row["municipio"],
                "localidad": row["localidad"],
                "coordenadas": row["coordenadas"],
                "demografia": json.loads(row["demografia"]),
                "gestion_riesgos": json.loads(row["gestion_riesgos"])
            }

    if not localidad_mas_cercana:
        raise HTTPException(status_code=404, detail="No se encontraron localidades válidas")

    localidad_mas_cercana["distancia_km_aproximada"] = round(distancia_minima, 2)
    return localidad_mas_cercana

@app.get("/api/finder")
def obtener_localidades_finder(nombre: Optional[str] = Query(None, description="Nombre de la localidad a buscar")):
    if not nombre or nombre.strip() == "":
        return []  
    
    conn = get_db_connection()
    rows = conn.execute(
        "SELECT estado, municipio, localidad, coordenadas, demografia, gestion_riesgos FROM localidades WHERE localidad LIKE ?",
        (f"%{nombre}%",)
    ).fetchall()
    conn.close()
    
    resultados = [{
        "estado": row["estado"],
        "municipio": row["municipio"],
        "localidad": row["localidad"],
        "coordenadas": row["coordenadas"],
        "demografia": json.loads(row["demografia"]),
        "gestion_riesgos": json.loads(row["gestion_riesgos"])
    } for row in rows]
    
    logger.info(f"Búsqueda '/api/finder': '{nombre}' encontró {len(resultados)} resultados")
    return resultados

@app.get("/api/estados")
def obtener_estados():
    conn = get_db_connection()
    rows = conn.execute("SELECT DISTINCT estado FROM localidades WHERE estado IS NOT NULL ORDER BY estado").fetchall()
    conn.close()
    return [row["estado"] for row in rows]

@app.get("/api/municipios/{estado}")
def obtener_municipios(estado: str):
    conn = get_db_connection()
    rows = conn.execute(
        "SELECT DISTINCT municipio FROM localidades WHERE LOWER(estado) = ? AND municipio IS NOT NULL ORDER BY municipio",
        (estado.lower(),)
    ).fetchall()
    conn.close()
    return [row["municipio"] for row in rows]

@app.get("/api/localidades/{estado}/{municipio}")
def obtener_localidades(estado: str, municipio: str):
    conn = get_db_connection()
    rows = conn.execute('''
        SELECT localidad, coordenadas, demografia, gestion_riesgos 
        FROM localidades 
        WHERE LOWER(estado) = ? AND LOWER(municipio) = ?
    ''', (estado.lower(), municipio.lower())).fetchall()
    conn.close()
    
    return [{
        "localidad": row["localidad"],
        "coordenadas": row["coordenadas"],
        "demografia": json.loads(row["demografia"]),
        "gestion_riesgos": json.loads(row["gestion_riesgos"])
    } for row in rows]

@app.get("/api/analizar")
def analizar_zona(
    lat: float = Query(..., description="Latitud de búsqueda"),
    lon: float = Query(..., description="Longitud de búsqueda"),
    radio: int = Query(2000, description="Radio en metros"),
    palabra: str = Query("todos", description="Filtro para el DENUE")
):
    if not TOKEN_INEGI:
        logger.error("TOKEN_INEGI no está configurado")
        return {"status": "error", "message": "Token de INEGI no configurado"}
    
    url = f"https://www.inegi.org.mx/app/api/denue/v1/consulta/Buscar/{palabra}/{lat},{lon}/{radio}/{TOKEN_INEGI}"
    
    try:
        response = requests.get(url, timeout=12)
        if response.status_code != 200:
            logger.warning(f"INEGI retornó status {response.status_code}")
            return {"status": "error", "message": "Error al conectar con el DENUE"}
        
        registros = response.json()
        if not isinstance(registros, list):
            return {"competidores": [], "comercios": [], "total_demografico": 0}

        competidores = []
        comercios = []

        patron_financiero = r"(banco|sofipo|sofom|cooperativa de ahorro|caja popular|caja de ahorro|prestamos|credito|financiera)"
        patron_exclusion = r"(farmacia|escolar|preparatoria|primaria|calzado|zapateria|botanico|naturista|celulares|cafeteria|cyber|abarrotes|alimentos|sangre|organos)"

        for item in registros:
            nombre = str(item.get("Nombre", "")).lower()
            giro_real = item.get("Clase") or item.get("Clase_actividad") or "No especificado"
            estrato_personal = item.get("Estrato", "No especificado")
            
            entidad = {
                "id": item.get("Id"),
                "nombre": item.get("Nombre"),
                "giro": giro_real,
                "direccion": f"{item.get('Calle', '')} {item.get('Numero_exterior', '') or ''}, Col. {item.get('Colonia', '')}",
                "latitud": float(item.get("Latitud", 0)),
                "longitud": float(item.get("Longitud", 0)),
                "personal": estrato_personal,
                "razon_social": item.get("Razon_social") or "Sin datos en DENUE",
                "telefono": item.get("Telefono") or "Sin datos en DENUE",
                "correo": item.get("Correo_e") or "Sin datos en DENUE",
                "sitio_web": item.get("Sitio_internet") or "Sin datos en DENUE",
                "_peso": obtener_peso_estrato(estrato_personal)
            }

            es_financiero = re.search(patron_financiero, nombre) or re.search(patron_financiero, giro_real)
            es_falso_positivo = re.search(patron_exclusion, nombre) or re.search(patron_exclusion, giro_real)

            if es_financiero and not es_falso_positivo:
                competidores.append(entidad)
            else:
                comercios.append(entidad)
                
        competidores_ordenados = sorted(competidores, key=lambda x: x["_peso"], reverse=True)
        comercios_ordenados = sorted(comercios, key=lambda x: x["_peso"], reverse=True)
        
        for c in competidores_ordenados: c.pop("_peso", None)
        for c in comercios_ordenados: c.pop("_peso", None)
        
        total_com = len(comercios_ordenados)
        poblacion_estimada = max(1200, total_com * 145)
        
        logger.info(f"Análisis completado: {total_com} comercios, {len(competidores_ordenados)} competidores")
        
        return {
            "status": "success",
            "resumen": {
                "total_comercios": total_com,
                "total_competidores": len(competidores_ordenados),
            },
            "competidores": competidores_ordenados,
            "comercios": comercios_ordenados,
        }
        
    except (ConnectionError, BadStatusLine) as e:
        logger.warning(f"Conexión abortada por el INEGI: {e}")
        return {
            "status": "success",
            "resumen": {
                "total_comercios": 0,
                "total_competidores": 0,
                "estimacion_socios_potenciales": 0
            },
            "competidores": [],
            "comercios": []
        }
        
    except Timeout:
        logger.error("Timeout: La API de INEGI tardó demasiado")
        return {"status": "error", "message": "La API de INEGI tardó demasiado en responder"}
    except Exception as e:
        logger.error(f"Error inesperado: {str(e)}")
        return {"status": "error", "message": f"Error inesperado: {str(e)}"}