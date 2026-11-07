# 🚀 Simulación y Modelado con EDO: Difusión de Software Abierto Comunitario (OpenCommunity Hub)

Este proyecto responde al **Desafío Individual de Métodos Numéricos: Modelar un problema real con ecuaciones diferenciales ordinarias (EDO)**.

---

## 📌 1. Problema y Contexto

- **Nombre del desafío:** *Modelado y predicción del despliegue y adopción comunitaria de una plataforma de software de código abierto para comedores populares y bancos de alimentos ("ComunidadConectada OSS").*
- **Ámbito:** **Desarrollo de Software** orientado al **Bienestar Comunitario / Social**.
- **Población beneficiaria:** Red de 2,500 organizaciones comunitarias, comedores barriales y centros de acopio alimentario vulnerables que requieren coordinar excedentes de víveres en tiempo real.
- **Problema específico:** Al liberar una solución de software social de código abierto, la tasa de adopción no es instantánea ni lineal. La adopción depende de la red social de contactos y de la satisfacción comunitaria. Si el equipo de ingenieros de software subestima la velocidad de adopción, los servidores y el soporte colapsan; si la sobrestiman, se desperdician recursos cloud escasos.
- **Pregunta concreta del desafío:**
  > *¿En cuántas semanas la plataforma de software comunitario alcanzará el 90% de saturación en las 2,500 entidades objetivo bajo una tasa de difusión $r = 0.25\text{ sem}^{-1}$, y qué nivel de error de truncamiento cometen los métodos de Heun y Runge-Kutta 4 al proyectar esta demanda de infraestructura tecnológica con pasos $h=0.5$ y $h=0.1$?*
- **Meta cuantificable:**
  - Determinar con exactitud analítica y numérica el momento en que se alcanza $y(t) \ge 2,250$ entidades (90% del límite de capacidad $K = 2,500$).
  - Evaluar la discrepancia entre Heun ($O(h^2)$) y RK4 ($O(h^4)$) para garantizar que la toma de decisiones sobre provisión de servidores tenga un margen de error menor al $0.1\%$.

---

## 📐 2. Modelo Matemático

### 2.1 Definición de Variables y Parámetros
- **Variable independiente ($t$):** Tiempo transcurrido desde el despliegue del software en producción ($[t] = \text{semanas}$).
- **Variable dependiente ($y$ o $P$):** Número de organizaciones comunitarias activas en la plataforma ($[y] = \text{organizaciones/nodos activos}$).
- **Parámetros del modelo:**
  - $K$: Capacidad de carga o mercado comunitario potencial total. En el escenario base: $K = 2,500\text{ entidades}$.
  - $r$: Tasa intrínseca de adopción tecnológica comunitaria (difusión por recomendaciones, capacitaciones y red colaborativa). En el escenario base: $r = 0.25\text{ semanas}^{-1}$.
  - $y_0$: Condición inicial (adoptantes tempranos / beta testers del software piloto). En el escenario base: $y(0) = y_0 = 50\text{ entidades}$.

### 2.2 Formulación de la EDO (Modelo Logístico de Verhulst)
$$\frac{dy}{dt} = r \cdot y \left(1 - \frac{y}{K}\right), \quad y(0) = y_0$$

### 2.3 Justificación y Supuestos del Modelo
1. **Efecto de red y recomendación:** La velocidad con que nuevas organizaciones adoptan el software es proporcional a los usuarios actuales ($y$) que recomiendan la herramienta.
2. **Saturación comunitaria:** La velocidad disminuye a medida que quedan menos organizaciones sin adoptar la plataforma ($1 - y/K$).
3. **Población cerrada:** En el intervalo de simulación analizado ($t \in [0, 40]\text{ semanas}$), el número máximo de organizaciones objetivo en el municipio o región permanece constante en $K$.

---

## 🔬 3. Solución Analítica Exacta y Comprobación

### 3.1 Deducción por Separación de Variables
Separando variables en $\frac{dy}{dt} = r y \left(1 - \frac{y}{K}\right) = \frac{r}{K} y(K - y)$:

$$\frac{dy}{y(K - y)} = \frac{r}{K} dt$$

Aplicando descomposición en fracciones simples:
$$\frac{1}{y(K - y)} = \frac{1}{K}\left(\frac{1}{y} + \frac{1}{K - y}\right)$$

Sustituyendo:
$$\frac{1}{K}\left(\frac{1}{y} + \frac{1}{K - y}\right) dy = \frac{r}{K} dt$$
$$\left(\frac{1}{y} + \frac{1}{K - y}\right) dy = r dt$$

Integrando ambos miembros:
$$\ln|y| - \ln|K - y| = r t + C$$
$$\ln\left|\frac{y}{K - y}\right| = r t + C$$
$$\frac{y}{K - y} = A e^{rt}, \quad \text{donde } A = \pm e^C$$

Aplicando la condición inicial $y(0) = y_0$:
$$A = \frac{y_0}{K - y_0}$$

Despejando $y(t)$:
$$y(t) = \frac{K \cdot A e^{rt}}{1 + A e^{rt}} = \frac{K}{1 + A^{-1} e^{-rt}} = \frac{K}{1 + \left(\frac{K - y_0}{y_0}\right) e^{-rt}}$$

