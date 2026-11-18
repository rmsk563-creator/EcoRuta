import { ExternalLink, HeartHandshake, Leaf, MapPinned, ShieldCheck } from 'lucide-react';
import { SiFacebook, SiTiktok, SiYoutube } from 'react-icons/si';
import { ExternalLinkAnchor } from '../components/ExternalLinkAnchor';

const socialLinks = [
  {
    name: 'Facebook',
    handle: 'EcoRuta',
    href: 'https://www.facebook.com/profile.php?id=61596786530370&locale=es_LA',
    icon: SiFacebook,
    className: 'facebook',
  },
  {
    name: 'TikTok',
    handle: '@ecorutaservice',
    href: 'https://www.tiktok.com/@ecorutaservice',
    icon: SiTiktok,
    className: 'tiktok',
  },
  {
    name: 'YouTube',
    handle: '@ECORUTA-i6k',
    href: 'https://www.youtube.com/@ECORUTA-i6k',
    icon: SiYoutube,
    className: 'youtube',
  },
];

export function AboutPage() {
  return (
    <div className="page about-page">
      <header className="page-header">
        <p className="eyebrow"><Leaf aria-hidden="true" /> Acerca de EcoRuta</p>
        <h1>Movilidad sostenible, explicada con honestidad.</h1>
        <p>EcoRuta nace en Lima para hacer más visibles las alternativas activas y el impacto de cada decisión cotidiana.</p>
      </header>

      <section className="mission-panel" aria-labelledby="mission-title">
        <div className="mission-panel__mark"><MapPinned aria-hidden="true" /></div>
        <div>
          <p className="kicker">Propósito</p>
          <h2 id="mission-title">Ayudar a elegir sin esconder los límites de los datos.</h2>
          <p>
            El producto prioriza rutas verificables, estimaciones documentadas y control local de la información. Si una modalidad no cuenta con datos fiables para Lima, no se presenta como disponible.
          </p>
        </div>
      </section>

      <section className="values-grid" aria-label="Valores de EcoRuta">
        <article>
          <ShieldCheck aria-hidden="true" />
          <h2>Privacidad por diseño</h2>
          <p>EcoRuta guarda el tema, el color, el movimiento y las modalidades preferidas en este dispositivo.</p>
        </article>
        <article>
          <HeartHandshake aria-hidden="true" />
          <h2>Tecnología responsable</h2>
          <p>Los servicios externos se integran con atribución visible, límites controlados y manejo de errores.</p>
        </article>
      </section>

      <section className="section-block" aria-labelledby="social-title">
        <div className="section-heading">
          <div>
            <p className="kicker">Canales oficiales</p>
            <h2 id="social-title">Sigue el proyecto</h2>
          </div>
        </div>
        <div className="social-grid">
          {socialLinks.map(({ name, handle, href, icon: Icon, className }) => (
            <ExternalLinkAnchor className={`social-card social-card--${className}`} href={href} key={name}>
              <span className="social-card__icon"><Icon aria-hidden="true" /></span>
              <span>
                <strong>{name}</strong>
                <small>{handle}</small>
              </span>
              <ExternalLink aria-hidden="true" />
            </ExternalLinkAnchor>
          ))}
        </div>
      </section>
    </div>
  );
}
