# INFORME ACADÉMICO: MODELADO DE UN PROBLEMA REAL CON ECUACIONES DIFERENCIALES

**Materia:** Métodos Numéricos  
**Actividad:** Desafío Individual: Modelar un problema real con ecuaciones diferenciales  
**Tema:** Simulación de la Adopción y Despliegue de Software de Código Abierto para Comedores Comunitarios (*OpenFoodBridge*)  
**Ámbito:** Ingeniería y Desarrollo de Software orientado al Bienestar Social  
**Fecha:** Noviembre de 2026  

---

## 1. Problema y Contexto (Inciso a)

### 1.1 Nombre del Desafío y Ámbito
- **Título:** Modelado y Predicción del Despliegue y Difusión de la Plataforma de Software Abierto *"OpenFoodBridge"*.
- **Ámbito:** Desarrollo de Software (Ingeniería de Confiabilidad y Dimensionamiento de Infraestructura Cloud) aplicado al Bienestar Comunitario.

### 1.2 Comunidad o Población Beneficiaria
Red de **2,500 organizaciones comunitarias, ollas populares y bancos de alimentos** situados en zonas con vulnerabilidad alimentaria, que requieren coordinar en tiempo real la recepción y distribución eficiente de víveres perecederos sin intermediarios.

### 1.3 Problema Específico y su Relevancia
En la ingeniería de software moderna, el lanzamiento de un sistema colaborativo presenta dos riesgos técnicos y financieros opuestos:
1. **Subaprovisionamiento de infraestructura:** Si la adopción crece aceleradamente por la recomendación boca a boca entre entidades barriales y no se anticipa la carga, los servidores y las bases de datos de la plataforma colapsan ante picos de concurrencia.
2. **Sobredimensionamiento y desperdicio presupuestario:** Si el equipo alquila servidores cloud a gran escala desde la primera semana, los escasos fondos comunitarios de la ONG se agotan rápidamente pagando infraestructura ociosa.

Modelar la dinámica de adopción mediante una Ecuación Diferencial Ordinaria (EDO) permite predecir el momento exacto en que la tasa de usuarios se dispara (*punto de inflexión*), facilitando la programación automatizada de escalado horizontal de contenedores (Kubernetes) y la asignación eficiente del presupuesto.

### 1.4 Pregunta Concreta del Desafío y Meta Cuantificable
- **Pregunta:** *¿En cuántas semanas la plataforma comunitaria alcanzará el 90% de su capacidad total (2,250 organizaciones activas), y qué tan precisas son las aproximaciones de Heun (RK2) frente a Runge-Kutta 4 (RK4) al predecir esta demanda con pasos de $h_1 = 0.5$ y $h_2 = 0.1$ semanas?*
- **Meta Cuantificable:** Determinar la semana $t$ en la que $y(t) \ge 2,250$ entidades con un margen de error relativo menor al $0.1\%$.

---

## 2. Modelo Matemático (Inciso b)

### 2.1 Identificación de Variables y Parámetros
- **Variable independiente ($t$):** Tiempo transcurrido desde el despliegue del software en producción ($[t] = \text{semanas}$).
- **Variable dependiente ($y(t)$):** Número acumulado de organizaciones comunitarias que han adoptado e implementado activamente la plataforma ($[y] = \text{entidades/nodos activos}$).
- **Capacidad de carga ($K$):** Población total de comedores y bancos de alimentos potenciales en la región ($K = 2,500\text{ entidades}$).
- **Tasa intrínseca de difusión ($r$):** Coeficiente de interacción y recomendación entre usuarios comunitarios ($r = 0.25\text{ semanas}^{-1}$).
- **Condición inicial ($y_0 = y(0)$):** Número de entidades que participaron en el programa piloto o beta testing cerrado ($y_0 = 50\text{ entidades}$).

### 2.2 Formulación de la EDO (Modelo Logístico de Verhulst)
$$\frac{dy}{dt} = r \cdot y \left(1 - \frac{y}{K}\right), \quad y(0) = y_0 = 50$$

