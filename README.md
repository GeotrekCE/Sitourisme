# Sitourisme (PACA-API)

Passerelle permettant d'importer automatiquement des itinéraires depuis l'API d'instances Geotrek-admin vers Apidae.

- Fonctionnement et correspondance des champs : https://geotrek.ecrins-parcnational.fr/ressources/technique/2022-04-Geotrek-Apidae-v2.pdf
- Présentation aux rencontres Geotrek 2021 : https://geotrek.ecrins-parcnational.fr/rencontres/2021/presentations/09-geotrek-apidae.pdf

Afin de mettre en place la passerelle, il est nécessaire :
- de créer un projet d'API en écriture sur la plateforme Apidae en indiquant les prestataires
- de fournir les éléments suivants :
  - URL du flux API Geotrek
  - Numéro du projet créé sur la plateforme Apidae avec envoi des clef et secret Oauth
  - Pour chaque identifiant de structure Geotrek, fournir l'identifiant de l'ENT correspondant dans Apidae 

Version 1 financée par la [Région Sud](https://www.maregionsud.fr), développée par [IDfr](https://www.idfr.net) et [MEDIACTEURS](https://mediacteurs.net).
Depuis 2023, l'[agence WebSenso](https://www.websenso.com) héberge une instance qui synchronise quotidiennement une quinzaine d'instances vers Apidaé. 

## Installation

Outils nécessaires :

- NodeJS 15+
- Docker et Docker-compose

Créer la structure de dossier comme indiqué dans l'arbre en dessous :

```
├── paca-api
└── var
    └── data
        ├── geotrek
        └── town.csv
    ├── region.csv
```

Les fichiers `town.csv` et `region.csv` se trouvent dans le dossier `data` du projet, il faut les déplacer au bon endroit.

Dans le projet effectuer la commande d'installation : 

```
npm install
```

## Usage

Afin de procéder à l'import des données, il faut créer un compte utilisateur et initialiser le système d'import, 
pour cela se rendre sur cette page `http://URL/authentication/signup` et remplir le formulaire.

Effectuer ensuite à commande `npm run init-import`

Les imports peuvent être lancés automatiquement avec la commande `curl "URL/api/products/import?type=geotrek-api"`
