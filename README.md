# PACA-API

Outil nécéssaire :
- NodeJS 14+
- Docker et docker-compose

## installation

Créer la structure de dossier comme indiqué dans l'arbre en dessous :

```
├── paca-api
└── var
    └── data
        ├── geotrek
        └── town.csv
    ├── region.csv
```

Les fichiers town.csv et region.csv se trouve dans le dossier data du projet, il faut les déplacer au bon endroit.

Dans le projet effectuer la commande d'installation : 

npm install
```

## Usage

Afin de procéder à l'import des données il faut créer un compte utilisateur et intialiser le système d'import, 
pour cela se rendre sur cette page `http://localhost:3003/authentication/signup` et remplir le formulaire

Effectuer ensuite à commande `npm run init-import`

Les imports peuvent maintenant être effectué depuis l'interface.
