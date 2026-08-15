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
    lang: window.BPS_I18N?.currentLang?.() || window.BPS_I18N?.routeLanguage?.() || "en",
    gallery: [],
    galleryIndex: 0,
    galleryZoom: 1,
    galleryPanX: 0,
    galleryPanY: 0,
    projectIndex: 0,
    projectFilter: "all",
  };

  const translateFallback = (value) =>
    state.lang === "hu" || state.lang === "en"
      ? value
      : window.BPS_I18N?.translatePhrase?.(value, state.lang) || value;
  const tx = (value) => translateFallback(value?.[state.lang] || value?.en || value?.hu || "");
  const ui = (en, hu) => (state.lang === "hu" ? hu : translateFallback(en));
  const directCallViewport = () => window.matchMedia("(max-width: 820px)").matches;
  const phoneActionLabel = () => {
    if (window.BPS_I18N?.t) return window.BPS_I18N.t(directCallViewport() ? "callNow" : "copyPhone", state.lang);
    if (state.lang === "hu") return directCallViewport() ? "Hívás indítása" : "Telefon másolása";
    return directCallViewport() ? "Call now" : "Copy phone";
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
    before: { hu: "Előtte", en: "Before" },
    process: { hu: "Munkafolyamat", en: "Process" },
    after: { hu: "Kész állapot", en: "Finished" },
  };

  const phaseText = (phase) => tx(phaseLabel[phase] || phaseLabel.process);
  const compareFallback = {
    compareBefore: { hu: "Előtte", en: "Before", de: "Vorher", uk: "До", "zh-CN": "之前" },
    compareAfter: { hu: "Utána", en: "After", de: "Nachher", uk: "Після", "zh-CN": "之后" },
    compareSliderName: {
      hu: "Előtte-utána összehasonlító csúszka",
      en: "Before and after comparison slider",
      de: "Vorher-Nachher-Vergleichsschieber",
      uk: "Повзунок порівняння до і після",
      "zh-CN": "前后对比滑块",
    },
    viewFullComparison: {
      hu: "Teljes összehasonlítás megnyitása",
      en: "View full comparison",
      de: "Vollständigen Vergleich ansehen",
      uk: "Переглянути повне порівняння",
      "zh-CN": "查看完整对比",
    },
    fullComparisonTitle: {
      hu: "Teljes előtte-utána összehasonlítás",
      en: "Full before and after comparison",
      de: "Vollständiger Vorher-Nachher-Vergleich",
      uk: "Повне порівняння до і після",
      "zh-CN": "完整前后对比",
    },
    fullComparisonDescription: {
      hu: "Húzza a választóvonalat, vagy használja a nyílbillentyűket. A képek illusztratív példák, a konkrét feladatot mindig a helyszín állapota alapján egyeztetjük.",
      en: "Drag the divider or use the arrow keys. Images are illustrative examples; the actual task is always agreed from the condition of the property.",
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
      en: `${rounded}% before image visible`,
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
  const languageNames = "Magyar / English";
  const languageBadgeFallback = {
    hu: "Elérhető magyarul és angolul",
    en: "Available in Hungarian and English",
  };
  const languageBadgeText = () => window.BPS_I18N?.t?.("languageBadge", state.lang) || languageBadgeFallback[state.lang] || languageBadgeFallback.en;
  const languageTrustBadge = () => `
    <button class="language-trust-badge" type="button" data-language-selector-trigger aria-label="${languageBadgeText()}: ${languageNames}">
      <span class="language-badge-icon" aria-hidden="true"><span class="language-badge-globe"></span><span class="language-badge-count">2</span></span>
      <span class="language-badge-copy"><strong>${languageBadgeText()}</strong><small>${languageNames}</small></span>
      <span class="language-badge-flags" aria-hidden="true"><span class="flag-icon flag-hu" aria-hidden="true"></span><span class="flag-icon flag-en" aria-hidden="true"></span></span>
    </button>`;
  const paintHintMarkup = () => `
    <span class="paint-reveal-hint" aria-hidden="true">
      <span data-lang-panel="hu">Fesd át a falat az ujjaddal</span>
      <span data-lang-panel="en" hidden>Paint the wall with your finger</span>
      <span data-lang-panel="de" hidden>Streichen Sie die Wand mit dem Finger</span>
      <span data-lang-panel="uk" hidden>Пофарбуйте стіну пальцем</span>
      <span data-lang-panel="zh-CN" hidden>用手指粉刷墙面</span>
    </span>`;
  const projectLightboxImages = (project) => {
    const pair = hasProjectComparison(project)
      ? [
          [project.before, "before", { hu: `${tx(project.title)} - kiinduló állapot`, en: `${tx(project.title)} - starting condition` }],
          [project.after, "after", { hu: `${tx(project.title)} - rendezett kész állapot`, en: `${tx(project.title)} - finished condition` }],
        ]
      : [];
    const seen = new Set(pair.map((photo) => photo[0]));
    return [...pair, ...(project.images || []).filter((photo) => !seen.has(photo[0]))];
  };

  const content = {
    nav: {
      services: { hu: "Szolgáltatások", en: "Services" },
      clients: { hu: "Ügyfelek", en: "Clients" },
      projects: { hu: "Munkapéldák", en: "Work examples" },
      contact: { hu: "Kapcsolat", en: "Contact" },
    },
    hero: {
      label: { hu: "Soproni ingatlankarbantartás", en: "Property services in Sopron" },
      title: {
        hu: "Megbízható ingatlankarbantartás Sopronban és környékén",
        en: "Reliable Property Maintenance in Sopron and the Surrounding Area",
      },
      text: {
        hu:
          "Gyors, fotókkal dokumentált karbantartás, javítás és ingatlangondozás lakástulajdonosoknak, bérbeadóknak, Airbnb-házigazdáknak és az osztrák határ közelében élő külföldi tulajdonosoknak.",
        en:
          "Fast, photo-documented maintenance, repairs and property care for homeowners, landlords, Airbnb hosts and foreign property owners near the Austrian border.",
      },
      bullets: [
        { hu: "Angol nyelvű egyeztetés", en: "English-speaking service" },
        { hu: "Fotós visszajelzés minden munkánál", en: "Photo updates during every job" },
        { hu: "Gyors válasz WhatsAppon", en: "Fast response via WhatsApp" },
      ],
      primary: { hu: "Ingyenes ajánlatkérés", en: "Get a Free Quote" },
      whatsapp: { hu: "WhatsApp üzenet", en: "Chat on WhatsApp" },
      helper: {
        hu: "Küldjön néhány fotót, és megmondjuk, mi lehet a legjobb megoldás.",
        en: "Send us a few photos and we'll tell you the best solution.",
      },
      secondary: { hu: "Példák és folyamat", en: "Examples and process" },
      noteTitle: { hu: "Egy kapcsolattartó, követhető munkamenet", en: "One contact, a workflow you can follow" },
      noteText: {
        hu:
          "A feladatot indulás előtt pontosítjuk, az egyeztetett munkát dokumentálható lépésekben végezzük, az ingatlant pedig rendezett, használható állapotban adjuk át.",
        en:
          "The scope is clarified before work begins, agreed tasks are handled in trackable steps and the property is left orderly and ready to use.",
      },
    },
    stats: [
      {
        huN: "HU/EN",
        enN: "HU/EN",
        hu: "Magyar és angol kommunikáció",
        en: "Hungarian and English communication",
        huDetail: "A feladatlista, a hozzáférés, a határidő és az átadás magyarul vagy angolul is tisztázható.",
        enDetail: "Scope, access, timing and handover can be clarified in Hungarian or English.",
      },
      {
        huN: "Fotók",
        enN: "Photos",
        hu: "Fotós állapotfrissítések",
        en: "Photo condition updates",
        huDetail: "Kérés szerint a kiinduló állapot, a fontos munkafázis és az átadás is fotókkal követhető.",
        enDetail: "When requested, photos show the starting condition, key work stages and handover.",
      },
      {
        huN: "Sopron",
        enN: "Sopron",
        hu: "Soproni fókusz",
        en: "Sopron local focus",
        huDetail: "Belvárosi lakások, hétvégi házak, kiadó ingatlanok, irodák és kisvállalkozások gyakorlati karbantartása Sopronban.",
        enDetail: "Practical maintenance for historic old town apartments, weekend houses, rentals and small offices around Sopron.",
      },
    ],
    servicesTitle: {
      hu: "Milyen feladatokat érdemes ránk bízni?",
      en: "What you can confidently hand over",
    },
    servicesText: {
      hu:
        "Olyan célzott javításokra és karbantartási feladatokra fókuszálunk, ahol a tiszta egyeztetés, a rendezett kivitelezés és az átadás előtti állapot számít. Ez különösen hasznos tulajdonosoknak, kezelőknek és vendégfogadásra készülő ingatlanoknál.",
      en:
        "We focus on practical repairs and maintenance where clear scope, orderly execution and a presentable handover matter. This is especially useful for owners, managers and properties being prepared for guests, tenants or office use.",
    },
    transformationTitle: {
      hu: "A különbség az első pillanatban látszik",
      en: "The difference should be visible at first glance",
      de: "Der Unterschied sollte sofort sichtbar sein",
      uk: "Різницю має бути видно з першого погляду",
      "zh-CN": "变化应该一眼就看得出来",
    },
    transformationText: {
      hu:
        "A legtöbb érdeklődő néhány másodperc alatt dönt arról, hogy egy ingatlan gondozottnak tűnik-e. A célunk a tiszta, rendezett, bemutatható állapot, nem a túlzó látvány.",
      en:
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
      en: "Open example",
      de: "Beispiel öffnen",
      uk: "Відкрити приклад",
      "zh-CN": "打开示例",
    },
    problemsTitle: { hu: "Tipikus helyzetek, gyakorlati segítség", en: "Typical situations, practical support" },
    projectsTitle: { hu: "Illusztratív munkapéldák", en: "Illustrative work examples" },
    processTitle: { hu: "Hogyan lesz az üzenetből elvégezhető feladat?", en: "From first message to an organised job" },
    trustTitle: { hu: "Miért könnyű távolról is követni?", en: "Why remote coordination stays clear" },
    audienceTitle: { hu: "Kiknek hasznos?", en: "Who this is for" },
    faqTitle: { hu: "Gyakori kérdések", en: "Common questions" },
    contactTitle: { hu: "Küldjön fotót, és tisztázzuk a következő lépést", en: "Send photos and we’ll clarify the next step" },
    contactText: {
      hu:
        "A leggyorsabb kezdéshez küldjön 2-3 fotót, az ingatlan soproni címét vagy környékét, a hozzáférés módját és a kívánt időzítést. Röviden visszajelzünk, milyen információ hiányzik még, és mi lehet a reális következő lépés.",
      en:
        "For the fastest start, send 2-3 photos, the Sopron address or area, access details and your preferred timing. We will respond with what is still needed and what the realistic next step can be.",
    },
  };

  const services = [
    {
      key: "painting",
      cover: "assets/finished-room-1.jpg",
      title: { hu: "Festés és falfrissítés", en: "Interior painting and wall refresh" },
      text: {
        hu:
          "Kopott, foltos vagy javított falak rendezése vendégváltás, bérlőváltás, fotózás vagy irodai látogatás előtt. A cél nem látványos ígéret, hanem tiszta felület, egységes összkép és vállalható átadás.",
        en:
          "Refresh marked, patched or tired walls before guest changes, tenant handovers, photoshoots or office visits. The aim is a clean surface, a consistent room impression and a handover you can feel comfortable with.",
      },
      photos: [
        ["12036084", "before", { hu: "Régi, sérült falfelület: itt a fal állapotát kellett javíthatóvá tenni.", en: "Old damaged wall surface: the first task was to make the wall repairable." }],
        ["804392", "before", { hu: "Felújítás előtti helyiség, ahol a falhibák és az alsó falsáv külön figyelmet igényelt.", en: "Room before refresh, with visible wall damage and a lower wall section needing attention." }],
        ["3616757", "process", { hu: "Festésre előkészített teljes szoba, takart padlóval és összekészített anyagokkal.", en: "Full room prepared for painting, with flooring protected and materials arranged." }],
        ["3615721", "process", { hu: "A munkaterület rendezése festés előtt: a szoba használható állapotban marad a kivitelezéshez.", en: "Work area set up before painting so the room remains controlled during the job." }],
        ["6474471", "process", { hu: "Teljes falfelület javítása és hengerlése, nem csak egy közeli részlet.", en: "A full wall being repaired and rolled, not just a close-up detail." }],
        ["6473978", "process", { hu: "Nagyobb falmező csiszolása és simítása, hogy a festés egyenletes legyen.", en: "Large wall section being sanded and levelled so the paint finish looks even." }],
        ["assets/finished-room-1.jpg", "after", { hu: "Frissen festett soproni lakószoba tiszta falakkal, radiátorral és parkettával.", en: "Freshly painted Sopron living room with clean walls, radiators and parquet flooring." }],
        ["assets/finished-room-2.jpg", "after", { hu: "Üres, átadásra kész soproni szoba egységes falfelülettel és hétköznapi kialakítással.", en: "Empty Sopron room ready for handover, with consistent walls and an everyday layout." }],
        ["assets/airbnb-living-room.jpg", "after", { hu: "Rendezett, világos soproni lakótér friss falakkal és praktikus berendezéssel.", en: "Tidy, bright Sopron living space with refreshed walls and practical furnishings." }],
        ["assets/airbnb-bedroom.jpg", "after", { hu: "Tiszta, visszafogott soproni hálószoba vendég- vagy bérlőátadás előtt.", en: "Clean, understated Sopron bedroom before guest or tenant handover." }],
      ],
    },
    {
      key: "drywall",
      cover: "assets/property-maintenance-drywall-sanding.jpg",
      title: { hu: "Gipszkarton és almennyezet", en: "Drywall and ceiling repairs" },
      text: {
        hu:
          "Sérült vagy félkész gipszkarton, hézagok, glettelés, csiszolás és festésre előkészített felületek. A munka lényege, hogy a javítás ne külön hibaként látszódjon, hanem illeszkedjen a teljes helyiséghez.",
        en:
          "Damaged or unfinished drywall, seams, filling, sanding and paint-ready surfaces. The goal is for the repair to blend into the room, not remain visible as a separate defect.",
      },
      photos: [
        ["assets/drywall-before-matched.jpg", "before", { hu: "Üres, félkész helyiség gipszkarton és festés előtti állapotban: a teljes tér látszik.", en: "Empty unfinished room before drywall finishing and painting, showing the full space." }],
        ["15798783", "before", { hu: "Felújítás alatti teljes szoba, ahol a falak és mennyezeti csatlakozások még rendezésre várnak.", en: "Full room under renovation where walls and ceiling junctions still need finishing." }],
        ["5606879", "before", { hu: "Nagyobb belső munkaterület nyitott mennyezettel és javítandó felületekkel.", en: "Large interior work area with an open ceiling and surfaces still needing repair." }],
        ["3990359", "process", { hu: "Teljes felújítás alatti helyiség: létrák, takarás és előkészített munkaterület.", en: "Full room under renovation with ladders, protection and prepared working area." }],
        ["6474313", "process", { hu: "Mennyezeti gipszkarton felület hézagolás előtt, jól látható teljes felülettel.", en: "Drywall ceiling before joint finishing, with the broader surface visible." }],
        ["6474202", "process", { hu: "Mennyezeti illesztések kezelése nagyobb felületen, nem elszigetelt részletként.", en: "Ceiling joints handled across a larger surface, not as an isolated close-up." }],
        ["6474343", "process", { hu: "Gipszkarton mennyezet csiszolása és simítása festés előtt.", en: "Drywall ceiling being sanded and smoothed before painting." }],
        ["6474300", "process", { hu: "Teljes szoba előkészítése: takarás, csiszolás, poros munkafázis kontrolláltan.", en: "Full room preparation with masking, sanding and controlled dusty work." }],
        ["6474129", "process", { hu: "Mennyezeti javítás munka közben, a teljes felülethez igazítva.", en: "Ceiling repair in progress, aligned with the whole surface." }],
        ["9826455", "after", { hu: "Kész, üres helyiség: a javított felületek tiszta, festés utáni szobaképet adnak.", en: "Finished empty room where repaired surfaces create a clean post-work interior." }],
      ],
    },
    {
      key: "garden",
      cover: "assets/courtyard-garden-1.jpg",
      title: { hu: "Kert és udvar rendbetétele", en: "Garden and outdoor clean-up" },
      text: {
        hu:
          "Magas fű, benőtt udvar, elhanyagolt bejárat vagy terasz rendezése normál soproni környezetben. Bérleményeknél, Airbnb-nél és irodáknál a külső állapot már érkezéskor meghatározza az első benyomást.",
        en:
          "Mowing, trimming and tidying courtyards, entrances and terraces in realistic Sopron settings. For rentals, Airbnb and offices, outdoor condition shapes trust before anyone steps inside.",
      },
      photos: [
        ["assets/courtyard-before-entrance.jpg", "before", { hu: "Elhanyagolt soproni társasházi bejárat nyírás és lombgyűjtés előtt.", en: "Neglected Sopron apartment entrance before mowing and leaf collection." }],
        ["assets/courtyard-before-overgrown-lawn.jpg", "before", { hu: "Benőtt közös udvari gyep és bokorsáv egy soproni lakóépület mellett.", en: "Overgrown shared lawn and shrub border beside a Sopron residential building." }],
        ["assets/courtyard-before-overgrown-wall.jpg", "before", { hu: "Rendezetlen udvari növényzet és járdaszegély visszavágás előtt.", en: "Untidy courtyard planting and path edges before trimming." }],
        ["assets/courtyard-process-mowing.jpg", "process", { hu: "Fűnyírás és szegélyrendezés egy soproni társasház belső udvarában.", en: "Mowing and edge tidying in a Sopron apartment courtyard." }],
        ["assets/courtyard-process-hedge-trimming.jpg", "process", { hu: "Közönséges lombhullató sövény egyenletes visszavágása az udvari járda mellett.", en: "An ordinary deciduous hedge being trimmed evenly beside the courtyard path." }],
        ["assets/courtyard-process-shrub-pruning.jpg", "process", { hu: "Túlnőtt udvari bokor metszése, a levágott ágak rendezett gyűjtésével.", en: "Pruning an overgrown courtyard shrub while collecting the cut branches neatly." }],
        ["assets/courtyard-process-green-waste.jpg", "process", { hu: "Nyírás utáni zöldhulladék összegyűjtése egy soproni közös udvarban.", en: "Collecting green waste after trimming in a shared Sopron courtyard." }],
        ["assets/courtyard-garden-1.jpg", "after", { hu: "Rendezett soproni belső udvar nyírt fűvel, visszavágott sövénnyel és tiszta járdával.", en: "A tidy Sopron courtyard with cut grass, trimmed hedges and a clean path." }],
        ["assets/courtyard-garden-2.jpg", "after", { hu: "Karbantartott zöldsáv egy városi lakóépület mellett, egyszerű, jól áttekinthető kialakítással.", en: "A maintained green strip beside an urban residential building, kept simple and easy to manage." }],
        ["assets/courtyard-garden-3.jpg", "after", { hu: "Tiszta bejárati út és gondozott növényzet egy soproni társasházi udvarban.", en: "A clean entrance path and maintained planting in a Sopron apartment courtyard." }],
      ],
    },
    {
      key: "handyman",
      cover: "assets/handyman-services-wall-fixtures.jpg",
      title: { hu: "Kisebb javítások és szerelés", en: "Small repairs and handyman jobs" },
      text: {
        hu:
          "Polc, karnis, ajtóigazítás, szegély, rögzítés és átadás előtti apró hibák egy feladatlistába rendezve. Ezek külön-külön kicsinek tűnnek, együtt viszont sokat rontanak a tulajdonosi, bérlői vagy vendégélményen.",
        en:
          "Shelves, curtain rails, door adjustments, trims, fixings and small handover issues organised into one task list. Individually they may seem minor, but together they strongly affect how the property feels.",
      },
      photos: [
        ["13909112", "before", { hu: "Belső tér átadás előtt, ahol a kisebb szerelési és rendezési pontok adják meg a végső képet.", en: "Interior before handover where small installation and tidying points shape the final impression." }],
        ["13588248", "before", { hu: "Rendezetlenebb fali tároló és dekorációs felület: a cél egy használhatóbb, tisztább összkép.", en: "Less orderly wall storage and decor area before creating a more usable, cleaner impression." }],
        ["23224978", "process", { hu: "Fali kép vagy tartó pontos beállítása, hogy a helyiség rendezettebb legyen.", en: "Wall picture or mount being aligned so the room feels more orderly." }],
        ["4981802", "process", { hu: "Fali rögzítés és szerelés olyan helyen, ahol a kész eredmény használhatóbbá teszi a szobát.", en: "Wall fixing work that makes the room more usable once completed." }],
        ["assets/handyman-services-wall-fixtures.jpg", "after", { hu: "Felszerelt, rendezett fali polcok: a javítás használható tárolást és tisztább képet ad.", en: "Installed wall shelves creating usable storage and a cleaner visual result." }],
        ["19109111", "after", { hu: "Stabil, kész polcrendszer, amely a korábbi üres vagy rendezetlen falfelületet használhatóvá teszi.", en: "Stable finished shelving that turns an empty or untidy wall into useful storage." }],
        ["9565966", "after", { hu: "Rendezett fali tároló kisebb szerelés után, átadásra alkalmasabb belső képpel.", en: "Orderly wall storage after small installation work, improving the handover impression." }],
        ["5824546", "after", { hu: "Teljes falon megjelenő tároló és polcrendszer kész állapotban.", en: "Full wall storage and shelving shown in finished condition." }],
        ["19109111", "after", { hu: "Egyszerű, stabil fali polc elkészült állapotban, hétköznapi lakásbelsőben.", en: "A simple, stable wall shelf in a normal apartment interior." }],
        ["5824575", "after", { hu: "Kész fali tároló teljes nézetben, ahol a javítás eredménye egyértelműen látszik.", en: "Finished wall storage shown in full view, making the result easy to understand." }],
      ],
    },
  ];

  const projects = [
    {
      key: "paint",
      type: { hu: "Festés / faljavítás", en: "Painting / wall repair" },
      cover: "assets/finished-room-1.jpg",
      comparison: true,
      before: "assets/painting-before-matched.jpg",
      after: "assets/finished-room-1.jpg",
      title: { hu: "Kopott falból tiszta, egységes felület", en: "From tired walls to a clean finish" },
      summary: {
        hu:
          "Bérlőváltás vagy vendégérkezés előtt a falhibák azonnal látszanak. A cél az, hogy a helyiség gyorsan újra rendezett és bemutatható legyen.",
        en:
          "Before a tenant change or guest arrival, wall defects are immediately visible. The goal is to make the room presentable again quickly.",
      },
      result: {
        hu: "A helyiség tisztábbnak, gondozottabbnak és kiadhatóbbnak hat. A látogató nem a hibákat veszi észre először.",
        en: "The room feels cleaner, better cared for and easier to present. Visitors notice the space, not the defects.",
      },
      works: {
        hu: ["falhibák ellenőrzése fotók alapján", "felület előkészítése", "javítás és csiszolás", "egységes festés", "fotós visszajelzés"],
        en: ["photo-based wall condition check", "surface preparation", "patching and sanding", "consistent painted finish", "photo update after completion"],
      },
      photos: services[0].photos,
    },
    {
      key: "drywall",
      type: { hu: "Gipszkarton / mennyezet", en: "Drywall / ceiling" },
      cover: "assets/finished-room-2.jpg",
      comparison: true,
      before: "assets/drywall-before-matched.jpg",
      after: "assets/finished-room-2.jpg",
      title: { hu: "Félkész gipszkartonból festésre kész felület", en: "Drywall prepared for a finished interior" },
      summary: {
        hu:
          "A látható hézagok, élek és csiszolatlan javítások félkész hatást keltenek. Ilyenkor a cél nem látványos trükk, hanem pontos, tiszta előkészítés.",
        en:
          "Visible seams, edges and unsanded areas make a room feel unfinished. The aim is careful preparation, not cosmetic shortcuts.",
      },
      result: {
        hu: "A fal vagy mennyezet rendezett, festésre alkalmas és kevésbé vonja magára a figyelmet.",
        en: "The wall or ceiling becomes tidy, paint-ready and no longer distracts from the room.",
      },
      works: {
        hu: ["állapotfelmérés", "hézagok és élek javítása", "csiszolás", "felületkiegyenlítés", "átadás előtti ellenőrzés"],
        en: ["condition check", "seam and edge repair", "sanding", "surface levelling", "pre-handover review"],
      },
      photos: services[1].photos,
    },
    {
      key: "garden",
      type: { hu: "Kert / udvar", en: "Garden / outdoor" },
      cover: "assets/garden-maintenance-hero-garden.jpg",
      before: "assets/courtyard-before-entrance.jpg",
      after: "assets/courtyard-garden-1.jpg",
      title: { hu: "Benőtt udvarból gondozottabb érkezés", en: "From overgrown courtyard to a cared-for arrival" },
      summary: {
        hu:
          "A kert, udvar vagy bejárat gyakran az első pont, ahol az érdeklődő képet alkot az ingatlanról.",
        en:
          "The garden, yard or entrance often shapes trust before anyone steps inside the property.",
      },
      result: {
        hu: "Az ingatlan rendezettebbnek és gondozottabbnak tűnik már érkezéskor, ami bérleménynél és Airbnb-nél különösen fontos.",
        en: "The property feels better cared for from the first moment, especially for rentals and Airbnb homes.",
      },
      works: {
        hu: ["fűnyírás", "szegélyrendezés", "benőtt részek visszavágása", "zöldhulladék összegyűjtése", "kész állapot fotózása"],
        en: ["mowing", "edge tidying", "trimming overgrown areas", "green waste collection", "final condition photos"],
      },
      photos: services[2].photos,
    },
  ];

  Object.assign(projects[0], {
    category: "painting",
    location: { hu: "Soproni kiadó lakás", en: "Sopron rental apartment" },
    timeline: { hu: "egyeztetett ütemezés", en: "agreed scheduling" },
    client: { hu: "bérlőváltás előtt", en: "before tenant handover" },
    problem: {
      hu:
        "A falakon javításnyomok, kopások és foltok voltak. Ilyenkor az ingatlan nem igényel teljes felújítást, de a látható hibák azonnal rontják az első benyomást.",
      en:
        "The walls had visible marks, patch areas and wear. This did not require a full renovation, but the visible defects weakened the first impression immediately.",
    },
    approach: {
      hu:
        "A kritikus falrészeket fotók alapján beazonosítjuk, majd a felületet előkészítjük, javítjuk, csiszoljuk és egységesebb festett állapotban adjuk vissza.",
      en:
        "The critical wall areas are identified from photos, then prepared, repaired, sanded and handed back with a more consistent painted finish.",
    },
    evidence: {
      hu: ["előtte fotók", "felület-előkészítés", "javítás és csiszolás", "kész állapot fotók"],
      en: ["before photos", "surface preparation", "patching and sanding", "finished condition photos"],
    },
    metrics: [
      { n: "10", hu: "képes példa", en: "visual examples" },
      { n: "3", hu: "munkafázis", en: "work phases" },
      { n: { hu: "Egyeztetve", en: "Agreed" }, hu: "ütemezés", en: "timing" },
    ],
  });

  Object.assign(projects[1], {
    category: "drywall",
    location: { hu: "Lakásbelső / mennyezeti rész", en: "Interior apartment ceiling area" },
    timeline: { hu: "javítás és festésre előkészítés", en: "repair and paint-ready preparation" },
    client: { hu: "tulajdonosi felkészítés", en: "owner preparation" },
    problem: {
      hu:
        "A félkész gipszkarton és a rendezetlen hézagok amatőr hatást keltenek. Egy ilyen rész akkor is feltűnik, ha a lakás többi része rendben van.",
      en:
        "Unfinished drywall and rough seams make an interior feel improvised. Even a small area like this can stand out when the rest of the apartment is tidy.",
    },
    approach: {
      hu:
        "A hangsúly a pontos éleken, a simább átmeneteken és a festésre alkalmas felületen van. Nem látványos díszítés, hanem tiszta alapmunka.",
      en:
        "The focus is on cleaner edges, smoother transitions and a surface that is ready for painting. It is practical groundwork, not decorative cover-up.",
    },
    evidence: {
      hu: ["gipszkarton állapot", "hézagjavítás", "csiszolás", "átadás előtti kontroll"],
      en: ["drywall condition", "seam repair", "sanding", "pre-handover check"],
    },
    metrics: [
      { n: "10", hu: "képes példa", en: "visual examples" },
      { n: "5", hu: "ellenőrzési pont", en: "check points" },
      { n: "HU/EN", hu: "egyeztetés", en: "communication" },
    ],
  });

  Object.assign(projects[2], {
    category: "garden",
    location: { hu: "Soproni udvar és bejárati rész", en: "Sopron yard and entrance area" },
    timeline: { hu: "szezonális rendbetétel", en: "seasonal clean-up" },
    client: { hu: "bérlemény / Airbnb előkészítés", en: "rental / Airbnb preparation" },
    problem: {
      hu:
        "A magas fű, elhanyagolt szegély és rendezetlen bejárat már érkezéskor bizonytalanságot kelt. Ez különösen gond Airbnb-nél vagy bérleménynél.",
      en:
        "Overgrown grass, rough edges and a neglected entrance create doubt before anyone enters the property. This matters especially for rentals and Airbnb homes.",
    },
    approach: {
      hu:
        "A cél nem kertépítés, hanem gyors, látható rend: nyírás, szegélyezés, visszavágás, összegyűjtés és fotózott kész állapot.",
      en:
        "The aim is not landscape design, but fast visible order: mowing, edging, trimming, collection and a photographed finished condition.",
    },
    evidence: {
      hu: ["előtte állapot", "nyírás és szegélyezés", "zöldhulladék rendezése", "kész állapot"],
      en: ["before condition", "mowing and edging", "green waste tidy-up", "finished condition"],
    },
    metrics: [
      { n: "10", hu: "képes dokumentáció", en: "photo records" },
      { n: "1", hu: "rendezett érkezés", en: "tidier arrival" },
      { n: "0", hu: "felesleges kör", en: "unneeded detours" },
    ],
  });

  projects.push(
    {
      key: "airbnb-turnover",
      category: "airbnb",
      type: { hu: "Airbnb / bérlőváltás", en: "Airbnb / tenant turnover" },
      cover: "assets/airbnb-living-room.jpg",
      comparison: true,
      before: "assets/airbnb-before-turnover-matched.jpg",
      after: "assets/airbnb-living-room.jpg",
      title: { hu: "Lakásfrissítés vendégérkezés előtt", en: "Apartment refresh before guest arrival" },
      location: { hu: "Soproni Airbnb lakás", en: "Sopron Airbnb apartment" },
      timeline: { hu: "vendégérkezéshez igazítva", en: "planned around guest arrival" },
      client: { hu: "vendégváltás előtt", en: "before guest turnover" },
      summary: {
        hu:
          "Vendégváltás előtt a kisebb hibák is feltűnőek. Ilyenkor a legfontosabb a pontosan egyeztetett, tiszta és dokumentált munka.",
        en:
          "Before a guest turnover, even small defects are noticeable. The priority is clearly scheduled, tidy and documented work.",
      },
      problem: {
        hu:
          "A lakásban több kisebb nyom, rögzítési hiba és javítandó rész jelent meg egyszerre. A tulajdonosnak nem külön szakikat kell szerveznie minden apróságra.",
        en:
          "Several smaller marks, fixing issues and visible defects appeared at once. The owner should not have to coordinate separate trades for every small item.",
      },
      approach: {
        hu:
          "A látható hibákat rangsoroljuk: ami a vendégnek azonnal feltűnik, előre kerül. A munka végén képes visszajelzés segíti a távoli döntést.",
        en:
          "Visible issues are prioritised by guest impact. At completion, photo updates help the owner make decisions remotely.",
      },
      result: {
        hu:
          "A lakás gyorsabban vállalható állapotba kerül, kevesebb bizonytalansággal a vendégérkezés előtt.",
        en:
          "The apartment becomes presentable faster, with less uncertainty before guest arrival.",
      },
      works: {
        hu: ["látható hibák listázása", "falfrissítés", "kisebb rögzítések", "átadás előtti ellenőrzés", "fotós dokumentáció"],
        en: ["visible issue list", "wall touch-up", "small fixings", "pre-handover check", "photo documentation"],
      },
      evidence: {
        hu: ["problémalista", "javítás közbeni fotók", "kész állapot", "tulajdonosi visszajelzésre kész anyag"],
        en: ["issue list", "work-in-progress photos", "finished condition", "owner-ready update"],
      },
      metrics: [
        { n: "10", hu: "fotó", en: "photos" },
        { n: "4", hu: "javítási típus", en: "repair types" },
        { n: "1", hu: "kapcsolattartási pont", en: "contact point" },
      ],
      photos: [
        ["5102904", "before", { hu: "Vendégváltás előtti lakott állapot: a nappalit rendezettebbé és fotózhatóbbá kell tenni.", en: "Lived-in condition before guest turnover: the living room needs to become tidier and easier to present." }],
        ["6195959", "process", { hu: "Airbnb előkészítés takarítással és ellenőrzéssel, teljesebb lakótérben látható munkával.", en: "Airbnb preparation with cleaning and checking, shown in a fuller living-space context." }],
        ["6764827", "after", { hu: "Kész, rendezett nappali vendégérkezéshez: tiszta, átlátható és használható tér.", en: "Finished living room for guest arrival: clean, clear and usable." }],
        ["8135495", "after", { hu: "Rendezett hálószoba átadás előtt, tiszta textillel és ellenőrizhető összképpel.", en: "Tidy bedroom before handover, with clean textiles and a reviewable overall condition." }],
        ["19899060", "after", { hu: "Világos, teljes nappali kész állapotban, amely jól mutat vendégfotón és átadáskor.", en: "Bright full living room in finished condition, suitable for guest photos and handover." }],
        ["assets/airbnb-living-room.jpg", "after", { hu: "Hétköznapi soproni nappali rendezett, vendégfogadásra kész állapotban.", en: "Everyday Sopron living room in a tidy, guest-ready condition." }],
        ["assets/finished-room-2.jpg", "after", { hu: "Frissen festett, egyszerű soproni szoba tiszta járófelülettel.", en: "Freshly painted, simple Sopron room with clear circulation." }],
        ["assets/finished-room-1.jpg", "after", { hu: "Világos soproni lakószoba rendezett falakkal, átadásra kész állapotban.", en: "Bright Sopron living room with tidy walls, ready for handover." }],
        ["assets/airbnb-bedroom.jpg", "after", { hu: "Tiszta, visszafogott hálószoba, amely vendégnek és tulajdonosnak is könnyen ellenőrizhető.", en: "Clean, understated bedroom that is easy for both guest and owner to review." }],
        ["271624", "after", { hu: "Kompakt Airbnb lakótér kész állapotban, rendezett fallal és használható elrendezéssel.", en: "Compact Airbnb living area in finished condition, with tidy walls and usable layout." }],
      ],
    },
    {
      key: "office-touchup",
      category: "office",
      type: { hu: "Iroda / képviseleti tér", en: "Office / representative space" },
      cover: "assets/office-finished-1.jpg",
      comparison: true,
      before: "assets/office-before-touchup-matched.jpg",
      after: "assets/office-finished-1.jpg",
      title: { hu: "Iroda gyors frissítése látogatás előtt", en: "Office touch-up before a visit" },
      location: { hu: "Soproni iroda", en: "Sopron office" },
      timeline: { hu: "rövid, célzott munka", en: "short, focused work" },
      client: { hu: "nemzetközi környezet", en: "international environment" },
      summary: {
        hu:
          "Irodáknál és képviseleti tereknél nem fér bele a zavaros kivitelezés. A munka legyen rövid, diszkrét és tisztán kommunikált.",
        en:
          "Offices and representative spaces need quiet, organised work. The job should be short, discreet and clearly communicated.",
      },
      problem: {
        hu:
          "A falakon és használati pontokon apró sérülések rontották a rendezett képet. Ezek nem nagy hibák, de egy látogatásnál feltűnnek.",
        en:
          "Small marks and worn areas affected the professional feel of the office. They were not major defects, but they are noticeable during a visit.",
      },
      approach: {
        hu:
          "A munka a látható felületekre koncentrál: faljavítás, javítófestés, kisebb igazítások és tiszta átadás.",
        en:
          "Work focuses on visible surfaces: wall repair, touch-up painting, small adjustments and clean handover.",
      },
      result: {
        hu:
          "Az iroda rendezettebb, nyugodtabb és vendégfogadásra alkalmasabb benyomást kelt.",
        en:
          "The office feels more orderly, calmer and better prepared for visitors.",
      },
      works: {
        hu: ["látható sérülések felmérése", "javítófestés", "gipszkarton részjavítás", "kisebb szerelés", "tiszta átadás"],
        en: ["visible defect check", "touch-up painting", "minor drywall repair", "small adjustments", "tidy handover"],
      },
      evidence: {
        hu: ["diszkrét munkaszervezés", "részletfotók", "átadás előtti ellenőrzés", "kész állapot"],
        en: ["discreet scheduling", "detail photos", "pre-handover check", "finished condition"],
      },
      metrics: [
        { n: "HU/EN", hu: "kommunikáció", en: "communication" },
        { n: "5", hu: "ellenőrzési pont", en: "check points" },
        { n: "10", hu: "kép", en: "images" },
      ],
      photos: [
        ["5483236", "before", { hu: "Üres irodatér frissítés előtt: a cél a tiszta, használatra kész munkakörnyezet.", en: "Empty office before refresh, with the goal of a clean, usable work environment." }],
        ["8477444", "before", { hu: "Nagyobb nyitott iroda átadás előtt, ahol a teljes tér összképe számít.", en: "Large open office before handover, where the overall impression matters." }],
        ["assets/office-process-wall-touchup.jpg", "process", { hu: "Szervezett javítófestés egy soproni iroda kisebb falszakaszán.", en: "Organised touch-up painting on a small wall section in a Sopron office." }],
        ["5511098", "process", { hu: "Nagyobb irodai munkatér ellenőrzése frissítés előtt, teljesebb perspektívából.", en: "Larger office workspace reviewed before refresh, shown from a wider perspective." }],
        ["assets/office-finished-1.jpg", "after", { hu: "Rendezett soproni irodatér tiszta falakkal és hétköznapi berendezéssel.", en: "Tidy Sopron office with clean walls and practical furnishings." }],
        ["assets/office-finished-2.jpg", "after", { hu: "Világos, látogatófogadásra kész soproni váró- és közösségi tér.", en: "Bright Sopron waiting and shared area ready to receive visitors." }],
        ["assets/office-finished-3.jpg", "after", { hu: "Egyszerű soproni tárgyaló egységes falakkal és rendezett összképpel.", en: "Simple Sopron meeting room with consistent walls and an orderly appearance." }],
        ["7534216", "after", { hu: "Kész tárgyaló jellegű tér, tiszta falakkal és rendezett összképpel.", en: "Finished meeting-style room with clean walls and an orderly appearance." }],
        ["36631699", "after", { hu: "Tágas iroda teljes nézetben, rendezett munkaállomásokkal.", en: "Spacious office shown in full view, with orderly workstations." }],
        ["1181406", "after", { hu: "Teljes irodatér használat közben: a frissített környezet professzionálisabb képet ad.", en: "Full office area in use, with the refreshed environment supporting a more professional feel." }],
      ],
    },
    {
      key: "handover-small-fixes",
      category: "handyman",
      type: { hu: "Kisebb javítások / átadás", en: "Small repairs / handover" },
      cover: "assets/airbnb-bedroom.jpg",
      comparison: true,
      before: "assets/handyman-before-matched.jpg",
      after: "assets/airbnb-bedroom.jpg",
      title: { hu: "Apró hibákból rendezett átadás", en: "Small defects turned into a tidy handover" },
      location: { hu: "Soproni bérlemény", en: "Sopron rental property" },
      timeline: { hu: "átadás előtti javítás", en: "pre-handover repairs" },
      client: { hu: "tulajdonos / kezelő", en: "owner / manager" },
      summary: {
        hu:
          "A kisebb hibák külön-külön nem tűnnek súlyosnak, de együtt azt sugallják, hogy az ingatlan nincs kézben tartva.",
        en:
          "Small defects may not look serious individually, but together they suggest the property is not being managed properly.",
      },
      problem: {
        hu:
          "Karnis, polc, fogantyú, szegély vagy ajtóigazítás jellegű apróságok gyűltek össze. Ezek átadásnál vagy fotózásnál erősen látszanak.",
        en:
          "Small items such as rails, shelves, handles, trims or door adjustments had built up. These details are visible during handover or photography.",
      },
      approach: {
        hu:
          "A munkát listázzuk, majd egy körben kezeljük a kisebb hibákat. Így a tulajdonos nem veszít időt sok külön egyeztetéssel.",
        en:
          "The items are listed and handled in one focused visit, reducing the need for the owner to coordinate multiple small tasks.",
      },
      result: {
        hu:
          "Az ingatlan rendezettebb és átadhatóbb lett, a javítások pedig követhető listában szerepelnek.",
        en:
          "The property becomes tidier and easier to hand over, with completed fixes documented in a clear list.",
      },
      works: {
        hu: ["javítási lista", "kisebb rögzítések", "ajtó és szegély igazítás", "látható hibák kezelése", "fotós visszajelzés"],
        en: ["repair list", "small fixings", "door and trim adjustments", "visible defect handling", "photo update"],
      },
      evidence: {
        hu: ["feladatlista", "munkafolyamat képek", "kész állapot", "átadásra alkalmasabb tér"],
        en: ["task list", "process images", "finished condition", "more handover-ready space"],
      },
      metrics: [
        { n: "1", hu: "szervezett kör", en: "organised visit" },
        { n: "10", hu: "fotó", en: "photos" },
        { n: "5+", hu: "tipikus apró hiba", en: "typical small defects" },
      ],
      photos: services[3].photos,
    }
  );

  const projectFilters = [
    { key: "all", label: { hu: "Összes munkatípus", en: "All service types" } },
    { key: "painting", label: { hu: "Festés", en: "Painting" } },
    { key: "drywall", label: { hu: "Gipszkarton", en: "Drywall" } },
    { key: "garden", label: { hu: "Kert", en: "Garden" } },
    { key: "airbnb", label: { hu: "Airbnb", en: "Airbnb" } },
    { key: "office", label: { hu: "Iroda", en: "Office" } },
    { key: "handyman", label: { hu: "Kisebb javítás", en: "Small fixes" } },
  ];

  const referenceProofs = [
    {
      n: "01",
      title: { hu: "Állapot előtte", en: "Condition before" },
      text: {
        hu: "Az illusztráció megmutatja az adott munkatípus jellemző kiinduló állapotát.",
        en: "The illustration shows a typical starting condition for this kind of work.",
      },
    },
    {
      n: "02",
      title: { hu: "Munka közben", en: "During the work" },
      text: {
        hu: "A képek a jellemző előkészítési és javítási lépéseket szemléltetik.",
        en: "The images illustrate typical preparation and repair stages.",
      },
    },
    {
      n: "03",
      title: { hu: "Kész átadás", en: "Finished handover" },
      text: {
        hu: "A várható eredmény egyszerűen látható: tisztább felület és rendezettebb tér.",
        en: "The expected result is easy to understand: cleaner surfaces and a tidier space.",
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
    ["Külföldön élő tulajdonos", "Foreign owner", "A feladat fotókkal és rövid leírással is elindítható, így a tulajdonos akkor is átlátja a helyzetet, ha nincs Sopronban.", "The job can begin with photos and a short brief, so the owner can understand the situation even when they are not in Sopron."],
    ["Airbnb-vendégváltás", "Airbnb turnover", "A látható hibákat, falnyomokat és kisebb javításokat a következő érkezéshez igazítva lehet priorizálni.", "Visible defects, wall marks and small repairs can be prioritised around the next arrival."],
    ["Bérlő kiköltözése után", "After a tenant moves out", "Falhibák, kisebb sérülések, szerelési pontok és átadás előtti frissítés egy közös, követhető feladatlistába rendezhető.", "Wall marks, minor damage, fittings and pre-handover touch-ups can be organised into one trackable scope."],
    ["Ingatlankezelői feladatlista", "Property manager task list", "Több apró karbantartási pont egy egyeztetésben kezelhető, így kevesebb külön kör és kevesebb félreértés marad.", "Several small maintenance items can be handled in one coordination flow, reducing separate follow-ups and misunderstandings."],
    ["Elhanyagolt udvar vagy kert", "Neglected yard or garden", "Fűnyírással, metszéssel és a járófelületek rendezésével a külső tér ismét gondozott, bemutatható képet mutathat.", "Mowing, pruning and tidying paths can restore an orderly, presentable outdoor area."],
    ["Iroda vagy képviseleti tér látogatás előtt", "Office or representative space before a visit", "Kisebb faljavítások, festés és szerelések úgy ütemezhetők, hogy a napi működést és a belépési szabályokat is figyelembe vegyük.", "Minor wall repairs, painting and fittings can be scheduled around daily operations and access requirements."],
  ];

  const problemUi = {
    details: { hu: "Részletek +", en: "Details +", de: "Mehr erfahren +", uk: "Детальніше +", "zh-CN": "详情 +" },
    close: { hu: "Bezárás −", en: "Close −", de: "Schließen −", uk: "Закрити −", "zh-CN": "关闭 −" },
    nextStep: { hu: "Javasolt következő lépés", en: "Recommended next step", de: "Empfohlener nächster Schritt", uk: "Рекомендований наступний крок", "zh-CN": "建议的下一步" },
    relatedService: { hu: "Kapcsolódó szolgáltatás", en: "Related service", de: "Passende Leistung", uk: "Пов’язана послуга", "zh-CN": "相关服务" },
    viewPhotos: { hu: "Példaképek megnyitása", en: "View example photos", de: "Beispielfotos ansehen", uk: "Переглянути приклади фото", "zh-CN": "查看示例照片" },
    sendPhotos: { hu: "Fotók küldése WhatsAppon", en: "Send photos on WhatsApp", de: "Fotos per WhatsApp senden", uk: "Надіслати фото у WhatsApp", "zh-CN": "通过 WhatsApp 发送照片" },
    typical: { hu: "Tipikus helyzet", en: "Typical situation", de: "Typische Situation", uk: "Типова ситуація", "zh-CN": "典型情况" },
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
      service: { hu: "Ingatlankarbantartás", en: "Property maintenance" },
      href: "property-maintenance-sopron.html",
      projectIndex: 0,
      next: {
        hu: "Küldjön néhány áttekintő fotót, a soproni címet vagy környéket és azt, hogyan lehet bejutni az ingatlanba. Így gyorsan látható, hogy fotók alapján elindítható-e a feladat.",
        en: "Send a few overview photos, the Sopron address or area and access details. This makes it clear whether the task can start from photos or needs an on-site check.",
      },
    },
    {
      service: { hu: "Takarítás és karbantartás", en: "Cleaning and maintenance" },
      href: "cleaning-services-sopron.html",
      projectIndex: 3,
      next: {
        hu: "Írja meg a következő vendég érkezési idejét, küldjön fotókat a látható hibákról, és jelölje meg, mi számít sürgősnek.",
        en: "Share the next guest arrival time, send photos of visible issues and mark what is urgent.",
      },
    },
    {
      service: { hu: "Festés és faljavítás", en: "Painting and wall repairs" },
      href: "painting-wall-repairs-sopron.html",
      projectIndex: 0,
      next: {
        hu: "Küldjön képeket a falhibákról, a helyiségről és az átadási határidőről. Ebből eldönthető, javítófestés vagy nagyobb frissítés indokolt-e.",
        en: "Send photos of the wall defects, the room and the handover deadline. From there we can clarify whether touch-up painting or a fuller refresh makes sense.",
      },
    },
    {
      service: { hu: "Ezermester és ingatlankarbantartás", en: "Handyman and property maintenance" },
      href: "handyman-services-sopron.html",
      projectIndex: 5,
      next: {
        hu: "Készítsen rövid listát a hibákról, mellékeljen fotókat, és írja le, ki tudja jóváhagyni az esetleges változásokat.",
        en: "Prepare a short task list, attach photos and note who can approve any scope changes.",
      },
    },
    {
      service: { hu: "Kertfenntartás", en: "Garden maintenance" },
      href: "garden-maintenance-sopron.html",
      projectIndex: 2,
      next: {
        hu: "Küldjön kültéri fotókat, jelölje meg a hozzáférést és az időjárástól függő határidőt. Így reális ütemezést lehet adni.",
        en: "Send outdoor photos, access details and any weather-sensitive deadline. This helps set a realistic schedule.",
      },
    },
    {
      service: { hu: "Festés, faljavítás és szerelés", en: "Painting, wall repairs and fittings" },
      href: "painting-wall-repairs-sopron.html",
      projectIndex: 4,
      next: {
        hu: "Küldjön fotókat a látogatás előtt zavaró részletekről, a működési időről és a belépési szabályokról. Így diszkréten ütemezhető a munka.",
        en: "Send photos of the details that matter before the visit, plus operating hours and access rules. The work can then be scheduled discreetly.",
      },
    },
  ];

  const process = [
    ["Fotók, cím és időzítés", "Photos, location and timing", "Küldje el a problémát, néhány fotót, a soproni helyszínt és azt, mikorra fontos az átadás vagy vendégérkezés.", "Send the issue, a few photos, the Sopron location and the timing that matters for handover or guest arrival."],
    ["Feladatlista és hozzáférés", "Scope and access", "Tisztázzuk, mi tartozik a munkába, hogyan lehet bejutni, ki dönthet a változásokról, és kell-e helyszíni felmérés.", "We clarify what is included, how access works, who can approve changes and whether an on-site assessment is needed."],
    ["Egyeztetett munkavégzés", "Agreed execution", "A kivitelezés a jóváhagyott feladatokra koncentrál. Ha közben új kérdés merül fel, azt nem feltételezéssel, hanem külön egyeztetéssel kezeljük.", "Work follows the agreed scope. If a new question appears, it is handled by a separate check-in rather than assumption."],
    ["Fotós állapotfrissítés", "Photo condition update", "Kérés szerint láthatóvá tesszük a kiinduló állapotot, a fontos munkafázist és az elkészült eredményt.", "When requested, photos show the starting condition, important work stages and the finished result."],
    ["Rendezett átadás", "Orderly handover", "Az elkészült feladatokat röviden összefoglaljuk, az ingatlant pedig használható, tiszta és bemutatható állapotban hagyjuk.", "Completed tasks are summarised and the property is left usable, tidy and ready to present."],
  ];

  const audience = [
    ["Határon átnyúló tulajdonosok és osztrák kapcsolatú vállalkozások", "Cross-border owners and Austrian-linked businesses", "Sopron az osztrák határtól néhány percre fekszik, ezért sok tulajdonos és kisebb iroda két ország között osztja meg az idejét. A feladatok a látogatásokhoz, a távoli döntéshozatalhoz és a belépési szabályokhoz igazíthatók.", "Sopron's location minutes from the Austrian border means many owners and small offices split their time between countries. Tasks can be planned around visits, remote decisions and site-access requirements."],
    ["Helyi cégek és kisirodák", "Local companies and small offices", "Kisebb javítások, falfrissítés és szerelési feladatok a napi működéshez igazítva. A cél a rendezett környezet helyreállítása indokolatlan fennakadás nélkül.", "Minor repairs, wall refreshes and fittings can be scheduled around normal operations. The goal is to restore an orderly environment without unnecessary disruption."],
    ["Külföldi tulajdonosok", "Foreign property owners", "Az egyeztetés magyarul vagy angolul történhet, a fontos állapotokról pedig fotós visszajelzés kérhető. Ez különösen hasznos az Ausztriában vagy távolabb élő tulajdonosoknak, akik nem tartózkodnak helyben Sopronban.", "Communication is available in Hungarian or English, with photo updates for important stages. This is particularly useful for owners based in Austria or further abroad who are not on site in Sopron."],
    ["Airbnb és hosszú távú bérlemények", "Airbnb and long-term rentals", "Vendég- vagy bérlőváltás előtt a látható hibák, faljavítások és kisebb karbantartási feladatok egy folyamatban kezelhetők. A határidőt mindig a tényleges munka alapján egyeztetjük.", "Visible defects, wall repairs and small maintenance jobs can be handled together before a guest or tenant change. Timing is always agreed against the actual scope."],
    ["Ingatlankezelők és helyi kapcsolattartók", "Property managers and local coordinators", "Ha több kisebb feladat gyűlik össze egy lakásban, irodában vagy közös területen, a munkát átlátható listába rendezzük. Ez segít abban, hogy a tulajdonos, kezelő és helyszíni kapcsolattartó ugyanazt lássa.", "When several small tasks build up in an apartment, office or shared area, they are organised into a clear list. This helps the owner, manager and local contact work from the same information."],
    ["Magánházak és lakástulajdonosok", "Private homeowners and apartment owners", "Családi házak és saját használatú lakások kisebb javításai, festése, gipszkarton-javítása, kert- és szezonális karbantartása is egy átlátható feladatlistába rendezhető. Költözés vagy értékesítés előtt segítünk az otthont rendezett, használható és bemutatható állapotba hozni.", "Small repairs, painting, drywall work, garden care and seasonal maintenance can be organised into one clear scope for family houses and owner-occupied apartments. Before moving in or selling, we help prepare the home so it is tidy, usable and ready to present."],
  ];

  const faq = [
    ["Lehet csak kisebb munkát kérni?", "Can I request a small job?", "Igen. A szolgáltatás kifejezetten alkalmas kisebb, de fontos javításokra is, például falhibákra, szerelési feladatokra vagy átadás előtti frissítésre. A vállalhatóságot mindig a helyszín, a feladatlista és az időzítés alapján erősítjük meg.", "Yes. The service is suitable for smaller but important jobs such as wall repairs, fittings or pre-handover touch-ups. Availability is confirmed against the location, task list and required timing."],
    ["Küldhetek fotókat első körben?", "Can I send photos first?", "Igen, ez a legegyszerűbb kiindulópont. Néhány jól megvilágított összkép és közelkép sokszor elég ahhoz, hogy meghatározzuk a következő lépést. Ha a pontos műszaki tartalom fotókból nem állapítható meg, helyszíni felmérést javaslunk.", "Yes, that is usually the easiest place to start. A few clear overview and close-up photos are often enough to identify the next step. If the technical scope cannot be confirmed from images, we will recommend an on-site assessment."],
    ["Angolul is lehet egyeztetni?", "Is English communication available?", "Igen. A feladat egyeztetése, a munkafázisok visszajelzése és az átadás magyarul vagy angolul is történhet. Ez nem külön szolgáltatás, hanem a működés része.", "Yes. Scope, progress updates and handover can all be handled in Hungarian or English. Bilingual communication is part of the service, not an add-on."],
    ["Hogyan alakul az ár?", "How is pricing established?", "Az ár a tényleges feladatból, az anyagigényből, a hozzáférésből és az időzítésből áll össze. Fotók alapján gyakran adható első tájékoztatás, de összetettebb vagy rejtett hibáknál helyszíni felmérés szükséges lehet. A jóváhagyott munkán túli változásokat külön egyeztetjük.", "Pricing depends on the actual scope, materials, access and timing. Photos can often support an initial indication, while complex or concealed issues may require a site assessment. Changes beyond the agreed work are discussed separately."],
    ["Tudnak segíteni sürgős Airbnb-helyzetben?", "Can you help with an urgent Airbnb issue?", "A rövid határidejű feladatokat kapacitás és a munka terjedelme alapján vizsgáljuk meg. A fotók, a pontos cím és a következő vendég érkezési ideje segít gyorsan eldönteni, mi vállalható reálisan. Nem ígérünk olyan határidőt, amely mellett a munka minősége nem tartható.", "Short-notice work is considered against current capacity and the real scope. Photos, the exact location and the next arrival time help us assess what can be completed realistically. We do not promise a deadline that would compromise the work."],
    ["Mi történik, ha nem vagyok Sopronban?", "What if I am not in Sopron?", "A feladat távolról is egyeztethető, ha a bejutás és a döntési jogosultság rendezett. A fontos kérdéseket indulás előtt tisztázzuk, a munkáról pedig kérés szerint fotós frissítést küldünk. Kulcsátadást vagy helyszíni kapcsolattartót minden esetben előre egyeztetünk.", "The work can be coordinated remotely when access and decision-making authority are clear. Important questions are settled before the visit, with photo updates available on request. Key handover or a local contact is always agreed in advance."],
    ["Sopronban kívül is vállalnak munkát?", "Do you work outside Sopron?", "Az elsődleges működési terület Sopron. A közvetlen környéken lévő feladatokat a távolság, a munka mérete és az időzítés alapján lehet megvizsgálni. Érdemes elküldeni a pontos helyszínt már az első üzenetben.", "Sopron is the primary service area. Jobs in the nearby area can be considered depending on distance, scope and timing. Include the exact location in the first message so feasibility can be assessed quickly."],
    ["A weboldal képei saját referenciák?", "Are the website images completed client projects?", "Nem. Az oldalon szereplő képek illusztratív példák, amelyek tipikus kiinduló állapotokat, munkafázisokat és várható eredményeket mutatnak. Egy konkrét ingatlan feladatát mindig a helyszín és a tényleges állapot alapján egyeztetjük.", "No. The images are illustrative examples showing typical starting conditions, work stages and expected outcomes. The scope for a specific property is always agreed from its actual condition and site requirements."],
  ];

  projects.forEach((project) => {
    project.description = project.description || project.summary;
    project.images = project.images || project.photos || [];
    project.photos = project.images;
    project.videos = [];
  });

  const heroTrustSignals = [
    {
      label: { hu: "Fotós frissítések", en: "Photo updates", de: "Foto-Updates", uk: "Фотооновлення", "zh-CN": "照片更新" },
      text: {
        hu: "A kiinduló állapot és a kész eredmény követhető marad.",
        en: "The starting condition and finished result stay easy to follow.",
        de: "Ausgangszustand und Ergebnis bleiben nachvollziehbar.",
        uk: "Початковий стан і результат легко відстежити.",
        "zh-CN": "初始状态和完成结果都清晰可跟进。",
      },
    },
    {
      label: { hu: "Angol kommunikáció", en: "English-speaking service", de: "Englische Kommunikation", uk: "Англійська комунікація", "zh-CN": "英文沟通" },
      text: {
        hu: "Külföldi tulajdonosoknak is érthető, rendezett egyeztetés.",
        en: "Clear coordination for international owners and local contacts.",
        de: "Klare Abstimmung für internationale Eigentümer und lokale Kontakte.",
        uk: "Зрозуміла координація для іноземних власників і місцевих контактів.",
        "zh-CN": "为国际业主和本地联系人提供清晰协调。",
      },
    },
    {
      label: { hu: "Gyors WhatsApp válasz", en: "Fast WhatsApp response", de: "Schnelle WhatsApp-Antwort", uk: "Швидка відповідь у WhatsApp", "zh-CN": "WhatsApp 快速回复" },
      text: {
        hu: "Küldjön fotókat, címet és időzítést; innen tisztázzuk a következő lépést.",
        en: "Send photos, location and timing; we clarify the next step from there.",
        de: "Senden Sie Fotos, Standort und Timing; daraus klären wir den nächsten Schritt.",
        uk: "Надішліть фото, адресу й терміни; далі уточнимо наступний крок.",
        "zh-CN": "发送照片、地点和时间安排；我们再确认下一步。",
      },
    },
    {
      label: { hu: "Egy kapcsolattartó", en: "One contact person", de: "Eine Kontaktperson", uk: "Одна контактна особа", "zh-CN": "一位对接人" },
      text: {
        hu: "Kevesebb szervezés, átláthatóbb döntések és rendezettebb átadás.",
        en: "Less coordination, clearer decisions and a more orderly handover.",
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
      tag: { hu: "Udvar és kert", en: "Courtyard and garden", de: "Hof und Garten", uk: "Двір і сад", "zh-CN": "庭院与花园" },
      title: { hu: "Benőtt udvarból gondozottabb érkezés", en: "From overgrown courtyard to a cared-for arrival", de: "Vom überwucherten Hof zu einem gepflegteren Ankommen", uk: "Від зарослого подвір’я до доглянутішого входу", "zh-CN": "从杂草丛生的庭院到更整洁的到达印象" },
      text: {
        hu: "Hitelesebb kültéri változás: magasabb fű és fáradt növényzet helyett rendezettebb első benyomás.",
        en: "A more believable outdoor change: long grass and tired planting replaced by a tidier first impression.",
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
              <span class="link">${state.lang === "hu" ? "Példák és képek" : "Examples and photos"}</span>
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
            <span><b>${state.lang === "hu" ? item.huN : item.enN}</b><small>${state.lang === "hu" ? item.hu : item.en}</small></span>
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
          const title = tx({ hu: item[0], en: item[1] });
          const description = tx({ hu: item[2], en: item[3] });
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
            <span><strong>${tx({ hu: item[0], en: item[1] })}</strong>${disclosureMarkup("small disclosure-link")}</span>
          </summary>
          <p id="${panelId}">${tx({ hu: item[2], en: item[3] })}</p>
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
          <summary aria-expanded="false" aria-controls="${panelId}"><span>${tx({ hu: item[0], en: item[1] })}</span>${disclosureMarkup("disclosure-icon")}</summary>
          <div class="faq-answer" id="${panelId}"><p>${tx({ hu: item[2], en: item[3] })}</p></div>
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
          <strong>${state.lang === "hu" ? "Illusztratív képsorozat" : "Illustrative image sequence"}</strong>
          <span data-carousel-count aria-live="polite">${images.length} ${state.lang === "hu" ? "kép" : "images"}</span>
        </div>
        <div class="carousel-stage">
          <button class="carousel-arrow carousel-prev" type="button" data-carousel-prev="${id}" aria-label="${state.lang === "hu" ? "Előző kép" : "Previous image"}">‹</button>
          <div class="carousel-viewport">
            <div class="carousel-track">
              ${images.map((p, i) => `<button class="carousel-slide" type="button" data-slide="${i}" data-phase="${p[1]}"><img src="${img(p[0], isModal ? 1100 : 520)}" alt="${photoCaption(p)}" loading="${isModal && i === 0 ? "eager" : "lazy"}" decoding="async"><span class="slide-caption"><b>${phaseText(p[1])}</b><span>${photoCaption(p)}</span></span></button>`).join("")}
            </div>
          </div>
          <button class="carousel-arrow carousel-next" type="button" data-carousel-next="${id}" aria-label="${state.lang === "hu" ? "Következő kép" : "Next image"}">›</button>
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
                <div><b>${images.length}</b><small>${state.lang === "hu" ? "fotó" : "photos"}</small></div>
                <div><b>${counts.process}</b><small>${tx(phaseLabel.process)}</small></div>
                <div><b>3</b><small>${state.lang === "hu" ? "fázis" : "phases"}</small></div>
              </div>
              <div class="phases">
                <span>${tx(phaseLabel.before)}</span><span>${tx(phaseLabel.process)}</span><span>${tx(phaseLabel.after)}</span>
              </div>
              <span class="case-link">${state.lang === "hu" ? "Képes példa megnyitása" : "Open visual example"}</span>
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
          <span><strong>Sopron Property Services</strong><small>${state.lang === "hu" ? "Festés, gipszkarton, kert, kisebb javítások" : "Painting, drywall, garden care, small repairs"}</small></span>
        </a>
        <nav class="nav" aria-label="${state.lang === "hu" ? "Fő navigáció" : "Main navigation"}">
          <a href="#services">${tx(content.nav.services)}</a>
          <a href="#clients">${tx(content.nav.clients)}</a>
          <a href="#projects">${tx(content.nav.projects)}</a>
          <a href="#media">${state.lang === "hu" ? "Képek" : "Images"}</a>
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
            <ul class="hero-proof-grid" aria-label="${state.lang === "hu" ? "Fő bizalmi előnyök" : "Key trust points"}">
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
              <div class="hero-image-shell hero-main-image"><img src="${img(heroImage)}" width="1600" height="1200" fetchpriority="high" alt="${state.lang === "hu" ? "Frissen rendezett soproni lakásbelső tiszta falakkal és parkettával" : "Freshly prepared Sopron apartment interior with clean walls and parquet flooring"}"></div>
              ${paintHintMarkup()}
              <div class="hero-visual-note">
                <strong>WhatsApp</strong>
                <span>${tx({ hu: "Fotók alapján gyorsabb első egyeztetés", en: "Photos make the first check faster", de: "Fotos beschleunigen die erste Abstimmung", uk: "Фото пришвидшують першу оцінку", "zh-CN": "照片让首次沟通更快" })}</span>
              </div>
            </div>
            <figcaption class="note"><span class="note-mark" aria-hidden="true">01</span><span><strong>${tx(content.hero.noteTitle)}</strong><p>${tx(content.hero.noteText)}</p></span></figcaption>
          </figure>
          <div class="stats" data-accordion-group="hero-stats">${statCards()}</div>
        </section>

        <aside class="illustration-note wrap" data-reveal>
          <span aria-hidden="true">i</span>
          <p>${state.lang === "hu" ? "Az oldalon szereplő képek illusztrációk, amelyek tipikus munkafolyamatokat és várható eredményeket mutatnak." : "The images on this website are illustrative examples showing typical work processes and expected results."}</p>
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
          <div class="section-head" data-reveal><span class="section-index">03</span><h2>${tx(content.problemsTitle)}</h2><p>${state.lang === "hu" ? "Nem minden ingatlannak ugyanarra van szüksége. Nyissa meg azt a helyzetet, amelyik legközelebb áll az Önéhez." : "Every property situation is different. Open the scenario that most closely matches yours."}</p></div>
          <div class="situation-grid" data-accordion-group="situations">${problemCards()}</div>
        </section>

        <section id="projects" class="section section-band projects-section">
          <div class="wrap">
            <div class="section-head" data-reveal><span class="section-index">04</span><h2>${tx(content.projectsTitle)}</h2><p>${state.lang === "hu" ? "A példák tipikus kiinduló állapotokat, munkafázisokat és várható eredményeket mutatnak. Nem saját referenciaprojektek; egy konkrét ingatlan feladatát mindig külön egyeztetjük." : "These examples show typical starting conditions, work stages and expected outcomes. They are not presented as completed client projects; every real scope is agreed separately."}</p></div>
            <div class="reference-panel" data-reveal>
              <div>
                <span class="eyebrow">${state.lang === "hu" ? "Távolról is követhető" : "Clear from a distance"}</span>
                <h3>${state.lang === "hu" ? "A lényeges állapotok láthatók maradnak." : "Important stages remain visible."}</h3>
                <p>${state.lang === "hu" ? "A feladatot az ingatlan tényleges állapota alapján rögzítjük, a munkafázisokról pedig kérés szerint fotós visszajelzés készül." : "The scope is based on the property's actual condition, with photo updates available for important work stages."}</p>
              </div>
              <div class="reference-proof-grid">${referenceProofCards()}</div>
            </div>
            <div class="filterbar" data-reveal>${projectFilterButtons()}</div>
            <div class="grid project-grid-rich">${projectCards()}</div>
          </div>
        </section>

        <section id="media" class="section wrap">
          <div class="section-head" data-reveal><span class="section-index">05</span><h2>${state.lang === "hu" ? "Képes munkafolyamatok" : "Visual work processes"}</h2><p>${state.lang === "hu" ? "Nézze meg a szolgáltatástípusonként rendezett képsorozatokat. A részletes galéria egy fókuszált nézetben nyílik meg, az előtte-utána összehasonlítás pedig csak ott marad, ahol a változás azonnal érthető." : "Browse image sequences organised by service type. Each opens a focused gallery view, with before-and-after comparison kept only where the change is immediately clear."}</p></div>
          <div class="video-grid">${mediaReferenceCards()}</div>
        </section>

        <section id="clients" class="section section-band clients-section">
          <div class="wrap audience-layout">
            <div class="section-head" data-reveal><span class="section-index">06</span><h2>${tx(content.audienceTitle)}</h2><p>${state.lang === "hu" ? "A szolgáltatás azoknak készült, akik Sopronban és környékén megbízható egyeztetést, fotós visszajelzést és rendezett munkavégzést várnak el: tulajdonosoknak, kezelőknek, Airbnb-házigazdáknak, irodáknak és kisvállalkozásoknak." : "The service is for clients who need reliable coordination, photo updates and orderly work in Sopron and its surroundings: owners, property managers, Airbnb hosts, offices and small businesses."}</p></div>
            <div class="audience-list" data-accordion-group="audiences">${audienceCards()}</div>
          </div>
        </section>

        <section class="section wrap process-section">
          <div class="process-layout">
            <div>
              <div class="section-head" data-reveal><span class="section-index">07</span><h2>${tx(content.processTitle)}</h2><p>${state.lang === "hu" ? "A cél az, hogy a munka már az első üzenettől átlátható legyen: mit kell javítani, hogyan lehet bejutni, mikor szükséges döntés, és milyen visszajelzés várható." : "The aim is for the work to stay clear from the first message: what needs fixing, how access works, when a decision is needed and what updates to expect."}</p></div>
              <div class="steps">${process.map((p, i) => `<article class="step" data-reveal><span class="num">${String(i + 1).padStart(2, "0")}</span><div><h3>${state.lang === "hu" ? p[0] : p[1]}</h3><p>${state.lang === "hu" ? p[2] : p[3]}</p></div></article>`).join("")}</div>
            </div>
            <aside class="trust-panel" data-reveal>
              <span class="eyebrow">${state.lang === "hu" ? "Bizalom a gyakorlatban" : "Trust in practice"}</span>
              <h2>${tx(content.trustTitle)}</h2>
              <p>${state.lang === "hu" ? "Nem nagy ígéretekre építünk, hanem tisztán rögzített feladatra, használható kommunikációra és követhető visszajelzésre." : "The service is built on a clearly agreed scope, useful communication and trackable updates, not exaggerated promises."}</p>
              <div class="trust-list">
                <div><span aria-hidden="true">✓</span><p><strong>${state.lang === "hu" ? "Tiszta feladatlista" : "Clear task list"}</strong>${state.lang === "hu" ? "Indulás előtt rögzítjük, mi tartozik a munkába, és mi igényel külön egyeztetést." : "Before work starts, we clarify what is included and what needs separate approval."}</p></div>
                <div><span aria-hidden="true">✓</span><p><strong>${state.lang === "hu" ? "HU/EN egyeztetés" : "HU/EN coordination"}</strong>${state.lang === "hu" ? "Tulajdonos, kezelő vagy helyszíni kapcsolattartó is követheti a fontos információkat." : "Owners, managers and local contacts can follow the important information clearly."}</p></div>
                <div><span aria-hidden="true">✓</span><p><strong>${state.lang === "hu" ? "Fotós visszajelzés" : "Photo updates"}</strong>${state.lang === "hu" ? "Kérés szerint a kiinduló állapot és az elkészült eredmény fotóval is ellenőrizhető." : "When requested, the starting condition and finished result can be checked by photo."}</p></div>
                <div><span aria-hidden="true">✓</span><p><strong>${state.lang === "hu" ? "Soproni fókusz" : "Sopron focus"}</strong>${state.lang === "hu" ? "A kommunikáció és az ütemezés a belvárosi lakásokhoz, hétvégi házakhoz, irodákhoz és bérleményekhez igazodik." : "Communication and timing are shaped around Sopron's old town apartments, weekend houses, offices and rentals."}</p></div>
              </div>
            </aside>
          </div>
        </section>

        <section class="section section-band faq-section">
          <div class="wrap faq-layout">
            <div class="section-head" data-reveal><span class="section-index">08</span><h2>${tx(content.faqTitle)}</h2><p>${state.lang === "hu" ? "Gyakorlati válaszok a felmérésről, árazásról, határidőkről és távoli egyeztetésről." : "Practical answers about assessment, pricing, timing and remote coordination."}</p></div>
            <div class="faq-list" data-accordion-group="faq">${faqAccordion()}</div>
          </div>
        </section>

        <section id="contact" class="section wrap">
          <div class="contact" data-reveal>
            <div class="contact-copy"><span class="eyebrow">${state.lang === "hu" ? "Első lépés" : "First step"}</span><h2>${tx(content.contactTitle)}</h2><p>${tx(content.contactText)}</p><div class="contact-points"><span>${state.lang === "hu" ? "2-3 fotó" : "2-3 photos"}</span><span>${state.lang === "hu" ? "Soproni cím vagy környék" : "Sopron address or area"}</span><span>${state.lang === "hu" ? "Hozzáférés" : "Access"}</span><span>${state.lang === "hu" ? "Időzítés" : "Timing"}</span></div></div>
            <div class="contact-card"><div data-whatsapp-quote-form></div><span class="contact-number">${phone}</span><a class="btn primary" href="${wa}" target="_blank" rel="noopener">${ui("Send a WhatsApp message", "WhatsApp üzenet küldése")}</a><a class="btn" href="${tel}" data-phone-action data-phone-label>${phoneActionLabel()}</a><small>${state.lang === "hu" ? "Rövid üzenet is elég: fotók, helyszín, határidő. Elsődleges terület: Sopron és közvetlen környéke." : "A short message is enough: photos, location and timing. Primary service area: Sopron and nearby locations."}</small></div>
          </div>
        </section>
      </main>

      <footer class="footer"><span>Sopron Property Services</span><span>${state.lang === "hu" ? "Ingatlankarbantartás Sopronban, magyar és angol kommunikációval." : "Property maintenance in Sopron, with Hungarian and English communication."}</span><span><a class="text-btn" href="${routeHref("maintenance")}">${state.lang === "hu" ? "Ingatlankarbantartás" : "Property maintenance"}</a> <a class="text-btn" href="${routeHref("foreignOwners")}">${state.lang === "hu" ? "Külföldi tulajdonosok" : "Foreign owner support"}</a> <a class="text-btn" href="${routeHref("airbnb")}">${state.lang === "hu" ? "Airbnb karbantartás" : "Airbnb maintenance"}</a> <a class="text-btn" href="${routeHref("cleaning")}">${state.lang === "hu" ? "Takarítás" : "Cleaning"}</a></span></footer>
      <div class="mobile-cta"><a href="${tel}" data-phone-action>${state.lang === "hu" ? "Hívás" : "Call"}</a><a href="${wa}" target="_blank" rel="noopener" aria-label="WhatsApp">${state.lang === "hu" ? "WhatsApp fotókkal" : "WhatsApp photos"}</a></div>
      <div class="toast" id="phoneToast" role="status" aria-live="polite" aria-atomic="true"></div>
      <div id="projectModal" class="modal" role="dialog" aria-modal="true" aria-hidden="true"><button class="backdrop" data-close aria-label="${state.lang === "hu" ? "Ablak bezárása" : "Close dialog"}"></button><div class="panel" tabindex="-1"><button class="close" type="button" data-close aria-label="${state.lang === "hu" ? "Ablak bezárása" : "Close dialog"}">×</button><div id="projectInner"></div></div></div>
      <div id="galleryModal" class="modal" role="dialog" aria-modal="true" aria-hidden="true"><button class="backdrop" data-close aria-label="${state.lang === "hu" ? "Galéria bezárása" : "Close gallery"}"></button><div class="panel" tabindex="-1"><button class="close" type="button" data-close aria-label="${state.lang === "hu" ? "Galéria bezárása" : "Close gallery"}">×</button><div id="galleryInner"></div></div></div>
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
            <button class="active" data-phase-filter="all">${state.lang === "hu" ? "Összes kép" : "All photos"}</button>
            <button data-phase-filter="before">${tx(phaseLabel.before)} (${counts.before})</button>
            <button data-phase-filter="process">${tx(phaseLabel.process)} (${counts.process})</button>
            <button data-phase-filter="after">${tx(phaseLabel.after)} (${counts.after})</button>
          </div>
          ${projectCarousel(item, index, "modal")}
        </div>
        <div class="details">
          <small class="eyebrow">${tx(item.type)}</small>
          <h2 id="projectModalTitle">${tx(item.title)}</h2>
          <p class="example-badge">${state.lang === "hu" ? "Illusztratív példa, nem saját referenciaprojekt." : "Illustrative example, not a completed client project."}</p>
          <div class="project-meta-line">
            <span>${tx(item.location)}</span>
            <span>${tx(item.timeline)}</span>
            <span>${tx(item.client)}</span>
          </div>
          <p>${tx(item.description)}</p>
          <div class="project-metrics">
            ${item.metrics.map((metric) => `<div><b>${typeof metric.n === "object" ? tx(metric.n) : metric.n}</b><small>${state.lang === "hu" ? metric.hu : metric.en}</small></div>`).join("")}
          </div>
          <div class="story-grid">
            <article class="story-card"><strong>${state.lang === "hu" ? "Kiinduló helyzet" : "Starting point"}</strong><p>${tx(item.problem)}</p></article>
            <article class="story-card"><strong>${state.lang === "hu" ? "Megközelítés" : "Approach"}</strong><p>${tx(item.approach)}</p></article>
            <article class="story-card"><strong>${state.lang === "hu" ? "Végeredmény" : "Final result"}</strong><p>${tx(item.result)}</p></article>
          </div>
          <div class="evidence-list">
            ${tx(item.evidence).map((entry) => `<span class="evidence-chip">${entry}</span>`).join("")}
          </div>
          <h3>${state.lang === "hu" ? "Jellemző munkalépések" : "Typical work items"}</h3>
          <ul>${tx(item.works).map((work) => `<li>${work}</li>`).join("")}</ul>
          <div class="result"><strong>${state.lang === "hu" ? "Várható eredmény" : "Expected result"}</strong><p>${tx(item.result)}</p></div>
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
            <span><b>${compareText("compareBefore")}</b>${photoCaption([item.before, "before", { hu: `${tx(item.title)} - kiinduló állapot`, en: `${tx(item.title)} - starting condition` }])}</span>
            <span><b>${compareText("compareAfter")}</b>${photoCaption([item.after, "after", { hu: `${tx(item.title)} - kész állapot`, en: `${tx(item.title)} - finished condition` }])}</span>
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
          <button class="arrow prev" id="prev" type="button" aria-label="${state.lang === "hu" ? "Előző kép" : "Previous image"}">‹</button>
          <button class="arrow next" id="next" type="button" aria-label="${state.lang === "hu" ? "Következő kép" : "Next image"}">›</button>
          <span class="counter" id="counter" aria-live="polite"></span>
          <div class="gallery-caption" id="galleryCaption"></div>
          <div class="gallery-tools" role="toolbar" aria-label="${state.lang === "hu" ? "Kép nagyítása" : "Image zoom controls"}">
            <button type="button" data-gallery-zoom="out" aria-label="${state.lang === "hu" ? "Kicsinyítés" : "Zoom out"}">−</button>
            <button type="button" class="zoom-level" data-gallery-zoom="reset" aria-label="${state.lang === "hu" ? "Eredeti nagyítás" : "Reset zoom"}">100%</button>
            <button type="button" data-gallery-zoom="in" aria-label="${state.lang === "hu" ? "Nagyítás" : "Zoom in"}">+</button>
          </div>
        </div>
        <aside class="gallery-info">
          <small class="eyebrow">${title}</small>
          <h2 id="galleryModalTitle">${state.lang === "hu" ? "Képes munkafolyamat" : "Visual work process"}</h2>
          <p>${state.lang === "hu" ? "Lapozzon a képek között, húzza oldalra mobilon, vagy nagyítsa ki a részleteket. A képek illusztratív példák; a konkrét feladatot mindig a helyszín saját fotói alapján egyeztetjük." : "Browse with the arrows, swipe on mobile or zoom in to inspect details. Images are illustrative examples; the actual scope is always agreed from photos of the specific property."}</p>
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
