import { useState } from "react";
import { useAuth } from "../AuthContext";

export default function LoginPage() {
    const { login, registro } = useAuth();
    const [modo, setModo] = useState("login"); // "login" | "registro"
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [nombre, setNombre] = useState("");
    const [error, setError] = useState("");
    const [cargando, setCargando] = useState(false);

    const esRegistro = modo === "registro";

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setCargando(true);

        try {
            if (esRegistro) {
                await registro(email, password, nombre);
                await login(email, password);
            } else {
                await login(email, password);
            }
        } catch (err) {
            setError(err.message || "Ocurrió un error. Intenta de nuevo.");
        } finally {
            setCargando(false);
        }
    };

    const cambiarModo = () => {
        setError("");
        setModo(esRegistro ? "login" : "registro");
    };

    return (
        <div className="h-screen w-screen flex items-center justify-center bg-slate-50 px-4">
            <div className="w-full max-w-sm">

                <div className="mb-8 text-center">
                    <div className="inline-flex h-11 w-15 items-center justify-center rounded-xl bg-green-900 text-white text-sm font-semibold mb-4">
                        Pío XII
                    </div>
                    <h1 className="text-xl font-semibold text-slate-900">
                        {esRegistro ? "Crear una cuenta" : "Inicia sesión"}
                    </h1>
                    {/* <p className="mt-1 text-sm text-slate-500">
                        {esRegistro
                            ? "Regístrate para acceder al panel de Geomarket"
                            : "Accede al panel de Geomarket"}
                    </p> */}
                </div>

                <form
                    onSubmit={handleSubmit}
                    className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 space-y-4"
                >
                    {esRegistro && (
                        <div>
                            <label htmlFor="nombre" className="block text-sm font-medium text-slate-700 mb-1">
                                Nombre
                            </label>
                            <input
                                id="nombre"
                                type="text"
                                value={nombre}
                                onChange={(e) => setNombre(e.target.value)}
                                placeholder="Tu nombre"
                                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400"
                            />
                        </div>
                    )}

                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">
                            Correo electrónico
                        </label>
                        <input
                            id="email"
                            type="email"
                            required
                            autoComplete="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="correo@empresa.com"
                            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400"
                        />
                    </div>

                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1">
                            Contraseña
                        </label>
                        <input
                            id="password"
                            type="password"
                            required
                            minLength={8}
                            autoComplete={esRegistro ? "new-password" : "current-password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400"
                        />
                    </div>

                    {error && (
                        <div className="rounded-lg bg-red-50 border border-red-100 px-3 py-2 text-sm text-red-700">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={cargando}
                        className="w-full rounded-lg bg-green-900 text-white text-sm font-medium py-2.5 hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {cargando
                            ? "Cargando..."
                            : esRegistro
                                ? "Crear cuenta"
                                : "Iniciar sesión"}
                    </button>
                </form>

                {/* <p className="mt-6 text-center text-sm text-slate-500">
                    {esRegistro ? "¿Ya tienes cuenta?" : "¿No tienes cuenta?"}{" "}
                    <button
                        type="button"
                        onClick={cambiarModo}
                        className="font-medium text-slate-900 hover:underline"
                    >
                        {esRegistro ? "Inicia sesión" : "Regístrate"}
                    </button>
                </p> */}
            </div>
        </div>
    );
}
