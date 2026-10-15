/* ═══ ENTRENO: pestaña Rutina, sesión en curso, resumen y ficha "Cómo se hace" ═══
   Fitness System Pro · módulo cargado por index.html en orden (script clásico: comparte el ámbito global).
   - Rutina: tira de la semana, bloque de progresión y la sesión del día con el peso sugerido.
   - Sesión: un ejercicio a la vez sobre el mismo `sesionTemp` del módulo 15; los ejercicios
     especiales (cardio, rondas, movilidad, isométricos) se registran en su ventana de siempre.
     Al terminar se usa el mismo finalizarSesion(), que guarda igual que antes.
   - Ficha: foto del ejercicio, equipo, músculos, pasos y error común.
   Solo se agregan dos datos opcionales a cada sesión guardada: `sr` (kg y reps de cada serie)
   dentro del detalle, y `sensacion` (cómo se sintió). ═══ */

// ── Pasos y error común por ejercicio (clave: nombre del catálogo en slug). Opcional: si un
//    ejercicio no está aquí, la ficha muestra la nota del entrenador. `e` cambia el equipo mostrado.
const EJ_PASOS = {
  'press-banca-plano':{e:'Barra y banca plana',p:['Acuéstate con los ojos bajo la barra y los pies firmes en el piso.','Junta las escápulas y baja la barra controlada hasta el pecho.','Empuja hacia arriba sin despegar la cadera del banco.'],x:'Rebotar la barra en el pecho o abrir demasiado los codos.'},
  'jalon-al-pecho':{e:'Máquina de jalón (polea alta)',p:['Ajusta el soporte para que las rodillas queden fijas.','Toma la barra un poco más abierta que los hombros.','Lleva la barra a la parte alta del pecho bajando los codos.'],x:'Echarte muy atrás y jalar con impulso.'},
  'press-de-hombro-con-mancuernas':{e:'Mancuernas y banca con respaldo',p:['Siéntate con la espalda pegada al respaldo.','Empieza con las mancuernas a la altura de las orejas.','Empuja hacia arriba sin chocar las mancuernas.'],x:'Arquear la espalda baja para subir más peso.'},
  'remo-en-polea-baja':{e:'Polea baja con agarre en V',p:['Siéntate con las rodillas un poco flexionadas.','Jala el agarre hacia el ombligo con el pecho arriba.','Regresa lento hasta estirar la espalda.'],x:'Mover el torso hacia atrás y adelante para ayudarte.'},
  'elevaciones-laterales':{e:'Mancuernas',p:['De pie, con los codos un poco flexionados.','Sube los brazos a los lados hasta la altura del hombro.','Baja en 2 o 3 segundos.'],x:'Usar impulso del cuerpo o subir más allá del hombro.'},
  'sentadilla-goblet':{e:'Una mancuerna o pesa rusa',p:['Sostén la mancuerna pegada al pecho, pies al ancho de hombros.','Baja entre las piernas con el pecho arriba.','Sube empujando el piso con todo el pie.'],x:'Que las rodillas se vayan hacia adentro.'},
  'sentadilla-libre':{e:'Barra olímpica en rack',p:['Apoya la barra en la parte alta de la espalda, no en el cuello, y sácala del rack con dos pasos.','Pies al ancho de hombros; baja llevando la cadera atrás y abajo, con el pecho arriba.','Llega a muslos paralelos y sube empujando el piso con todo el pie.'],x:'Que los talones se despeguen o las rodillas se vayan hacia adentro.'},
  'peso-muerto-convencional':{e:'Barra olímpica con discos',p:['Pies al ancho de cadera, barra sobre la mitad del pie y manos justo afuera de las piernas.','Espalda recta y pecho arriba; empuja el piso con las piernas llevando la barra pegada al cuerpo.','Termina de pie con la cadera extendida y baja con el mismo control.'],x:'Redondear la espalda o alejar la barra del cuerpo.'},
  'sentadilla-frontal':{e:'Barra olímpica en rack',p:['Apoya la barra al frente de los hombros, con los codos altos apuntando hacia adelante.','Baja con el torso lo más erguido posible hasta que los muslos queden paralelos.','Sube empujando con todo el pie sin dejar caer los codos.'],x:'Bajar los codos: la barra se va hacia adelante.'},
  'desplante':{e:'Mancuernas',p:['De pie con una mancuerna en cada mano a los costados.','Da un paso largo al frente y baja hasta que ambas rodillas queden a 90°.','Empuja con el pie de adelante para regresar a la posición inicial.'],x:'Que la rodilla de adelante se vaya hacia adentro o pase mucho la punta del pie.'},
  'extension-de-cuadriceps':{e:'Máquina de extensión de piernas',p:['Ajusta el respaldo para que la rodilla quede alineada con el eje de la máquina.','Coloca el rodillo sobre la parte baja de las espinillas y sujeta las agarraderas.','Extiende las piernas hasta casi estirarlas y baja lento.'],x:'Dar patadas rápidas o despegar la cadera del asiento.'},
  'puente-de-gluteo':{e:'Tapete (peso corporal)',p:['Acuéstate boca arriba con las rodillas dobladas y los pies apoyados al ancho de cadera.','Aprieta los glúteos y sube la cadera hasta formar una línea de hombros a rodillas.','Sostén un segundo arriba y baja controlado.'],x:'Arquear la espalda baja en lugar de usar los glúteos.'},
  'cruce-de-poleas':{e:'Poleas / cables (estación de cruce)',p:['Coloca las poleas a la altura de los hombros y da un paso al frente.','Con los codos un poco flexionados, junta las manos frente al pecho.','Regresa lento hasta sentir el estiramiento del pecho.'],x:'Doblar y estirar los codos: se vuelve un press.'},
  'dominadas':{e:'Barra de dominadas',p:['Cuélgate con agarre prono un poco más abierto que los hombros.','Jala llevando los codos hacia las costillas hasta que la barbilla pase la barra.','Baja controlado hasta estirar los brazos.'],x:'Balancear el cuerpo o hacer medias repeticiones.'},
  'pullover-en-polea-alta':{e:'Polea alta con barra recta',p:['De frente a la polea, flexiona un poco la cadera y toma la barra con los brazos casi rectos.','Lleva la barra en arco hasta los muslos sin doblar los codos.','Regresa lento hasta sentir el estiramiento del dorsal.'],x:'Doblar los codos: se convierte en un jalón de tríceps.'},
  'curl-alterno-con-mancuernas':{e:'Mancuernas',p:['De pie con una mancuerna en cada mano y los codos pegados al cuerpo.','Sube una mancuerna girando la palma hacia arriba, sin mover el codo.','Baja lento y repite con el otro brazo.'],x:'Balancear el torso para subir el peso.'},
  'plancha-frontal':{e:'Tapete (peso corporal)',p:['Apoya los antebrazos con los codos debajo de los hombros.','Estira las piernas y forma una línea recta de la cabeza a los talones.','Aprieta abdomen y glúteos y sostén sin dejar caer la cadera.'],x:'Dejar caer la cadera o subirla demasiado.'},
  'escaladores':{e:'Tapete (peso corporal)',p:['Ponte en plancha alta con las manos debajo de los hombros.','Lleva una rodilla hacia el pecho y regrésala mientras llevas la otra.','Alterna rápido sin subir ni bajar la cadera.'],x:'Levantar la cadera o apoyar el peso en los pies.'},
  'rueda-abdominal':{e:'Rueda abdominal y tapete',p:['De rodillas sobre el tapete, toma la rueda con las dos manos debajo de los hombros.','Rueda hacia adelante con el abdomen firme hasta donde puedas sin arquear la espalda.','Regresa jalando con el abdomen, no con la cadera.'],x:'Dejar caer la cadera y arquear la espalda baja.'},
  'plancha-lateral':{e:'Tapete (peso corporal)',p:['Recuéstate de lado con el codo debajo del hombro y los pies uno sobre otro.','Sube la cadera hasta formar una línea recta de la cabeza a los pies.','Sostén con el abdomen firme sin dejar caer la cadera.'],x:'Dejar caer la cadera hacia el piso.'},
  'cruce-de-poleas-de-arriba-hacia-abajo':{e:'Poleas / cables (estación de cruce)',p:['Coloca las poleas arriba y da un paso al frente con el torso un poco inclinado.','Con los codos un poco flexionados, baja las manos en arco hasta juntarlas frente a la cadera.','Regresa lento hasta sentir el estiramiento del pecho.'],x:'Doblar y estirar los codos: se vuelve un press.'},
  'prensa-de-piernas':{e:'Máquina de prensa inclinada',p:['Espalda y cadera pegadas al respaldo.','Pies al ancho de cadera, a media plataforma.','Baja hasta 90° y empuja sin bloquear las rodillas.'],x:'Despegar la cadera del asiento al bajar.'},
  'sentadilla-bulgara':{e:'Banca y mancuernas',p:['Apoya el empeine del pie de atrás en la banca.','Baja recto hasta que la rodilla de atrás casi toque el piso.','Sube empujando con el pie de adelante.'],x:'Dar un paso muy corto: la rodilla se adelanta de más.'},
  'curl-femoral-acostado':{e:'Máquina de curl femoral',p:['Acuéstate con el rodillo justo arriba del talón.','Lleva los talones hacia el glúteo.','Baja lento sin soltar la tensión.'],x:'Levantar la cadera del banco.'},
  'peso-muerto-rumano':{e:'Barra olímpica con discos',p:['De pie con la barra en las manos, pies al ancho de cadera y rodillas un poco flexionadas.','Lleva la cadera hacia atrás con la espalda recta y baja la barra pegada a las piernas hasta debajo de las rodillas.','Sube empujando la cadera hacia adelante y aprieta glúteos arriba.'],x:'Redondear la espalda o doblar las rodillas como en una sentadilla.'},
  'remo-con-barra':{e:'Barra olímpica con discos',p:['Inclina el torso unos 45° con la espalda recta y las rodillas un poco flexionadas.','Jala la barra hacia la parte baja de las costillas llevando los codos atrás.','Baja con control hasta estirar los brazos sin mover el torso.'],x:'Levantar el torso con impulso para subir la barra.'},
  'press-militar-con-barra':{e:'Barra olímpica con discos',p:['De pie, barra apoyada al frente de los hombros y manos un poco más abiertas que ellos.','Aprieta glúteos y abdomen y empuja la barra recto hacia arriba pasando la cabeza.','Bloquea arriba con la barra sobre la mitad del pie y baja controlado.'],x:'Arquear la espalda baja para empujar más peso.'},
  'press-landmine':{e:'Barra anclada en el piso (landmine) y un disco',p:['Toma el extremo libre de la barra a la altura del hombro, con un pie adelante.','Empuja la barra hacia arriba y adelante siguiendo su línea, sin bloquear el codo de golpe.','Regresa despacio al hombro con el abdomen firme.'],x:'Empujar recto hacia el techo en lugar de seguir la diagonal de la barra.'},
  'sentadilla-a-la-caja':{e:'Barra olímpica y cajón',p:['Barra en la espalda alta, pies un poco más abiertos que los hombros y el cajón detrás.','Baja llevando la cadera atrás hasta tocar el cajón con suavidad, pecho arriba.','Sube empujando el piso sin rebotar en el cajón.'],x:'Dejarte caer sobre el cajón y perder la tensión.'},
  'peso-muerto-sumo':{e:'Barra olímpica con discos',p:['Pies muy abiertos con las puntas hacia afuera y manos dentro de las rodillas.','Pecho arriba y espalda recta; empuja las rodillas hacia afuera y despega la barra del piso.','Sube hasta quedar de pie con la cadera extendida y baja con el mismo control.'],x:'Dejar que las rodillas se vayan hacia adentro.'},
  'buenos-dias-con-barra':{e:'Barra olímpica con discos',p:['Barra en la espalda alta, pies al ancho de cadera y rodillas un poco flexionadas.','Lleva la cadera atrás e inclina el torso con la espalda recta hasta casi quedar paralelo al piso.','Sube empujando la cadera hacia adelante; usa poco peso.'],x:'Redondear la espalda baja al inclinarte.'},
  'peso-muerto-rumano-con-mancuernas':{e:'Dos mancuernas',p:['De pie con una mancuerna en cada mano frente a los muslos y rodillas un poco flexionadas.','Lleva la cadera atrás con la espalda recta y baja las mancuernas pegadas a las piernas.','Cuando sientas estirar los femorales, sube empujando la cadera hacia adelante.'],x:'Bajar las mancuernas lejos del cuerpo o redondear la espalda.'},
  'press-inclinado-con-mancuernas':{e:'Banca inclinada y mancuernas',p:['Ajusta la banca a unos 30° y siéntate con la espalda pegada al respaldo.','Baja las mancuernas a los lados de la parte alta del pecho.','Empuja hacia arriba sobre el pecho sin chocar las mancuernas.'],x:'Inclinar demasiado la banca y convertirlo en press de hombro.'},
  'press-plano-con-mancuernas':{e:'Banca plana y mancuernas',p:['Acuéstate con la cabeza, la espalda y la cadera en la banca y los pies firmes en el piso.','Baja las mancuernas a los lados del pecho con los codos a unos 45° del cuerpo.','Empuja hacia arriba juntando las mancuernas sobre el pecho.'],x:'Abrir los codos a 90° y forzar los hombros.'},
  'aperturas-con-mancuernas':{e:'Banca plana y mancuernas',p:['Acuéstate en la banca con las mancuernas arriba del pecho y los codos un poco flexionados.','Abre los brazos en arco hacia los lados hasta sentir que se estira el pecho.','Regresa por el mismo arco como si abrazaras un árbol.'],x:'Doblar y estirar los codos: se convierte en press y se pierde el estiramiento.'},
  'pullover-con-mancuerna':{e:'Banca plana y una mancuerna',p:['Acuéstate con la mancuerna sujeta con ambas manos arriba del pecho.','Bájala en arco por detrás de la cabeza con los brazos casi rectos.','Regresa por el mismo arco hasta arriba del pecho.'],x:'Doblar mucho los codos o arquear la espalda baja al bajar.'},
  'remo-con-mancuerna':{e:'Banca plana y una mancuerna',p:['Apoya una rodilla y la mano del mismo lado en la banca, con la espalda recta.','Jala la mancuerna hacia la cadera llevando el codo atrás y pegado al cuerpo.','Baja con control hasta estirar el brazo.'],x:'Girar el torso para subir la mancuerna con impulso.'},
  'elevacion-frontal-ligera':{e:'Dos mancuernas ligeras',p:['De pie con las mancuernas frente a los muslos y el abdomen firme.','Sube los brazos al frente, casi rectos, hasta la altura de los hombros.','Baja despacio sin dejar caer las mancuernas.'],x:'Echarte hacia atrás o balancear el cuerpo para subirlas.'},
  'pajaros-con-mancuerna':{e:'Dos mancuernas ligeras',p:['Inclina el torso casi paralelo al piso con la espalda recta y las rodillas un poco flexionadas.','Abre los brazos hacia los lados hasta la altura de los hombros, con los codos un poco flexionados.','Junta las escápulas arriba y baja con control.'],x:'Subir con impulso del torso o usar demasiado peso.'},
  'encogimientos-con-mancuerna':{e:'Dos mancuernas',p:['De pie con una mancuerna en cada mano a los lados, brazos rectos.','Sube los hombros hacia las orejas lo más alto que puedas.','Sostén un segundo arriba y baja despacio.'],x:'Girar los hombros en círculos o doblar los codos.'},
  'curl-con-barra-z':{e:'Barra Z con discos',p:['De pie, toma la barra en la parte angulada con las palmas hacia arriba.','Sube la barra doblando los codos, pegados a los costados.','Baja despacio hasta estirar los brazos.'],x:'Balancear el cuerpo o adelantar los codos para subir.'},
  'curl-martillo':{e:'Dos mancuernas',p:['De pie con las mancuernas a los lados y las palmas mirándose entre sí.','Sube las mancuernas doblando los codos, sin girar las muñecas.','Baja con control hasta estirar los brazos.'],x:'Separar los codos del cuerpo o subir con impulso.'},
  'extension-de-triceps-sobre-la-cabeza':{e:'Una mancuerna',p:['De pie, sujeta la mancuerna con ambas manos y súbela arriba de la cabeza.','Baja la mancuerna por detrás de la cabeza doblando solo los codos.','Estira los brazos hacia arriba sin mover los codos de lugar.'],x:'Abrir los codos hacia los lados o arquear la espalda.'},
  'farmer-walk':{e:'Dos mancuernas pesadas',p:['Toma una mancuerna pesada en cada mano y párate derecho con los hombros atrás.','Camina con pasos cortos y firmes, sin que las mancuernas se balanceen.','Mantén el abdomen firme todo el recorrido y deja las mancuernas con la espalda recta.'],x:'Encorvar la espalda o dejar caer los hombros.'},
  'caminata-con-peso-unilateral':{e:'Una mancuerna pesada',p:['Toma una mancuerna en una sola mano y párate derecho con los hombros nivelados.','Camina con pasos cortos y firmes sin inclinarte hacia el lado de la mancuerna.','Al terminar el recorrido cambia de mano y repite del otro lado.'],x:'Ladear el torso hacia la mancuerna o subir el hombro del otro lado.'},
  'zancada-reversa-con-mancuernas':{e:'Dos mancuernas',p:['De pie con una mancuerna en cada mano a los lados y el torso derecho.','Da un paso largo hacia atrás y baja hasta que la rodilla de atrás casi toque el piso.','Empuja con el talón de la pierna de adelante para volver a juntar los pies.'],x:'Dejar que la rodilla de adelante se vaya hacia adentro.'},
  'sentadilla-isometrica-con-mancuerna':{e:'Una mancuerna',p:['Sujeta la mancuerna vertical frente al pecho con ambas manos.','Baja en sentadilla hasta que los muslos queden paralelos al piso.','Aguanta abajo el tiempo indicado con el pecho arriba y el abdomen firme.'],x:'Dejar caer el pecho o levantar los talones mientras aguantas.'},
  'sentadilla-sumo-con-mancuerna':{e:'Una mancuerna',p:['Abre los pies más que los hombros con las puntas hacia afuera y sujeta la mancuerna entre las piernas.','Baja la cadera con el torso derecho, llevando las rodillas en la dirección de las puntas.','Sube empujando el piso y aprieta los glúteos arriba.'],x:'Juntar las rodillas hacia adentro al subir.'},
  'desplante-lateral':{e:'Una mancuerna',p:['Sujeta la mancuerna frente al pecho y abre los pies bastante más que los hombros.','Lleva la cadera atrás y hacia un lado doblando esa rodilla, con la otra pierna estirada.','Empuja con la pierna doblada para regresar al centro y alterna lados.'],x:'Levantar el talón de la pierna doblada o redondear la espalda.'},
  'peso-muerto-a-una-pierna-con-mancuerna':{e:'Una o dos mancuernas',p:['Párate en una pierna con la rodilla un poco flexionada y la mancuerna frente al muslo.','Inclina el torso al frente mientras la otra pierna sube estirada hacia atrás.','Cuando sientas estirar el femoral, regresa apretando el glúteo de la pierna de apoyo.'],x:'Abrir la cadera hacia un lado en lugar de mantenerla nivelada.'},
  'peso-muerto-piernas-rigidas-con-mancuernas':{e:'Dos mancuernas',p:['De pie con las mancuernas frente a los muslos y las rodillas casi rectas.','Baja las mancuernas pegadas a las piernas llevando la cadera atrás con la espalda recta.','Sube empujando la cadera al frente hasta quedar derecho.'],x:'Redondear la espalda para bajar más.'},
  'pantorrilla-a-una-pierna-con-mancuerna':{e:'Escalón, una mancuerna y un apoyo',p:['Párate en un pie sobre el borde del escalón con la mancuerna del mismo lado y la otra mano en un apoyo.','Baja el talón hasta sentir el estiramiento de la pantorrilla.','Sube lo más alto que puedas, aguanta 1 segundo y baja despacio.'],x:'Rebotar abajo o hacer el movimiento corto.'},
  'press-declinado-con-mancuernas':{e:'Banca declinada y mancuernas',p:['Acuéstate en la banca declinada con los pies sujetos y las mancuernas a los lados del pecho bajo.','Empuja las mancuernas hacia arriba sobre la parte baja del pecho.','Baja con control hasta que los codos queden un poco abajo de la banca.'],x:'Bajar demasiado rápido o soltar los pies del soporte.'},
  'pec-deck-aperturas-en-maquina':{e:'Máquina pec deck',p:['Ajusta el asiento para que las manijas queden a la altura del pecho y apoya la espalda en el respaldo.','Junta los brazos al frente del pecho con los codos un poco flexionados.','Abre despacio hasta sentir el estiramiento del pecho, sin pasar la línea de los hombros.'],x:'Despegar la espalda del respaldo o dejar que el peso regrese de golpe.'},
  'press-de-pecho-en-maquina':{e:'Máquina de press de pecho',p:['Ajusta el asiento para que las manijas queden a la altura de la parte media del pecho.','Con la espalda pegada al respaldo, empuja las manijas al frente hasta casi estirar los brazos.','Regresa con control hasta sentir el estiramiento del pecho.'],x:'Subir los hombros hacia las orejas o bloquear los codos al estirar.'},
  'press-inclinado-en-maquina':{e:'Máquina de press inclinado',p:['Siéntate con la espalda en el respaldo inclinado y las manijas a la altura de la parte alta del pecho.','Empuja hacia arriba y al frente hasta casi estirar los brazos.','Baja con control hasta que las manos queden cerca de los hombros.'],x:'Arquear la espalda baja para empujar más peso.'},
  'pantorrilla-en-prensa':{e:'Prensa de piernas',p:['Siéntate en la prensa y apoya solo la punta de los pies en la orilla baja de la plataforma, con las piernas casi rectas.','Empuja con la punta de los pies estirando los tobillos lo más que puedas.','Regresa despacio hasta sentir el estiramiento de la pantorrilla.'],x:'Doblar las rodillas para ayudarte o quitar los seguros de la prensa con las piernas sin control.'},
  'curl-femoral-sentado':{e:'Máquina de curl femoral sentado',p:['Siéntate con la espalda en el respaldo, el rodillo bajo los talones y el seguro sobre los muslos.','Dobla las rodillas jalando el rodillo hacia abajo y atrás, lo más que puedas.','Regresa despacio hasta casi estirar las piernas.'],x:'Levantar la cadera del asiento o dejar que el peso regrese de golpe.'},
  'abduccion-de-cadera-en-maquina':{e:'Máquina de abducción de cadera',p:['Siéntate con la espalda en el respaldo y los cojines por fuera de las rodillas.','Abre las piernas empujando los cojines hacia afuera lo más que puedas.','Aguanta 1 segundo y cierra despacio sin dejar que las placas choquen.'],x:'Echar el torso al frente o dejar que el peso cierre las piernas de golpe.'},
  'prensa-con-pies-bajos':{e:'Prensa de piernas',p:['Siéntate con la espalda pegada al respaldo y los pies en la parte baja de la plataforma, al ancho de la cadera.','Baja la plataforma doblando las rodillas hasta donde puedas sin despegar la cadera.','Empuja con todo el pie hasta casi estirar las piernas.'],x:'Levantar los talones o despegar la cadera del asiento al bajar.'},
  'sentadilla-hack':{e:'Máquina de sentadilla hack',p:['Apoya la espalda y los hombros en los cojines con los pies al ancho de los hombros en la plataforma.','Baja doblando las rodillas hasta que los muslos queden paralelos a la plataforma.','Sube empujando con todo el pie sin bloquear las rodillas arriba.'],x:'Dejar que las rodillas se vayan hacia adentro o despegar la cadera del respaldo.'},
  'press-frances-con-mancuernas':{e:'Banca plana y dos mancuernas',p:['Acuéstate en la banca con las mancuernas arriba del pecho y las palmas mirándose entre sí.','Dobla solo los codos y baja las mancuernas a los lados de la cabeza.','Estira los brazos hacia arriba sin mover los codos de lugar.'],x:'Abrir los codos hacia los lados o mover los hombros para ayudarte.'},
  'patada-de-triceps-con-mancuerna':{e:'Banca plana y una mancuerna',p:['Apoya una rodilla y la mano del mismo lado en la banca, con la espalda recta.','Pega el brazo de trabajo al costado con el codo doblado a 90°.','Estira el brazo hacia atrás hasta dejarlo recto, aguanta 1 segundo y regresa despacio.'],x:'Dejar caer el codo o balancear el brazo para subir la mancuerna.'},
  'sentadilla-isometrica-en-pared':{e:'Una pared',p:['Apoya la espalda completa en la pared con los pies un paso adelante.','Baja hasta que los muslos queden paralelos al piso y las rodillas a 90°.','Aguanta el tiempo indicado con las rodillas sobre los tobillos.'],x:'Dejar las rodillas por delante de las puntas o despegar la espalda de la pared.'},
  'isometrico-de-cuadriceps':{e:'Una toalla enrollada',p:['Siéntate con una pierna estirada y la toalla enrollada bajo esa rodilla.','Aprieta el muslo empujando la rodilla contra la toalla y jala las puntas hacia ti.','Aguanta 5 a 10 segundos, relaja y repite.'],x:'Levantar la cadera del piso en lugar de apretar el muslo.'},
  'sentadilla-sissy-asistida':{e:'Un poste o soporte fijo',p:['Sujétate del poste con una mano y súbete a las puntas de los pies.','Lleva las rodillas al frente mientras inclinas el cuerpo atrás en línea recta de rodillas a cabeza.','Baja solo lo que controles y sube empujando con los muslos.'],x:'Doblar la cadera y sentarte atrás: se convierte en sentadilla normal.'},
  'empuje-de-trineo':{e:'Trineo con discos',p:['Toma las barras altas del trineo con los brazos estirados y el cuerpo inclinado unos 45°.','Empuja con pasos cortos y potentes, llevando la rodilla al frente en cada paso.','Mantén la espalda recta y el abdomen firme todo el recorrido.'],x:'Encorvar la espalda o dar pasos largos y lentos.'},
  'cuerdas-de-batalla':{e:'Cuerdas de batalla',p:['Toma una cuerda en cada mano en media sentadilla con el pecho arriba.','Sube y baja los brazos alternando, rápido, para formar ondas en las cuerdas.','Mantén la postura baja y respira constante durante todo el intervalo.'],x:'Mover solo las manos sin usar los hombros o quedarte de pie con las piernas rectas.'},
  'aguante-en-l-l-sit':{e:'Paralelas bajas (parallettes)',p:['Apoya las manos en las paralelas con los brazos rectos y los hombros hacia abajo.','Levanta el cuerpo del piso y sube las piernas rectas hasta dejarlas paralelas al piso.','Aguanta el tiempo indicado sin doblar las rodillas.'],x:'Encoger los hombros hacia las orejas o doblar los codos.'},
  'aguante-isometrico-en-barra-arriba':{e:'Barra de dominadas',p:['Toma la barra con las palmas al frente, un poco más abierto que los hombros.','Sube hasta que la barbilla quede arriba de la barra (puedes saltar o usar un cajón).','Aguanta arriba con los codos pegados y las piernas juntas.'],x:'Dejar caer la barbilla bajo la barra o balancear las piernas.'},
  'dominada-excentrica-negativa':{e:'Barra de dominadas y un cajón',p:['Sube con ayuda del cajón hasta tener la barbilla arriba de la barra.','Quita los pies del cajón y baja lo más lento que puedas, de 3 a 5 segundos.','Al estirar los brazos, vuelve a subir con el cajón y repite.'],x:'Dejarte caer rápido en la segunda mitad de la bajada.'},
  'swing-con-kettlebell':{e:'Una kettlebell',p:['Con los pies al ancho de los hombros, lleva la kettlebell entre las piernas llevando la cadera atrás.','Extiende la cadera con fuerza y aprieta los glúteos para lanzarla al frente hasta el pecho.','Deja que baje sola y repite el movimiento de cadera.'],x:'Subir la kettlebell con los brazos o doblar la espalda en lugar de la cadera.'},
  'elevacion-de-piernas-colgado':{e:'Barra de dominadas',p:['Cuélgate de la barra con los brazos rectos y el cuerpo quieto.','Sube las piernas estiradas al frente hasta la altura de la cadera.','Bájalas despacio sin balancearte.'],x:'Usar impulso o balanceo para subir las piernas.'},
  'remo-invertido-en-trx':{e:'Correas de suspensión (TRX)',p:['Toma las manijas, inclínate atrás con los talones en el piso y el cuerpo recto.','Jala el pecho hacia las manos llevando los codos atrás.','Baja con control hasta estirar los brazos.'],x:'Dejar caer la cadera y perder la línea recta del cuerpo.'},
  'fondos-en-paralelas':{e:'Barras paralelas',p:['Sostente en las paralelas con los brazos rectos y las piernas un poco dobladas.','Baja doblando los codos hasta unos 90°, con el torso un poco inclinado al frente.','Empuja hasta estirar los brazos sin bloquear los codos de golpe.'],x:'Bajar demasiado y forzar el hombro, o encoger los hombros arriba.'},
  'step-up-al-cajon':{e:'Un cajón a la altura de la rodilla',p:['Apoya el pie completo de una pierna sobre el cajón.','Sube empujando con el talón de esa pierna, sin impulsarte con la de abajo.','Baja con control y repite antes de cambiar de pierna.'],x:'Empujar con la pierna de abajo o dejar que la rodilla se vaya hacia adentro.'},
  'aguante-en-hiperextension':{e:'Banco de hiperextensión a 45°',p:['Apoya la cadera en el cojín y asegura los tobillos bajo los rodillos.','Cruza los brazos en el pecho y sube hasta formar una línea recta de cabeza a talones.','Aguanta el tiempo indicado apretando glúteos y espalda baja.'],x:'Arquear la espalda de más pasando la línea recta.'},
  'encogimientos-en-smith':{e:'Máquina Smith',p:['De pie, toma la barra al frente de los muslos con los brazos rectos.','Sube los hombros hacia las orejas lo más alto que puedas.','Sostén un segundo arriba y baja despacio.'],x:'Girar los hombros en círculos o doblar los codos.'},
  'fondos-asistidos-en-maquina':{e:'Máquina asistida de dominadas y fondos',p:['Arrodíllate en el cojín de asistencia y toma las manijas de fondos.','Baja doblando los codos hasta unos 90° con el torso un poco al frente.','Empuja hasta estirar los brazos.'],x:'Abrir los codos hacia los lados o encoger los hombros.'},
  'remo-invertido-en-smith':{e:'Máquina Smith con la barra a la altura de la cadera',p:['Cuélgate bajo la barra con los talones en el piso y el cuerpo recto.','Jala el pecho hasta la barra llevando los codos atrás.','Baja con control hasta estirar los brazos.'],x:'Dejar caer la cadera o jalar con el cuello hacia la barra.'},
  'remo-unilateral-en-maquina':{e:'Máquina de remo unilateral',p:['Siéntate con el pecho en el cojín y toma una manija con una mano.','Jala hacia atrás llevando el codo detrás del cuerpo y junta la escápula.','Regresa con control y cambia de brazo al terminar la serie.'],x:'Girar el torso para ayudarte a jalar.'},
  'pantorrilla-en-smith':{e:'Máquina Smith y un escalón',p:['Coloca la barra sobre la espalda alta y la punta de los pies en el escalón.','Baja los talones hasta sentir el estiramiento de la pantorrilla.','Sube lo más alto que puedas y aguanta 1 segundo.'],x:'Rebotar abajo o doblar las rodillas para ayudarte.'},
  'peso-muerto-rumano-en-smith':{e:'Máquina Smith',p:['De pie con la barra frente a los muslos y las rodillas un poco flexionadas.','Lleva la cadera atrás con la espalda recta y baja la barra hasta debajo de las rodillas.','Sube empujando la cadera al frente y aprieta los glúteos.'],x:'Redondear la espalda o doblar mucho las rodillas como en una sentadilla.'},
  'press-banca-en-smith':{e:'Máquina Smith y banca plana',p:['Acuéstate con la barra sobre la mitad del pecho y los pies firmes en el piso.','Baja la barra al pecho con los codos a unos 45° del cuerpo.','Empuja hasta casi estirar los brazos.'],x:'Colocar la banca de modo que la barra baje al cuello o al abdomen.'},
  'pantorrilla-sentado-en-maquina':{e:'Máquina de pantorrilla sentado',p:['Siéntate con el cojín sobre los muslos y la punta de los pies en la barra.','Baja los talones hasta sentir el estiramiento.','Sube los talones lo más alto que puedas y aguanta 1 segundo.'],x:'Hacer el movimiento corto o rebotar abajo.'},
  'hip-thrust-en-maquina':{e:'Máquina de hip thrust',p:['Apoya la espalda alta en el respaldo, el cinturón sobre la cadera y los pies firmes.','Sube la cadera hasta que torso y muslos queden en línea recta.','Aprieta los glúteos arriba y baja con control.'],x:'Arquear la espalda baja en lugar de extender la cadera.'},
  'sentadilla-en-smith':{e:'Máquina Smith',p:['Coloca la barra sobre la espalda alta con los pies un poco al frente de la barra.','Baja hasta que los muslos queden paralelos al piso con el pecho arriba.','Sube empujando con todo el pie.'],x:'Levantar los talones o dejar que las rodillas se vayan hacia adentro.'},
  'crunch-en-maquina':{e:'Máquina de abdomen',p:['Siéntate y toma las manijas junto a los hombros.','Enrolla el torso al frente llevando las costillas hacia la cadera.','Regresa despacio sin dejar que el peso choque.'],x:'Jalar con los brazos en lugar de contraer el abdomen.'},
  'curl-predicador-en-maquina':{e:'Máquina de curl predicador',p:['Ajusta el asiento para que la parte de atrás de los brazos quede sobre el cojín.','Sube la manija doblando los codos hasta cerca de los hombros.','Baja despacio hasta casi estirar los brazos.'],x:'Despegar los brazos del cojín o bajar de golpe.'},
  'encogimientos-en-maquina':{e:'Máquina de encogimientos',p:['De pie, toma las manijas a los lados con los brazos rectos.','Sube los hombros hacia las orejas lo más alto que puedas.','Sostén un segundo arriba y baja despacio.'],x:'Doblar los codos o girar los hombros.'},
  'reverse-pec-deck':{e:'Máquina pec deck (posición inversa)',p:['Siéntate de frente a la máquina con el pecho en el cojín y toma las manijas.','Abre los brazos hacia atrás hasta la altura de los hombros con los codos un poco flexionados.','Junta las escápulas un segundo y regresa con control.'],x:'Usar impulso del torso o encoger los hombros.'},
  'elevacion-lateral-en-maquina':{e:'Máquina de elevación lateral',p:['Siéntate con los brazos contra los cojines laterales.','Sube los brazos hacia los lados hasta la altura de los hombros.','Baja despacio sin dejar que el peso choque.'],x:'Encoger los hombros hacia las orejas al subir.'},
  'press-de-hombro-en-maquina':{e:'Máquina de press de hombro',p:['Ajusta el asiento para que las manijas queden a la altura de los hombros.','Empuja hacia arriba hasta casi estirar los brazos.','Baja con control hasta la altura de las orejas.'],x:'Arquear la espalda baja para empujar más peso.'},
  'remo-en-maquina-con-apoyo-de-pecho':{e:'Máquina de remo con apoyo de pecho',p:['Siéntate con el pecho pegado al cojín y toma las manijas.','Jala llevando los codos atrás del cuerpo y junta las escápulas.','Regresa con control hasta estirar los brazos.'],x:'Despegar el pecho del cojín para jalar con impulso.'},
  'lagartijas':{e:'Ninguno',p:['Apoya las manos un poco más abiertas que los hombros y el cuerpo recto de cabeza a talones.','Baja el pecho hasta casi tocar el piso con los codos a unos 45° del cuerpo.','Empuja hasta estirar los brazos sin perder la línea del cuerpo.'],x:'Dejar caer la cadera o abrir los codos a 90°.'},
  'curl-nordico-asistido':{e:'Cojín, soporte para tobillos y una banda',p:['Arrodíllate con los tobillos sujetos y el cuerpo recto de rodillas a cabeza.','Inclínate al frente lo más lento que puedas, usando la banda como ayuda.','Cuando ya no puedas frenar, apóyate con las manos y regresa a la posición inicial.'],x:'Doblar la cadera en lugar de mantener el cuerpo recto.'},
  'curl-femoral-en-fitball':{e:'Una pelota de estabilidad (fitball)',p:['Acuéstate boca arriba con los talones sobre la pelota y los brazos en el piso.','Sube la cadera y jala la pelota hacia los glúteos doblando las rodillas.','Estira las piernas despacio sin bajar la cadera.'],x:'Dejar caer la cadera mientras doblas las rodillas.'},
  'caminata-lateral-con-banda':{e:'Una minibanda',p:['Coloca la banda arriba de las rodillas y baja a media sentadilla.','Da pasos cortos hacia un lado manteniendo la banda tensa.','Camina el mismo número de pasos hacia el otro lado.'],x:'Juntar los pies del todo o dejar que las rodillas se vayan hacia adentro.'},
  'pec-deck-inverso':{e:'Máquina pec deck (posición inversa)',p:['Siéntate de frente a la máquina con el pecho en el cojín y toma las manijas.','Abre los brazos hacia atrás hasta la altura de los hombros con los codos un poco flexionados.','Junta las escápulas un segundo y regresa con control.'],x:'Usar impulso del torso o encoger los hombros.'},
  'remo-en-maquina-con-pecho-apoyado':{e:'Máquina de remo con apoyo de pecho',p:['Siéntate con el pecho pegado al cojín y toma las manijas.','Jala llevando los codos atrás del cuerpo y junta las escápulas.','Regresa con control hasta estirar los brazos.'],x:'Despegar el pecho del cojín para jalar con impulso.'},
  'encogimientos-con-mancuernas':{e:'Dos mancuernas',p:['De pie con una mancuerna en cada mano a los lados, brazos rectos.','Sube los hombros hacia las orejas lo más alto que puedas.','Sostén un segundo arriba y baja despacio.'],x:'Girar los hombros en círculos o doblar los codos.'},
  'rotacion-externa-con-banda':{e:'Una banda elástica y un poste',p:['Ancla la banda a la altura del codo y pega el codo al costado, doblado a 90° (puedes poner una toalla enrollada).','Gira el antebrazo hacia afuera, alejándolo del abdomen, sin despegar el codo.','Regresa despacio a la posición inicial.'],x:'Despegar el codo del cuerpo o girar el torso para ayudarte.'},
  'dominada-asistida-en-maquina':{e:'Máquina asistida de dominadas',p:['Elige el peso de ayuda, arrodíllate en el cojín y toma las manijas de arriba.','Jala hasta que la barbilla quede arriba de las manos, llevando los codos hacia abajo y atrás.','Baja con control hasta estirar los brazos.'],x:'Encoger los hombros o bajar de golpe sin controlar.'},
  'prensa-de-piernas-unilateral':{e:'Prensa de piernas',p:['Siéntate con la espalda pegada al respaldo y un pie al centro de la plataforma; el otro pie descansa en el piso.','Baja la plataforma doblando la rodilla hasta unos 90° sin despegar la cadera.','Empuja con todo el pie hasta casi estirar la pierna y cambia de pierna al terminar la serie.'],x:'Dejar que la rodilla se vaya hacia adentro o despegar la cadera del asiento.'},
  'patada-de-gluteo-en-maquina':{e:'Máquina de patada de glúteo',p:['Párate en la plataforma con los antebrazos en el cojín y el pie de trabajo en el soporte.','Empuja la pierna hacia atrás y arriba hasta extender la cadera, con la rodilla un poco flexionada.','Aprieta el glúteo un segundo y regresa con control.'],x:'Arquear la espalda baja para subir más la pierna.'},
  'extension-de-triceps-en-maquina':{e:'Máquina de extensión de tríceps',p:['Ajusta el asiento para que la parte de atrás de los brazos quede sobre el cojín.','Estira los brazos empujando las manijas hacia abajo y al frente.','Regresa despacio sin despegar los brazos del cojín.'],x:'Mover los hombros o despegar los codos para empujar más peso.'},
  'zancadas-alternas':{e:'Ninguno',p:['De pie con los pies al ancho de la cadera y las manos en la cintura.','Da un paso largo al frente y baja hasta que ambas rodillas queden a 90°, con la rodilla de adelante sobre el tobillo.','Empuja con el talón de adelante para regresar y alterna la pierna en cada repetición.'],x:'Dejar que la rodilla de adelante pase de las puntas o se vaya hacia adentro.'},
  'press-pallof':{e:'Polea con agarre a la altura del pecho',p:['Párate de lado a la polea con los pies al ancho de los hombros y el agarre pegado al pecho con ambas manos.','Empuja el agarre al frente hasta estirar los brazos sin dejar que el cuerpo gire hacia la polea.','Regresa el agarre al pecho despacio y cambia de lado al terminar la serie.'],x:'Girar el torso o la cadera hacia la polea.'},
  'burpees':{e:'Ninguno',p:['De pie, baja en cuclillas y apoya las manos en el piso.','Lleva los pies atrás de un salto hasta quedar en plancha y baja el pecho cerca del piso.','Regresa los pies a las manos de un salto y salta hacia arriba con los brazos estirados.'],x:'Dejar caer la cadera en la plancha o aterrizar con las rodillas rígidas.'},
  'pallof-isometrico-sosten-al-frente':{e:'Polea con agarre a la altura del pecho',p:['Párate de lado a la polea con el agarre en ambas manos pegado al pecho.','Estira los brazos al frente y sostén el agarre ahí sin dejar que el cuerpo gire.','Aguanta el tiempo indicado respirando normal y cambia de lado.'],x:'Dejar que la polea te gire el torso o doblar los codos.'},
  'dominada-agarre-neutro':{e:'Barra con manijas paralelas',p:['Toma las manijas paralelas con las palmas mirándose entre sí y cuélgate con los brazos rectos.','Jala hasta que la barbilla pase las manos, llevando los codos hacia abajo y pegados al cuerpo.','Baja con control hasta estirar los brazos.'],x:'Balancear las piernas o subir solo a medias.'},
  'plancha-con-toque-de-hombro':{e:'Ninguno',p:['Colócate en plancha alta con las manos bajo los hombros y los pies un poco abiertos.','Levanta una mano y toca el hombro contrario sin mover la cadera.','Regresa la mano al piso y alterna de lado.'],x:'Girar la cadera o balancear el cuerpo al levantar la mano.'},
  'crunch-abdominal':{e:'Ninguno',p:['Acuéstate boca arriba con las rodillas dobladas y los pies apoyados.','Con las puntas de los dedos detrás de las orejas, despega hombros y espalda alta del piso.','Baja despacio sin dejar caer la cabeza.'],x:'Jalar el cuello con las manos en lugar de usar el abdomen.'},
  'hollow-hold':{e:'Ninguno',p:['Acuéstate boca arriba y pega la espalda baja al piso.','Despega hombros y piernas, con los brazos estirados arriba de la cabeza y las piernas juntas y rectas.','Aguanta el tiempo indicado sin que la espalda baja se despegue.'],x:'Arquear la espalda baja; si pasa, sube un poco las piernas.'},
  'plancha-lateral-con-pierna-elevada':{e:'Ninguno',p:['Apóyate de lado sobre el antebrazo con el codo bajo el hombro y el cuerpo en línea recta.','Sube la pierna de arriba recta hasta unos 45°.','Bájala con control sin dejar caer la cadera y cambia de lado.'],x:'Dejar caer la cadera hacia el piso.'},
  'plancha-alta-brazos-extendidos':{e:'Ninguno',p:['Apoya las manos bajo los hombros con los brazos rectos.','Estira las piernas y forma una línea recta de cabeza a talones.','Aguanta el tiempo indicado apretando abdomen y glúteos.'],x:'Dejar caer la cadera o subirla demasiado.'},
  'rotacion-externa-isometrica-en-pared':{e:'Una pared',p:['Párate de lado junto a la pared con el codo pegado al costado y doblado a 90°.','Empuja el dorso de la muñeca contra la pared, como si quisieras girar el antebrazo hacia afuera.','Aguanta el empuje el tiempo indicado sin despegar el codo y cambia de lado.'],x:'Despegar el codo del cuerpo o encoger el hombro.'},
  'superman':{e:'Ninguno',p:['Acuéstate boca abajo con los brazos estirados al frente.','Levanta a la vez brazos, pecho y piernas unos centímetros del piso.','Sostén un segundo arriba y baja con control.'],x:'Echar la cabeza hacia atrás en lugar de mirar al piso.'},
  'aguante-isometrico-en-lagartija-abajo':{e:'Ninguno',p:['Colócate en posición de lagartija con el cuerpo recto.','Baja hasta que el pecho quede a unos centímetros del piso con los codos a 45°.','Aguanta ahí el tiempo indicado sin dejar caer la cadera.'],x:'Abrir los codos a 90° o hundir la cadera.'},
  'lagartijas-diamante':{e:'Ninguno',p:['Junta las manos bajo el pecho formando un diamante con pulgares e índices.','Baja el pecho hacia las manos con los codos pegados a las costillas.','Empuja hasta estirar los brazos sin perder la línea del cuerpo.'],x:'Abrir los codos hacia los lados.'},
  'lagartijas-declinadas-pies-elevados':{e:'Una banca',p:['Apoya los pies sobre la banca y las manos en el piso, un poco más abiertas que los hombros.','Baja el pecho hacia el piso con el cuerpo recto.','Empuja hasta estirar los brazos.'],x:'Dejar caer la cadera o doblar la cintura.'},
  'presion-isometrica-de-palmas':{e:'Ninguno',p:['De pie, junta las palmas frente al pecho con los dedos hacia arriba.','Sube los codos a la altura del pecho y empuja una palma contra la otra con fuerza.','Aguanta el empuje el tiempo indicado respirando normal.'],x:'Bajar los codos o aguantar la respiración.'},
  'lagartijas-inclinadas-manos-elevadas':{e:'Una banca',p:['Apoya las manos en la orilla de la banca y estira las piernas atrás.','Baja el pecho hacia la banca con el cuerpo en línea recta y los codos a 45°.','Empuja hasta estirar los brazos.'],x:'Dejar caer la cadera o encorvar la espalda.'},
  'aguante-de-pantorrilla-en-punta':{e:'Un poste para equilibrio',p:['Párate derecho y apoya una mano en el poste solo para equilibrio.','Sube a la punta de los pies lo más alto que puedas con las piernas rectas.','Aguanta arriba el tiempo indicado sin bajar los talones.'],x:'Doblar las rodillas o cargar el peso en el poste.'},
  'puente-isometrico-con-talones-elevados':{e:'Una banca',p:['Acuéstate boca arriba con los talones sobre la banca y las rodillas un poco dobladas.','Sube la cadera hasta formar una línea recta de hombros a rodillas.','Aguanta arriba el tiempo indicado apretando glúteos y femorales.'],x:'Arquear la espalda baja en lugar de subir con la cadera.'},
  'puente-de-gluteo-isometrico':{e:'Ninguno',p:['Acuéstate boca arriba con las rodillas dobladas y los pies al ancho de la cadera.','Sube la cadera hasta que rodillas, cadera y hombros queden en línea.','Aguanta arriba el tiempo indicado apretando los glúteos.'],x:'Arquear la espalda baja o abrir las rodillas.'},
  'aguante-de-zancada-split-squat-isometrico':{e:'Ninguno',p:['Da un paso largo y baja hasta que ambas rodillas queden a 90°.','Deja la rodilla de atrás a unos centímetros del piso y el torso derecho.','Aguanta el tiempo indicado y cambia de pierna.'],x:'Dejar que la rodilla de adelante se vaya hacia adentro o inclinar el torso.'},
  'sentadilla-con-salto':{e:'Ninguno',p:['Baja en sentadilla con los pies al ancho de los hombros.','Salta hacia arriba con fuerza estirando todo el cuerpo.','Aterriza suave en la punta de los pies y baja directo a la siguiente sentadilla.'],x:'Aterrizar con las rodillas rígidas o hacia adentro.'},
  'superman-isometrico':{e:'Ninguno',p:['Acuéstate boca abajo con los brazos estirados al frente.','Levanta brazos, pecho y piernas unos centímetros del piso.','Aguanta arriba el tiempo indicado mirando al piso.'],x:'Echar la cabeza hacia atrás o subir de más arqueando la espalda.'},
  'salto-de-cuerda':{e:'Una cuerda para saltar',p:['Toma la cuerda con los codos pegados al cuerpo y las manos a la altura de la cadera.','Gira la cuerda con las muñecas y salta apenas lo necesario para que pase bajo los pies.','Cae suave en la punta de los pies con las rodillas un poco dobladas y mantén un ritmo constante.'],x:'Girar la cuerda con los brazos completos o saltar demasiado alto.'},
  'jumping-jacks':{e:'Ninguno',p:['De pie con los pies juntos y los brazos a los lados.','Salta abriendo las piernas más que los hombros mientras subes los brazos por arriba de la cabeza.','Salta de nuevo para regresar a la posición inicial y repite con ritmo.'],x:'Caer con los talones y las rodillas rígidas.'},
  'tijeras-flutter-kicks':{e:'Ninguno',p:['Acuéstate boca arriba con las manos bajo la cadera y la espalda baja pegada al piso.','Levanta las piernas rectas unos centímetros del piso.','Sube y baja las piernas alternando, con movimientos cortos y rápidos.'],x:'Despegar la espalda baja del piso; si pasa, sube un poco más las piernas.'},
  'crunch-bicicleta':{e:'Ninguno',p:['Acuéstate boca arriba con las puntas de los dedos detrás de las orejas y despega los hombros del piso.','Lleva un codo hacia la rodilla contraria mientras estiras la otra pierna.','Cambia de lado girando el torso, como si pedalearas.'],x:'Mover solo los codos sin girar el torso o jalar el cuello.'},
  'elevacion-de-rodillas-en-banco':{e:'Una banca',p:['Siéntate en la orilla de la banca, inclínate un poco atrás y sujétate de los lados.','Sube las rodillas hacia el pecho contrayendo el abdomen.','Baja las piernas despacio sin tocar el piso y repite.'],x:'Echar el torso atrás de golpe para impulsar las piernas.'},
  'fondos-en-banco':{e:'Una banca',p:['Apoya las dos manos en la orilla de la banca detrás de la cadera, con los dedos hacia el frente.','Estira las piernas al frente y baja doblando los codos hasta unos 90°, con la espalda cerca de la banca.','Empuja hasta estirar los brazos sin bloquear los codos.'],x:'Abrir los codos hacia los lados o alejar la cadera de la banca.'},
  'bird-dog':{e:'Ninguno',p:['Colócate en cuatro puntos con las manos bajo los hombros, las rodillas bajo la cadera y la espalda recta.','Estira un brazo al frente y la pierna contraria atrás hasta dejarlos paralelos al piso.','Sostén un segundo, regresa con control y cambia de lado.'],x:'Girar la cadera o arquear la espalda al subir la pierna.'},
  'elevacion-de-talones-de-pie':{e:'Máquina de pantorrilla de pie',p:['Apoya la punta de los pies en el borde.','Baja el talón hasta sentir el estiramiento.','Sube lo más alto que puedas y aguanta 1 segundo.'],x:'Rebotar abajo y hacer el movimiento corto.'}
};
// ── Videos en bucle del estilo nuevo (img/ejercicios/<nombre>.webm y .mp4, 4:5, sin audio).
//    Solo se piden los que están en esta lista; los demás ejercicios usan su imagen fija.
const EJ_VIDEOS = new Set(['sentadilla-goblet','peso-muerto-rumano-con-mancuernas','sentadilla-libre']);
function videoEjHTML(ej){
  const n=slugEj(ej&&ej.nm); if(!EJ_VIDEOS.has(n)) return '';
  if(matchMedia('(prefers-reduced-motion: reduce)').matches) return '';
  // Va encima de la imagen fija: aparece al empezar a reproducirse y, si falla, se quita y queda la imagen.
  return `<video class="en-vid" muted loop playsinline autoplay preload="auto" aria-hidden="true" disablepictureinpicture onplaying="this.classList.add('on')">
    <source src="${IMG_BASE}ejercicios/${n}.webm" type="video/webm">
    <source src="${IMG_BASE}ejercicios/${n}.mp4" type="video/mp4" onerror="this.parentNode.remove()"></video>`;
}
const EN_DIAS_CORTO=['LUN','MAR','MIÉ','JUE','VIE','SÁB','DOM'];
const EN_DIAS=['lunes','martes','miércoles','jueves','viernes','sábado','domingo'];
const EN_MESES=['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'];

