let onUnauthorized = () => {};

export const setUnauthorizedHandler = (fn) => {
  onUnauthorized = fn;
};

const token = () => sessionStorage.getItem("ellp-token");

const request = async (path, { method = "GET", body, form } = {}) => {
  const headers = {};
  if (token()) headers.authorization = `Bearer ${token()}`;
  let payload;
  if (form) {
    payload = form;
  } else if (body !== undefined) {
    headers["content-type"] = "application/json";
    payload = JSON.stringify(body);
  }
  const response = await fetch("/api" + path, { method, headers, body: payload });
  if (response.status === 401) onUnauthorized();
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || "Falha na operação");
  return data;
};

export const api = {
  get: (path) => request(path),
  post: (path, body) => request(path, { method: "POST", body }),
  patch: (path, body) => request(path, { method: "PATCH", body }),
  del: (path) => request(path, { method: "DELETE" }),
  upload: (path, form) => request(path, { method: "POST", form }),
};

// Baixa um recurso protegido enviando o token e salvando o blob recebido.
export const download = async (path, filename) => {
  const headers = {};
  if (token()) headers.authorization = `Bearer ${token()}`;
  const response = await fetch("/api" + path, { headers });
  if (!response.ok) {
    if (response.status === 401) onUnauthorized();
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error || "Não foi possível baixar o arquivo");
  }
  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename || "";
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};
