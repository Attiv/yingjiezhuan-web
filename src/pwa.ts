if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  const register = () => {
    void navigator.serviceWorker.register('/sw.js', { scope: '/' }).catch((error: unknown) => {
      console.warn('离线支持未启用：', error);
    });
  };
  if (document.readyState === 'complete') register();
  else window.addEventListener('load', register, { once: true });
}
