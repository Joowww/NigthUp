export const bullyingPatterns = {
  threats: [
    /te\s+voy\s+a\s+matar/i,
    /voy\s+a\s+matarte/i,
    /te\s+mato\b/i,
    /te\s+voy\s+a\s+(pegar|golpear|dar|romper)/i,
    /voy\s+a\s+encontrarte/i,
    /sé\s+dónde\s+vives/i,
    /te\s+voy\s+a\s+hacer\s+daño/i,
    /vas\s+a\s+ver\b/i,
    /cuidado\s+conmigo/i,
    /\bromperte\s+la\s+cara\b/i,
    /\bte\s+voy\s+a\s+reventar\b/i,
    /no\s+vas\s+a\s+salir\s+de\s+esta/i,
    /\bte\s+va\s+a\s+ir\s+mal\b/i,
    /te\s+voy\s+a\s+hacer\s+polvo/i,
    /te\s+v[o0]y\s+a\s+m[a@]t[a@]r/i,
    /m[a@]t[a@]rt[e3]/i
  ],

  // Incitación, sugerencia o validación del suicidio
  suicide: [
    /suic[ií]date/i,
    /m[aá]tate/i,
    /qu[ií]tate\s+la\s+vida/i,
    /ojal[aá]\s+te\s+mueras/i,
    /mejor\s+muerto/i,
    /el\s+mundo\s+estar[ií]a\s+mejor\s+sin\s+ti/i,
    /no\s+mereces\s+vivir/i,
    /nadie\s+te\s+extrañar[aá]/i,
    /sui[cç]-?i-?d[a@]-?te/i,
    /m[a@]-?t[a@]-?te/i
  ],

  // Acoso psicológico, humillación, manipulación emocional
  harassment: [
    /nadie\s+te\s+quiere/i,
    /todos\s+te\s+odian/i,
    /eres\s+una?\s+mierda/i,
    /no\s+vales\s+nada/i,
    /eres\s+pat[eé]tico/i,
    /das\s+pena\b/i,
    /eres\s+un[a]?\s+fracaso/i,
    /no\s+sirves\s+para\s+nada/i,
    /todo\s+el\s+mundo\s+se\s+r[ií]e\s+de\s+ti/i,
    /no\s+eres\s+normal/i,
    /c[aá]llate\s+de\s+una\s+vez/i,
    /d[aá]s\s+asco/i,
    /me\s+das\s+verg[uü]enza/i,
    /p[a@]t[e3]t[i1]c[o0]/i
  ],

  // Doxxing o amenazas relacionadas con exposición de información personal
  doxxing: [
    /voy\s+a\s+publicar/i,
    /voy\s+a\s+difundir/i,
    /voy\s+a\s+compartir\s+(tus\s+)?(fotos|datos|informaci[oó]n)/i,
    /todos\s+van\s+a\s+saber/i,
    /te\s+voy\s+a\s+arruinar\s+la\s+vida/i,
    /voy\s+a\s+exponer\s+qu[ié]n\s+eres/i,
    /(tus\s+)?datos\s+van\s+a\s+salir\s+a\s+la\s+luz/i,
    /te\s+tengo\s+localizado/i,
    /\bte\s+estoy\s+siguiendo\b/i
  ],

  sexualHarassment: [
    /manda(r)?\s+(fotos|nudes|desnudos|desnudas)/i,
    /env[ií]ame\s+(fotos|nudes)/i,
    /quiero\s+ver(te|los|las)/i,
    /te\s+voy\s+a\s+violar/i,
    /ac[eé]rcate\s+para\s+hacerte\s+cosas/i,
    /eres\s+una?\s+(puta|zorra|perra)\b/i,
    /solo\s+sirves\s+para\s+eso/i,
    /t[eé]\s+quiero\s+encima/i,
    /hazme\s+caso\s+guarra/i,
    /v[i1]0l[a@]r/i
  ],

  // Exclusión social o manipulación de grupos
  socialExclusion: [
    /nadie\s+te\s+quiere\s+aqu[ií]/i,
    /vete\s+de\s+aqu[ií]/i,
    /no\s+eres\s+bienvenido/i,
    /todos\s+estamos\s+mejor\s+sin\s+ti/i,
    /no\s+mereces\s+estar\s+aqu[ií]/i,
    /nadie\s+te\s+invita/i,
    /solo\s+molestas/i
  ],

  degradation: [
    /eres\s+un[a]?\s+in[uú]til/i,
    /no\s+tienes\s+idea/i,
    /qu[eé]\s+rid[ií]culo\s+eres/i,
    /pareces\s+un[a]?\s+animal/i,
    /eres\s+una?\s+verg[uü]enza/i,
    /no\s+piensas\s+antes\s+de\s+hablar/i,
    /tu\s+cara\s+da\s+miedo/i,
    /das\s+l[aá]stima/i
  ]
};


export const allBullyingPatterns = [
  ...bullyingPatterns.threats,
  ...bullyingPatterns.suicide,
  ...bullyingPatterns.harassment,
  ...bullyingPatterns.doxxing,
  ...bullyingPatterns.sexualHarassment,
  ...bullyingPatterns.socialExclusion,
  ...bullyingPatterns.degradation
];


export const patternSeverity: Record<string, 'critical'> = {
  threats: 'critical',
  suicide: 'critical',
  harassment: 'critical',
  doxxing: 'critical',
  sexualHarassment: 'critical',
  socialExclusion: 'critical',
  degradation: 'critical'
};
