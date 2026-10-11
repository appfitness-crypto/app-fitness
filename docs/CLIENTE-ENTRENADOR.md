# App pública: cliente directo y entrenador

La app ya no pertenece a un gimnasio. Tiene dos formas de uso:

| | Cliente directo | Entrenador |
|---|---|---|
| Cómo entra | "Soy nuevo" → crea su cuenta con correo | "Soy entrenador: crear mi cuenta" |
| Quién arma el plan | La app, con la filosofía del director | La app, con la filosofía de ese entrenador |
| Cómo se ligan | — | El entrenador recibe un código (ej. `ENT-4K7Q`). El cliente lo escribe en el último paso de su evaluación, o después en Perfil → "Tengo código de entrenador" |
| Quién lo administra | La app (y el director, que ve a todos) | El entrenador ve y edita solo a sus clientes |

## Configurar Firebase (una sola vez)

1. **Authentication → Método de acceso:** activa **Correo electrónico/contraseña** y **Anónimo**
   (la sesión anónima sirve para validar el código del entrenador antes de tener cuenta).
2. **Realtime Database → Reglas:** pega el contenido de `firebase-rules.json` y publica.
3. **Hazte director:**
   1. En la app, crea tu cuenta con "Soy entrenador: crear mi cuenta".
   2. En Firebase → Authentication, copia el **UID** de tu cuenta.
   3. En Realtime Database → Datos, entra a `roles` → tu UID y cambia `"entrenador"` por `"coordinador"`.
   4. Cierra sesión y vuelve a entrar: verás el panel del director (todos los clientes, conocimiento, entrenadores).
4. **Tu filosofía = el plan de la app.** Como director, en el menú abre **🧬 Mi filosofía**: es la que usan
   todos los clientes que no tienen entrenador.

## Dónde se guarda cada cosa

| Ruta | Qué es | Quién puede leer / escribir |
|---|---|---|
| `/socios/<uid>` | Expediente del cliente | El cliente, su entrenador y el director |
| `/indice/<uid>` | Resumen ligero para la lista del panel | Igual; cada entrenador solo puede consultar los suyos |
| `/roles/<uid>` | `entrenador` (se lo pone él al registrarse) o `coordinador` (solo desde la consola) | La propia cuenta y el director |
| `/entrenadores/<uid>` | Perfil público: nombre, filosofía, rutinas modelo, código | Todos leen; cada entrenador edita el suyo |
| `/codigos/<CÓDIGO>` | A qué entrenador pertenece cada código | Se consulta uno por uno; nadie puede listarlos |
| `/config` | Conocimiento y lineamientos del sistema | Todos leen; solo el director escribe |

Las reglas se probaron con el emulador de Firebase (53 casos: un cliente no ve a otro, un entrenador
no ve a los clientes de otro ni a los del plan de la app, nadie se puede dar rol de director, etc.).

## Eliminar cuenta
- Cliente: Perfil → **Eliminar mi cuenta**. Borra su expediente, su índice y su cuenta.
- Entrenador: Menú → **Eliminar mi cuenta**. Borra su perfil, su código y su rol; sus clientes conservan su plan
  y pasan a seguir la filosofía del plan de la app.
- El director no se puede borrar desde la app (primero se le quita el rol en la consola).

## Pendiente
- Publicar y empaquetar para Play Store: ver `docs/PLAY-STORE.md`.
- Cobros: suscripción del cliente directo y reparto de porcentaje con el entrenador.
