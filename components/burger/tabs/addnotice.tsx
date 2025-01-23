import { Button } from "@nextui-org/react";

export default function AddNotice() {
  return (
    <div className="bg-primary-50 px-8 py-24 rounded-3xl">

      <h2 className="text-3xl font-title text-center mb-4">Ajouter un avis</h2>


      <p className="text-gray-600 text-center mb-2">
        Ton adresse ne sera pas publiée. Remplis les champs indiqués
      </p>
      <p className="text-gray-400 text-center mb-6">Donne un score ★★★★★</p>


      <form className="space-y-6">

        <div className="flex flex-wrap gap-6">
          <input
            type="text"
            placeholder="Ton nom"
            className="flex-1 rounded-lg px-4 py-2 focus:outline-none "
          />
          <input
            type="email"
            placeholder="Ton email"
            className="flex-1 rounded-lg px-4 py-2 focus:outline-none "
          />
        </div>


        <textarea
          placeholder="Rédige ton point de vue"
          className="w-full rounded-lg px-4 py-2 focus:outline-none resize-none h-32 border "
        ></textarea>


        <div className="flex items-center justify-center text-center gap-2">
          <input
            type="checkbox"
            className="w-4 h-4 text-orange-500  rounded focus:ring-orange-500"
          />
          <span className="text-gray-600">
            Sauvegarder mon nom et mon mail sur ce navigateur pour un prochain commentaire
          </span>
        </div>


        <div className="text-center">
          <Button type="submit" color="primary">
            Poster l'avis
          </Button>
        </div>
      </form>
    </div>
  );
}
