import { QueryTypes } from "sequelize";
import sequelize from "../../database";

interface Request {
  startDate: string;
  endDate: string;
  tenantId: string | number;
}

const query = `
SELECT
  label,
  qtd,
  ROUND(100.0 * (qtd / SUM(qtd) OVER ()), 2) AS pertentual
FROM (
  SELECT
    t.channel AS label,
    COUNT(1) AS qtd
  FROM
    Tickets t
  WHERE
    t.tenantId = :tenantId
    AND DATE(t.createdAt) BETWEEN :startDate AND :endDate
  GROUP BY
    t.channel
) a
ORDER BY
  qtd DESC`;

const DashTicketsChannels = async ({
  startDate,
  endDate,
  tenantId
}: Request): Promise<any[]> => {
  const data = await sequelize.query(query, {
    replacements: {
      tenantId,
      startDate,
      endDate
    },
    type: QueryTypes.SELECT
    // logging: console.log
  });
  return data;
};

export default DashTicketsChannels;
