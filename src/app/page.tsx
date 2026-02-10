'use client';


export default function HomePage() {

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 3L1 9l4 2.18v6L12 21l7-3.82v-6l2-1.09V17h2V9L12 3zm6.82 6L12 12.72 5.18 9 12 5.28 18.82 9zM17 15.99l-5 2.73-5-2.73v-3.72L12 15l5-2.73v3.72z"/>
              </svg>
            </div>
            <span className="text-xl font-normal text-gray-700">Nerdos Room</span>
          </div>
          
                      <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600"></span>
              <button
                className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              >
                Ir al Panel
              </button>
            </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center py-20 sm:py-32">
          <h1 className="text-5xl sm:text-7xl font-medium text-gray-900 mb-8 leading-tight">
            Donde se unen la enseñanza<br />y el aprendizaje
          </h1>
          
          <p className="text-xl text-gray-600 max-w-4xl mx-auto mb-12 leading-relaxed px-4">
            Mi Aula ayuda a los educadores a crear experiencias de aprendizaje interesantes que pueden personalizar,
            administrar y medir. Como parte de nuestro espacio de trabajo educativo, permite que los educadores mejoren su impacto y
            preparen a los estudiantes para el futuro.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              className="px-8 py-4 bg-red-600 text-white rounded-full font-medium hover:bg-red-600 transition-colors shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
            >
              Accede a Nerdos Room
            </button>
          </div>
        </div>

        {/* Features Section */}
        <div className="py-20 border-t border-gray-200">
          <div className="grid md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Personaliza el aprendizaje</h3>
              <p className="text-gray-600">Crea experiencias únicas para cada estudiante</p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Simplifica tareas cotidianas</h3>
              <p className="text-gray-600">Ahorra tiempo con herramientas fáciles de usar</p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Obtén estadísticas y visibilidad</h3>
              <p className="text-gray-600">Monitorea el progreso de tus estudiantes</p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-600 text-sm">
            <p>© 2026 Mi Aula. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}