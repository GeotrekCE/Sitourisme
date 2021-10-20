#!/bin/bash

#Add Langage here :) - LS
echo "##########################################"
echo "##########################################"
date
lang="fr en it de es nl";
scriptLocation="/srv/data-paca/www/paca.sitourisme.fr/api/var/data/import/geotrek/";

echo "Get Geotrek files for "$lang;

#Get datetrek
echo "_______________________________";

date +%F > "/srv/data-paca/www/paca.sitourisme.fr/api/var/data/import/geotrek/randoEcrins_dateTrek.tmp"
if [[ ! -f "/srv/data-paca/www/paca.sitourisme.fr/api/var/data/import/geotrek/randoEcrins_dateTrek" ]]
	then
	if [[ -f "/srv/data-paca/www/paca.sitourisme.fr/api/var/data/import/geotrek/randoEcrins_dateTrek.tmp" ]]
		then
		echo "no randoEcrins_datetrek, new tmp randoEcrins_datetrek, import";
		mv /srv/data-paca/www/paca.sitourisme.fr/api/var/data/import/geotrek/randoEcrins_dateTrek.tmp /srv/data-paca/www/paca.sitourisme.fr/api/var/data/import/geotrek/randoEcrins_dateTrek
	else
		echo "no randoEcrins_datetrek, no tmp randoEcrins_datetrek, abort";
		exit
	fi
else
	if [[ -f "/srv/data-paca/www/paca.sitourisme.fr/api/var/data/import/geotrek/randoEcrins_dateTrek.tmp" ]]
                then
		echo "compare"
		if ! cmp -s /srv/data-paca/www/paca.sitourisme.fr/api/var/data/import/geotrek/randoEcrins_dateTrek.tmp /srv/data-paca/www/paca.sitourisme.fr/api/var/data/import/geotrek/randoEcrins_dateTrek
			then
			echo "files differents, import"
			mv /srv/data-paca/www/paca.sitourisme.fr/api/var/data/import/geotrek/randoEcrins_dateTrek.tmp /srv/data-paca/www/paca.sitourisme.fr/api/var/data/import/geotrek/randoEcrins_dateTrek
		else
			echo "randoEcrins_datetrek and tmp randoEcrins_datetrek files are equals, abort"
			rm /srv/data-paca/www/paca.sitourisme.fr/api/var/data/import/geotrek/randoEcrins_dateTrek.tmp
			exit
		fi
	else
		"no tmp randoEcrins_datetrek, abort";
		exit
	fi
fi
echo "_______________________________";
echo "_______________________________";
#Remove current geojson
rm "/srv/data-paca/www/paca.sitourisme.fr/api/var/data/import/geotrek/"*".geojson";

#Get geojson

## First, get randoEcrins files
for i in $lang;
	do
	if [[ `wget --no-check-certificate -S --spider "https://rando.ecrins-parcnational.fr/api/"$i"/treks.geojson"  2>&1 | grep 'HTTP/1.1 200 OK'` ]];
		then
		if [[ "$i" = "fr"  ]]
			then
			echo "Get fr file";
			wget --no-check-certificate -O "/srv/data-paca/www/paca.sitourisme.fr/api/var/data/import/geotrek/randoEcrinstreks.geojson" "https://rando.ecrins-parcnational.fr/api/fr/treks.geojson";
			canImport=1
		else
			echo "Get "$i" file";
			wget --no-check-certificate -O "/srv/data-paca/www/paca.sitourisme.fr/api/var/data/import/geotrek/randoEcrinstreks_"$i".geojson" "https://rando.ecrins-parcnational.fr/api/"$i"/treks.geojson";
		fi
	else
		echo "randoEcrins: no file online for "$i
	fi
	echo "_______________________________";
done

echo "_______________________________";

## Second, get cheminDesParcs files
for i in $lang;
	do
	if [[ `wget --no-check-certificate -S --spider "https://www.cheminsdesparcs.fr/api/"$i"/treks.geojson"  2>&1 | grep 'HTTP/1.1 200 OK'` ]];
		then
		if [[ "$i" = "fr"  ]]
			then
			echo "Get fr file";
			wget --no-check-certificate -O "/srv/data-paca/www/paca.sitourisme.fr/api/var/data/import/geotrek/cheminDesParcstreks.geojson" "https://www.cheminsdesparcs.fr/api/fr/treks.geojson";
			canImport=1
		else
			echo "Get "$i" file";
			wget --no-check-certificate -O "/srv/data-paca/www/paca.sitourisme.fr/api/var/data/import/geotrek/cheminDesParcstreks_"$i".geojson" "https://www.cheminsdesparcs.fr/api/"$i"/treks.geojson";
		fi
	else
		echo "cheminDesParcs: no file online for "$i
	fi
	echo "_______________________________";
done

echo "_______________________________";

## Third, get rando sisteron buech
for i in $lang;
	do
	if [[ `wget --no-check-certificate -S --spider "https://rando.sisteron-buech.fr/api/"$i"/treks.geojson"  2>&1 | grep 'HTTP/1.1 200 OK'` ]];
		then
		if [[ "$i" = "fr"  ]]
			then
			echo "Get fr file";
			wget --no-check-certificate -O "/srv/data-paca/www/paca.sitourisme.fr/api/var/data/import/geotrek/randoSisterontreks.geojson" "https://rando.sisteron-buech.fr/api/fr/treks.geojson";
			canImport=1
		else
			echo "Get "$i" file";
			wget --no-check-certificate -O "/srv/data-paca/www/paca.sitourisme.fr/api/var/data/import/geotrek/randoSisterontreks_"$i".geojson" "https://rando.sisteron-buech.fr/api/"$i"/treks.geojson";
		fi
	else
		echo "Rando Sisteron: no file online for "$i
	fi
	echo "_______________________________";
