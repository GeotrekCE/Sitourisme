'use strict';

/**
 * Module dependencies.
 */
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const _ = require('lodash');
const DataString = require(__dirname +
  '/../../../../library/data/manipulate.js');
const config = require(__dirname + '/../../../../config/config.js');
const configSitra = require(__dirname + '/../../../../config/configSitra.js');
const configSitraTown = require(__dirname +
  '/../../../../config/configSitraTown.js');
const configSitraTownAndMember = require(__dirname +
  '/../../../../config/configSitraTownAndMember.js');
const configSitraReference = require(__dirname +
  '/../../../../config/configSitraReference.js');
const ExportSitra = require(__dirname + '/exportSitra.server.model.js');

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

/**
 * Class ProductFactory
 * Enable create a product's mongoose instance, and init generic CRUD methods
 */
class ProductFactory {
  constructor(name, schema) {
    this.name = name;
    this.schema = schema || {};
  }

  getName() {
    return this.name;
  }

  setName(name) {
    this.name = name;
  }

  getSchema() {
    return this.schema;
  }

  setSchema(schema) {
    this.schema = schema;
  }

  getMongooseSchema() {
    return new Schema(this.schema, {
      versionKey: false
    });
  }

  setMongooseModel(ProductSchema) {
    mongoose.model(this.name, ProductSchema);
  }

  getDefaultProductSchema() {
    return _defaultProductSchema;
  }

  /**
   * Method get by url
   */
  getByUrl(url, callback) {
    var Product = mongoose.model(this.name);
    Product.find({ url }).exec((err, product) => {
      if (err) {
        console.log('Error in ' + this.name + ' getByUrl() : ' + err);
      }

      if (callback) {
        callback(err, product);
      }
    });
  }

  /**
   * Method save
   */
  save(product, callback) {
    var Product = mongoose.model(this.name),
      address = product.address ? product.address : null,
      zipcode = address && address.zipcode ? address.zipcode : null,
      data,
      dataL,
      i;

    // Update date last update
    product.lastUpdate = new Date();

    if (!product.url) {
      product.url = this.buildUrl(product);
    }

    product.territory = null;

    if (zipcode && configSitraTownAndMember.perZipcode[zipcode]) {
      data = configSitraTownAndMember.perZipcode[zipcode];
      dataL = data.length;
      for (i = 0; i < dataL; i++) {
        if (address.insee && address.insee === data[i].insee) {
          product.territory = data[i].arrTerritory;
          break;
        }
      }
    }

    // Check url
    __checkUrlHttp(product);

    if (product.specialIdSitra) {
      product.statusImport = 2;
    } else if (
      product.type !== 'NON DEFINI' &&
      (!product.alert || !product.alert.length) &&
      product.member
    ) {
      product.statusImport = 1;
    } else if (product.type === 'STRUCTURE') {
      product.statusImport = 1;
    } else {
      product.statusImport = 0;
    }

    // passerelle arrếté
    if (product.gatewayStatus === false) {
      product.statusImport = 4;
    }

    // Init alert
    product.alert = __checkAlert(product, this.name);

    product.save((err) => {
      if (err) {
        // Fix problem with unique url
        if (err.code === 11000) {
          product.url = product.url + 'A';
          return Product.save(product, callback);
        }

        console.log('Error in ' + this.name + ' save() : ', err);
      }
      if (callback) {
        callback(err, product);
      }
    });
  }

  /**
   * Build url
   *
   * @param {Object} product
   * @returns {String}
   */
  buildUrl(product) {
    return `${this.name}/Detail/${this.cleanUrl(product.type)}${
      product.address && product.address.city
        ? '/' + this.cleanUrl(product.address.city)
        : ''
    }/${this.cleanUrl(product.name)}/${this.cleanUrl(product.specialId)}`;
  }

  /**
   * Clean url
   *
   * @param {String} str
   * @returns {String}
   */
  cleanUrl(str) {
    if (typeof str === 'string') {
      str = DataString.removeAccents(str).replace(/[^a-z0-9\-_]/gi, '-');
    }

    return str;
  }