function enEspecial(e){ return esEjCardio(e)||esEjRondas(e)||esEjMovilidad(e)||esEjIsometrico(e); }
function enListaY(a){ return a.length<2?a.join(''):a.slice(0,-1).join(', ')+' y '+a[a.length-1]; }
function enKg(kg){ return kgToDisplay(kg)+' '+unidadPeso; }

// ── Ficha del ejercicio: músculos (el primero es el principal), equipo, pasos y error común ──
function fichaEj(ej){
  const kb=kbBuscar(ej.nm);
  const ms=String(ej.ms||(kb&&kb.ms)||'').split(/\s*[·,\/]\s*|\s+y\s+/).map(x=>sc(x.trim())).filter(Boolean);
  const d=EJ_PASOS[slugEj(ej.nm)]||(kb&&EJ_PASOS[slugEj(kb.nm)])||null;
  return {ms:[...new Set(ms)], eq:(d&&d.e)||(kb&&KB_ZONAS[kb.z])||'', pasos:d?d.p:null, evita:d?d.x:null};
}

// ── Registros anteriores de un ejercicio y peso sugerido para hoy ──
function histEj(s,nm){
  const out=[];
  comoArray(s.logs&&s.logs.sesiones).forEach(x=>comoArray(x&&x.detalle).forEach(d=>{ if(d&&d.n===nm&&!d.alt) out.push(d); }));
  return out;
}
// Si completó todas las series la última vez sube un escalón; si no, repite el peso.
// Sin historial: % de su 1RM estimado si el plan lo pide, o el peso escrito en el plan.
function cargaSugerida(s,ej){
  if(esEjCardio(ej)||esEjRondas(ej)||esEjMovilidad(ej)) return null;
  const u=histEj(s,ej.nm).filter(d=>+d.kg>0).pop();
  if(u){
    const kg=+u.kg, compl=(+u.s||0)>=(+u.p||1);
    if(!compl||esEjIsometrico(ej)) return {kg, ult:kg, sube:0, sr:u.sr};
    const nk=pqRedondear(kg+(kg>=20?2.5:kg>=5?1:0.5));
    return {kg:nk, ult:kg, sube:Math.round((nk-kg)*10)/10, sr:u.sr};
  }
  if(esEjIsometrico(ej)) return null;
  const pct=pct1RM(ej.peso), rm=s.logs&&s.logs.rm&&s.logs.rm[prKey(ej.nm)];
  if(pct&&rm) return {kg:pqRedondear(rm*pctPorReps(repsObjetivo(ej.reps),ej.rir!=null?+ej.rir:2)), ult:null, sube:null};
  const fijo=pqParseKg(ej.peso);
  return fijo?{kg:fijo, ult:null, sube:null}:null;
}
function minutosDia(d){
  const seg=(d.ejercicios||[]).reduce((a,e)=>{ const n=parseInt(e.series)||3; const r=segundosDescanso(e.descanso)||75; return a+n*(45+r); },0);
  return Math.max(10,Math.round(seg/60/5)*5);
}

