import Image from "next/image";


export default function Asset() {
  return (
    <div className="flex flex-col gap-4 p-6 m-4">
      <div className="font-title text-3xl text-center text-primary my-8">
        NOS ATOUTS
      </div>
      <div className="flex flex-col-reverse md:flex-row-reverse justify-between gap-4 p-6 m-4">
        <div className="relative w-80 h-80">
          <Image
            src="/assets/images/illustrations/histoire/histoire-5.png"
            alt="histoire-3"
            layout="fill"
            objectFit="contain"
            className="rounded-lg"
          />
        </div>
        <div className="flex flex-col justify-around gap-8">
          <div className="flex flex-col gap-8">
            <div className="text-primary text-lg font-semibold">
              Une Cuisine Authentique
            </div>
            <div>
              Tous nos plats sont préparés sur place, à la commande. Nos <br />{" "}
              recettes, développées par notre chef, mêlent tradition et
              innovation <br /> pour vous offrir une expérience gustative
              unique.
            </div>
          </div>
          <div className="flex flex-col gap-8">
            <div className="text-primary text-lg font-semibold">
              Innovation Constante
            </div>
            <div>
              Nous sommes constamment à l&apos;écoute de vos retours pour améliorer{" "}
              <br /> nos services et créer de nouvelles recettes qui répondent à
              vos <br /> envies.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
