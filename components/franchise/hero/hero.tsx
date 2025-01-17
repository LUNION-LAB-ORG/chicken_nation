

export default function Hero(){
    return(
        <div className="relative w-full h-screen overflow-hidden">
      {/* Background Pattern */}
      <img
        className="absolute inset-0 w-full h-full object-cover"
        src="assets/images/backgrounds/franchise.png"
        alt="title"
        />
        <div className="bg-black/30 py-8 w-full absolute bottom-0 mx-auto">
        <div className="font-title text-primary text-center text-6xl mx-auto">
            FRANCHISE
        </div>
        </div>
    </div>
    );
}