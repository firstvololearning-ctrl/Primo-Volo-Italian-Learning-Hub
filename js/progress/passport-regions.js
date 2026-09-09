"use strict";

/*
  Primo Volo d'Italiano
  Passport Region Catalog

  This file contains CULTURAL / REGIONAL DATA only.

  It does NOT decide:
  - how a learner earns a stamp
  - which activities count as practice
  - whether a learner has completed something

  Those rules belong in passport.js.

  A region may contain multiple landmarks or foods later.
  The first item in each list is the primary passport image.
*/

window.PASSPORT_REGIONS = [
  {
    id: "valle-daosta",
    region: "Valle d'Aosta",
    english: "Aosta Valley",
    capital: "Aosta",

    landmarks: [
      {
        name: "Monte Cervino",
        image:
          "images/passport/landmarks/landmark-16.png",
        primary: true
      },
      {
        name: "Gran Paradiso",
        image:
          "images/passport/landmarks/landmark-32.png"
      }
    ],

    foods: [
      {
        name: "Fonduta valdostana",
        image:
          "images/passport/foods/regionalfood-19.png",
        primary: true
      }
    ]
  },

  {
    id: "piemonte",
    region: "Piemonte",
    english: "Piedmont",
    capital: "Torino",

    landmarks: [
      {
        name: "Basilica di Superga",
        image:
          "images/passport/landmarks/landmark-20.png",
        primary: true
      }
    ],

    foods: [
      {
        name: "Bagna càuda",
        image:
          "images/passport/foods/regionalfood-07.png",
        primary: true
      }
    ]
  },

  {
    id: "liguria",
    region: "Liguria",
    english: "Liguria",
    capital: "Genova",

    landmarks: [
      {
        name: "Cinque Terre",
        image:
          "images/passport/landmarks/landmark-23.png",
        primary: true
      }
    ],

    foods: [
      {
        name: "Trofie al pesto genovese",
        image:
          "images/passport/foods/regionalfood-23.png",
        primary: true
      }
    ]
  },

  {
    id: "lombardia",
    region: "Lombardia",
    english: "Lombardy",
    capital: "Milano",

    landmarks: [
      {
        name: "Duomo di Milano",
        image:
          "images/passport/landmarks/landmark-24.png",
        primary: true
      }
    ],

    foods: [
      {
        name: "Risotto alla milanese",
        image:
          "images/passport/foods/regionalfood-06.png",
        primary: true
      }
    ]
  },

  {
    id: "trentino-alto-adige",
    region: "Trentino-Alto Adige",
    english: "Trentino-Alto Adige",
    capital: "Trento",

    landmarks: [
      {
        name: "Tre Cime di Lavaredo",
        image:
          "images/passport/landmarks/landmark-14.png",
        primary: true
      }
    ],

    foods: [
      {
        name: "Canederli allo speck",
        image:
          "images/passport/foods/regionalfood-21.png",
        primary: true
      }
    ]
  },

  {
    id: "veneto",
    region: "Veneto",
    english: "Veneto",
    capital: "Venezia",

    landmarks: [
      {
        name: "Basilica di San Marco",
        image:
          "images/passport/landmarks/landmark-17.png",
        primary: true
      },
      {
        name: "Ponte di Rialto",
        image:
          "images/passport/landmarks/landmark-18.png"
      },
      {
        name: "Delta del Po",
        image:
          "images/passport/landmarks/landmark-34.png"
      }
    ],

    foods: [
      {
        name: "Baccalà mantecato con polenta",
        image:
          "images/passport/foods/regionalfood-20.png",
        primary: true
      }
    ]
  },

  {
    id: "friuli-venezia-giulia",
    region: "Friuli-Venezia Giulia",
    english: "Friuli-Venezia Giulia",
    capital: "Trieste",

    landmarks: [
      {
        name: "Castello di Miramare",
        image:
          "images/passport/landmarks/landmark-26.png",
        primary: true
      }
    ],

    foods: [
      {
        name: "Polenta friulana con funghi",
        image:
          "images/passport/foods/regionalfood-05.png",
        primary: true
      }
    ]
  },

  {
    id: "emilia-romagna",
    region: "Emilia-Romagna",
    english: "Emilia-Romagna",
    capital: "Bologna",

    landmarks: [
      {
        name: "Due Torri",
        image:
          "images/passport/landmarks/landmark-11.png",
        primary: true
      },
      {
        name: "Delta del Po",
        image:
          "images/passport/landmarks/landmark-34.png"
      }
    ],

    foods: [
      {
        name: "Tagliatelle al ragù",
        image:
          "images/passport/foods/regionalfood-14.png",
        primary: true
      }
    ]
  },

  {
    id: "toscana",
    region: "Toscana",
    english: "Tuscany",
    capital: "Firenze",

    landmarks: [
      {
        name: "Duomo di Firenze",
        image:
          "images/passport/landmarks/landmark-04.png",
        primary: true
      },
      {
        name: "Torre di Pisa",
        image:
          "images/passport/landmarks/landmark-03.png"
      },
      {
        name: "Val d’Orcia",
        image:
          "images/passport/landmarks/landmark-31.png"
      }
    ],

    foods: [
      {
        name: "Bistecca alla fiorentina",
        image:
          "images/passport/foods/regionalfood-10.png",
        primary: true
      }
    ]
  },

  {
    id: "umbria",
    region: "Umbria",
    english: "Umbria",
    capital: "Perugia",

    landmarks: [
      {
        name: "Basilica di San Francesco",
        image:
          "images/passport/landmarks/landmark-15.png",
        primary: true
      }
    ],

    foods: [
      {
        name: "Strangozzi al tartufo nero",
        image:
          "images/passport/foods/regionalfood-17.png",
        primary: true
      }
    ]
  },

  {
    id: "marche",
    region: "Marche",
    english: "Marche",
    capital: "Ancona",

    landmarks: [
      {
        name: "Palazzo Ducale di Urbino",
        image:
          "images/passport/landmarks/landmark-10.png",
        primary: true
      }
    ],

    foods: [
      {
        name: "Olive all’ascolana",
        image:
          "images/passport/foods/regionalfood-11.png",
        primary: true
      }
    ]
  },

  {
    id: "lazio",
    region: "Lazio",
    english: "Lazio",
    capital: "Roma",

    landmarks: [
      {
        name: "Colosseo",
        image:
          "images/passport/landmarks/landmark-01.png",
        primary: true
      },
      {
        name: "Fontana di Trevi",
        image:
          "images/passport/landmarks/landmark-35.png"
      },
      {
        name: "Pantheon",
        image:
          "images/passport/landmarks/landmark-36.png"
      }
    ],

    foods: [
      {
        name: "Pasta alla carbonara",
        image:
          "images/passport/foods/regionalfood-24.png",
        primary: true
      }
    ]
  },

  {
    id: "abruzzo",
    region: "Abruzzo",
    english: "Abruzzo",
    capital: "L'Aquila",

    landmarks: [
      {
        name: "Gran Sasso",
        image:
          "images/passport/landmarks/landmark-05.png",
        primary: true
      }
    ],

    foods: [
      {
        name: "Arrosticini",
        image:
          "images/passport/foods/regionalfood-01.png",
        primary: true
      }
    ]
  },

  {
    id: "molise",
    region: "Molise",
    english: "Molise",
    capital: "Campobasso",

    landmarks: [
      {
        name: "Castello Monforte",
        image:
          "images/passport/landmarks/landmark-27.png",
        primary: true
      }
    ],

    foods: [
      {
        name: "Pampanella",
        image:
          "images/passport/foods/regionalfood-16.png",
        primary: true
      }
    ]
  },

  {
    id: "campania",
    region: "Campania",
    english: "Campania",
    capital: "Napoli",

    landmarks: [
      {
        name: "Pompeii",
        image:
          "images/passport/landmarks/landmark-02.png",
        primary: true
      },
      {
        name: "Vesuvio",
        image:
          "images/passport/landmarks/landmark-19.png"
      },
      {
        name: "Costiera Amalfitana",
        image:
          "images/passport/landmarks/landmark-28.png"
      }
    ],

    foods: [
      {
        name: "Pizza napoletana",
        image:
          "images/passport/foods/regionalfood-03.png",
        primary: true
      }
    ]
  },

  {
    id: "puglia",
    region: "Puglia",
    english: "Apulia",
    capital: "Bari",

    landmarks: [
      {
        name: "Trulli di Alberobello",
        image:
          "images/passport/landmarks/landmark-08.png",
        primary: true
      }
    ],

    foods: [
      {
        name: "Orecchiette con le cime di rapa",
        image:
          "images/passport/foods/regionalfood-22.png",
        primary: true
      }
    ]
  },

  {
    id: "basilicata",
    region: "Basilicata",
    english: "Basilicata",
    capital: "Potenza",

    landmarks: [
      {
        name: "Sassi di Matera",
        image:
          "images/passport/landmarks/landmark-12.png",
        primary: true
      }
    ],

    foods: [
      {
        name: "Strascinati con peperoni cruschi",
        image:
          "images/passport/foods/regionalfood-15.png",
        primary: true
      }
    ]
  },

  {
    id: "calabria",
    region: "Calabria",
    english: "Calabria",
    capital: "Catanzaro",

    landmarks: [
      {
        name: "Tropea",
        image:
          "images/passport/landmarks/landmark-25.png",
        primary: true
      }
    ],

    foods: [
      {
        name: "Fileja alla ’nduja",
        image:
          "images/passport/foods/regionalfood-13.png",
        primary: true
      }
    ]
  },

  {
    id: "sicilia",
    region: "Sicilia",
    english: "Sicily",
    capital: "Palermo",

    landmarks: [
      {
        name: "Etna",
        image:
          "images/passport/landmarks/landmark-06.png",
        primary: true
      },
      {
        name: "Valle dei Templi",
        image:
          "images/passport/landmarks/landmark-13.png"
      },
      {
        name: "Scala dei Turchi",
        image:
          "images/passport/landmarks/landmark-30.png"
      },
      {
        name: "Stromboli",
        image:
          "images/passport/landmarks/landmark-33.png"
      }
    ],

    foods: [
      {
        name: "Arancini",
        image:
          "images/passport/foods/regionalfood-09.png",
        primary: true
      }
    ]
  },

  {
    id: "sardegna",
    region: "Sardegna",
    english: "Sardinia",
    capital: "Cagliari",

    landmarks: [
      {
        name: "Su Nuraxi",
        image:
          "images/passport/landmarks/landmark-07.png",
        primary: true
      },
      {
        name: "Cala Goloritzé",
        image:
          "images/passport/landmarks/landmark-29.png"
      }
    ],

    foods: [
      {
        name: "Culurgiones",
        image:
          "images/passport/foods/regionalfood-12.png",
        primary: true
      }
    ]
  }
];


/* ========================================
   REGION HELPERS
   ======================================== */

window.getPassportRegionById =
  function getPassportRegionById(id) {
    return window.PASSPORT_REGIONS.find(
      region => region.id === id
    );
  };


window.getPassportRegionByName =
  function getPassportRegionByName(name) {
    return window.PASSPORT_REGIONS.find(
      region => region.region === name
    );
  };


window.getPrimaryPassportLandmark =
  function getPrimaryPassportLandmark(region) {
    if (!region) {
      return null;
    }

    return (
      region.landmarks.find(
        landmark => landmark.primary
      ) ||
      region.landmarks[0] ||
      null
    );
  };


window.getPrimaryPassportFood =
  function getPrimaryPassportFood(region) {
    if (!region) {
      return null;
    }

    return (
      region.foods.find(
        food => food.primary
      ) ||
      region.foods[0] ||
      null
    );
  };