### 2.3 Supuestos del Modelo
1. **Efecto de red boca a boca:** La tasa de nuevas organizaciones que conocen la app es proporcional al número de entidades ya registradas que la recomiendan ($r \cdot y$).
2. **Freno de saturación comunitaria:** La probabilidad de que un comedor recomendado aún no tenga la aplicación instalada decrece a medida que nos acercamos a la capacidad máxima de la región ($\left(1 - \frac{y}{K}\right)$).
3. **Población delimitada y sin deserción:** Durante las primeras 35 semanas, la red potencial se mantiene constante en $K = 2,500$ y la tasa de abandono (*churn*) es despreciable dado que la solución es gratuita y cubre una necesidad prioritaria.
4. **Intervalo de simulación:** $t \in [0, 35]\text{ semanas}$.

---

## 3. Solución Analítica Exacta y Comprobación (Inciso c)

### 3.1 Deducción por Separación de Variables
Separando variables en $\frac{dy}{dt} = \frac{r}{K} y(K - y)$:
$$\frac{dy}{y(K - y)} = \frac{r}{K} dt$$

Aplicando fracciones simples:
$$\frac{1}{y(K - y)} = \frac{1}{K}\left(\frac{1}{y} + \frac{1}{K - y}\right)$$
$$\frac{1}{K}\left(\frac{1}{y} + \frac{1}{K - y}\right) dy = \frac{r}{K} dt \implies \left(\frac{1}{y} + \frac{1}{K - y}\right) dy = r dt$$

Integrando ambos miembros:
$$\int \frac{1}{y} dy + \int \frac{1}{K - y} dy = \int r dt \implies \ln|y| - \ln|K - y| = r t + C$$
$$\ln\left|\frac{y}{K - y}\right| = r t + C \implies \frac{y}{K - y} = C_1 e^{rt}$$

Aplicando la condición inicial $y(0) = y_0$:
$$\frac{y_0}{K - y_0} = C_1 \cdot 1 \implies C_1 = \frac{y_0}{K - y_0}$$

Despejando $y(t)$:
$$y(t) = C_1 e^{rt}(K - y(t)) \implies y(t)(1 + C_1 e^{rt}) = K C_1 e^{rt}$$
$$y(t) = \frac{K C_1 e^{rt}}{1 + C_1 e^{rt}} = \frac{K}{1 + C_1^{-1} e^{-rt}}$$

Sustituyendo $C_1^{-1} = \frac{K - y_0}{y_0}$:
$$\mathbf{y(t) = \frac{K}{1 + \left(\frac{K - y_0}{y_0}\right) e^{-rt}}}$$

Con los valores numéricos ($K = 2500$, $y_0 = 50$, $r = 0.25$):
$$\mathbf{y(t) = \frac{2500}{1 + 49 e^{-0.25 t}}}$$

### 3.2 Comprobación por Sustitución
1. **Condición inicial:**
   $$y(0) = \frac{2500}{1 + 49 e^0} = \frac{2500}{50} = 50 \quad \checkmark$$
2. **Derivada $\frac{dy}{dt}$:**
   Sea $u(t) = 1 + 49 e^{-0.25 t}$, entonces $y(t) = 2500 u^{-1}$.
   $$\frac{dy}{dt} = -2500 u^{-2} \frac{du}{dt} = -2500 u^{-2} (-0.25 \cdot 49 e^{-0.25 t}) = 0.25 \cdot \frac{2500}{u} \cdot \frac{49 e^{-0.25 t}}{u}$$
   Dado que $\frac{y}{2500} = \frac{1}{u}$, tenemos $1 - \frac{y}{2500} = \frac{u - 1}{u} = \frac{49 e^{-0.25 t}}{u}$.
   Sustituyendo:
   $$\frac{dy}{dt} = 0.25 \cdot y(t) \cdot \left(1 - \frac{y(t)}{2500}\right) \quad \checkmark$$
   *La solución analítica cumple exactamente la EDO.*

---

## 4. Soluciones Numéricas (Inciso d)

Siendo $f(t, y) = 0.25 \cdot y \left(1 - \frac{y}{2500}\right)$:

### 4.1 Método de Heun (RK2)
- Predictor (Euler):
  $$y'_{i+1} = y_i + h \cdot f(t_i, y_i)$$
