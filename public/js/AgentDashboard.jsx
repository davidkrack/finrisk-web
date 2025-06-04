import React, { useState, useEffect } from 'react';
import { LineChart, XAxis, YAxis, Tooltip, Legend, Line, ResponsiveContainer } from 'recharts';

export default function AgentDashboard() {
    const [clientData, setClientData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [contactFilter, setContactFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [stats, setStats] = useState({
        totalClients: 0,
        needsContact: 0,
        averageAmount: 0
    });

    const ITEMS_PER_PAGE = 20;

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const response = await fetch('/api/client-data');
            if (!response.ok) {
                throw new Error('Error al cargar datos');
            }
            const data = await response.json();
            setClientData(data);
            calculateStats(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const calculateStats = (data) => {
        const total = data.length;
        const needsContact = data.filter(client => client.DESEA_SER_CONTACTADO === 'S').length;
        const avgAmount = data.reduce((sum, client) => sum + parseFloat(client.PRIMA_TOT || 0), 0) / total;

        setStats({
            totalClients: total,
            needsContact: needsContact,
            averageAmount: avgAmount
        });
    };

    // Filtrar datos
    const filteredData = clientData.filter(client => {
        const matchesContact = contactFilter === 'all' ? true : 
            contactFilter === 'yes' ? client.DESEA_SER_CONTACTADO === 'S' : 
            client.DESEA_SER_CONTACTADO === 'N';
        
        const matchesSearch = client.NOMBRE?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            client.EMAIL?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            client.TELEFONO?.includes(searchTerm);

        return matchesContact && matchesSearch;
    });

    // Calcular datos paginados
    const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);
    const paginatedData = filteredData.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-lg">Cargando...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-lg text-red-600">Error: {error}</div>
            </div>
        );
    }

    return (
        <div className="p-6">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Dashboard de Agente</h1>
                <button 
                    id="logout-btn" 
                    className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
                >
                    Cerrar Sesión
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-white p-6 rounded-lg shadow">
                    <h2 className="text-sm text-gray-600">Total Clientes</h2>
                    <p className="text-3xl font-bold">{stats.totalClients}</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow">
                    <h2 className="text-sm text-gray-600">Solicitudes de Contacto</h2>
                    <p className="text-3xl font-bold">{stats.needsContact}</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow">
                    <h2 className="text-sm text-gray-600">Promedio Prima</h2>
                    <p className="text-3xl font-bold">
                        ${stats.averageAmount.toLocaleString('es-PE', { 
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2 
                        })}
                    </p>
                </div>
            </div>

            {/* Filters */}
            <div className="flex gap-4 mb-6">
                <select 
                    className="w-64 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    value={contactFilter}
                    onChange={(e) => setContactFilter(e.target.value)}
                >
                    <option value="all">Todos los contactos</option>
                    <option value="yes">Desean ser contactados</option>
                    <option value="no">No desean ser contactados</option>
                </select>
                <input
                    type="text"
                    placeholder="Buscar por nombre, email o teléfono..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-64 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
            </div>

            {/* Client Table */}
            <div className="bg-white rounded-lg shadow mb-6">
                <div className="p-6">
                    <h2 className="text-xl font-semibold mb-4">Clientes Recientes</h2>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-gray-50">
                                    <th className="text-left p-3">Nombre</th>
                                    <th className="text-left p-3">Email</th>
                                    <th className="text-left p-3">Teléfono</th>
                                    <th className="text-right p-3">Prima</th>
                                    <th className="text-center p-3">Contactar</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginatedData.map((client) => (
                                    <tr 
                                        key={`${client.ID_USUARIO}-${client.ID_SIMULACION}`} 
                                        className="border-t hover:bg-gray-50"
                                    >
                                        <td className="p-3">{client.NOMBRE}</td>
                                        <td className="p-3">{client.EMAIL}</td>
                                        <td className="p-3">{client.TELEFONO}</td>
                                        <td className="p-3 text-right">
                                            ${parseFloat(client.PRIMA_TOT || 0).toLocaleString('es-PE', {
                                                minimumFractionDigits: 2,
                                                maximumFractionDigits: 2
                                            })}
                                        </td>
                                        <td className="p-3 text-center">
                                            <span className={`px-2 py-1 rounded-full text-sm ${
                                                client.DESEA_SER_CONTACTADO === 'S' 
                                                    ? 'bg-green-100 text-green-800' 
                                                    : 'bg-gray-100 text-gray-800'
                                            }`}>
                                                {client.DESEA_SER_CONTACTADO === 'S' ? 'Sí' : 'No'}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div className="flex justify-between items-center mt-4">
                        <div className="text-sm text-gray-600">
                            Mostrando {((currentPage - 1) * ITEMS_PER_PAGE) + 1} a {Math.min(currentPage * ITEMS_PER_PAGE, filteredData.length)} de {filteredData.length} resultados
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className="px-4 py-2 border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Anterior
                            </button>
                            <button
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                                className="px-4 py-2 border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Siguiente
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}