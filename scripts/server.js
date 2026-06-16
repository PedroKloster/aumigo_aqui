const express = require('express');
const mysql = require('mysql2');

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

module.exports = pool;
const cors = require('cors');
const multer = require('multer');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

const armazenamento = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, '../uploads'));
    },
    filename: function (req, file, cb) {
        const extensao = path.extname(file.originalname);
        cb(null, Date.now() + extensao); 
    }
});

const upload = multer({ storage: armazenamento });

const conexao = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '123456', 
    database: 'aumigo_aqui' 
});

conexao.connect((erro) => {
    if (erro) console.error('Erro ao conectar ao MySQL:', erro);
    else console.log('Conectado ao banco de dados MySQL com sucesso!');
});

app.get('/api/caes', (req, res) => {
    conexao.query('SELECT * FROM caes', (erro, resultados) => {
        if (erro) res.status(500).json({ erro: 'Erro ao buscar cães' });
        else res.json(resultados);
    });
});

app.post('/api/caes', upload.single('imagem'), (req, res) => {
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

    const caminhoImagem = req.file ? `http://localhost:3000/uploads/${req.file.filename}` : '';

    const query = `INSERT INTO caes 
        (nome, porte, idade, fase, castrado, vacinado, raca, sexo, cidade, estado, descricao, imagem, adotado, dono, telefone, email) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    const valores = [
        dados.nome, dados.porte, dados.idade, faseCalculada,
        dados.castrado, dados.vacinado, dados.raca, dados.sexo,
        dados.cidade, dados.estado, dados.descricao, caminhoImagem,
        0, dados.dono, dados.telefone, dados.email
    ];

    conexao.query(query, valores, (erro, resultados) => {
        if (erro) {
            console.error(erro);
            res.status(500).json({ erro: 'Erro ao salvar no banco de dados.' });
        } else {
            res.status(201).json({ mensagem: 'Cão cadastrado com sucesso!' });
        }
    });
});

app.put('/api/caes/:id', (req, res) =>{
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

    conexao.query(query, valores, (erro, resultados) => {
        if(erro){
            console.error('Erro ao atualizar:', erro);
            res.status(500).json({erro: 'Erro ao atualizar o banco de dados'});
        } else{
            res.json({mensagem: 'Aumigo updated!'});
        } 
    });
});

app.delete('/api/caes/:id', (req, res) => {
    const id = req.params.id;

    const query = 'DELETE FROM caes WHERE id = ?';

    conexao.query(query, [id], (erro, resultados) => {
        if (erro) {
            console.error('Erro ao deletar:', erro);
            res.status(500).json({ erro: 'Erro ao deletar no banco de dados' });
        } else {
            res.json({ mensagem: 'Post de Aumigo deletado com sucesso.' });
        }
    });
});

app.listen(porta, () => {
    console.log(`Servidor rodando na porta http://localhost:${porta}`);
});