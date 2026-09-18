import React from "react";
import { AlertCircle, RefreshCw, Home } from "lucide-react";

/**
 * ErrorBoundary corporativo para Tu Turno Barber.
 * Captura errores de renderizado en cualquier módulo o layout evitando que la pantalla quede en blanco.
 */
export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary ha interceptado un error de renderizado:", error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[50vh] flex items-center justify-center p-6">
          <div className="max-w-lg w-full p-8 rounded-3xl bg-card border border-destructive/30 shadow-2xl text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-destructive/15 text-destructive mx-auto flex items-center justify-center">
              <AlertCircle className="w-7 h-7" />
            </div>

            <div className="space-y-1">
              <h2 className="text-xl font-black text-foreground tracking-tight">
                Se detectó una inconsistencia en la vista
              </h2>
              <p className="text-xs text-muted-foreground">
                Hemos prevenido que la pantalla quede en blanco debido a datos incompletos o en transición.
              </p>
            </div>

            {this.state.error?.message && (
              <div className="p-3 rounded-xl bg-destructive/5 border border-destructive/20 text-left">
                <p className="text-[11px] font-mono text-destructive break-all">
                  {this.state.error.message}
                </p>
              </div>
            )}

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                type="button"
                onClick={this.handleReset}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-accent hover:bg-accent/80 text-foreground font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Recargar Módulo</span>
              </button>
              <a
                href="/barbero"
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#E8C466] to-[#DDAE41] text-black font-extrabold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-[#DDAE41]/25 transition-all"
              >
                <Home className="w-3.5 h-3.5" />
                <span>Ir al Inicio del Barbero</span>
              </a>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
