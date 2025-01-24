import Image from "next/image";

export default function Notice() {
  const reviews = [
    {
      author: "Pauline AKA",
      date: "Mar 10 oct 2023",
      rating: 5,
      review:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec dictum nulla vel aliquam ultrices. Nam ultrices justo eget elit condimentum, nec pharetra erat mollis. Etiam vel justo sem. Etiam in leo vitae quam pellentesque tincidunt nec eget enim.",
      image: "/assets/images/illustrations/restaurant-detail/Fotoprofessional.jpeg",
    },
    {
      author: "Paul AKA",
      date: "Mar 10 oct 2023",
      rating: 5,
      review:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec dictum nulla vel aliquam ultrices. Nam ultrices justo eget elit condimentum, nec pharetra erat mollis.",
      image: "/assets/images/illustrations/restaurant-detail/Fotoprofessional.jpeg",
    },
    {
      author: "Paul AKA",
      date: "Mar 10 oct 2023",
      rating: 5,
      review: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
      image: "/assets/images/illustrations/restaurant-detail/Fotoprofessional.jpeg",
    },
    {
      author: "Paul Maissane",
      date: "Mar 10 oct 2023",
      rating: 5,
      review:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec dictum nulla vel aliquam ultrices. Nam ultrices justo eget elit condimentum, nec pharetra erat mollis.",
      image: "/assets/images/illustrations/restaurant-detail/Fotoprofessional.jpeg",
    },
    {
      author: "Mariam Maïssane",
      date: "Mar 10 oct 2023",
      rating: 5,
      review: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. ",
      image: "/assets/images/illustrations/restaurant-detail/Fotoprofessional.jpeg",
    },
  ];

  return (
    <div className="mx-2 md:mx-16 my-2 flex flex-col gap-6">
      {reviews.map((review, index) => (
        <div key={index} className="flex items-start text-start space-x-4">
          <Image
            src={review.image}
            alt={review.author}
            width={40} // Correspond à "w-10" en Tailwind (10 * 4px)
            height={40} // Correspond à "h-10" en Tailwind
            className="rounded-full"
          />
          <div className="flex flex-col text-start items-start gap-3">
            <div className="flex flex-col gap-0">
              <h3 className="text-xl font-semibold">{review.author}</h3>
              <p className="text-sm font-extralight text-gray-500">{review.date}</p>
            </div>
            <div className="text-primary">
              ★★★★<span className="text-gray-400">★</span>
            </div>
            <p>{review.review}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
