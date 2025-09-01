

export const CoffeeLoader = () => (
    <div className="flex flex-col items-center justify-center h-full">
      <div className="relative">
        {/* Xícara de café animada */}
        <div className="w-16 h-16 bg-gradient-to-br from-amber-600 to-amber-800 rounded-full relative overflow-hidden animate-pulse">
          <div className="absolute inset-2 bg-gradient-to-br from-amber-900 to-amber-950 rounded-full">
            <div className="absolute inset-1 bg-gradient-to-br from-amber-700 to-amber-900 rounded-full">
              {/* Vapor animado */}
              <div className="absolute -top-1 left-1/2 transform -translate-x-1/2">
                <div className="w-0.5 h-4 bg-white/30 rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
              </div>
              <div className="absolute -top-1 left-1/3 transform -translate-x-1/2">
                <div className="w-0.5 h-3 bg-white/20 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
              </div>
              <div className="absolute -top-1 right-1/3 transform translate-x-1/2">
                <div className="w-0.5 h-3 bg-white/20 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
              </div>
            </div>
          </div>
          {/* Alça da xícara */}
          <div className="absolute right-0 top-1/2 transform translate-x-1 -translate-y-1/2 w-3 h-4 border-2 border-amber-600 rounded-full border-l-transparent" />
        </div>
        
        {/* Grãos de café orbitando */}
        <div className="absolute inset-0 animate-spin" style={{ animationDuration: '3s' }}>
          <div className="absolute top-0 left-1/2 w-2 h-2 bg-amber-800 rounded-full transform -translate-x-1/2 -translate-y-2" />
          <div className="absolute bottom-0 left-1/2 w-1.5 h-1.5 bg-amber-700 rounded-full transform -translate-x-1/2 translate-y-2" />
          <div className="absolute left-0 top-1/2 w-1.5 h-1.5 bg-amber-900 rounded-full transform -translate-x-2 -translate-y-1/2" />
        </div>
      </div>
      
      <div className="mt-6 text-center">
        <h3 className="text-lg font-semibold text-amber-800 dark:text-amber-400 mb-2">
          Preparando seu café...
        </h3>
        <p className="text-sm text-amber-600 dark:text-amber-500 animate-pulse">
          Carregando imagens deliciosas
        </p>
      </div>
      
      {/* Barra de progresso animada */}
      <div className="mt-4 w-48 h-2 bg-amber-200 dark:bg-amber-900/50 rounded-full overflow-hidden">
        <div className="h-full bg-gradient-to-r from-amber-500 to-amber-600 rounded-full animate-pulse" 
             style={{
               animation: 'progressLoad 2s ease-in-out infinite',
             }} />
      </div>
      
      <style jsx>{`
        @keyframes progressLoad {
          0% { width: 20%; }
          50% { width: 80%; }
          100% { width: 20%; }
        }
      `}</style>
    </div>
  );
  
  interface LoadingStateProps {
    width: string;
    height: string;
    className?: string;
  }
  
  export const LoadingState = ({ width, height, className = "" }: LoadingStateProps) => (
    <div className={`relative ${width} ${height} bg-gradient-to-br from-amber-50/80 to-amber-100/80 dark:from-amber-950/40 dark:to-amber-900/40 rounded-2xl overflow-hidden backdrop-blur-sm border border-amber-200/50 dark:border-amber-800/50 shadow-lg ${className}`}>
      <CoffeeLoader />
      {/* Partículas de fundo */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-10 left-10 w-2 h-2 bg-amber-400/20 rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
        <div className="absolute top-20 right-16 w-1.5 h-1.5 bg-amber-500/20 rounded-full animate-bounce" style={{ animationDelay: '0.5s' }} />
        <div className="absolute bottom-16 left-20 w-1 h-1 bg-amber-600/20 rounded-full animate-bounce" style={{ animationDelay: '1s' }} />
        <div className="absolute bottom-10 right-10 w-2 h-2 bg-amber-300/20 rounded-full animate-bounce" style={{ animationDelay: '1.5s' }} />
      </div>
    </div>
  );