'use strict';
// EL MURO — Berlín, 13 de agosto de 1961
// Motor de aventura conversacional para VampireBBS
// © 2026 Vampsecure Studios

const OUT = document.getElementById('out');
const INP = document.getElementById('inp');
const SC  = document.getElementById('sc');

let bootMode = true;
let queue = [];
let typing = false;

function pr(text, cls = 'ok') {
  if (bootMode) { queue.push([text, cls]); return; }
  const d = document.createElement('div');
  d.className = 'line ' + cls;
  d.textContent = text;
  OUT.appendChild(d);
  OUT.scrollTop = OUT.scrollHeight;
}

function drainQueue() {
  bootMode = false;
  let i = 0;
  function next() {
    if (i >= queue.length) { queue = []; typing = false; return; }
    const [text, cls] = queue[i++];
    const d = document.createElement('div');
    d.className = 'line ' + cls;
    d.textContent = '';
    OUT.appendChild(d);
    OUT.scrollTop = OUT.scrollHeight;
    let j = 0;
    function tick() {
      if (j < text.length) {
        d.textContent += text[j++];
        OUT.scrollTop = OUT.scrollHeight;
        setTimeout(tick, 12);
      } else {
        setTimeout(next, 30);
      }
    }
    tick();
  }
  typing = true;
  next();
}

function updateScore() { SC.textContent = S.score; }

function addScore(n, reason) {
  const prev = S.score;
  S.score = Math.min(250, S.score + n);
  if (S.score > prev) pr(`+${S.score - prev} pts — ${reason}`, 'dim');
  updateScore();
}

// ── ESTADO ──────────────────────────────────────────────────────────────────

const S = {
  room: 'apartamento',
  score: 0,
  turns: 0,
  inv: ['pasaporte_falso', 'carta_hanna'],
  flags: {
    radioEncendida: false,
    mapaEncontrado: false,
    hansHablado: false,
    llavesTomadas: false,
    hannaHablada: false,
    hannaConvencida: false,
    documentosLeidos: false,
    bateriaTomada: false,
    uniformeTomado: false,
    documentosTomados: false,
    cartaLeida: false,
    murallaVista: false,
    checkpointIntentado: false,
    edificioHannaVisitado: false,
    almacenVisitado: false,
    tunel_visitado: false,
    radioExaminada: false,
    finalStarted: false,
    // score guards
    sc_radio: false,
    sc_mapa: false,
    sc_hans: false,
    sc_llaves: false,
    sc_hanna_hablada: false,
    sc_documentos: false,
    sc_hanna_conv: false,
    sc_uniforme: false,
    sc_muralla: false,
    sc_estacion: false,
    sc_cafeteria: false,
    sc_bateria: false,
    sc_checkpoint: false,
    sc_edificio: false,
  }
};

// ── MAPA ────────────────────────────────────────────────────────────────────

const ROOMS = {
  apartamento: {
    name: 'Apartamento seguro — Prenzlauer Berg',
    desc: 'Un piso de dos habitaciones en la tercera planta, Schönhauser Allee 38. La radio portátil está sobre la mesa, silenciada. Por la ventana se ve la calle: a lo lejos, reflectores militares y el ruido de camiones. Son las 02:14.',
    exits: { sur: 'calle_prenzlauer' }
  },
  calle_prenzlauer: {
    name: 'Schönhauser Allee — Prenzlauer Berg',
    desc: 'La calle está irrealmente quieta para ser agosto. Algunos vecinos asoman a las ventanas. Al sur se oyen sirenas. Un cartel de la SED sigue pegado en la pared: "El Socialismo Vence". La cafetería Danzig está al este, el edificio de Hanna al norte. Al sur, Friedrichstrasse.',
    exits: { norte: 'edificio_hanna', sur: 'calle_friedrichstrasse', este: 'cafeteria', arriba: 'apartamento' }
  },
  cafeteria: {
    name: 'Café Danzig',
    desc: 'El café lleva veinte años en el mismo sitio: mesas de fórmica, olor a tabaco negro, fotografías enmarcadas de Leipzig. Solo hay un cliente: Hans, sentado en la última mesa, con una taza que no ha tocado. Te mira cuando entras.',
    exits: { oeste: 'calle_prenzlauer' }
  },
  edificio_hanna: {
    name: 'Edificio de Hanna — portal',
    desc: 'Portal de piedra gris, dos buzones rotos, un corredor mal iluminado. En el suelo del corredor, junto a la caja de fusibles, hay una batería de repuesto. Las escaleras suben al piso de Hanna.',
    exits: { sur: 'calle_prenzlauer', arriba: 'apartamento_hanna' }
  },
  apartamento_hanna: {
    name: 'Apartamento de Hanna — 3.º B',
    desc: 'Un piso pequeño y ordenado: libros en alemán y ruso, un mapa de Europa sin el muro, una máquina de escribir. Hanna está de pie junto a la ventana, vestida, con una cartera de cuero sobre la mesa. No te esperaba tan pronto.',
    exits: { abajo: 'edificio_hanna' }
  },
  calle_friedrichstrasse: {
    name: 'Friedrichstrasse — hacia el checkpoint',
    desc: 'La avenida está cortada por barricadas de alambre de espino a doscientos metros al sur: el puesto de control Checkpoint Friedrichstrasse. Dos Vopos patrullan con fusiles. Al este hay un almacén abandonado con la puerta entornada. Al oeste, la entrada sellada de la estación de metro.',
    exits: { norte: 'calle_prenzlauer', sur: 'puesto_control', este: 'almacen', oeste: 'estacion_metro_cerrada' }
  },
  puesto_control: {
    name: 'Checkpoint Friedrichstrasse',
    desc: 'Una garita de madera, focos que lo iluminan todo, dos Volkspolizei con Kalashnikov. El paso a Berlín Oeste está a cincuenta metros al sur: una franja de tierra de nadie con reflectores. El corazón se te va a la garganta.',
    exits: { norte: 'calle_friedrichstrasse' }
  },
  almacen: {
    name: 'Almacén abandonado',
    desc: 'Huele a aceite y humedad. Estanterías metálicas vacías, cajas de madera apiladas, una silla volcada. Colgado de un gancho en la pared, casi invisible entre las sombras, hay un uniforme de la Volkspolizei.',
    exits: { oeste: 'calle_friedrichstrasse' }
  },
  estacion_metro_cerrada: {
    name: 'Entrada de metro — Stadtbahn',
    desc: 'La verja de hierro está cerrada con cadena y candado. El letrero dice: "CERRADO POR OBRAS". Pero la llave que Hans te ha dado abre exactamente ese modelo de candado.',
    exits: { este: 'calle_friedrichstrasse' }
  },
  estacion_metro: {
    name: 'Estación de metro — andén',
    desc: 'Las luces de emergencia dan una luz anaranjada débil. El andén lleva meses sin trenes: hay polvo en los raíles, periódicos amarillentos en los bancos. Al fondo del andén, donde termina el túnel, alguien ha forzado una trampilla en el suelo. Una escalera baja a oscuras.',
    exits: { norte: 'estacion_metro_cerrada', abajo: 'tunel_entrada' }
  },
  tunel_entrada: {
    name: 'Entrada del túnel',
    desc: 'Un corredor de hormigón de metro y medio de alto, apuntalado con vigas de madera. La obra es reciente: el cemento de los laterales aún está húmedo. Al sur, el pasadizo avanza hacia el Berlín Oeste.',
    exits: { arriba: 'estacion_metro', sur: 'tunel' }
  },
  tunel: {
    name: 'El túnel — bajo el muro',
    desc: 'Noventa metros bajo tierra, bajo el alambre de espino, bajo la Historia. La oscuridad es total salvo por una cuerda que marca el camino. Al norte, la entrada. Al sur, Berlín Oeste.',
    exits: { norte: 'tunel_entrada', sur: 'berlin_oeste' }
  },
  berlin_oeste: {
    name: 'Berlín Oeste — callejón, Kreuzberg',
    desc: 'Aire fresco. Luz de farola amarilla. El callejón da a una calle ancha con coches aparcados. En la pared de ladrillo, alguien ha pintado: "Berlín libre". Una furgoneta con placas de la BRD espera con el motor en marcha.',
    exits: {}
  }
};

