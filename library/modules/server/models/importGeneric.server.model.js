const path = require('path'),
    chalk = require('chalk'),
    axios = require('axios'),
    pify = require('pify'),
    _ = require('lodash'),
    Import = require(path.resolve('./library/import/geotrek.js')),
    config = require(path.resolve('./config/config.js')),
    configImportGEOTREK = require(path.resolve('./config/configImport_GEOTREK.js')),
    exportApidae = require(path.resolve('./library/modules/server/models/export.model.js'));

class ImportGeotrekApi extends Import
{
  constructor(options)
  {
    super(options);
    if (config.debug && config.debug.logs)
      console.log('ImportGeotrekApi constructor');

    this.importType = options.importType
      ? options.importType.toUpperCase()
      : null;
    this.user = options.user ? options.user : null;
    this.lang = options.lang ? options.lang : 'fr';
    this.importInstance = options.importInstance ? parseInt(options.importInstance, 10) : 0;
    this.importApi = options.importApi;
    
    this.Model = options.Model;
    this.moduleName = options.moduleName;
    this.EntityServer = options.EntityServer;
    this.cgt = options.cgt;
    
    this.importModule = require(path.resolve('./modules/' + options.moduleName + '/server/models/import.model.js'));
  }
  
  import(data, next)
  {
    if (config.debug && config.debug.logs)
      console.log('ImportGeotrekApi.import', this.importInstance);

    const me = this;

    Object.keys(configImportGEOTREK.geotrekInstance).forEach(function (
      structure
    ) {
      if (structure == me.importInstance) {
        console.log(
          'Instance = ',
          structure,
          ' - GeoAdmin URL = ',
          configImportGEOTREK.geotrekInstance[structure].geotrekUrl
        );
  
        me.executeQuery(
          0,
          configImportGEOTREK.geotrekInstance[structure].geotrekUrl,
          structure
        ).catch((err) => {
          console.log(
            chalk.red(
              '>>>>>>>>>>>>>>>>>>>>>>>> OBJ NOT FOUND IN = ',
              err,
              'For instance = ',
              structure
            )
          );
          return false;
        });
      }
    });
  }
  
  async executeQuery(page, instanceGeo, structure)
  {
    if (config.debug && config.debug.logs)
      console.log('ImportGenericGeotrekApi.prototype.executeQuery');

    let geoTrekPath = '/'+ this.importApi +'?format=json';
    let urlNext = '';

    if (config.debug != undefined && config.debug.idGeo != 0) {
      geoTrekPath = '/'+ this.importApi +'/' + config.debug.idGeo + '?format=json';
      if (config.debug && config.debug.logs)
        console.log('GeoPath = ', geoTrekPath);
    } else {
      urlNext = page != 0 ? '&page=' + page : '';
    }

    this.instanceApi = axios.create({
      baseURL: instanceGeo,
      validateStatus(status) {
        return status < 500;
      }
    });
    
    this.importData = new this.importModule(this.instanceApi);
    
    console.log(chalk.green("Axiox Connex = ", geoTrekPath + urlNext));
    const { data, status } = await this.instanceApi.get(geoTrekPath + urlNext);
    if (status === 200) {
      this.doUpsertAsync = await pify(this.doUpsert);

      if (config.debug && config.debug.logs) console.log('Import page ' + page);

      if (config.debug != undefined && config.debug.idGeo != 0) {
        data.results = data;
      }

      await this.importDatas(data.results, structure);

      if (config.debug && config.debug.seeData) console.log('Data = ', data);

      if (
        (data.next && config.debug == undefined) ||
        (data.next && config.debug.allpages == true && config.debug.idGeo == 0)
      ) {
        page++;
        this.executeQuery(page, instanceGeo, structure);
      } else {
        const membersToImport = [];
        Object.keys(configImportGEOTREK.geotrekInstance[structure].structures).forEach(function (
          structureFille
        ) {
          membersToImport.push(configImportGEOTREK.geotrekInstance[structure].structures[structureFille].memberId);
        });
        console.log(chalk.green("Members To Import = ",membersToImport));

        const options = {
          exportType: 'AUTO',
          membersToImport: membersToImport
        };

        const ExportApidae = new exportApidae(this.Model);
        ExportApidae.__exportSitraAuto('geotrek-api', options, () => {
          if (config.debug && config.debug.logs)
            console.log('end of export sitra auto!');
          return;
        });
      }
    } else {
      throw 'Erreur de connexion à Geotrek';
    }
  }
  
  doUpsert(datas, specialId, importType, next)
  {
    if (config.debug && config.debug.logs)
      console.log('importGeneric - doUpsert',datas.name, this.cgt);
  
    this.Model.doUpsert(datas, specialId, importType, this.Model, this.EntityServer, this.cgt, function (err, data) {
      if (config.debug && config.debug.logs) console.log('>>> cb doUpsert');
      if (err) {
        console.log(
          'Error in doUpsert() : Upsert failed for event : ',
          datas.specialId
        );
      }
      if (config.debug && config.debug.logs) console.log('Next !');
      next(null, data);
    });
  }
  
