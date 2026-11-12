# MC Remorquage — crédits, licences et points à compléter

Site 100 % statique (HTML / CSS / JS), sans back-end ni abonnement : rien à payer pour le faire tourner.
Ouvrir `index.html` suffit pour le voir en local ; pour le mettre en ligne, déposer le dossier tel quel.

## Données de l'entreprise
- Fiche Google Maps « MC REMORQUAGE » : adresse, téléphone, ouvert 24h/24 7j/7, note 5,0 (20 avis, relevée le 07/11/2026), 5 avis texte repris (noms abrégés).
- Registre Sirene (recherche-entreprises.api.gouv.fr) : Christophe Murcia, entrepreneur individuel, SIREN 489 440 453, SIRET 489 440 453 00079, APE 52.21Z, immatriculé le 30/03/2006 — repris dans les mentions légales.
- Contenus du site (services, zones 04/05/13/83/84, « Votre mobilité, notre priorité ») : maquette fournie par le client. Précisions du client : deux camions (plateau coulissant pour les belles voitures, plateau à rampe pour les épaves), achat-revente de voitures, enlèvement d'épaves gratuit sous condition d'appeler.

## Médias
- Photos réelles fournies par le client : `truck-hero.jpg` (plateau coulissant et BMW, accueil), `card-epave.jpg` (plateau à rampe et voiture accidentée, recadrage de la photo d'origine pour la carte « Enlèvement d'épaves »), `truck-livraison.jpg` (plateau coulissant et Mustang, étape « On vous dépose »). `mc-mustang-plateau.jpg` vient de la fiche Google de l'entreprise.
- Images d'ambiance `card-*.jpg` (sauf `card-epave.jpg`, photo réelle), `gal-*.jpg`, `story-arrive.jpg`, `cta-nuit.jpg` : générées par intelligence artificielle (Higgsfield, modèle Nano Banana Pro, génération « Unlimited », aucun crédit consommé) à partir des photos réelles des deux camions, placés dans d'autres décors. Mention affichée sur le site (pied de page, mentions légales, note sous la galerie). Les inscriptions des camions sont celles des photos d'origine ; à contrôler à chaque nouvelle génération.
- Plus aucune photo ni vidéo de banque libre de droits sur le site.

## Technique (tout est hébergé dans `assets/`)
- GSAP 3.12.5 + ScrollTrigger (licence GSAP, gratuite), Lenis 1.1.18 (MIT), qrcode-generator 1.4.4 (MIT).
- Polices : Big Shoulders Display et Barlow (SIL Open Font License), hébergées localement (pas d'appel à Google Fonts).
- Contours des départements : gregoiredavid/france-geojson (données IGN / Etalab, Licence Ouverte).

## Réservation sans abonnement
Le formulaire prépare la demande sur l'appareil du client :
- téléphone : bouton « Envoyer par SMS » → l'appli SMS s'ouvre avec le message déjà rédigé au 06 28 15 23 67 (il ne reste qu'à appuyer sur Envoyer) ;
- ordinateur : un QR code à scanner ouvre ce même SMS sur le téléphone ;
- « Par e-mail » → `christophemurcia64@gmail.com` ; « Copier » ; fichier agenda `.ics` si un créneau est planifié ;
- enlèvement d'épave : le formulaire rappelle que la condition de gratuité est d'appeler, avec un bouton d'appel.

## À compléter / vérifier
1. Mentions « Sans péage » et « Paiement sécurisé » de la maquette : non reprises (sens à confirmer avec Christophe).
2. Page Facebook : aucune page trouvée, donc aucun lien.
3. Hébergeur : à ajouter aux mentions légales (GitHub Pages si le site reste sur GitHub).
4. Tarifs : aucun prix public trouvé ; le site dit « sur devis » (seul l'enlèvement d'épave est annoncé gratuit, sur appel).
5. Remplacer à terme les décors générés par de vraies photos de Christophe sur ses interventions.