// ── OBJETOS ──────────────────────────────────────────────────────────────────

const ITEMS = {
  pasaporte_falso: {
    name: 'pasaporte falso',
    nouns: ['pasaporte', 'documento', 'papel', 'documentos', 'id'],
    location: 'inv',
    portable: true,
    desc: 'Pasaporte de la República Federal de Alemania a nombre de "Karl Werner Schreiber", fotógrafo de Munich. El papel es bueno; la foto, convincente. Te lo dieron hace seis días en Bonn. Valía entonces; ahora, con los Vopos en alerta máxima, es una ruleta rusa.'
  },
  carta_hanna: {
    name: 'carta de Hanna',
    nouns: ['carta', 'nota', 'mensaje', 'papel', 'sobre'],
    location: 'inv',
    portable: true,
    desc: 'Una nota manuscrita en papel de la máquina de escribir: "Klaus — tengo la prueba. Las órdenes de construcción firmadas el 3 de agosto, dos semanas antes de que nadie "supiera" nada. Si llegan a Bonn antes del amanecer, cambian el juicio de la historia. Necesito que me saques. — H."'
  },
  radio_portatil: {
    name: 'radio portátil',
    nouns: ['radio', 'transmisor', 'receptor', 'aparato'],
    location: 'apartamento',
    portable: true,
    desc: 'Radio de onda corta militar, tamaño maletín. La frecuencia de emergencia es 8.420 MHz. Sin batería no sirve de nada — el compartimento está vacío.'
  },
  bateria_radio: {
    name: 'batería de repuesto',
    nouns: ['batería', 'bateria', 'pila', 'acumulador'],
    location: 'edificio_hanna',
    portable: true,
    desc: 'Batería de plomo-ácido de 12V, pesada, etiquetada con el logo de la BND. Alguien la dejó aquí como material de reserva. Encaja exactamente en la radio portátil.'
  },
  llaves_metro: {
    name: 'llaves del metro',
    nouns: ['llave', 'llaves', 'candado', 'metro', 'llavero'],
    location: 'cafeteria',
    portable: true,
    desc: 'Un juego de llaves con etiqueta de la Reichsbahn. La que abre el candado de la estación de metro sellada es la más desgastada de todas.'
  },
  documentos_hanna: {
    name: 'documentos de Hanna',
    nouns: ['documentos', 'prueba', 'pruebas', 'ordenes', 'órdenes', 'carpeta', 'papeles', 'informe'],
    location: 'apartamento_hanna',
    portable: true,
    desc: 'Una carpeta manila con documentos mecanografiados: las órdenes de construcción del Muro firmadas el 3 de agosto de 1961, diez días antes del anuncio oficial. Hay firmas de tres generales soviéticos y el sello del SED. Suficiente para demostrar que Ulbricht mintió.'
  },
  uniforme_vopo: {
    name: 'uniforme de la Volkspolizei',
    nouns: ['uniforme', 'vopo', 'traje', 'ropa', 'gorra', 'disfraz'],
    location: 'almacen',
    portable: true,
    desc: 'Uniforme completo de la Volkspolizei: chaqueta azul, pantalón, cinturón y gorra. La talla es aproximada pero serviría para un control rápido. Con esto y sin documentos, podrías pasar como un agente de relevo.'
  },
  mapa_tunel: {
    name: 'mapa del túnel',
    nouns: ['mapa', 'plano', 'ruta', 'croquis', 'instrucciones'],
    location: 'inv_virtual',
    portable: false,
    desc: 'Las coordenadas de la trampilla que Bonn mandó por radio: estación Stadtbahn, andén sur, trampilla al fondo del andén. El túnel lleva al callejón de Kreuzberg. Tiempo estimado: once minutos.'
  }
};

function itemByNoun(t, pool) {
  const tl = t.toLowerCase().trim();
  for (const id of pool) {
    const it = ITEMS[id];
    if (!it) continue;
    for (const n of it.nouns) {
      if (n === tl || tl.includes(n) || n.includes(tl)) return id;
    }
  }
  return null;
}