// ═════════════ RUTINA ═════════════
let rutDia=null;
function renderRutinaTab(){
  const s=activeSocio; if(!s) return;
  normalizarEmomRutina(s.rutina);
  actualizarHoy();
  const cont=document.getElementById('dsec-rutina');
  const fechas=fechasSemana(), sem=sesionesSemana(s);
  if(!DIAS_ORDER.includes(rutDia)) rutDia=HOY_KEY;
  const b=pqBloque(s), semA=Math.max(1,Math.min(pqSemanaActual(s),b.semanas));
  const pend=s.status==='pendiente'
    ? `<div class="pend-banner">${ico('clock')}<div>Tu plan está pendiente de revisión por tu entrenador. Puedes consultarlo, pero podría tener ajustes.</div></div>` : '';
  const weeks=Array.from({length:b.semanas},(_,i)=>`<i class="${i<semA-1?'done':i===semA-1?'now':''}"></i>`).join('');
  const strip=DIAS_ORDER.map((k,i)=>{
    const d=s.rutina[k], rest=!d||!d.ejercicios||!d.ejercicios.length, hoy=k===HOY_KEY;
    const est=sem[i]?', entrenado':rest?', descanso':'';
    return `<button type="button" class="en-dia${sem[i]?' done':''}${rest&&!sem[i]?' rest':''}${hoy?' hoy':''}" aria-pressed="${k===rutDia}" onclick="rutElegir('${k}')" aria-label="${EN_DIAS[i]} ${fechas[i]}${est}${hoy?', hoy':''}">
      <small>${EN_DIAS_CORTO[i]}</small><b class="num">${fechas[i]}</b><span class="en-st">${sem[i]?ico('check'):rest?'':'<span class="en-dot"></span>'}</span></button>`;
  }).join('');
  cont.innerHTML=`
    ${appHead('Mi plan',esc(sc(s.objetivo||'Entrenar'))+' · '+s.dias+' días por semana')}
    ${pend}
    ${pqPlanChip(s)}
    ${casaChipSocio(s)}
    <div class="en-block">
      <div class="en-block-t"><b>Semana ${semA} de ${b.semanas}</b><span>Bloque ${b.n}${s.asignado?' · '+esc(tc(String(s.asignado)).split(' ')[0]):''}</span></div>
      <div class="en-weeks" style="grid-template-columns:repeat(${b.semanas},1fr)" aria-hidden="true">${weeks}</div>
    </div>
    <div class="en-strip" role="group" aria-label="Días de esta semana">${strip}</div>
    <div id="en-dia">${rutDiaHTML(s)}</div>
    <div class="en-tip">${ico('spark')}<span>Toca un ejercicio para ver cómo se hace. El peso sugerido sale de tu última sesión: si completaste todas las series, subes un poco; si no, repites el peso.</span></div>`;
}
function rutElegir(k){
  rutDia=k; const s=activeSocio; if(!s) return;
  document.querySelectorAll('#dsec-rutina .en-dia').forEach((b,i)=>b.setAttribute('aria-pressed',DIAS_ORDER[i]===k));
  document.getElementById('en-dia').innerHTML=rutDiaHTML(s);
}
function rutDiaHTML(s){
  const k=rutDia, i=DIAS_ORDER.indexOf(k), d=s.rutina[k], sem=sesionesSemana(s), fechas=fechasSemana();
  const hoyI=DIAS_ORDER.indexOf(HOY_KEY), esHoy=k===HOY_KEY, hecho=sem[i];
  if(!d||!d.ejercicios||!d.ejercicios.length){
    return `<div class="en-card"><div class="en-rest"><h3>Descanso</h3><p>El músculo crece hoy. Camina 20 a 30 minutos, estira y duerme 7 u 8 horas.</p></div></div>`;
  }
  const ejs=d.ejercicios;
  const grupos=[...new Set(ejs.map(e=>sc(String(e.ms||'').split(/[·,]/)[0].trim())).filter(Boolean))].slice(0,3);
  const estado=hecho?'Hecho':esHoy?'Hoy':i<hoyI?'Pendiente':'Próximo';
  const enCurso=esHoy&&sesionTemp&&sesionTemp.diaKey===k&&Object.keys(sesionTemp.ej||{}).length;
  const filas=ejs.map((e,j)=>{
    const c=cargaSugerida(s,e), r=rxTexto(e,s);
    const sub=r.sr+(c&&c.ult!=null?' · última '+enKg(c.ult):'')+(!c&&!enEspecial(e)&&!histEj(s,e.nm).length?' · nuevo para ti':'');
    const der=c?`<b class="num">${enKg(c.kg)}</b>${c.sube>0?`<small>+${kgToDisplay(c.sube)}</small>`:c.ult!=null?'<small class="igual">igual</small>':'<small class="igual">sugerido</small>'}`:'';
    return `<button type="button" class="en-ej" onclick="verComoDia('${k}',${j})" aria-label="${esc(e.nm)}: ver cómo se hace">
      <span class="en-th">${pic(basesEjercicioMini(e),'dumbbell','thumb')}</span>
      <span class="en-ej-t"><b>${esc(e.nm)}</b><span>${esc(sub)}</span></span>
      <span class="en-carga">${der}</span></button>`;
  }).join('');
  const cta=esHoy
    ? `<button type="button" class="en-btn en-btn-p" onclick="iniciarSesion('${k}')">${ico('play')}${enCurso?'Continuar sesión':hecho?'Registrar otra sesión':'Empezar sesión'}</button>`
    : `<button type="button" class="en-btn en-btn-g" onclick="openDay('${k}')">${ico('info')}Ver detalle del día</button>`;
  return `<article class="en-card">
    <div class="en-hero">
      <div class="en-k">${ico(hecho?'check':'calendar')}${estado} · ${EN_DIAS[i]} ${fechas[i]}</div>
      <h3>${esc(sc(d.tipo))}</h3>
      <div class="en-meta"><span>${ico('dumbbell')}${ejs.length} ejercicios</span><span>${ico('clock')}~${minutosDia(d)} min</span>${grupos.length?`<span>${ico('target')}${esc(enListaY(grupos))}</span>`:''}</div>
    </div>
    <div class="en-ejs">${filas}</div>
    <div class="en-cta">${cta}</div>
  </article>`;
}
// ═════════════ DETALLE DEL DÍA ═════════════
// Lo que la tarjeta de "Mi plan" no dice: qué músculos trabajas, qué equipo necesitas, cómo se hacen los
// métodos del día y, si ya entrenaste, lo que hiciste en cada ejercicio. Un solo botón: la sesión.
const DD_ZONA={rack:'Rack',banco:'Banco',cardio:'Cardio',corporal:'Peso corporal',disco:'Discos',funcional:'Funcional',liga:'Ligas',mancuernas:'Mancuernas',maquina:'Máquinas',polea:'Poleas',trx:'TRX'};
let ddK=null;
function openDay(key){
  const s=activeSocio; if(!s||!s.rutina[key]) return;
  ddK=key; activeRutinaKey=key; normalizarEmomRutina(s.rutina);
  document.getElementById('dd').innerHTML=ddHTML(s,key);
  go('s-det'); window.scrollTo(0,0);
}
function ddVolver(){ go('s-dash'); refreshDash(); dashTab('rutina'); }
function ddFecha(i){ const d=inicioSemana(new Date()); d.setDate(d.getDate()+i); return d; }
function ddHTML(s,k){
  const i=DIAS_ORDER.indexOf(k), d=s.rutina[k], ejs=(d&&d.ejercicios)||[], esHoy=k===HOY_KEY;
  const f=ddFecha(i), fISO=fechaISO(f), reg=(s.logs&&s.logs.sesiones||[]).filter(x=>x&&x.fecha===fISO).pop();
  const enCurso=esHoy&&sesionTemp&&sesionTemp.diaKey===k&&Object.keys(sesionTemp.ej||{}).length;
  const cuando=EN_DIAS[i].charAt(0).toUpperCase()+EN_DIAS[i].slice(1)+' '+f.getDate()+(esHoy?' · hoy':'');
  const top=`<div class="dd-top"><button type="button" class="en-icon-btn dd-back" onclick="ddVolver()" aria-label="Volver a Mi plan">${ico('chevl')}</button></div>`;
  if(!ejs.length) return `${top}<section class="dd-hero dd-hero-rest"><div class="dd-hero-tx"><p>${esc(cuando)}</p><h1>Descanso</h1></div></section>
    <div class="dd-body"><p class="dd-lead">El músculo crece hoy. Camina 20 a 30 minutos, estira y duerme 7 u 8 horas.</p></div>`;
  const series=ejs.reduce((a,e)=>a+(parseInt(e.series)||0),0);
  // músculos: el principal de cada ejercicio cuenta 1 y los secundarios ½
  const pesoM={};
  ejs.forEach(e=>String(e.ms||'').split(/[·,/]/).map(x=>sc(x.trim())).filter(Boolean).forEach((m,j)=>{ pesoM[m]=(pesoM[m]||0)+(j?.5:1); }));
  const musc=Object.entries(pesoM).sort((a,b)=>b[1]-a[1]).slice(0,6), mMax=musc.length?musc[0][1]:1;
  const zonas=[...new Set(ejs.map(e=>{ const kb=kbBuscar(e.nm); return kb&&DD_ZONA[kb.z]; }).filter(Boolean))];
  const mets=[...new Map(ejs.filter(e=>e.metodo&&KB_METODOS[e.metodo.id]).map(e=>[e.metodo.id,KB_METODOS[e.metodo.id]])).values()];
  const hechoDe=nm=>reg&&(reg.detalle||[]).find(x=>x.n===nm);
  const filas=ejs.map((e,j)=>{
    const r=rxTexto(e,s), c=cargaSugerida(s,e), h=hechoDe(e.nm), dp=descansoPlan(e.descanso);
    const des=dp.nada?'':dp.libre?'descanso libre'+(dp.meta?' ~'+(dp.meta<120?dp.meta+' s':Math.round(dp.meta/6)/10+' min'):''):'descanso '+(dp.seg<120?dp.seg+' s':Math.round(dp.seg/6)/10+' min');
    const sub=[limpiarReps(r.sr).replace(/\s*[—–]\s*/g,' '), des, e.metodo&&KB_METODOS[e.metodo.id]?e.metodo.nm:''].filter(Boolean).join(' · ');
    const der=h?`<b class="num">${h.kg?enKg(h.kg):h.seg?h.seg+' s':h.fc?h.fc+' lpm':ico('check')}</b><small>${h.s||0} de ${h.p||parseInt(e.series)||0}</small>`
      : c?`<b class="num">${enKg(c.kg)}</b><small>${c.sube>0?'+'+kgToDisplay(c.sube):'sugerido'}</small>`:'';
    const g=e.grupo?String(e.grupo):'', gSig=ejs[j+1]&&ejs[j+1].grupo&&String(ejs[j+1].grupo).charAt(0)===g.charAt(0);
    return `<li class="dd-ej${h?' hecho':''}${g&&gSig?' liga':''}"><button type="button" onclick="verComoDia('${k}',${j})" aria-label="${esc(e.nm)}: ver cómo se hace">
      <span class="dd-n num" aria-hidden="true">${esc(g||String(j+1))}</span>
      <span class="en-th">${pic(basesEjercicioMini(e),'dumbbell','thumb')}</span>
      <span class="dd-ej-t"><b>${esc(e.nm)}</b><span>${esc(sub)}</span></span>
      <span class="en-carga">${der}</span></button></li>`;
  }).join('');
  const cta=esHoy?`<div class="dd-cta"><button type="button" class="en-btn en-btn-p" onclick="iniciarSesion('${k}')">${ico('play')}${enCurso?'Continuar sesión':reg?'Registrar otra sesión':'Empezar sesión'}</button></div>`:'';
  return `${top}
  <section class="dd-hero">${pic(basesSesion(d.tipo),iconoTipo(d.tipo),'fill')}
    <div class="dd-hero-tx"><p>${reg?ico('check')+'Hecho · ':''}${esc(cuando)}</p><h1>${esc(sc(d.tipo))}</h1></div></section>
  <div class="dd-body">
    <p class="dd-facts num"><span><b>~${minutosDia(d)}</b> min</span><span><b>${ejs.length}</b> ejercicios</span><span><b>${series}</b> series</span>${reg&&reg.volumen?`<span><b>${Math.round(reg.volumen).toLocaleString('es-MX')}</b> kg movidos</span>`:''}</p>
    ${musc.length?`<section class="dd-sec"><h2>Qué trabajas</h2><p class="dd-chips">${musc.map(([m,v])=>`<span class="${v>=mMax*.75?'p':''}">${esc(m)}</span>`).join('')}</p></section>`:''}
    ${zonas.length?`<section class="dd-sec"><h2>Necesitas</h2><p class="dd-chips">${zonas.map(z=>`<span>${esc(z)}</span>`).join('')}</p></section>`:''}
    ${mets.length?`<section class="dd-sec"><h2>${mets.length===1?'Método de hoy':'Métodos de hoy'}</h2>${mets.map(M=>`<div class="dd-met"><b>${esc(M.nm)}</b><p>${esc(sinEmoji(M.como))}</p></div>`).join('')}</section>`:''}
    <section class="dd-sec"><h2>${reg&&ejs.some(e=>hechoDe(e.nm))?'Lo que hiciste':'Ejercicios'}</h2><ol class="dd-ejs">${filas}</ol>
      <p class="dd-nota">Toca un ejercicio para ver cómo se hace.${esHoy?'':' Este día toca el '+EN_DIAS[i]+'.'}</p></section>
  </div>${cta}`;
}
function verComoDia(k,j){ const s=activeSocio; const e=s&&s.rutina[k]&&s.rutina[k].ejercicios[j]; if(e) abrirFicha(e); }