  /**
   * Method check phone
   */
  checkPhone(phone, fieldName) {
    var alert = [],
      phoneRegExpAlertChar = /([^0-9\ ])/,
      phoneRegExpAlertStartWith = /^04|^06|^07|^08|^09/,
      phoneRegExpFinal =
        /^([0-9]{2}) ([0-9]{2}) ([0-9]{2}) ([0-9]{2}) ([0-9]{2})$/;

    if (phone && phone.length) {
      if (phone.match(phoneRegExpAlertChar)) {
        alert.push(
          'Le champ ' +
            fieldName +
            " a un caractère autre qu'un numérique ou espace"
        );
      } else if (!phone.match(phoneRegExpFinal)) {
        alert.push('Le champ ' + fieldName + " n'a pas un format standard");
      } else if (!phone.match(phoneRegExpAlertStartWith)) {
        alert.push(
          'Le champ ' + fieldName + ' ne commence pas par 04, 06, 07, 08, 09'
        );
      }
    }

    return alert;
  }

  /**
   * Method check email
   */
  checkEmail(email, fieldName) {
    var alert = [];

    if (
      !!email &&
      !/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(
        email
      )
    ) {
      alert.push('Le champ ' + fieldName + " n'a pas un format standard");
    }

    return alert;
  }

  /**
   * Method delete
   */
  delete(product, callback) {
    // ToDo : modifier mieux plus tard (écris par Nacim)
    if (product.remove) {
      product.remove((err) => {
        if (err) {
          console.log('Error in ' + this.name + ' delete() : ' + err);
          console.log(product);
        }

        if (callback) {
          callback(err);
        }
      });
    }
  }

  /**
   * Method do upsert
   */
  doUpsert(datas, specialId, importType, callback) {
    const Product = mongoose.model(this.name);
    let params = {};

    // Avoid to duplicate legalEntities - address is the matching key
    if (
      this.name === 'LegalEntity' &&
      (datas.address.address1 || datas.address.address2)
    ) {
      params = {
        'address.address1': datas.address.address1,
        'address.address2': datas.address.address2,
        'address.city': datas.address.city,
        'address.insee': datas.address.insee
      };
    } else {
      params = { specialId, importType };
    }

    Product.find(params, (err, docs) => {
      if (err) {
        console.log('Error in ' + this.name + ' doUpsert() : ' + err);
        if (callback) {
          callback(err);
        }
      } else {
        var product =
          docs.length > 0 ? _.extend(docs[0], datas) : new Product(datas);
        // Save
        Product.save(product, callback);
      }
    });
  }

  /**
   * Method export sitra
   */
  exportSitra(products, options, callback) {
    var optionsExportSitra = options || {};
    optionsExportSitra.typeExport = this.name;

    ExportSitra.exportSitra(products, optionsExportSitra, callback);
  }

  /**
   * Method remove product In Sitra
   */
  exportSitraAuto(type, options, callback) {
    options.typeExport = this.name;
    ExportSitra.exportSitraAuto(type, options, callback);
  }
  /**
   * Method removeFromSitra
   */
  /* removeFromSitra(importSubType, specialIdSitraArr, callback) {
    ExportSitra.removeFromSitra(importSubType, specialIdSitraArr, callback);
  } */

  /**
   * Method remove product In Sitra
   */
  removeProductInSitra(product, callback) {
    ExportSitra.removeProductInSitra(product, callback);
  }

