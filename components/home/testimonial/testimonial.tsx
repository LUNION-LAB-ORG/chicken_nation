// import Image from 'next/image';
"use client";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css";

import Motion from "@/lib/motion";

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
    <div className="bg-primary-50 overflow-hidden px-4 ppy-16 xxl:p-20">
      <div className="container mx-auto px-4">
        <Motion variant="verticalSlideIn">
          <div className="text-center font-title text-primary text-4xl md:text-5xl font-bold pt-10 mb-16 fade-in">
            FEEDBACK DES CONSOMMATEURS
          </div>
        </Motion>

        {/* Conteneur de défilement horizontal uniquement sur mobile */}
        <div className="min-w-[300px] llg:h-[200px] ooverflow-x-auto mmd:overflow-x-hidden hhide-scroll ssmooth-scroll pb-4 fllex ssnap-x">
          <Swiper
            modules={[Autoplay]}
            spaceBetween={50}
            slidesPerView={3}
            autoplay={{
              delay: 3000,
              disableOnInteraction: false,
            }}
            loop={true}
            breakpoints={{
              0: {
                slidesPerView: 1,
              },
              640: {
                slidesPerView: 2,
              },
              1024: {
                slidesPerView: 3,
              },
            }}
          >
            {Items.map((list) => (
              <SwiperSlide key={list.id}>
                <div className="bg-white  rounded-2xl p-4 ">
                  {list.etoile == 4 && (
                    <div className="text-primary">
                      <span>★</span>
                      <span>★</span>
                      <span>★</span>
                      <span>★</span>
                      <span className="text-gray-400">★</span>
                    </div>
                  )}
                  {list.etoile == 5 && (
                    <div className="text-primary">
                      <span>★</span>
                      <span>★</span>
                      <span>★</span>
                      <span>★</span>
                      <span>★</span>
                    </div>
                  )}

                  <p>{list.text}</p>
                  <p className="font-bold mt-2">{list.name}</p>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>
    </div>
  );
}