function allAtRoom(room) {
  return Object.keys(ITEMS).filter(id => ITEMS[id].location === room);
}

function inInv(id) { return S.inv.includes(id); }

function roomPool() {
  return [...S.inv, ...allAtRoom(S.room)];
}

// ── PARTIDAS ──────────────────────────────────────────────────────────────────

const SAVE_PREFIX = 'muro_';

function saveGame(slot) {
  const d = {
    room: S.room, score: S.score, turns: S.turns,
    inv: [...S.inv], flags: {...S.flags},
    itemLocations: {}
  };
  for (const id of Object.keys(ITEMS)) d.itemLocations[id] = ITEMS[id].location;
  try {
    localStorage.setItem(SAVE_PREFIX + slot, JSON.stringify(d));
    pr(`Partida guardada en ranura ${slot}.`, 'ok');
  } catch(e) { pr('No se pudo guardar.', 'bad'); }
}

function loadGame(slot) {
  try {
    const raw = localStorage.getItem(SAVE_PREFIX + slot);
    if (!raw) { pr(`No hay partida en ranura ${slot}.`, 'bad'); return; }
    const d = JSON.parse(raw);
    S.room = d.room; S.score = d.score; S.turns = d.turns;
    S.inv = d.inv; Object.assign(S.flags, d.flags);
    for (const [id, loc] of Object.entries(d.itemLocations)) {
      if (ITEMS[id]) ITEMS[id].location = loc;
    }
    updateScore();
    pr(`Partida ${slot} cargada.`, 'ok');
    describeRoom();
  } catch(e) { pr('Error al cargar la partida.', 'bad'); }
}

function autoSave() {
  const d = {
    room: S.room, score: S.score, turns: S.turns,
    inv: [...S.inv], flags: {...S.flags},
    itemLocations: {}
  };
  for (const id of Object.keys(ITEMS)) d.itemLocations[id] = ITEMS[id].location;
  try { localStorage.setItem(SAVE_PREFIX + 'auto', JSON.stringify(d)); } catch(e) {}
}

// ── DESCRIPCIÓN DE SALA ───────────────────────────────────────────────────────

function describeRoom() {
  const r = ROOMS[S.room];
  pr('─'.repeat(50), 'sep');
  pr(r.name.toUpperCase(), 'loc');
  pr(r.desc, 'desc');

  const here = allAtRoom(S.room);
  if (here.length) {
    pr('Puedes ver: ' + here.map(id => ITEMS[id].name).join(', ') + '.', 'data');
  }

  const exits = Object.keys(r.exits);
  if (exits.length) pr('Salidas: ' + exits.join(', ') + '.', 'dim');
  else if (S.room !== 'berlin_oeste') pr('No hay salidas.', 'dim');
}

// ── EVENTOS AL ENTRAR ─────────────────────────────────────────────────────────

function _onEnterRoom(tgt) {
  if (tgt === 'cafeteria' && !S.flags.sc_cafeteria) {
    S.flags.sc_cafeteria = true;
    addScore(10, 'contacto localizado');
    pr('Hans te hace un gesto sutil con la cabeza. Lleva aquí dos horas esperando.', 'desc');
  }
  if (tgt === 'edificio_hanna' && !S.flags.sc_edificio) {
    S.flags.sc_edificio = true;
    addScore(10, 'edificio de Hanna encontrado');
  }
  if (tgt === 'calle_friedrichstrasse' && !S.flags.murallaVista) {
    S.flags.murallaVista = true;
    if (!S.flags.sc_muralla) {
      S.flags.sc_muralla = true;
      addScore(20, 'primera vista del muro en construcción');
    }
    pr('Al final de la avenida, bajo los focos, ves lo que llevan horas montando: rollos de alambre de espino, bloques de hormigón apilados, soldados con cascos y fusiles. El muro existe ya aunque no tenga ni un metro de altura.', 'warn');
  }
  if (tgt === 'estacion_metro' && !S.flags.sc_estacion) {
    S.flags.sc_estacion = true;
    addScore(15, 'entrada al metro clandestino');
    pr('El andén huele a tierra húmeda y a óxido. Alguien estuvo aquí recientemente: hay huellas en el polvo que van hacia la trampilla.', 'desc');
  }
  if (tgt === 'berlin_oeste' && !S.flags.finalStarted) {
    _finalTunel();
  }
}

// ── MOVIMIENTO ────────────────────────────────────────────────────────────────

function doMove(dir) {
  const r = ROOMS[S.room];

  if (S.room === 'calle_friedrichstrasse' && dir === 'oeste') {
    if (!S.flags.llavesTomadas) {
      pr('La verja del metro está cerrada con candado. Necesitas una llave.', 'bad');
      return;
    }
    S.room = 'estacion_metro';
    describeRoom();
    _onEnterRoom('estacion_metro');
    return;
  }

  if (S.room === 'estacion_metro_cerrada') {
    if (dir === 'oeste' || dir === 'abajo' || dir === 'sur' || dir === 'este') {
      S.room = dir === 'este' ? 'calle_friedrichstrasse' : 'estacion_metro';
      describeRoom();
      _onEnterRoom(S.room);
      return;
    }
  }

  const tgt = r.exits[dir];
  if (!tgt) { pr('No puedes ir en esa dirección.', 'bad'); return; }
  S.room = tgt;
  describeRoom();
  _onEnterRoom(tgt);
}

// ── COGER ─────────────────────────────────────────────────────────────────────