### 3.2 Comprobación Formal por Sustitución
Sea $y(t) = K [1 + C_0 e^{-rt}]^{-1}$, con $C_0 = \frac{K - y_0}{y_0}$.

1. **Condición inicial en $t=0$:**
   $$y(0) = \frac{K}{1 + C_0 \cdot 1} = \frac{K}{1 + \frac{K - y_0}{y_0}} = \frac{K}{\frac{y_0 + K - y_0}{y_0}} = \frac{K \cdot y_0}{K} = y_0 \quad \checkmark$$

2. **Derivada $\frac{dy}{dt}$:**
   $$\frac{dy}{dt} = -K [1 + C_0 e^{-rt}]^{-2} \cdot (-r C_0 e^{-rt}) = r \cdot \frac{K}{1 + C_0 e^{-rt}} \cdot \frac{C_0 e^{-rt}}{1 + C_0 e^{-rt}}$$
   Notemos que $\frac{y}{K} = \frac{1}{1 + C_0 e^{-rt}}$, por lo que:
   $$1 - \frac{y}{K} = 1 - \frac{1}{1 + C_0 e^{-rt}} = \frac{C_0 e^{-rt}}{1 + C_0 e^{-rt}}$$
   Por lo tanto:
   $$\frac{dy}{dt} = r \cdot y(t) \cdot \left(1 - \frac{y(t)}{K}\right) \quad \checkmark$$
   *Queda estrictamente comprobada la solución analítica.*

---

## 💻 4. Algoritmos Numéricos Implementados

Dada la función $f(t, y) = r y \left(1 - \frac{y}{K}\right)$:

### 4.1 Método de Heun (Runge-Kutta de Orden 2)
- Predictor (Euler hacia adelante):
  $$y'_{i+1} = y_i + h \cdot f(t_i, y_i)$$
- Corrector (Regla del trapecio):
  $$y_{i+1} = y_i + \frac{h}{2} \left[ f(t_i, y_i) + f(t_{i+1}, y'_{i+1}) \right]$$
- Error de truncamiento local: $O(h^3)$, global: $O(h^2)$.

### 4.2 Método Clásico de Runge-Kutta de Orden 4 (RK4)
- Pendientes intermedias:
  $$k_1 = f(t_i, y_i)$$
  $$k_2 = f\left(t_i + \frac{h}{2}, \, y_i + \frac{h}{2} k_1\right)$$
  $$k_3 = f\left(t_i + \frac{h}{2}, \, y_i + \frac{h}{2} k_2\right)$$
  $$k_4 = f(t_i + h, \, y_i + h k_3)$$
- Actualización ponderada:
  $$y_{i+1} = y_i + \frac{h}{6} (k_1 + 2k_2 + 2k_3 + k_4)$$
- Error de truncamiento local: $O(h^5)$, global: $O(h^4)$.

---

## 📊 5. Estructura de la Aplicación Web

La aplicación web ha sido construida como una SPA (*Single Page Application*) moderna con **flujo vertical secuencial y un índice lateral fijo (Sticky Index)**:
- **Índice Sticky Lateral (Izquierda):** Navegación persistente en 8 secciones numeradas con detector de posición de lectura (*ScrollSpy* automático), acceso directo instantáneo y métricas rápidas.
- **Flujo Vertical de Secciones (Derecha):** Presentación continua, clara y estructurada de los incisos requeridos por la cátedra (a, b, c, d, e, f), facilitando la lectura secuencial de los evaluadores:
  1. *Introducción & Resumen Ejecutivo*
  2. *Problema, Contexto y Relevancia Social (Inciso a)*
  3. *Modelo Matemático y Supuestos (Inciso b)*
  4. *Solución Analítica Exacta y Comprobación Formal (Inciso c)*
  5. *Implementación de Métodos Numéricos Heun y RK4 (Inciso d)*
  6. *Simulador Interactivo con Controles y Gráficos en Tiempo Real*
  7. *Tabla Comparativa de Iteraciones y Análisis de Errores (Inciso e)*
  8. *Interpretación Comunitaria, Decisiones de Software, Conclusiones y Guion de 60 Segundos (Inciso f)*
- **Herramientas visuales y cómputo:** Integración con **MathJax** para fórmulas LaTeX, **Chart.js** para gráficos dinámicos, exportador a **CSV** y teleprompter/cronómetro de ensayo para el video explicativo.

---

## 🌐 6. Instrucciones de Ejecución y Publicación

### Ejecución Local:
1. Clonar este repositorio o descargar la carpeta:
   ```bash
   git clone https://github.com/tu-usuario/simulacion-edo-software-comunitario.git
   ```
2. Abrir directamente el archivo `index.html` en cualquier navegador web moderno (Chrome, Firefox, Edge, Safari). No requiere instalar Node.js ni servidores web adicionales.

### Despliegue en GitHub Pages (Gratuito en 1 minuto):
1. Subir los archivos a tu repositorio de GitHub.
2. Ir a **Settings > Pages**.
3. En **Source**, seleccionar la rama `main` y la carpeta `/ (root)`.
4. Hacer clic en **Save**. En un minuto obtendrás la URL pública: `https://tu-usuario.github.io/simulacion-edo-software-comunitario/`.

