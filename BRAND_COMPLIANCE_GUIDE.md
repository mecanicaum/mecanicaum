# 🎨 Guía de Cumplimiento de Identidad Corporativa UMAYOR 2024
## SIG-Currículo (Sistema Integral de Gestión de Actas y Decisiones del Comité Curricular)

---

## 📋 ESTADO ACTUAL DEL PROYECTO

### ✅ ASPECTOS CORRECTOS

1. **Nombre Institucional (README.md)**
   - ✔ Usa "Institución Universitaria Mayor de Cartagena" o "UMAYOR" consistentemente
   - ✔ Subtítulo descriptivo coherente con la propuesta institucional

2. **Paleta de Colores Institucionales**
   - ✔ `#006A4E` (Verde institucional) usado en botones y acentos
   - ✔ `#C49E2D` (Amarillo mostaza) usado en elementos destacados
   - ✔ Gradiente verde oscuro en encabezados (`from-[#006A4E] via-[#005835] to-[#00382B]`)

3. **Tipografía**
   - ✔ Montserrat como tipografía principal (declarada en `font-sans`)
   - ✔ Uso de variantes Bold/ExtraBold para títulos

4. **Estructura Visual**
   - ✔ Encabezado con isologo y gradiente verde
   - ✔ Pie de página con información institucional
   - ✔ Área de protección respetada alrededor del isologo

---

## 🚨 PROBLEMAS IDENTIFICADOS Y CORRECCIONES REQUERIDAS

### 1. **README.md** - Nombre Inconsistente

**PROBLEMA:**
- Línea 1: "Sistema Integral de Gestión de Actas y Decisiones del Comité Curricular (SIG-Currículo)"
- Línea 9: Repite el nombre completo innecesariamente
- Uso de iniciales sin consistencia

**CORRECCIÓN:**
```markdown
# Sistema Integral de Gestión de Actas del Comité Curricular
> **SIG-Currículo: Plataforma institucional para convocatorias, minuta en vivo, votación nominal, trazabilidad de compromisos y acreditación CNA/ABET**

## Descripción General

SIG-Currículo es una solución web de grado de producción para la gobernanza académica...
```

**Aplicar en:** README.md (líneas 1-9)

---

### 2. **LoginView.tsx** - Textos Desalineados con Tono Institucional

**PROBLEMAS:**

#### a) Línea 166-167: Título poco formal
```typescript
// ACTUAL
<h1 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-bold...">Acreditación y Decisiones en Tiempo Real</h1>

// CORRECCIÓN
<h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold...">Gestión Integral de Actas y Decisiones Colegiadas</h1>
```
**Razón:** Debe ser más descriptivo del propósito institucional.

#### b) Línea 172-174: Lema sin fuente especificada
```typescript
// ACTUAL
<p className="lema-institucional text-xs pt-1">"Educación con Sentido Humano y Excelencia Académica"</p>

// CORRECCIÓN
<!-- Confirmar el lema oficial con Comunicaciones UMAYOR antes de usar -->
<!-- El manual menciona "La institución universitaria de los cartageneros" como ejemplo de eslogan -->
<p className="text-xs pt-1 italic text-slate-100 font-light">
  Institución Universitaria Mayor de Cartagena · Fundada en 1947
</p>
```

#### c) Línea 264: Placeholder de email no institucional
```typescript
// ACTUAL
placeholder="usuario@umayor.edu.co"

// CORRECCIÓN
placeholder="ejemplo@umayor.edu.co" // O usar ejemplo real de administración
```

#### d) Línea 277: Hardcoding de correo del Super Admin
```typescript
// PROBLEMA: El correo está hardcodeado
// CORRECCIÓN: Debería ser configurable o traído de variables de entorno
// Ver: .env.example
```

---

### 3. **App.tsx** - Falta de Isologo Oficial

**PROBLEMA:**
- Línea 15: Se importa `AccessibilityBar` pero no hay componente `UmayorLogo` en el Layout principal
- El header (Header.tsx) debe incluir el isologo oficial

