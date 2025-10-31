/* eslint-disable @next/next/no-img-element */
import Section from "@/components/primitives/Section";

const testimonials = [
  {
    id: 1,
    text: "Le goût de ça Chicken Nation reste le meilleur restaurant en matière de poulet pané. Un délice à chaque fois ! ❤️",
    name: "Jocelyn Bodehi Segnon",
    role: "Fan Absolu",
    image:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTJ8fHBvcnRyYWl0fGVufDB8fDB8fHww",
  },
  {
    id: 2,
    text: "Merveilleux poulets gros bien croustillants cuisinés avec une touche d'originalité culinaire parfait. J'adore !",
    name: "Niako Dally",
    role: "Client Gourmet",
    image:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mjh8fHBvcnRyYWl0fGVufDB8fDB8fHww",
  },
  {
    id: 3,
    text: "Vous êtes les meilleurs en tout cas j'ai bien aimé surtout les frites 🤤🤤. Et le poulet est tendre à l'intérieur.",
    name: "Koné Djenebou",
    role: "Amateur de Frites",
    image:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NDB8fHBvcnRyYWl0fGVufDB8fDB8fHww",
  },
  {
    id: 4,
    text: "Belle déco, belle ambiance, merci pour le nouveau cadre adéquat pour manger en toute quiétude... On est ensemble Chicken Nation 🥳",
    name: "Rebecca Koffi",
    role: "Visiteuse sur Place",
    image:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NTJ8fHBvcnRyYWl0fGVufDB8fDB8fHww",
  },
  {
    id: 5,
    text: "explosion de saveur ! Le CRISPY DEAL est un incontournable pour les petites faims. Je recommande l'application pour commander.",
    name: "Yns_sltt.",
    role: "Client Régulier",
    image:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Njh8fHBvcnRyYWl0fGVufDB8fDB8fHww",
  },
  {
    id: 6,
    text: "Le COMBO FAMILY est parfait pour les soirées en famille. Livraison en temps record et toujours chaud !",
    name: "Olivia T.",
    role: "Mère de Famille",
    image:
      "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NjR8fHBvcnRyYWl0fGVufDB8fDB8fHww",
  },
  {
    id: 7,
    text: "J'utilise l'appli tous les midis au travail, c'est d'une simplicité. Le LUNCH BURGER XL est mon favori !",
    name: "Koffi M.",
    role: "Employé de Bureau",
    image:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MzJ8fHBvcnRyYWl0fGVufDB8fDB8fHww",
  },
  {
    id: 8,
    text: "Le poulet grillé est juste exceptionnel. Une alternative plus légère, mais tout aussi savoureuse.",
    name: "Fatou L.",
    role: "Adepte du Grillé",
    image:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8cG9ydHJhaXR8ZW58MHx8MHx8fDA%3D",
  },
  {
    id: 9,
    text: "Les meilleures wings que j'ai goûtées à Abidjan ! Le MEGA WINGS porte bien son nom. Service client au top.",
    name: "Bob C.",
    role: "Client Ailé",
    image:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTh8fHBvcnRyYWl0fGVufDB8fDB8fHww",
  },
  {
    id: 10,
    text: "La fidélité paie ! J'ai pu profiter d'une super réduction grâce aux points de l'application. On sent que le client est valorisé.",
    name: "Paul N.",
    role: "Membre Fidélité",
    image:
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NDR8fHBvcnRyYWl0fGVufDB8fDB8fHww",
  },
  {
    id: 11,
    text: "C'est trop doux même 🤭. Simple, efficace, délicieux. Chicken Nation, c'est l'adresse quand on a une grosse envie !",
    name: "Christy 17A",
    role: "Étudiante",
    image:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NTJ8fHBvcnRyYWl0fGVufDB8fDB8fHww",
  },
  {
    id: 12,
    text: "Ma femme devais accouché le 10 le 11 a midi l'enfant ne vient pas... elle m'a dit bb je veux manger Chiken nation l enfant va venir. Je suis allée chercher, elle a croqué, mon fils est venu au monde ! Merci encore à vous. 😍",
    name: "aKa_charles_",
    role: "Nouveau Papa",
    image:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NTZ8fHBvcnRyYWl0fGVufDB8fDB8fHww",
  },
  {
    id: 13,
    text: "J'apprécie la flexibilité des modes de réception. Souvent je commande à emporter pour ne pas perdre de temps. Service impeccable au Sococe.",
    name: "Vidian S.",
    role: "Client Pressé",
    image:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Njh8fHBvcnRyYWl0fGVufDB8fDB8fHww",
  },
  {
    id: 14,
    text: "La nouvelle option de suivi en temps réel sur l'appli est géniale. Plus besoin d'appeler, je sais exactement où est ma commande.",
    name: "Tina U.",
    role: "Digital Nomad",
    image:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTA0fHxwb3J0cmFpdHxlbnwwfHwwfHx8MA%3D%3D",
  },
  {
    id: 15,
    text: "Je prends toujours 'LES MÉCHANT MÉCHANT', c'est ma dose de bonheur de la semaine. Toujours chaud et les sauces sont excellentes.",
    name: "Samuel T.",
    role: "Client Passionné",
    image:
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTAwfHxwb3J0cmFpdHxlbnwwfHwwfHx8MA%3D%3D",
  },
];
export function Testimonials() {
  return (
    <Section
      title="Témoignages"
      subtitle="Feedback des consommateurs"
      className="container px-10 mx-auto"
    >
      <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 space-y-4 py-10">
        {testimonials.map((testimonial, index) => (
          <div
            key={index}
            className="bg-secondary/10 ring-1 ring-secondary overflow-hidden rounded-3xl flex flex-col h-fit"
            style={{
              gridRow: `span ${Math.floor(testimonial.text.length / 50) + 1}`,
            }}
          >
            <div className="px-4 py-5 sm:p-6 flex-grow">
              <div className="flex items-center mb-4">
                <img
                  className="h-10 w-10 rounded-full object-cover"
                  src={testimonial.image}
                  alt={testimonial.name}
                />
                <div className="ml-3">
                  <h3 className="text-lg font-medium text-foreground">
                    {testimonial.name}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {testimonial.role}
                  </p>
                </div>
              </div>
              <p className="text-foreground">{testimonial.text}</p>
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}