  /**
   * Method get sitra sub type
   */
  getSitraSubType(product) {
    var objSubType = {},
      productType = product.type,
      typeLabel,
      configSitraReferenceL,
      i;

    switch (productType) {
      case 'PATRIMOINE_CULTUREL':
        typeLabel = 'PatrimoineCulturelType';
        break;

      case 'PATRIMOINE_NATUREL':
        typeLabel = null;
        break;

      case 'DEGUSTATION':
        typeLabel = null;
        break;

      case 'ACTIVITE':
        typeLabel = 'ActiviteType';
        break;

      case 'EQUIPEMENT':
        typeLabel = 'EquipementRubrique';
        break;

      case 'COMMERCE_ET_SERVICE':
        typeLabel = 'CommerceEtServiceType';
        break;

      case 'HEBERGEMENT_LOCATIF':
        typeLabel = 'HebergementLocatifType';
        break;

      case 'HEBERGEMENT_COLLECTIF':
        typeLabel = 'HebergementCollectifType';
        break;

      case 'HOTELLERIE':
        typeLabel = 'HotellerieType';
        break;

      case 'HOTELLERIE_PLEIN_AIR':
        typeLabel = 'HotelleriePleinAirType';
        break;

      case 'RESTAURATION':
        typeLabel = 'RestaurationType';
        break;

      case 'FETE_ET_MANIFESTATION':
        typeLabel = 'FeteEtManifestationType';
        break;

      case 'SEJOUR_PACKAGE':
        typeLabel = null;
        break;

      case 'NON DEFINI':
        typeLabel = null;
        break;

      default:
        typeLabel = null;
        if (process.env.NODE_ENV === 'development') {
          console.log(
            'Missing type "' +
              productType +
              '" for sub type in getSitraSubType()'
          );
        }
        break;
    }

    if (typeLabel && configSitraReference) {
      if (configSitraReference[typeLabel]) {
        configSitraReferenceL = configSitraReference[typeLabel].length;
        for (i = 0; i < configSitraReferenceL; i++) {
          objSubType[configSitraReference[typeLabel][i].id] =
            configSitraReference[typeLabel][i].labelFr;
        }
      }
    }

    return objSubType;
  }

  /**
   * Method get sitra keys
   */
  getSitraKeys(data) {
    var arrKeys = [],
      arrKeysTmp;

    _.forEach(
      data,
      function (value, key) {
        if (_.isArray(value) || _.isObject(value)) {
          arrKeysTmp = this.getSitraKeys(value);
          if (arrKeysTmp && arrKeysTmp.length) {
            arrKeys = arrKeys.concat(arrKeysTmp);
          }
        } else if (Number.isInteger(value) && value > 0) {
          if (key !== 'city') {
            arrKeys.push(value);
          }
        }
      },
      this
    );

    return arrKeys;
  }

  /**
   * Method get sitra reference
   */
  getSitraReference(data) {
    var reference = {},
      label,
      arrKeys = this.getSitraKeys(data),
      arrKeysL = arrKeys ? arrKeys.length : 0,
      i;

    for (i = 0; i < arrKeysL; i++) {
      label = __retrieveConfigSitraLabel(arrKeys[i]);
      if (label) {
        reference[arrKeys[i]] = label;
      }
    }

    return reference;
  }

  /**
   * Method get sitra personType reference for VAR83
   */
  getSitraPersonTypeReference(data) {
    var reference = {},
      personTypeIdArr = [4196, 458, 464, 459, 467];

    personTypeIdArr.forEach(function (id) {
      reference[id] = configSitra.reference[id].labelFr;
    });

    return reference;
  }

  /**
   * Method get sitra town reference
   */
  getSitraTownReference(data) {
    var fieldsTown = [data.address, data.addressReservation],
      reference = {},
      town,
      arrTownL,
      cityId,
      zipcode,
      i,
      j;

    for (j = 0; j < fieldsTown.length; j++) {
      if (fieldsTown[j] && fieldsTown[j].city) {
        cityId = fieldsTown[j].city;
        zipcode = fieldsTown[j].zipcode;
        town = '-';

        if (configSitraTown[zipcode]) {
          arrTownL = configSitraTown[zipcode].length;

          for (i = 0; i < arrTownL; i++) {
            if (configSitraTown[zipcode][i].sitraId && cityId) {
              if (configSitraTown[zipcode][i].sitraId === cityId) {
                town = configSitraTown[zipcode][i].name;
                break;
              } else {
                town = configSitraTown[zipcode][i].name;
              }
            } else {
              town = configSitraTown[zipcode][i].name;
              break;
            }
          }
        }

        reference[cityId] = town;
      }
    }

    return reference;
  }