**CORRECCIÓN:**
```typescript
// En Header.tsx (no se proporciona, pero debe incluir):
import { UmayorLogo } from './UmayorLogo';

// En el render del header:
<div className="flex items-center gap-2">
  <UmayorLogo size="md" variant="horizontal" className="..." />
  <div className="hidden md:block border-l border-slate-200 pl-3">
    <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
      AVANZA hacia la excelencia
    </span>
  </div>
</div>
```

**Pendiente:** Revisar `src/components/UmayorLogo.tsx` para validar que use archivos oficiales del isologo.

---

### 4. **Tipografía: Falta Declaración de Fuentes**

**PROBLEMA:**
- Montserrat está declarada globalmente, pero no hay referencia a:
  - **Bombardier** (para palabra "MAYOR" en isologo)
  - **Garamond Bold** (para nombre en escudo)
  - Tipografía script para eslóganes

**CORRECCIÓN:**
En `src/index.css` o `src/App.tsx`, agregar:

```css
@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800;900&display=swap');
/* Opcional: agregar después de confirmar con Comunicaciones */
/* @import url('https://fonts.googleapis.com/css2?family=Garamond:wght@700&display=swap'); */
```

---

### 5. **Colores: Verificación Hexadecimales**

**PROBLEMA:**
- Algunos colores usan formas alternativas no correspondientes a la paleta oficial

**VALIDACIÓN:**

| Elemento | HEX Usado | Estándar Manual | ✔/✘ |
|----------|-----------|-----------------|-----|
| Verde Institucional | `#006A4E` | `#007f3a` | ✘ REVISAR |
| Verde Oscuro | `#00523E` | `#0e4025` | ✘ REVISAR |
| Amarillo Mostaza | `#C49E2D` | `#e19e08` | ✘ REVISAR |
| Gris | `#4A5568` | `#615c5e` | ✘ REVISAR |

**CORRECCIÓN URGENTE:**

Remplazar en LoginView.tsx y otros archivos:

```typescript
// ACTUAL (incorrecto)
from-[#006A4E] via-[#005835] to-[#00382B]
text-[#C49E2D]
bg-[#006A4E]

// CORRECCIÓN (según manual)
from-[#007f3a] via-[#0e4025] to-[#007f3a]
text-[#e19e08]
bg-[#007f3a]
```

**Impacto:** Crear script de reemplazo global:
```bash
# Buscar y reemplazar en todos los archivos TSX/CSS
grep -r "#006A4E\|#C49E2D\|#005835" src/ --include="*.tsx" --include="*.css"
```

---

### 6. **Línea Tricolor (Bandera de Cartagena)**

**PROBLEMA:**
- No aparece explícitamente en el código actual
- Debe estar en pie de página según manual

**CORRECCIÓN:**

En componente de Footer (no proporcionado, pero debe implementarse):

```tsx
const TricolorBar: React.FC = () => (
  <div className="h-1 flex">
    <div className="flex-1 bg-[#cc0d12]"></div>  {/* Rojo */}
    <div className="flex-1 bg-[#e19e08]"></div>  {/* Amarillo mostaza */}
    <div className="flex-1 bg-[#0e4025]"></div>  {/* Verde oscuro */}
  </div>
);
```

---

### 7. **Mensajes de Error/Validación**

**PROBLEMA:**
- Línea 50 (LoginView.tsx): "Ingrese su contraseña o PIN de seguridad docente"
- Lenguaje informal

**CORRECCIÓN:**
```typescript
// ACTUAL
setErrorMsg('Ingrese su contraseña o PIN de seguridad docente.');

// CORRECCIÓN
setErrorMsg('Por favor ingrese su contraseña o PIN de acceso institucional.');
```

**Aplicar a todas las validaciones de LoginView.tsx**

---

### 8. **Abreviaciones Inconsistentes**

**PROBLEMA:**
- Línea 131 (LoginView.tsx): Usa "UMAYOR" (correcto)
- Línea 134: Especifica "Facultad de Ingeniería · Comité Curricular"
- En README: Usa "UMAYOR" y "SIG-Currículo"

**CORRECCIÓN:**
Estandarizar uso:
- Nombre completo: "Institución Universitaria Mayor de Cartagena"
- Abreviado: "UMAYOR"
- Sistema: "SIG-Currículo"
- Nunca: "Umayor", "sig-curriculo", "SIGC"

