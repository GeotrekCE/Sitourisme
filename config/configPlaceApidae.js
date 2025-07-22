const placeApidae = (lieuTxt) => {
    const places = {
        'Maison de la Vallée du Champsaur, Pont-du-Fossé':                  27213, // Maison du Parc national des Ecrins - Champsaur
        'Maison du Parc national des Ecrins, Châteauroux-les-Alpes':        10721, // Maison du Parc national des Ecrins - Embrunais
        'Maison du Parc national des Ecrins, Briançon':                     10727, //Maison du Parc national des Ecrins - Briançonnais
        'Maison du Parc national des Ecrins, Entraigues':                   27215, //Maison du Parc national des Ecrins - Valbonnais
        'Maison du Parc national des Ecrins, La Chapelle-en-Valgaudemar':   27214, //Maison du Parc national des Ecrins - Valgaudemar
        'Maison du Parc national des Ecrins, Le Bourg d’Oisans':            27211, // Maison du Parc national des Ecrins - Oisans
        'Maison du Parc national des Ecrins, Vallouise':                    8421,  //Maison du parc national des Ecrins - Vallouise
    }
    return places[lieuTxt] || null
}

module.exports = { placeApidae }