  /**
   * Method get status import reference
   */
  getStatusImportReference(data) {
    var reference = {
      0: 'non importable',
      1: 'importable',
      2: 'importé',
      3: 'supprimé',
      4: 'passerelle arrêtée'
    };

    return reference;
  }

  /**
   * Method get sitra member reference
   */
  getSitraMemberReference(data) {
    var reference = {},
      memberId = data.member ? data.member : null,
      configMember = configSitraTownAndMember.perMemberId,
      dataMember =
        memberId && configMember && configMember[memberId]
          ? configMember[memberId]
          : null;

    if (dataMember) {
      reference[memberId] = dataMember.labelFr;
    }

    return reference;
  }

  /**
   * Method get sitra civility reference
   */
  getSitraCivilityReference(data) {
    var reference = {},
      civilities = configSitraReference.ContactCivilite;

    if (civilities) {
      _.forEach(civilities, function (dataCivility) {
        reference[dataCivility.id] = dataCivility.labelFr;
      });
    }

    return reference;
  }

  /**
   * Method get sitra internalCriteria reference
   */
  getSITRAInternalCriteriaReference() {
    var reference = {},
      internalCriteria = configSitraReference.internalCriteria;

    if (internalCriteria) {
      _.forEach(internalCriteria, function (dataInternalCriteria) {
        reference[dataInternalCriteria.id] = dataInternalCriteria.labelFr;
      });
    }

    return reference;
  }
}

module.exports = ProductFactory;

/**
 * Retrieve config sitra
 *
 * @param {String} idSitra
 * @returns {String|null}
 * @private
 */
function __retrieveConfigSitraLabel(idSitra) {
  if (
    configSitra.reference[idSitra] &&
    configSitra.reference[idSitra].labelFr
  ) {
    return configSitra.reference[idSitra].labelFr;
  } else if (
    configSitra.territory[idSitra] &&
    configSitra.territory[idSitra].labelFr
  ) {
    return configSitra.territory[idSitra].labelFr;
  } else {
    return null;
  }
}

/**
 * Check http url
 *
 * @param {Object} product
 * @private
 */
function __checkUrlHttp(product) {
  if (product.image) {
    _.forEach(product.image, function (image, i) {
      product.image[i].url = __cleanUrlHttp(image.url);
    });
  }
  if (product.pdf) {
    _.forEach(product.pdf, function (pdf, i) {
      product.pdf[i].url = __cleanUrlHttp(pdf.url);
    });
  }
  if (product.video) {
    _.forEach(product.video, function (video, i) {
      product.video[i].url = __cleanUrlHttp(video.url);
    });
  }
  if (product.socialNetwork) {
    _.forEach(product.socialNetwork, function (socialNetwork, i) {
      product.socialNetwork[i].url = __cleanUrlHttp(socialNetwork.url);
    });
  }
  if (product.website) {
    _.forEach(product.website, function (website, i) {
      product.website[i] = __cleanUrlHttp(website);
    });
  }
  if (product.reservation) {
    _.forEach(product.reservation, function (reservation, i) {
      if (reservation.website) {
        _.forEach(reservation.website, function (website, j) {
          product.reservation[i].website[j] = __cleanUrlHttp(website);
        });
      }
    });
  }
  if (product.contact) {
    _.forEach(product.contact, function (contact, i) {
      if (contact.website) {
        _.forEach(contact.website, function (website, j) {
          product.contact[i].website[j] = __cleanUrlHttp(website);
        });
      }
    });
  }
}

/**
 * Clean url
 *
 * @param {String} url
 * @return {String} The clean url
 * @private
 */
function __cleanUrlHttp(url) {
  if (url && _.isString(url) && !url.match('^https?://|^//')) {
    url = 'http://' + url;
  }

  return url;
}

/**
 * Check alert
 *
 * @param {Object} product
 * @private
 */
