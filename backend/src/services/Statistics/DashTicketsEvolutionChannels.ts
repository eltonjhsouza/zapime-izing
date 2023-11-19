import { QueryTypes } from "sequelize";
import sequelize from "../../database";

interface Request {
  startDate: string;
  endDate: string;
  tenantId: string | number;
}

const query = `
SELECT
  DATE(t.createdAt) AS dt_ref,
  DATE_FORMAT(t.createdAt, '%d/%m/%Y') AS dt_referencia,
  t.channel AS label,
  COUNT(1) AS qtd,
  ROUND(100.0 * (COUNT(1) / SUM(COUNT(1)) OVER ()), 2) AS pertentual
FROM
  Tickets t
WHERE
  t.tenantId = :tenantId
  AND DATE(t.createdAt) BETWEEN :startDate AND :endDate
GROUP BY
  DATE(t.createdAt),
  t.channel
ORDER BY
  dt_ref`;

const DashTicketsEvolutionChannels = async ({
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

export default DashTicketsEvolutionChannels;
