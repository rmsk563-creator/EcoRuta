import logoUrl from '../../assets/logo-ecoruta.png';

interface BrandProps {
  compact?: boolean;
}

export function Brand({ compact = false }: BrandProps) {
  return (
    <span className="brand" aria-label="EcoRuta">
      <span className="brand__mark" aria-hidden="true">
        <img src={logoUrl} alt="" />
      </span>
      {!compact && <span className="brand__name">EcoRuta</span>}
    </span>
  );
}