function doTake(t) {
  if (!t) { pr('¿Coger qué?', 'bad'); return; }
  const id = itemByNoun(t, allAtRoom(S.room));
  if (!id) { pr('No ves eso aquí.', 'bad'); return; }
  if (!ITEMS[id].portable) { pr('No puedes llevarte eso.', 'bad'); return; }
  ITEMS[id].location = 'inv';
  S.inv.push(id);
  pr(`Coges ${ITEMS[id].name}.`, 'ok');

  if (id === 'bateria_radio' && !S.flags.sc_bateria) {
    S.flags.bateriaTomada = true;
    S.flags.sc_bateria = true;
    addScore(10, 'batería de emergencia recogida');
  }
  if (id === 'llaves_metro' && !S.flags.sc_llaves) {
    S.flags.llavesTomadas = true;
    S.flags.sc_llaves = true;
    addScore(10, 'acceso al metro clandestino');
  }
  if (id === 'documentos_hanna' && !S.flags.sc_documentos) {
    S.flags.documentosTomados = true;
    S.flags.sc_documentos = true;
    addScore(25, 'documentos clasificados recuperados');
  }
  if (id === 'uniforme_vopo' && !S.flags.sc_uniforme) {
    S.flags.uniformeTomado = true;
    S.flags.sc_uniforme = true;
    addScore(10, 'disfraz de Volkspolizei');
  }
}

// ── SOLTAR ─────────────────────────────────────────────────────────────────────

function doDrop(t) {
  if (!t) { pr('¿Soltar qué?', 'bad'); return; }
  const id = itemByNoun(t, S.inv);
  if (!id) { pr('No llevas eso.', 'bad'); return; }
  S.inv.splice(S.inv.indexOf(id), 1);
  ITEMS[id].location = S.room;
  pr(`Dejas ${ITEMS[id].name} aquí.`, 'ok');
}

// ── INVENTARIO ────────────────────────────────────────────────────────────────

function doInventory() {
  if (!S.inv.length) { pr('No llevas nada.', 'dim'); return; }
  pr('Llevas: ' + S.inv.map(id => ITEMS[id].name).join(', ') + '.', 'data');
}

// ── EXAMINAR ──────────────────────────────────────────────────────────────────

function doExamine(t) {
  if (!t) { pr('¿Examinar qué?', 'bad'); return; }
  const id = itemByNoun(t, roomPool());
  if (id) { pr(ITEMS[id].desc, 'desc'); return; }

  const tl = t.toLowerCase();

  if (tl.includes('hans') || tl.includes('contacto')) {
    pr('Hans Brauer, 44 años, empleado de la Reichsbahn desde hace doce. Luce una cicatriz en la mejilla izquierda. Fue él quien excavó la trampilla del metro con otros tres hombres durante los últimos cuatro meses.', 'desc');
    return;
  }
  if (tl.includes('hanna') || tl.includes('informante')) {
    pr('Hanna Stein, 32 años, profesora de historia en el Gymnasium Heinrich Heine. Ojos claros, pelo corto, voz que no tiembla. Lleva cuatro años pasando información. Esta noche, quiere cruzar.', 'desc');
    return;
  }
  if ((tl.includes('radio') || tl.includes('transmisor')) && S.room === 'apartamento') {
    if (!S.flags.radioExaminada) {
      S.flags.radioExaminada = true;
      pr('La radio portátil funciona con batería de 12V — el compartimento está vacío. La frecuencia 8.420 MHz es la de emergencia de la BND. Si la cargas y la enciendes, Bonn podría darte la ruta del túnel.', 'desc');
    } else {
      pr(ITEMS['radio_portatil'].desc, 'desc');
    }
    return;
  }
  if (tl.includes('ventana') || tl.includes('calle') || tl.includes('barricada') || tl.includes('muro') || tl.includes('alambre')) {
    pr('Desde aquí se ve la franja iluminada donde el muro crece centímetro a centímetro. Camiones, soldados, órdenes en voz baja. Berlin se parte en dos esta noche.', 'desc');
    return;
  }
  if (tl.includes('trampilla') || tl.includes('andén') || tl.includes('suelo') || tl.includes('metro')) {
    pr('Una trampilla de hierro forzada, con una escalera de madera que baja a la oscuridad. El trabajo es de aficionado pero sólido. Huele a tierra húmeda y cemento fresco.', 'desc');
    return;
  }
  pr('No encuentras nada relevante.', 'bad');
}

// ── LEER ─────────────────────────────────────────────────────────────────────

function doRead(t) {
  if (!t) { pr('¿Leer qué?', 'bad'); return; }
  const tl = t.toLowerCase();

  if (tl.includes('carta') || tl.includes('nota') || tl.includes('mensaje') || tl.includes('sobre')) {
    if (!inInv('carta_hanna')) { pr('No llevas ninguna carta.', 'bad'); return; }
    if (!S.flags.cartaLeida) {
      S.flags.cartaLeida = true;
      addScore(15, 'misión comprendida');
    }
    pr(ITEMS['carta_hanna'].desc, 'desc');
    pr('La dirección está en el margen: Schönhauser Allee 38, 3.º B.', 'hint');
    return;
  }
  if (tl.includes('documento') || tl.includes('prueba') || tl.includes('orden') || tl.includes('carpeta') || tl.includes('papel')) {
    if (!inInv('documentos_hanna')) { pr('No llevas los documentos.', 'bad'); return; }
    if (!S.flags.documentosLeidos) {
      S.flags.documentosLeidos = true;
      addScore(20, 'documentos clasificados leídos');
    }
    pr('Órdenes de construcción del Berliner Mauer fechadas el 3 de agosto de 1961. Firma: General Ivan Yakubovsky, Mariscal Konev, y —con sello rojo— Erich Honecker. El anuncio público no llegó hasta el día 13. Diez días de mentira documentada.', 'desc');
    return;
  }
  if (tl.includes('mapa') || tl.includes('plano') || tl.includes('ruta')) {
    if (!S.flags.mapaEncontrado) { pr('No tienes ningún mapa.', 'bad'); return; }
    pr('Estación Stadtbahn — andén sur — trampilla al fondo. El túnel mide noventa metros. Callejón de Kreuzberg, Berlín Oeste. La furgoneta de extracción espera allí hasta las 05:00.', 'desc');
    return;
  }
  doExamine(t);
}

// ── HABLAR ────────────────────────────────────────────────────────────────────

