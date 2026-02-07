import { Plugin } from 'vite';

export default function wailsPlugin(): Plugin {
  return {
    name: 'wails',
    transformIndexHtml(html) {
      // В продакшене Wails вставит свои скрипты через {{.WailsJS}},
      // но в dev режиме мы должны вручную вставить скрипт для подключения к Wails
      if (process.env.NODE_ENV === 'development') {
        const wailsScript = `
          <script>
            // В dev режиме подключаемся к Wails серверу
            const script = document.createElement('script');
            script.src = 'http://localhost:34115/wails/runtime/runtime.js';
            document.head.appendChild(script);

            // Добавляем логирование для отладки
            script.onload = function() {
              console.log('Wails runtime script loaded successfully from plugin');
            };
            script.onerror = function() {
              console.error('Failed to load Wails runtime script from plugin');
            };
          </script>
        `;
        return html.replace('</body>', `${wailsScript}\n  </body>`);
      }
      return html;
    }
  };
}