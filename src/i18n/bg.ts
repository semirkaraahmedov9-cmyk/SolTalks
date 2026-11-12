// Every piece of text the user can see or hear lives here, so the site can be
// translated later by adding a sibling file (e.g. en.ts) with the same shape.
export const bg = {
  site: {
    name: 'Солидарността говори!',
    homeLinkLabel: 'Солидарността говори! – към началната страница',
  },

  a11y: {
    skipToContent: 'Към основното съдържание',
    mainNavLabel: 'Основна навигация',
    menuButton: 'Меню',
    displaySettingsLabel: 'Настройки на изгледа',
  },

  nav: {
    home: 'Начало',
    convert: 'Преобразувай',
    library: 'Библиотека',
    volunteer: 'Стани глас',
    about: 'За проекта',
  },

  display: {
    largerText: 'По-голям текст',
    highContrast: 'Висок контраст',
  },

  common: {
    comingSoon: 'Тази страница скоро ще бъде готова.',
  },

  home: {
    title: 'Чуйте всеки текст на български',
    intro:
      'Безплатен инструмент, който чете български текст и книги на глас. Работи изцяло на Вашето устройство.',
    ctaConvert: 'Преобразувай текст',
    ctaLibrary: 'Библиотека',
  },

  convert: { title: 'Преобразувай текст в реч' },
  library: { title: 'Библиотека с аудиокниги' },
  volunteer: { title: 'Стани глас' },
  about: { title: 'За проекта' },

  // Temporary Phase 1 page (#/test); removed once the real converter exists.
  test: {
    title: 'Технически тест на гласа',
    intro:
      'Тази страница е временна. На нея проверяваме дали българският глас работи на Вашето устройство и колко бързо.',
    downloadNote:
      'При първото натискане се изтеглят около 97 MB (гласът и програмата за реч). След това те се пазят на устройството Ви и не се изтеглят отново.',
    textLabel: 'Текст за прочитане',
    defaultText:
      'Здравейте! Аз съм гласът на проекта „Солидарността говори!“ от село Чепинци. В библиотеката ни има 12 книги и над 345 страници. Пишете ни на ул. „Иван Вазов“ № 5.',
    settingsHeading: 'Настройки на гласа',
    noiseScale: 'Вариация на гласа',
    noiseScaleHelp: 'По-ниско – по-равен и по-стабилен глас.',
    lengthScale: 'Темпо',
    lengthScaleHelp: 'Над 1 – по-бавно, под 1 – по-бързо.',
    noiseW: 'Вариация на ритъма',
    noiseWHelp: 'По-ниско – по-равномерен ритъм.',
    resetSettings: 'Върни стандартните настройки',
    speak: 'Говори',
    working: 'Моля, изчакайте…',
    statusDownloading: (percent: number, loadedMb: string, totalMb: string) =>
      `Изтегляне на гласа: ${percent}% (${loadedMb} от ${totalMb} MB)`,
    statusLoading: 'Подготовка на гласа…',
    statusSynthesizing: 'Създаване на речта…',
    statusDone: 'Готово. Натиснете бутона за възпроизвеждане в плейъра.',
    statusError: (message: string) => `Нещо се обърка: ${message}`,
    playerLabel: 'Резултат',
    downloadWav: 'Изтегли като WAV',
    resultsHeading: 'Измервания',
    voiceSize: 'Размер на гласа',
    fromCache: '(взет от паметта на браузъра)',
    downloadTime: 'Изтегляне на гласа',
    loadTime: 'Подготовка на гласа',
    synthTime: 'Създаване на речта',
    audioLength: 'Дължина на звука',
    speed: 'Скорост',
    speedValue: (times: string) => `${times} пъти по-бързо от реалното време`,
    totalTime: 'Общо време до готов звук',
    seconds: (value: string) => `${value} с`,
    megabytes: (value: string) => `${value} MB`,
    phonemesHeading: 'Фонеми (за проверка на произношението)',
    missingPhonemes: (list: string) => `Непознати фонеми: ${list}`,
  },

  notFound: {
    title: 'Страницата не е намерена',
    text: 'Тази страница не съществува или е преместена.',
    backHome: 'Към началната страница',
  },

  footer: {
    privacy: 'Текстът и файловете, които използвате тук, никога не напускат Вашето устройство.',
    euEmblemAlt: 'Финансирано от Европейския съюз',
    project:
      'Проект „Солидарността говори!“ по програма „Европейски корпус за солидарност“, изпълняван от Сдружение „Младежи за развитие и вдъхновение – МРВ“, с. Чепинци.',
    disclaimer:
      'Финансирано от Европейския съюз. Изразените възгледи и мнения обаче принадлежат изцяло на автора(ите) и не отразяват непременно възгледите и мненията на Европейския съюз или на Центъра за развитие на човешките ресурси. Нито Европейският съюз, нито предоставящият орган могат да бъдат държани отговорни за тях.',
  },
} as const;

export type Strings = typeof bg;
