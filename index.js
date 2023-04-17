// Importações principais e variáveis de ambiente
require("dotenv").config();
const express = require("express");

// Configuração do App
const app = express();
app.use(express.json()); // Possibilitar transitar dados usando JSON

// Configuração do Banco de Dados
const { connection, authenticate } = require("./database/database");
authenticate(connection); // efetivar a conexão
const Cliente = require("./database/cliente"); // Configurar o model da aplicação
const Endereco = require("./database/endereco");

// Definição de rotas
app.get("/clientes", async (req, res) => {
  // SELECT * FROM clientes;
  const listaClientes = await Cliente.findAll();
  res.json(listaClientes);
});

// /clientes/1, 2
app.get("/clientes/:id", async (req, res) => {
  // SELECT * FROM clientes WHERE id = 1;
  const cliente = await Cliente.findOne({
    where: { id: req.params.id },
    include: [Endereco], // trás junto os dados de endereço
  });

  if (cliente) {
    res.json(cliente);
  } else {
    res.status(404).json({ message: "Usuário não encontrado." });
  }
});

app.post("/clientes", async (req, res) => {
  // Coletar os dados do req.body
  const { nome, email, telefone, endereco } = req.body;

  try {
    // Dentro de 'novo' estará o o objeto criado
    const novo = await Cliente.create(
      { nome, email, telefone, endereco },
      { include: [Endereco] }
    );

    res.status(201).json(novo);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Um erro aconteceu." });
  }
});

// Escuta de eventos (listen)
app.listen(3000, () => {
  // Gerar as tabelas a partir do model
  // Force = apaga tudo e recria as tabelas
  connection.sync({ force: true });
  console.log("Servidor rodando em http://localhost:3000/");
});