// ═════════════ FICHA "CÓMO SE HACE" ═════════════
function abrirFicha(ej){
  const dlg=document.getElementById('en-ficha'); if(!dlg||!ej) return;
  const f=fichaEj(ej);
  dlg.innerHTML=`<div class="en-f-in">
    <div class="en-f-top"><span class="en-grab" aria-hidden="true"></span><button type="button" class="en-btn-sm" onclick="cerrarFicha()">Cerrar</button></div>
    <div class="en-f-fig">${pic(basesEjercicio(ej),'dumbbell','thumb')}${videoEjHTML(ej)}</div>
    <h3 id="en-f-t">${esc(ej.nm)}</h3>
    ${f.eq?`<div class="en-f-eq">${ico('dumbbell')}<span>${esc(f.eq)}</span></div>`:''}
    ${f.ms.length?`<div class="en-f-sec"><b>Músculos que trabaja</b><div class="en-musc">${f.ms.map((m,i)=>`<span class="${i?'':'p'}"><i></i>${esc(m)}${i?'':' · principal'}</span>`).join('')}</div></div>`:''}
    ${f.pasos?`<div class="en-f-sec"><b>Cómo se hace</b><ol class="en-pasos">${f.pasos.map(p=>`<li>${esc(p)}</li>`).join('')}</ol></div>`:''}
    ${ej.tip?`<div class="en-f-sec"><b>Nota de tu entrenador</b><p>${esc(sinEmoji(ej.tip))}</p></div>`:''}
    ${f.evita?`<div class="en-evita">${ico('info')}<span><b>Evita:</b> ${esc(f.evita)}</span></div>`:''}
    <button type="button" class="en-btn en-btn-p" onclick="cerrarFicha()">Entendido</button></div>`;
  dlg.setAttribute('aria-labelledby','en-f-t');
  dlg.classList.remove('cerrando');
  if(!dlg.open) dlg.showModal();
  dlg.scrollTop=0;
}
function cerrarFicha(){
  const d=document.getElementById('en-ficha'); if(!d||!d.open) return;
  d.querySelectorAll('video').forEach(v=>v.pause());
  if(matchMedia('(prefers-reduced-motion: reduce)').matches){ d.close(); return; }
  d.classList.add('cerrando');
  setTimeout(()=>{ d.close(); d.classList.remove('cerrando'); },200);
}

