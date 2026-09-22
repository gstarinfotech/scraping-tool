const API_BASE_URL = process.env.NEXT_PUBLIC_API || 'http://localhost:5000';

export const OM_API = `${API_BASE_URL.replace(/\/$/, '')}/om`;

const EMP_TOKEN_KEY = 'gstar_om_employee';
const ADMIN_TOKEN_KEY = 'gstar_admin';
const EMP_PROFILE_KEY = 'om_user';

export function getEmployeeToken() {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(EMP_TOKEN_KEY);
}

export function getAdminToken() {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(ADMIN_TOKEN_KEY);
}

export function setEmployeeSession(token, profile) {
    localStorage.setItem(EMP_TOKEN_KEY, token);

    if (profile) {
        localStorage.setItem(EMP_PROFILE_KEY, JSON.stringify(profile));
    }
}

export function setAdminSession(token) {
    localStorage.setItem(ADMIN_TOKEN_KEY, token);
}

export function logoutEmployee() {
    localStorage.removeItem(EMP_TOKEN_KEY);
    localStorage.removeItem(EMP_PROFILE_KEY);
}

export function logoutAdmin() {
    localStorage.removeItem(ADMIN_TOKEN_KEY);
}

export function getSavedEmployee() {
    if (typeof window === 'undefined') return null;

    try {
        const raw = localStorage.getItem(EMP_PROFILE_KEY);
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
}

export async function omFetch(path, options = {}) {
    const token = getEmployeeToken();
    const res = await fetch(`${OM_API}${path}`, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...(options.headers || {}),
        },
    });
    return res.json();
}