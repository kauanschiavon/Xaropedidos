const db = require("../config/db");

const CaixaModel = {
  buscarAberto: async () => {
    const [rows] = await db.query(
      'SELECT * FROM caixa WHERE status = "aberto" LIMIT 1',
    );
    return rows[0];
  },

  buscarPorId: async (id) => {
    const [rows] = await db.query("SELECT * FROM caixa WHERE id = ?", [id]);
    return rows[0];
  },

  abrir: async (caixa) => {
    const { valor } = caixa;
    const [result] = await db.query(
      'INSERT INTO caixa (horario_abertura, valor, status) VALUES (NOW(), ?, "aberto")',
      [valor],
    );
    return result.insertId;
  },

  fechar: async (id) => {
    await db.query(
      'UPDATE caixa SET horario_fechamento = NOW(), status = "fechado" WHERE id = ?',
      [id],
    );
  },

  adicionarSaldo: async (id, valor) => {
    await db.query("UPDATE caixa SET valor = valor + ? WHERE id = ?", [
      valor,
      id,
    ]);
  },

  calcularTotalPorForma: async (idCaixa) => {
    const [rows] = await db.query(
      `
            SELECT forma, SUM(valor_total) as total
            FROM pagamento
            WHERE id_caixa = ?
            GROUP BY forma
        `,
      [idCaixa],
    );
    return rows;
  },
};

module.exports = CaixaModel;