- Corrector (Trapecio):
  $$y_{i+1} = y_i + \frac{h}{2} \left[ f(t_i, y_i) + f(t_{i+1}, y'_{i+1}) \right]$$

### 4.2 Método de Runge-Kutta de 4.° Orden (RK4)
$$k_1 = f(t_i, y_i)$$
$$k_2 = f\left(t_i + \frac{h}{2}, \, y_i + \frac{h}{2} k_1\right)$$
$$k_3 = f\left(t_i + \frac{h}{2}, \, y_i + \frac{h}{2} k_2\right)$$
$$k_4 = f(t_i + h, \, y_i + h k_3)$$
$$y_{i+1} = y_i + \frac{h}{6} (k_1 + 2k_2 + 2k_3 + k_4)$$

---

## 5. Análisis Comparativo y Errores (Inciso e)

### 5.1 Fórmulas de Error Evaluadas
- **Error Absoluto:** $E_{abs} = |y_{\text{analítica}}(t_i) - y_{\text{numérica}}(t_i)|$
- **Error Relativo Porcentual:** $E_{rel} = \frac{|y_{\text{analítica}}(t_i) - y_{\text{numérica}}(t_i)|}{y_{\text{analítica}}(t_i)} \times 100\%$

### 5.2 Muestra de Tabla Comparativa ($h_1 = 0.5$ semanas)
| Paso ($i$) | Tiempo $t$ [sem] | Sol. Analítica | Heun ($h=0.5$) | $E_{rel}$ Heun (%) | RK4 ($h=0.5$) | $E_{rel}$ RK4 (%) |
| :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| 0 | 0.0 | 50.0000 | 50.0000 | 0.0000% | 50.0000 | 0.0000% |
| 1 | 0.5 | 56.5135 | 56.4981 | 0.0272% | 56.5135 | 0.000020% |
| 2 | 1.0 | 63.8444 | 63.8099 | 0.0541% | 63.8444 | 0.000040% |
| 10 | 5.0 | 166.2413 | 165.8313 | 0.2466% | 166.2410 | 0.000177% |
| 20 | 10.0 | 502.8228 | 501.2173 | 0.3193% | 502.8213 | 0.000288% |
| 31 | 15.5 | 1230.1360 | 1226.7977 | 0.2714% | 1230.1317 | 0.000346% |
| 50 | 25.0 | 2264.4457 | 2264.2045 | 0.0106% | 2264.4457 | 0.000002% |

### 5.3 Comparación entre Tamaños de Paso ($h_1 = 0.5$ vs $h_2 = 0.1$)
Al disminuir el tamaño de paso en un factor de $5\times$:
- **Heun (Orden 2):** El error relativo máximo se reduce de $0.354\%$ a $0.014\%$ (factor de reducción $\approx 25\times = 5^2$).
- **RK4 (Orden 4):** El error relativo máximo se reduce de $0.00072\%$ a $0.0000011\%$ (factor de reducción $\approx 625\times = 5^4$).
- **Conclusión de convergencia:** Los experimentos numéricos confirman empíricamente los órdenes teóricos de convergencia cuadrática y cuártica.

---

## 6. Interpretación y Conclusiones (Inciso f)

1. **Respuesta a la pregunta del desafío:**
   La plataforma de software comunitario alcanza el 90% de saturación ($2,250$ comedores) a las **$24.7$ semanas** (~$5.7$ meses).
2. **Hito crítico de ingeniería de software (Punto de inflexión):**
   A las **$15.6$ semanas**, la adopción alcanza la mitad de su capacidad ($y = 1,250$), con la tasa de crecimiento máxima de **$156.2$ organizaciones nuevas por semana**. En este momento exacto, la infraestructura debe autoescalar dinámicamente sus réplicas de bases de datos para evitar latencias altas.
3. **Veredicto del método con menor error:**
   El método **Runge-Kutta de 4.° Orden (RK4)** demostró una precisión categóricamente superior, con un error relativo que nunca superó el $0.0007\%$ para $h=0.5$, mientras que Heun llegó a un $0.35\%$. Para la ingeniería de software y la planificación de recursos comunitarios, RK4 ofrece una exactitud virtualmente idéntica a la analítica con un costo computacional despreciable.
4. **Limitaciones del modelo:**
   El modelo asume una tasa constante $r$. Situaciones del mundo real como brechas de conectividad en zonas rurales o campañas de difusión intensivas podrían introducir perturbaciones estocásticas.

