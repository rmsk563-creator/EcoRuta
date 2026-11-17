import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Component, Fragment, type ErrorInfo, type ReactNode } from 'react';

interface MapErrorBoundaryProps {
  children: ReactNode;
}

interface MapErrorBoundaryState {
  failed: boolean;
  retryKey: number;
}

export class MapErrorBoundary extends Component<MapErrorBoundaryProps, MapErrorBoundaryState> {
  state: MapErrorBoundaryState = { failed: false, retryKey: 0 };

  static getDerivedStateFromError(): Partial<MapErrorBoundaryState> {
    return { failed: true };
  }

  componentDidCatch(error: Error, details: ErrorInfo) {
    console.error('[EcoRuta] El mapa se recuperó de un error de renderizado.', error, details);
  }

  private retry = () => {
    this.setState(({ retryKey }) => ({ failed: false, retryKey: retryKey + 1 }));
  };

  render() {
    if (this.state.failed) {
      return (
        <div className="map-recovery" role="alert">
          <span className="map-recovery__icon"><AlertTriangle aria-hidden="true" /></span>
          <div>
            <h2>El mapa no pudo mostrarse.</h2>
            <p>Tus puntos y datos locales siguen disponibles. Puedes intentar cargar el mapa nuevamente.</p>
            <button type="button" className="button button--primary button--small" onClick={this.retry}>
              <RefreshCw aria-hidden="true" /> Reintentar mapa
            </button>
          </div>
        </div>
      );
    }

    return <Fragment key={this.state.retryKey}>{this.props.children}</Fragment>;
  }
}
