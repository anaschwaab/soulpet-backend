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
const Pet = require("./database/pet");

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

// atualizar um cliente
app.put("/clientes/:id", async (req, res) => {
  // obter dados do corpo da requisão
  const { nome, email, telefone, endereco } = req.body;
  // obter identificação do cliente pelos parametros da rota
  const { id } = req.params;
  try {
    // buscar cliente pelo id passado
    const cliente = await Cliente.findOne({ where: { id } });
    // validar a existência desse cliente no banco de dados
    if(cliente) {
      // validar a existência desse do endereço passdo no corpo da requisição
      if(endereco) {
        await Endereco.update(endereco, { where: { clienteId: id } });
      }
      // atualizar o cliente com nome, email e telefone
      await cliente.update({nome, email, telefone});
      res.status(200).json({ message: "Cliente editado." });
    }
    else {
      res.status(404).json({ message: "Cliente não encontrado." });
    }
  }
  catch(err) {
    console.error(err)
    res.status(500).json({ message: "Um erro aconteceu." });
  }
});

// excluir um cliente
app.delete("/clientes/:id", async (req, res) => {
  // obter identificação do cliente pela rota
  const { id } = req.params;
  // buscar cliente por id
  const cliente = await Cliente.findOne({ where: { id } });
  try {
    if(cliente) {
      await cliente.destroy();
      res.status(200).json({ message: "Cliente removido." });
    }
    else {
      res.status(404).json({ message: "Cliente não encontrado." });
    }
  }
  catch(err) {
    console.error(err);
    res.status(500).json({ message: "Um erro aconteceu." });
  }
});

app.get("/pets", async (req, res) => {
  const listaPets = await Pet.findAll();
  res.json(listaPets);
});

app.get("/pets/:id", async (req, res) => {
  const { id } = req.params;

  const pet = await Pet.findByPk(id);
  if(pet) {
    res.json(pet);
  }
  else {
    res.status(404).json({ message: "Pet não encontrado." });
  }
});

app.post("/pets", async (req, res) => {
  const { nome, tipo, porte, dataNasc, clienteId } = req.body;

  try {
    const cliente = await Cliente.findByPk(clienteId);
    if(cliente) {
      const pet = await Pet.create({nome, tipo, porte, dataNasc, clienteId});
      res.status(201).json(pet);
    }
    else {
      res.status(404).json({ message: "Cliente não encontrado." });
    }
  }
  catch(err) {
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
