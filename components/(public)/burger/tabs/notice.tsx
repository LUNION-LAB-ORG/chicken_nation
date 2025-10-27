import { Avatar } from "@heroui/avatar";

export default function Notice() {

  const reviews = [
    {
      author: "aKaKA charles_ ",
      date: "Mar 10 oct 2023",
      rating: 5,
      review:
      "Ma  femme devais accouché le 10 le 11 a midi l'enfant ne vient pas l'es docteurs voulais l opérer elle a refuser elle m'a dit bb je veux manger Chiken nation l enfant va venir je suis allée chercher elle à croquer à pousser mon fils est venue au monde depuis se jours Chicken nation au menu au 2 fois dans la semaine quand il auras 1 ans on viendras avec lui à  Chicken nation ❤️ merci encore à  vous 😍 ",
      image: "assets/images/illustrations/page-accueil/img1",
    },
    {
      author: "Rebecca Koffi",
      date: "Mar 10 oct 2023",
      rating: 5,
      review:
      "belle déco, belle ambiance, merci pour le nouveau cadre adéquat pour manger en toute quiétude... on est ensemble Chicken Nation 🥳",
      image: "assets/images/illustrations/page-accueil/img1",
    },
    {
      author: "Koné Djenebou",
      date: "Mars 10 oct 2023",
      rating: 5,
      review:
      "Vous être  les meilleurs en tout cas j'ai bien aimé surtout les frites 🤤🤤",
      image: "assets/images/illustrations/page-accueil/img1",
    },
    {
      author: "Jocelyn Bodehi Segnon",
      date: "Mar 10 oct 2023",
      rating: 5,
      review: "Le goût de ça Chiken Nation rester le meilleur restaurant en matière de poulet pané ❤️",
      image: "assets/images/illustrations/page-accueil/img1",
    },
    {
      author: "Christy 17A",
      date: "Mar 10 oct 2023",
      rating: 5,
      review:
      "c'est trop doux même 🤭 ",
      image: "assets/images/illustrations/page-accueil/img1",
    },
    {
      author: "Niako Dally",
      date: "Mar 10 oct 2023",
      rating: 5,
      review: "Merveilleux poulets gros bien croustillants cuisinés avec une touche d'originalité culinaire parfait",
      image: "assets/images/illustrations/page-accueil/frite-2.png",
    },
  ];

  return (
    <div className="mx-2 md:mx-16 my-2 flex flex-col gap-6">
      {reviews.map((review, index) => (
        <div key={index} className="flex items-start text-start space-x-4">
           <Avatar className="hidden lg:block" name={review.author} />
          <div className="flex flex-col text-start items-start gap-3">
            <div className="flex flex-col gap-0">
              <h3 className="text-xl font-semibold">{review.author}</h3>
              <p className="text-sm font-extralight text-gray-500">{review.date}</p>
            </div>
            <div className="text-primary">
              ★★★★<span className="text-gray-400">★</span>
            </div>
            <p className="max-w-7xl">{review.review}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
