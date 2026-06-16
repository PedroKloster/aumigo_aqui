const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const pool = mysql.createPool({
    host: process.env.TIDB_HOST,
    user: process.env.TIDB_USER,
    password: process.env.TIDB_PASSWORD,
    database: process.env.TIDB_DATABASE,
    port: process.env.TIDB_PORT,
    ssl: {
        rejectUnauthorized: false
    }
});

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'aumigos',
        format: async (req, file) => 'png', 
        public_id: (req, file) => Date.now().toString(),
    },
});

const upload = multer({ storage: storage });

app.get('/api/caes', (req, res) => {
    pool.query('SELECT * FROM caes', (erro, resultados) => {
        if (erro) res.status(500).json({ erro: 'Erro ao buscar cães' });
        else res.json(resultados);
    });
});

app.post('/api/caes', upload.single('imagem'), (req, res) => {
    const dados = req.body;
    
    const caminhoImagem = req.file ? req.file.path : '';
    
    const idade = Number(dados.idade);
    let faseCalculada = 'Adulto';
    
    if (idade >= 0 && idade <= 2) {
        faseCalculada = 'Filhote';
    } else if (idade > 2 && idade <= 8) {
        faseCalculada = 'Adulto';
    } else if (idade > 8) {
        faseCalculada = 'Idoso';
    }

    const query = `INSERT INTO caes 
        (nome, porte, idade, fase, castrado, vacinado, raca, sexo, cidade, estado, descricao, imagem, adotado, dono, telefone, email) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    const valores = [
        dados.nome, dados.porte, dados.idade, faseCalculada,
        dados.castrado, dados.vacinado, dados.raca, dados.sexo,
        dados.cidade, dados.estado, dados.descricao, caminhoImagem,
        0, dados.dono, dados.telefone, dados.email
    ];

    pool.query(query, valores, (erro, resultados) => {
        if (erro) {
            console.error('Erro ao cadastrar:', erro);
            res.status(500).json({ erro: 'Erro ao salvar na base de dados.' });
        } else {
            res.status(201).json({ mensagem: 'Cão cadastrado com sucesso!' });
        }
    });
});

app.put('/api/caes/:id', (req, res) => {
    const id = req.params.id;
    const dados = req.body;

    const idade = Number(dados.idade);
    let faseCalculada = 'Adulto';
    
    if (idade >= 0 && idade <= 2) {
        faseCalculada = 'Filhote';
    } else if (idade > 2 && idade <= 8) {
        faseCalculada = 'Adulto';
    } else if (idade > 8) {
        faseCalculada = 'Idoso';
    }

    const query = 'UPDATE caes SET nome=?, porte=?, idade=?, fase=?, castrado=?, vacinado=?, raca=?, sexo=?, descricao=?, adotado=? WHERE id=?';

    const adotadoSQL = dados.adotado ? 1 : 0;

    const valores = [
        dados.nome, dados.porte, dados.idade, faseCalculada, 
        dados.castrado, dados.vacinado, dados.raca, dados.sexo, 
        dados.descricao, adotadoSQL, id
    ];

    pool.query(query, valores, (erro, resultados) => {
        if (erro) {
            console.error('Erro ao atualizar:', erro);
            res.status(500).json({ erro: 'Erro ao atualizar a base de dados' });
        } else {
            res.json({ mensagem: 'Aumigo atualizado com sucesso!' });
        } 
    });
});

app.delete('/api/caes/:id', (req, res) => {
    const id = req.params.id;

    const query = 'DELETE FROM caes WHERE id = ?';

    pool.query(query, [id], (erro, resultados) => {
        if (erro) {
            console.error('Erro ao deletar:', erro);
            res.status(500).json({ erro: 'Erro ao deletar na base de dados' });
        } else {
            res.json({ mensagem: 'Post do Aumigo apagado.' });
        }
    });
});

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
