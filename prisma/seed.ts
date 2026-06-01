import "dotenv/config";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, FieldType } from "@prisma/client";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const TEMPLATE_HTML = `<div class="contract-document">
  <div class="text-center mb-8">
    <h2 class="text-xl font-bold uppercase tracking-wide">ДОГОВОР АРЕНДЫ ЖИЛОГО ПОМЕЩЕНИЯ</h2>
  </div>

  <div class="flex justify-between mb-6">
    <span>г. {{city}}</span>
    <span>«___» {{contract_date}} г.</span>
  </div>

  <p class="mb-4">
    Гражданин(ка) <strong>{{landlord_name}}</strong>, паспорт серия и номер: {{landlord_passport}}, именуемый(ая) в дальнейшем <strong>«Арендодатель»</strong>, с одной стороны, и гражданин(ка) <strong>{{tenant_name}}</strong>, паспорт серия и номер: {{tenant_passport}}, именуемый(ая) в дальнейшем <strong>«Арендатор»</strong>, с другой стороны, заключили настоящий Договор о нижеследующем:
  </p>

  <h3 class="font-bold mt-6 mb-2">1. ПРЕДМЕТ ДОГОВОРА</h3>

  <p class="mb-2">
    1.1. Арендодатель передаёт Арендатору во временное возмездное пользование жилое помещение — квартиру, расположенную по адресу: <strong>{{apartment_address}}</strong>, общей площадью <strong>{{area_sqm}} кв.м</strong>.
  </p>
  <p class="mb-2">
    1.2. Квартира принадлежит Арендодателю на праве собственности.
  </p>
  <p class="mb-2">
    1.3. Квартира передаётся для проживания Арендатора и членов его семьи. Использование помещения в коммерческих целях не допускается.
  </p>

  <h3 class="font-bold mt-6 mb-2">2. СРОК АРЕНДЫ</h3>

  <p class="mb-2">
    2.1. Настоящий Договор заключается на срок с <strong>{{rental_start}}</strong> по <strong>{{rental_end}}</strong>.
  </p>
  <p class="mb-2">
    2.2. Арендатор вселяется в квартиру <strong>{{move_in_date}}</strong>.
  </p>
  <p class="mb-2">
    2.3. По истечении срока действия настоящего Договора Арендатор обязан освободить квартиру.
  </p>

  <h3 class="font-bold mt-6 mb-2">3. АРЕНДНАЯ ПЛАТА И ПОРЯДОК РАСЧЁТОВ</h3>

  <p class="mb-2">
    3.1. Ежемесячная арендная плата составляет <strong>{{rent_amount}} рублей</strong>.
  </p>
  <p class="mb-2">
    3.2. Арендная плата вносится не позднее 5-го числа каждого оплачиваемого месяца.
  </p>
  <p class="mb-2">
    3.3. Обеспечительный депозит (залог) составляет <strong>{{deposit_amount}} рублей</strong> и вносится Арендатором при подписании настоящего Договора. Залог возвращается Арендодателем в течение 3 рабочих дней после окончания срока аренды и сдачи квартиры в надлежащем состоянии.
  </p>
  <p class="mb-2">
    3.4. Изменение размера арендной платы допускается не чаще одного раза в год и только по письменному соглашению Сторон.
  </p>

  <h3 class="font-bold mt-6 mb-2">4. ПРАВА И ОБЯЗАННОСТИ АРЕНДОДАТЕЛЯ</h3>

  <p class="mb-2">
    4.1. Арендодатель обязан:
  </p>
  <ul class="list-disc list-inside mb-2 space-y-1">
    <li>передать Арендатору квартиру в состоянии, пригодном для проживания;</li>
    <li>обеспечить Арендатора необходимыми коммунальными услугами;</li>
    <li>предупреждать Арендатора о посещении квартиры не менее чем за 24 часа;</li>
    <li>не препятствовать Арендатору в пользовании квартирой.</li>
  </ul>
  <p class="mb-2">
    4.2. Арендодатель вправе расторгнуть Договор досрочно, предупредив Арендатора за 30 дней.
  </p>

  <h3 class="font-bold mt-6 mb-2">5. ПРАВА И ОБЯЗАННОСТИ АРЕНДАТОРА</h3>

  <p class="mb-2">
    5.1. Арендатор обязан:
  </p>
  <ul class="list-disc list-inside mb-2 space-y-1">
    <li>своевременно вносить арендную плату;</li>
    <li>использовать квартиру только для проживания;</li>
    <li>поддерживать квартиру в надлежащем состоянии, не допускать ухудшения имущества;</li>
    <li>не производить перепланировок без письменного согласия Арендодателя;</li>
    <li>не передавать квартиру в субаренду без письменного согласия Арендодателя;</li>
    <li>возмещать ущерб, причинённый квартире или имуществу Арендодателя по вине Арендатора.</li>
  </ul>
  <p class="mb-2">
    5.2. Арендатор вправе расторгнуть Договор досрочно, предупредив Арендодателя за 30 дней.
  </p>

  <h3 class="font-bold mt-6 mb-2">6. КОММУНАЛЬНЫЕ ПЛАТЕЖИ</h3>

  <p class="mb-2">
    6.1. Расходы по оплате коммунальных услуг (электроэнергия, водоснабжение, газ) несёт Арендатор.
  </p>
  <p class="mb-2">
    6.2. Расходы на содержание общего имущества многоквартирного дома несёт Арендодатель.
  </p>

  <h3 class="font-bold mt-6 mb-2">7. ОТВЕТСТВЕННОСТЬ СТОРОН</h3>

  <p class="mb-2">
    7.1. В случае просрочки арендной платы Арендодатель вправе требовать уплаты неустойки в размере 0,5% от суммы задолженности за каждый день просрочки.
  </p>
  <p class="mb-2">
    7.2. Стороны несут ответственность в соответствии с действующим законодательством Российской Федерации.
  </p>

  <h3 class="font-bold mt-6 mb-2">8. РАСТОРЖЕНИЕ ДОГОВОРА</h3>

  <p class="mb-2">
    8.1. Договор может быть расторгнут по соглашению Сторон в любое время.
  </p>
  <p class="mb-2">
    8.2. Односторонний отказ от исполнения Договора допускается с письменным уведомлением другой Стороны за 30 дней.
  </p>
  <p class="mb-2">
    8.3. Арендодатель вправе расторгнуть Договор в судебном порядке в случае просрочки арендной платы более чем на 2 месяца.
  </p>

  <h3 class="font-bold mt-6 mb-2">9. ПРОЧИЕ УСЛОВИЯ</h3>

  <p class="mb-2">
    9.1. Настоящий Договор составлен в двух экземплярах, имеющих одинаковую юридическую силу, — по одному для каждой из Сторон.
  </p>
  <p class="mb-2">
    9.2. Все споры, возникающие из настоящего Договора, решаются путём переговоров, а при недостижении согласия — в судебном порядке по месту нахождения квартиры.
  </p>
  <p class="mb-2">
    9.3. Договор вступает в силу с момента подписания.
  </p>

  <h3 class="font-bold mt-6 mb-2">10. РЕКВИЗИТЫ И ПОДПИСИ СТОРОН</h3>

  <div class="grid grid-cols-2 gap-8 mt-6">
    <div>
      <p class="font-bold mb-2">АРЕНДОДАТЕЛЬ:</p>
      <p class="mb-1">ФИО: {{landlord_name}}</p>
      <p class="mb-1">Паспорт: {{landlord_passport}}</p>
      <p class="mt-8">Подпись: ___________________</p>
    </div>
    <div>
      <p class="font-bold mb-2">АРЕНДАТОР:</p>
      <p class="mb-1">ФИО: {{tenant_name}}</p>
      <p class="mb-1">Паспорт: {{tenant_passport}}</p>
      <p class="mt-8">Подпись: ___________________</p>
    </div>
  </div>
</div>`;

