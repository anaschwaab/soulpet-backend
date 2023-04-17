const { DataTypes } = require("sequelize");
const { connection } = require("./database");

const Endereco = connection.define("endereco", {
  uf: {
    type: DataTypes.STRING(2),
    allowNull: false,
  },
  cidade: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  cep: {
    type: DataTypes.STRING(9),
    allowNull: false,
  },
  rua: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  numero: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

module.exports = Endereco;
