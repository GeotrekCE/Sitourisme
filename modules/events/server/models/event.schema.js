'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
/**
 * Default Event Schema
 */
const _defaultSchema = {
  reservation: {
    complementFr: {
      type: String,
      trim: true  
    }
  },
  specialId: {
    type: String,
    trim: true
  },
  proprietaireId: {
    type: String,
    trim: true
  },
  state: {
    type: String
  },
  specialIdSitra: {
    type: String
  },
  district: {
    type: Number
  },
  legalEntity : [
    {
      type: {
        type: String,
        required: 'Please fill product import type for Legal Entity',
        trim: true
      },
      data: {
        type: Schema.ObjectId,
        ref: '',
      }
    }
  ],
  oldSpecialIdSitra: { // Used for delete action
    type: String,
    trim: true
  },
  importType: {
    type: String,
    required: 'Please fill product import type for Event',
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
  category: [
    {
      type: Number
    }
  ],
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
  email: [
    {
      type: String,
      trim: true
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
      title: {
        type: String
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
      author: {
        type: String,
        trim: true
      },
      dateLimiteDePublication: {
        type: Date
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
  localization: {
    lat: {
      type: Number
    },
    lon: {
      type: Number
    }
  },
  language: [
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
  idLieu: {
    type: Number
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
    expiration: [
      {
        expirationDate: {
          type: Date
        },
        expirationAction: {
          type: String,
          trim: true
        }
      }
    ],
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
          type: String,
          trim: true
        },
        horaireFermeture: {
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
        ouverturesJourDuMois: [
          {
            jour: {
              type: String,
              trim: true
            },
            horaireOuverture: {
              type: String,
              trim: true
            },
            horaireFermeture: {
              type: String,
              trim: true
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
    ],
    dureeSeance : {
      type: Number
    }
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
  territory: [
    {
      type: Number
    }
  ],
  url: {
    type: String,
    default: '',
    unique: true,
    required: 'Please fill url',
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
  user: {
    type: Schema.ObjectId,
    ref: 'User'
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
  informationSitraId : {
    type: Number
  },
  gestionSitraId : {
    type: Number
  },
};

exports.defaultSchema = _defaultSchema;
