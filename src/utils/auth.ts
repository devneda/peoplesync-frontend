export const getRolFromToken = (): string | null => {
  const token = localStorage.getItem('token');
  if (!token) return null;

  try {
    const payloadBase64 = token.split('.')[1];
    const decodedJson = atob(payloadBase64);
    const decoded = JSON.parse(decodedJson);

    console.log('Datos del Token:', decoded);

    return (
      decoded.rol ||
      decoded.role ||
      decoded.authorities?.[0]?.authority?.replace('ROLE_', '') ||
      'USER'
    );
  } catch (error) {
    console.error('Error al decodificar el token', error);
    return null;
  }
};

export const getUsuarioFromToken = () => {
  const token = localStorage.getItem('token');
  if (!token) return null;

  try {
    const payload = token.split('.')[1];

    const decodedPayload = JSON.parse(atob(payload));

    return decodedPayload;
  } catch (error) {
    console.error('Error al decodificar el token', error);
    return null;
  }
};