// ═════════════ SESIÓN EN CURSO ═════════════
let sesUI={k:null, cur:0, alts:false, borr:{}, aviso:false};
let sesReloj=null;
function iniciarSesion(k){
  const s=activeSocio; if(!s) return;
  const d=s.rutina[k]; if(!d||!d.ejercicios||!d.ejercicios.length) return;
  activeRutinaKey=k;
  normalizarEmomRutina(s.rutina);
  if(!sesionTemp||sesionTemp.diaKey!==k) sesionTemp={diaKey:k, ej:{}};
  if(!sesionTemp.t0) sesionTemp.t0=Date.now();
  if(sesUI.k!==k) sesUI={k, cur:0, alts:false, borr:{}, aviso:false};
  go('s-ses');
  renderSes();
  clearInterval(sesReloj);
  sesReloj=setInterval(()=>{ const r=document.getElementById('en-reloj'); if(!r){ clearInterval(sesReloj); return; } r.textContent=enMMSS((Date.now()-(sesionTemp&&sesionTemp.t0||Date.now()))/1000); },1000);
}
function enMMSS(seg){ seg=Math.max(0,Math.floor(seg)); const h=Math.floor(seg/3600), m=Math.floor(seg%3600/60), x=seg%60; return (h?h+':'+String(m).padStart(2,'0'):String(m).padStart(2,'0'))+':'+String(x).padStart(2,'0'); }
function sesEjs(){ const s=activeSocio; return (s&&s.rutina[sesUI.k]&&s.rutina[sesUI.k].ejercicios)||[]; }
function sesReg(i){ if(!sesionTemp.ej[i]) sesionTemp.ej[i]={done:false,sets:[]}; return sesionTemp.ej[i]; }
function sesHechas(i){ const r=sesionTemp&&sesionTemp.ej[i]; if(!r) return 0; return (r.sets||[]).filter(x=>x&&(x.ok||x.seg>0||x.fc>0)).length || (r.done?1e9:0); }
function sesAvance(i,e){ const n=parseInt(e.series)||1; return Math.min(1,sesHechas(i)/n); }
// Valores en pantalla de cada serie (todavía sin marcar): peso sugerido y reps del plan
function sesBorrador(i,e,c){
  if(!sesUI.borr[i]){
    const n=parseInt(e.series)||3;
    sesUI.borr[i]=Array.from({length:n},(_,j)=>({kg:c?c.kg:0, r:parseInt(repsDeSerie(e,j))||0}));
  }
  return sesUI.borr[i];
}
function renderSes(){
  const s=activeSocio, cont=document.getElementById('en-ses'); if(!s||!cont||!sesionTemp) return;
  const ejs=sesEjs(), i=Math.min(sesUI.cur,ejs.length-1), e0=ejs[i]; if(!e0) return;
  const alt=ejEjecutado(e0,i), e=alt?Object.assign({},e0,{nm:alt.nm,ms:alt.ms||e0.ms,tip:alt.nota||e0.tip}):e0;
  const f=fichaEj(e), c=cargaSugerida(s,alt?e:e0), d=s.rutina[sesUI.k];
  const especial=enEspecial(e0), reg=sesReg(i);
  if(e0.metodo&&e0.metodo.id==='emom') normalizarEmom(e0);
  const esEmom=!!(e0.metodo&&e0.metodo.id==='emom'), w=segTrabajo(e0);
  const M=e0.metodo&&KB_METODOS[e0.metodo.id]&&(!especial||esEmom)?KB_METODOS[e0.metodo.id]:null;
  const des=segundosDescanso(e0.descanso), dPlan=descansoPlan(e0.descanso);
  const btnTiempo=esEmom?`<button type="button" class="en-btn en-btn-l" onclick="sesEmom(${i})">${ico('timer')}Iniciar EMOM ${esc(e0.series)} min</button>`
    : w?`<button type="button" class="en-btn en-btn-l" onclick="sesTrabajo(${i})">${ico('timer')}Temporizador ${w<120?w+' s':Math.round(w/6)/10+' min'}</button>`:'';
  const prog=ejs.map((x,j)=>{ const p=sesAvance(j,x); return `<i class="${p>=1?'done':''}${j===i?' cur':''}"><b style="transform:scaleX(${p})"></b></i>`; }).join('');
  let series='';
  if(especial){
    const r=rxTexto(e0,s), n=sesHechas(i);
    series=`<div class="en-esp"><p>${esc(r.sr)}${r.carga?' · '+esc(r.carga):''}</p>
      ${btnTiempo}
      <button type="button" class="en-btn en-btn-p" onclick="openModal(${i})">${ico('check')}${n?'Ver o cambiar registro':'Registrar'}</button></div>`;
  } else {
    const B=sesBorrador(i,e0,c), prev=c&&c.sr;
    series=`${btnTiempo?`<div class="en-tm-row">${btnTiempo}</div>`:''}<div class="en-sets" role="table" aria-label="Series de ${esc(e.nm)}">
      <div class="en-set-h" role="row"><span role="columnheader">#</span><span role="columnheader">Anterior</span>
        <span role="columnheader"><button type="button" class="en-unit" onclick="sesUnidad()" aria-label="Cambiar a ${unidadPeso==='kg'?'libras':'kilos'}">${unidadPeso.toUpperCase()}</button></span>
        <span role="columnheader">REPS</span><span role="columnheader"><span class="sr-only">Hecha</span></span></div>
      ${B.map((b,j)=>{ const st=reg.sets[j], ok=!!(st&&st.ok), kg=ok?st.kg:b.kg, rr=ok?(st.r||b.r):b.r;
        const ant=prev&&prev[j]?`${kgToDisplay(prev[j][0])} × ${prev[j][1]||'—'}`:(c&&c.ult!=null?`${kgToDisplay(c.ult)}`:'—');
        return `<div class="en-set${ok?' hecha':''}" role="row" data-j="${j}">
        <span class="en-n num" role="cell">${j+1}</span>
        <span class="en-prev num" role="cell">${ant}</span>
        <span role="cell"><input type="number" inputmode="decimal" step="0.5" min="0" value="${kg?kgToDisplay(kg):''}" placeholder="0" aria-label="${unidadPeso==='kg'?'Kilos':'Libras'} serie ${j+1}" oninput="sesValor(${i},${j},'kg',this.value)"></span>
        <span role="cell"><input type="number" inputmode="numeric" min="0" value="${rr||''}" placeholder="0" aria-label="Repeticiones serie ${j+1}" oninput="sesValor(${i},${j},'r',this.value)"></span>
        <span role="cell"><button type="button" class="en-ok" aria-pressed="${ok}" aria-label="Serie ${j+1} hecha" onclick="sesMarcar(${i},${j})">${ico('check')}</button></span></div>`; }).join('')}
    </div>`;
  }
  const alts=e0.alternativas||[], altSel=reg.alt;
  const sig=ejs[i+1];
  cont.innerHTML=`
    <div class="en-s-top">
      <button type="button" class="en-icon-btn" aria-label="Salir de la sesión (se guarda lo que llevas)" onclick="sesSalir()">${ico('chevl')}</button>
      <div class="en-s-t"><b>${esc(sc(d.tipo))}</b><span>${ico('clock')}<span class="num" id="en-reloj">${enMMSS((Date.now()-sesionTemp.t0)/1000)}</span></span></div>
      <button type="button" class="en-icon-btn" aria-label="Cronómetro y temporizador" onclick="tmMenu()">${ico('timer')}</button>
      <button type="button" class="en-btn-sm" onclick="sesTerminar()">Terminar</button>
    </div>
    <div class="en-prog" aria-hidden="true">${prog}</div>
    <div class="en-ex">
      <button type="button" class="en-media" onclick="abrirFicha(sesEjActual())" aria-label="Ver cómo se hace ${esc(e.nm)}">
        ${pic(basesEjercicio(e),'dumbbell','thumb')}${videoEjHTML(e)}
        ${!especial&&!histEj(s,e0.nm).length?'<span class="en-new">Primera vez</span>':''}
        <span class="en-media-cta">${ico('play')}Cómo se hace</span>
      </button>
      <h3>${esc(e.nm)}</h3>
      <div class="en-meta"><span>Ejercicio ${i+1} de ${ejs.length}</span>${esEmom?`<span>EMOM ${esc(e0.series)} min · ${esc(e0.reps)}</span>`:!especial?`<span>${esc(e0.series)} × ${esc(limpiarRepsTxt(e0.reps))}</span>`:''}${f.eq?`<span>${ico('dumbbell')}${esc(f.eq)}</span>`:''}${e0.grupo?`<span>Grupo ${esc(e0.grupo)}</span>`:''}</div>
      ${alt?`<div class="en-swap">Solo hoy, en lugar de ${esc(e0.nm)}</div>`:''}
      ${f.ms.length?`<div class="en-musc">${f.ms.map((m,j)=>`<span class="${j?'':'p'}"><i></i>${esc(m)}</span>`).join('')}</div>`:''}
      ${!especial?`<div class="en-pills">
        ${c?`<span class="en-pill l">${ico('bolt')}Hoy <b>${enKg(c.kg)}</b>${c.sube>0?' · +'+kgToDisplay(c.sube):''}</span>`:''}
        ${(()=>{ const pr=s.logs&&s.logs.prs&&s.logs.prs[prKey(e.nm)]; return pr?`<span class="en-pill">${ico('trophy')}Récord <b>${enKg(pr.kg)}</b></span>`:''; })()}
        ${dPlan.nada?'':dPlan.libre?`<span class="en-pill">${ico('timer')}Descanso <b>libre${dPlan.meta?' · ~'+(dPlan.meta<120?dPlan.meta+' s':Math.round(dPlan.meta/6)/10+' min'):''}</b></span>`
          :des?`<span class="en-pill">${ico('timer')}Descanso <b>${des<120?des+' s':Math.round(des/60*10)/10+' min'}</b></span>`:''}
        ${M?`<span class="en-pill">${ico('bolt')}<b>${esc(M.nm)}</b></span>`:''}
      </div>`:''}
    </div>
    ${(M&&M.como)||e.tip?`<div class="en-tip">${ico('spark')}<span>${esc(sinEmoji(M&&M.como?M.como:e.tip))}</span></div>`:''}
    ${series}
    ${alts.length?`<button type="button" class="en-alt-tg" aria-expanded="${sesUI.alts}" onclick="sesUI.alts=!sesUI.alts;renderSes()"><span>¿Área ocupada? Cámbialo solo por hoy</span>${ico('chev')}</button>
      ${sesUI.alts?`<div class="en-alts">${alts.map((a,ai)=>`<button type="button" class="en-alt" aria-pressed="${altSel===ai}" onclick="sesAlternativa(${i},${ai})"><span><b>${esc(a.nm)}</b><span>${esc(a.nota||a.ms||'')}</span></span><em>${altSel===ai?'Hoy':'Usar'}</em></button>`).join('')}</div>`:''}`:''}
    ${sig?`<div class="en-next">${ico('arrow')}<div><b>Después: ${esc(sig.nm)}</b><span>${esc(rxTexto(sig,s).sr)}</span></div></div>`:''}
    <div class="en-nav">
      ${i>0?`<button type="button" class="en-btn en-btn-g en-btn-ic" aria-label="Ejercicio anterior" onclick="sesIr(-1)">${ico('chevl')}</button>`:''}
      <button type="button" class="en-btn en-btn-p" id="en-sig" data-pend="${sesAvance(i,e0)<1?1:0}" onclick="${sig?'sesIr(1)':'sesTerminar()'}">${sig?'Siguiente ejercicio':'Terminar sesión'}</button>
    </div>`;
}
function sesEjActual(){ const ejs=sesEjs(), i=sesUI.cur, e0=ejs[i]; const a=e0&&ejEjecutado(e0,i); return a?Object.assign({},e0,{nm:a.nm,ms:a.ms||e0.ms,tip:a.nota||e0.tip}):e0; }
function limpiarRepsTxt(r){ return String(r||'').replace(/\s*reps?\b/i,'').trim(); }
function sesValor(i,j,campo,v){
  const B=sesUI.borr[i]; if(!B||!B[j]) return;
  const n=parseFloat(v); const val=isNaN(n)?0:(campo==='kg'?displayToKg(n):Math.round(n));
  B[j][campo]=val;
  const st=sesReg(i).sets[j]; if(st&&st.ok) st[campo]=val;
}
function sesMarcar(i,j,sinDescanso){
  const ejs=sesEjs(), e=ejs[i], reg=sesReg(i), B=sesUI.borr[i]; if(!B) return;
  const on=!(reg.sets[j]&&reg.sets[j].ok);
  // Solo las series marcadas se guardan: así el peso sugerido nunca cuenta como hecho
  reg.sets[j]=on?{kg:B[j].kg||0, r:B[j].r||0, ok:true}:undefined;
  const row=document.querySelector(`#en-ses .en-set[data-j="${j}"]`);
  if(row){ row.classList.toggle('hecha',on); row.querySelector('.en-ok').setAttribute('aria-pressed',on); }
  const bar=document.querySelectorAll('#en-ses .en-prog i')[i];
  if(bar){ const p=sesAvance(i,e); bar.querySelector('b').style.transform=`scaleX(${p})`; bar.classList.toggle('done',p>=1); }
  const sg=document.getElementById('en-sig'); if(sg) sg.dataset.pend=sesAvance(i,e)<1?1:0;
  if(!on) return;
  vibrarToque();
  const n=parseInt(e.series)||B.length, sigSerie=B.findIndex((x,k)=>k>j&&!(reg.sets[k]&&reg.sets[k].ok));
  if(sesHechas(i)>=n) reg.done=true;
  if(sinDescanso) return;
  if(sigSerie>=0) tmDescanso(e,`Serie ${sigSerie+1} · ${B[sigSerie].kg?enKg(B[sigSerie].kg)+' × ':''}${B[sigSerie].r||''}`);
  else if(ejs[i+1]) tmDescanso(e,ejs[i+1].nm);
  else descansoOcultar();
}
function sesAlternativa(i,ai){
  const reg=sesReg(i); reg.alt=reg.alt===ai?null:ai;
  delete sesUI.borr[i]; reg.sets=(reg.sets||[]).map(()=>undefined);
  renderSes();
}
function sesUnidad(){ unidadPeso=unidadPeso==='kg'?'lb':'kg'; try{ localStorage.setItem('unidadPeso',unidadPeso); }catch(e){} renderSes(); }
function sesIr(d){ descansoOcultar(); sesUI.alts=false; sesUI.cur=Math.max(0,Math.min(sesEjs().length-1,sesUI.cur+d)); renderSes(); window.scrollTo(0,0); }
function sesSalir(){ descansoOcultar(); clearInterval(sesReloj); go('s-dash'); refreshDash(); dashTab('rutina'); }
function sesTerminar(){ descansoOcultar(); finalizarSesion(); }
// La ventana de siempre (cardio, rondas…) avisa al cerrarse para actualizar el avance
function sesRefrescar(){ if(document.getElementById('s-ses').classList.contains('on')) renderSes(); }

