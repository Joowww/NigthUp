export const bannedWords = {
  general: [
    'idiota', 'idiotas', 'estúpido', 'estúpidos', 'imbécil', 'imbéciles',
    'tonto', 'tonta', 'tontos', 'tontas', 'bobo', 'bobos',
    'burro', 'burra', 'burros', 'burras', 'zopenco', 'zopencos',
    'payaso', 'payasa', 'payasos', 'payasas', 'patético', 'patética',
    'patéticos', 'patéticas', 'mediocre', 'inútil', 'inútiles',
    'pesado', 'pesada', 'pesados', 'pesadas', 'maleducado',
    'maleducada', 'maleducados', 'maleducadas'
  ],

  strong: [
    'mierda', 'mierdas', 'puto', 'puta', 'putos', 'putas',
    'cabrón', 'cabrona', 'cabrones', 'gilipollas', 'subnormal',
    'malnacido', 'malnacida', 'hijo de puta', 'hdp', 'pendejo',
    'pendeja', 'maricón', 'zorra', 'zorras', 'perra',
    'perras', 'rata', 'ratas'
  ],

  discriminatory: [
    'escoria', 'gentuza', 'basura humana', 'despojo', 'lacra',
    'plaga', 'subhumano', 'subhumanos', 'apestoso', 'apestosa',
    'repugnante', 'repugnantes'
  ],

  sexual: [
    'pene', 'vagina', 'coño', 'polla', 'pollas', 'tetas', 'tetillas',
    'culo', 'culos', 'follar', 'folla', 'follas', 'follen',
    'joder', 'jodido', 'jodida', 'sexo explícito',
    'pornografía', 'porno'
  ],

  drugs: [
    'coca', 'cocaína', 'heroína', 'éxtasis', 'mdma', 'lsd',
    'marihuana', 'porro', 'porros', 'speed', 'anfeta',
    'metanfetamina', 'ketamina', 'crack'
  ],

  violence: [
    'matar', 'mátate', 'matarte', 'asesinar', 'golpear',
    'apaleado', 'apuñalar', 'apuñalado', 'amenaza', 'amenazarte'
  ],

  selfHarm: [
    'suicidio', 'suicidarse', 'cortarse', 'autolesión',
    'quiero morir', 'me quiero morir'
  ],

  spam: [
    'http://', 'https://', 'www.', 'haz clic aquí', 'click aquí',
    'gana dinero rápido', 'multinivel'
  ]
};

export const allBannedWords = [
  ...bannedWords.general,
  ...bannedWords.strong,
  ...bannedWords.discriminatory,
  ...bannedWords.sexual,
  ...bannedWords.drugs,
  ...bannedWords.violence,
  ...bannedWords.selfHarm,
  ...bannedWords.spam
];


export const wordSeverity: Record<string, 'low' | 'medium' | 'high' | 'critical'> = {
  ...Object.fromEntries(bannedWords.general.map(w => [w, 'low' as const])),


  ...Object.fromEntries(bannedWords.sexual.map(w => [w, 'medium' as const])),


  ...Object.fromEntries([
    ...bannedWords.strong.map(w => [w, 'high' as const]),
    ...bannedWords.violence.map(w => [w, 'high' as const]),
    ...bannedWords.drugs.map(w => [w, 'high' as const])
  ]),


  ...Object.fromEntries([
    ...bannedWords.discriminatory.map(w => [w, 'critical' as const]),
    ...bannedWords.selfHarm.map(w => [w, 'critical' as const]),
    ...bannedWords.spam.map(w => [w, 'critical' as const])
  ])
};