function __checkAlert(product, moduleName) {
  var alert = [],
    Product = mongoose.model(moduleName),
    nameClean,
    address = product.address,
    productTypeLC = product.importType
      ? product.importType.toLowerCase()
      : null,
    arrDpt,
    dpt;

  if (product.statusImport === 4) {
    alert.push('passerelle arrêtée');
  }

  // Type
  if (!product.type || product.type === 'NON DEFINI') {
    alert.push("Nos scripts n'ont pas réussi à déterminer le type");
  }
  // Type code
  if (product.typeCode) {
    nameClean = DataString.removeAccents(product.name);
    if (product.typeCode !== 'HPA' && nameClean.match(/Camping/i)) {
      alert.push('Le titre contient "Camping" mais le type n\'est pas un HPA');
    }
    if (product.typeCode !== 'HOT' && nameClean.match(/Hotel/i)) {
      alert.push('Le titre contient "Hotel" mais le type n\'est pas un HPA');
    }
  }
  // Address
  if (address) {
    if (address.zipcode && !address.zipcode.match(/^[0-9][AB0-9][0-9]{3}$/)) {
      alert.push("Le champ code postal n'a pas un format standard");
    } else {
      alert.push("Le champ code postal n'est pas renseigné");
    }
    if (address.city === 0) {
      product.address.city = null;
      alert.push("La commune n'existe pas");
    } else if (!address.city) {
      alert.push("Le champ commune n'est pas renseigné");
    }
  } else {
    alert.push("Le champ adresse n'est pas renseigné");
  }

  // Altitude
  if (product.altitude && product.altitude > 3000) {
    alert.push('Le champ altitude est supérieur à 3000m');
  }

  if (product.type && product.subType) {
    switch (product.type) {
      case 'COMMERCE_ET_SERVICE':
        // subType authorized
        if (![1874, 1875, 4012, 4013, 4014, 4015].includes(product.subType)) {
          alert.push('Sous-type non compatible avec le type');
        }
        break;
      case 'EQUIPEMENT':
        // subType authorized
        if (![2988, 2991, 2993].includes(product.subType)) {
          alert.push('Sous-type non compatible avec le type');
        }
        break;
      case 'HEBERGEMENT_COLLECTIF':
      case 'HEBERGEMENT_LOCATIF':
        break;
      case 'HOTELLERIE':
        // subType authorized
        if (![2734, 2736].includes(product.subType)) {
          alert.push('Sous-type non compatible avec le type');
        }
        break;
      case 'HOTELLERIE_PLEIN_AIR':
        // subType authorized
        if (![2409, 2410, 2413, 2416, 2418, 3722].includes(product.subType)) {
          alert.push('Sous-type non compatible avec le type');
        }
        break;
      case 'PATRIMOINE_CULTUREL':
        // subType authorized
        if (
          ![3200, 3201, 3202, 3203, 3204, 3205, 3851].includes(product.subType)
        ) {
          alert.push('Sous-type non compatible avec le type');
        }
        break;
      case 'RESTAURATION':
        // subType authorized
        if (![2859, 2861, 2865, 2866, 4528].includes(product.subType)) {
          alert.push('Sous-type non compatible avec le type');
        }
        break;
      case 'FETE_ET_MANIFESTATION':
        // subType authorized
        if (
          ![1958, 1959, 1962, 1966, 1971, 1973, 1974].includes(product.subType)
        ) {
          alert.push('Sous-type non compatible avec le type');
        }
        break;
      default:
        break;
    }
  }

  // Phone
  // if (product.phone) {
  // 	_.forEach(product.phone, function (phone) {
  // 		alert = alert.concat(Product.checkPhone(phone, 'téléphone'));
  // 	});
  // }
  // Fax
  // if (product.fax) {
  // 	_.forEach(product.fax, function (fax) {
  // 		alert = alert.concat(Product.checkPhone(fax, 'fax'));
  // 	});
  // }
  // Email
  if (product.email && product.email.length) {
    _.forEach(product.email, function (email) {
      alert = alert.concat(Product.checkEmail(email, 'email'));
    });
  }

  // short description
  if (product.shortDescription && product.shortDescription.length > 255) {
    alert.push('la description court dépasse la longueur de 255 caractères!');
  }

  return alert.length ? alert : null;
}
