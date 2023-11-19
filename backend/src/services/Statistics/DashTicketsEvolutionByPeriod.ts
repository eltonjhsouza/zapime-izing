import { QueryTypes } from "sequelize";
import sequelize from "../../database";

interface Request {
  startDate: string;
  endDate: string;
  tenantId: string | number;
}

const query = `
SELECT
  dt_ref,
  DATE_FORMAT(dt_ref, '%d/%m/%Y') AS label,
  qtd
FROM (
  SELECT
    DATE(t.createdAt) AS dt_ref,
    COUNT(1) AS qtd
  FROM
    Tickets t
  WHERE
    t.tenantId = :tenantId
    AND DATE(t.createdAt) BETWEEN :startDate AND :endDate
  GROUP BY
    DATE(t.createdAt)
) a
ORDER BY
  dt_ref`;

const DashTicketsEvolutionByPeriod = async ({
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

export default DashTicketsEvolutionByPeriod;
