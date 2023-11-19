/* eslint-disable eqeqeq */
import { QueryTypes } from "sequelize";
// import { startOfDay, endOfDay, parseISO } from "date-fns";

import Ticket from "../../models/Ticket";
import UsersQueues from "../../models/UsersQueues";
import AppError from "../../errors/AppError";
import Queue from "../../models/Queue";
// import ListSettingsService from "../SettingServices/ListSettingsService";
// import Queue from "../../models/Queue";
// import ListSettingsService from "../SettingServices/ListSettingsService";

interface Request {
  searchParam?: string;
  pageNumber?: string;
  status?: string[];
  date?: string;
  showAll?: string;
  userId: string;
  withUnreadMessages?: string;
  isNotAssignedUser?: string;
  queuesIds?: string[];
  includeNotQueueDefined?: string;
  tenantId: string | number;
  profile: string;
}

interface Response {
  tickets: any[];
  count: number;
  hasMore: boolean;
}

const ListTicketsService = async ({
  searchParam = "",
  pageNumber = "1",
  status,
  date,
  showAll,
  userId,
  withUnreadMessages,
  queuesIds,
  isNotAssignedUser,
  includeNotQueueDefined,
  tenantId,
  profile
}: Request): Promise<Response> => {
  console.log(date, includeNotQueueDefined);
  // check is admin
  const isAdminShowAll = showAll == "true" && profile === "admin";
  const isUnread =
    withUnreadMessages && withUnreadMessages == "true" ? "S" : "N";
  const isNotAssigned =
    isNotAssignedUser && isNotAssignedUser == "true" ? "S" : "N";
  const isShowAll = isAdminShowAll ? "S" : "N";
  const isQueuesIds = queuesIds ? "S" : "N";

  const isSearchParam = searchParam ? "S" : "N";

  // // tratar as configurações do sistema
  // const settings = await ListSettingsService(tenantId);
  // const isNotViewAssignedTickets =
  //   settings?.find(s => {
  //     return s.key === "NotViewAssignedTickets";
  //   })?.value === "enabled"
  //     ? "S"
  //     : "N";

  if (!status && !isAdminShowAll) {
    // if not informed status and not admin, reject request
    // status = ["open", "pending"];
    throw new AppError("ERR_NO_STATUS_SELECTED", 404);
  }

  if (isAdminShowAll) {
    status = ["open", "pending", "closed"];
  }

  // Verificar se existem filas cadastradas, caso contrário,
  // não aplicar restrição
  const isExistsQueueTenant =
    (await Queue.count({
      where: { tenantId }
    })) > 0
      ? "S"
      : "N";
  // list queues user request
  const queues = await UsersQueues.findAll({
    where: {
      userId
    }
  });

  // mount array ids queues
  let queuesIdsUser = queues.map(q => q.queueId);
  // check is queues filter and verify access user queue
  if (queuesIds) {
    const newArray: number[] = [];
    queuesIds.forEach(i => {
      const idx = queuesIdsUser.indexOf(+i);
      if (idx) {
        newArray.push(+i);
      }
    });
    queuesIdsUser = newArray.length ? newArray : [0];
  }
  // se não existir fila, ajustar para parse do sql
  if (!queuesIdsUser.length) {
    queuesIdsUser = [0];
  }

  //   const query = `
  //   select
  //   "Ticket" .*,
  //   "contact"."id" as "contact.id",
  //   "contact"."name" as "contact.name",
  //   "contact"."number" as "contact.number",
  //   "contact"."profilePicUrl" as "contact.profilePicUrl",
  //   "contact->extraInfo"."id" as "contact.extraInfo.id",
  //   "contact->extraInfo"."name" as "contact.extraInfo.name",
  //   "contact->extraInfo"."value" as "contact.extraInfo.value",
  //   "contact->extraInfo"."contactId" as "contact.extraInfo.contactId",
  //   "contact->extraInfo"."createdAt" as "contact.extraInfo.createdAt",
  //   "contact->extraInfo"."updatedAt" as "contact.extraInfo.updatedAt",
  //   "contact->tags"."id" as "contact.tags.id",
  //   "contact->tags"."tag" as "contact.tags.tag",
  //   "contact->tags"."color" as "contact.tags.color",
  //   "contact->tags"."isActive" as "contact.tags.isActive",
  //   "contact->tags"."userId" as "contact.tags.userId",
  //   "contact->tags"."tenantId" as "contact.tags.tenantId",
  //   "contact->tags"."createdAt" as "contact.tags.createdAt",
  //   "contact->tags"."updatedAt" as "contact.tags.updatedAt",
  //   "contact->tags->ContactTag"."id" as "contact.tags.ContactTag.id",
  //   "contact->tags->ContactTag"."contactId" as "contact.tags.ContactTag.contactId",
  //   "contact->tags->ContactTag"."tagId" as "contact.tags.ContactTag.tagId",
  //   "contact->tags->ContactTag"."tenantId" as "contact.tags.ContactTag.tenantId",
  //   "contact->tags->ContactTag"."createdAt" as "contact.tags.ContactTag.createdAt",
  //   "contact->tags->ContactTag"."updatedAt" as "contact.tags.ContactTag.updatedAt",
  //   "contact->wallets"."id" as "contact.wallets.id",
  //   "contact->wallets"."name" as "contact.wallets.name",
  //   "contact->wallets->ContactWallet"."id" as "contact.wallets.ContactWallet.id",
  //   "contact->wallets->ContactWallet"."contactId" as "contact.wallets.ContactWallet.contactId",
  //   "contact->wallets->ContactWallet"."walletId" as "contact.wallets.ContactWallet.walletId",
  //   "contact->wallets->ContactWallet"."tenantId" as "contact.wallets.ContactWallet.tenantId",
  //   "contact->wallets->ContactWallet"."createdAt" as "contact.wallets.ContactWallet.createdAt",
  //   "contact->wallets->ContactWallet"."updatedAt" as "contact.wallets.ContactWallet.updatedAt",
  //   "user"."id" as "user.id",
  //   "user"."name" as "user.name",
  //   "user"."profile" as "user.profile"
  //   from
  //   (
  //   select
  //   count(*) OVER ( ) as count,
  //   *
  //   from "Tickets" t
  //   where "tenantId" = :tenantId
  //   and t.status in ( :status )
  //   and (( :isShowAll = 'N' and  (
  //     (t."queueId" in ( :queuesIdsUser ))
  //     or t."userId" = :userId )
  //   ) OR (:isShowAll = 'S') )
  //   and (( :isUnread = 'S'  and t."unreadMessages" > 0) OR (:isUnread = 'N'))
  //   and ((:isNotAssigned = 'S' and t."userId" is null) OR (:isNotAssigned = 'N'))
  //   and ((:isSearchParam = 'S' and ( exists (
  //     select 1 from "Messages" m where m."ticketId" = t.id
  //     and upper(m.body) like upper(:searchParam)
  //     ) or (t.id::varchar like :searchParam) or (exists (select 1 from "Contacts" c where c.id = t."contactId" and upper(c."name") like upper(:searchParam)))) OR (:isSearchParam = 'N'))
  //   )
  //   --order by t."updatedAt" desc
  //   limit :limit offset :offset ) as "Ticket"
  //   left outer join "Contacts" as "contact" on
  //   "Ticket"."contactId" = "contact"."id"
  //   left outer join "ContactCustomFields" as "contact->extraInfo" on
  //   "contact"."id" = "contact->extraInfo"."contactId"
  //   left outer join ( "ContactTags" as "contact->tags->ContactTag"
  //   inner join "Tags" as "contact->tags" on
  //   "contact->tags"."id" = "contact->tags->ContactTag"."tagId") on
  //   "contact"."id" = "contact->tags->ContactTag"."contactId"
  //   left outer join ( "ContactWallets" as "contact->wallets->ContactWallet"
  //   inner join "Users" as "contact->wallets" on
  //   "contact->wallets"."id" = "contact->wallets->ContactWallet"."walletId") on
  //   "contact"."id" = "contact->wallets->ContactWallet"."contactId"
  //   left outer join "Users" as "user" on
  //   "Ticket"."userId" = "user"."id"
  //   order by
  //   "Ticket"."updatedAt" desc;
  // `;

  const query = `
  SELECT
  COUNT(*) OVER () AS count,
  c.profilePicUrl,
  c.name,
  u.name AS username,
  q.queue,
  t.*
FROM
  Tickets t
LEFT JOIN Contacts c ON (t.contactId = c.id)
LEFT JOIN Users u ON (u.id = t.userId)
LEFT JOIN Queues q ON (t.queueId = q.id)
WHERE
  t.tenantId = :tenantId
  AND c.tenantId = :tenantId
  AND t.status IN ( :status )
  AND (( :isShowAll = 'N' AND (
    (:isExistsQueueTenant = 'S' AND t.queueId IN ( :queuesIdsUser ))
    OR t.userId = :userId OR EXISTS (SELECT 1 FROM ContactWallets cw WHERE cw.walletId = :userId AND cw.contactId = t.contactId)
  )) OR (:isShowAll = 'S') OR (t.isGroup = true) OR (:isExistsQueueTenant = 'N') )
  AND (( :isUnread = 'S' AND t.unreadMessages > 0) OR (:isUnread = 'N'))
  AND ((:isNotAssigned = 'S' AND t.userId IS NULL) OR (:isNotAssigned = 'N'))
  AND ((:isSearchParam = 'S' AND ( /*EXISTS (
    SELECT 1 FROM Messages m WHERE m.ticketId = t.id
    AND UPPER(m.body) LIKE UPPER(:searchParam)
    ) OR */ (CAST(t.id AS CHAR) LIKE :searchParam) OR (EXISTS (SELECT 1 FROM Contacts c WHERE c.id = t.contactId AND (UPPER(c.name) LIKE UPPER(:searchParam) OR c.number LIKE :searchParam)))) OR (:isSearchParam = 'N'))
)
ORDER BY
  t.updatedAt DESC
LIMIT :limit OFFSET :offset;`;

  const limit = 30;
  const offset = limit * (+pageNumber - 1);

  const tickets: any = await Ticket.sequelize?.query(query, {
    replacements: {
      tenantId,
      isQueuesIds,
      status,
      isShowAll,
      isExistsQueueTenant,
      queuesIdsUser,
      userId,
      isUnread,
      isNotAssigned,
      isSearchParam,
      searchParam: `%${searchParam}%`,
      limit,
      offset
    },
    type: QueryTypes.SELECT,
    nest: true
  });

  let count = 0;
  let ticketsLength = 0;
  if (tickets?.length) {
    count = tickets[0].count;
    ticketsLength = tickets.length;
  }
  const hasMore = count > offset + ticketsLength;

  return {
    tickets: tickets || [],
    count,
    hasMore
  };
};

export default ListTicketsService;
