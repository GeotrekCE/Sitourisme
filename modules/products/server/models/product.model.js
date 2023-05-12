'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
/**
 * Default Product Schema
 */
const _defaultProductSchema = {
  specialId: {
    type: String,
    trim: true
  },
  supplierId: {
    type: String,
    trim: true
  },
  supplierName: {
    type: String,
    trim: true
  },
  state: {
    type: String
  },
  specialIdSitra: {
    type: String
  },
  oldSpecialIdSitra: {
    type: String,
    trim: true
  },
  importType: {
    type: String,
    required: 'Please fill product import type for Product',
    trim: true
  },
  importSubType: {
    type: String,
    trim: true
  },
  typeCode: {
    type: String,
    trim: true
  },
  type: {
    type: String,
    required: 'Please fill product type',
    trim: true
  },
  subType: {
    type: Number
  },
  linkedObject: {
    isFather: { type: Boolean },
    specialIdFather: { type: String, trim: true },
    idFatherSitra: { type: String, trim: true },
    idFatherType: { type: String, trim: true },
    idFatherName: { type: String, trim: true }
  },

  name: {
    type: String,
    trim: true
  },
  nameEn: {
    type: String,
    trim: true
  },
  nameEs: {
    type: String,
    trim: true
  },
  nameIt: {
    type: String,
    trim: true
  },
  nameDe: {
    type: String,
    trim: true
  },
  nameNl: {
    type: String,
    trim: true
  },
  shortDescription: {
    type: String,
    trim: true
  },
  shortDescriptionEn: {
    type: String,
    trim: true
  },
  shortDescriptionEs: {
    type: String,
    trim: true
  },
  shortDescriptionIt: {
    type: String,
    trim: true
  },
  shortDescriptionDe: {
    type: String,
    trim: true
  },
  shortDescriptionNl: {
    type: String,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  descriptionEn: {
    type: String,
    trim: true
  },
  descriptionEs: {
    type: String,
    trim: true
  },
  descriptionIt: {
    type: String,
    trim: true
  },
  descriptionDe: {
    type: String,
    trim: true
  },
  descriptionNl: {
    type: String,
    trim: true
  },
  aspectGroupe: {
    type: String,
    trim: true
  },
  aspectGroupeEn: {
    type: String,
    trim: true
  },
  aspectGroupeEs: {
    type: String,
    trim: true
  },
  aspectGroupeIt: {
    type: String,
    trim: true
  },
  aspectGroupeDe: {
    type: String,
    trim: true
  },
  aspectGroupeNl: {
    type: String,
    trim: true
  },
  aspectBusiness: {
    type: String,
    trim: true
  },
  aspectBusinessEn: {
    type: String,
    trim: true
  },
  aspectBusinessEs: {
    type: String,
    trim: true
  },
  aspectBusinessIt: {
    type: String,
    trim: true
  },
  aspectBusinessDe: {
    type: String,
    trim: true
  },
  aspectBusinessNl: {
    type: String,
    trim: true
  },
  address: {
    address1: {
      type: String,
      trim: true
    },
    address2: {
      type: String,
      trim: true
    },
    address3: {
      type: String,
      trim: true
    },
    address4: {
      type: String,
      trim: true
    },
    cedex: {
      type: String,
      trim: true
    },
    zipcode: {
      type: String,
      trim: true
    },
    insee: {
      type: String,
      trim: true
    },
    city: {
      type: Number
    },
    region: {
      type: String,
      trim: true
    },
    bureauDistributeur: {
      type: String,
      trim: true
    },
    complementNumero: {
      type: String,
      trim: true
    }
  },
  website: [
    {
      type: String,
      trim: true
    }
  ],
  websiteEn: [
    {
      type: String,
      trim: true
    }
  ],
  websiteEs: [
    {
      type: String,
      trim: true
    }
  ],
  websiteIt: [
    {
      type: String,
      trim: true
    }
  ],
  websiteDe: [
    {
      type: String,
      trim: true
    }
  ],
  websiteNl: [
    {
      type: String,
      trim: true
    }
  ],
  email: [
    {
      type: String,
      trim: true
    }
  ],
  phone: [
    {
      type: String,
      trim: true
    }
  ],
  fax: [
    {
      type: String,
      trim: true
    }
  ],
  reservation: [
    {
      name: {
        type: String,
        trim: true
      },
      description: {
        type: String,
        trim: true
      },
      descriptionEn: {
        type: String,
        trim: true
      },
      descriptionEs: {
        type: String,
        trim: true
      },
      descriptionIt: {
        type: String,
        trim: true
      },
      descriptionDe: {
        type: String,
        trim: true
      },
      descriptionNl: {
        type: String,
        trim: true
      },
      type: {
        type: Number
      },
      email: [
        {
          type: String,
          trim: true
        }
      ],
      phone: [
        {
          type: String,
          trim: true
        }
      ],
      fax: [
        {
          type: String,
          trim: true
        }
      ],
      website: [
        {
          type: String,
          trim: true
        }
      ]
    }
  ],
  contact: [
    {
      civility: {
        type: Number
      },
      firstname: {
        type: String,
        trim: true
      },
      lastname: {
        type: String,
        trim: true
      },
      primaryFunction: {
        type: Number
      },
      email: [
        {
          type: String,
          trim: true
        }
      ],
      phone: [
        {
          type: String,
          trim: true
        }
      ],
      fax: [
        {
          type: String,
          trim: true
        }
      ],
      website: [
        {
          type: String,
          trim: true
        }
      ]
    }
  ],
  image: [
    {
      url: {
        type: String,
        required: 'Please fill image url',
        trim: true
      },
      type: {
        type: String
      },
      name: {
        type: String,
        trim: true
      },
      nameEn: {
        type: String,
        trim: true
      },
      nameEs: {
        type: String,
        trim: true
      },
      nameIt: {
        type: String,
        trim: true
      },
      nameDe: {
        type: String,
        trim: true
      },
      nameNl: {
        type: String,
        trim: true
      },
      legend: {
        type: String,
        trim: true
      },
      legendEn: {
        type: String,
        trim: true
      },
      legendEs: {
        type: String,
        trim: true
      },
      legendIt: {
        type: String,
        trim: true
      },
      legendDe: {
        type: String,
        trim: true
      },
      legendNl: {
        type: String,
        trim: true
      },
      description: {
        type: String,
        trim: true
      },
      descriptionEn: {
        type: String,
        trim: true
      },
      descriptionEs: {
        type: String,
        trim: true
      },
      descriptionIt: {
        type: String,
        trim: true
      },
      descriptionDe: {
        type: String,
        trim: true
      },
      descriptionNl: {
        type: String,
        trim: true
      },
      dateLimiteDePublication: {
        type: Date
      }
    }
  ],
  video: [
    {
      url: {
        type: String,
        required: 'Please fill video url',
        trim: true
      },
      type: {
        type: String
      },
      name: {
        type: String,
        trim: true
      },
      nameEn: {
        type: String,
        trim: true
      },
      nameEs: {
        type: String,
        trim: true
      },
      nameIt: {
        type: String,
        trim: true
      },
      nameDe: {
        type: String,
        trim: true
      },
      nameNl: {
        type: String,
        trim: true
      },
      legend: {
        type: String,
        trim: true
      },
      legendEn: {
        type: String,
        trim: true
      },
      legendEs: {
        type: String,
        trim: true
      },
      legendIt: {
        type: String,
        trim: true
      },
      legendDe: {
        type: String,
        trim: true
      },
      legendNl: {
        type: String,
        trim: true
      },
      description: {
        type: String,
        trim: true
      },
      descriptionEn: {
        type: String,
        trim: true
      },
      descriptionEs: {
        type: String,
        trim: true
      },
      descriptionIt: {
        type: String,
        trim: true
      },
      descriptionDe: {
        type: String,
        trim: true
      },
      descriptionNl: {
        type: String,
        trim: true
      }
    }
  ],
  videoEn: [
    {
      url: {
        type: String,
        required: 'Please fill video url',
        trim: true
      },
      type: {
        type: String
      },
      name: {
        type: String,
        trim: true
      },
      legend: {
        type: String,
        trim: true
      },
      description: {
        type: String,
        trim: true
      }
    }
  ],
  videoEs: [
    {
      url: {
        type: String,
        required: 'Please fill video url',
        trim: true
      },
      type: {
        type: String
      },
      name: {
        type: String,
        trim: true
      },
      legend: {
        type: String,
        trim: true
      },
      description: {
        type: String,
        trim: true
      }
    }
  ],
  videoIt: [
    {
      url: {
        type: String,
        required: 'Please fill video url',
        trim: true
      },
      type: {
        type: String
      },
      name: {
        type: String,
        trim: true
      },
      legend: {
        type: String,
        trim: true
      },
      description: {
        type: String,
        trim: true
      }
    }
  ],
  videoDe: [
    {
      url: {
        type: String,
        required: 'Please fill video url',
        trim: true
      },
      type: {
        type: String
      },
      name: {
        type: String,
        trim: true
      },
      legend: {
        type: String,
        trim: true
      },
      description: {
        type: String,
        trim: true
      }
    }
  ],
  videoNl: [
    {
      url: {
        type: String,
        required: 'Please fill video url',
        trim: true
      },
      type: {
        type: String
      },
      name: {
        type: String,
        trim: true
      },
      legend: {
        type: String,
        trim: true
      },
      description: {
        type: String,
        trim: true
      }
    }
  ],
  pdf: [
    {
      url: {
        type: String,
        required: 'Please fill pdf url',
        trim: true
      },
      name: {
        type: String,
        trim: true
      },
      nameEn: {
        type: String,
        trim: true
      },
      nameEs: {
        type: String,
        trim: true
      },
      nameIt: {
        type: String,
        trim: true
      },
      nameDe: {
        type: String,
        trim: true
      },
      nameNl: {
        type: String,
        trim: true
      },
      legend: {
        type: String,
        trim: true
      },
      legendEn: {
        type: String,
        trim: true
      },
      legendEs: {
        type: String,
        trim: true
      },
      legendIt: {
        type: String,
        trim: true
      },
      legendDe: {
        type: String,
        trim: true
      },
      legendNl: {
        type: String,
        trim: true
      },
      description: {
        type: String,
        trim: true
      },
      descriptionEn: {
        type: String,
        trim: true
      },
      descriptionEs: {
        type: String,
        trim: true
      },
      descriptionIt: {
        type: String,
        trim: true
      },
      descriptionDe: {
        type: String,
        trim: true
      },
      descriptionNl: {
        type: String,
        trim: true
      }
    }
  ],
  pdfEn: [
    {
      url: {
        type: String,
        required: 'Please fill pdf url',
        trim: true
      },
      name: {
        type: String,
        trim: true
      }
    }
  ],
  pdfEs: [
    {
      url: {
        type: String,
        required: 'Please fill pdf url',
        trim: true
      },
      name: {
        type: String,
        trim: true
      }
    }
  ],
  pdfIt: [
    {
      url: {
        type: String,
        required: 'Please fill pdf url',
        trim: true
      },
      name: {
        type: String,
        trim: true
      }
    }
  ],
  pdfDe: [
    {
      url: {
        type: String,
        required: 'Please fill pdf url',
        trim: true
      },
      name: {
        type: String,
        trim: true
      }
    }
  ],
  pdfNl: [
    {
      url: {
        type: String,
        required: 'Please fill pdf url',
        trim: true
      },
      name: {
        type: String,
        trim: true
      }
    }
  ],
  gpx: [
    {
      type: String,
      trim: true
    }
  ],
  gpxEn: [
    {
      type: String,
      trim: true
    }
  ],
  gpxEs: [
    {
      type: String,
      trim: true
    }
  ],
  gpxIt: [
    {
      type: String,
      trim: true
    }
  ],
  gpxDe: [
    {
      type: String,
      trim: true
    }
  ],
  gpxNl: [
    {
      type: String,
      trim: true
    }
  ],
  kml: [
    {
      type: String,
      trim: true
    }
  ],
  kmlEn: [
    {
      type: String,
      trim: true
    }
  ],
  kmlEs: [
    {
      type: String,
      trim: true
    }
  ],
  kmlIt: [
    {
      type: String,
      trim: true
    }
  ],
  kmlDe: [
    {
      type: String,
      trim: true
    }
  ],
  kmlNl: [
    {
      type: String,
      trim: true
    }
  ],
  socialNetwork: [
    {
      url: {
        type: String,
        required: 'Please fill social network url',
        trim: true
      }
    }
  ],
  environment: [
    {
      type: Number
    }
  ],
  localization: {
    lat: {
      type: Number
    },
    lon: {
      type: Number
    }
  },
  altitude: {
    type: Number
  },
  landmark: {
    type: String,
    trim: true
  },
  // Specific
  ranking: {
    type: Number
  },
  dateRanking: {
    type: Date
  },
  numRanking: {
    type: String,
    trim: true
  },
  label: [
    {
      type: Number
    }
  ],
  labelType: {
    type: Number
  },
  labelTourismHandicap: [
    {
      type: Number
    }
  ],
  labelChartQuality: [
    {
      type: Number
    }
  ],
  businessTourism: {
    tourismeAffairesEnabled: {
      type: Boolean
    },
    sallesEquipeesPour: [
      {
        type: Number
      }
    ],
    sallesEquipement: [
      {
        type: Number
      }
    ],
    sallesRestauration: [
      {
        type: Number
      }
    ],
    sallesHebergement: [
      {
        type: Number
      }
    ],
    sallesReunion: [
      {
        nom: {
          type: String,
          trim: true
        },
        description: {
          type: String,
          trim: true
        },
        descriptionEn: {
          type: String,
          trim: true
        },
        descriptionEs: {
          type: String,
          trim: true
        },
        descriptionIt: {
          type: String,
          trim: true
        },
        descriptionDe: {
          type: String,
          trim: true
        },
        descriptionNl: {
          type: String,
          trim: true
        },
        capaciteMax: {
          type: Number
        },
        superficie: {
          type: Number
        },
        hauteur: {
          type: Number
        },
        lumiereNaturelle: {
          type: Boolean,
          default: false
        },
        tarifSalle: {
          min: {
            type: Number
          },
          max: {
            type: Number
          }
        },
        tarifJournee: {
          min: {
            type: Number
          },
          max: {
            type: Number
          }
        },
        tarifResident: {
          min: {
            type: Number
          },
          max: {
            type: Number
          }
        },
        dispositions: [
          {
            description: {
              type: String,
              trim: true
            },
            capacite: {
              type: Number
            },
            disposition: {
              type: Number
            }
          }
        ]
      }
    ],
    nombreSallesReunionEquipees: {
      type: Number
    },
    capaciteMaxAccueil: {
      type: Number
    },
    nombreSallesModulables: {
      type: Number
    }
  },
  chain: [
    {
      type: Number
    }
  ],
  chainLabel: [
    {
      type: Number
    }
  ],
  guide: [
    {
      type: Number
    }
  ],
  language: [
    {
      type: Number
    }
  ],
  languesDocumentation: [
    {
      type: Number
    }
  ],
  capacity: {
    value: {
      type: Number
    },
    detail: {
      location: {
        type: Number
      },
      bedroom: {
        type: Number
      },
      bed: {
        type: Number
      },
      person: {
        type: Number
      },
      surface: {
        type: Number
      },
      room: {
        type: Number
      },
      dormitory: {
        type: Number
      },
      simpleRoom: {
        type: Number
      },
      doubleRoom: {
        type: Number
      },
      twinRoom: {
        type: Number
      },
      tripleRoom: {
        type: Number
      },
      quadrupleRoom: {
        type: Number
      },
      familialRoom: {
        type: Number
      },
      communicatingRoom: {
        type: Number
      },
      classifiedLocation: {
        type: Number
      },
      tent: {
        type: Number
      },
      caravan: {
        type: Number
      },
      campingCar: {
        type: Number
      },
      mobilHome: {
        type: Number
      },
      bungalow: {
        type: Number
      },
      chalet: {
        type: Number
      },
      housing: {
        type: Number
      },
      flatware: {
        type: Number
      },
      flatwareTerrace: {
        type: Number
      },
      total: {
        type: Number
      },
      accomodation: {
        type: Number
      },
      accomodationDisabledAccess: {
        type: Number
      },
      suite: {
        type: Number
      },
      airconditionedRoom: {
        type: Number
      },
      reportedLocation: {
        type: Number
      },
      passage: {
        type: Number
      }
    }
  },
  scope: {
    type: Number
  },
  nomLieu: {
    type: String,
    trim: true
  },
  category: [
    {
      type: Number
    }
  ],
  theme: [
    {
      type: Number
    }
  ],
  activity: [
    {
      type: Number
    }
  ],
  isActivityProvider: {
    type: Boolean
  },
  activityProvider: {
    type: String
  },
  activityProviderType: {
    type: String
  },
  ambianceIdSitra: {
    type: Number
  },
  ambianceLibelle: {
    type: String,
    trim: true
  },
  ambianceLibelleEn: {
    type: String,
    trim: true
  },
  ambianceLibelleEs: {
    type: String,
    trim: true
  },
  ambianceLibelleIt: {
    type: String,
    trim: true
  },
  ambianceLibelleDe: {
    type: String,
    trim: true
  },
  ambianceLibelleNl: {
    type: String,
    trim: true
  },
  complementAccueil: {
    type: String,
    trim: true
  },
  complementAccueilEn: {
    type: String,
    trim: true
  },
  complementAccueilDe: {
    type: String,
    trim: true
  },
  complementAccueilNl: {
    type: String,
    trim: true
  },
  complementAccueilIt: {
    type: String,
    trim: true
  },
  animauxAcceptes: {
    type: String,
    trim: true
  },
  prestation: [
    {
      type: Number
    }
  ],
  tailleGroupe: {
    min: {
      type: Number
    },
    max: {
      type: Number
    }
  },
  service: [
    {
      type: Number
    }
  ],
  equipment: [
    {
      type: Number
    }
  ],
  comfort: [
    {
      type: Number
    }
  ],
  adaptedTourism: [
    {
      type: Number
    }
  ],
  ski: {
    classification: {
      type: Number
    },
    domaineSkiableTypes: [
      {
        type: Number
      }
    ],
    nombrePistes: {
      type: Number
    },
    nombreKmPiste: {
      type: Number
    },
    nombrePistesVertes: {
      type: Number
    },
    nombrePistesBleues: {
      type: Number
    },
    nombrePistesRouges: {
      type: Number
    },
    nombrePistesNoires: {
      type: Number
    },
    nombreRemonteesMecaniques: {
      type: Number
    },
    nombreTeleskis: {
      type: Number
    },
    nombreTelesieges: {
      type: Number
    },
    nombreTelecabines: {
      type: Number
    },
    nombreTelepheriques: {
      type: Number
    },
    nombreAutresRemontees: {
      type: Number
    },
    geolocalisation: {
      altitudeMini: {
        type: Number
      },
      altitudeMaxi: {
        type: Number
      }
    }
  },
  typeDetail: [
    {
      type: Number
    }
  ],
  criteriaFamily: [
    {
      type: Number
    }
  ],
  criteriaInternal: [
    {
      type: Number
    }
  ],
  visitGroup: [
    {
      type: Number
    }
  ],
  visitIndividual: [
    {
      type: Number
    }
  ],
  visitLabel: {
    type: String,
    trim: true
  },
  visites: {
    visitable: {
      type: Boolean
    },
    dureeMoyenneVisiteIndividuelle: {
      type: Number
    },
    dureeMoyenneVisiteGroupe: {
      type: Number
    },
    languesVisite: [
      {
        type: Number
      }
    ],
    languesAudioGuide: [
      {
        type: Number
      }
    ],
    languesPanneauInformation: [
      {
        type: Number
      }
    ]
  },
  typeClient: [
    {
      type: Number
    }
  ],
  typePromoSitra: [
    {
      type: Number
    }
  ],
  typeAccommodation: [
    {
      type: Number
    }
  ],
  // formule hebergement
  formuleAccommodation: {
    description: {
      type: String,
      trim: true
    },
    descriptionEn: {
      type: String,
      trim: true
    },
    descriptionEs: {
      type: String,
      trim: true
    },
    descriptionIt: {
      type: String,
      trim: true
    },
    descriptionDe: {
      type: String,
      trim: true
    },
    descriptionNl: {
      type: String,
      trim: true
    }
  },
  informationAccommodation: {
    numberDays: {
      type: Number
    },
    numberNights: {
      type: Number
    }
  },
  // label (informationsRestauration)
  labelRestauration: {
    type: String,
    trim: true
  },
  specialityRestauration: [
    {
      type: Number
    }
  ],
  typeHousing: [
    {
      type: Number
    }
  ],
  typeSpecialty: [
    {
      type: Number
    }
  ],
  typeProduct: [
    {
      type: Number
    }
  ],
  aopAocIgp: [
    {
      type: Number
    }
  ],
  // modesPaiement
  meanPayment: [
    {
      type: Number
    }
  ],
  transport: [
    {
      type: Number
    }
  ],
  openingEveryDay: {
    type: Boolean
  },
  openingDate: {
    recurrent: {
      type: Boolean
    },
    description: {
      type: String,
      trim: true
    },
    descriptionEn: {
      type: String,
      trim: true
    },
    descriptionEs: {
      type: String,
      trim: true
    },
    descriptionIt: {
      type: String,
      trim: true
    },
    descriptionDe: {
      type: String,
      trim: true
    },
    descriptionNl: {
      type: String,
      trim: true
    },
    periodesOuvertures: [
      {
        type: {
          type: String,
          trim: true
        },
        dateStart: {
          type: Date
        },
        dateEnd: {
          type: Date
        },
        horaireOuverture: {
          type: Date
        },
        horaireFermeture: {
          type: Date
        },
        description: {
          type: String,
          trim: true
        },
        descriptionEn: {
          type: String,
          trim: true
        },
        descriptionEs: {
          type: String,
          trim: true
        },
        descriptionIt: {
          type: String,
          trim: true
        },
        descriptionDe: {
          type: String,
          trim: true
        },
        descriptionNl: {
          type: String,
          trim: true
        },
        ouverturesJourDuMois: [
          {
            jour: {
              type: String,
              trim: true
            },
            horaireOuverture: {
              type: Date
            },
            horaireFermeture: {
              type: Date
            }
          }
        ]
      }
    ],
    fermeturesExceptionnelles: [
      {
        dateSpeciale: {
          type: String
        }
      }
    ],
    complementaryOpenings: [
      {
        type: Number
      }
    ]
  },
  price: {
    gratuit: {
      type: Boolean
    },
    description: {
      type: String,
      trim: true
    },
    descriptionEn: {
      type: String,
      trim: true
    },
    descriptionEs: {
      type: String,
      trim: true
    },
    descriptionIt: {
      type: String,
      trim: true
    },
    descriptionDe: {
      type: String,
      trim: true
    },
    descriptionNl: {
      type: String,
      trim: true
    },
    detail: [
      {
        dateStart: {
          type: Date
        },
        dateEnd: {
          type: Date
        },
        price: [
          {
            type: {
              type: Number
            },
            label: {
              type: String,
              trim: true
            },
            min: {
              type: Number
            },
            max: {
              type: Number
            },
            description: {
              type: String,
              trim: true
            },
            descriptionEn: {
              type: String,
              trim: true
            },
            descriptionEs: {
              type: String,
              trim: true
            },
            descriptionIt: {
              type: String,
              trim: true
            },
            descriptionDe: {
              type: String,
              trim: true
            },
            descriptionNl: {
              type: String,
              trim: true
            }
          }
        ]
      }
    ]
  },
  priceInclude: {
    description: {
      type: String,
      trim: true
    },
    descriptionEn: {
      type: String,
      trim: true
    },
    descriptionEs: {
      type: String,
      trim: true
    },
    descriptionIt: {
      type: String,
      trim: true
    },
    descriptionDe: {
      type: String,
      trim: true
    },
    descriptionNl: {
      type: String,
      trim: true
    }
  },
  priceNotInclude: {
    description: {
      type: String,
      trim: true
    },
    descriptionEn: {
      type: String,
      trim: true
    },
    descriptionEs: {
      type: String,
      trim: true
    },
    descriptionIt: {
      type: String,
      trim: true
    },
    descriptionDe: {
      type: String,
      trim: true
    },
    descriptionNl: {
      type: String,
      trim: true
    }
  },
  priceSupplement: {
    description: {
      type: String,
      trim: true
    },
    descriptionEn: {
      type: String,
      trim: true
    },
    descriptionEs: {
      type: String,
      trim: true
    },
    descriptionIt: {
      type: String,
      trim: true
    },
    descriptionDe: {
      type: String,
      trim: true
    },
    descriptionNl: {
      type: String,
      trim: true
    }
  },
  legalInformation: {
    siret: {
      type: String,
      trim: true
    },
    apeNafCode: {
      type: String,
      trim: true
    },
    modeGestion: {
      type: Number
    },
    rcs: {
      type: String,
      trim: true
    },
    numeroAgrementLicense: {
      type: String,
      trim: true
    },
    numeroRegistration: {
      type: String,
      trim: true
    }
  },
  labelArea: [
    {
      type: Number
    }
  ],
  rankingArea: [
    {
      type: Number
    }
  ],
  rankingPrefectural: {
    type: Number
  },
  providerAccreditation: [
    {
      type: Number
    }
  ],
  approval: [
    {
      type: Number
    }
  ],
  genericEvent: {
    type: Number
  },
  itinerary: {
    positive: {
      type: Number
    },
    negative: {
      type: Number
    },
    distance: {
      type: Number
    },
    dailyDuration: {
      type: Number
    },
    referencesTopoguides: {
      type: String,
      trim: true
    },
    referencesCartographiques: {
      type: String,
      trim: true
    },
    altitudeMaximum: {
      type: Number
    },
    altitudeMoyenne: {
      type: Number
    },
    itineraireType: {
      type: String,
      trim: true
    },
    itineraireBalise: {
      type: String,
      trim: true
    },
    precisionsBalisage: {
      type: String,
      trim: true
    }
  },
  passagesDelicats: {
    type: String,
    trim: true
  },
  passagesDelicatsEn: {
    type: String,
    trim: true
  },
  passagesDelicatsEs: {
    type: String,
    trim: true
  },
  passagesDelicatsIt: {
    type: String,
    trim: true
  },
  passagesDelicatsDe: {
    type: String,
    trim: true
  },
  passagesDelicatsNl: {
    type: String,
    trim: true
  },
  complement: {
    type: String,
    trim: true
  },
  complementEn: {
    type: String,
    trim: true
  },
  complementEs: {
    type: String,
    trim: true
  },
  complementIt: {
    type: String,
    trim: true
  },
  complementDe: {
    type: String,
    trim: true
  },
  complementNl: {
    type: String,
    trim: true
  },
  perimetreGeographique: [
    {
      type: Number
    }
  ],
  // Common
  statusImport: {
    type: Number
  },
  member: {
    type: Number
  },
  adherent: {
    type: String,
    trim: true
  },
  territory: [
    {
      type: Number
    }
  ],
  statusExploitant: {
    type: Number
  },
  url: {
    type: String,
    default: '',
    trim: true
  },
  created: {
    type: Date,
    default: Date.now
  },
  lastUpdate: {
    type: Date,
    default: Date.now
  },
  lastUpdateFromClient: {
    type: Date,
    default: Date.now
  },
  lastVisu: {
    type: Date,
    default: Date.now
  },
  deleted: {
    type: Date,
    default: null
  },
  user: {
    type: Schema.ObjectId,
    ref: 'User'
  },
  idSitraCity: {
    type: Number
  },
  privateData: {
    type: String
  },
  contributor: {
    type: String,
    trim: true
  },
  gatewayStatus: {
    // passerelle arrêté ou non
    type: Boolean,
    default: true
  },
  filename: {
    type: String,
    trim: true
  },
  alert: [
    {
      type: String,
      trim: true
    }
  ],
  rateCompletion: {
    type: Number
  },
  metadata: {
    type: String
  },
  displayForUser: {
    type: String
  }
};

exports.defaultProductSchema = _defaultProductSchema;