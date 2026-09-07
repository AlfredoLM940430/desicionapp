import { createContext, useContext, useState, useEffect } from "react";
const BASE_URL = import.meta.env.VITE_API_URL;

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [token, setToken] = useState(() => localStorage.getItem("token"));
    const [usuario, setUsuario] = useState(null);
    const [cargandoAuth, setCargandoAuth] = useState(true);

    useEffect(() => {
        if (!token) {
            setCargandoAuth(false);
            return;
        }
        fetch(`${BASE_URL}/auth/me`, {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(res => {
                if (!res.ok) throw new Error("Token inválido");
                return res.json();
            })
            .then(data => setUsuario(data))
            .catch(() => {
                localStorage.removeItem("token");
                setToken(null);
            })
            .finally(() => setCargandoAuth(false));
    }, [token]);

    const login = async (email, password) => {
        const res = await fetch(`${BASE_URL}/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password })
        });
        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.detail || "Error al iniciar sesión");
        }
        const data = await res.json();
        localStorage.setItem("token", data.access_token);
        setToken(data.access_token);
        setUsuario(data.usuario);
    };

    const registro = async (email, password, nombre) => {
        const res = await fetch(`${BASE_URL}/auth/registro`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password, nombre })
        });
        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.detail || "Error al registrar");
        }
        return res.json();
    };

    const logout = () => {
        localStorage.removeItem("token");
        setToken(null);
        setUsuario(null);
    };

    return (
        <AuthContext.Provider value={{ token, usuario, login, registro, logout, cargandoAuth }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);