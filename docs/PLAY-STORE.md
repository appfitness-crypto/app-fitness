# Publicar en Play Store

La app de Play Store es una "Trusted Web Activity": un envoltorio de Android que abre la web
publicada en **https://app-fitness-7cf1c.web.app** a pantalla completa. Cuando cambias la web,
la app se actualiza sola; solo vuelves a subir a Play Store si cambias el nombre, el ícono o el paquete.

Todo se puede hacer desde el celular o la tablet.

---

## Parte A · Publicar la web (una sola vez)

1. **Firebase → Hosting → Comenzar.** Avanza con "Siguiente" hasta terminar (no hace falta ejecutar los comandos que muestra).
2. **Crear la clave de publicación:** Firebase → ⚙ Configuración del proyecto → **Cuentas de servicio** →
   **Generar nueva clave privada**. Se descarga un archivo `.json`. Es una contraseña: no lo compartas ni lo subas al repositorio.
3. **Guardarla en GitHub:** repositorio → **Settings → Secrets and variables → Actions → New repository secret**.
   - Name: `FIREBASE_SERVICE_ACCOUNT`
   - Secret: abre el `.json` con un editor de texto, copia **todo** el contenido y pégalo.
4. **Publicar:** une el pull request a `main`. GitHub Actions publica en https://app-fitness-7cf1c.web.app
   (pestaña **Actions** del repositorio para ver el avance). En cada pull request aparece además un enlace
   de vista previa para probar antes de unir.
5. Si la publicación falla por permisos: Google Cloud Console → **IAM** → cuenta `firebase-adminsdk-…` → Editar →
   agrega los roles **Administrador de Firebase Hosting**, **Visualizador de claves de API** y **Visualizador de Cloud Run**.

> Las reglas de la base de datos (`firebase-rules.json`) también se publican solas al unir a `main`
> (paso "Publicar reglas de la base de datos" en Actions). Ya no hay que pegarlas a mano.

## Parte B · Crear el paquete de Android (PWABuilder)

1. Abre **https://www.pwabuilder.com**, escribe `https://app-fitness-7cf1c.web.app` y toca **Start**.
2. **Package for stores → Android → Google Play → Generate package**. En las opciones:
   - **Package ID:** por ejemplo `com.tunombre.fitness`. **No se puede cambiar nunca** después de publicar.
   - **App name / Short name:** el nombre definitivo (se puede cambiar después en Play Console).
   - **Signing key:** *Create new*. Llena tus datos y **anota las contraseñas**.
3. Se descarga un `.zip` con:
   - `*.aab` → el archivo que se sube a Play Store.
   - `signing.keystore` + `signing-key-info.txt` → **guárdalos en un lugar seguro** (Drive privado). Sin ellos no puedes publicar actualizaciones del paquete.
   - `assetlinks.json` → pásamelo (o súbelo a `.well-known/assetlinks.json` en el repositorio).
4. **assetlinks.json** es lo que quita la barra del navegador dentro de la app. Debe tener dos huellas:
   la de tu llave (viene en el archivo) y la de **Play App Signing** (Play Console → tu app → Configuración →
   **Integridad de la app → Firma de apps → Huella digital del certificado SHA-256**). Pásame ambas y armo el archivo.
   - Ya publicado: `.well-known/assetlinks.json` con la huella de la llave de PWABuilder (paquete `com.appfitness.app`).
   - Falta: agregar la huella de **Play App Signing** cuando subas el primer `.aab` a Play Console
     (se agrega como segundo elemento de `sha256_cert_fingerprints`).

## Parte C · Play Console

1. **Cuenta de desarrollador:** https://play.google.com/console (pago único de 25 USD, verificación de identidad).
   Las cuentas **personales** nuevas deben hacer una **prueba cerrada con al menos 12 personas durante 14 días**
   antes de poder publicar en producción (revisa el requisito vigente al crear la cuenta).
2. **Crear app** → idioma Español (Latinoamérica) → App → Gratis.
3. **Pruebas → Prueba cerrada:** sube el `.aab`, agrega los correos de tus probadores y comparte el enlace.
4. **Ficha de la tienda:** nombre, descripción corta y larga, ícono 512×512 (`icons/icon-maskable-512.png`),
   gráfico destacado 1024×500 y al menos 2 capturas de pantalla del celular.
5. **Contenido de la app** (Política de la app):
   - **Política de privacidad:** `https://app-fitness-7cf1c.web.app/privacidad.html`
   - **Eliminación de datos / cuenta:** `https://app-fitness-7cf1c.web.app/eliminar-cuenta.html`
   - **Acceso a la app:** da a Google una cuenta de prueba (correo y contraseña de un cliente con plan).
   - **Anuncios:** No.
   - **Clasificación del contenido:** cuestionario (categoría Salud y bienestar / Utilidad).
   - **Público objetivo:** 18 años o más (la app pide datos de salud).
   - **Apps de salud:** declara que es de *fitness / actividad física*.
   - **Seguridad de los datos:** ver tabla abajo.

### Seguridad de los datos (lo que hoy hace la app)

| Tipo de dato | ¿Se recolecta? | Para qué | ¿Se comparte con terceros? |
|---|---|---|---|
| Nombre | Sí, obligatorio | Funcionalidad de la app, administración de la cuenta | No |
| Correo electrónico | Sí, obligatorio | Administración de la cuenta | No |
| Información de salud (lesiones, limitaciones, medidas, peso) | Sí, obligatorio | Funcionalidad de la app, personalización | No |
| Información de actividad física (entrenamientos registrados) | Sí | Funcionalidad de la app, personalización | No |
| Ubicación | No | — | — |

- Los datos van **cifrados en tránsito** (Firebase usa HTTPS): **Sí**.
- El usuario **puede pedir que se borren**: **Sí** (desde la app y en la página de eliminación).
- Si activas la IA de rutinas (`aiEndpoint` en `js/config.js`), cambia la respuesta: algunos datos del perfil
  (sin nombre) se envían a ese servicio.

> Revisa estas respuestas antes de enviarlas: tú eres el responsable legal de lo que declaras.

## Antes de publicar

- [ ] Nombre definitivo en `js/config.js` (Identidad) y en `manifest.json` (`name`, `short_name`).
- [ ] Correo de contacto en `js/config.js` → `privacidad.correo` (aparece en el aviso y en la página de eliminación).
- [ ] Responsable legal en `privacidad.responsable` (tu nombre o razón social).
- [ ] Reglas de Firebase publicadas y tu cuenta con rol `coordinador` (ver `docs/CLIENTE-ENTRENADOR.md`).
