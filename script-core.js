(() => {
  const phone = "+36 20 667 1832";
  const tel = "tel:+36206671832";
  const wa = "https://wa.me/36206671832";
  const scriptBaseUrl = document.currentScript?.src || new URL("script-core.js", document.baseURI).href;
  const localAssetVersion = (() => {
    try {
      return new URL(scriptBaseUrl).search;
    } catch {
      return "";
    }
  })();
  const img = (id, w = 1200) => {
    if (id.startsWith("assets/")) {
      const url = new URL(id, scriptBaseUrl);
      if (localAssetVersion) url.search = localAssetVersion;
      return url.href;
    }
    return `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=${w}`;
  };

  const heroImage = "assets/finished-room-1.jpg";

  const state = {
    lang: window.BPS_I18N?.currentLang?.() || window.BPS_I18N?.routeLanguage?.() || "de",
    gallery: [],
    galleryIndex: 0,
    galleryZoom: 1,
    galleryPanX: 0,
    galleryPanY: 0,
    projectIndex: 0,
    projectFilter: "all",
  };

  const translateFallback = (value) =>
    state.lang === "hu" || state.lang === "de"
      ? value
      : window.BPS_I18N?.translatePhrase?.(value, state.lang) || value;
  const tx = (value) => translateFallback(value?.[state.lang] || value?.de || value?.hu || "");
  const ui = (de, hu) => (state.lang === "hu" ? hu : translateFallback(de));
  const directCallViewport = () => window.matchMedia("(max-width: 820px)").matches;
  const phoneActionLabel = () => {
    if (window.BPS_I18N?.t) return window.BPS_I18N.t(directCallViewport() ? "callNow" : "copyPhone", state.lang);
    if (state.lang === "hu") return directCallViewport() ? "Hívás indítása" : "Telefon másolása";
    return directCallViewport() ? "Jetzt anrufen" : "Telefon kopieren";
  };
  const routeHref = (key, hash = "") => `${window.BPS_I18N?.routeHref?.(key, state.lang) || "/"}${hash}`;
  const serviceHrefByEnglishHref = (href = "") => {
    const serviceKeyByHref = {
      "property-maintenance-sopron.html": "maintenance",
      "painting-wall-repairs-sopron.html": "painting",
      "garden-maintenance-sopron.html": "garden",
      "handyman-services-sopron.html": "handyman",
      "cleaning-services-sopron.html": "cleaning",
      "airbnb-property-maintenance-sopron.html": "airbnb",
      "property-management-for-foreign-owners-sopron.html": "foreignOwners",
    };
    const cleanHref = href.split("#")[0].replace(/^\.\//, "");
    const key = serviceKeyByHref[cleanHref];
    return key ? routeHref(key) : href;
  };

  const phaseLabel = {
    before: { hu: "Előtte", de: "Before" },
    process: { hu: "Munkafolyamat", de: "Process" },
    after: { hu: "Kész állapot", de: "Finished" },
  };

  const phaseText = (phase) => tx(phaseLabel[phase] || phaseLabel.process);
  const compareFallback = {
    compareBefore: { hu: "Előtte", de: "Before", de: "Vorher", uk: "До", "zh-CN": "之前" },
    compareAfter: { hu: "Utána", de: "After", de: "Nachher", uk: "Після", "zh-CN": "之后" },
    compareSliderName: {
      hu: "Előtte-utána összehasonlító csúszka",
      de: "Before and after comparison slider",
      de: "Vorher-Nachher-Vergleichsschieber",
      uk: "Повзунок порівняння до і після",
      "zh-CN": "前后对比滑块",
    },
    viewFullComparison: {
      hu: "Teljes összehasonlítás megnyitása",
      de: "View full comparison",
      de: "Vollständigen Vergleich ansehen",
      uk: "Переглянути повне порівняння",
      "zh-CN": "查看完整对比",
    },
    fullComparisonTitle: {
      hu: "Teljes előtte-utána összehasonlítás",
      de: "Full before and after comparison",
      de: "Vollständiger Vorher-Nachher-Vergleich",
      uk: "Повне порівняння до і після",
      "zh-CN": "完整前后对比",
    },
    fullComparisonDescription: {
      hu: "Húzza a választóvonalat, vagy használja a nyílbillentyűket. A képek illusztratív példák, a konkrét feladatot mindig a helyszín állapota alapján egyeztetjük.",
      de: "Drag the divider or use the arrow keys. Images are illustrative examples; the actual task is always agreed from the condition of the property.",
      de: "Ziehen Sie die Trennlinie oder verwenden Sie die Pfeiltasten. Die Bilder sind illustrative Beispiele; die konkrete Aufgabe wird immer anhand des Zustands der Immobilie abgestimmt.",
      uk: "Перетягніть розділювач або використовуйте клавіші зі стрілками. Зображення є ілюстративними прикладами; конкретне завдання завжди узгоджується за фактичним станом об’єкта.",
      "zh-CN": "拖动分隔线或使用方向键。图片为示意示例；具体工作始终根据物业实际状况确认。",
    },
  };
  const compareText = (key) =>
    window.BPS_I18N?.t?.(key, state.lang) ||
    compareFallback[key]?.[state.lang] ||
    compareFallback[key]?.en ||
    "";
  const compareValueText = (value) => {
    const rounded = Math.round(value);
    const values = {
      hu: `${rounded}% előtte kép látható`,
      de: `${rounded}% before image visible`,
      de: `${rounded}% Vorher-Bild sichtbar`,
      uk: `${rounded}% зображення “до” видиме`,
      "zh-CN": `${rounded}% 显示之前图片`,
    };
    return values[state.lang] || values.en;
  };
  const compareHintText = () =>
    state.lang === "hu"
      ? "Illusztratív előtte-utána összehasonlítás, amely a munkafolyamat jellegét és a várható eredményt mutatja. Kattintson vagy fókuszáljon a csúszkára, majd húzza a fogantyút, vagy használja a nyílbillentyűket."
      : "An illustrative before-and-after comparison showing the type of work and the expected result. Click or focus the slider, then drag the handle or use the arrow keys.";
  const hasProjectComparison = (item) => item?.comparison !== false && !!item?.before && !!item?.after;
  const compareMarkup = (item, options = {}) => {
    const id = options.id || "compare";
    const hintId = options.hintId || `${id}-hint`;
    const className = options.className || "";
    const initial = 50;
    return `
      <div class="compare ${className}" id="${id}" data-compare role="slider" tabindex="0" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${initial}" aria-valuetext="${compareValueText(initial)}" aria-label="${compareText("compareSliderName")}" aria-describedby="${hintId}">
        <img class="after" src="${img(item.after, 1600)}" alt="${tx(item.title)} - ${compareText("compareAfter")}" draggable="false">
        <img class="before" src="${img(item.before, 1600)}" alt="${tx(item.title)} - ${compareText("compareBefore")}" draggable="false">
        <span class="label compare-label left">${compareText("compareBefore")}</span>
        <span class="label compare-label right">${compareText("compareAfter")}</span>
        <span class="handle" aria-hidden="true"></span>
      </div>
      <p class="compare-hint" id="${hintId}">${compareHintText()}</p>`;
  };
  const photoCaption = (photo) => tx(photo?.[2]) || phaseText(photo?.[1]);
  const languageNames = "Magyar / Deutsch";
  const languageBadgeFallback = {
    hu: "Elérhető magyarul és németül",
    de: "Verfügbar auf Deutsch und Ungarisch",
  };
  const languageBadgeText = () => window.BPS_I18N?.t?.("languageBadge", state.lang) || languageBadgeFallback[state.lang] || languageBadgeFallback.de;
  const languageTrustBadge = () => `
    <button class="language-trust-badge" type="button" data-language-selector-trigger aria-label="${languageBadgeText()}: ${languageNames}">
      <span class="language-badge-icon" aria-hidden="true"><span class="language-badge-globe"></span><span class="language-badge-count">2</span></span>
      <span class="language-badge-copy"><strong>${languageBadgeText()}</strong><small>${languageNames}</small></span>
      <span class="language-badge-flags" aria-hidden="true"><span class="flag-icon flag-de" aria-hidden="true"></span><span class="flag-icon flag-hu" aria-hidden="true"></span></span>
    </button>`;
  const paintHintMarkup = () => `
    <span class="paint-reveal-hint" aria-hidden="true">
      <span data-lang-panel="hu">Fesd át a falat az ujjaddal</span>
      <span data-lang-panel="de" hidden>Streichen Sie die Wand mit dem Finger</span>
      <span data-lang-panel="uk" hidden>Пофарбуйте стіну пальцем</span>
      <span data-lang-panel="zh-CN" hidden>用手指粉刷墙面</span>
    </span>`;
  const projectLightboxImages = (project) => {
    const pair = hasProjectComparison(project)
      ? [
          [project.before, "before", { hu: `${tx(project.title)} - kiinduló állapot`, de: `${tx(project.title)} - starting condition` }],
          [project.after, "after", { hu: `${tx(project.title)} - rendezett kész állapot`, de: `${tx(project.title)} - finished condition` }],
        ]
      : [];
    const seen = new Set(pair.map((photo) => photo[0]));
    return [...pair, ...(project.images || []).filter((photo) => !seen.has(photo[0]))];
  };

  const content = {
    nav: {
      services: { hu: "Szolgáltatások", de: "Dienstleistungen" },
      clients: { hu: "Ügyfelek", de: "Kunden" },
      projects: { hu: "Munkapéldák", de: "Arbeitsbeispiele" },
      contact: { hu: "Kapcsolat", de: "Kontakt" },
    },
    hero: {
      label: { hu: "Soproni ingatlankarbantartás", de: "Immobiliendienstleistungen in Sopron" },
      title: {
        hu: "Megbízható ingatlankarbantartás Sopronban és környékén",
        de: "Zuverlässige Immobilienpflege in Sopron und Umgebung",
      },
      text: {
        hu:
          "Gyors, fotókkal dokumentált karbantartás, javítás és ingatlangondozás lakástulajdonosoknak, bérbeadóknak, Airbnb-házigazdáknak és az osztrák határ közelében élő külföldi tulajdonosoknak.",
        de:
          "Schnelle, fotodokumentierte Wartung, Reparaturen und Immobilienpflege für Hausbesitzer, Vermieter, Airbnb-Gastgeber und ausländische Eigentümer nahe der österreichischen Grenze.",
      },
      bullets: [
        { hu: "Német nyelvű egyeztetés", de: "Deutschsprachiger Service" },
        { hu: "Fotós visszajelzés minden munkánál", de: "Foto-Updates während jedes Auftrags" },
        { hu: "Gyors válasz WhatsAppon", de: "Schnelle Antwort per WhatsApp" },
      ],
      primary: { hu: "Ingyenes ajánlatkérés", de: "Kostenloses Angebot anfordern" },
      whatsapp: { hu: "WhatsApp üzenet", de: "Per WhatsApp schreiben" },
      helper: {
        hu: "Küldjön néhány fotót, és megmondjuk, mi lehet a legjobb megoldás.",
        de: "Senden Sie uns ein paar Fotos, und wir nennen Ihnen die beste Lösung.",
      },
      secondary: { hu: "Példák és folyamat", de: "Beispiele und Ablauf" },
      noteTitle: { hu: "Egy kapcsolattartó, követhető munkamenet", de: "Ein Ansprechpartner, ein nachvollziehbarer Ablauf" },
      noteText: {
        hu:
          "A feladatot indulás előtt pontosítjuk, az egyeztetett munkát dokumentálható lépésekben végezzük, az ingatlant pedig rendezett, használható állapotban adjuk át.",
        de:
          "Vor Beginn der Arbeiten wird der Umfang geklärt, vereinbarte Aufgaben in nachvollziehbaren Schritten abgewickelt und die Immobilie ordentlich und bezugsfertig übergeben.",
      },
    },
    stats: [
      {
        huN: "DE/HU",
        enN: "DE/HU",
        hu: "Magyar és német kommunikáció",
        de: "Kommunikation auf Deutsch und Ungarisch",
        huDetail: "A feladatlista, a hozzáférés, a határidő és az átadás magyarul vagy németül is tisztázható.",
        enDetail: "Umfang, Zugang, Termine und Übergabe können auf Deutsch oder Ungarisch abgestimmt werden.",
      },
      {
        huN: "Fotók",
        enN: "Fotos",
        hu: "Fotós állapotfrissítések",
        de: "Aktualisierungen des Fotozustands",
        huDetail: "Kérés szerint a kiinduló állapot, a fontos munkafázis és az átadás is fotókkal követhető.",
        enDetail: "Auf Wunsch zeigen Fotos den Ausgangszustand, wesentliche Arbeitsschritte und die Übergabe.",
      },
      {
        huN: "Sopron",
        enN: "Sopron",
        hu: "Soproni fókusz",
        de: "Lokaler Schwerpunkt Sopron",
        huDetail: "Belvárosi lakások, hétvégi házak, kiadó ingatlanok, irodák és kisvállalkozások gyakorlati karbantartása Sopronban.",
        enDetail: "Praktische Instandhaltung für Altstadtwohnungen, Wochenendhäuser, Mietobjekte und kleine Büros rund um Sopron.",
      },
    ],
    servicesTitle: {
      hu: "Milyen feladatokat érdemes ránk bízni?",
      de: "Was Sie sicher übergeben können",
    },
    servicesText: {
      hu:
        "Olyan célzott javításokra és karbantartási feladatokra fókuszálunk, ahol a tiszta egyeztetés, a rendezett kivitelezés és az átadás előtti állapot számít. Ez különösen hasznos tulajdonosoknak, kezelőknek és vendégfogadásra készülő ingatlanoknál.",
      de:
        "Unser Fokus liegt auf praxisgerechten Reparaturen und Wartungen, bei denen es auf klare Vorgaben, eine ordnungsgemäße Ausführung und eine vorzeigbare Übergabe ankommt. Dies ist besonders nützlich für Eigentümer, Verwalter und Immobilien, die für Gäste, Mieter oder Büronutzung vorbereitet werden.",
    },
    transformationTitle: {
      hu: "A különbség az első pillanatban látszik",
      de: "The difference should be visible at first glance",
      de: "Der Unterschied sollte sofort sichtbar sein",
      uk: "Різницю має бути видно з першого погляду",
      "zh-CN": "变化应该一眼就看得出来",
    },
    transformationText: {
      hu:
        "A legtöbb érdeklődő néhány másodperc alatt dönt arról, hogy egy ingatlan gondozottnak tűnik-e. A célunk a tiszta, rendezett, bemutatható állapot, nem a túlzó látvány.",
      de:
        "Most visitors decide within seconds whether a property feels cared for. Our focus is a clean, orderly, presentable condition, not exaggerated visual tricks.",
      de:
        "Die meisten Besucher entscheiden in wenigen Sekunden, ob eine Immobilie gepflegt wirkt. Unser Fokus liegt auf einem sauberen, geordneten und präsentablen Zustand.",
      uk:
        "Більшість відвідувачів за кілька секунд вирішує, чи виглядає нерухомість доглянутою. Наш фокус — чистий, охайний і презентабельний стан.",
      "zh-CN":
        "大多数访客会在几秒内判断房产是否维护得当。我们的重点是干净、有序、适合展示的状态，而不是夸张效果。",
    },
    transformationCta: {
      hu: "Példa megnyitása",
      de: "Open example",
      de: "Beispiel öffnen",
      uk: "Відкрити приклад",
      "zh-CN": "打开示例",
    },
    problemsTitle: { hu: "Tipikus helyzetek, gyakorlati segítség", de: "Typische Situationen, praktische Unterstützung" },
    projectsTitle: { hu: "Illusztratív munkapéldák", de: "Anschauliche Arbeitsbeispiele" },
    processTitle: { hu: "Hogyan lesz az üzenetből elvégezhető feladat?", de: "Von der ersten Nachricht bis zum organisierten Job" },
    trustTitle: { hu: "Miért könnyű távolról is követni?", de: "Warum die Fernkoordination klar bleibt" },
    audienceTitle: { hu: "Kiknek hasznos?", de: "Für wen ist das nützlich?" },
    faqTitle: { hu: "Gyakori kérdések", de: "Häufige Fragen" },
    contactTitle: { hu: "Küldjön fotót, és tisztázzuk a következő lépést", de: "Senden Sie Fotos und wir klären den nächsten Schritt" },
    contactText: {
      hu:
        "A leggyorsabb kezdéshez küldjön 2-3 fotót, az ingatlan soproni címét vagy környékét, a hozzáférés módját és a kívánt időzítést. Röviden visszajelzünk, milyen információ hiányzik még, és mi lehet a reális következő lépés.",
      de:
        "Für den schnellsten Start senden Sie 2-3 Fotos, die Soproner Adresse oder die Gegend, Zugangsdaten und Ihren bevorzugten Zeitpunkt. Wir werden antworten, was noch benötigt wird und was der realistische nächste Schritt sein kann.",
    },
  };

  const services = [
    {
      key: "painting",
      cover: "assets/finished-room-1.jpg",
      title: { hu: "Festés és falfrissítés", de: "Innenanstrich und Wandauffrischung" },
      text: {
        hu:
          "Kopott, foltos vagy javított falak rendezése vendégváltás, bérlőváltás, fotózás vagy irodai látogatás előtt. A cél nem látványos ígéret, hanem tiszta felület, egységes összkép és vállalható átadás.",
        de:
          "Erfrischen Sie markierte, geflickte oder abgenutzte Wände vor Gastwechseln, Mieterübergaben, Fotoshootings oder Bürobesuchen. Ziel ist eine saubere Oberfläche, ein einheitlicher Raumeindruck und eine Übergabe, bei der Sie sich wohlfühlen.",
      },
      photos: [
        ["12036084", "before", { hu: "Régi, sérült falfelület: itt a fal állapotát kellett javíthatóvá tenni.", de: "Alte, beschädigte Wandfläche: Die erste Aufgabe bestand darin, die Wand reparaturfähig zu machen." }],
        ["804392", "before", { hu: "Felújítás előtti helyiség, ahol a falhibák és az alsó falsáv külön figyelmet igényelt.", de: "Raum vor der Auffrischung mit sichtbaren Wandschäden und einem unteren Wandbereich, der Aufmerksamkeit braucht." }],
        ["3616757", "process", { hu: "Festésre előkészített teljes szoba, takart padlóval és összekészített anyagokkal.", de: "Kompletter Raum für den Anstrich vorbereitet, mit geschütztem Boden und bereitgestelltem Material." }],
        ["3615721", "process", { hu: "A munkaterület rendezése festés előtt: a szoba használható állapotban marad a kivitelezéshez.", de: "Arbeitsbereich vor dem Streichen eingerichtet, damit der Raum während der Arbeiten übersichtlich und sauber bleibt." }],
        ["6474471", "process", { hu: "Teljes falfelület javítása és hengerlése, nem csak egy közeli részlet.", de: "Eine ganze Wand wird repariert und gestrichen, nicht nur ein Detailausschnitt." }],
        ["6473978", "process", { hu: "Nagyobb falmező csiszolása és simítása, hogy a festés egyenletes legyen.", de: "Ein großer Wandabschnitt wird geschliffen und egalisiert, damit der Anstrich gleichmäßig wirkt." }],
        ["assets/finished-room-1.jpg", "after", { hu: "Frissen festett soproni lakószoba tiszta falakkal, radiátorral és parkettával.", de: "Frisch gestrichenes Wohnzimmer in Sopron mit sauberen Wänden, Heizkörpern und Parkettboden." }],
        ["assets/finished-room-2.jpg", "after", { hu: "Üres, átadásra kész soproni szoba egységes falfelülettel és hétköznapi kialakítással.", de: "Leerer Raum in Sopron, bereit zur Übergabe, mit einheitlichen Wänden und einem alltagstauglichen Grundriss." }],
        ["assets/airbnb-living-room.jpg", "after", { hu: "Rendezett, világos soproni lakótér friss falakkal és praktikus berendezéssel.", de: "Aufgeräumter, heller Wohnraum in Sopron mit aufgefrischten Wänden und praktischer Einrichtung." }],
        ["assets/airbnb-bedroom.jpg", "after", { hu: "Tiszta, visszafogott soproni hálószoba vendég- vagy bérlőátadás előtt.", de: "Sauberes, schlichtes Schlafzimmer in Sopron vor der Übergabe an Gäste oder Mieter." }],
      ],
    },
    {
      key: "drywall",
      cover: "assets/property-maintenance-drywall-sanding.jpg",
      title: { hu: "Gipszkarton és almennyezet", de: "Trockenbau- und Deckenreparaturen" },
      text: {
        hu:
          "Sérült vagy félkész gipszkarton, hézagok, glettelés, csiszolás és festésre előkészített felületek. A munka lényege, hogy a javítás ne külön hibaként látszódjon, hanem illeszkedjen a teljes helyiséghez.",
        de:
          "Beschädigte oder unfertige Trockenbauwände, Nähte, Spachtel-, Schleif- und lackierfähige Oberflächen. Ziel ist es, dass sich die Reparatur in den Raum einfügt und nicht als separater Mangel sichtbar bleibt.",
      },
      photos: [
        ["assets/drywall-before-matched.jpg", "before", { hu: "Üres, félkész helyiség gipszkarton és festés előtti állapotban: a teljes tér látszik.", de: "Leerer, unfertiger Raum vor Trockenbau-Endbearbeitung und Anstrich, mit Blick auf den gesamten Raum." }],
        ["15798783", "before", { hu: "Felújítás alatti teljes szoba, ahol a falak és mennyezeti csatlakozások még rendezésre várnak.", de: "Kompletter Raum in Renovierung, bei dem Wand- und Deckenanschlüsse noch fertiggestellt werden müssen." }],
        ["5606879", "before", { hu: "Nagyobb belső munkaterület nyitott mennyezettel és javítandó felületekkel.", de: "Großer Innenarbeitsbereich mit offener Decke und Flächen, die noch repariert werden müssen." }],
        ["3990359", "process", { hu: "Teljes felújítás alatti helyiség: létrák, takarás és előkészített munkaterület.", de: "Kompletter Raum in Renovierung mit Leitern, Abdeckungen und vorbereitetem Arbeitsbereich." }],
        ["6474313", "process", { hu: "Mennyezeti gipszkarton felület hézagolás előtt, jól látható teljes felülettel.", de: "Trockenbaudecke vor der Fugenverspachtelung, mit Blick auf die größere Fläche." }],
        ["6474202", "process", { hu: "Mennyezeti illesztések kezelése nagyobb felületen, nem elszigetelt részletként.", de: "Deckenfugen werden über eine größere Fläche hinweg bearbeitet, nicht nur als isoliertes Detail." }],
        ["6474343", "process", { hu: "Gipszkarton mennyezet csiszolása és simítása festés előtt.", de: "Trockenbaudecke wird vor dem Anstrich geschliffen und geglättet." }],
        ["6474300", "process", { hu: "Teljes szoba előkészítése: takarás, csiszolás, poros munkafázis kontrolláltan.", de: "Vollständige Raumvorbereitung mit Abkleben, Schleifen und kontrollierter, staubiger Arbeit." }],
        ["6474129", "process", { hu: "Mennyezeti javítás munka közben, a teljes felülethez igazítva.", de: "Deckenreparatur in Arbeit, abgestimmt auf die gesamte Fläche." }],
        ["9826455", "after", { hu: "Kész, üres helyiség: a javított felületek tiszta, festés utáni szobaképet adnak.", de: "Fertiggestellter, leerer Raum, in dem reparierte Flächen ein sauberes Interieur nach Abschluss der Arbeiten ergeben." }],
      ],
    },
    {
      key: "garden",
      cover: "assets/courtyard-garden-1.jpg",
      title: { hu: "Kert és udvar rendbetétele", de: "Aufräumarbeiten im Garten und Außenbereich" },
      text: {
        hu:
          "Magas fű, benőtt udvar, elhanyagolt bejárat vagy terasz rendezése normál soproni környezetben. Bérleményeknél, Airbnb-nél és irodáknál a külső állapot már érkezéskor meghatározza az első benyomást.",
        de:
          "Mähen, Trimmen und Aufräumen von Innenhöfen, Eingängen und Terrassen in realen Umgebungen in Sopron. Bei Mietobjekten, Airbnb und Büros prägt der Außenbereich das Vertrauen, noch bevor jemand das Gebäude betritt.",
      },
      photos: [
        ["assets/courtyard-before-entrance.jpg", "before", { hu: "Elhanyagolt soproni társasházi bejárat nyírás és lombgyűjtés előtt.", de: "Vernachlässigter Eingangsbereich eines Wohnhauses in Sopron vor dem Rasenmähen und Laubentfernen." }],
        ["assets/courtyard-before-overgrown-lawn.jpg", "before", { hu: "Benőtt közös udvari gyep és bokorsáv egy soproni lakóépület mellett.", de: "Verwilderter Gemeinschaftsrasen und Strauchrand neben einem Wohnhaus in Sopron." }],
        ["assets/courtyard-before-overgrown-wall.jpg", "before", { hu: "Rendezetlen udvari növényzet és járdaszegély visszavágás előtt.", de: "Ungepflegte Bepflanzung und Wegränder im Hof vor dem Rückschnitt." }],
        ["assets/courtyard-process-mowing.jpg", "process", { hu: "Fűnyírás és szegélyrendezés egy soproni társasház belső udvarában.", de: "Rasenmähen und Kantenpflege in einem Wohnhof in Sopron." }],
        ["assets/courtyard-process-hedge-trimming.jpg", "process", { hu: "Közönséges lombhullató sövény egyenletes visszavágása az udvari járda mellett.", de: "Eine gewöhnliche Laubhecke wird gleichmäßig entlang des Hofwegs geschnitten." }],
        ["assets/courtyard-process-shrub-pruning.jpg", "process", { hu: "Túlnőtt udvari bokor metszése, a levágott ágak rendezett gyűjtésével.", de: "Rückschnitt eines verwilderten Strauchs im Hof, bei dem die abgeschnittenen Äste ordentlich eingesammelt werden." }],
        ["assets/courtyard-process-green-waste.jpg", "process", { hu: "Nyírás utáni zöldhulladék összegyűjtése egy soproni közös udvarban.", de: "Sammeln von Grünschnitt nach dem Rückschnitt in einem gemeinschaftlich genutzten Hof in Sopron." }],
        ["assets/courtyard-garden-1.jpg", "after", { hu: "Rendezett soproni belső udvar nyírt fűvel, visszavágott sövénnyel és tiszta járdával.", de: "Ein gepflegter Hof in Sopron mit gemähtem Rasen, geschnittenen Hecken und einem sauberen Weg." }],
        ["assets/courtyard-garden-2.jpg", "after", { hu: "Karbantartott zöldsáv egy városi lakóépület mellett, egyszerű, jól áttekinthető kialakítással.", de: "Ein gepflegter Grünstreifen neben einem städtischen Wohnhaus, bewusst einfach und pflegeleicht gehalten." }],
        ["assets/courtyard-garden-3.jpg", "after", { hu: "Tiszta bejárati út és gondozott növényzet egy soproni társasházi udvarban.", de: "Ein sauberer Eingangsweg und gepflegte Bepflanzung in einem Wohnhof in Sopron." }],
      ],
    },
    {
      key: "handyman",
      cover: "assets/handyman-services-wall-fixtures.jpg",
      title: { hu: "Kisebb javítások és szerelés", de: "Kleinere Reparaturen und Handwerkerarbeiten" },
      text: {
        hu:
          "Polc, karnis, ajtóigazítás, szegély, rögzítés és átadás előtti apró hibák egy feladatlistába rendezve. Ezek külön-külön kicsinek tűnnek, együtt viszont sokat rontanak a tulajdonosi, bérlői vagy vendégélményen.",
        de:
          "Regale, Vorhangschienen, Türeinstellungen, Zierleisten, Befestigungen und kleine Übergabeprobleme in einer Aufgabenliste zusammengefasst. Für sich genommen mögen sie unbedeutend erscheinen, aber in ihrer Gesamtheit wirken sie sich stark darauf aus, wie sich die Immobilie anfühlt.",
      },
      photos: [
        ["13909112", "before", { hu: "Belső tér átadás előtt, ahol a kisebb szerelési és rendezési pontok adják meg a végső képet.", de: "Innenraum vor der Übergabe, bei dem kleine Montage- und Aufräumarbeiten den Gesamteindruck prägen." }],
        ["13588248", "before", { hu: "Rendezetlenebb fali tároló és dekorációs felület: a cél egy használhatóbb, tisztább összkép.", de: "Weniger ordentlicher Wandstauraum und Dekobereich vor der Schaffung eines nutzbareren, saubereren Eindrucks." }],
        ["23224978", "process", { hu: "Fali kép vagy tartó pontos beállítása, hogy a helyiség rendezettebb legyen.", de: "Ein Wandbild oder eine Halterung wird ausgerichtet, damit der Raum ordentlicher wirkt." }],
        ["4981802", "process", { hu: "Fali rögzítés és szerelés olyan helyen, ahol a kész eredmény használhatóbbá teszi a szobát.", de: "Wandmontagearbeiten, die den Raum nach Fertigstellung nutzbarer machen." }],
        ["assets/handyman-services-wall-fixtures.jpg", "after", { hu: "Felszerelt, rendezett fali polcok: a javítás használható tárolást és tisztább képet ad.", de: "Montierte Wandregale schaffen nutzbaren Stauraum und ein saubereres Erscheinungsbild." }],
        ["19109111", "after", { hu: "Stabil, kész polcrendszer, amely a korábbi üres vagy rendezetlen falfelületet használhatóvá teszi.", de: "Stabile, fertiggestellte Regale verwandeln eine leere oder unordentliche Wand in nutzbaren Stauraum." }],
        ["9565966", "after", { hu: "Rendezett fali tároló kisebb szerelés után, átadásra alkalmasabb belső képpel.", de: "Ordentlicher Wandstauraum nach kleineren Montagearbeiten, der den Übergabeeindruck verbessert." }],
        ["5824546", "after", { hu: "Teljes falon megjelenő tároló és polcrendszer kész állapotban.", de: "Vollständiger Wandstauraum mit Regalen im fertigen Zustand." }],
        ["19109111", "after", { hu: "Egyszerű, stabil fali polc elkészült állapotban, hétköznapi lakásbelsőben.", de: "Ein einfaches, stabiles Wandregal in einer gewöhnlichen Wohnung." }],
        ["5824575", "after", { hu: "Kész fali tároló teljes nézetben, ahol a javítás eredménye egyértelműen látszik.", de: "Fertiggestellter Wandstauraum in der Gesamtansicht, der das Ergebnis leicht verständlich macht." }],
      ],
    },
  ];

  const projects = [
    {
      key: "paint",
      type: { hu: "Festés / faljavítás", de: "Maler-/Wandreparatur" },
      cover: "assets/finished-room-1.jpg",
      comparison: true,
      before: "assets/painting-before-matched.jpg",
      after: "assets/finished-room-1.jpg",
      title: { hu: "Kopott falból tiszta, egységes felület", de: "Von müden Wänden bis hin zu einem sauberen Finish" },
      summary: {
        hu:
          "Bérlőváltás vagy vendégérkezés előtt a falhibák azonnal látszanak. A cél az, hogy a helyiség gyorsan újra rendezett és bemutatható legyen.",
        de:
          "Vor einem Mieterwechsel oder Gästeanreise sind Wandmängel sofort sichtbar. Ziel ist es, den Raum schnell wieder ansehnlich zu machen.",
      },
      result: {
        hu: "A helyiség tisztábbnak, gondozottabbnak és kiadhatóbbnak hat. A látogató nem a hibákat veszi észre először.",
        de: "Der Raum wirkt sauberer, gepflegter und lässt sich leichter präsentieren. Besucher nehmen den Raum wahr, nicht die Mängel.",
      },
      works: {
        hu: ["falhibák ellenőrzése fotók alapján", "felület előkészítése", "javítás és csiszolás", "egységes festés", "fotós visszajelzés"],
        de: ["fotobasierte Zustandsprüfung der Wand", "Oberflächenvorbereitung", "Ausbessern und Schleifen", "einheitlicher Anstrich", "Foto-Update nach Fertigstellung"],
      },
      photos: services[0].photos,
    },
    {
      key: "drywall",
      type: { hu: "Gipszkarton / mennyezet", de: "Trockenbau / Decke" },
      cover: "assets/finished-room-2.jpg",
      comparison: true,
      before: "assets/drywall-before-matched.jpg",
      after: "assets/finished-room-2.jpg",
      title: { hu: "Félkész gipszkartonból festésre kész felület", de: "Trockenbau vorbereitet für einen fertigen Innenraum" },
      summary: {
        hu:
          "A látható hézagok, élek és csiszolatlan javítások félkész hatást keltenek. Ilyenkor a cél nem látványos trükk, hanem pontos, tiszta előkészítés.",
        de:
          "Sichtbare Nähte, Kanten und ungeschliffene Bereiche lassen einen Raum unvollendet erscheinen. Ziel ist eine sorgfältige Vorbereitung, nicht kosmetische Abkürzungen.",
      },
      result: {
        hu: "A fal vagy mennyezet rendezett, festésre alkalmas és kevésbé vonja magára a figyelmet.",
        de: "Wand oder Decke werden ordentlich, streichfertig und lenken nicht mehr vom Raum ab.",
      },
      works: {
        hu: ["állapotfelmérés", "hézagok és élek javítása", "csiszolás", "felületkiegyenlítés", "átadás előtti ellenőrzés"],
        de: ["Zustandsprüfung", "Fugen- und Kantenreparatur", "sanding", "Flächenegalisierung", "Prüfung vor der Übergabe"],
      },
      photos: services[1].photos,
    },
    {
      key: "garden",
      type: { hu: "Kert / udvar", de: "Garten / Außenbereich" },
      cover: "assets/garden-maintenance-hero-garden.jpg",
      before: "assets/courtyard-before-entrance.jpg",
      after: "assets/courtyard-garden-1.jpg",
      title: { hu: "Benőtt udvarból gondozottabb érkezés", de: "Vom überwucherten Hof zu einem gepflegteren Ankommen" },
      summary: {
        hu:
          "A kert, udvar vagy bejárat gyakran az első pont, ahol az érdeklődő képet alkot az ingatlanról.",
        de:
          "Der Garten, der Hof oder der Eingangsbereich schafft oft schon Vertrauen, bevor überhaupt jemand das Grundstück betritt.",
      },
      result: {
        hu: "Az ingatlan rendezettebbnek és gondozottabbnak tűnik már érkezéskor, ami bérleménynél és Airbnb-nél különösen fontos.",
        de: "Die Immobilie wirkt vom ersten Moment an gepflegter – besonders wichtig bei Mietobjekten und Airbnb-Unterkünften.",
      },
      works: {
        hu: ["fűnyírás", "szegélyrendezés", "benőtt részek visszavágása", "zöldhulladék összegyűjtése", "kész állapot fotózása"],
        de: ["mowing", "Kantenpflege", "Zurückschneiden überwucherter Bereiche", "Grünschnittentsorgung", "Fotos im Endzustand"],
      },
      photos: services[2].photos,
    },
  ];

  Object.assign(projects[0], {
    category: "painting",
    location: { hu: "Soproni kiadó lakás", de: "Mietwohnung in Sopron" },
    timeline: { hu: "egyeztetett ütemezés", de: "Terminvereinbarung vereinbart" },
    client: { hu: "bérlőváltás előtt", de: "vor Mieterübergabe" },
    problem: {
      hu:
        "A falakon javításnyomok, kopások és foltok voltak. Ilyenkor az ingatlan nem igényel teljes felújítást, de a látható hibák azonnal rontják az első benyomást.",
      de:
        "Die Wände wiesen sichtbare Flecken, Ausbesserungsstellen und Abnutzung auf. Eine komplette Renovierung war nicht nötig, doch die sichtbaren Mängel schwächten den ersten Eindruck sofort.",
    },
    approach: {
      hu:
        "A kritikus falrészeket fotók alapján beazonosítjuk, majd a felületet előkészítjük, javítjuk, csiszoljuk és egységesebb festett állapotban adjuk vissza.",
      de:
        "Die kritischen Wandbereiche werden anhand von Fotos identifiziert, anschließend vorbereitet, repariert, geschliffen und mit einem einheitlicheren Anstrich übergeben.",
    },
    evidence: {
      hu: ["előtte fotók", "felület-előkészítés", "javítás és csiszolás", "kész állapot fotók"],
      de: ["Fotos vorher", "Oberflächenvorbereitung", "Ausbessern und Schleifen", "Fotos im fertigen Zustand"],
    },
    metrics: [
      { n: "10", hu: "képes példa", de: "Bildbeispiele" },
      { n: "3", hu: "munkafázis", de: "Arbeitsphasen" },
      { n: { hu: "Egyeztetett", de: "Vereinbart" }, hu: "ütemezés", de: "Terminierung" },
    ],
  });

  Object.assign(projects[1], {
    category: "drywall",
    location: { hu: "Lakásbelső / mennyezeti rész", de: "Innendeckenbereich der Wohnung" },
    timeline: { hu: "javítás és festésre előkészítés", de: "Reparatur und lackiergerechte Vorbereitung" },
    client: { hu: "tulajdonosi felkészítés", de: "Vorbereitung des Eigentümers" },
    problem: {
      hu:
        "A félkész gipszkarton és a rendezetlen hézagok amatőr hatást keltenek. Egy ilyen rész akkor is feltűnik, ha a lakás többi része rendben van.",
      de:
        "Unfertiger Trockenbau und raue Fugen lassen einen Innenraum improvisiert wirken. Selbst ein kleiner Bereich wie dieser fällt auf, wenn der Rest der Wohnung gepflegt ist.",
    },
    approach: {
      hu:
        "A hangsúly a pontos éleken, a simább átmeneteken és a festésre alkalmas felületen van. Nem látványos díszítés, hanem tiszta alapmunka.",
      de:
        "Der Fokus liegt auf saubereren Kanten, gleichmäßigeren Übergängen und einer streichfertigen Oberfläche. Es handelt sich um praktische Vorarbeit, nicht um dekoratives Kaschieren.",
    },
    evidence: {
      hu: ["gipszkarton állapot", "hézagjavítás", "csiszolás", "átadás előtti kontroll"],
      de: ["Zustand des Trockenbaus", "Fugenreparatur", "sanding", "Kontrolle vor der Übergabe"],
    },
    metrics: [
      { n: "10", hu: "képes példa", de: "Bildbeispiele" },
      { n: "5", hu: "ellenőrzési pont", de: "Kontrollpunkte" },
      { n: "DE/HU", hu: "egyeztetés", de: "Kommunikation" },
    ],
  });

  Object.assign(projects[2], {
    category: "garden",
    location: { hu: "Soproni udvar és bejárati rész", de: "Soproner Hof und Eingangsbereich" },
    timeline: { hu: "szezonális rendbetétel", de: "Saisonale Aufräumarbeiten" },
    client: { hu: "bérlemény / Airbnb előkészítés", de: "Vorbereitung für Vermietung / Airbnb" },
    problem: {
      hu:
        "A magas fű, elhanyagolt szegély és rendezetlen bejárat már érkezéskor bizonytalanságot kelt. Ez különösen gond Airbnb-nél vagy bérleménynél.",
      de:
        "Überwuchertes Gras, unordentliche Kanten und ein vernachlässigter Eingang wecken Zweifel, noch bevor jemand die Immobilie betritt. Das ist besonders bei Mietobjekten und Airbnb-Unterkünften entscheidend.",
    },
    approach: {
      hu:
        "A cél nem kertépítés, hanem gyors, látható rend: nyírás, szegélyezés, visszavágás, összegyűjtés és fotózott kész állapot.",
      de:
        "Ziel ist keine Gartengestaltung, sondern schnell sichtbare Ordnung: Mähen, Kantenschnitt, Trimmen, Entsorgung und ein fotografisch festgehaltener Endzustand.",
    },
    evidence: {
      hu: ["előtte állapot", "nyírás és szegélyezés", "zöldhulladék rendezése", "kész állapot"],
      de: ["Zustand vorher", "Mähen und Kantenschnitt", "Grünschnitt-Aufräumung", "Fertiger Zustand"],
    },
    metrics: [
      { n: "10", hu: "képes dokumentáció", de: "Fotoaufzeichnungen" },
      { n: "1", hu: "rendezett érkezés", de: "Ordentlichere Ankunft" },
      { n: "0", hu: "felesleges kör", de: "Unnötige Umwege" },
    ],
  });

  projects.push(
    {
      key: "airbnb-turnover",
      category: "airbnb",
      type: { hu: "Airbnb / bérlőváltás", de: "Airbnb-/Mieterwechsel" },
      cover: "assets/airbnb-living-room.jpg",
      comparison: true,
      before: "assets/airbnb-before-turnover-matched.jpg",
      after: "assets/airbnb-living-room.jpg",
      title: { hu: "Lakásfrissítés vendégérkezés előtt", de: "Auffrischung des Apartments vor Ankunft der Gäste" },
      location: { hu: "Soproni Airbnb lakás", de: "Airbnb-Wohnung in Sopron" },
      timeline: { hu: "vendégérkezéshez igazítva", de: "geplant um die Ankunft der Gäste herum" },
      client: { hu: "vendégváltás előtt", de: "vor Gästewechsel" },
      summary: {
        hu:
          "Vendégváltás előtt a kisebb hibák is feltűnőek. Ilyenkor a legfontosabb a pontosan egyeztetett, tiszta és dokumentált munka.",
        de:
          "Vor einem Gästewechsel fallen schon kleine Mängel auf. Im Vordergrund steht eine klar geplante, ordentliche und dokumentierte Arbeit.",
      },
      problem: {
        hu:
          "A lakásban több kisebb nyom, rögzítési hiba és javítandó rész jelent meg egyszerre. A tulajdonosnak nem külön szakikat kell szerveznie minden apróságra.",
        de:
          "Mehrere kleine Gebrauchsspuren, behebungsbedürftige Probleme und sichtbare Mängel traten gleichzeitig auf. Der Eigentümer sollte nicht für jede Kleinigkeit ein eigenes Gewerk koordinieren müssen.",
      },
      approach: {
        hu:
          "A látható hibákat rangsoroljuk: ami a vendégnek azonnal feltűnik, előre kerül. A munka végén képes visszajelzés segíti a távoli döntést.",
        de:
          "Sichtbare Probleme werden nach ihrer Wirkung auf die Gäste priorisiert. Nach Abschluss helfen Foto-Updates dem Eigentümer, auch aus der Ferne Entscheidungen zu treffen.",
      },
      result: {
        hu:
          "A lakás gyorsabban vállalható állapotba kerül, kevesebb bizonytalansággal a vendégérkezés előtt.",
        de:
          "Die Wohnung wird schneller vorzeigbar, mit weniger Unsicherheit vor der Ankunft der Gäste.",
      },
      works: {
        hu: ["látható hibák listázása", "falfrissítés", "kisebb rögzítések", "átadás előtti ellenőrzés", "fotós dokumentáció"],
        de: ["Liste sichtbarer Mängel", "Wandausbesserung", "Kleine Reparaturen", "Kontrolle vor der Übergabe", "Fotodokumentation"],
      },
      evidence: {
        hu: ["problémalista", "javítás közbeni fotók", "kész állapot", "tulajdonosi visszajelzésre kész anyag"],
        de: ["Mängelliste", "Fortschrittsfotos", "Fertiger Zustand", "Update für den Eigentümer"],
      },
      metrics: [
        { n: "10", hu: "fotó", de: "Fotos" },
        { n: "4", hu: "javítási típus", de: "Reparaturarten" },
        { n: "1", hu: "kapcsolattartási pont", de: "Ansprechpartner" },
      ],
      photos: [
        ["5102904", "before", { hu: "Vendégváltás előtti lakott állapot: a nappalit rendezettebbé és fotózhatóbbá kell tenni.", de: "Bewohnter Zustand vor dem Gästewechsel: Das Wohnzimmer muss aufgeräumter und präsentabler werden." }],
        ["6195959", "process", { hu: "Airbnb előkészítés takarítással és ellenőrzéssel, teljesebb lakótérben látható munkával.", de: "Airbnb-Vorbereitung mit Reinigung und Kontrolle, gezeigt im größeren Kontext des Wohnraums." }],
        ["6764827", "after", { hu: "Kész, rendezett nappali vendégérkezéshez: tiszta, átlátható és használható tér.", de: "Fertiges Wohnzimmer für die Ankunft der Gäste: sauber, aufgeräumt und nutzbar." }],
        ["8135495", "after", { hu: "Rendezett hálószoba átadás előtt, tiszta textillel és ellenőrizhető összképpel.", de: "Aufgeräumtes Schlafzimmer vor der Übergabe, mit sauberen Textilien und einem gut überprüfbaren Gesamtzustand." }],
        ["19899060", "after", { hu: "Világos, teljes nappali kész állapotban, amely jól mutat vendégfotón és átadáskor.", de: "Helles, komplettes Wohnzimmer im fertigen Zustand, geeignet für Gästefotos und Übergabe." }],
        ["assets/airbnb-living-room.jpg", "after", { hu: "Hétköznapi soproni nappali rendezett, vendégfogadásra kész állapotban.", de: "Alltägliches Wohnzimmer in Sopron in aufgeräumtem, gästefertigem Zustand." }],
        ["assets/finished-room-2.jpg", "after", { hu: "Frissen festett, egyszerű soproni szoba tiszta járófelülettel.", de: "Frisch gestrichenes, schlichtes Zimmer in Sopron mit klarer Wegführung." }],
        ["assets/finished-room-1.jpg", "after", { hu: "Világos soproni lakószoba rendezett falakkal, átadásra kész állapotban.", de: "Helles Wohnzimmer in Sopron mit gepflegten Wänden, bereit zur Übergabe." }],
        ["assets/airbnb-bedroom.jpg", "after", { hu: "Tiszta, visszafogott hálószoba, amely vendégnek és tulajdonosnak is könnyen ellenőrizhető.", de: "Sauberes, schlichtes Schlafzimmer, das sowohl für Gäste als auch für den Eigentümer leicht zu überblicken ist." }],
        ["271624", "after", { hu: "Kompakt Airbnb lakótér kész állapotban, rendezett fallal és használható elrendezéssel.", de: "Kompakter Airbnb-Wohnbereich im fertigen Zustand, mit gepflegten Wänden und praktischem Grundriss." }],
      ],
    },
    {
      key: "office-touchup",
      category: "office",
      type: { hu: "Iroda / képviseleti tér", de: "Büro-/Repräsentationsraum" },
      cover: "assets/office-finished-1.jpg",
      comparison: true,
      before: "assets/office-before-touchup-matched.jpg",
      after: "assets/office-finished-1.jpg",
      title: { hu: "Iroda gyors frissítése látogatás előtt", de: "Nachbesserung im Büro vor einem Besuch" },
      location: { hu: "Soproni iroda", de: "Büro in Sopron" },
      timeline: { hu: "rövid, célzott munka", de: "kurze, konzentrierte Arbeit" },
      client: { hu: "nemzetközi környezet", de: "internationales Umfeld" },
      summary: {
        hu:
          "Irodáknál és képviseleti tereknél nem fér bele a zavaros kivitelezés. A munka legyen rövid, diszkrét és tisztán kommunikált.",
        de:
          "Büros und repräsentative Räume brauchen ruhiges, organisiertes Arbeiten. Der Job sollte kurz, diskret und klar kommuniziert sein.",
      },
      problem: {
        hu:
          "A falakon és használati pontokon apró sérülések rontották a rendezett képet. Ezek nem nagy hibák, de egy látogatásnál feltűnnek.",
        de:
          "Kleine Gebrauchsspuren und abgenutzte Stellen beeinträchtigten den professionellen Eindruck des Büros. Es handelte sich nicht um größere Mängel, doch sie fallen bei einem Besuch auf.",
      },
      approach: {
        hu:
          "A munka a látható felületekre koncentrál: faljavítás, javítófestés, kisebb igazítások és tiszta átadás.",
        de:
          "Die Arbeiten konzentrieren sich auf sichtbare Flächen: Wandreparatur, Ausbesserungsanstrich, kleine Anpassungen und eine saubere Übergabe.",
      },
      result: {
        hu:
          "Az iroda rendezettebb, nyugodtabb és vendégfogadásra alkalmasabb benyomást kelt.",
        de:
          "Das Büro wirkt ordentlicher, ruhiger und besser vorbereitet für Besucher.",
      },
      works: {
        hu: ["látható sérülések felmérése", "javítófestés", "gipszkarton részjavítás", "kisebb szerelés", "tiszta átadás"],
        de: ["Kontrolle sichtbarer Mängel", "Ausbesserungsanstrich", "Kleinere Trockenbaureparatur", "Kleine Anpassungen", "Ordentliche Übergabe"],
      },
      evidence: {
        hu: ["diszkrét munkaszervezés", "részletfotók", "átadás előtti ellenőrzés", "kész állapot"],
        de: ["Diskrete Terminplanung", "Detailfotos", "Kontrolle vor der Übergabe", "Fertiger Zustand"],
      },
      metrics: [
        { n: "DE/HU", hu: "kommunikáció", de: "Kommunikation" },
        { n: "5", hu: "ellenőrzési pont", de: "Kontrollpunkte" },
        { n: "10", hu: "kép", de: "Bilder" },
      ],
      photos: [
        ["5483236", "before", { hu: "Üres irodatér frissítés előtt: a cél a tiszta, használatra kész munkakörnyezet.", de: "Leeres Büro vor der Auffrischung, mit dem Ziel eines sauberen, nutzbaren Arbeitsumfelds." }],
        ["8477444", "before", { hu: "Nagyobb nyitott iroda átadás előtt, ahol a teljes tér összképe számít.", de: "Großes Großraumbüro vor der Übergabe, bei dem der Gesamteindruck entscheidend ist." }],
        ["assets/office-process-wall-touchup.jpg", "process", { hu: "Szervezett javítófestés egy soproni iroda kisebb falszakaszán.", de: "Organisierter Ausbesserungsanstrich an einem kleinen Wandabschnitt in einem Büro in Sopron." }],
        ["5511098", "process", { hu: "Nagyobb irodai munkatér ellenőrzése frissítés előtt, teljesebb perspektívából.", de: "Größerer Büroarbeitsbereich vor der Auffrischung, aus einer weiteren Perspektive gezeigt." }],
        ["assets/office-finished-1.jpg", "after", { hu: "Rendezett soproni irodatér tiszta falakkal és hétköznapi berendezéssel.", de: "Gepflegtes Büro in Sopron mit sauberen Wänden und zweckmäßiger Einrichtung." }],
        ["assets/office-finished-2.jpg", "after", { hu: "Világos, látogatófogadásra kész soproni váró- és közösségi tér.", de: "Heller Warte- und Gemeinschaftsbereich in Sopron, bereit für den Empfang von Besuchern." }],
        ["assets/office-finished-3.jpg", "after", { hu: "Egyszerű soproni tárgyaló egységes falakkal és rendezett összképpel.", de: "Schlichter Besprechungsraum in Sopron mit einheitlichen Wänden und ordentlichem Erscheinungsbild." }],
        ["7534216", "after", { hu: "Kész tárgyaló jellegű tér, tiszta falakkal és rendezett összképpel.", de: "Fertiggestellter Besprechungsraum mit sauberen Wänden und ordentlichem Erscheinungsbild." }],
        ["36631699", "after", { hu: "Tágas iroda teljes nézetben, rendezett munkaállomásokkal.", de: "Geräumiges Büro in der Gesamtansicht, mit ordentlich gestalteten Arbeitsplätzen." }],
        ["1181406", "after", { hu: "Teljes irodatér használat közben: a frissített környezet professzionálisabb képet ad.", de: "Voll genutzter Bürobereich, in dem das aufgefrischte Umfeld für einen professionelleren Eindruck sorgt." }],
      ],
    },
    {
      key: "handover-small-fixes",
      category: "handyman",
      type: { hu: "Kisebb javítások / átadás", de: "Kleine Reparaturen / Übergabe" },
      cover: "assets/airbnb-bedroom.jpg",
      comparison: true,
      before: "assets/handyman-before-matched.jpg",
      after: "assets/airbnb-bedroom.jpg",
      title: { hu: "Apró hibákból rendezett átadás", de: "Aus kleinen Mängeln wurde eine ordentliche Übergabe" },
      location: { hu: "Soproni bérlemény", de: "Mietobjekt in Sopron" },
      timeline: { hu: "átadás előtti javítás", de: "Reparaturen vor der Übergabe" },
      client: { hu: "tulajdonos / kezelő", de: "Eigentümer/Manager" },
      summary: {
        hu:
          "A kisebb hibák külön-külön nem tűnnek súlyosnak, de együtt azt sugallják, hogy az ingatlan nincs kézben tartva.",
        de:
          "Kleine Mängel sehen einzeln vielleicht nicht schwerwiegend aus, aber in ihrer Gesamtheit deuten sie darauf hin, dass die Immobilie nicht ordnungsgemäß verwaltet wird.",
      },
      problem: {
        hu:
          "Karnis, polc, fogantyú, szegély vagy ajtóigazítás jellegű apróságok gyűltek össze. Ezek átadásnál vagy fotózásnál erősen látszanak.",
        de:
          "Kleine Elemente wie Stangen, Regale, Griffe, Leisten oder Türanpassungen hatten sich angesammelt. Diese Details fallen bei der Übergabe oder bei Fotoaufnahmen auf.",
      },
      approach: {
        hu:
          "A munkát listázzuk, majd egy körben kezeljük a kisebb hibákat. Így a tulajdonos nem veszít időt sok külön egyeztetéssel.",
        de:
          "Die Punkte werden in einer einzigen fokussierten Begehung erfasst und erledigt, sodass der Eigentümer nicht mehrere kleine Aufgaben koordinieren muss.",
      },
      result: {
        hu:
          "Az ingatlan rendezettebb és átadhatóbb lett, a javítások pedig követhető listában szerepelnek.",
        de:
          "Die Immobilie wird aufgeräumter und leichter zu übergeben, wobei die abgeschlossenen Arbeiten in einer übersichtlichen Liste dokumentiert werden.",
      },
      works: {
        hu: ["javítási lista", "kisebb rögzítések", "ajtó és szegély igazítás", "látható hibák kezelése", "fotós visszajelzés"],
        de: ["Reparaturliste", "Kleine Reparaturen", "Anpassungen an Türen und Leisten", "Behebung sichtbarer Mängel", "Foto-Update"],
      },
      evidence: {
        hu: ["feladatlista", "munkafolyamat képek", "kész állapot", "átadásra alkalmasabb tér"],
        de: ["Aufgabenliste", "Arbeitsfotos", "Fertiger Zustand", "Mehr Übergabebereitschaft"],
      },
      metrics: [
        { n: "1", hu: "szervezett kör", de: "Organisierter Termin" },
        { n: "10", hu: "fotó", de: "Fotos" },
        { n: "5+", hu: "tipikus apró hiba", de: "Typische kleine Mängel" },
      ],
      photos: services[3].photos,
    }
  );

  const projectFilters = [
    { key: "all", label: { hu: "Összes munkatípus", de: "Alle Leistungsbereiche" } },
    { key: "painting", label: { hu: "Festés", de: "Malerarbeiten" } },
    { key: "drywall", label: { hu: "Gipszkarton", de: "Trockenbau" } },
    { key: "garden", label: { hu: "Kert", de: "Garten" } },
    { key: "airbnb", label: { hu: "Airbnb", de: "Airbnb" } },
    { key: "office", label: { hu: "Iroda", de: "Büro" } },
    { key: "handyman", label: { hu: "Kisebb javítás", de: "Kleine Reparaturen" } },
  ];

  const referenceProofs = [
    {
      n: "01",
      title: { hu: "Állapot előtte", de: "Zustand vorher" },
      text: {
        hu: "Az illusztráció megmutatja az adott munkatípus jellemző kiinduló állapotát.",
        de: "Die Abbildung zeigt eine typische Ausgangssituation für diese Art von Arbeit.",
      },
    },
    {
      n: "02",
      title: { hu: "Munka közben", de: "Während der Arbeit" },
      text: {
        hu: "A képek a jellemző előkészítési és javítási lépéseket szemléltetik.",
        de: "Die Bilder veranschaulichen typische Vorbereitungs- und Reparaturschritte.",
      },
    },
    {
      n: "03",
      title: { hu: "Kész átadás", de: "Fertige Übergabe" },
      text: {
        hu: "A várható eredmény egyszerűen látható: tisztább felület és rendezettebb tér.",
        de: "Das erwartete Ergebnis ist leicht zu verstehen: sauberere Oberflächen und ein aufgeräumterer Raum.",
      },
    },
  ];

  const phaseCounts = (photos = []) =>
    photos.reduce(
      (counts, photo) => {
        counts[photo[1]] += 1;
        return counts;
      },
      { before: 0, process: 0, after: 0 }
    );

  const filteredProjects = () =>
    state.projectFilter === "all" ? projects : projects.filter((project) => project.category === state.projectFilter);
  const homepageHashTargets = new Set(["services", "clients", "projects", "media", "contact"]);
  let hashScrollFrame = 0;
  const scrollToCurrentHashTarget = () => {
    const id = decodeURIComponent(window.location.hash.replace(/^#/, ""));
    if (!homepageHashTargets.has(id)) return;
    const target = document.getElementById(id);
    if (!target) return;
    const headerHeight = Math.ceil(document.querySelector(".header")?.getBoundingClientRect().height || 76);
    const targetTop = target.getBoundingClientRect().top + window.pageYOffset - headerHeight - 18;
    window.scrollTo({ top: Math.max(0, targetTop), behavior: "auto" });
  };
  const scheduleHashScroll = () => {
    if (!window.location.hash) return;
    window.cancelAnimationFrame(hashScrollFrame);
    hashScrollFrame = window.requestAnimationFrame(() => {
      hashScrollFrame = window.requestAnimationFrame(scrollToCurrentHashTarget);
    });
  };

  const problems = [
    ["Külföldön élő tulajdonos", "Eigentümer im Ausland", "A feladat fotókkal és rövid leírással is elindítható, így a tulajdonos akkor is átlátja a helyzetet, ha nincs Sopronban.", "Der Auftrag kann mit Fotos und einer kurzen Einweisung beginnen, damit der Eigentümer die Situation auch dann verstehen kann, wenn er nicht in Sopron ist."],
    ["Airbnb-vendégváltás", "Airbnb-Gästewechsel", "A látható hibákat, falnyomokat és kisebb javításokat a következő érkezéshez igazítva lehet priorizálni.", "Sichtbare Mängel, Wandspuren und kleine Reparaturen können bei der nächsten Ankunft priorisiert werden."],
    ["Bérlő kiköltözése után", "Nach dem Auszug eines Mieters", "Falhibák, kisebb sérülések, szerelési pontok és átadás előtti frissítés egy közös, követhető feladatlistába rendezhető.", "Wandspuren, kleinere Schäden, Beschläge und Ausbesserungen vor der Übergabe können in einem nachverfolgbaren Bereich organisiert werden."],
    ["Ingatlankezelői feladatlista", "Aufgabenliste für die Immobilienverwaltung", "Több apró karbantartási pont egy egyeztetésben kezelhető, így kevesebb külön kör és kevesebb félreértés marad.", "Mehrere kleine Wartungsaufgaben können in einem Koordinationsablauf bearbeitet werden, wodurch separate Nachverfolgungen und Missverständnisse reduziert werden."],
    ["Elhanyagolt udvar vagy kert", "Vernachlässigter Hof oder Garten", "Fűnyírással, metszéssel és a járófelületek rendezésével a külső tér ismét gondozott, bemutatható képet mutathat.", "Durch Mähen, Beschneiden und Aufräumen von Wegen kann ein aufgeräumter, ansehnlicher Außenbereich wiederhergestellt werden."],
    ["Iroda vagy képviseleti tér látogatás előtt", "Büro oder repräsentativer Raum vor einem Besuch", "Kisebb faljavítások, festés és szerelések úgy ütemezhetők, hogy a napi működést és a belépési szabályokat is figyelembe vegyük.", "Kleinere Wandreparaturen, Maler- und Montagearbeiten können entsprechend den täglichen Abläufen und Zugangsanforderungen geplant werden."],
  ];

  const problemUi = {
    details: { hu: "Részletek +", de: "Details +", de: "Mehr erfahren +", uk: "Детальніше +", "zh-CN": "详情 +" },
    close: { hu: "Bezárás −", de: "Close −", de: "Schließen −", uk: "Закрити −", "zh-CN": "关闭 −" },
    nextStep: { hu: "Javasolt következő lépés", de: "Recommended next step", de: "Empfohlener nächster Schritt", uk: "Рекомендований наступний крок", "zh-CN": "建议的下一步" },
    relatedService: { hu: "Kapcsolódó szolgáltatás", de: "Related service", de: "Passende Leistung", uk: "Пов’язана послуга", "zh-CN": "相关服务" },
    viewPhotos: { hu: "Példaképek megnyitása", de: "View example photos", de: "Beispielfotos ansehen", uk: "Переглянути приклади фото", "zh-CN": "查看示例照片" },
    sendPhotos: { hu: "Fotók küldése WhatsAppon", de: "Send photos on WhatsApp", de: "Fotos per WhatsApp senden", uk: "Надіслати фото у WhatsApp", "zh-CN": "通过 WhatsApp 发送照片" },
    typical: { hu: "Tipikus helyzet", de: "Typical situation", de: "Typische Situation", uk: "Типова ситуація", "zh-CN": "典型情况" },
  };

  const situationLabel = (key) => problemUi[key]?.[state.lang] || problemUi[key]?.en || "";
  const disclosureLabel = (key) =>
    window.BPS_I18N?.t?.(key === "close" ? "closeLabel" : "detailsLabel", state.lang) ||
    situationLabel(key);
  const disclosureMarkup = (className = "disclosure-link") => `
    <span class="${className}" data-disclosure-label>
      <span class="closed-label">${disclosureLabel("details")}</span>
      <span class="open-label" hidden aria-hidden="true">${disclosureLabel("close")}</span>
    </span>`;

  const problemDetails = [
    {
      service: { hu: "Ingatlankarbantartás", de: "Immobilienpflege" },
      href: "property-maintenance-sopron.html",
      projectIndex: 0,
      next: {
        hu: "Küldjön néhány áttekintő fotót, a soproni címet vagy környéket és azt, hogyan lehet bejutni az ingatlanba. Így gyorsan látható, hogy fotók alapján elindítható-e a feladat.",
        de: "Senden Sie ein paar Übersichtsaufnahmen, die Soproner Adresse und die Zugangsinformationen. So wird klar, ob die Aufgabe anhand von Fotos starten kann oder eine Besichtigung vor Ort braucht.",
      },
    },
    {
      service: { hu: "Takarítás és karbantartás", de: "Reinigung und Instandhaltung" },
      href: "cleaning-services-sopron.html",
      projectIndex: 3,
      next: {
        hu: "Írja meg a következő vendég érkezési idejét, küldjön fotókat a látható hibákról, és jelölje meg, mi számít sürgősnek.",
        de: "Teilen Sie die nächste Gästeankunft mit, senden Sie Fotos der sichtbaren Punkte und markieren Sie, was dringend ist.",
      },
    },
    {
      service: { hu: "Festés és faljavítás", de: "Malerarbeiten und Wandreparaturen" },
      href: "painting-wall-repairs-sopron.html",
      projectIndex: 0,
      next: {
        hu: "Küldjön képeket a falhibákról, a helyiségről és az átadási határidőről. Ebből eldönthető, javítófestés vagy nagyobb frissítés indokolt-e.",
        de: "Senden Sie Fotos der Wandmängel, des Raums und der Übergabefrist. Danach lässt sich klären, ob Ausbesserungsanstrich oder eine umfassendere Auffrischung sinnvoll ist.",
      },
    },
    {
      service: { hu: "Ezermester és ingatlankarbantartás", de: "Hausmeisterservice und Immobilieninstandhaltung" },
      href: "handyman-services-sopron.html",
      projectIndex: 5,
      next: {
        hu: "Készítsen rövid listát a hibákról, mellékeljen fotókat, és írja le, ki tudja jóváhagyni az esetleges változásokat.",
        de: "Erstellen Sie eine kurze Aufgabenliste, fügen Sie Fotos hinzu und nennen Sie, wer Änderungen am Umfang freigeben kann.",
      },
    },
    {
      service: { hu: "Kertfenntartás", de: "Gartenpflege" },
      href: "garden-maintenance-sopron.html",
      projectIndex: 2,
      next: {
        hu: "Küldjön kültéri fotókat, jelölje meg a hozzáférést és az időjárástól függő határidőt. Így reális ütemezést lehet adni.",
        de: "Senden Sie Außenfotos, Zugangsinformationen und wetterabhängige Fristen. So lässt sich ein realistischer Zeitplan festlegen.",
      },
    },
    {
      service: { hu: "Festés, faljavítás és szerelés", de: "Malerarbeiten, Wandreparaturen und Montagen" },
      href: "painting-wall-repairs-sopron.html",
      projectIndex: 4,
      next: {
        hu: "Küldjön fotókat a látogatás előtt zavaró részletekről, a működési időről és a belépési szabályokról. Így diszkréten ütemezhető a munka.",
        de: "Senden Sie Fotos der Details, die vor dem Besuch wichtig sind, sowie Betriebszeiten und Zugangsregeln. Die Arbeit kann dann diskret eingeplant werden.",
      },
    },
  ];

  const process = [
    ["Fotók, cím és időzítés", "Fotos, Ort und Zeitpunkt", "Küldje el a problémát, néhány fotót, a soproni helyszínt és azt, mikorra fontos az átadás vagy vendégérkezés.", "Senden Sie die Ausgabe, ein paar Fotos, den Standort in Sopron und den Zeitpunkt, der für die Übergabe oder Ankunft des Gastes wichtig ist."],
    ["Feladatlista és hozzáférés", "Umfang und Zugang", "Tisztázzuk, mi tartozik a munkába, hogyan lehet bejutni, ki dönthet a változásokról, és kell-e helyszíni felmérés.", "Wir klären, was enthalten ist, wie der Zugang funktioniert, wer Änderungen genehmigen kann und ob eine Vor-Ort-Begutachtung erforderlich ist."],
    ["Egyeztetett munkavégzés", "Vereinbarte Ausführung", "A kivitelezés a jóváhagyott feladatokra koncentrál. Ha közben új kérdés merül fel, azt nem feltételezéssel, hanem külön egyeztetéssel kezeljük.", "Die Arbeiten folgen dem vereinbarten Umfang. Wenn eine neue Frage erscheint, wird diese durch einen separaten Check-in und nicht durch eine Annahme behandelt."],
    ["Fotós állapotfrissítés", "Aktualisierung des Fotozustands", "Kérés szerint láthatóvá tesszük a kiinduló állapotot, a fontos munkafázist és az elkészült eredményt.", "Auf Wunsch zeigen Fotos den Ausgangszustand, wichtige Arbeitsschritte und das fertige Ergebnis."],
    ["Rendezett átadás", "Ordentliche Übergabe", "Az elkészült feladatokat röviden összefoglaljuk, az ingatlant pedig használható, tiszta és bemutatható állapotban hagyjuk.", "Erledigte Aufgaben werden zusammengefasst und die Immobilie wird benutzbar, aufgeräumt und präsentierbereit hinterlassen."],
  ];

  const audience = [
    ["Határon átnyúló tulajdonosok és osztrák kapcsolatú vállalkozások", "Grenzüberschreitende Eigentümer und österreichisch verbundene Unternehmen", "Sopron az osztrák határtól néhány percre fekszik, ezért sok tulajdonos és kisebb iroda két ország között osztja meg az idejét. A feladatok a látogatásokhoz, a távoli döntéshozatalhoz és a belépési szabályokhoz igazíthatók.", "Die Lage Soprons nur wenige Minuten von der österreichischen Grenze entfernt bedeutet, dass viele Eigentümer und kleine Büros ihre Zeit zwischen beiden Ländern aufteilen. Aufgaben lassen sich rund um Besuche, Entscheidungen aus der Ferne und Zugangsanforderungen vor Ort planen."],
    ["Helyi cégek és kisirodák", "Lokale Unternehmen und kleine Büros", "Kisebb javítások, falfrissítés és szerelési feladatok a napi működéshez igazítva. A cél a rendezett környezet helyreállítása indokolatlan fennakadás nélkül.", "Kleinere Reparaturen, Wanderneuerungen und Anpassungen können rund um den normalen Betrieb geplant werden. Ziel ist es, eine geordnete Umgebung ohne unnötige Störungen wiederherzustellen."],
    ["Külföldi tulajdonosok", "Ausländische Immobilienbesitzer", "Az egyeztetés magyarul vagy németül történhet, a fontos állapotokról pedig fotós visszajelzés kérhető. Ez különösen hasznos az Ausztriában vagy távolabb élő tulajdonosoknak, akik nem tartózkodnak helyben Sopronban.", "Die Kommunikation ist auf Deutsch oder Ungarisch möglich, mit Foto-Updates zu wichtigen Etappen. Das ist besonders hilfreich für Eigentümer, die in Österreich oder weiter entfernt leben und nicht vor Ort in Sopron sind."],
    ["Airbnb és hosszú távú bérlemények", "Airbnb und Langzeitvermietungen", "Vendég- vagy bérlőváltás előtt a látható hibák, faljavítások és kisebb karbantartási feladatok egy folyamatban kezelhetők. A határidőt mindig a tényleges munka alapján egyeztetjük.", "Sichtbare Mängel, Wandreparaturen und kleine Wartungsarbeiten können vor einem Gast- oder Mieterwechsel gemeinsam erledigt werden. Der Zeitpunkt wird immer anhand des tatsächlichen Umfangs vereinbart."],
    ["Ingatlankezelők és helyi kapcsolattartók", "Immobilienverwalter und lokale Koordinatoren", "Ha több kisebb feladat gyűlik össze egy lakásban, irodában vagy közös területen, a munkát átlátható listába rendezzük. Ez segít abban, hogy a tulajdonos, kezelő és helyszíni kapcsolattartó ugyanazt lássa.", "Wenn sich in einer Wohnung, einem Büro oder einem Gemeinschaftsbereich mehrere kleine Aufgaben ansammeln, werden diese in einer übersichtlichen Liste organisiert. Dies hilft dem Eigentümer, dem Manager und den Ansprechpartnern vor Ort, mit denselben Informationen zu arbeiten."],
    ["Magánházak és lakástulajdonosok", "Private Haus- und Wohnungseigentümer", "Családi házak és saját használatú lakások kisebb javításai, festése, gipszkarton-javítása, kert- és szezonális karbantartása is egy átlátható feladatlistába rendezhető. Költözés vagy értékesítés előtt segítünk az otthont rendezett, használható és bemutatható állapotba hozni.", "Kleinere Reparaturen, Malerarbeiten, Trockenbauarbeiten, Gartenpflege und saisonale Wartung können für Einfamilienhäuser und Eigentumswohnungen in einem übersichtlichen Rahmen organisiert werden. Vor dem Einzug oder Verkauf helfen wir bei der Vorbereitung des Hauses, damit es aufgeräumt, nutzbar und präsentierbereit ist."],
  ];

  const faq = [
    ["Lehet csak kisebb munkát kérni?", "Kann ich einen Kleinauftrag anfordern?", "Igen. A szolgáltatás kifejezetten alkalmas kisebb, de fontos javításokra is, például falhibákra, szerelési feladatokra vagy átadás előtti frissítésre. A vállalhatóságot mindig a helyszín, a feladatlista és az időzítés alapján erősítjük meg.", "Ja. Der Service eignet sich für kleinere, aber wichtige Arbeiten wie Wandreparaturen, Montagen oder Ausbesserungen vor der Übergabe. Die Verfügbarkeit wird anhand des Standorts, der Aufgabenliste und des erforderlichen Zeitplans bestätigt."],
    ["Küldhetek fotókat első körben?", "Kann ich zuerst Fotos senden?", "Igen, ez a legegyszerűbb kiindulópont. Néhány jól megvilágított összkép és közelkép sokszor elég ahhoz, hogy meghatározzuk a következő lépést. Ha a pontos műszaki tartalom fotókból nem állapítható meg, helyszíni felmérést javaslunk.", "Ja, das ist normalerweise der einfachste Ausgangspunkt. Oft reichen ein paar klare Übersichts- und Nahaufnahmen aus, um den nächsten Schritt zu erkennen. Sollte sich der technische Umfang anhand von Bildern nicht bestätigen lassen, empfehlen wir eine Begutachtung vor Ort."],
    ["Németül is lehet egyeztetni?", "Ist Kommunikation auf Deutsch möglich?", "Igen. A feladat egyeztetése, a munkafázisok visszajelzése és az átadás magyarul vagy németül is történhet. Ez nem külön szolgáltatás, hanem a működés része.", "Ja. Leistungsumfang, Fortschritts-Updates und Übergabe können vollständig auf Deutsch oder Ungarisch abgewickelt werden. Zweisprachige Kommunikation ist Teil des Service, kein Zusatzangebot."],
    ["Hogyan alakul az ár?", "Wie erfolgt die Preisfestsetzung?", "Az ár a tényleges feladatból, az anyagigényből, a hozzáférésből és az időzítésből áll össze. Fotók alapján gyakran adható első tájékoztatás, de összetettebb vagy rejtett hibáknál helyszíni felmérés szükséges lehet. A jóváhagyott munkán túli változásokat külön egyeztetjük.", "Die Preisgestaltung richtet sich nach dem tatsächlichen Umfang, den Materialien, dem Zugang und dem Zeitpunkt. Fotos können häufig einen ersten Hinweis liefern, während bei komplexen oder verborgenen Problemen möglicherweise eine Standortbegutachtung erforderlich ist. Änderungen, die über die vereinbarten Arbeiten hinausgehen, werden gesondert besprochen."],
    ["Tudnak segíteni sürgős Airbnb-helyzetben?", "Können Sie bei einem dringenden Airbnb-Problem helfen?", "A rövid határidejű feladatokat kapacitás és a munka terjedelme alapján vizsgáljuk meg. A fotók, a pontos cím és a következő vendég érkezési ideje segít gyorsan eldönteni, mi vállalható reálisan. Nem ígérünk olyan határidőt, amely mellett a munka minősége nem tartható.", "Kurzfristige Arbeiten werden im Hinblick auf die aktuelle Kapazität und den tatsächlichen Umfang berücksichtigt. Fotos, der genaue Standort und die nächste Ankunftszeit helfen uns einzuschätzen, was realistisch erledigt werden kann. Wir versprechen keine Frist, die die Arbeit gefährden würde."],
    ["Mi történik, ha nem vagyok Sopronban?", "Was ist, wenn ich nicht in Sopron bin?", "A feladat távolról is egyeztethető, ha a bejutás és a döntési jogosultság rendezett. A fontos kérdéseket indulás előtt tisztázzuk, a munkáról pedig kérés szerint fotós frissítést küldünk. Kulcsátadást vagy helyszíni kapcsolattartót minden esetben előre egyeztetünk.", "Die Arbeit kann aus der Ferne koordiniert werden, wenn Zugriff und Entscheidungsbefugnis klar sind. Wichtige Fragen werden vor dem Besuch geklärt, Bildaktualisierungen sind auf Anfrage möglich. Die Schlüsselübergabe oder ein Ansprechpartner vor Ort wird immer vorab vereinbart."],
    ["Sopronban kívül is vállalnak munkát?", "Arbeiten Sie außerhalb von Sopron?", "Az elsődleges működési terület Sopron. A közvetlen környéken lévő feladatokat a távolság, a munka mérete és az időzítés alapján lehet megvizsgálni. Érdemes elküldeni a pontos helyszínt már az első üzenetben.", "Sopron ist das wichtigste Versorgungsgebiet. Jobs in der näheren Umgebung können je nach Entfernung, Umfang und Zeitpunkt in Betracht gezogen werden. Geben Sie in der ersten Nachricht den genauen Standort an, damit die Machbarkeit schnell beurteilt werden kann."],
    ["A weboldal képei saját referenciák?", "Handelt es sich bei den Website-Bildern um abgeschlossene Kundenprojekte?", "Nem. Az oldalon szereplő képek illusztratív példák, amelyek tipikus kiinduló állapotokat, munkafázisokat és várható eredményeket mutatnak. Egy konkrét ingatlan feladatát mindig a helyszín és a tényleges állapot alapján egyeztetjük.", "Nein. Die Bilder sind illustrative Beispiele für typische Ausgangszustände, Arbeitsschritte und erwartbare Ergebnisse. Der konkrete Umfang wird immer anhand des tatsächlichen Zustands und der Anforderungen vor Ort abgestimmt."],
  ];

  projects.forEach((project) => {
    project.description = project.description || project.summary;
    project.images = project.images || project.photos || [];
    project.photos = project.images;
    project.videos = [];
  });

  const heroTrustSignals = [
    {
      label: { hu: "Fotós frissítések", de: "Foto-Updates", de: "Foto-Updates", uk: "Фотооновлення", "zh-CN": "照片更新" },
      text: {
        hu: "A kiinduló állapot és a kész eredmény követhető marad.",
        de: "The starting condition and finished result stay easy to follow.",
        de: "Ausgangszustand und Ergebnis bleiben nachvollziehbar.",
        uk: "Початковий стан і результат легко відстежити.",
        "zh-CN": "初始状态和完成结果都清晰可跟进。",
      },
    },
    {
      label: { hu: "Német kommunikáció", de: "Deutsche Kommunikation", uk: "Англійська комунікація", "zh-CN": "英文沟通" },
      text: {
        hu: "Külföldi tulajdonosoknak is érthető, rendezett egyeztetés.",
        de: "Clear coordination for international owners and local contacts.",
        de: "Klare Abstimmung für internationale Eigentümer und lokale Kontakte.",
        uk: "Зрозуміла координація для іноземних власників і місцевих контактів.",
        "zh-CN": "为国际业主和本地联系人提供清晰协调。",
      },
    },
    {
      label: { hu: "Gyors WhatsApp válasz", de: "Fast WhatsApp response", de: "Schnelle WhatsApp-Antwort", uk: "Швидка відповідь у WhatsApp", "zh-CN": "WhatsApp 快速回复" },
      text: {
        hu: "Küldjön fotókat, címet és időzítést; innen tisztázzuk a következő lépést.",
        de: "Send photos, location and timing; we clarify the next step from there.",
        de: "Senden Sie Fotos, Standort und Timing; daraus klären wir den nächsten Schritt.",
        uk: "Надішліть фото, адресу й терміни; далі уточнимо наступний крок.",
        "zh-CN": "发送照片、地点和时间安排；我们再确认下一步。",
      },
    },
    {
      label: { hu: "Egy kapcsolattartó", de: "One contact person", de: "Eine Kontaktperson", uk: "Одна контактна особа", "zh-CN": "一位对接人" },
      text: {
        hu: "Kevesebb szervezés, átláthatóbb döntések és rendezettebb átadás.",
        de: "Less coordination, clearer decisions and a more orderly handover.",
        de: "Weniger Abstimmung, klarere Entscheidungen und geordnete Übergabe.",
        uk: "Менше координації, чіткіші рішення й охайніша передача.",
        "zh-CN": "减少协调，更清晰决策，更有序交付。",
      },
    },
  ];

  const heroTrustSignalCards = () =>
    heroTrustSignals
      .map(
        (item) => `
          <li>
            <span class="hero-proof-mark" aria-hidden="true">✓</span>
            <span><strong>${tx(item.label)}</strong><small>${tx(item.text)}</small></span>
          </li>`
      )
      .join("");

  const transformationHighlights = [
    {
      projectIndex: 2,
      before: "assets/courtyard-before-entrance.jpg",
      after: "assets/courtyard-garden-1.jpg",
      tag: { hu: "Udvar és kert", de: "Courtyard and garden", de: "Hof und Garten", uk: "Двір і сад", "zh-CN": "庭院与花园" },
      title: { hu: "Benőtt udvarból gondozottabb érkezés", de: "Vom überwucherten Hof zu einem gepflegteren Ankommen", de: "Vom überwucherten Hof zu einem gepflegteren Ankommen", uk: "Від зарослого подвір’я до доглянутішого входу", "zh-CN": "从杂草丛生的庭院到更整洁的到达印象" },
      text: {
        hu: "Hitelesebb kültéri változás: magasabb fű és fáradt növényzet helyett rendezettebb első benyomás.",
        de: "A more believable outdoor change: long grass and tired planting replaced by a tidier first impression.",
        de: "Eine glaubwürdigere Veränderung im Außenbereich: höheres Gras und müde Bepflanzung werden zu einem gepflegteren ersten Eindruck.",
        uk: "Більш правдоподібна зовнішня зміна: висока трава й втомлені насадження поступаються охайнішому першому враженню.",
        "zh-CN": "更可信的户外变化：较高草丛和疲惫植栽被更整洁的第一印象取代。",
      },
    },
  ];

  const transformationCards = () =>
    transformationHighlights
      .map(
        (item, index) => {
          return `
        <article class="transformation-card${index === 0 ? " featured" : ""}" data-reveal>
          <button type="button" data-project="${item.projectIndex}" aria-label="${tx(item.title)}">
            <span class="transformation-visual" aria-hidden="true">
              <span class="transformation-frame before"><img src="${img(item.before, 1400)}" alt="" loading="${index === 0 ? "eager" : "lazy"}" decoding="async"></span>
              <span class="transformation-frame after"><img src="${img(item.after, 1400)}" alt="" loading="${index === 0 ? "eager" : "lazy"}" decoding="async"></span>
              <span class="transformation-divider"></span>
              <span class="transformation-label before">${compareText("compareBefore")}</span>
              <span class="transformation-label after">${compareText("compareAfter")}</span>
            </span>
            <span class="transformation-copy">
              <small>${tx(item.tag)}</small>
              <strong>${tx(item.title)}</strong>
              <span>${tx(item.text)}</span>
              <em>${tx(content.transformationCta)}</em>
            </span>
          </button>
        </article>`;
        }
      )
      .join("");

  const serviceCards = () =>
    services
      .map(
        (item, index) => `
        <article class="service" data-reveal>
          <button data-service="${index}" aria-label="${tx(item.title)}">
            <div class="media"><img src="${img(item.cover)}" alt="${tx(item.title)}" loading="lazy" decoding="async"></div>
            <div class="body">
              <h3>${tx(item.title)}</h3>
              <p>${tx(item.text)}</p>
              <span class="link">${state.lang === "hu" ? "Példák és képek" : "Beispiele und Fotos"}</span>
            </div>
          </button>
        </article>`
      )
      .join("");

  const statCards = () =>
    content.stats
      .map(
        (item, index) => {
          const panelId = `hero-stat-detail-${index}`;
          return `
        <details class="stat" name="hero-facts" data-reveal>
          <summary aria-expanded="false" aria-controls="${panelId}">
            <span><b>${state.lang === "hu" ? item.huN : item.enN}</b><small>${state.lang === "hu" ? item.hu : item.de}</small></span>
            ${disclosureMarkup("disclosure-icon")}
          </summary>
          <p id="${panelId}">${state.lang === "hu" ? item.huDetail : item.enDetail}</p>
        </details>`;
        }
      )
      .join("");

  const problemCards = () =>
    problems
      .map(
        (item, index) => {
          const detail = problemDetails[index];
          const panelId = `situation-detail-${index}`;
          const title = tx({ hu: item[0], de: item[1] });
          const description = tx({ hu: item[2], de: item[3] });
          const relatedService = tx(detail.service);
          const galleryProject = projects[detail.projectIndex];
          return `
        <details class="problem" name="situations" data-situation-card data-reveal>
          <summary aria-expanded="false" aria-controls="${panelId}">
            <span class="media"><img src="${img(services[index % services.length].cover)}" alt="${title}" loading="lazy" decoding="async"></span>
            <span class="body">
              <span class="eyebrow">${situationLabel("typical")}</span>
              <strong>${title}</strong>
              ${disclosureMarkup()}
            </span>
          </summary>
          <div class="problem-detail" id="${panelId}" role="region" aria-label="${title}">
            <p>${description}</p>
            <div class="problem-next-step">
              <strong>${situationLabel("nextStep")}</strong>
              <p>${tx(detail.next)}</p>
            </div>
            <div class="problem-actions">
              <a class="text-btn problem-service-link" href="${serviceHrefByEnglishHref(detail.href)}">${situationLabel("relatedService")}: ${relatedService}</a>
              <a class="btn primary" href="${wa}" target="_blank" rel="noopener">${situationLabel("sendPhotos")}</a>
              ${
                galleryProject
                  ? `<button class="btn problem-gallery-btn" type="button" data-situation-gallery="${index}" aria-label="${situationLabel("viewPhotos")}: ${tx(galleryProject.title)}">${situationLabel("viewPhotos")}</button>`
                  : ""
              }
            </div>
          </div>
        </details>`;
        }
      )
      .join("");

  const audienceCards = () =>
    audience
      .map(
        (item, index) => {
          const panelId = `audience-detail-${index}`;
          return `
        <details class="audience" name="audiences" data-reveal>
          <summary aria-expanded="false" aria-controls="${panelId}">
            <span class="audience-number">0${index + 1}</span>
            <span><strong>${tx({ hu: item[0], de: item[1] })}</strong>${disclosureMarkup("small disclosure-link")}</span>
          </summary>
          <p id="${panelId}">${tx({ hu: item[2], de: item[3] })}</p>
        </details>`;
        }
      )
      .join("");

  const faqAccordion = () =>
    faq
      .map(
        (item, index) => {
          const panelId = `faq-answer-${index}`;
          return `
        <details class="faq" name="faq" data-reveal>
          <summary aria-expanded="false" aria-controls="${panelId}"><span>${tx({ hu: item[0], de: item[1] })}</span>${disclosureMarkup("disclosure-icon")}</summary>
          <div class="faq-answer" id="${panelId}"><p>${tx({ hu: item[2], de: item[3] })}</p></div>
        </details>`;
        }
      )
      .join("");

  const referenceProofCards = () =>
    referenceProofs
      .map(
        (item) => `
        <article class="reference-proof" data-reveal>
          <b>${item.n}</b>
          <strong>${tx(item.title)}</strong>
          <p>${tx(item.text)}</p>
        </article>`
      )
      .join("");

  const projectFilterButtons = () =>
    projectFilters
      .map(
        (filter) =>
          `<button class="${state.projectFilter === filter.key ? "active" : ""}" data-project-filter="${filter.key}">${tx(filter.label)}</button>`
      )
      .join("");

  const projectCarousel = (item, index, mode = "card") => {
    const id = `${mode}-${index}`;
    const isModal = mode === "modal";
    const images = item.images || [];
    return `
      <div class="project-carousel ${isModal ? "large" : "compact"}" data-carousel="${id}" data-project-index="${index}" data-carousel-action="${isModal ? "gallery" : "project"}" data-active="0" data-phase="all">
        <div class="carousel-head">
          <strong>${state.lang === "hu" ? "Illusztratív képsorozat" : "Beispielhafte Bilderserie"}</strong>
          <span data-carousel-count aria-live="polite">${images.length} ${state.lang === "hu" ? "kép" : "Bilder"}</span>
        </div>
        <div class="carousel-stage">
          <button class="carousel-arrow carousel-prev" type="button" data-carousel-prev="${id}" aria-label="${state.lang === "hu" ? "Előző kép" : "Vorheriges Bild"}">‹</button>
          <div class="carousel-viewport">
            <div class="carousel-track">
              ${images.map((p, i) => `<button class="carousel-slide" type="button" data-slide="${i}" data-phase="${p[1]}"><img src="${img(p[0], isModal ? 1100 : 520)}" alt="${photoCaption(p)}" loading="${isModal && i === 0 ? "eager" : "lazy"}" decoding="async"><span class="slide-caption"><b>${phaseText(p[1])}</b><span>${photoCaption(p)}</span></span></button>`).join("")}
            </div>
          </div>
          <button class="carousel-arrow carousel-next" type="button" data-carousel-next="${id}" aria-label="${state.lang === "hu" ? "Következő kép" : "Nächstes Bild"}">›</button>
        </div>
        <div class="carousel-thumbs">
          ${images.map((p, i) => `<button type="button" data-carousel-dot="${id}" data-slide-to="${i}" data-phase="${p[1]}" aria-label="${phaseText(p[1])} ${i + 1}: ${photoCaption(p)}"><img src="${img(p[0], 180)}" alt="" loading="lazy" decoding="async"></button>`).join("")}
        </div>
      </div>`;
  };

  const mediaReferenceCards = () =>
    projects
      .slice(0, 4)
      .map(
        (item, index) => {
          const referenceCopy = hasProjectComparison(item)
            ? state.lang === "hu"
              ? "Előtte, munkafolyamat és kész állapot kizárólag ehhez a munkatípushoz rendezve."
              : "Before, work-in-progress and finished images organised only for this service type."
            : state.lang === "hu"
              ? "Valósághű, szolgáltatástípus szerint rendezett képek, gyenge előtte-utána állítás nélkül."
              : "Realistic service-specific images shown without forcing a weak before-and-after claim.";
          return `
        <article class="video-card media-reference-card" data-reveal>
          <button type="button" data-project-gallery="${index}" aria-label="${state.lang === "hu" ? `${tx(item.title)} képgalériájának megnyitása` : `Open image gallery for ${tx(item.title)}`}">
            <div class="video-poster">
              <img src="${img(item.cover, 900)}" alt="${tx(item.title)}" loading="lazy" decoding="async">
              <span class="video-type">${state.lang === "hu" ? `${projectLightboxImages(item).length} képes galéria` : `${projectLightboxImages(item).length}-photo gallery`}</span>
              <span class="inspect-icon" aria-hidden="true"></span>
            </div>
            <div class="body">
              <h3>${tx(item.title)}</h3>
              <p>${referenceCopy}</p>
            </div>
          </button>
        </article>`;
        }
      )
      .join("");

  const projectCards = () =>
    filteredProjects()
      .map(
        (item) => {
          const index = projects.indexOf(item);
          const images = item.images || [];
          const counts = phaseCounts(images);
          const compareId = `cardCompare-${index}`;
          const compareHintId = `cardCompareHint-${index}`;
          return `
        <article class="project project-card rich${index === 0 ? " featured" : ""}" data-reveal>
          <div class="case-comparison">
            ${
              hasProjectComparison(item)
                ? compareMarkup(item, { id: compareId, hintId: compareHintId, className: "compare-card" })
                : `<button class="case-preview single-image" type="button" data-project-gallery="${index}" aria-label="${state.lang === "hu" ? `${tx(item.title)} képgalériájának megnyitása` : `Open image gallery for ${tx(item.title)}`}"><img src="${img(item.cover, 1100)}" alt="${tx(item.title)}" loading="lazy" decoding="async"><span class="inspect-icon" aria-hidden="true"></span></button>`
            }
          </div>
          <button class="case-open" type="button" data-project="${index}" aria-label="${tx(item.title)}">
            <div class="body">
              <span class="case-type">${tx(item.type)}</span>
              <h3>${tx(item.title)}</h3>
              <p>${tx(item.summary)}</p>
              <div class="case-topline">
                <span>${tx(item.location)}</span>
                <span>${tx(item.timeline)}</span>
                <span>${tx(item.client)}</span>
              </div>
              <div class="case-proof-row">
                <div><b>${images.length}</b><small>${state.lang === "hu" ? "fotó" : "Fotos"}</small></div>
                <div><b>${counts.process}</b><small>${tx(phaseLabel.process)}</small></div>
                <div><b>3</b><small>${state.lang === "hu" ? "fázis" : "Phasen"}</small></div>
              </div>
              <div class="Phasen">
                <span>${tx(phaseLabel.before)}</span><span>${tx(phaseLabel.process)}</span><span>${tx(phaseLabel.after)}</span>
              </div>
              <span class="case-link">${state.lang === "hu" ? "Képes példa megnyitása" : "Bildbeispiel öffnen"}</span>
            </div>
          </button>
        </article>`;
        }
      )
      .join("");

  let globalEventsBound = false;
  let revealObserver;
  const modalOpeners = new WeakMap();

  const render = () => {
    document.documentElement.lang = state.lang;
    document.body.innerHTML = `
      <header class="header">
        <a class="brand" href="#top" aria-label="Sopron Property Services">
          <span class="logo">SPS</span>
          <span><strong>Sopron Property Services</strong><small>${state.lang === "hu" ? "Festés, gipszkarton, kert, kisebb javítások" : "Malerarbeiten, Trockenbau, Gartenpflege, Kleinreparaturen"}</small></span>
        </a>
        <nav class="nav" aria-label="${state.lang === "hu" ? "Fő navigáció" : "Hauptnavigation"}">
          <a href="#services">${tx(content.nav.services)}</a>
          <a href="#clients">${tx(content.nav.clients)}</a>
          <a href="#projects">${tx(content.nav.projects)}</a>
          <a href="#media">${state.lang === "hu" ? "Képek" : "Bilder"}</a>
          <a href="#contact">${tx(content.nav.contact)}</a>
        </nav>
        <div class="actions">
          <button class="lang" id="langBtn" type="button" aria-label="${window.BPS_I18N?.t?.("openLanguageMenu", state.lang) || "Choose language"}">${window.BPS_I18N?.t?.("languageLabel", state.lang) || "Language"}</button>
          <a class="btn primary phone" href="${tel}" data-phone-action aria-label="${phoneActionLabel()}">${phone}</a>
        </div>
      </header>

      <main id="top">
        <section class="hero wrap" aria-labelledby="hero-title">
          <div class="hero-copy" data-reveal>
            <div class="eyebrow">${tx(content.hero.label)}</div>
            ${languageTrustBadge()}
            <h1 id="hero-title">${tx(content.hero.title)}</h1>
            <p class="lead">${tx(content.hero.text)}</p>
            <ul class="hero-proof-grid" aria-label="${state.lang === "hu" ? "Fő bizalmi előnyök" : "Wichtigste Vorteile"}">
              ${heroTrustSignalCards()}
            </ul>
            <div class="hero-action-panel">
              <div class="hero-ctas">
                <a class="btn primary" href="#contact" aria-label="${tx(content.hero.primary)}">${tx(content.hero.primary)}</a>
                <a class="btn whatsapp" href="${wa}" target="_blank" rel="noopener" aria-label="${tx(content.hero.whatsapp)}">${tx(content.hero.whatsapp)} <span aria-hidden="true">↗</span></a>
              </div>
              <p class="hero-helper">${tx(content.hero.helper)}</p>
            </div>
          </div>
          <figure class="hero-media hero-media-premium" data-reveal>
            <div
              class="hero-visual-frame"
              data-paint-reveal
              data-paint-mode="paint"
              data-paint-hint="above"
              data-paint-region="0.285,0.075 0.615,0.075 0.615,0.695 0.565,0.755 0.330,0.755 0.285,0.685"
              data-paint-exclude=""
              data-paint-brush="220"
              data-paint-fade-delay="4000"
              data-paint-color="#c86436"
              data-paint-opacity="1"
              data-paint-accent="#a84b2a"
            >
              <div class="hero-image-shell hero-main-image"><img src="${img(heroImage)}" width="1600" height="1200" fetchpriority="high" alt="${state.lang === "hu" ? "Frissen rendezett soproni lakásbelső tiszta falakkal és parkettával" : "Frisch vorbereitetes Wohnungsinterieur in Sopron mit sauberen Wänden und Parkettboden"}"></div>
              ${paintHintMarkup()}
              <div class="hero-visual-note">
                <strong>WhatsApp</strong>
                <span>${tx({ hu: "Fotók alapján gyorsabb első egyeztetés", de: "Photos make the first check faster", de: "Fotos beschleunigen die erste Abstimmung", uk: "Фото пришвидшують першу оцінку", "zh-CN": "照片让首次沟通更快" })}</span>
              </div>
            </div>
            <figcaption class="note"><span class="note-mark" aria-hidden="true">01</span><span><strong>${tx(content.hero.noteTitle)}</strong><p>${tx(content.hero.noteText)}</p></span></figcaption>
          </figure>
          <div class="stats" data-accordion-group="hero-stats">${statCards()}</div>
        </section>

        <aside class="illustration-note wrap" data-reveal>
          <span aria-hidden="true">i</span>
          <p>${state.lang === "hu" ? "Az oldalon szereplő képek illusztrációk, amelyek tipikus munkafolyamatokat és várható eredményeket mutatnak." : "Die Bilder auf dieser Website sind illustrative Beispiele für typische Arbeitsabläufe und erwartbare Ergebnisse."}</p>
        </aside>

        <section class="section wrap transformation-showcase" aria-labelledby="transformation-title">
          <div class="section-head transformation-head" data-reveal>
            <span class="section-index">01</span>
            <h2 id="transformation-title">${tx(content.transformationTitle)}</h2>
            <p>${tx(content.transformationText)}</p>
          </div>
          <div class="transformation-grid">${transformationCards()}</div>
        </section>

        <section id="services" class="section section-band">
          <div class="wrap">
            <div class="section-head" data-reveal><span class="section-index">02</span><h2>${tx(content.servicesTitle)}</h2><p>${tx(content.servicesText)}</p></div>
            <div class="grid four service-grid">${serviceCards()}</div>
          </div>
        </section>

        <section class="section wrap situations-section">
          <div class="section-head" data-reveal><span class="section-index">03</span><h2>${tx(content.problemsTitle)}</h2><p>${state.lang === "hu" ? "Nem minden ingatlannak ugyanarra van szüksége. Nyissa meg azt a helyzetet, amelyik legközelebb áll az Önéhez." : "Jede Immobiliensituation ist anders. Öffnen Sie das Szenario, das Ihrer Situation am ehesten entspricht."}</p></div>
          <div class="situation-grid" data-accordion-group="situations">${problemCards()}</div>
        </section>

        <section id="projects" class="section section-band projects-section">
          <div class="wrap">
            <div class="section-head" data-reveal><span class="section-index">04</span><h2>${tx(content.projectsTitle)}</h2><p>${state.lang === "hu" ? "A példák tipikus kiinduló állapotokat, munkafázisokat és várható eredményeket mutatnak. Nem saját referenciaprojektek; egy konkrét ingatlan feladatát mindig külön egyeztetjük." : "Diese Beispiele zeigen typische Ausgangsbedingungen, Arbeitsschritte und erwartete Ergebnisse. Sie werden nicht als abgeschlossene Kundenprojekte dargestellt; jeder tatsächliche Umfang wird gesondert vereinbart."}</p></div>
            <div class="reference-panel" data-reveal>
              <div>
                <span class="eyebrow">${state.lang === "hu" ? "Távolról is követhető" : "Aus der Ferne klar"}</span>
                <h3>${state.lang === "hu" ? "A lényeges állapotok láthatók maradnak." : "Wichtige Etappen bleiben sichtbar."}</h3>
                <p>${state.lang === "hu" ? "A feladatot az ingatlan tényleges állapota alapján rögzítjük, a munkafázisokról pedig kérés szerint fotós visszajelzés készül." : "Der Umfang orientiert sich am tatsächlichen Zustand der Immobilie, wobei für wichtige Arbeitsschritte Fotoaktualisierungen verfügbar sind."}</p>
              </div>
              <div class="reference-proof-grid">${referenceProofCards()}</div>
            </div>
            <div class="filterbar" data-reveal>${projectFilterButtons()}</div>
            <div class="grid project-grid-rich">${projectCards()}</div>
          </div>
        </section>

        <section id="media" class="section wrap">
          <div class="section-head" data-reveal><span class="section-index">05</span><h2>${state.lang === "hu" ? "Képes munkafolyamatok" : "Visuelle Arbeitsprozesse"}</h2><p>${state.lang === "hu" ? "Nézze meg a szolgáltatástípusonként rendezett képsorozatokat. A részletes galéria egy fókuszált nézetben nyílik meg, az előtte-utána összehasonlítás pedig csak ott marad, ahol a változás azonnal érthető." : "Durchsuchen Sie Bilderserien, geordnet nach Leistungsart. Jede öffnet eine fokussierte Galerieansicht, mit Vorher-Nachher-Vergleich dort, wo die Veränderung sofort erkennbar ist."}</p></div>
          <div class="video-grid">${mediaReferenceCards()}</div>
        </section>

        <section id="clients" class="section section-band clients-section">
          <div class="wrap audience-layout">
            <div class="section-head" data-reveal><span class="section-index">06</span><h2>${tx(content.audienceTitle)}</h2><p>${state.lang === "hu" ? "A szolgáltatás azoknak készült, akik Sopronban és környékén megbízható egyeztetést, fotós visszajelzést és rendezett munkavégzést várnak el: tulajdonosoknak, kezelőknek, Airbnb-házigazdáknak, irodáknak és kisvállalkozásoknak." : "Der Service richtet sich an alle, die in Sopron und Umgebung verlässliche Abstimmung, Fotoupdates und geordnete Arbeit erwarten: Eigentümer, Verwalter, Airbnb-Gastgeber, Büros und Kleinunternehmen."}</p></div>
            <div class="audience-list" data-accordion-group="audiences">${audienceCards()}</div>
          </div>
        </section>

        <section class="section wrap process-section">
          <div class="process-layout">
            <div>
              <div class="section-head" data-reveal><span class="section-index">07</span><h2>${tx(content.processTitle)}</h2><p>${state.lang === "hu" ? "A cél az, hogy a munka már az első üzenettől átlátható legyen: mit kell javítani, hogyan lehet bejutni, mikor szükséges döntés, és milyen visszajelzés várható." : "Das Ziel besteht darin, dass die Arbeit von der ersten Nachricht an klar bleibt: Was muss repariert werden, wie der Zugriff funktioniert, wann eine Entscheidung erforderlich ist und welche Aktualisierungen zu erwarten sind."}</p></div>
              <div class="steps">${process.map((p, i) => `<article class="step" data-reveal><span class="num">${String(i + 1).padStart(2, "0")}</span><div><h3>${state.lang === "hu" ? p[0] : p[1]}</h3><p>${state.lang === "hu" ? p[2] : p[3]}</p></div></article>`).join("")}</div>
            </div>
            <aside class="trust-panel" data-reveal>
              <span class="eyebrow">${state.lang === "hu" ? "Bizalom a gyakorlatban" : "Vertrauen Sie der Praxis"}</span>
              <h2>${tx(content.trustTitle)}</h2>
              <p>${state.lang === "hu" ? "Nem nagy ígéretekre építünk, hanem tisztán rögzített feladatra, használható kommunikációra és követhető visszajelzésre." : "Der Service basiert auf einem klar vereinbarten Umfang, nützlicher Kommunikation und nachverfolgbaren Updates, nicht auf übertriebenen Versprechungen."}</p>
              <div class="trust-list">
                <div><span aria-hidden="true">✓</span><p><strong>${state.lang === "hu" ? "Tiszta feladatlista" : "Übersichtliche Aufgabenliste"}</strong>${state.lang === "hu" ? "Indulás előtt rögzítjük, mi tartozik a munkába, és mi igényel külön egyeztetést." : "Vor Beginn der Arbeiten klären wir, was enthalten ist und was einer gesonderten Genehmigung bedarf."}</p></div>
                <div><span aria-hidden="true">✓</span><p><strong>${state.lang === "hu" ? "DE/HU egyeztetés" : "DE/HU-Abstimmung"}</strong>${state.lang === "hu" ? "Tulajdonos, kezelő vagy helyszíni kapcsolattartó is követheti a fontos információkat." : "Eigentümer, Manager und lokale Ansprechpartner können die wichtigen Informationen klar verfolgen."}</p></div>
                <div><span aria-hidden="true">✓</span><p><strong>${state.lang === "hu" ? "Fotós visszajelzés" : "Foto-Updates"}</strong>${state.lang === "hu" ? "Kérés szerint a kiinduló állapot és az elkészült eredmény fotóval is ellenőrizhető." : "Auf Wunsch können Ausgangszustand und Endergebnis per Foto überprüft werden."}</p></div>
                <div><span aria-hidden="true">✓</span><p><strong>${state.lang === "hu" ? "Soproni fókusz" : "Fokus auf Sopron"}</strong>${state.lang === "hu" ? "A kommunikáció és az ütemezés a belvárosi lakásokhoz, hétvégi házakhoz, irodákhoz és bérleményekhez igazodik." : "Kommunikation und Terminplanung richten sich nach Altstadtwohnungen, Wochenendhäusern, Büros und Mietobjekten in Sopron."}</p></div>
              </div>
            </aside>
          </div>
        </section>

        <section class="section section-band faq-section">
          <div class="wrap faq-layout">
            <div class="section-head" data-reveal><span class="section-index">08</span><h2>${tx(content.faqTitle)}</h2><p>${state.lang === "hu" ? "Gyakorlati válaszok a felmérésről, árazásról, határidőkről és távoli egyeztetésről." : "Praktische Antworten zu Bewertung, Preisgestaltung, Zeitplanung und Fernkoordination."}</p></div>
            <div class="faq-list" data-accordion-group="faq">${faqAccordion()}</div>
          </div>
        </section>

        <section id="contact" class="section wrap">
          <div class="contact" data-reveal>
            <div class="contact-copy"><span class="eyebrow">${state.lang === "hu" ? "Első lépés" : "Erster Schritt"}</span><h2>${tx(content.contactTitle)}</h2><p>${tx(content.contactText)}</p><div class="contact-points"><span>${state.lang === "hu" ? "2-3 fotó" : "2-3 Fotos"}</span><span>${state.lang === "hu" ? "Soproni cím vagy környék" : "Adresse oder Gegend in Sopron"}</span><span>${state.lang === "hu" ? "Hozzáférés" : "Zugang"}</span><span>${state.lang === "hu" ? "Időzítés" : "Zeitplanung"}</span></div></div>
            <div class="contact-card"><div data-whatsapp-quote-form></div><span class="contact-number">${phone}</span><a class="btn primary" href="${wa}" target="_blank" rel="noopener">${ui("WhatsApp-Nachricht senden", "WhatsApp üzenet küldése")}</a><a class="btn" href="${tel}" data-phone-action data-phone-label>${phoneActionLabel()}</a><small>${state.lang === "hu" ? "Rövid üzenet is elég: fotók, helyszín, határidő. Elsődleges terület: Sopron és közvetlen környéke." : "Eine kurze Nachricht genügt: Fotos, Standort und Zeitrahmen. Hauptgebiet: Sopron und Umgebung."}</small></div>
          </div>
        </section>
      </main>

      <footer class="footer"><span>Sopron Property Services</span><span>${state.lang === "hu" ? "Ingatlankarbantartás Sopronban, magyar és német kommunikációval." : "Immobilienpflege in Sopron, mit deutscher und ungarischer Kommunikation."}</span><span><a class="text-btn" href="${routeHref("maintenance")}">${state.lang === "hu" ? "Ingatlankarbantartás" : "Immobilienpflege"}</a> <a class="text-btn" href="${routeHref("foreignOwners")}">${state.lang === "hu" ? "Külföldi tulajdonosok" : "Betreuung für ausländische Eigentümer"}</a> <a class="text-btn" href="${routeHref("airbnb")}">${state.lang === "hu" ? "Airbnb karbantartás" : "Airbnb-Instandhaltung"}</a> <a class="text-btn" href="${routeHref("cleaning")}">${state.lang === "hu" ? "Takarítás" : "Reinigung"}</a></span></footer>
      <div class="mobile-cta"><a href="${tel}" data-phone-action>${state.lang === "hu" ? "Hívás" : "Anrufen"}</a><a href="${wa}" target="_blank" rel="noopener" aria-label="WhatsApp">${state.lang === "hu" ? "WhatsApp fotókkal" : "Fotos per WhatsApp"}</a></div>
      <div class="toast" id="phoneToast" role="status" aria-live="polite" aria-atomic="true"></div>
      <div id="projectModal" class="modal" role="dialog" aria-modal="true" aria-hidden="true"><button class="backdrop" data-close aria-label="${state.lang === "hu" ? "Ablak bezárása" : "Dialog schließen"}"></button><div class="panel" tabindex="-1"><button class="close" type="button" data-close aria-label="${state.lang === "hu" ? "Ablak bezárása" : "Dialog schließen"}">×</button><div id="projectInner"></div></div></div>
      <div id="galleryModal" class="modal" role="dialog" aria-modal="true" aria-hidden="true"><button class="backdrop" data-close aria-label="${state.lang === "hu" ? "Galéria bezárása" : "Galerie schließen"}"></button><div class="panel" tabindex="-1"><button class="close" type="button" data-close aria-label="${state.lang === "hu" ? "Galéria bezárása" : "Galerie schließen"}">×</button><div id="galleryInner"></div></div></div>
    `;
    bind();
    reveal();
    initCarousels(document);
    document.querySelectorAll(".project-grid-rich [data-compare]").forEach(initCompare);
    window.BPS_I18N?.afterHomeRender?.();
    scheduleHashScroll();
  };

  const showToast = (message) => {
    const toast = document.getElementById("phoneToast");
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add("show");
    window.clearTimeout(showToast.timer);
    showToast.timer = window.setTimeout(() => toast.classList.remove("show"), 2600);
  };

  const writePhoneToClipboard = async () => {
    if (!navigator.clipboard?.writeText) return false;
    let timeoutId;
    try {
      return await Promise.race([
        navigator.clipboard.writeText(phone).then(
          () => true,
          () => false
        ),
        new Promise((resolve) => {
          timeoutId = window.setTimeout(() => resolve(false), 450);
        }),
      ]);
    } finally {
      window.clearTimeout(timeoutId);
    }
  };

  const copyPhoneUsingSelection = () => {
    let input;
    try {
      input = document.createElement("textarea");
      input.value = phone;
      input.setAttribute("readonly", "");
      input.style.position = "fixed";
      input.style.left = "-9999px";
      input.style.top = "0";
      input.style.opacity = "0";
      document.body.appendChild(input);
      input.focus({ preventScroll: true });
      input.select();
      input.setSelectionRange(0, input.value.length);
      return document.execCommand("copy");
    } catch {
      return false;
    } finally {
      input?.remove();
    }
  };

  const copyPhoneToClipboard = async () => {
    let copied = copyPhoneUsingSelection();
    if (!copied) copied = await writePhoneToClipboard();
    showToast(
      copied
        ? window.BPS_I18N?.t?.("phoneCopied", state.lang) || (state.lang === "hu" ? `Telefonszám másolva: ${phone}` : `Phone number copied: ${phone}`)
        : window.BPS_I18N?.t?.("phoneFallback", state.lang) || (state.lang === "hu" ? `Telefonszám: ${phone}` : `Phone number: ${phone}`)
    );
  };

  const bind = () => {
    document.getElementById("langBtn")?.addEventListener("click", (event) => {
      if (!window.BPS_I18N?.setLanguage) return;
      event.preventDefault();
    });
    const syncDisclosure = (detail) => {
      const summary = detail.querySelector("summary");
      const isOpen = detail.open;
      summary?.setAttribute("aria-expanded", String(isOpen));
      summary?.querySelectorAll(".closed-label").forEach((label) => {
        label.hidden = isOpen;
        label.setAttribute("aria-hidden", String(isOpen));
      });
      summary?.querySelectorAll(".open-label").forEach((label) => {
        label.hidden = !isOpen;
        label.setAttribute("aria-hidden", String(!isOpen));
      });
    };
    const bindDisclosure = (detail) => {
      if (detail.dataset.disclosureBound === "true") return;
      detail.dataset.disclosureBound = "true";
      const summary = detail.querySelector("summary");
      syncDisclosure(detail);
      detail.addEventListener("toggle", () => syncDisclosure(detail));
      summary?.addEventListener("keydown", (event) => {
        if (!["Enter", " "].includes(event.key)) return;
        event.preventDefault();
        detail.open = !detail.open;
        syncDisclosure(detail);
      });
    };
    document.querySelectorAll("details.stat, details.problem, details.audience, details.faq").forEach(bindDisclosure);
    document.querySelectorAll("[data-accordion-group]").forEach((group) => {
      group.querySelectorAll("details").forEach((detail) => {
        detail.addEventListener("toggle", () => {
          if (!detail.open) return;
          group.querySelectorAll("details[open]").forEach((other) => {
            if (other !== detail) other.open = false;
          });
        });
      });
    });
    document.querySelectorAll("[data-situation-gallery]").forEach((btn) => {
      btn.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        const detail = problemDetails[Number(btn.dataset.situationGallery)];
        const galleryProject = detail ? projects[detail.projectIndex] : null;
        if (!galleryProject) return;
        openGallery(projectLightboxImages(galleryProject), 0, tx(galleryProject.title));
      });
    });
    document.querySelectorAll("[data-project-filter]").forEach((btn) => {
      btn.addEventListener("click", () => {
        state.projectFilter = btn.dataset.projectFilter;
        render();
        document.getElementById("projects")?.scrollIntoView({ block: "start" });
      });
    });
    document.querySelectorAll("[data-service]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const item = services[Number(btn.dataset.service)];
        openGallery(item.photos, 0, tx(item.title));
      });
    });
    document.querySelectorAll("[data-project]").forEach((btn) => {
      btn.addEventListener("click", () => openProject(Number(btn.dataset.project)));
    });
    document.querySelectorAll("[data-project-gallery]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const project = projects[Number(btn.dataset.projectGallery)];
        openGallery(projectLightboxImages(project), 0, tx(project.title));
      });
    });
    document.querySelectorAll("[data-close]").forEach((btn) => {
      btn.addEventListener("click", () => closeModal(btn.closest(".modal")));
    });
    if (!globalEventsBound) {
      globalEventsBound = true;
      document.addEventListener("click", (event) => {
        const phoneLink = event.target.closest("[data-phone-action]");
        if (!phoneLink || directCallViewport()) return;
        event.preventDefault();
        copyPhoneToClipboard();
      });
      document.addEventListener("keydown", (event) => {
        const modal = activeModal();
        const comparisonMode = modal?.id === "galleryModal" && modal.dataset.galleryMode === "comparison";
        if (event.key === "Escape" && modal) {
          event.preventDefault();
          closeModal(modal);
        } else if (event.key === "Tab" && modal) {
          trapFocus(event, modal);
        } else if (modal?.id === "galleryModal" && !comparisonMode && event.key === "ArrowLeft") {
          showGallery(state.galleryIndex - 1);
        } else if (modal?.id === "galleryModal" && !comparisonMode && event.key === "ArrowRight") {
          showGallery(state.galleryIndex + 1);
        } else if (modal?.id === "galleryModal" && !comparisonMode && ["+", "="].includes(event.key)) {
          event.preventDefault();
          changeGalleryZoom("in");
        } else if (modal?.id === "galleryModal" && !comparisonMode && event.key === "-") {
          event.preventDefault();
          changeGalleryZoom("out");
        } else if (modal?.id === "galleryModal" && !comparisonMode && event.key === "0") {
          event.preventDefault();
          changeGalleryZoom("reset");
        }
      });
    }
  };

  const openProject = (index) => {
    const item = projects[index];
    const images = item.images || [];
    const counts = phaseCounts(images);
    state.projectIndex = index;
    document.getElementById("projectInner").innerHTML = `
      <div class="project-layout" data-project-index="${index}">
        <div>
          ${
            hasProjectComparison(item)
              ? `${compareMarkup(item, { id: "compare", hintId: "compareHint" })}
          <button class="btn compare-fullscreen-btn" type="button" data-full-comparison="${index}">${compareText("viewFullComparison")}</button>`
              : `<div class="case-preview single-image modal-single-preview"><img src="${img(item.cover, 1400)}" alt="${tx(item.title)}" loading="eager" decoding="async"><span class="inspect-icon" aria-hidden="true"></span></div>`
          }
          <div class="phase-filter">
            <button class="active" data-phase-filter="all">${state.lang === "hu" ? "Összes kép" : "Alle Fotos"}</button>
            <button data-phase-filter="before">${tx(phaseLabel.before)} (${counts.before})</button>
            <button data-phase-filter="process">${tx(phaseLabel.process)} (${counts.process})</button>
            <button data-phase-filter="after">${tx(phaseLabel.after)} (${counts.after})</button>
          </div>
          ${projectCarousel(item, index, "modal")}
        </div>
        <div class="details">
          <small class="eyebrow">${tx(item.type)}</small>
          <h2 id="projectModalTitle">${tx(item.title)}</h2>
          <p class="example-badge">${state.lang === "hu" ? "Illusztratív példa, nem saját referenciaprojekt." : "Illustratives Beispiel, kein abgeschlossenes Kundenprojekt."}</p>
          <div class="project-meta-line">
            <span>${tx(item.location)}</span>
            <span>${tx(item.timeline)}</span>
            <span>${tx(item.client)}</span>
          </div>
          <p>${tx(item.description)}</p>
          <div class="project-metrics">
            ${item.metrics.map((metric) => `<div><b>${typeof metric.n === "object" ? tx(metric.n) : metric.n}</b><small>${state.lang === "hu" ? metric.hu : metric.de}</small></div>`).join("")}
          </div>
          <div class="story-grid">
            <article class="story-card"><strong>${state.lang === "hu" ? "Kiinduló helyzet" : "Ausgangssituation"}</strong><p>${tx(item.problem)}</p></article>
            <article class="story-card"><strong>${state.lang === "hu" ? "Megközelítés" : "Vorgehen"}</strong><p>${tx(item.approach)}</p></article>
            <article class="story-card"><strong>${state.lang === "hu" ? "Végeredmény" : "Endergebnis"}</strong><p>${tx(item.result)}</p></article>
          </div>
          <div class="evidence-list">
            ${tx(item.evidence).map((entry) => `<span class="evidence-chip">${entry}</span>`).join("")}
          </div>
          <h3>${state.lang === "hu" ? "Jellemző munkalépések" : "Typische Arbeitsschritte"}</h3>
          <ul>${tx(item.works).map((work) => `<li>${work}</li>`).join("")}</ul>
          <div class="result"><strong>${state.lang === "hu" ? "Várható eredmény" : "Erwartetes Ergebnis"}</strong><p>${tx(item.result)}</p></div>
          <div class="section-cta"><a class="btn primary" href="${tel}" data-phone-action>${phoneActionLabel()}</a></div>
        </div>
      </div>`;
    window.BPS_I18N?.applyPageLanguage?.();
    const modal = document.getElementById("projectModal");
    modal.setAttribute("aria-labelledby", "projectModalTitle");
    openModal(modal);
    const compare = document.getElementById("compare");
    initCompare(compare);
    document.querySelector("[data-full-comparison]")?.addEventListener("click", () => openFullComparison(index));
    document.querySelectorAll("[data-phase-filter]").forEach((btn) => {
      btn.addEventListener("click", () => {
        document.querySelectorAll("[data-phase-filter]").forEach((item) => item.classList.remove("active"));
        btn.classList.add("active");
        const phase = btn.dataset.phaseFilter;
        showCarousel(`modal-${index}`, 0, phase);
      });
    });
    initCarousels(document.getElementById("projectModal"));
  };

  const openFullComparison = (index) => {
    const item = projects[index];
    if (!hasProjectComparison(item)) return;
    state.projectIndex = index;
    document.getElementById("galleryInner").innerHTML = `
      <div class="gallery-layout comparison-lightbox-layout">
        <div class="gallery-main comparison-main">
          ${compareMarkup(item, { id: "fullCompare", hintId: "fullCompareHint", className: "compare-large" })}
        </div>
        <aside class="gallery-info comparison-info">
          <small class="eyebrow">${tx(item.title)}</small>
          <h2 id="galleryModalTitle">${compareText("fullComparisonTitle")}</h2>
          <p>${compareText("fullComparisonDescription")}</p>
          <div class="comparison-key">
            <span><b>${compareText("compareBefore")}</b>${photoCaption([item.before, "before", { hu: `${tx(item.title)} - kiinduló állapot`, de: `${tx(item.title)} - starting condition` }])}</span>
            <span><b>${compareText("compareAfter")}</b>${photoCaption([item.after, "after", { hu: `${tx(item.title)} - kész állapot`, de: `${tx(item.title)} - finished condition` }])}</span>
          </div>
        </aside>
      </div>`;
    window.BPS_I18N?.applyPageLanguage?.();
    const modal = document.getElementById("galleryModal");
    modal.dataset.galleryMode = "comparison";
    modal.setAttribute("aria-labelledby", "galleryModalTitle");
    openModal(modal);
    const compare = document.getElementById("fullCompare");
    initCompare(compare);
    compare?.focus({ preventScroll: true });
  };

  const setComparePosition = (compare, value) => {
    const next = Math.max(0, Math.min(100, Number(value)));
    compare.style.setProperty("--split", `${next}%`);
    const rounded = String(Math.round(next));
    if (compare.getAttribute("aria-valuenow") !== rounded) {
      compare.setAttribute("aria-valuenow", rounded);
      compare.setAttribute("aria-valuetext", compareValueText(next));
    }
  };

  let activeCompareDrag = null;
  let compareFrame = 0;
  let comparePendingClientX = 0;
  let compareDocumentListenersBound = false;
  let compareTouchFallbackListenersBound = false;
  let activeCompareTouch = null;

  const comparePercentFromClientX = (state, clientX) => {
    if (!state?.rect?.width) return 50;
    return ((clientX - state.rect.left) / state.rect.width) * 100;
  };

  const renderCompareFromClientX = (state, clientX) => {
    if (!state?.compare) return;
    setComparePosition(state.compare, comparePercentFromClientX(state, clientX));
  };

  const scheduleCompareRender = (clientX) => {
    if (!activeCompareDrag) return;
    comparePendingClientX = clientX;
    if (compareFrame) return;
    compareFrame = requestAnimationFrame(() => {
      compareFrame = 0;
      if (!activeCompareDrag) return;
      renderCompareFromClientX(activeCompareDrag, comparePendingClientX);
    });
  };

  const findCompareAtPoint = (event) => {
    const directCompare = event.target?.closest?.("[data-compare]");
    if (directCompare) return directCompare;
    const candidates = [...document.querySelectorAll("[data-compare]")].filter((compare) => {
      const rect = compare.getBoundingClientRect();
      return rect.width > 0 && rect.height > 0 && event.clientX >= rect.left && event.clientX <= rect.right && event.clientY >= rect.top && event.clientY <= rect.bottom;
    });
    return candidates.at(-1) || null;
  };

  const releaseComparePointerCapture = (state, event) => {
    try {
      const pointerId = event?.pointerId ?? state?.pointerId;
      if (state?.compare && pointerId !== undefined && state.compare.hasPointerCapture?.(pointerId)) {
        state.compare.releasePointerCapture(pointerId);
      }
    } catch {
      // Pointer capture may already have been released by the browser.
    }
  };

  const finishCompareDrag = (event, { finalUpdate = false } = {}) => {
    if (!activeCompareDrag) return;
    if (event?.pointerId !== undefined && event.pointerId !== activeCompareDrag.pointerId) return;
    const state = activeCompareDrag;
    if (finalUpdate && event?.clientX !== undefined) renderCompareFromClientX(state, event.clientX);
    if (compareFrame) {
      cancelAnimationFrame(compareFrame);
      compareFrame = 0;
    }
    releaseComparePointerCapture(state, event);
    state.compare.classList.remove("is-dragging");
    activeCompareDrag = null;
  };

  const handleComparePointerMove = (event) => {
    if (!activeCompareDrag || event.pointerId !== activeCompareDrag.pointerId) return;
    if (activeCompareDrag.touchIntent === "pending") {
      const dx = event.clientX - activeCompareDrag.startX;
      const dy = event.clientY - activeCompareDrag.startY;
      if (Math.abs(dy) > 10 && Math.abs(dy) > Math.abs(dx) * 1.2) {
        setComparePosition(activeCompareDrag.compare, activeCompareDrag.startValue);
        finishCompareDrag(event);
        return;
      }
      if (Math.abs(dx) >= Math.abs(dy)) activeCompareDrag.touchIntent = "drag";
    }
    scheduleCompareRender(event.clientX);
  };

  const handleComparePointerEnd = (event) => {
    finishCompareDrag(event, { finalUpdate: event.type === "pointerup" });
  };

  const handleComparePointerDown = (event) => {
    const compare = findCompareAtPoint(event);
    if (!compare) return;
    startCompareDrag(compare, event);
  };

  const bindCompareDocumentListeners = () => {
    if (compareDocumentListenersBound) return;
    compareDocumentListenersBound = true;
    document.addEventListener("pointerdown", handleComparePointerDown, true);
    document.addEventListener("pointermove", handleComparePointerMove);
    document.addEventListener("pointerup", handleComparePointerEnd);
    document.addEventListener("pointercancel", handleComparePointerEnd);
    document.addEventListener("lostpointercapture", handleComparePointerEnd, true);
    window.addEventListener("blur", () => finishCompareDrag());
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "hidden") finishCompareDrag();
    });
    window.addEventListener("resize", () => finishCompareDrag());
    window.addEventListener("orientationchange", () => finishCompareDrag());
  };

  const startCompareDrag = (compare, event) => {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    if (event.isPrimary === false) return;
    finishCompareDrag();

    const rect = compare.getBoundingClientRect();
    if (!rect.width || !rect.height) return;

    activeCompareDrag = {
      compare,
      pointerId: event.pointerId,
      pointerType: event.pointerType || "mouse",
      rect,
      startX: event.clientX,
      startY: event.clientY,
      startValue: Number(compare.getAttribute("aria-valuenow")) || 50,
      touchIntent: event.pointerType && event.pointerType !== "mouse" ? "pending" : "drag"
    };
    compare.classList.add("is-dragging");
    compare.focus({ preventScroll: true });
    try {
      compare.setPointerCapture?.(event.pointerId);
    } catch {
      // Some browsers can deny capture during interrupted gestures.
    }
    renderCompareFromClientX(activeCompareDrag, event.clientX);
  };

  const findCompareTouch = (touches, identifier) => [...touches].find((touch) => touch.identifier === identifier);

  const finishCompareTouch = (event, { finalUpdate = false } = {}) => {
    if (!activeCompareTouch) return;
    const state = activeCompareTouch;
    const touch = event ? findCompareTouch(event.changedTouches || [], state.identifier) : null;
    if (finalUpdate && touch) renderCompareFromClientX(state, touch.clientX);
    if (compareFrame) {
      cancelAnimationFrame(compareFrame);
      compareFrame = 0;
    }
    state.compare.classList.remove("is-dragging");
    activeCompareTouch = null;
  };

  const bindCompareTouchFallbackListeners = () => {
    if (compareTouchFallbackListenersBound) return;
    compareTouchFallbackListenersBound = true;
    document.addEventListener(
      "touchmove",
      (event) => {
        if (!activeCompareTouch) return;
        const touch = findCompareTouch(event.changedTouches, activeCompareTouch.identifier) || findCompareTouch(event.touches, activeCompareTouch.identifier);
        if (!touch) return;
        const dx = touch.clientX - activeCompareTouch.startX;
        const dy = touch.clientY - activeCompareTouch.startY;
        if (activeCompareTouch.touchIntent === "pending") {
          if (Math.abs(dy) > 10 && Math.abs(dy) > Math.abs(dx) * 1.2) {
            setComparePosition(activeCompareTouch.compare, activeCompareTouch.startValue);
            finishCompareTouch();
            return;
          }
          if (Math.abs(dx) >= Math.abs(dy)) activeCompareTouch.touchIntent = "drag";
        }
        if (event.cancelable && Math.abs(dx) >= Math.abs(dy)) event.preventDefault();
        comparePendingClientX = touch.clientX;
        if (compareFrame) return;
        compareFrame = requestAnimationFrame(() => {
          compareFrame = 0;
          if (!activeCompareTouch) return;
          renderCompareFromClientX(activeCompareTouch, comparePendingClientX);
        });
      },
      { passive: false }
    );
    document.addEventListener("touchend", (event) => finishCompareTouch(event, { finalUpdate: true }), { passive: true });
    document.addEventListener("touchcancel", (event) => finishCompareTouch(event), { passive: true });
    window.addEventListener("blur", () => finishCompareTouch());
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "hidden") finishCompareTouch();
    });
    window.addEventListener("resize", () => finishCompareTouch());
    window.addEventListener("orientationchange", () => finishCompareTouch());
  };

  const startCompareTouchFallback = (compare, event) => {
    if (activeCompareTouch) finishCompareTouch();
    if (event.changedTouches.length !== 1) return;
    const touch = event.changedTouches[0];
    const rect = compare.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    activeCompareTouch = {
      compare,
      identifier: touch.identifier,
      rect,
      startX: touch.clientX,
      startY: touch.clientY,
      startValue: Number(compare.getAttribute("aria-valuenow")) || 50,
      touchIntent: "pending"
    };
    compare.classList.add("is-dragging");
    compare.focus({ preventScroll: true });
    renderCompareFromClientX(activeCompareTouch, touch.clientX);
  };

  const initCompare = (compare) => {
    if (compare.dataset.bound === "true") return;
    compare.dataset.bound = "true";
    if (window.PointerEvent) {
      bindCompareDocumentListeners();
    } else {
      bindCompareTouchFallbackListeners();
      compare.addEventListener(
        "touchstart",
        (event) => startCompareTouchFallback(compare, event),
        { passive: true }
      );
    }
    compare.addEventListener("keydown", (event) => {
      const current = Number(compare.getAttribute("aria-valuenow")) || 50;
      const step = event.shiftKey ? 5 : 1;
      const values = {
        ArrowLeft: current - step,
        ArrowDown: current - step,
        ArrowRight: current + step,
        ArrowUp: current + step,
        PageDown: current - 10,
        PageUp: current + 10,
        Home: 0,
        End: 100
      };
      if (!(event.key in values)) return;
      event.preventDefault();
      setComparePosition(compare, values[event.key]);
    });
    setComparePosition(compare, 50);
    requestAnimationFrame(() => compare.classList.add("is-ready"));
  };

  const initCarousels = (root = document) => {
    root.querySelectorAll("[data-carousel]").forEach((carousel) => {
      if (carousel.dataset.bound === "true") return;
      carousel.dataset.bound = "true";
      const id = carousel.dataset.carousel;
      carousel.querySelectorAll("[data-carousel-prev]").forEach((btn) => btn.addEventListener("click", () => moveCarousel(id, -1)));
      carousel.querySelectorAll("[data-carousel-next]").forEach((btn) => btn.addEventListener("click", () => moveCarousel(id, 1)));
      carousel.querySelectorAll("[data-carousel-dot]").forEach((btn) => {
        btn.addEventListener("click", () => {
          const imageIndex = Number(btn.dataset.slideTo);
          if (carousel.dataset.carouselAction === "gallery") {
            const project = projects[Number(carousel.dataset.projectIndex)];
            openGallery(project.images, imageIndex, tx(project.title));
            return;
          }
          showCarousel(id, imageIndex);
        });
      });
      carousel.querySelectorAll("[data-slide]").forEach((btn) => {
        btn.addEventListener("click", () => {
          const project = projects[Number(carousel.dataset.projectIndex)];
          if (carousel.dataset.carouselAction === "gallery") {
            openGallery(project.images, Number(btn.dataset.slide), tx(project.title));
            return;
          }
          openProject(Number(carousel.dataset.projectIndex));
        });
      });
      const viewport = carousel.querySelector(".carousel-viewport");
      let startX = 0;
      let lastX = 0;
      let dragging = false;
      viewport.addEventListener("pointerdown", (event) => {
        dragging = true;
        startX = event.clientX;
        lastX = event.clientX;
      });
      viewport.addEventListener("pointermove", (event) => {
        if (!dragging) return;
        lastX = event.clientX;
      });
      const finishDrag = () => {
        if (!dragging) return;
        const delta = lastX - startX;
        dragging = false;
        if (Math.abs(delta) > 42) {
          moveCarousel(id, delta < 0 ? 1 : -1);
        }
      };
      viewport.addEventListener("pointerup", finishDrag);
      viewport.addEventListener("pointercancel", finishDrag);
      showCarousel(id, Number(carousel.dataset.active || 0));
    });
  };

  const moveCarousel = (id, direction) => {
    const carousel = document.querySelector(`[data-carousel="${id}"]`);
    if (!carousel) return;
    showCarousel(id, Number(carousel.dataset.active || 0) + direction);
  };

  const showCarousel = (id, index, phase) => {
    const carousel = document.querySelector(`[data-carousel="${id}"]`);
    if (!carousel) return;
    if (phase) carousel.dataset.phase = phase;
    const activePhase = carousel.dataset.phase || "all";
    const slides = [...carousel.querySelectorAll("[data-slide]")];
    const thumbs = [...carousel.querySelectorAll("[data-carousel-dot]")];
    slides.forEach((slide) => {
      slide.hidden = activePhase !== "all" && slide.dataset.phase !== activePhase;
    });
    thumbs.forEach((thumb) => {
      thumb.hidden = activePhase !== "all" && thumb.dataset.phase !== activePhase;
    });
    const visibleSlides = slides.filter((slide) => !slide.hidden);
    const visibleThumbs = thumbs.filter((thumb) => !thumb.hidden);
    if (!visibleSlides.length) return;
    const active = ((index % visibleSlides.length) + visibleSlides.length) % visibleSlides.length;
    carousel.dataset.active = String(active);
    carousel.querySelector(".carousel-track").style.transform = `translateX(-${active * 100}%)`;
    slides.forEach((slide) => {
      const isActive = slide === visibleSlides[active];
      slide.classList.toggle("active", isActive);
      slide.tabIndex = isActive ? 0 : -1;
      slide.setAttribute("aria-hidden", String(!isActive));
    });
    thumbs.forEach((thumb) => {
      const isActive = thumb === visibleThumbs[active];
      thumb.classList.toggle("active", isActive);
      thumb.setAttribute("aria-current", isActive ? "true" : "false");
    });
    const counter = carousel.querySelector("[data-carousel-count]");
    if (counter) counter.textContent = `${active + 1} / ${visibleSlides.length}`;
  };

  const openGallery = (photos, index, title) => {
    state.gallery = photos;
    state.galleryIndex = index;
    document.getElementById("galleryInner").innerHTML = `
      <div class="gallery-layout">
        <div class="gallery-main" id="galleryStage">
          <div class="gallery-viewport" id="galleryViewport">
            <img id="galleryImg" src="" alt="${title}" draggable="false">
          </div>
          <button class="arrow prev" id="prev" type="button" aria-label="${state.lang === "hu" ? "Előző kép" : "Vorheriges Bild"}">‹</button>
          <button class="arrow next" id="next" type="button" aria-label="${state.lang === "hu" ? "Következő kép" : "Nächstes Bild"}">›</button>
          <span class="counter" id="counter" aria-live="polite"></span>
          <div class="gallery-caption" id="galleryCaption"></div>
          <div class="gallery-tools" role="toolbar" aria-label="${state.lang === "hu" ? "Kép nagyítása" : "Bildzoom-Steuerung"}">
            <button type="button" data-gallery-zoom="out" aria-label="${state.lang === "hu" ? "Kicsinyítés" : "Verkleinern"}">−</button>
            <button type="button" class="zoom-level" data-gallery-zoom="reset" aria-label="${state.lang === "hu" ? "Eredeti nagyítás" : "Zoom zurücksetzen"}">100%</button>
            <button type="button" data-gallery-zoom="in" aria-label="${state.lang === "hu" ? "Nagyítás" : "Vergrößern"}">+</button>
          </div>
        </div>
        <aside class="gallery-info">
          <small class="eyebrow">${title}</small>
          <h2 id="galleryModalTitle">${state.lang === "hu" ? "Képes munkafolyamat" : "Visueller Arbeitsablauf"}</h2>
          <p>${state.lang === "hu" ? "Lapozzon a képek között, húzza oldalra mobilon, vagy nagyítsa ki a részleteket. A képek illusztratív példák; a konkrét feladatot mindig a helyszín saját fotói alapján egyeztetjük." : "Blättern Sie mit den Pfeilen, wischen Sie auf dem Handy oder zoomen Sie für Details. Die Bilder sind illustrative Beispiele; der konkrete Umfang wird immer anhand der Fotos der jeweiligen Immobilie festgelegt."}</p>
          <div class="thumb-grid" id="thumbs">${photos.map((p, i) => `<button type="button" data-thumb="${i}" aria-label="${photoCaption(p)}"><img src="${img(p[0], 420)}" alt="" loading="lazy" decoding="async"><span class="thumb-zoom" aria-hidden="true"></span></button>`).join("")}</div>
        </aside>
      </div>`;
    window.BPS_I18N?.applyPageLanguage?.();
    const modal = document.getElementById("galleryModal");
    modal.dataset.galleryMode = "gallery";
    modal.setAttribute("aria-labelledby", "galleryModalTitle");
    openModal(modal);
    document.getElementById("prev").addEventListener("click", () => showGallery(state.galleryIndex - 1));
    document.getElementById("next").addEventListener("click", () => showGallery(state.galleryIndex + 1));
    document.querySelectorAll("#thumbs [data-thumb]").forEach((btn) => {
      btn.addEventListener("click", () => showGallery(Number(btn.dataset.thumb)));
    });
    document.querySelectorAll("[data-gallery-zoom]").forEach((btn) => {
      btn.addEventListener("click", () => changeGalleryZoom(btn.dataset.galleryZoom));
    });
    initGalleryInteraction(document.getElementById("galleryViewport"));
    showGallery(index);
  };

  const showGallery = (index) => {
    if (!state.gallery.length) return;
    state.galleryIndex = (index + state.gallery.length) % state.gallery.length;
    const current = state.gallery[state.galleryIndex];
    const [id, phase] = current;
    const galleryImg = document.getElementById("galleryImg");
    const nextSrc = img(id, 2000);
    if (galleryImg.src !== new URL(nextSrc, document.baseURI).href) galleryImg.src = nextSrc;
    galleryImg.alt = photoCaption(current);
    document.getElementById("counter").textContent = `${state.galleryIndex + 1} / ${state.gallery.length} - ${phaseText(phase)}`;
    document.getElementById("galleryCaption").innerHTML = `<b>${phaseText(phase)}</b><span>${photoCaption(current)}</span>`;
    document.querySelectorAll("#thumbs [data-thumb]").forEach((thumb, thumbIndex) => {
      const isActive = thumbIndex === state.galleryIndex;
      thumb.classList.toggle("active", isActive);
      thumb.setAttribute("aria-current", isActive ? "true" : "false");
    });
    resetGalleryView();
    preloadGalleryNeighbors();
  };

  const applyGalleryTransform = () => {
    const image = document.getElementById("galleryImg");
    const viewport = document.getElementById("galleryViewport");
    if (!image || !viewport) return;
    const maxX = Math.max(0, (viewport.clientWidth * (state.galleryZoom - 1)) / 2);
    const maxY = Math.max(0, (viewport.clientHeight * (state.galleryZoom - 1)) / 2);
    state.galleryPanX = Math.max(-maxX, Math.min(maxX, state.galleryPanX));
    state.galleryPanY = Math.max(-maxY, Math.min(maxY, state.galleryPanY));
    image.style.transform = `translate3d(${state.galleryPanX}px, ${state.galleryPanY}px, 0) scale(${state.galleryZoom})`;
    viewport.classList.toggle("is-zoomed", state.galleryZoom > 1);
    const level = document.querySelector(".zoom-level");
    if (level) level.textContent = `${Math.round(state.galleryZoom * 100)}%`;
  };

  const setGalleryZoom = (zoom, originX = 0, originY = 0) => {
    const previous = state.galleryZoom;
    state.galleryZoom = Math.max(1, Math.min(4, Number(zoom)));
    if (state.galleryZoom === 1) {
      state.galleryPanX = 0;
      state.galleryPanY = 0;
    } else if (previous > 0 && previous !== state.galleryZoom) {
      const ratio = state.galleryZoom / previous;
      state.galleryPanX = state.galleryPanX * ratio + originX * (1 - ratio);
      state.galleryPanY = state.galleryPanY * ratio + originY * (1 - ratio);
    }
    applyGalleryTransform();
  };

  const changeGalleryZoom = (action) => {
    if (action === "reset") return setGalleryZoom(1);
    setGalleryZoom(state.galleryZoom + (action === "in" ? 0.5 : -0.5));
  };

  const resetGalleryView = () => {
    state.galleryZoom = 1;
    state.galleryPanX = 0;
    state.galleryPanY = 0;
    applyGalleryTransform();
  };

  const preloadGalleryNeighbors = () => {
    if (state.gallery.length < 2) return;
    [-1, 1].forEach((offset) => {
      const photo = state.gallery[(state.galleryIndex + offset + state.gallery.length) % state.gallery.length];
      const preload = new Image();
      preload.src = img(photo[0], 2000);
    });
  };

  const activeModal = () => [...document.querySelectorAll(".modal.open")].at(-1) || null;

  const openModal = (modal) => {
    const previous = activeModal();
    if (previous && previous !== modal) {
      previous.setAttribute("aria-hidden", "true");
      previous.setAttribute("inert", "");
    }
    modalOpeners.set(modal, document.activeElement);
    modal.classList.add("open");
    modal.removeAttribute("inert");
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");
    const panel = modal.querySelector(".panel");
    if (panel) panel.scrollTop = 0;
    requestAnimationFrame(() => modal.querySelector(".close")?.focus());
  };

  const closeModal = (modal) => {
    if (!modal) return;
    const opener = modalOpeners.get(modal);
    modal.classList.remove("open");
    modal.removeAttribute("inert");
    modal.setAttribute("aria-hidden", "true");
    const previous = activeModal();
    if (previous) {
      previous.removeAttribute("inert");
      previous.setAttribute("aria-hidden", "false");
    } else {
      document.body.classList.remove("modal-open");
    }
    if (opener?.isConnected) requestAnimationFrame(() => opener.focus());
  };

  const trapFocus = (event, modal) => {
    const focusable = [...modal.querySelectorAll(
      'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])'
    )].filter((element) => !element.hidden && element.getClientRects().length);
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable.at(-1);
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  const initGalleryInteraction = (target) => {
    if (!target) return;
    const pointers = new Map();
    let startX = 0;
    let startY = 0;
    let startPanX = 0;
    let startPanY = 0;
    let pinchDistance = 0;
    let pinchZoom = 1;
    target.addEventListener("pointerdown", (event) => {
      target.setPointerCapture?.(event.pointerId);
      pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
      startX = event.clientX;
      startY = event.clientY;
      startPanX = state.galleryPanX;
      startPanY = state.galleryPanY;
      if (pointers.size === 2) {
        const [a, b] = [...pointers.values()];
        pinchDistance = Math.hypot(b.x - a.x, b.y - a.y);
        pinchZoom = state.galleryZoom;
      }
    });
    target.addEventListener("pointermove", (event) => {
      if (!pointers.has(event.pointerId)) return;
      pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
      if (pointers.size === 2) {
        const [a, b] = [...pointers.values()];
        const distance = Math.hypot(b.x - a.x, b.y - a.y);
        if (pinchDistance) setGalleryZoom(pinchZoom * (distance / pinchDistance));
        return;
      }
      if (state.galleryZoom > 1) {
        state.galleryPanX = startPanX + event.clientX - startX;
        state.galleryPanY = startPanY + event.clientY - startY;
        applyGalleryTransform();
      }
    });
    const finishPointer = (event) => {
      const point = pointers.has(event.pointerId) ? { x: event.clientX, y: event.clientY } : null;
      pointers.delete(event.pointerId);
      if (!point || pointers.size || state.galleryZoom > 1) return;
      const deltaX = point.x - startX;
      const deltaY = point.y - startY;
      if (Math.abs(deltaX) > 55 && Math.abs(deltaX) > Math.abs(deltaY) * 1.2) {
        showGallery(state.galleryIndex + (deltaX < 0 ? 1 : -1));
      }
    };
    target.addEventListener("pointerup", finishPointer);
    target.addEventListener("pointercancel", (event) => pointers.delete(event.pointerId));
    target.addEventListener("dblclick", (event) => {
      const rect = target.getBoundingClientRect();
      setGalleryZoom(state.galleryZoom > 1 ? 1 : 2.5, event.clientX - rect.left - rect.width / 2, event.clientY - rect.top - rect.height / 2);
    });
    target.addEventListener("wheel", (event) => {
      event.preventDefault();
      const rect = target.getBoundingClientRect();
      setGalleryZoom(state.galleryZoom + (event.deltaY < 0 ? 0.25 : -0.25), event.clientX - rect.left - rect.width / 2, event.clientY - rect.top - rect.height / 2);
    }, { passive: false });
  };

  const reveal = () => {
    const items = document.querySelectorAll("[data-reveal]");
    revealObserver?.disconnect();
    if (!("IntersectionObserver" in window)) {
      items.forEach((item) => item.classList.add("visible"));
      return;
    }
    revealObserver = new IntersectionObserver(
      (entries) => entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("visible");
        revealObserver.unobserve(entry.target);
      }),
      { threshold: 0.12 }
    );
    items.forEach((item) => revealObserver.observe(item));
  };

  window.addEventListener("bps:languagechange", (event) => {
    const next = event.detail?.lang || window.BPS_I18N?.currentLang?.() || state.lang;
    if (next === state.lang) return;
    state.lang = next;
    render();
  });
  window.addEventListener("hashchange", scheduleHashScroll);

  render();
})();
