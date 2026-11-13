# Última — la última y a casa

App web (PWA) para salir con cabeza: fijas una **hora tope** y un **límite de copas** antes de salir, apuntas lo que bebes con un toque y, si te pasas, **la alarma suena cada X minutos hasta que el móvil detecta que estás cerca de casa**.

Sin cuentas ni servidores: todo se guarda en el dispositivo. HTML, CSS y JavaScript sin dependencias.

## Probarla

```bash
cd ultima
python3 -m http.server 8080   # o cualquier servidor estático
```

Abre `http://localhost:8080`. En el móvil necesita HTTPS (por ejemplo GitHub Pages) para ubicación, notificaciones e instalación en la pantalla de inicio.

## Qué hace

- **Pacto de la noche**: hora tope + límite de copas, sellado manteniendo pulsado. Durante la noche solo se puede endurecer (irte antes, beber menos).
- **Registro en un toque**: caña, tercio, pinta, vino, vermut, cubata, cóctel, chupito, agua y sin alcohol. El vaso se llena según te acercas al límite.
- **Recordatorio de reporte**: si llevas 30/45/60 min sin apuntar nada, te pregunta cuántas llevas.
- **Avisos previos**: última ronda a 30 min, a 15 y a 5, y "sal ya" calculado con la distancia andando a casa.
- **Alarma con geovalla**: al pasar el tope o rebasar el límite suena (sirena, pitidos o campana) y vibra cada 1–10 min. Solo se apaga al llegar al radio de casa (150–600 m, ubicación aproximada redondeada a ~100 m). Se puede callar una ronda o minimizar, pero vuelve.
- **Salidas de emergencia**: si no hay GPS, confirmación manual manteniendo 5 s (queda como "sin verificar"); rendirse manteniendo 10 s rompe la racha.
- **Estimaciones**: alcohol en sangre (Widmark), hora aproximada a cero, vasos de agua, gasto de la noche.
- **Vuelta a casa**: ruta en mapas y mensaje a un contacto de confianza ("voy para casa" / "ya he llegado").
- **Historial**: racha, porcentaje de noches cumplidas, insignias y detalle de cada noche. Exportar o borrar datos.

## Límites conocidos

Es una app web: con la pantalla apagada o la app en segundo plano, el navegador puede pausar temporizadores, sonido y ubicación, así que la alarma solo es fiable con la app abierta (mantiene la pantalla encendida mientras suena). Para publicarla en una tienda con alarma y geovalla en segundo plano hay que empaquetarla (p. ej. Capacitor) y usar notificaciones locales y geofencing nativos.

Las cifras de alcohol son orientativas y nunca indican si se puede conducir.

## Estructura

| Archivo | Contenido |
| --- | --- |
| `index.html` | Estructura base |
| `styles.css` | Diseño, transiciones y animaciones |
| `app.js` | Estado, lógica de la noche, alarma, ubicación, vistas |
| `sw.js` | Service worker: funciona sin conexión |
| `manifest.webmanifest`, `icons/` | Instalación como app y logotipo |