// ── Tiempo en la sesión: un solo panel que sale desde abajo ──
//  · descanso: cuenta atrás si el plan da un tiempo fijo ("90 s"); LIBRE (cuenta hacia arriba, con la meta
//    como guía) si da un rango o es autorregulado ("30-45 s", "Autorregulado (~90 s)"); nada si no lleva.
//  · temporizador de trabajo (plancha, isométricos, "45 seg") y EMOM (una ronda por minuto).
//  · el botón del reloj de arriba abre el cronómetro libre o un temporizador en cualquier momento.
const EN_C=2*Math.PI*30; let enD={modo:null,left:0,total:0,t0:0,iv:null,to:null,meta:0,ronda:0,rondas:0,alFin:null,alRonda:null};
function descansoPlan(txt){
  const t=String(txt||'').toLowerCase().trim();
  if(!t) return {libre:true, meta:0};
  if(t==='—'||t==='-'||/sin descanso|resto del minuto/.test(t)) return {nada:true};
  const esMin=/min/.test(t), nums=(t.match(/\d+(?:[.,]\d+)?/g)||[]).map(x=>parseFloat(x.replace(',','.'))*(esMin?60:1));
  if(/autorreg|libre|a tu ritmo|lo que necesites/.test(t) || /\d\s*[-–a]\s*\d/.test(t)) return {libre:true, meta:nums.length?Math.round(Math.max(...nums)):0};
  const seg=segundosDescanso(t);
  return seg?{seg}:{libre:true, meta:0};
}
// Segundos de trabajo de una serie ("45 seg", "30 s por lado", "1 min"); 0 si va por repeticiones
function segTrabajo(e){
  const r=String(e&&e.reps||'').toLowerCase();
  if(/rep/.test(r) && !/seg|min/.test(r)) return 0;
  let m; if((m=r.match(/(\d+(?:[.,]\d+)?)\s*min/))) return Math.round(parseFloat(m[1].replace(',','.'))*60);
  if((m=r.match(/(\d+)\s*(?:s|seg)\b/))) return +m[1];
  return 0;
}
function tmBip(f,ms){ try{ const C=window.AudioContext||window.webkitAudioContext; if(!C) return; const a=tmBip.ctx||(tmBip.ctx=new C()); const o=a.createOscillator(), g=a.createGain();
  o.frequency.value=f||880; g.gain.setValueAtTime(.0001,a.currentTime); g.gain.exponentialRampToValueAtTime(.25,a.currentTime+.02); g.gain.exponentialRampToValueAtTime(.0001,a.currentTime+(ms||180)/1000);
  o.connect(g); g.connect(a.destination); o.start(); o.stop(a.currentTime+(ms||180)/1000+.05); }catch(e){} }
