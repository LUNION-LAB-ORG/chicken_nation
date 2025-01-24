

export default function Notice() {
    const reviews = [
      {
        author: "Pauline AKA",
        date: "Mar 10 oct 2023",
        rating: 5,
        review: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec dictum nulla vel aliquam ultrices. Nam ultrices justo eget elit condimentum, nec pharetra erat mollis. Etiam vel justo sem. Etiam in leo vitae quam pellentesque tincidunt nec eget enim.",
        image: "https://i.pinimg.com/736x/f8/19/e4/f819e4d4f5b6a266a71f8a5248003e39.jpg"
      },
      {
        author: "Paul AKA",
        date: "Mar 10 oct 2023",
        rating: 5,
        review: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec dictum nulla vel aliquam ultrices. Nam ultrices justo eget elit condimentum, nec pharetra erat mollis.",
        image: "https://i.pinimg.com/736x/f8/19/e4/f819e4d4f5b6a266a71f8a5248003e39.jpg"
      },
      {
        author: "Paul AKA",
        date: "Mar 10 oct 2023",
        rating: 5, 
        review: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
        image: "https://i.pinimg.com/736x/f8/19/e4/f819e4d4f5b6a266a71f8a5248003e39.jpg"
      },
      {
        author: "Paul Maissane",
        date: "Mar 10 oct 2023",
        rating: 5,
        review: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec dictum nulla vel aliquam ultrices. Nam ultrices justo eget elit condimentum, nec pharetra erat mollis.",
        image: "https://i.pinimg.com/736x/f8/19/e4/f819e4d4f5b6a266a71f8a5248003e39.jpg"
      },
      {
        author: "Mariam Maïssane",
        date: "Mar 10 oct 2023",
        rating: 5,
        review: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. ",
        image: "https://i.pinimg.com/736x/f8/19/e4/f819e4d4f5b6a266a71f8a5248003e39.jpg"
      },
    ];
  
    return (
      <div className="mx-2 md:mx-16 my-2 flex flex-col gap-6">
        {reviews.map((review, index) => (
          <div key={index} className="flex items-start text-start space-x-4">
            <img src={review.image} alt={review.author} className="w-10 h-10 rounded-full" />
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