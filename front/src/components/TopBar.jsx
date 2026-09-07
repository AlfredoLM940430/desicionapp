import { useEffect, useRef, useState } from "react";
import logo from "../../public/img/logo-caja-pio.png"
import { fecthLocalidad } from "../api/api";
import { useAuth } from "../AuthContext";

const obtenerIniciales = (nombre, email) => {
    if (nombre && nombre.trim()) {
        const partes = nombre.trim().split(" ");
        const iniciales = partes.length > 1
            ? partes[0][0] + partes[1][0]
            : partes[0].slice(0, 2);
        return iniciales.toUpperCase();
    }
    return (email || "?").slice(0, 2).toUpperCase();
};

export const TopBar = ({ ubicacion, onLocationChange }) => {
    const { usuario, logout } = useAuth();
    const [searchTerm, setSearchTerm] = useState("");
    const [results, setResults] = useState([]);
    const [menuAbierto, setMenuAbierto] = useState(false);
    const menuRef = useRef(null);

    useEffect(() => {
        if (ubicacion) {
            setSearchTerm(`${ubicacion.localidad}, ${ubicacion.municipio}`);
        } else {
            setSearchTerm("");
        }
    }, [ubicacion]);

    useEffect(() => {
        const cerrarAlHacerClickFuera = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                setMenuAbierto(false);
            }
        };
        document.addEventListener("mousedown", cerrarAlHacerClickFuera);
        return () => document.removeEventListener("mousedown", cerrarAlHacerClickFuera);
    }, []);

    const handleSearch = async (e) => {
        const value = e.target.value;
        setSearchTerm(value);

        if (value.length > 3) {
            try {
                const data = await fecthLocalidad(value);
                setResults(data);
            } catch (error) {
                alert(error.message);
            }
        }
    };

    const onReset = () => {
        window.location.reload();
    };

    return (
        <header className="h-16 border-b border-outline-variant bg-white flex justify-between items-center px-6 z-50 relative">
            <img src={logo} alt="Logo" width={150} onClick={onReset} className="cursor-pointer" />

            <div className="relative w-96">
                <svg
                    className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-outline pointer-events-none"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    viewBox="0 0 24 24"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35m1.35-5.15a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>

                <input
                    type="text"
                    placeholder="Buscar localidad..."
                    value={searchTerm}
                    onChange={handleSearch}
                    className="w-full pl-10 pr-4 py-2 bg-surface-container-low border border-outline-variant rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20"
                />

                {results.length > 0 && (
                    <div className="absolute top-full mt-2 w-full bg-white border border-outline-variant rounded-xl shadow-xl z-50 overflow-hidden">
                        {results.map((item, index) => (
                            <div
                                key={index}
                                className="p-3 hover:bg-surface-container-low cursor-pointer border-b border-outline-variant last:border-0"
                                onClick={() => {
                                    onLocationChange(item);
                                    setResults([]);
                                }}
                            >
                                <p className="font-bold text-sm">{item.localidad}</p>
                                <p className="text-xs text-outline">{item.municipio}, {item.estado}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="relative" ref={menuRef}>
                <button
                    onClick={() => setMenuAbierto((v) => !v)}
                    className="flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-full hover:bg-surface-container-low transition-colors"
                >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-semibold">
                        {obtenerIniciales(usuario?.nombre, usuario?.email)}
                    </span>
                    <span className="text-sm font-medium text-slate-700 max-w-[140px] truncate">
                        {/* {usuario?.nombre || usuario?.email} */}
                        Caja Pío
                    </span>
                    <svg
                        className={`h-4 w-4 text-outline transition-transform ${menuAbierto ? "rotate-180" : ""}`}
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2}
                        viewBox="0 0 24 24"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                </button>

                {menuAbierto && (
                    <div className="absolute right-0 top-full mt-2 w-52 bg-white border border-outline-variant rounded-xl shadow-xl overflow-hidden">
                        <div className="px-4 py-3 border-b border-outline-variant">
                            <p className="text-sm font-medium text-slate-900 truncate">
                                {usuario?.nombre || "Sesión activa"}
                            </p>
                            <p className="text-xs text-outline truncate">{usuario?.email}</p>
                        </div>
                        <button
                            onClick={logout}
                            className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                        >
                            <svg
                                className="h-4 w-4"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth={2}
                                viewBox="0 0 24 24"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                            Cerrar sesión
                        </button>
                    </div>
                )}
            </div>
        </header>
    );
};
