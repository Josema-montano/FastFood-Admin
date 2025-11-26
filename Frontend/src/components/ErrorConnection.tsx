import * as React from "react";

interface ErrorConnectionProps {
  onRetry: () => void;
}

const ErrorConnection: React.FC<ErrorConnectionProps> = ({ onRetry }: ErrorConnectionProps) => (
  <div className="flex flex-col items-center justify-center py-12">
    <div className="text-6xl mb-4 text-red-500">⚠️</div>
    <h2 className="text-xl font-bold mb-2 text-gray-900">Error de conexión</h2>
    <p className="text-gray-600 mb-4">No se pudo conectar con el servidor. Verifica tu conexión a internet o intenta nuevamente.</p>
    <button
      className="bg-blue-600 hover:bg-blue-800 text-white px-6 py-2 rounded-xl font-semibold shadow font-inter"
      onClick={onRetry}
    >Reintentar</button>
  </div>
);

export default ErrorConnection;
