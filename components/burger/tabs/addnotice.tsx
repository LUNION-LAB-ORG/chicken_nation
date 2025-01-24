import { Button } from "@nextui-org/react";

export default function AddNotice() {
  return (
    <div className="bg-primary-50 px-8 py-24 rounded-3xl">

      <h2 className="text-3xl font-title text-center mb-4">Ajouter un avis</h2>


      <p className="text-gray-600 text-center mb-2">
        Ton adresse ne sera pas publiée. Remplis les champs indiqués
      </p>
      <p className="flex flex-col md:flex-row justify-center text-gray-400 text-center mb-6 gap-3 md:gap-4">Donne un score <span>★★★★★</span></p>


    <div className="px-0 md:px-32">

      <form className="space-y-6">

        <div className="flex flex-col md:flex-row gap-6">
          <input
            type="text"
            placeholder="Ton nom"
            className="flex flex-row w-full md:w-1/2 rounded-3xl p-4 md:p-8 focus:outline-none "
          />
          <input
            type="email"
            placeholder="Ton email"
            className="flex flex-row w-full md:w-1/2 rounded-3xl p-4 md:p-8 focus:outline-none "
          />
        </div>

        <div className="flex justify-center items-center">
        <textarea
          placeholder="Rédige ton point de vue"
          className="w-full rounded-3xl p-4 md:p-8 focus:outline-none resize-none h-40"
        ></textarea>
        </div>
        


        <div className="flex items-center justify-center text-center gap-2">
          <input
            type="checkbox"
            className="w-4 h-4 text-primary  rounded focus:ring-primary"
          />
          <span className="text-gray-600 text-sm md:text-base">
            Sauvegarder mon nom et mon mail sur ce navigateur pour un prochain commentaire
          </span>
        </div>


        <div className="text-center">
          <Button type="submit" color="primary" className="w-full md:w-32">
            Poster l&apos;avis
          </Button>
        </div>
      </form>

    </div>
    </div>
  );
}