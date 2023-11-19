import { QueryTypes } from "sequelize";
import sequelize from "../../database";

interface Request {
  startDate: string;
  endDate: string;
  tenantId: string | number;
}

const query = `
SELECT
  --dt_referencia,
  SUM(qtd_total_atendimentos) AS qtd_total_atendimentos,
  SUM(qtd_demanda_ativa) AS qtd_demanda_ativa,
  SUM(qtd_demanda_receptiva) AS qtd_demanda_receptiva,
  SEC_TO_TIME(AVG(tma)*60) AS TMA,
  SEC_TO_TIME(AVG(tme)*60) AS TME,
  (SELECT COUNT(1)
   FROM Contacts c 
   WHERE c.tenantId = :tenantId
     AND DATE(c.createdAt) BETWEEN :startDate AND :endDate
  ) AS new_contacts
FROM (
  SELECT
    DATE_FORMAT(t.createdAt, '%Y-%m-01') AS dt_referencia,
    1 AS qtd_total_atendimentos,
    CASE WHEN t.isActiveDemand IS TRUE THEN 1 ELSE 0 END AS qtd_demanda_ativa,
    CASE WHEN t.isActiveDemand IS NOT TRUE THEN 1 ELSE 0 END AS qtd_demanda_receptiva,
    t.createdAt,
    FROM_UNIXTIME(t.closedAt/1000) AS closedAt,
    FROM_UNIXTIME(t.startedAttendanceAt/1000) AS startedAttendanceAt,
    TIMESTAMPDIFF(MINUTE, t.createdAt, FROM_UNIXTIME(t.closedAt/1000)) AS tma,
    TIMESTAMPDIFF(MINUTE, t.createdAt, FROM_UNIXTIME(t.startedAttendanceAt/1000)) AS tme,
    t.tenantId
  FROM
    Tickets t
  WHERE
    t.tenantId = :tenantId
    AND DATE(t.createdAt) BETWEEN :startDate AND :endDate
) a
ORDER BY
  1 DESC`;

const DashTicketsAndTimes = async ({
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
  });
  return data;
};

export default DashTicketsAndTimes;
