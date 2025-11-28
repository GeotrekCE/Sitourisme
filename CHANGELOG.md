## 2.4.0 - 2025

- Mapping champs ambiances & descriptifs (#43)
- Déplacer les recommandations et ajouter le texte des étiquettes (#50)
- Supporter les images en PNG / WEBP (#41)
- Import randos / Mieux gérer les niveaux de difficulté (#22)
- Uploader les GPX sur Apidae (#49)
- Ajout de critères internes (#57)
- Import randos / Amélioration du mapping indications Localisation (#67)
- Gravel Bike Activity added to configSitraRef
- Take care of new geotrek admin API to handle city codes (@submarcos)
- Adding Mapping Events informations about District, Place and Geotrek Cities
- Improve Geotrek events mapping and import

## 2.2 - August 2024
- Apidae: Continuous writing in case of error
- Apidae: Synchronization of perimetreGeographique field stopped, due to technical limitations of Apidae members
- Various logs added to track synchronization errors
- Optimization of images import
- Support for line breaks in Apidae records
- Addition of Haute-Loire

## 2.1
- Fix picture'author recording to author record in place of description
- Library classes refactoring
- Server controller refactoring
- Models classes, entity model, entity factory & generic import refactoring
- Removing old unused method
- Product & Event Schema updated

## 1.1 & 1.2 
- EVO Write on Apidae Multimember project
- EVO New Geotrek configuration file with Axios renew connection
- EVO New Geotrek configuration file to customize activities depending of Geotrek instance
- EVO Config/Apidae - Json Activity from Apidae
- EVO FO removing auto inscription and unused views
- EVO FO listing products - Adding status / ID Geotrek - Apidae / Errors
- Class ImportGenericGeotrekApi refactored with deprecated Util.inherits removed by ES6 extends Geotrek import class
- Depcheck install & clean dependencies modules from npm project (async, elasticsearch, json2csv, mongodb, q, slug, xml2json)
- Tests Lint Done
- Removing unused routes & methods from controller / models
- Removing old Geotrek import 
- Removing old RegionDo import
- Removing unused ElasticSearch on Api Geotrek import
- Removing Ecosystem / PM2 old hosting configuration

## 1.0
- FO Angular 1.4.14 managed by Bower
- MongoDB 4.4.6
- ElasticSearch
- Geotrek / Geotrek API / RegioDo
