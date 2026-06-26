import { useEffect, useState } from "react";
import logo from "../../public/img/logo-caja-pio.png"
import { fecthLocalidad } from "../api/api";

export const TopBar = ({ ubicacion, onLocationChange }) => {
    const [searchTerm, setSearchTerm] = useState("");
    const [results, setResults] = useState([]);

    // const API_URL = "http://localhost:8000/api/finder"; //!

    useEffect(() => {
        if (ubicacion) {
            setSearchTerm(`${ubicacion.localidad}, ${ubicacion.municipio}`);
        } else {
            setSearchTerm("");
        }
    }, [ubicacion]);

    // const handleSearch = async (e) => {
    //     const value = e.target.value;
    //     setSearchTerm(value);
    //     if (value.length > 3) { 
    //         try {
    //             const response = await fetch(`${API_URL}?nombre=${encodeURIComponent(value)}`);
    //             const data = await response.json();
    //             setResults(data);
    //         } catch (error) {
    //             console.error("Error al consultar el endpoint:", error);
    //         }
    //     } else {
    //         setResults([]);
    //     }
    // };

    const handleSearch = async (e) => {
        const value = e.target.value;
        setSearchTerm(value);

        console.log(value)
        if(value.length > 3) {
            try {
                const data = await fecthLocalidad(value);
                setResults(data);
            } catch (error) {
                alert(error.message); 
            }
        }

    }

    const onReset = () => {
        window.location.reload();
    };
  
    return (
        <header className="h-16 border-b border-outline-variant bg-white flex justify-between items-center px-6 z-50 relative">
            <img src={logo} alt="Logo" width={150} onClick={onReset} className="cursor-pointer" />

            <div className="relative w-96">
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
        </header>
    );
};