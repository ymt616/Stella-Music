// Module-level token store — survives re-renders
let _token = null

export const tokenStore = {
  get: () => _token,
  set: (t) => { _token = t; window.__access_token = t },
  clear: () => { _token = null; window.__access_token = null },
}
