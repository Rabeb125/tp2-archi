const sqlite3 = require('sqlite3').verbose();

// Connexion à la base de données SQLite
const db = new sqlite3.Database('./maBaseDeDonnees.sqlite', sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
    if (err) {
        console.error(err.message);
    } else {
        console.log('Connecté à la base de données SQLite.');
        
        // Modification de la table personnes pour ajouter la colonne "adresse"
        db.run(`CREATE TABLE IF NOT EXISTS personnes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nom TEXT NOT NULL,
            adresse TEXT, -- Ajout de la colonne "adresse"
            photo BLOB -- Ajout de la colonne "photo"
        )`, (err) => {
            if (err) {
                console.error(err.message);
            } else {
                console.log('Table "personnes" créée avec la colonne "adresse"et "photo".');
                
                // Insertion de données initiales
                const personnes = [
                    { nom: 'Bob', adresse: '123 Rue A', photo: null },
                    { nom: 'Alice', adresse: '456 Rue B' , photo: null },
                    { nom: 'Charlie', adresse: '789 Rue C' , photo: null }
                ];

                personnes.forEach(({ nom, adresse , photo }) => {
                    db.run(`INSERT INTO personnes (nom, adresse, photo) VALUES (?, ?, ?)`, [nom, adresse, photo]);
                });

                console.log('Données initiales insérées.');
            }
        });
    }
});

module.exports = db;
