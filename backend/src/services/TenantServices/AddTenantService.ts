// import User from "../../models/User";
import Tenant from "../../models/Tenant";

interface Request {
  name: string;
  status: string;
  ownerId: number;
}

interface Response {
    name: string;
    status: string;
    businessHours: any;
    messageBusinessHours: string;
    ownerId: number;
}

const AddTenantService = async ({
  name,
  status,
  ownerId
}: Request): Promise<Response> => {
  const tenant = await Tenant.findOne({
    where: { name }
  });

  if (tenant) {
    //Criar
    console.log("Já existe uma empresa com esse nome");
    return tenant
  }

  let businessHours = '[{"day": 0, "hr1": "08:00", "hr2": "12:00", "hr3": "14:00", "hr4": "18:00", "type": "O", "label": "Domingo"}, {"day": 1, "hr1": "08:00", "hr2": "12:00", "hr3": "14:00", "hr4": "18:00", "type": "O", "label": "Segunda-Feira"}, {"day": 2, "hr1": "08:00", "hr2": "12:00", "hr3": "14:00", "hr4": "18:00", "type": "O", "label": "Terça-Feira"}, {"day": 3, "hr1": "08:00", "hr2": "12:00", "hr3": "14:00", "hr4": "18:00", "type": "O", "label": "Quarta-Feira"}, {"day": 4, "hr1": "08:00", "hr2": "12:00", "hr3": "14:00", "hr4": "18:00", "type": "O", "label": "Quinta-Feira"}, {"day": 5, "hr1": "08:00", "hr2": "12:00", "hr3": "14:00", "hr4": "18:00", "type": "O", "label": "Sexta-Feira"}, {"day": 6, "hr1": "08:00", "hr2": "12:00", "hr3": "14:00", "hr4": "18:00", "type": "O", "label": "Sábado"}]';
  let messageBusinessHours = 'Olá! Fantástico receber seu contato! No momento estamos ausentes e não poderemos lhe atender, mas vamos priorizar seu atendimento e retornaremos logo mais. Agradecemos muito o contato.';
  const tenantResult = await Tenant.create({
    status: "active",
    name: name,
    businessHours: businessHours,
    messageBusinessHours: messageBusinessHours
  });

  return tenantResult;
};

export default AddTenantService;
