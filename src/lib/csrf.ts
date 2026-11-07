// The `csrf` cookie is deliberately not HttpOnly so this module can echo it into a header:
// reading it proves the request came from a page on this origin. The credential is `sid`,
// which stays HttpOnly.
export const CSRF_HEADER = 'X-CSRF-Token';

// Production adds the __Host- prefix, so try both — prefixed first, so a plain-name match
// cannot shadow it.
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

// The backend's safeMethod() lets these through untokened, which is why the Google login
// GETs need no exemption list.
const SAFE_METHODS = ['get', 'head', 'options', 'trace'];

export function needsCSRFToken(method: string | undefined): boolean {
  return !SAFE_METHODS.includes((method ?? 'get').toLowerCase());
}
