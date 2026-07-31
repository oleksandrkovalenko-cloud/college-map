/* ==========================================================================
   COLLEGE_DATA — single source of truth for the campus scheme.
   Editing room numbers, routes, or distances only requires changes here;
   index.html and script.js contain no repeated content, only rendering logic.
   ========================================================================== */

const COLLEGE_DATA = {

  institution: {
    name: "Фаховий коледж ракетно-космічного машинобудування ДНУ ім. О. Гончара",
    fullName: "Відокремлений структурний підрозділ «Фаховий коледж ракетно-космічного машинобудування Дніпровського національного університету імені Олеся Гончара»",
    address: "вул. О. М. Макарова, 27, м. Дніпро, 49089",
    photos: []
  },

  /* Map polygon geometry lives here too, so index.html has no inline coordinates.
     photos: [] shows a placeholder; add relative paths (e.g. "photos/admin-1.jpg")
     to display an image, or 2+ paths for an auto-generated carousel with
     arrows and dots. See photos/README.txt for file-naming conventions.
     Room entries: { num, desc } renders as a normal two-column row;
     { num, merged: true } renders as one full-width row (used for named
     spaces with no separate number, e.g. "Актова зала"). Numbered rooms
     are sorted ascending and merged rows are pushed to the end of each
     floor automatically at render time — no manual ordering needed here. */
  buildings: [
    {
      id: "admin",
      number: 1,
      name: "Адміністративний (головний) корпус",
      address: "вул. Макарова, 27",
      color: "#2C5F8A",
      photoSide: "left",
      photos: [],
      polygon: "170,428 271,428 271,772 169,772 169,724 202,724 202,480 170,480",
      labelX: 220, labelY: 600,
      floors: [
        {
          name: "Укриття",
          groups: [
            { label: "Права сторона", rooms: [
              { num: "№52", desc: "Навчальна аудиторія" }, { num: "№53", desc: "Навчальна аудиторія" },
              { num: "№54", desc: "Навчальна аудиторія" }, { num: "№54а", desc: "Навчальна аудиторія" }
            ]},
            { label: "Ліва сторона", rooms: [
              { num: "№55", desc: "Навчальна аудиторія" }, { num: "№55а", desc: "Навчальна аудиторія" }, { num: "№56", desc: "Навчальна аудиторія" }
            ]}
          ]
        },
        { name: "1 поверх", rooms: [
          { num: "№4", desc: "Навчальна аудиторія" },
          { num: "№5", desc: "Кабінет завідувачки відділення комп'ютерних технологій та систем" },
          { num: "№6", desc: "Кабінет заступника директора з виховної роботи" },
          { num: "№7", desc: "викладацька ЦК філологічних дисциплін та українознавства" },
          { num: "№8", desc: "відділ кадрів" },
          { num: "№9", desc: "Навчальна аудиторія" },
          { num: "№11", desc: "викладацька ЦК фізичного виховання та захисту України" },
          { num: "№12", desc: "Навчальна аудиторія" },
          { num: "№13", desc: "Кабінет завідувача виробничими практиками" },
          { num: "№14", desc: "приймальна комісія" },
          { num: "Спортивна зала", merged: true },
          { num: "Актова зала", merged: true },
          { num: "Рада студентського самоврядування", merged: true }
        ]},
        { name: "2 поверх", rooms: [
          { num: "Читальна зала", desc: "бібліотека" },
          { num: "Приймальна директора", desc: "кабінети директора коледжу та заступника директора з навчальної роботи" },
          { num: "№20", desc: "Навчальна аудиторія" },
          { num: "№22", desc: "Навчальна аудиторія" },
          { num: "№23", desc: "викладацька ЦК бухгалтерського обліку та суспільних дисциплін" },
          { num: "№24", desc: "Навчальна аудиторія" },
          { num: "Методичний кабінет", merged: true },
          { num: "Навчальна частина", merged: true },
          { num: "Бухгалтерія", merged: true },
          { num: "Архів", merged: true }
        ]},
        { name: "3 поверх", rooms: [
          { num: "№28", desc: "Навчальна аудиторія" },
          { num: "№29", desc: "Препараторська ЦК Бухгалтерського обліку та суспільних дисциплін" },
          { num: "№30", desc: "Навчальна аудиторія" }, { num: "№31", desc: "Навчальна аудиторія" },
          { num: "№32", desc: "Навчальна аудиторія" }, { num: "№33", desc: "Навчальна аудиторія" },
          { num: "№34", desc: "Навчальна аудиторія" }, { num: "№35", desc: "Навчальна аудиторія" },
          { num: "№36", desc: "Навчальна аудиторія" }, { num: "№37", desc: "Навчальна аудиторія" },
          { num: "№38", desc: "викладацька ЦК математики та інформатики" },
          { num: "№39", desc: "Навчальна аудиторія" }
        ]},
        { name: "4 поверх", rooms: [
          { num: "№40", desc: "Навчальна аудиторія" },
          { num: "№41", desc: "Кабінет завідувача відділення комп'ютерної інженерії" },
          { num: "№42", desc: "Навчальна аудиторія" }, { num: "№43", desc: "Навчальна аудиторія" },
          { num: "№43а", desc: "Навчальна аудиторія" }, { num: "№44", desc: "Навчальна аудиторія" },
          { num: "№45", desc: "Навчальна аудиторія" },
          { num: "№46", desc: "викладацька ЦК природничо-наукових дисциплін" },
          { num: "№47", desc: "Навчальна аудиторія" }, { num: "№48", desc: "Навчальна аудиторія" },
          { num: "№49", desc: "Навчальна аудиторія" }, { num: "№50", desc: "Навчальна аудиторія" },
          { num: "№51", desc: "Навчальна аудиторія" }
        ]}
      ]
    },
    {
      id: "lab",
      number: 2,
      name: "Лабораторний корпус",
      address: "вул. Макарова, 27",
      color: "#1E7F72",
      photoSide: "left",
      photos: [],
      polygon: "316,190 494,190 494,254 528,254 528,354 472,354 472,254 316,254",
      labelX: 405, labelY: 222,
      floors: [
        { name: "1 поверх", rooms: [
          { num: "№101", desc: "Навчальна аудиторія" },
          { num: "№102", desc: "викладацька ЦК авіаційної та ракетно-космічної техніки" },
          { num: "№104", desc: "Навчальна аудиторія" }, { num: "№105", desc: "Навчальна аудиторія" },
          { num: "№107", desc: "Навчальна аудиторія" }, { num: "№108", desc: "Навчальна аудиторія" },
          { num: "№109", desc: "Кабінет завідувача механічного відділення" }
        ]},
        { name: "2 поверх", rooms: [
          { num: "№201", desc: "Навчальна аудиторія" }, { num: "№201а", desc: "Навчальна аудиторія" },
          { num: "№202", desc: "лаборантська" }, { num: "№202а", desc: "лаборантська" },
          { num: "№203", desc: "Навчальна аудиторія" }, { num: "№204", desc: "Навчальна аудиторія" },
          { num: "№205", desc: "викладацька ЦК комп'ютерної інженерії" },
          { num: "№206", desc: "Навчальна аудиторія" }, { num: "№207", desc: "Навчальна аудиторія" },
          { num: "№208", desc: "Навчальна аудиторія" }
        ]},
        { name: "3 поверх", rooms: [
          { num: "№301", desc: "Навчальна аудиторія" }, { num: "№302", desc: "Навчальна аудиторія" },
          { num: "№303", desc: "Кабінет завідувачки відділення програмної інженерії" },
          { num: "№304", desc: "Навчальна аудиторія" }, { num: "№305", desc: "Навчальна аудиторія" },
          { num: "№306", desc: "Навчальна аудиторія" }, { num: "№307", desc: "Навчальна аудиторія" },
          { num: "№308", desc: "викладацька ЦК програмної інженерії" },
          { num: "№308а", desc: "Препараторська циклової комісії Програмної інженерії" },
          { num: "№309", desc: "Навчальна аудиторія" }
        ]},
        { name: "4 поверх", rooms: [
          { num: "№401", desc: "Навчальна аудиторія" },
          { num: "№402", desc: "викладацька ЦК електротехніки та електротехнологій" },
          { num: "№403", desc: "Навчальна аудиторія" }, { num: "№404", desc: "Навчальна аудиторія" },
          { num: "№406", desc: "Навчальна аудиторія" }, { num: "№407", desc: "Навчальна аудиторія" },
          { num: "№409", desc: "Навчальна аудиторія" }
        ]}
      ]
    },
    {
      id: "tech",
      number: 3,
      name: "Технологічний корпус",
      address: "вул. Макарова, 27",
      color: "#B85C2C",
      photoSide: "left",
      photos: [],
      polygon: "465,471 524,471 524,720 465,720",
      labelX: 494, labelY: 595,
      floors: [
        { name: "1 поверх", rooms: [ { num: "№61", desc: "—" }, { num: "№62", desc: "—" } ]},
        { name: "2 поверх", rooms: [
          { num: "№64", desc: "Навчальна аудиторія" }, { num: "№65", desc: "Навчальна аудиторія" },
          { num: "№66", desc: "Навчальна аудиторія" }, { num: "№68", desc: "Навчальна аудиторія" },
          { num: "№70", desc: "викладацька ЦК Галузевого машинобудування та прикладної механіки" },
          { num: "№71", desc: "Навчальна аудиторія" }
        ]}
      ]
    },
    {
      id: "dorm",
      number: 4,
      name: "Гуртожиток",
      address: "вул. Макарова, 27/1",
      color: "#6B4C82",
      photoSide: "left",
      photos: [],
      polygon: "164,235 317,235 317,304 164,304",
      labelX: 240, labelY: 269,
      floors: [
        { name: "1 поверх", rooms: [
          { num: "Кабінет коменданта", merged: true },
          { num: "Кабінет інспектора з обліку та бронювання військовозобов'язаних", merged: true }
        ]}
      ]
    }
  ],

  /* EasyWay (eway.in.ua) route links. Route IDs on EasyWay are internal
     numeric identifiers unrelated to the public route number, so only
     routes independently confirmed via search get a direct deep link;
     everything else falls back to the general Dnipro routes listing. */
  easyWay: {
    baseUrl: "https://www.eway.in.ua/ua/cities/dnipro",
    routesListUrl: "https://www.eway.in.ua/ua/cities/dnipro/routes",
    confirmedIds: {
      "tram:11": 128,
      "trolley:А": 409,
      "trolley:Б": 410,
      "trolley:19": 152,
      "bus:34": 399,
      "bus:87А": 542,
      "bus:87Б": 424,
      "bus:106": 233,
      "bus:113": 239,
      "bus:134": 250,
      "bus:146А": 416,
      "bus:146Б": 417,
      "bus:155": 533,
      "bus:156": 427
    }
  },

  directions: {
    destinationAddress: "Дніпро, вул. Макарова, 27",
    lat: 48.428905,
    lng: 34.998156,
    // Full Google Maps profile (reviews, photos, etc.) — session-specific
    // tracking parameters stripped, keeping only what identifies the place.
    placeUrl: "https://www.google.com/maps/place/%D0%A4%D0%B0%D1%85%D0%BE%D0%B2%D0%B8%D0%B9+%D0%BA%D0%BE%D0%BB%D0%B5%D0%B4%D0%B6+%D1%80%D0%B0%D0%BA%D0%B5%D1%82%D0%BD%D0%BE-%D0%BA%D0%BE%D1%81%D0%BC%D1%96%D1%87%D0%BD%D0%BE%D0%B3%D0%BE+%D0%BC%D0%B0%D1%88%D0%B8%D0%BD%D0%BE%D0%B1%D1%83%D0%B4%D1%83%D0%B2%D0%B0%D0%BD%D0%BD%D1%8F/@48.428905,34.998156,17z/data=!4m6!3m5!1s0x40dbe35fc43520d3:0x5bf0be99d1a1e4e4!8m2!3d48.428905!4d34.998156!16s%2Fg%2F11_tmbvn1"
  },

  transportStops: [
    {
      street: "вул. Незалежності",
      direction: "на північ",
      distance: 460,
      modes: [
        { mode: "tram", label: "Трамвай", routes: ["11"] },
        { mode: "trolley", label: "Тролейбус", routes: ["А", "Б", "19"] },
        { mode: "bus", label: "Автобус", routes: ["87А", "87Б", "106", "113", "134", "146А", "146Б", "155", "156"] }
      ]
    },
    {
      street: "вул. Будівельників",
      direction: "на південь",
      distance: 310,
      modes: [
        { mode: "tram", label: "Трамвай", routes: ["11"] },
        { mode: "bus", label: "Автобус", routes: ["34", "113"] }
      ]
    }
  ],

  poi: [
    { name: "ТЦ «Південний»", category: "ТРЦ", address: "вул. Незалежності, 31", distance: 392, lat: 48.4321808, lng: 35.0001303 },
    { name: "АТБ", category: "супермаркет", address: "вул. Незалежності, 29Б", distance: 441, lat: 48.4314525, lng: 35.0027403 },
    { name: "ТРЦ «Apollo» + Сільпо", category: "ТРЦ / супермаркет", address: "вул. Незалежності, 36", distance: 530, lat: 48.4327957, lng: 35.0023239 },
    { name: "Продукти «Максвелл»", category: "продуктовий магазин", address: "вул. Макарова, 29", distance: 346, lat: 48.426010, lng: 34.996431 }
  ],

  mapStreets: {
    makarova: "вулиця Макарова",
    promyslova: "Промислова вулиця",
    fabrychnoZavodska: "Фабрично-Заводська вулиця",
    nezalezhnosti: "вул. Незалежності",
    budivelnykiv: "вул. Будівельників"
  }
};