done

echo "_______________________________";

# Fourth, get rando portcros
for i in $lang;
	do
	if [[ `wget --no-check-certificate -S --spider "https://destination.portcros-parcnational.fr/api/"$i"/treks.geojson"  2>&1 | grep 'HTTP/1.1 200 OK'` ]];
		then
		if [[ "$i" = "fr"  ]]
			then
			echo "Get fr file";
			wget --no-check-certificate -O "/srv/data-paca/www/paca.sitourisme.fr/api/var/data/import/geotrek/randoPortCrostreks.geojson" "https://destination.portcros-parcnational.fr/api/fr/treks.geojson";
			canImport=1
		else
			echo "Get "$i" file";
			wget --no-check-certificate -O "/srv/data-paca/www/paca.sitourisme.fr/api/var/data/import/geotrek/randoPortCrostreks_"$i".geojson" "https://destination.portcros-parcnational.fr/api/"$i"/treks.geojson";
		fi
	else
		echo "Rando Portcros: no file online for "$i
	fi
	echo "_______________________________";
done

echo "_______________________________";

# Fifthly, get Rando Alpes
for i in $lang;
	do
	if [[ `wget --no-check-certificate -S --spider "https://geotrek-admin.alpesrando.net/api/"$i"/treks.geojson"  2>&1 | grep 'HTTP/1.1 200 OK'` ]];
		then
		if [[ "$i" = "fr"  ]]
			then
			echo "Get fr file";
			wget --no-check-certificate -O "/srv/data-paca/www/paca.sitourisme.fr/api/var/data/import/geotrek/randoAlpes.geojson" "https://geotrek-admin.alpesrando.net/api/fr/treks.geojson";
			canImport=1
		else
			echo "Get "$i" file";
			wget --no-check-certificate -O "/srv/data-paca/www/paca.sitourisme.fr/api/var/data/import/geotrek/randoAlpes_"$i".geojson" "https://geotrek-admin.alpesrando.net/api/"$i"/treks.geojson";
		fi
	else
		echo "Rando Alpes: no file online for "$i
	fi
	echo "_______________________________";
done

echo "_______________________________";

# Sixtly , get Rando Alpes Haute Provence
for i in $lang;
	do
	if [[ `wget --no-check-certificate -S --spider "https://www.rando-alpes-haute-provence.fr/api/"$i"/treks.geojson"  2>&1 | grep 'HTTP/1.1 200 OK'` ]];
		then
		if [[ "$i" = "fr"  ]]
			then
			echo "Get fr file";
			wget --no-check-certificate -O "/srv/data-paca/www/paca.sitourisme.fr/api/var/data/import/geotrek/randoAlpesHauteProvence.geojson" "https://www.rando-alpes-haute-provence.fr/api/fr/treks.geojson";
			canImport=1
		else
			echo "Get "$i" file";
			wget --no-check-certificate -O "/srv/data-paca/www/paca.sitourisme.fr/api/var/data/import/geotrek/randoAlpesHauteProvence_"$i".geojson" "https://www.rando-alpes-haute-provence.fr/api/"$i"/treks.geojson";
		fi
	else
		echo "Rando Alpes Haute Provence: no file online for "$i
	fi
	echo "_______________________________";
done

# Sevently , get rando Mercantour
for i in $lang;
	do
	if [[ `wget --no-check-certificate -S --spider "https://rando.marittimemercantour.eu/api/"$i"/treks.geojson"  2>&1 | grep 'HTTP/1.1 200 OK'` ]];
		then
		if [[ "$i" = "fr"  ]]
			then
			echo "Get fr file";
			wget --no-check-certificate -O "/srv/data-paca/www/paca.sitourisme.fr/api/var/data/import/geotrek/randoMercantour.geojson" "https://rando.marittimemercantour.eu/api/fr/treks.geojson";
			canImport=1
		else
			echo "Get "$i" file";
			wget --no-check-certificate -O "/srv/data-paca/www/paca.sitourisme.fr/api/var/data/import/geotrek/randoMercantour_"$i".geojson" "https://rando.marittimemercantour.eu/api/"$i"/treks.geojson";
		fi
	else
		echo "Rando Mercantour: no file online for "$i
	fi
	echo "_______________________________";
done

echo "_______________________________";

# launch import
if [[ "$canImport" = 1 ]]
	then
	echo "We can import";

	echo "_______________________________";
    #Dealing with lastUpdate date
    if [[ -f $scriptLocation"dateScriptTmp" ]]
        then
        lastUpdate=`cat $scriptLocation"dateScriptTmp"`
        echo "Last time this script worked : "$lastUpdate" mv it to dateScript before curl"
        mv $scriptLocation"dateScriptTmp" $scriptLocation"dateScript"
    else
        echo "First time."
    fi
    #Generate dateScriptTmp
    currentDate=`date +%Y-%m-%d`
    echo $currentDate > $scriptLocation"dateScriptTmp"

	curl "api.paca.sitourisme.fr/api/products/import?type=geotrek"
else
	echo "no import today";
fi


