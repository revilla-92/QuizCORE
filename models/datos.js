// Definicion del modelo de Quiz con validación

module.exports = function(sequelize, DataTypes) {
  return sequelize.define(
    'Datos',
    { numPreguntas: {
        type: DataTypes.INTEGER
    },
      numComentarios: {
        type: DataTypes.INTEGER
      },
      numMedio: {
        type: DataTypes.INTEGER
      },
      numPreguntasSin: {
        type: DataTypes.INTEGER
      },
      numPreguntasCon: {
        type: DataTypes.INTEGER
      }
    }
  );
}