// Pinta el panel (una vez por arranque); cada segundo solo cambian el número y el anillo
function tmPanel(o){
  clearInterval(enD.iv); clearTimeout(enD.to);
  const el=document.getElementById('en-desc'); if(!el) return null;
  el.classList.remove('fin');
  el.innerHTML=`<div class="en-desc-in">
    <div class="en-ring"><svg viewBox="0 0 72 72" aria-hidden="true"><circle class="bgc" cx="36" cy="36" r="30"/><circle class="fg" cx="36" cy="36" r="30" stroke-dasharray="${EN_C}" stroke-dashoffset="${o.lleno?0:EN_C}"/></svg><b class="num" id="en-d-t">${o.t}</b></div>
    <div class="en-desc-t"><b id="en-d-h">${esc(o.h)}</b><span id="en-d-s">${esc(o.s||'')}</span></div>
    <div class="en-desc-a${o.ops?' ops':''}">${o.botones}</div></div>`;
  el.setAttribute('aria-hidden','false'); el.inert=false;
  requestAnimationFrame(()=>{ if(el.getAttribute('aria-hidden')==='false') el.classList.add('on'); });
  return el;
}
function tmAnillo(frac){ const fg=document.querySelector('#en-desc .fg'); if(fg) fg.setAttribute('stroke-dashoffset',EN_C*(1-Math.max(0,Math.min(1,frac)))); }
function tmTexto(id,v){ const t=document.getElementById(id); if(t) t.textContent=v; }
// Cuenta atrás (descanso fijo o trabajo)
function tmCuenta(seg,h,sub,alFin,trabajo){
  enD=Object.assign(enD,{modo:trabajo?'trabajo':'cuenta',left:seg,total:seg,alFin:alFin||null});
  tmPanel({t:enMMSS(seg), h, s:sub, lleno:true, botones:`<button type="button" onclick="descansoAjustar(-15)" aria-label="Quitar 15 segundos">−15</button><button type="button" onclick="descansoAjustar(15)" aria-label="Agregar 15 segundos">+15</button><button type="button" class="skip" onclick="${trabajo?'tmTerminar()':'descansoOcultar()'}">${trabajo?'Listo':'Saltar'}</button>`});
  enD.iv=setInterval(()=>{ enD.left=Math.max(0,enD.left-1); descansoPintar(); if(enD.left<=3&&enD.left>0) tmBip(660,90); if(enD.left===0) descansoListo(); },1000);
}
// Cronómetro libre (cuenta hacia arriba); con meta, el anillo se llena hacia ella y avisa al llegar
function tmLibre(h,sub,meta){
  enD=Object.assign(enD,{modo:'libre',t0:Date.now(),meta:meta||0,avisado:false,alFin:null});
  tmPanel({t:'00:00', h, s:sub, botones:`<button type="button" onclick="tmLibre(${JSON.stringify(h).replace(/"/g,'&quot;')},${JSON.stringify(sub||'').replace(/"/g,'&quot;')},${meta||0})" aria-label="Reiniciar en cero">Reiniciar</button><button type="button" class="skip" onclick="descansoOcultar()">Listo</button>`});
  enD.iv=setInterval(()=>{ const t=(Date.now()-enD.t0)/1000; tmTexto('en-d-t',enMMSS(t));
    if(enD.meta){ tmAnillo(t/enD.meta); if(!enD.avisado && t>=enD.meta){ enD.avisado=true; document.getElementById('en-desc')?.classList.add('fin'); tmTexto('en-d-h','Meta cumplida · sigue cuando estés listo'); vibrarToque([80,60,80]); tmBip(880,200); } }
    else tmAnillo((t%60)/60); },250);
}
// EMOM: una ronda por minuto; avisa al empezar cada minuto
function tmEmom(min,nm,alRonda,alFin){
  enD=Object.assign(enD,{modo:'emom',t0:Date.now(),rondas:min,ronda:1,alRonda:alRonda||null,alFin:alFin||null});
  tmPanel({t:'01:00', h:'Ronda 1 de '+min, s:nm+' · haz tus reps y descansa lo que sobre', lleno:true, botones:`<button type="button" class="skip" onclick="tmTerminar()">Terminar EMOM</button>`});
  tmBip(880,220); vibrarToque([60,40,60]);
  enD.iv=setInterval(()=>{
    const t=(Date.now()-enD.t0)/1000, r=Math.floor(t/60)+1, quedan=60-(t%60);
    if(r>enD.ronda){ if(enD.alRonda) enD.alRonda(enD.ronda); enD.ronda=r;
      if(r>enD.rondas){ tmTerminar(); return; }
      tmTexto('en-d-h','Ronda '+r+' de '+enD.rondas); tmBip(880,220); vibrarToque([60,40,60]); }
    tmTexto('en-d-t',enMMSS(Math.ceil(quedan))); tmAnillo(quedan/60);
    if(quedan<=3.2 && quedan>2.8 || quedan<=2.2 && quedan>1.8 || quedan<=1.2 && quedan>.8) tmBip(660,80);
  },200);
}
function tmTerminar(){
  const fin=enD.alFin, modo=enD.modo; enD.alFin=null;
  if(modo==='emom' && enD.alRonda && enD.ronda<=enD.rondas && (Date.now()-enD.t0)/1000>=enD.ronda*60-1) enD.alRonda(enD.ronda);
  clearInterval(enD.iv);
  const el=document.getElementById('en-desc');
  if(el){ el.classList.add('fin'); tmTexto('en-d-h',modo==='emom'?'¡EMOM terminado!':'¡Serie lista!'); tmTexto('en-d-t','✓'); tmAnillo(1); }
  vibrarToque([80,60,80]); tmBip(990,260);
  enD.to=setTimeout(()=>{ descansoOcultar(); if(fin) fin(); },1100);
}
// Compatibilidad: descanso fijo de siempre
function descansoIniciar(seg,sig){ tmCuenta(seg,'Descansa','Sigue: '+sig); }
// Descanso según el plan del ejercicio
function tmDescanso(e,sig){
  const p=descansoPlan(e&&e.descanso);
  if(p.nada){ descansoOcultar(); return; }
  if(p.libre) tmLibre('Descanso libre'+(p.meta?' · meta ~'+(p.meta<120?p.meta+' s':Math.round(p.meta/6)/10+' min'):''),'Sigue: '+sig,p.meta);
  else tmCuenta(p.seg,'Descansa','Sigue: '+sig);
}
function descansoPintar(){ tmTexto('en-d-t',enMMSS(enD.left)); tmAnillo(enD.left/enD.total); }
function descansoAjustar(d){ enD.left=Math.max(0,enD.left+d); enD.total=Math.max(enD.total,enD.left); descansoPintar(); if(enD.left===0) descansoListo(); }
function descansoListo(){
  if(enD.modo==='trabajo'){ tmTerminar(); return; }
  clearInterval(enD.iv);
  const el=document.getElementById('en-desc'); if(!el) return;
  el.classList.add('fin'); tmTexto('en-d-h','¡A darle!');
  vibrarToque([80,60,80]); tmBip(990,260);
  enD.to=setTimeout(descansoOcultar,2600);
}
function descansoOcultar(){
  clearInterval(enD.iv); clearTimeout(enD.to); enD.modo=null;
  const el=document.getElementById('en-desc'); if(!el) return;
  el.classList.remove('on'); el.setAttribute('aria-hidden','true'); el.inert=true;
}
// Botón del reloj (arriba): cronómetro libre o temporizador rápido, en cualquier momento de la sesión
function tmMenu(){
  if(enD.modo){ descansoOcultar(); return; }
  const e=sesEjs()[sesUI.cur], w=segTrabajo(e), emom=e&&e.metodo&&e.metodo.id==='emom';
  const op=(txt,fn)=>`<button type="button" onclick="${fn}">${txt}</button>`;
  tmPanel({t:'⏱', h:'Cronómetro', s:'Elige cómo quieres medir', lleno:true, ops:true, botones:`<div class="en-tm-ops">
    ${emom?op('EMOM '+e.series+' min',`sesEmom(${sesUI.cur})`):''}${w?op('Trabajo '+(w<120?w+' s':Math.round(w/6)/10+' min'),`sesTrabajo(${sesUI.cur})`):''}
    ${op('Libre','tmLibre(\'Cronómetro libre\',\'Cuenta hacia arriba\',0)')}${[30,45,60,90,120].map(x=>op(x<120?x+' s':'2 min',`tmCuenta(${x},'Temporizador','${x<120?x+' segundos':'2 minutos'}')`)).join('')}
    <button type="button" class="skip" onclick="descansoOcultar()">Cerrar</button></div>`});
}
// Temporizador de trabajo de la siguiente serie (plancha, isométricos, "45 seg")
function sesTrabajo(i){
  const ejs=sesEjs(), e=ejs[i]; if(!e) return;
  const w=segTrabajo(e); if(!w) return;
  const especial=enEspecial(e), n=parseInt(e.series)||1, reg=sesReg(i);
  let j=0; if(!especial){ j=Array.from({length:n},(_,k)=>k).find(k=>!(reg.sets[k]&&reg.sets[k].ok)); if(j==null) j=n-1; }
  else { sesUI.tmSerie=sesUI.tmSerie||{}; j=Math.min(n-1,sesUI.tmSerie[i]||0); }
  tmCuenta(w,'Serie '+(j+1)+' de '+n+' · ¡aguanta!',e.nm,()=>{
    if(!especial){ if(!(reg.sets[j]&&reg.sets[j].ok)) sesMarcar(i,j); }
    else { sesUI.tmSerie[i]=j+1; const sig=j+1<n?'Serie '+(j+2):(ejs[i+1]?ejs[i+1].nm:''); if(sig) tmDescanso(e,sig); showToast('Serie '+(j+1)+' lista. Regístrala al terminar el ejercicio'); }
  },true);
}
// EMOM: cada minuto que termina cuenta como una ronda hecha
function sesEmom(i){
  const ejs=sesEjs(), e=ejs[i]; if(!e) return;
  normalizarEmom(e);
  const especial=enEspecial(e), n=parseInt(e.series)||EMOM_MIN;
  tmEmom(n,e.nm,r=>{ if(!especial){ const reg=sesReg(i); if(!(reg.sets[r-1]&&reg.sets[r-1].ok)) sesMarcar(i,r-1,true); } },
    ()=>{ if(especial) openModal(i); });
}

// ═════════════ RESUMEN AL TERMINAR ═════════════
let enFin=null;
function mostrarResumenSesion(info){
  enFin=info; clearInterval(sesReloj); descansoOcultar();
  sesUI={k:null, cur:0, alts:false, borr:{}, aviso:false};
  const s=activeSocio, x=info.reg, cont=document.getElementById('en-fin'); if(!s||!cont) return;
  const ev=calcEvolucion(s);
  const min=info.t0?Math.max(1,Math.round((x.ts-info.t0)/60000)):null;
  const tot=x.sp||comoArray(x.detalle).reduce((a,d)=>a+(+d.p||0),0), ok=x.sp?(x.sh||0):comoArray(x.detalle).reduce((a,d)=>a+Math.min(+d.s||0,+d.p||0),0);
  const est=sesEstado(x);
  const estTit={completa:'Sesión completa', parcial:'Sesión parcial', incompleta:'Sesión incompleta'}[est];
  const estNota=est==='incompleta'?'Hiciste menos de la mitad de las series: tus pesos y récords se guardan, pero esta sesión no cuenta para tu meta de la semana ni tu racha.'
    :est==='parcial'?'Cuenta para tu semana. La próxima vez intenta completar todas las series.':'';
  const pct=info.prevVol>0&&x.volumen>0?Math.round((x.volumen-info.prevVol)/info.prevVol*100):null, mx=Math.max(x.volumen,info.prevVol||0)||1;
  const hoyI=DIAS_ORDER.indexOf(HOY_KEY);
  const prox=DIAS_ORDER.map((k,i)=>({k,i})).filter(o=>o.i>hoyI&&s.rutina[o.k]&&(s.rutina[o.k].ejercicios||[]).length)[0];
  const meta=Math.max(1,parseInt(s.dias)||3), hechas=Math.min(ev.estaSemana,meta);
  const fmt=n=>Math.round(n).toLocaleString('es-MX');
  cont.innerHTML=`
    <div class="en-fin-hero">
      <div class="en-fin-ck${est==='completa'?'':' '+est}">${ico(est==='incompleta'?'info':'check')}</div>
      <h2>${estTit}</h2>
      <p>${esc(sc(x.tipo))} · ${EN_DIAS[hoyI]} ${new Date(x.ts).getDate()} de ${['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'][new Date(x.ts).getMonth()]}</p>
    </div>
    ${estNota?`<p class="en-fin-nota">${estNota}</p>`:''}
    <div class="en-fin-stats"><div><b class="num">${min!=null?min:'—'}</b><span>minutos</span></div><div><b class="num">${x.volumen>0?fmt(x.volumen):'—'}</b><span>kg de volumen</span></div><div><b class="num">${tot?ok+'/'+tot:x.ejercicios}</b><span>${tot?'series':'ejercicios'}</span></div></div>
    ${info.prs.length?`<section class="en-sec"><div class="en-sec-h"><h3>${info.prs.length===1?'Récord nuevo':info.prs.length+' récords nuevos'}</h3></div>
      <div class="en-prs en-stag">${info.prs.map(p=>`<div class="en-pr"><div class="en-pr-ic">${ico('trophy')}</div><div><b>${esc(p.n)}</b><span>Antes ${enKg(p.antes)}</span></div><strong class="en-up num">+${kgToDisplay(Math.round((p.kg-p.antes)*10)/10)}</strong></div>`).join('')}</div></section>`:''}
    ${pct!=null?`<section class="en-sec"><div class="en-sec-h"><h3>Contra tu último ${esc(sc(x.tipo))}</h3><span class="${pct>=0?'en-up':''}">${pct>=0?'+':''}${pct}% de volumen</span></div>
      <div class="en-cmp">
        <div class="en-cmp-r"><span>${esc(fmtFecha(info.prevFecha))}</span><div class="en-bar"><i class="prev" style="width:${info.prevVol/mx*100}%"></i></div><b class="num">${fmt(info.prevVol)}</b></div>
        <div class="en-cmp-r"><span>Hoy</span><div class="en-bar"><i style="width:${x.volumen/mx*100}%"></i></div><b class="num">${fmt(x.volumen)}</b></div>
      </div></section>`:''}
    <div class="en-goal">
      <div class="en-goal-top"><div><h3>Vas <span>${ev.estaSemana}</span> de ${meta}</h3><p>${ev.estaSemana>=meta?'¡Semana cumplida!':prox?'Próxima: '+esc(sc(s.rutina[prox.k].tipo))+', '+EN_DIAS[prox.i]+'.':'Te faltan '+(meta-ev.estaSemana)+' esta semana.'}</p></div>
        <div class="en-racha" aria-label="Racha de ${ev.racha} semanas">${ico('flame')}<b class="num">${ev.racha}</b><small>${ev.racha===1?'semana':'semanas'}</small></div></div>
      <div class="en-slots" aria-hidden="true">${Array.from({length:meta},(_,i)=>`<i class="${i<hechas?'ok':''}"></i>`).join('')}</div>
    </div>
    <section class="en-sec"><div class="en-sec-h"><h3>¿Cómo te sentiste?</h3><span>Ayuda a ajustar tu plan</span></div>
      <div class="en-feel" role="group" aria-label="Cómo te sentiste">${['Fácil','Bien','Duro','Al límite'].map(f=>`<button type="button" aria-pressed="${x.sensacion===f}" onclick="finSentir(this,'${f}')">${f}</button>`).join('')}</div></section>
    <button type="button" class="en-btn en-btn-p" onclick="finListo()">${ico('check')}Listo</button>`;
  go('s-fin');
}
function finSentir(btn,f){
  if(!enFin) return; const s=activeSocio;
  enFin.reg.sensacion=enFin.reg.sensacion===f?null:f;
  if(!enFin.reg.sensacion) delete enFin.reg.sensacion;
  btn.parentNode.querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',b.textContent===enFin.reg.sensacion));
  if(s) dbSave(s.code);
}
function finListo(){ enFin=null; go('s-dash'); refreshDash(); dashTab('progreso'); }