function doTalk(t) {
  if (!t) { pr('¿Hablar con quién?', 'bad'); return; }
  const tl = t.toLowerCase();

  if (tl.includes('hans') || tl.includes('contacto') || tl.includes('cafe') || tl.includes('danzig')) {
    if (S.room !== 'cafeteria') { pr('Hans no está aquí.', 'bad'); return; }
    if (!S.flags.hansHablado) {
      S.flags.hansHablado = true;
      if (!S.flags.sc_hans) {
        S.flags.sc_hans = true;
        addScore(15, 'información del contacto');
      }
      pr('"Tienes hora y media, quizá dos" —dice Hans en voz baja—. "El túnel está listo. La trampilla es en el metro Stadtbahn, andén sur. Necesitarás la llave maestra de la Reichsbahn."', 'desc');
      pr('Hans desliza un juego de llaves por la mesa sin mirarte.', 'ok');
      if (!inInv('llaves_metro')) {
        ITEMS['llaves_metro'].location = 'inv';
        S.inv.push('llaves_metro');
        if (!S.flags.sc_llaves) {
          S.flags.llavesTomadas = true;
          S.flags.sc_llaves = true;
          addScore(10, 'acceso al metro clandestino');
        }
        pr('Coges las llaves del metro.', 'ok');
      }
    } else if (!S.flags.mapaEncontrado) {
      pr('"Ya tienes la llave" —dice Hans—. "Enciende la radio primero. Bonn tiene detalles del túnel que yo no sé."', 'hint');
    } else {
      pr('"Ve. Llevas aquí demasiado tiempo ya" —dice Hans sin mirarte, los ojos fijos en la puerta—.', 'desc');
    }
    return;
  }

  if (tl.includes('hanna') || tl.includes('profesora') || tl.includes('informante')) {
    if (S.room !== 'apartamento_hanna') { pr('Hanna no está aquí.', 'bad'); return; }
    if (!S.flags.hannaHablada) {
      S.flags.hannaHablada = true;
      if (!S.flags.sc_hanna_hablada) {
        S.flags.sc_hanna_hablada = true;
        addScore(20, 'contacto con la informante');
      }
      pr('"Klaus." La voz de Hanna no tiembla. "Tengo los documentos. Y no pienso quemarlos." Señala la carpeta sobre la mesa. "Tú decides si me sacas o solo te llevas el papel."', 'desc');
      pr('Hay algo en su mirada que ya ha tomado la decisión por ella.', 'desc');
    } else if (!S.flags.hannaConvencida) {
      pr('"¿Vienes o no?" —pregunta Hanna—. Responde CONVENCER para que venga contigo, o CONTINUAR para marcharte solo.', 'hint');
    } else {
      pr('"Estoy lista" —dice Hanna—. "Dime cuándo."', 'desc');
    }
    return;
  }
  pr('No hay nadie aquí con quien hablar.', 'bad');
}

// ── CONVENCER ─────────────────────────────────────────────────────────────────

function doConvencer() {
  if (S.room !== 'apartamento_hanna') {
    pr('No hay nadie a quien convencer aquí.', 'bad'); return;
  }
  if (!S.flags.hannaHablada) {
    pr('Primero tendrás que hablar con Hanna.', 'bad'); return;
  }
  if (S.flags.hannaConvencida) {
    pr('Hanna ya viene contigo.', 'ok'); return;
  }
  S.flags.hannaConvencida = true;
  if (!S.flags.sc_hanna_conv) {
    S.flags.sc_hanna_conv = true;
    addScore(15, 'informante convencida para la extracción');
  }
  pr('"De acuerdo" —dices—. "Los dos. Con los documentos."', 'ok');
  pr('Hanna coge la carpeta, se pone el abrigo y te mira: "¿Por dónde?"', 'desc');
  if (!inInv('documentos_hanna') && ITEMS['documentos_hanna'].location === 'apartamento_hanna') {
    ITEMS['documentos_hanna'].location = 'inv';
    S.inv.push('documentos_hanna');
    if (!S.flags.sc_documentos) {
      S.flags.documentosTomados = true;
      S.flags.sc_documentos = true;
      addScore(25, 'documentos clasificados recuperados');
    }
    pr('Hanna te entrega los documentos. Los guardas.', 'ok');
  }
}

// ── ENCENDER RADIO ────────────────────────────────────────────────────────────

function doEncenderRadio() {
  if (!inInv('radio_portatil') && ITEMS['radio_portatil'].location !== S.room) {
    pr('No hay ninguna radio aquí.', 'bad'); return;
  }
  if (S.flags.radioEncendida) {
    pr('La radio ya está encendida. El mapa del túnel ya lo tienes.', 'ok'); return;
  }
  if (!inInv('bateria_radio') && ITEMS['bateria_radio'].location !== S.room) {
    pr('La radio necesita una batería de 12V. El compartimento está vacío.', 'bad'); return;
  }
  if (!inInv('bateria_radio')) {
    ITEMS['bateria_radio'].location = 'inv';
    S.inv.push('bateria_radio');
    if (!S.flags.sc_bateria) {
      S.flags.bateriaTomada = true;
      S.flags.sc_bateria = true;
      addScore(10, 'batería de emergencia recogida');
    }
    pr('Instalas la batería en la radio.', 'ok');
  } else {
    pr('Insertas la batería en la radio. El indicador de frecuencia cobra vida.', 'ok');
  }
  S.flags.radioEncendida = true;
  if (!S.flags.sc_radio) {
    S.flags.sc_radio = true;
    addScore(15, 'comunicación con Bonn establecida');
  }
  pr('Sintonizas 8.420 MHz. Estática, luego una voz entrecortada: "Klaus, aquí Bonn. Escucha. Estación Stadtbahn, andén sur, trampilla al fondo del andén. El túnel mide noventa metros. Callejón de Kreuzberg. La furgoneta espera hasta las cinco."', 'big');
  pr('Silencio. La voz no vuelve.', 'desc');
  S.flags.mapaEncontrado = true;
  if (!S.flags.sc_mapa) {
    S.flags.sc_mapa = true;
    addScore(20, 'ruta de extracción confirmada');
  }
  pr('Tienes la ruta del túnel: metro Stadtbahn → trampilla → túnel → Kreuzberg.', 'hint');
}

// ── ABRIR / USAR ──────────────────────────────────────────────────────────────

