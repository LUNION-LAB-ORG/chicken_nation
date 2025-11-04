"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css";

import Motion from "@/lib/motion";
import Section from "@/components/primitives/Section";
import Title from "@/components/primitives/Title";

const Items = [
  {
    etoile: 5,
    id: "8",
    text: "Ma  femme devais accouché le 10 le 11 a midi l'enfant ne vient pas l'es docteurs voulais l opérer elle a refuser elle m'a dit bb je veux manger Chiken nation l enfant va venir je suis allée chercher elle à croquer à pousser mon fils est venue au monde depuis se jours Chicken nation au menu au 2 fois dans la semaine quand il auras 1 ans on viendras avec lui à  Chicken nation ❤️ merci encore à  vous 😍 ",
    name: "aKa_charles_ ",
    picture: "assets/images/illustrations/page-accueil/img1",
  },
  {
    etoile: 4,
    id: "1",
    text: "Les meilleures",
    name: "444davs_",
    picture: "assets/images/illustrations/page-accueil/frite-2.png",
  },
  {
    etoile: 5,
    id: "2",
    text: "Vous êtes top j'ai beaucoup aimé délicieux continuer ainsi merci e €",
    name: "ass_bing",
    picture: "assets/images/illustrations/page-accueil/frite-2.png",
  },
  {
    etoile: 4,
    id: "3",
    text: "Merveilleux poulets gros bien croustillants cuisinés avec une touche d'originalité culinaire parfait",
    name: "Niako Dally",
    picture: "assets/images/illustrations/page-accueil/frite-2.png",
  },
  {
    etoile: 4,
    id: "4",
    text: "Merveilleux poulets gros bien croustillants cuisinés avec une touche d'originalité culinaire parfait",
    name: "Niako Dally",
    picture: "assets/images/illustrations/page-accueil/img1",
  },
  {
    etoile: 5,
    id: "5",
    text: "Où être-vous situés ",
    name: "Vadian",
    picture: "assets/images/illustrations/page-accueil/img1",
  },
  {
    etoile: 4,
    id: "6",
    text: "c'est trop doux même 🤭 ",
    name: "Christy 17A",
    picture: "assets/images/illustrations/page-accueil/img1",
  },
  {
    etoile: 4,
    id: "7",
    text: "explosion de saveur",
    name: "Yns_sltt.",
    picture: "assets/images/illustrations/page-accueil/img1",
  },
  {
    etoile: 5,
    id: "9",
    text: "Le goût de ça Chiken Nation rester le meilleur restaurant en matière de poulet pané ❤️",
    name: "Jocelyn Bodehi Segnon",
    picture: "assets/images/illustrations/page-accueil/img1",
  },
  {
    etoile: 4,
    id: "10",
    text: "Vous être  les meilleurs en tout cas j'ai bien aimé surtout les frites 🤤🤤",
    name: "Koné Djenebou",
    picture: "assets/images/illustrations/page-accueil/img1",
  },
  {
    etoile: 5,
    id: "11",
    text: "Ils font du bon poulet en tout cas 😊",
    name: "Koné Djenebou",
    picture: "assets/images/illustrations/page-accueil/img1",
  },
  {
    etoile: 4,
    id: "12",
    text: "belle déco, belle ambiance, merci pour le nouveau cadre adéquat pour manger en toute quiétude... on est ensemble Chicken Nation 🥳",
    name: "Rebecca Koffi",
    picture: "assets/images/illustrations/page-accueil/img1",
  },
];
export default function Testimonial() {
  return (
    <Section className="bg-primary-50 overflow-hidden space-y-6">
      <Motion variant="verticalSlideIn">
        <Title>FEEDBACK DES CONSOMMATEURS</Title>
      </Motion>

      <div className="pb-4">
        <Swiper
          modules={[Autoplay]}
          spaceBetween={16}
          autoplay={{
            delay: 3000,
            disableOnInteraction: false,
          }}
          loop
          breakpoints={{
            0: { slidesPerView: 1.1, spaceBetween: 12 },
            640: { slidesPerView: 2, spaceBetween: 20 },
            1024: { slidesPerView: 3, spaceBetween: 24 },
          }}
        >
          {Items.map((item) => (
            <SwiperSlide key={item.id}>
              <div className="bg-white rounded-2xl p-4 h-full shadow-sm flex flex-col justify-between">
                <div className="text-primary">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <span
                      key={i}
                      className={i < item.etoile ? "" : "text-gray-300"}
                    >
                      ★
                    </span>
                  ))}
                </div>
                <p className="text-sm mt-2 line-clamp-5">{item.text}</p>
                <p className="font-bold mt-3 text-primary-900">{item.name}</p>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </Section>
  );
}