// ═════════════ PROGRESO ═════════════
function renderProgresoTab(){
  av3dDestruir();
  const s=activeSocio; if(!s) return;
  asegurarLogs(s);
  const ev=calcEvolucion(s), ses=comoArray(s.logs.sesiones).filter(Boolean);
  const pesos=s.logs.pesoCorporal||[], pesoNow=pesoActual(s), prs=s.logs.prs||{};
  const meta=Math.max(1,parseInt(s.dias)||3), hechas=Math.min(ev.estaSemana,meta), falta=Math.max(0,meta-ev.estaSemana);
  const sem=sesionesSemana(s), hoyI=DIAS_ORDER.indexOf(HOY_KEY);
  const tocan=DIAS_ORDER.map((k,i)=>({k,i})).filter(o=>o.i>=hoyI&&!sem[o.i]&&s.rutina[o.k]&&(s.rutina[o.k].ejercicios||[]).length).map(o=>EN_DIAS[o.i]).slice(0,falta);
  const goalTxt=ev.estaSemana>=meta?'¡Semana cumplida! Lo que sumes ahora es extra.'
    :`Te ${falta===1?'falta 1 sesión':'faltan '+falta+' sesiones'} para cerrar la semana.${tocan.length?' Te toca'+(tocan.length>1?'n ':' ')+enListaY(tocan)+'.':''}`;
  const desde=s.fechaRegistro||(ses[0]&&ses[0].fecha);
  const sesRev=ses.slice().reverse().slice(0,8);
  const prKeys=Object.keys(prs).sort((a,b)=>prs[b].kg-prs[a].kg).slice(0,6);
  document.getElementById('dsec-progreso').innerHTML=`
    ${appHead('Mi progreso',desde?'Desde el '+fmtFecha(desde):'Tu esfuerzo se ve en los resultados.')}
    <div class="en-goal">
      <div class="en-goal-top"><div><h3>Vas <span>${ev.estaSemana}</span> de ${meta}</h3><p>${goalTxt}</p></div>
        <div class="en-racha" aria-label="Racha de ${ev.racha} semanas">${ico('flame')}<b class="num">${ev.racha}</b><small>${ev.racha===1?'semana':'semanas'}</small></div></div>
      <div class="en-peso-mini">
        <label for="peso-nuevo">Peso de hoy</label>
        <div><input type="number" id="peso-nuevo" placeholder="${pesoNow}" step="0.1" min="30" max="250" inputmode="decimal" onkeydown="if(event.key==='Enter')guardarPeso()"><span>kg</span></div>
        <button type="button" onclick="guardarPeso()">Guardar</button>
      </div>
      <div class="en-slots" aria-hidden="true">${Array.from({length:meta},(_,i)=>`<i class="${i<hechas?'ok':''}"></i>`).join('')}</div>
    </div>

    <section class="en-sec"><div class="en-sec-h"><h3>Constancia</h3><span>${ev.total} ${ev.total===1?'sesión':'sesiones'} · ${ev.adherencia}% en 4 semanas</span></div>
      ${enHeatHTML(s,ses)}</section>

    <div id="cuerpo-contenido"></div>

    <section class="en-sec"><div class="en-sec-h"><h3>Peso corporal</h3>${ev.deltaPeso!==null?`<span class="${ev.deltaPeso<=0?'en-up':''}">${ev.deltaPeso>0?'+':''}${ev.deltaPeso} kg desde tu registro</span>`:''}</div>
      <div class="en-peso">
        <div class="en-peso-top"><b class="num">${pesoNow}<small> kg</small></b></div>
        ${enPesoSVG(pesos)}
      </div></section>

    ${prKeys.length?`<section class="en-sec"><div class="en-sec-h"><h3>Récords personales</h3></div>
      <div class="en-list">${prKeys.map(nm=>`<div class="en-li"><span>${esc(nm)}</span><b class="num">${enKg(prs[nm].kg)}</b><small>${fmtFecha(prs[nm].fecha)}</small></div>`).join('')}</div></section>`:''}

    <section class="en-sec"><div class="en-sec-h"><h3>Últimas sesiones</h3>${sesRev.length?'<span>Toca una para borrarla</span>':''}</div>
      ${sesRev.length?`<div class="en-hist">${sesRev.map(x=>{ const f=new Date((x.fecha||'')+'T12:00:00'); const ok=!isNaN(f), est=sesEstado(x), v=enSesMedida(x);
        const ejTxt=x.ejPlan?`${x.ejercicios||0} de ${x.ejPlan} ejercicios`:`${x.ejercicios||0} ejercicios`;
        return `<div class="en-h-row" role="button" tabindex="0" onclick="sesBorrarPreg(${+x.ts||0},'${esc(x.fecha||'')}')" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();this.click();}" aria-label="${esc(sc(x.tipo||'Sesión'))}, ${ok?f.getDate()+' de '+EN_MESES[f.getMonth()]:''}, ${EN_EST_TXT[est]}. Toca para borrarla">
        <div class="en-h-d"><b class="num">${ok?f.getDate():'—'}</b><small>${ok?EN_MESES[f.getMonth()].toUpperCase():''}</small></div>
        <div class="en-h-t"><b>${esc(sc(x.tipo||'Sesión'))}</b><span>${ejTxt} · <em class="en-est ${est}">${EN_EST_TXT[est]}</em>${x.sensacion?' · '+esc(x.sensacion):''}</span></div>
        <div class="en-h-v num">${v.v}${v.u?`<small>${v.u}</small>`:''}</div></div>`; }).join('')}</div>
      ${sesRev.some(x=>sesEstado(x)==='incompleta')?'<p class="en-h-nota">Las sesiones incompletas (menos de la mitad de las series) guardan tus pesos, pero no cuentan para tu meta de la semana, tu racha ni tu constancia.</p>':''}`
      :'<div class="empty-msg">Aún no hay sesiones registradas.<br>Al terminar tu primera sesión aparecerá aquí.</div>'}</section>

    <section class="en-sec"><div class="en-sec-h"><h3>Fuerza</h3><span>Mejor peso de cada mes</span></div>
      ${enFuerzaHTML(s,ses)}</section>
`;
  renderCuerpo();
}
const EN_EST_TXT={completa:'Completa', parcial:'Parcial', incompleta:'Incompleta'};
// Lo que se muestra a la derecha de cada sesión: kilos si los hubo; si no, cardio, isométricos o series
function enSesMedida(x){
  if(x.volumen>0) return {v:Math.round(x.volumen).toLocaleString('es-MX'), u:'kg'};
  if(x.cardioMin>0) return {v:x.cardioMin, u:'min cardio'};
  if(x.tut>=20) return {v:fmtTut(x.tut), u:'isométricos'};
  if(x.sp) return {v:`${x.sh||0}/${x.sp}`, u:'series'};
  return {v:'—', u:''};
}
function sesBorrarPreg(ts,fecha){
  const s=activeSocio; if(!s) return;
  const ses=comoArray(s.logs&&s.logs.sesiones);
  const x=ses.find(o=>o&&(ts?o.ts===ts:o.fecha===fecha)); if(!x) return;
  uiConfirm(`¿Eliminar la sesión de ${sc(x.tipo||'tu rutina')} del ${fmtFecha(x.fecha)}?\n\nDeja de contar en tu progreso. Los récords que marcaste ese día se recalculan con tus otras sesiones.`,
    ()=>sesBorrar(x), {label:'Eliminar sesión', danger:true});
}
function sesBorrar(x){
  const s=activeSocio; if(!s) return;
  s.logs.sesiones=comoArray(s.logs.sesiones).filter(o=>o!==x);
  // Récords que salieron de ese día: se recalculan con lo que queda (o se quitan si no hay otro registro)
  const prs=s.logs.prs||{};
  Object.keys(prs).forEach(k=>{
    if(!prs[k]||prs[k].fecha!==x.fecha) return;
    let mejor=null;
    s.logs.sesiones.forEach(o=>comoArray(o&&o.detalle).forEach(d=>{
      if(!d||!(+d.kg>0)||prKey(d.alt||d.n)!==k) return;
      if(!mejor||+d.kg>mejor.kg) mejor={kg:+d.kg, fecha:o.fecha};
    }));
    if(mejor) prs[k]=mejor; else delete prs[k];
  });
  dbSave(s.code);
  showToast('Sesión eliminada');
  refreshDash(); dashTab('progreso');
}
// Mapa de 12 semanas (filas lunes a domingo): completa si hizo al menos el 80% de las series
function enHeatHTML(s,ses){
  // 12 semanas siempre; la primera columna es la semana de su primer entrenamiento y se van pintando hacia la derecha.
  // Si ya pasaron más de 12 semanas, se ven las últimas 12.
  const semanas=12, lunes=inicioSemana(new Date()), t0=ses.reduce((m,x)=>x&&x.ts&&x.ts<m?x.ts:m, Infinity);
  const yaVan=isFinite(t0)?Math.floor((lunes.getTime()-inicioSemana(new Date(t0)).getTime())/(7*86400000)+.5)+1:1;
  const ini=new Date(lunes); ini.setDate(ini.getDate()-(Math.min(yaVan,semanas)-1)*7);
  const hoy=new Date(); hoy.setHours(23,59,59,999);
  const nivel=(t0)=>{ const t1=t0+86400000; const est=ses.filter(x=>x.ts>=t0&&x.ts<t1).map(sesEstado);
    return est.includes('completa')?2:est.includes('parcial')?1:0; };
  let h='';
  for(let d=0;d<7;d++){
    h+=`<span class="en-hl">${'LMXJVSD'[d]}</span>`;
    for(let w=0;w<semanas;w++){
      const f=new Date(ini); f.setDate(ini.getDate()+w*7+d);
      const fut=f>hoy, esHoy=fechaISO(f)===fechaISO(new Date()), v=fut?0:nivel(f.getTime());
      h+=`<span class="en-cell${v===2?' c2':v===1?' c1':''}${fut?' fut':''}${esHoy?' hoy':''}"></span>`;
    }
  }
  const desde=!isFinite(t0)?'Tu primer entrenamiento cuenta aquí':yaVan>semanas?'Hace 12 semanas':'Desde tu primer entrenamiento';
  return `<div class="en-heat-w"><div class="en-heat" role="img" aria-label="Mapa de entrenamientos: ${yaVan>semanas?'últimas 12 semanas':'12 semanas desde tu primer entrenamiento'}">${h}</div>
    <div class="en-heat-leg"><span>${desde}</span><span><i class="c0"></i>Nada<i class="c1"></i>Parcial<i class="c2"></i>Completa</span></div></div>`;
}
// Ejercicios con más registros: mejor peso de cada mes (hasta 6 meses)
function enFuerzaHTML(s,ses){
  const por={};
  ses.forEach(x=>comoArray(x.detalle).forEach(d=>{ if(!d||d.alt||!(+d.kg>0)||!x.fecha) return;
    const m=x.fecha.slice(0,7); (por[d.n]=por[d.n]||{})[m]=Math.max((por[d.n]||{})[m]||0,+d.kg); }));
  const lifts=Object.keys(por).map(n=>{ const ms=Object.keys(por[n]).sort().slice(-6); return {n, ms, v:ms.map(m=>por[n][m])}; })
    .filter(l=>l.v.length>=2).sort((a,b)=>(b.v[b.v.length-1]-b.v[0])-(a.v[a.v.length-1]-a.v[0])).slice(0,4);
  if(!lifts.length) return '<div class="empty-msg">Registra el peso de tus series durante al menos dos meses y aquí verás cuánto subes en cada ejercicio.</div>';
  return `<div class="en-lifts">${lifts.map(l=>{ const a=l.v[0], b=l.v[l.v.length-1], dif=Math.round((b-a)*10)/10, pc=a>0?Math.round(dif/a*100):0;
    const mes=m=>EN_MESES[+m.slice(5,7)-1];
    return `<button type="button" class="en-lift" aria-expanded="false" onclick="this.setAttribute('aria-expanded',this.getAttribute('aria-expanded')!=='true')">
      <span class="en-lift-n">${esc(l.n)}</span>${enSpark(l.v)}
      <span class="en-lift-v"><b class="num">${enKg(b)}</b><span class="${dif>0?'en-up':''}">${dif>0?'+':''}${kgToDisplay(dif)} · ${dif>0?'+':''}${pc}%</span></span>
      <span class="en-lift-det">${l.ms.map((m,i)=>mes(m)+' '+kgToDisplay(l.v[i])).join(' · ')} ${unidadPeso}</span></button>`; }).join('')}</div>`;
}
function enSpark(v){
  const W=112,H=44,p=4,mn=Math.min(...v),mx=Math.max(...v);
  const pt=v.map((y,i)=>[p+i*(W-2*p)/(v.length-1),H-p-(y-mn)/((mx-mn)||1)*(H-2*p)]);
  const d=pt.map((q,i)=>(i?'L':'M')+q[0].toFixed(1)+' '+q[1].toFixed(1)).join(' '), l=pt[pt.length-1];
  return `<svg class="en-spark" viewBox="0 0 ${W} ${H}" aria-hidden="true"><path class="a" d="${d} L${l[0]} ${H} L${p} ${H}Z"/><path class="l" d="${d}"/><circle cx="${l[0]}" cy="${l[1]}" r="3.5"/></svg>`;
}
function enPesoSVG(pesos){
  if(pesos.length<2) return '<div class="empty-msg">Registra tu peso al menos 2 veces para ver la curva.</div>';
  const v=pesos.slice(-24).map(p=>+p.kg), fs=pesos.slice(-24).map(p=>p.fecha);
  let mn=Math.min(...v), mx=Math.max(...v); const rg=Math.max(1,mx-mn); mn=Math.floor((mn-rg*.15)*2)/2; mx=Math.ceil((mx+rg*.15)*2)/2;
  const X0=36,X1=312,Y0=10,Y1=112, x=i=>X0+i*(X1-X0)/(v.length-1), y=k=>Y1-(k-mn)/(mx-mn)*(Y1-Y0);
  let s='';
  [mn,(mn+mx)/2,mx].forEach(k=>{ s+=`<line class="g" x1="${X0}" x2="${X1}" y1="${y(k)}" y2="${y(k)}"/><text x="${X0-6}" y="${y(k)+4}" text-anchor="end">${Math.round(k*10)/10}</text>`; });
  s+=`<path class="l" d="${v.map((k,i)=>(i?'L':'M')+x(i).toFixed(1)+' '+y(k).toFixed(1)).join(' ')}"/>`;
  s+=`<circle class="ini" cx="${x(0)}" cy="${y(v[0])}" r="4"/><circle class="fin" cx="${x(v.length-1)}" cy="${y(v[v.length-1])}" r="4"/>`;
  s+=`<text x="${X0}" y="132" text-anchor="start">${esc(fmtFecha(fs[0]))}</text><text x="${X1}" y="132" text-anchor="end">${esc(fmtFecha(fs[fs.length-1]))}</text>`;
  return `<svg class="en-peso-svg" viewBox="0 0 320 138" role="img" aria-label="Peso de ${v[0]} a ${v[v.length-1]} kilos">${s}</svg>`;
}
