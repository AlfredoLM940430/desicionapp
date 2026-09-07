const BASE_URL = import.meta.env.VITE_API_URL;

// api.js
export async function fetchAutenticado(url, token, options = {}) {
    const res = await fetch(url, {
        ...options,
        headers: {
            ...options.headers,
            Authorization: `Bearer ${token}`
        }
    });
    if (res.status === 401) {
        localStorage.removeItem("token");
        window.location.reload(); // fuerza vuelta al login
    }
    return res.json();
}

export const fetchDenueData = async (lat, lon, radioKm, token) => {
    try {
        const url = `${BASE_URL}/analizar?lat=${lat}&lon=${lon}&radio=${radioKm}`;
        const datos = await fetchAutenticado(url, token);
        return datos;
    } catch (error) {
        console.error("Error en fetchDenueData:", error);
        throw error;
    }
};

export const fetchIngresosEstado = async (nombreEstado) => {
    try {
        const url = `${BASE_URL}/ingresos?estado=${encodeURIComponent(nombreEstado)}`;
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error("No se encontraron datos para este estado");
        }
        
        return await response.json();
    } catch (error) {
        console.error("Error en fetchIngresosEstado:", error);
        throw error;
    }
};

export const fetchDatosCoordenadas = async (latitude, longitude) => {
    try {
        const url = `${BASE_URL}/localidad-cercana?lat=${latitude}&lon=${longitude}`;
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error("No se pudo obtener la localidad");
        }
        return await response.json();
        
    } catch (error) {
        console.error("Error al consultar el backend:", error);
    }
}

export const fecthLocalidad = async (value) => {
    try {
        const url = `${BASE_URL}/finder?nombre=${encodeURIComponent(value)}`;
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error("No se pudo obtener la localidad");
        }
        return await response.json();

    } catch (error) {
        console.error("Error al consultar el backend:", error);
    }
}

export const fetchEstados = async () => {
    try {
        const response = await fetch(`${BASE_URL}/estados`);
        if (!response.ok) throw new Error("Error al cargar estados");
        return await response.json();
    } catch (error) {
        console.error("Error en fetchEstados:", error);
        throw error;
    }
};

export const fetchMunicipios = async (estado) => {
    try {
        const response = await fetch(`${BASE_URL}/municipios/${encodeURIComponent(estado)}`);
        if (!response.ok) throw new Error("Error al cargar municipios");
        return await response.json();
    } catch (error) {
        console.error("Error en fetchMunicipios:", error);
        throw error;
    }
};

export const fetchLocalidades = async (estado, municipio) => {
    try {
        const response = await fetch(`${BASE_URL}/localidades/${encodeURIComponent(estado)}/${encodeURIComponent(municipio)}`);
        if (!response.ok) throw new Error("Error al cargar localidades");
        return await response.json();
    } catch (error) {
        console.error("Error en fetchLocalidades:", error);
        throw error;
    }
};