// The `csrf` cookie is deliberately readable so it can be echoed into a header, proving the
// request came from this origin. The credential is `sid`, which stays HttpOnly.
export const CSRF_HEADER = 'X-CSRF-Token';

// Production adds the __Host- prefix. Prefixed first, so a plain name cannot shadow it.
const CSRF_COOKIE_NAMES = ['__Host-csrf', 'csrf'];

export function readCSRFToken(): string | null {
  const jar = document.cookie.split('; ');

  for (const name of CSRF_COOKIE_NAMES) {
    const hit = jar.find((entry) => {
      return entry.startsWith(`${name}=`);
    });

    if (hit !== undefined) {
      const value = hit.slice(name.length + 1);
      if (value !== '') {
        return decodeURIComponent(value);
      }
    }
  }

  return null;
}

// league-be's safeMethod() lets these through untokened, so login GETs need no exemption.
const SAFE_METHODS = ['get', 'head', 'options', 'trace'];

export function needsCSRFToken(method: string | undefined): boolean {
  return !SAFE_METHODS.includes((method ?? 'get').toLowerCase());
}