---

### 9. **Componente UmayorLogo**

**CRÍTICO - PENDIENTE REVISIÓN:**

Aunque se menciona en LoginView.tsx (línea 5):
```typescript
import { UmayorLogo } from './UmayorLogo';
```

**VERIFICAR:**
1. ¿El componente `UmayorLogo.tsx` existe?
2. ¿Usa archivos SVG/PNG oficiales del isologo?
3. ¿Respeta el área de protección?
4. ¿Soporta versiones correctas (vertical, horizontal, negativo)?

**Si no existe, CREAR:**
```tsx
// src/components/UmayorLogo.tsx
import React from 'react';

interface UmayorLogoProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'horizontal' | 'vertical' | 'icon';
  className?: string;
}

export const UmayorLogo: React.FC<UmayorLogoProps> = ({
  size = 'md',
  variant = 'horizontal',
  className = ''
}) => {
  // IMPORTANTE: Aquí debe irse el archivo SVG oficial
  // [ISOLOGO UMAYOR – versión {variant} a color] – requiere archivo oficial
  return (
    <div className={`umayor-logo ${size} ${variant} ${className}`}>
      {/* Reemplazar con <img src="/logos/isologo-umayor-{variant}.svg" /> */}
      <span className="text-xs font-bold text-[#007f3a]">UMAYOR</span>
    </div>
  );
};
```

---

## 📝 CHECKLIST DE CUMPLIMIENTO

### Documentación
- [ ] README.md: Nombre consistente
- [ ] README.md: Agregar sección "Identidad Visual" con instrucciones de marca
- [ ] Crear BRAND_GUIDELINES.md (este archivo)
- [ ] Documentar paleta de colores oficial en archivo de configuración

### Código
- [ ] Reemplazar colores hexadecimales por los del manual oficial
- [ ] Verificar que UmayorLogo.tsx existe y usa archivos oficiales
- [ ] Normalizar textos institucionales (tono formal, español claro)
- [ ] Agregar variable de entorno para correo de Super Admin
- [ ] Implementar línea tricolor en footer
- [ ] Usar Montserrat consistentemente en tipografía

### Diseño
- [ ] Validar alineación del isologo en HeaderLayout
- [ ] Revisar encabezado: debe tener gradiente verde + isologo + eslogan
- [ ] Revisar pie: línea tricolor + www.umayor.edu.co + año
- [ ] Confirmar área de protección alrededor del isologo
- [ ] Verificar versión del isologo según fondo (color, negativo, monocromática)

### Textos
- [ ] LoginView.tsx: Revisar todos los mensajes de usuario
- [ ] Cambiar "Acreditación y Decisiones" → "Gestión Integral de Actas Colegiadas"
- [ ] Confirmar lema oficial con Dirección de Comunicaciones
- [ ] Normalizar abreviaciones: UMAYOR, SIG-Currículo

### Archivos Faltantes
- [ ] Obtener archivos oficiales del isologo en versiones:
  - `isologo-umayor-vertical-color.svg`
  - `isologo-umayor-horizontal-color.svg`
  - `isologo-umayor-vertical-negativo.svg`
  - `isologo-umayor-horizontal-negativo.svg`

- [ ] Obtener archivo de tipografía script (si aplica para eslóganes)

---

## 🔗 REFERENCIAS

- **Manual de Identidad Corporativa UMAYOR 2024** (manual oficial)
- **Dominio oficial:** www.umayor.edu.co
- **Correo de comunicaciones:** Confirmar con Dirección de Autoevaluación y Calidad
- **Dirección institucional:** K3 # 36-95 Calle de la Factoría, Centro Histórico, Cartagena de Indias

---

## 📞 CONTACTO PARA VALIDACIÓN

Para confirmar cualquier decisión sobre:
- Lemas o eslóganes institucionales
- Tipografías adicionales (Bombardier, Garamond, script)
- Archivos oficiales del isologo
- Variaciones de color en contextos especiales

**Contactar a:** Dirección de Comunicaciones o Dirección de Autoevaluación y Calidad Académica

---

**Versión:** 1.0  
**Fecha:** Octubre 2026  
**Estado:** En Revisión para Aplicación