async function main() {
  const contractType = await prisma.contractType.upsert({
    where: { slug: "arenda-zhiloy-kvartiry" },
    update: {},
    create: {
      slug: "arenda-zhiloy-kvartiry",
      name: "Договор аренды жилой квартиры",
      description:
        "Типовой договор аренды жилого помещения между физическими лицами",
      isPublished: true,
      seo: {
        create: {
          pageTitle:
            "Договор аренды квартиры 2024 — скачать бесплатно | Договорились.ру",
          metaDescription:
            "Заполните и скачайте договор аренды жилой квартиры онлайн бесплатно. Юридически корректный шаблон с автоматическим заполнением данных. Готово за 2 минуты.",
          keywords:
            "договор аренды квартиры, шаблон договора аренды, договор найма жилья, скачать договор аренды бесплатно",
          ogTitle: "Договор аренды жилой квартиры — заполнить онлайн",
          ogDescription:
            "Заполните договор аренды квартиры за 2 минуты и сразу скачайте готовый документ.",
          h1: "Договор аренды жилой квартиры",
          introText:
            "Заполните поля слева — договор обновится автоматически. Готовый документ можно распечатать или сохранить как PDF.",
        },
      },
      template: {
        create: {
          content: TEMPLATE_HTML,
          fields: {
            createMany: {
              data: [
                {
                  name: "city",
                  label: "Город",
                  type: FieldType.TEXT,
                  placeholder: "Москва",
                  required: true,
                  order: 1,
                },
                {
                  name: "contract_date",
                  label: "Дата договора",
                  type: FieldType.DATE,
                  required: true,
                  order: 2,
                },
                {
                  name: "landlord_name",
                  label: "ФИО арендодателя",
                  type: FieldType.TEXT,
                  placeholder: "Иванов Иван Иванович",
                  required: true,
                  order: 3,
                },
                {
                  name: "landlord_passport",
                  label: "Паспорт арендодателя",
                  type: FieldType.TEXT,
                  placeholder: "4521 123456, выдан УФМС России по г. Москве",
                  required: true,
                  order: 4,
                },
                {
                  name: "tenant_name",
                  label: "ФИО арендатора",
                  type: FieldType.TEXT,
                  placeholder: "Петров Пётр Петрович",
                  required: true,
                  order: 5,
                },
                {
                  name: "tenant_passport",
                  label: "Паспорт арендатора",
                  type: FieldType.TEXT,
                  placeholder: "4521 654321, выдан УФМС России по г. Москве",
                  required: true,
                  order: 6,
                },
                {
                  name: "apartment_address",
                  label: "Адрес квартиры",
                  type: FieldType.TEXTAREA,
                  placeholder: "г. Москва, ул. Примерная, д. 1, кв. 1",
                  required: true,
                  order: 7,
                },
                {
                  name: "area_sqm",
                  label: "Площадь (кв.м)",
                  type: FieldType.NUMBER,
                  placeholder: "45",
                  required: true,
                  order: 8,
                },
                {
                  name: "rental_start",
                  label: "Дата начала аренды",
                  type: FieldType.DATE,
                  required: true,
                  order: 9,
                },
                {
                  name: "rental_end",
                  label: "Дата окончания аренды",
                  type: FieldType.DATE,
                  required: true,
                  order: 10,
                },
                {
                  name: "rent_amount",
                  label: "Арендная плата (руб/мес)",
                  type: FieldType.NUMBER,
                  placeholder: "50000",
                  required: true,
                  order: 11,
                },
                {
                  name: "deposit_amount",
                  label: "Залог (руб)",
                  type: FieldType.NUMBER,
                  placeholder: "50000",
                  required: false,
                  order: 12,
                },
                {
                  name: "move_in_date",
                  label: "Дата заезда",
                  type: FieldType.DATE,
                  required: true,
                  order: 13,
                },
              ],
            },
          },
        },
      },
    },
  });

  console.log(`✅ Договор создан: ${contractType.name} (id: ${contractType.id})`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