function doAbrir(t) {
  const tl = (t || '').toLowerCase();
  if (tl.includes('candado') || tl.includes('puerta') || tl.includes('verja') || tl.includes('metro') || tl.includes('llave')) {
    if (S.room === 'calle_friedrichstrasse' || S.room === 'estacion_metro_cerrada') {
      if (S.flags.llavesTomadas) {
        pr('Con la llave de Hans, abres el candado. La verja del metro cede.', 'ok');
        S.room = 'estacion_metro';
        describeRoom();
        _onEnterRoom('estacion_metro');
      } else {
        pr('El candado necesita una llave específica de la Reichsbahn.', 'bad');
      }
      return;
    }
  }
  pr('No sé cómo abrir eso aquí.', 'bad');
}

function doUsar(t) {
  const tl = (t || '').toLowerCase();
  if (tl.includes('radio') || tl.includes('transmisor') || tl.includes('receptor')) {
    doEncenderRadio(); return;
  }
  if (tl.includes('batería') || tl.includes('bateria') || tl.includes('pila')) {
    doEncenderRadio(); return;
  }
  if (tl.includes('llave') || tl.includes('llaves') || tl.includes('candado')) {
    doAbrir(t); return;
  }
  if (tl.includes('pasaporte') || tl.includes('documento')) {
    doFinalCheckpoint(); return;
  }
  if (tl.includes('uniforme') || tl.includes('vopo') || tl.includes('disfraz')) {
    if (!inInv('uniforme_vopo')) { pr('No llevas el uniforme.', 'bad'); return; }
    if (S.room === 'puesto_control') { doFinalCheckpoint(); return; }
    pr('Te pondrías el uniforme en el puesto de control para pasar.', 'hint');
    return;
  }
  pr('No sé cómo usar eso aquí.', 'bad');
}

// ── FINALES ──────────────────────────────────────────────────────────────────

function _finalEnd(pts) {
  S.flags.finalStarted = true;
  addScore(pts, 'final completado');
  pr('─'.repeat(50), 'sep');
  pr(`Puntuación final: ${S.score} / 250`, 'big');
  pr('Escribe REINICIAR para empezar de nuevo.', 'dim');
  INP.disabled = true;
}

function doFinalCheckpoint() {
  if (S.room !== 'puesto_control') {
    pr('No estás en el puesto de control.', 'bad'); return;
  }
  if (S.flags.finalStarted) return;

  S.flags.finalStarted = true;
  S.flags.checkpointIntentado = true;
  if (!S.flags.sc_checkpoint) {
    S.flags.sc_checkpoint = true;
    addScore(10, 'intento de cruce en el checkpoint');
  }

  const tieneUniforme = inInv('uniforme_vopo');
  const tieneDocs = inInv('documentos_hanna');

  pr('─'.repeat(50), 'sep');
  if (tieneUniforme) {
    pr('FIN I — EL AGENTE', 'end1');
    pr('─'.repeat(50), 'sep');
    pr('Te pones la gorra de la Volkspolizei y cruzas la garita a paso firme.', 'end1');
    pr('"Relevo de turno" —dices en alemán del Este perfecto—. El guardia te estudia medio segundo.', 'end1');
    pr('"Adelante, camarada."', 'end1');
    pr('Cruzas la franja de tierra de nadie sin correr. Las luces de Berlín Oeste crecen. A tus espaldas, el muro sigue creciendo.', 'end1');
    pr('Hanna se quedó en su apartamento. Quizá mañana, quizá nunca.', 'end1');
    if (tieneDocs) {
      pr('Los documentos llegan a Bonn antes del amanecer. La Historia los archivará durante décadas.', 'end1');
    } else {
      pr('Saliste solo, sin pruebas. La misión fracasó en lo que importaba.', 'dim');
    }
  } else if (inInv('pasaporte_falso')) {
    pr('FIN I — EL AGENTE (pasaporte falso)', 'end1');
    pr('─'.repeat(50), 'sep');
    pr('Caminas hacia la garita con el pasaporte en la mano. Karl Werner Schreiber, fotógrafo. El guardia lo examina bajo el foco.', 'end1');
    pr('Treinta segundos. Cuarenta. Le miras a los ojos sin parpadear.', 'end1');
    pr('"Puede pasar."', 'end1');
    pr('Cruzas a Berlín Oeste. Las rodillas no te fallan hasta que estás a salvo de las luces.', 'end1');
    pr('Hanna se quedó al otro lado del muro. Aquí no hay héroes, solo supervivientes.', 'end1');
    if (tieneDocs) {
      pr('Los documentos llegan a Bonn. La mentira quedará probada, aunque tarde décadas en importar.', 'end1');
    }
  } else {
    pr('Un guardia sale de la garita: "¡Alto! ¡Dokumenten!"', 'bad');
    pr('No tienes pasaporte ni uniforme. Te detienen allí mismo. El muro lleva siete horas en pie cuando te meten en el furgón.', 'bad');
    pr('FIN — DETENIDO', 'bad');
  }
  _finalEnd(20);
}

