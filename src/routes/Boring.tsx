import { Link } from '../components/Link'
import { Img } from '../components/media/Img'
import { daniel } from '../content/daniel'
import { WEBRING } from '../lib/sitemap'

/** The hidden real layer: plain, unstyled, useful. No popups, no audio, no chat. */
export function Boring() {
  const { links } = daniel
  return (
    <div className="boring" data-testid="boring">
      <h1>{daniel.name}</h1>
      <Img slot="headshot" width={160} alt={daniel.name} />
      <p>{daniel.boringBio}</p>
      <h2>Contact</h2>
      <ul>
        {links.email && (
          <li>
            Email: <a href={`mailto:${links.email}`}>{links.email}</a>
          </li>
        )}
        {links.github && (
          <li>
            GitHub: <a href={links.github}>{links.github}</a>
          </li>
        )}
        {links.linkedin && (
          <li>
            LinkedIn: <a href={links.linkedin}>{links.linkedin}</a>
          </li>
        )}
        {links.resume && (
          <li>
            <a href={links.resume}>Résumé (PDF)</a>
          </li>
        )}
      </ul>
      <h2>Projects</h2>
      <ul>
        {daniel.coding.projects.map((p) => (
          <li key={p}>{p} (42)</li>
        ))}
        {daniel.games.map((g) => (
          <li key={g.name}>
            {g.name} — {g.pitch}
          </li>
        ))}
      </ul>
      <h2>Site map</h2>
      <ul>
        {WEBRING.map((r) => (
          <li key={r}>
            <Link to={r}>{r}</Link>
          </li>
        ))}
      </ul>
      <hr />
      <p>
        <small>
          This is the boring version. <Link to="/">Return to the fun version.</Link>
        </small>
      </p>
    </div>
  )
}
