export const getRolFromToken = (): string | null => {
  const token = localStorage.getItem('token');
  if (!token) return null;

  try {
    const payloadBase64 = token.split('.')[1];
    const decodedJson = atob(payloadBase64);
    const decoded = JSON.parse(decodedJson);

    return (
      decoded.rol ||
      decoded.role ||
      decoded.authorities?.[0]?.authority?.replace('ROLE_', '') ||
      'USER'
    );
  } catch (error) {
    console.error(error);
    return null;
  }
};

interface DecodedToken {
  sub: string;
  rol: string;
  id: string;
  fotoUrl?: string;
  requiereCambioPassword?: boolean;
}

export const getUsuarioFromToken = (): DecodedToken | null => {
  const token = localStorage.getItem('token');
  if (!token) return null;

  try {
    const payload = token.split('.')[1];
    const decodedPayload = JSON.parse(atob(payload));
    return decodedPayload as DecodedToken;
  } catch (error) {
    console.error(error);
    return null;
  }
};