function _finalTunel() {
  if (S.flags.finalStarted) return;
  S.flags.finalStarted = true;

  pr('─'.repeat(50), 'sep');

  if (S.flags.hannaConvencida) {
    pr('FIN II — EL RESCATE', 'end2');
    pr('─'.repeat(50), 'sep');
    pr('Sales del túnel a cuatro patas, y detrás de ti aparece la mano de Hanna buscando apoyo en el suelo húmedo.', 'end2');
    pr('Os ponéis de pie en el callejón de Kreuzberg. Aire libre. Luz de farola. A trescientos metros, la furgoneta con las placas de la BRD.', 'end2');
    pr('Hanna mira atrás —no al muro, sino hacia su ciudad— y no dice nada.', 'end2');
    if (inInv('documentos_hanna')) {
      pr('La carpeta con los documentos llega a Bonn con el amanecer. Los generales que firmaron el 3 de agosto nunca olvidarán sus nombres.', 'end2');
      pr('La Historia no siempre da el crédito que merece. Pero esta vez los documentos hablan.', 'end2');
    } else {
      pr('Sin los documentos, la historia oficial aguantará décadas más. Pero Hanna está a salvo, y eso también importa.', 'end2');
    }
  } else if (inInv('documentos_hanna')) {
    pr('FIN III — LOS DOCUMENTOS', 'end3');
    pr('─'.repeat(50), 'sep');
    pr('Sales solo del túnel. El callejón de Kreuzberg huele a lluvia reciente.', 'end3');
    pr('La furgoneta arranca antes de que cierres la puerta. El conductor no hace preguntas.', 'end3');
    pr('Los documentos llegan a Bonn. La mentira de Ulbricht quedará probada, aunque tardará veinte años en importar.', 'end3');
    pr('Hanna se quedó. Quizá creía que podía esperar otra noche. El muro no esperó.', 'end3');
  } else {
    pr('FIN III — LA HUIDA VACÍA', 'end3');
    pr('─'.repeat(50), 'sep');
    pr('Sales del túnel a manos vacías. Sin Hanna. Sin documentos.', 'end3');
    pr('La misión fracasó en todo lo que importaba. Pero estás vivo.', 'end3');
    pr('En el informe que enviarás a Bonn no habrá palabras para esto.', 'end3');
  }
  _finalEnd(20);
}

function doFinalQuedar() {
  if (S.room !== 'apartamento' && S.room !== 'calle_prenzlauer') {
    pr('Para quedarte, tienes que tomar esa decisión en tu apartamento o en la calle.', 'bad'); return;
  }
  if (!inInv('pasaporte_falso')) {
    pr('Has tirado el pasaporte. Ya no hay nada que quemar — y ya no hay vuelta atrás de otra manera.', 'hint'); return;
  }
  if (S.flags.finalStarted) return;
  S.flags.finalStarted = true;

  pr('─'.repeat(50), 'sep');
  pr('FIN IV — EL MURO', 'end4');
  pr('─'.repeat(50), 'sep');
  pr('Sacas el pasaporte falso. Karl Werner Schreiber. Un hombre que no existe.', 'end4');
  pr('Lo quemas sobre el fregadero. El papel prende despacio, luego todo a la vez.', 'end4');
  pr('Cuando las llamas se apagan, te llamas Klaus Berger. Eres de Prenzlauer Berg. Llevas aquí toda la vida.', 'end4');
  pr('El muro existe. Tú también existes. Son cosas distintas.', 'end4');
  pr('A las 06:30 suena el despertador como todos los días. Tienes que decidir qué hacer con los próximos veintiocho años.', 'end4');
  _finalEnd(10);
}

// ── TURNO ─────────────────────────────────────────────────────────────────────

function _advanceTurn() {
  S.turns++;
  autoSave();
  const hints = { 5: 'Si tienes la carta de Hanna, léela para saber adónde ir.', 12: 'La radio del apartamento necesita una batería. ¿Dónde puede haber una cerca del edificio de Hanna?', 18: 'Para cruzar necesitas: el metro → trampilla → túnel. Hans tiene la llave.', 25: 'El muro no espera. El tiempo se acaba.', 30: 'Tienes varias opciones: checkpoint, túnel, o quedarte. Cada una es un final diferente.' };
  if (hints[S.turns]) pr(`[PISTA: ${hints[S.turns]}]`, 'hint');
}

// ── AYUDA ─────────────────────────────────────────────────────────────────────

function doHelp() {
  pr('── COMANDOS ──────────────────────', 'sep');
  pr('N/S/E/O/ARRIBA/ABAJO · COGER · DEJAR · INVENTARIO', 'data');
  pr('EXAMINAR · LEER · HABLAR CON · CONVENCER · ABRIR', 'data');
  pr('USAR · ENCENDER · CRUZAR · QUEDARSE · QUEMAR', 'data');
  pr('GUARDAR 1/2/3 · CARGAR 1/2/3 · AYUDA · REINICIAR', 'data');
  pr('── PISTAS ────────────────────────', 'sep');
  pr('· Lee la carta de Hanna para saber adónde ir primero.', 'hint');
  pr('· La radio del apartamento necesita batería para conectar con Bonn.', 'hint');
  pr('· Hans en el café sabe cómo llegar al túnel.', 'hint');
  pr('· Hay más de una forma de cruzar, y más de un final.', 'hint');
}

// ── PARSER ────────────────────────────────────────────────────────────────────

INP.addEventListener('keydown', function(e) {
  if (e.key !== 'Enter') return;
  const raw = INP.value.trim();
  INP.value = '';
  if (!raw) return;
  pr('> ' + raw, 'cmd');
  if (typing) return;
  const cmd = raw.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  parse(cmd, raw);
  _advanceTurn();
});

