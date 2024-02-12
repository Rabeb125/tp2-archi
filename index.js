const express = require('express');
const fileUpload = require('express-fileupload');
const path = require('path');
const fs = require('fs');
const db = require('./database');

const app = express();
app.use(express.json());
app.use(fileUpload());

const PORT = 3000;

app.get('/', (req, res) => {
    res.json("Registre de personnes! Choisissez le bon routage!");
});

// Récupérer toutes les personnes
app.get('/personnes', (req, res) => {
    db.all("SELECT * FROM personnes", [], (err, rows) => {
        if (err) {
            res.status(400).json({
                "error": err.message
            });
            return;
        }
        res.json({
            "message": "success",
            "data": rows
        });
    });
});

// Récupérer une personne par ID
app.get('/personnes/:id', (req, res) => {
    const id = req.params.id;
    db.get("SELECT * FROM personnes WHERE id = ?", [id], (err, row) => {
        if (err) {
            res.status(400).json({
                "error": err.message
            });
            return;
        }
        res.json({
            "message": "no data",
            "data": row
        });
    });
});

// Créer une nouvelle personne avec nom, adresse, et photo
app.post('/personnes', (req, res) => {
    const { nom, adresse } = req.body;

    if (!nom) {
        res.status(400).json({
            "error": "Le nom est requis."
        });
        return;
    }

    if (!req.files || Object.keys(req.files).length === 0) {
        res.status(400).json({
            "error": "Aucun fichier n'a été téléchargé."
        });
        return;
    }

    const photo = req.files.photo;
    const fileExtension = path.extname(photo.name);
    const fileName = `${Date.now()}${fileExtension}`;
    const uploadPath = path.join(__dirname, 'uploads', fileName);

    photo.mv(uploadPath, (err) => {
        if (err) {
            res.status(500).json({
                "error": err.message
            });
            return;
        }

        db.run(`INSERT INTO personnes (nom, adresse, photo) VALUES (?, ?, ?)`, [nom, adresse, uploadPath], function (err) {
            if (err) {
                res.status(400).json({
                    "error": err.message
                });
                return;
            }
            res.json({
                "message": "success",
                "data": {
                    id: this.lastID
                }
            });
        });
    });
});

// Mettre à jour une personne, son adresse, et sa photo
app.put('/personnes/:id', (req, res) => {
    const id = req.params.id;
    const { nom, adresse } = req.body;

    // Vérifie si l'adresse est fournie dans la requête
    if (!nom || !adresse) {
        res.status(400).json({
            "error": "Le nom et l'adresse sont requis."
        });
        return;
    }

    if (!req.files || Object.keys(req.files).length === 0) {
        res.status(400).json({
            "error": "Aucun fichier n'a été téléchargé."
        });
        return;
    }

    const photo = req.files.photo;
    const fileExtension = path.extname(photo.name);
    const fileName = `${Date.now()}${fileExtension}`;
    const uploadPath = path.join(__dirname, 'uploads', fileName);

    photo.mv(uploadPath, (err) => {
        if (err) {
            res.status(500).json({
                "error": err.message
            });
            return;
        }

        db.run(`UPDATE personnes SET nom = ?, adresse = ?, photo = ? WHERE id = ?`, [nom, adresse, uploadPath, id], function (err) {
            if (err) {
                res.status(400).json({
                    "error": err.message
                });
                return;
            }

            res.json({
                "message": "success"
            });
        });
    });
});

// Supprimer une personne
app.delete('/personnes/:id', (req, res) => {
    const id = req.params.id;
    db.run(`DELETE FROM personnes WHERE id = ?`, id, function (err) {
        if (err) {
            res.status(400).json({
                "error": err.message
            });
            return;
        }
        res.json({
            "message": "success"
        });
    });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