  async importDatas(listElement, structure)
  {
    if (config.debug && config.debug.logs)
      console.log(
        'ImportGenericGeotrekApi.prototype.importDatas',
        listElement.id,
        listElement.length
      );

    if (
      (listElement && listElement.length > 0) ||
      listElement.id != undefined
    ) {
      if (config.debug && config.debug.logs)
        console.log('ImportGenericGeotrekApi.prototype.importDatas next');

      let element = listElement;
      if (config.debug == undefined || config.debug.idGeo == 0) {
        element = listElement.shift();
        if (config.debug && config.debug.logs)
          console.log(
            'ImportGenericGeotrekApi.prototype.importDatas - shift products'
          );
      }

      if (this.moduleName == 'products') {
        delete element.steps;
        delete element.geometry;
      }
      
      console.log(
        chalk.green('struc = ', structure, ' elem = ', element.structure)
      );
      
      try {
        this.member =
          configImportGEOTREK.geotrekInstance[structure].structures[
            element.structure
          ].memberId;
      } catch (err) {
        this.member = null;
        console.log(chalk.red('Member inconnu !!!'));
      }

      console.log(chalk.green('Member = ', this.member));

      if (process.env.NODE_ENV == 'development' && config.debug != undefined) {
        this.member = 3568;
        console.log(chalk.green('DEV MODE - Member = ', this.member, ' moduleName = ',this.moduleName));
      }

      console.log(chalk.green('Config = ', configImportGEOTREK.geotrekInstance[structure].structures[element.structure]));

      if (this.member && configImportGEOTREK.geotrekInstance[structure].structures[element.structure].production.trek) {
        this.configData = {
          specialId: null,
          codeType: (this.moduleName == 'events') ? 'F&M' : 'EQU',
          subType: (this.moduleName == 'events') ? '1974' : '2988', // 1974="Distractions et loisirs" 2988="Loisirs sportifs"
          member: this.member
        };

        let additionalInformation = {};
        if (element.information_desk && element.information_desks.length) {
          const { data } = await this.instanceApi.get(
            `/informationdesk/${_.last(element.information_desks)}/?format=json`
          );
          if (data) {
            additionalInformation = data;
          }
        }
        const proprietaireId = (process.env.NODE_ENV == 'production') ? configImportGEOTREK.geotrekInstance[structure].structures[element.structure].proprietaireId : config.proprietaireId;
        
        let product = await this.importData.formatDatas(element, additionalInformation, structure, proprietaireId, this.importType, this.configData, this.user);
        console.log('ok importData formatDatas');
        
        if (this.moduleName == 'events') {
          product.legalEntity = this.getLegalEntity(element, product, structure, product.district)
          product.gestionSitraId = product.district
        } else {
          product.legalEntity = this.getLegalEntity(element, product, structure)
          product.gestionSitraId = configImportGEOTREK.geotrekInstance[structure].structures[element.structure].specialIdSitra
        }
        product.informationSitraId = configImportGEOTREK.geotrekInstance[structure].structures[element.structure].specialIdSitra;

        product.rateCompletion = this.calculateRateCompletion(product);

        console.log(`GeoTrek API => import specialId : ${product.specialId}`, product);

        await this.doUpsertAsync(
          product,
          product.specialId,
          product.importType
        );
      } else {
        console.log(
          `GeoTrek API => NOT import structure : ${element.structure}`
        );
      }
      if (config.debug == undefined || config.debug.idGeo == 0) {
        return this.importDatas(listElement, structure);
      } else {
        return;
      }
    } else {
      console.log("Fin de l'import");
      return;
    }
  }
  
  getLegalEntity(element, product, structure, district)
  {
    if (config.debug && config.debug.logs)
      console.log('ImportGeotrekApi.getLegalEntity pour la structure = ', structure);
      
    let legalEntity = null;
    const listLegalEntity = [];

    const conf = configImportGEOTREK.geotrekInstance[structure].structures[
      element.structure
    ]
      ? configImportGEOTREK.geotrekInstance[structure].structures[
          element.structure
        ]
      : null;

    if (conf) {
      
      if (district) conf.specialIdSitra = district

      legalEntity = {
        specialId: conf.specialId,
        importType: product.importType,
        importSubType: product.importSubType,
        type: 'STRUCTURE',
        name: conf.name,
        address: {
          address1: conf.address1,
          address2: conf.address2,
          city: conf.city,
          insee: conf.insee
        },
        specialIdSitra: conf.specialIdSitra,
        statusImport: conf.statusImport
      };
    }
    if (legalEntity) {
      listLegalEntity.push({
        type: 'information',
        product: legalEntity
      });
      listLegalEntity.push({
        type: 'gestion',
        product: legalEntity
      });
    }

    return listLegalEntity;
  }
}

module.exports = ImportGeotrekApi;