function parse(cmd, raw) {
  if (S.flags.finalStarted && cmd !== 'reiniciar' && cmd !== 'nueva partida') {
    pr('La partida ha terminado. Escribe REINICIAR para empezar de nuevo.', 'dim'); return;
  }

  // Movimiento
  const dirMap = {
    'n': 'norte', 'norte': 'norte', 's': 'sur', 'sur': 'sur',
    'e': 'este', 'este': 'este', 'o': 'oeste', 'oeste': 'oeste',
    'arriba': 'arriba', 'subir': 'arriba', 'sube': 'arriba', 'bajar': 'abajo',
    'abajo': 'abajo', 'baja': 'abajo'
  };
  if (dirMap[cmd]) { doMove(dirMap[cmd]); return; }

  // Extraer verbo y objeto
  const verbRe = /^(\S+(?:\s+\S+)?)\s+(.*)/;
  let verb = cmd, obj = '';
  const m = cmd.match(verbRe);
  if (m) { verb = m[1]; obj = m[2].trim(); }

  // Alias de verbo
  const verbAlias = {
    'coge': 'coger', 'toma': 'coger', 'tomar': 'coger', 'recoge': 'coger', 'recoger': 'coger',
    'deja': 'dejar', 'suelta': 'dejar', 'soltar': 'dejar', 'drop': 'dejar',
    'x': 'examinar', 'ex': 'examinar', 'mira': 'examinar', 'mirar': 'examinar', 'inspecciona': 'examinar', 'inspeccionar': 'examinar',
    'lee': 'leer',
    'habla': 'hablar', 'hablar': 'hablar', 'hablar con': 'hablar', 'habla con': 'hablar', 'pregunta': 'hablar', 'preguntar': 'hablar',
    'inv': 'inventario', 'i': 'inventario', 'bolsillos': 'inventario',
    'm': 'mirar sala', 'look': 'mirar sala',
    'usa': 'usar', 'utiliza': 'usar',
    'abre': 'abrir', 'desbloquea': 'abrir',
    'enciende': 'encender', 'activa': 'encender',
    'cruza': 'cruzar', 'pasa': 'cruzar', 'paso': 'cruzar', 'pasar': 'cruzar',
    'queda': 'quedarse', 'quedo': 'quedarse',
    'quema': 'quemar',
    'convence': 'convencer',
    'guarda': 'guardar', 'salva': 'guardar',
    'carga': 'cargar',
    'reinicia': 'reiniciar',
    'ayuda': 'ayuda', 'help': 'ayuda', 'socorro': 'ayuda',
    'busca': 'buscar',
  };
  verb = verbAlias[verb] || verb;

  switch (verb) {
    case 'coger':       doTake(obj); return;
    case 'dejar':       doDrop(obj); return;
    case 'inventario':  doInventory(); return;
    case 'examinar':    doExamine(obj || cmd.replace(/^x\s*/,'').replace(/^ex\s*/,'')); return;
    case 'leer':        doRead(obj); return;
    case 'hablar':      doTalk(obj); return;
    case 'convencer':   doConvencer(); return;
    case 'usar':        doUsar(obj); return;
    case 'abrir':       doAbrir(obj); return;
    case 'encender':
      if (!obj || obj.includes('radio') || obj.includes('transmisor') || obj.includes('receptor')) {
        doEncenderRadio();
      } else {
        pr('No puedes encender eso.', 'bad');
      }
      return;
    case 'cruzar':
      if (S.room === 'puesto_control') { doFinalCheckpoint(); return; }
      if (S.room === 'tunel_entrada' || S.room === 'tunel') { doMove('sur'); return; }
      pr('No hay nada que cruzar aquí.', 'bad'); return;
    case 'quedarse':    doFinalQuedar(); return;
    case 'quemar':
      if ((obj.includes('pasaporte') || obj.includes('documento') || !obj) &&
          (S.room === 'apartamento' || S.room === 'calle_prenzlauer')) {
        doFinalQuedar(); return;
      }
      pr('No puedes quemar eso aquí.', 'bad'); return;
    case 'mirar sala':
    case 'mirar':
      if (!obj) { describeRoom(); return; }
      doExamine(obj); return;
    case 'buscar':
      if (!obj) { doExamine(S.room); return; }
      doExamine(obj); return;
    case 'guardar':
      if (obj === '1' || obj === '2' || obj === '3') { saveGame(obj); }
      else { pr('Especifica ranura: GUARDAR 1, 2 o 3.', 'bad'); }
      return;
    case 'cargar':
      if (obj === '1' || obj === '2' || obj === '3') { loadGame(obj); }
      else if (obj === 'auto' || !obj) { loadGame('auto'); }
      else { pr('Especifica ranura: CARGAR 1, 2 o 3.', 'bad'); }
      return;
    case 'reiniciar':
    case 'nueva partida':
      location.reload(); return;
    case 'ayuda':       doHelp(); return;
    case 'puntuacion': case 'score': case 'pts':
      pr(`Puntuación: ${S.score} / 250 — Turno ${S.turns}.`, 'data'); return;
    default:
      pr('No entiendo eso. Escribe AYUDA para ver los comandos.', 'bad');
  }
}

// ── ARRANQUE ──────────────────────────────────────────────────────────────────

function init() {
  pr(''); pr('');
  pr('██╗   ██╗██╗██████╗ ██╗   ██╗██╗██████╗ ██████╗  ██████╗ ███████╗', 'big');
  pr('██║   ██║██║██╔══██╗██║   ██║██║██╔══██╗██╔══██╗██╔═══██╗██╔════╝', 'big');
  pr('██║   ██║██║██████╔╝███████║██║██████╔╝██████╔╝██║   ██║███████╗', 'big');
  pr('╚██╗ ██╔╝██╔══╝██╔═══╝     ██╔══╝██╔══██╗██╔══██╗██╔══╝', 'big');
  pr(' ╚████╔╝ ██║██║ ██║         ██║██╔══██╗██╔══██╗ ╚██████╔╝███████║', 'big');
  pr('  ╚═══╝  ╚═╝╚═╝ ╚═╝         ╚═╝╚═╝  ╚═╝╚═╝  ╚═╝  ╚═════╝ ╚══════╝', 'big');
  pr('');
  pr('E L   M U R O', 'loc');
  pr('─'.repeat(50), 'sep');
  pr('Berlín, 13 de agosto de 1961. 02:14.', 'desc');
  pr('');
  pr('Eres Klaus Berger, agente de la BND (inteligencia de Alemania Occidental).', 'desc');
  pr('Cruzaste al Berlín Este esta tarde para una reunión rutinaria. A las 22:00,', 'desc');
  pr('la radio de onda corta captó un mensaje urgente: los soviéticos llevan horas', 'desc');
  pr('sellando el sector oriental. Hay alambre de espino en Friedrichstrasse.', 'desc');
  pr('');
  pr('Tu informante, Hanna, te dejó una nota antes de que empezara todo.', 'desc');
  pr('Dice que tiene documentos que prueban que el Muro se planificó en secreto.', 'desc');
  pr('');
  pr('Tienes hasta el amanecer para cruzar. Con ella, sin ella, o no cruzar.', 'warn');
  pr('');
  pr('4 finales · 250 puntos posibles · Escribe AYUDA para ver los comandos.', 'dim');
  pr('─'.repeat(50), 'sep');

  setTimeout(() => {
    drainQueue();
    setTimeout(() => { describeRoom(); INP.focus(); }, 2200);
  }, 100);
}

init();
