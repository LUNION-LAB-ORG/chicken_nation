import Section from "@/components/primitives/Section";
import { Link } from "@/i18n/navigation";
import Motion from "@/lib/motion";
import Image from "next/image";

const serviceItems = [
  {
    id: 1,
    name: "Passez une commande",
    picture: "assets/images/illustrations/page-accueil/service1.png",
    // url: "https://app.eatself.com/3787/carte/0",
    url: "/app-mobile",
  },
  {
    id: 2,
    name: "Réservez une table",
    picture: "assets/images/illustrations/page-accueil/service2.png",
    url: "/app-mobile",
  },
  {
    id: 3,
    name: "Trouver un restaurant",
    picture: "assets/images/illustrations/page-accueil/service3.png",
    url: "/app-mobile",
  },
];
export default function Service() {
  return (
    <Section
      padding="md"
      className="bg-primary-50 relative flex justify-center items-center"
    >
      <div className="flex flex-col md:flex-row gap-6 justify-center items-center">
        {serviceItems.map((item) => (
          <Motion
            key={item.id}
            variant="verticalSlideIn"
            viewport={{ once: true, amount: 0.2 }}
          >
            <Link
              href={item.url}
              className="bg-white flex flex-col p-8 justify-between w-[280px] md:w-[230px] lg:w-[300px] md:min-h-[260px] items-center gap-4 rounded-2xl hover:shadow-lg transition-shadow"
            >
              <div className="relative w-24 h-24 md:w-28 md:h-28">
                <Image
                  src={`/${item.picture}`}
                  alt={item.name}
                  fill
                  className="object-contain"
                />
              </div>
              <p className="text-center text-lg md:text-xl text-primary-900">
                {item.name}
              </p>
            </Link>
          </Motion>
        ))}
      </div>

      <div className="hidden lg:block absolute z-2 -bottom-30 left-0">
        <Motion variant="verticalSlideIn">
          <Image
            src="/assets/images/illustrations/page-accueil/paq-chick.png"
            alt="frite"
            width={1080 / 4}
            height={1080 / 4}
            className="object-contain"
          />
        </Motion>
      </div>
    </Section>
  );
}
