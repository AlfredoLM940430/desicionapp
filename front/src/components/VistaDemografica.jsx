import { useRecomendacion } from "../hook/useRecomendacion";
import { GraficoDelitos } from "./GraficoDelitos";
import { GraficoEdades } from "./GraficoEdades";

export default function VistaDemografica({ dataDEUNE, onNavigate, poblacion, ingresos}) {
    const demo = poblacion || {
        poblacion_total: "No disponible",
        edad_mediana: "No disponible",
        nse_predominante: "No disponible",
        viviendas_habiles: "No disponible",
        poblacion_economicamente_activa: "No disponible"
    };
    
    const agrupado = dataDEUNE?.comercios.reduce((acumulador, item) => { 
        const rango = item.personal; 
        if (rango) {
            acumulador[rango] = (acumulador[rango] || 0) + 1;
        }
        return acumulador;
    }, {});

    const porcentaje = useRecomendacion(poblacion, dataDEUNE, agrupado)
    console.log(poblacion.demografia.porcentaje_femenino)
    console.log(poblacion.porcentaje_masculino)

    return (
        <div className="p-8 max-w-5xl mx-auto animate-fade-in text-gray-700">
            {/* Botón Regresar */}
            <button 
                onClick={() => onNavigate("mapa")}
                className="mb-6 text-sm font-medium text-secondary hover:text-secondary-hover flex items-center gap-2 transition-colors focus:outline-none"
            >
                ← Regresar al Mapa
            </button>
            
            {/* Encabezado Principal */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-[#031636] tracking-tight">
                    Análisis Demográfico de {poblacion.localidad}, {poblacion.municipio}
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                    Indicadores clave de población y mercado potencial (Radio de 2km)
                </p>
            </div>

            {/* Bloque 1: Indicadores Demográficos */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                {/* Tarjeta Población */}
                <div className="bg-white p-6 rounded-2xl border border-outline-variant shadow-sm transition-all hover:shadow-md">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Población Total</span>
                    <div className="text-4xl font-extrabold text-[#031636] mt-2">{demo.demografia.poblacion_total}</div>
                    <p className="text-xs text-gray-400 mt-2">Habitantes residentes detectados en la periferia</p>
                </div>

                {/* Tarjeta Edad Mediana */}
                <div className="bg-white p-6 rounded-2xl border border-outline-variant shadow-sm transition-all hover:shadow-md">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Edad Mediana</span>
                    <div className="text-4xl font-extrabold text-secondary mt-2">
                        {demo.demografia.edad_mediana} <span className="text-lg font-normal text-gray-500">años</span>
                    </div>
                    <p className="text-xs text-gray-400 mt-2">Ideal para diseño de productos de captación/crédito</p>
                </div>

                {/* Tarjeta Nivel Socioeconómico */}
                <div className="bg-white p-6 rounded-2xl border border-outline-variant shadow-sm transition-all hover:shadow-md">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Nivel Socioeconómico (NSE)</span>
                    <div className="text-4xl font-extrabold text-emerald-600 mt-2">{demo.demografia.nse_predominante}</div>
                    <p className="text-xs text-gray-400 mt-2">Estrato socioeconómico predominante en la zona</p>
                </div>
            </div>

            {/* Bloque 2: Indicadores de Vivienda y Mercado */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {/* Tarjeta Hogares */}
                <div className="bg-white p-6 rounded-2xl border border-outline-variant shadow-sm transition-all hover:shadow-md">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Hogares Habitados</span>
                    <div className="text-4xl font-extrabold text-[#031636] mt-2">{demo.demografia.viviendas_habiles}</div>
                    <p className="text-xs text-gray-400 mt-2">Viviendas particulares habitadas</p>
                </div>

                {/* Tarjeta PEA */}
                <div className="bg-white p-6 rounded-2xl border border-outline-variant shadow-sm transition-all hover:shadow-md">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Población Econ. Activa (PEA)</span>
                    <div className="text-4xl font-extrabold text-[#031636] mt-2">{demo.demografia.poblacion_economicamente_activa}</div>
                    <p className="text-xs text-gray-400 mt-2">Fuerza laboral disponible en el área</p>
                </div>

                {/* Tarjeta Rezago Social */}
                <div className="bg-white p-6 rounded-2xl border border-outline-variant shadow-sm transition-all hover:shadow-md">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Rezago Social</span>
                    <div className="text-4xl font-extrabold text-[#031636] mt-2">{demo.gestion_riesgos.rezago_social_localidad}</div>
                    <p className="text-xs text-gray-400 mt-2">Grado de rezago según índices oficiales</p>
                </div>
            </div>

            {/* Gráfico de Ingresos */}
            <div className="bg-white p-6 rounded-2xl border border-outline-variant shadow-sm mb-8">
                <h3 className="text-lg font-bold text-[#031636] mb-4 text-left">Distribución de Ingresos por Género</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="flex flex-col items-center bg-gray-50 p-4 rounded-xl">
                        <GraficoEdades datosRangos={ingresos.hombre} />
                        <p className="text-sm font-semibold text-gray-600 mt-3">Hombres <span>{poblacion.demografia.porcentaje_masculino}</span></p>
                    </div>
                    <div className="flex flex-col items-center bg-gray-50 p-4 rounded-xl">
                        <GraficoEdades datosRangos={ingresos.mujer}/>
                        <p className="text-sm font-semibold text-gray-600 mt-3">Mujeres <span>{poblacion.demografia.porcentaje_femenino}</span></p>
                    </div>
                </div>
            </div>

            {/* Bloque 3: Riesgos y Éxito */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {/* Tarjeta Brecha Digital */}
                <div className="bg-white p-6 rounded-2xl border border-outline-variant shadow-sm transition-all hover:shadow-md">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Brecha Digital</span>
                    <div className="text-4xl font-extrabold text-[#031636] mt-2">{demo.gestion_riesgos.brecha_digital}</div>
                    <p className="text-xs text-gray-400 mt-2">Nivel de desconexión o acceso a tecnologías</p>
                </div>

                {/* Tarjeta Seguridad */}
                <div className="bg-white p-6 rounded-2xl border border-outline-variant shadow-sm transition-all hover:shadow-md">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Semáforo de Seguridad</span>
                    <div className="text-4xl font-extrabold text-secondary mt-2">{demo.gestion_riesgos.semaforo_seguridad_municipal}</div>
                    <p className="text-xs text-gray-400 mt-2">Estatus de seguridad en el municipio</p>
                </div>

                {/* Tarjeta Éxito */}
                <div className="bg-white p-6 rounded-2xl border border-outline-variant shadow-sm transition-all hover:shadow-md bg-gradient-to-br from-white to-emerald-50/30">
                    <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Probabilidad de Éxito</span>
                    <div className="text-4xl font-black text-emerald-600 mt-2">
                        {porcentaje.clasificacion} <span className="text-xl font-bold">({porcentaje.viabilidad}%)</span>
                    </div>
                    <p className="text-xs text-emerald-700/70 mt-2">Viabilidad estimada de colocación</p>
                </div>
            </div>

            {/* Gráfico Histórico de Delitos */}
            <div className="bg-white p-6 rounded-2xl border border-outline-variant shadow-sm mb-8">
                <h3 className="text-lg font-bold text-[#031636] mb-4">Histórico de Delitos por Año</h3>
                <GraficoDelitos historicoData={demo.gestion_riesgos.historico_delitos_por_anio} />
            </div>
            
            {/* Sección de Pros y Contras */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                {/* Tarjeta de Pros */}
                <div className="bg-white p-6 rounded-2xl border border-outline-variant shadow-sm">
                    <h3 className="text-lg font-bold text-emerald-700 mb-4 flex items-center gap-2">
                        <span className="bg-emerald-100 text-emerald-700 w-6 h-6 rounded-full flex items-center justify-center text-xs">✓</span>
                        Puntos Fuertes (Pros)
                    </h3>
                    <div className="space-y-3">
                        {porcentaje.pros.map((item, ix) => (
                            <div key={ix} className="flex items-start gap-2 text-sm text-gray-600 bg-emerald-50/50 p-2 rounded-lg">
                                <span className="text-emerald-500 font-bold mt-0.5">•</span>
                                <p>{item}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Tarjeta de Contras */}
                <div className="bg-white p-6 rounded-2xl border border-outline-variant shadow-sm">
                    <h3 className="text-lg font-bold text-rose-700 mb-4 flex items-center gap-2">
                        <span className="bg-rose-100 text-rose-700 w-6 h-6 rounded-full flex items-center justify-center text-xs">✕</span>
                        Áreas de Riesgo (Contras)
                    </h3>
                    <div className="space-y-3">
                        {porcentaje.contras.map((item, ix) => (
                            <div key={ix} className="flex items-start gap-2 text-sm text-gray-600 bg-rose-50/50 p-2 rounded-lg">
                                <span className="text-rose-500 font-bold mt-0.5">•</span>
                                <p>{item}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}