import Image from "next/image";

export default function Header(){
    return(
        <div className="p-20">
        <div  className="flex flex-col md:flex-row gap-3 border items-center md:items-start justify-center md:justify-start border-black rounded-3xl p-6">
                    <div>
                    <Image
                     src="/assets/images/illustrations/restaurant-detail/card-detail.png"
                      alt="card-detail"
                      width={2000}
                      height={2000}
                      objectFit="contain"
                    />
                    <div>
                    <Image
                     src="/assets/images/illustrations/restaurant-detail/card-detail.png"
                      alt="card-detail"
                      width={200}
                      height={200}
                      objectFit="contain"
                    />
                    <Image
                     src="/assets/images/illustrations/restaurant-detail/card-detail.png"
                      alt="card-detail"
                      width={200}
                      height={200}
                      objectFit="contain"
                    />
                    <Image
                     src="/assets/images/illustrations/restaurant-detail/card-detail.png"
                      alt="card-detail"
                      width={200}
                      height={200}
                      objectFit="contain"
                    />
                    <Image
                     src="/assets/images/illustrations/restaurant-detail/card-detail.png"
                      alt="card-detail"
                      width={200}
                      height={200}
                      objectFit="contain"
                    />
                    </div>
                    </div>
                    <div className="flex flex-col text-center md:text-start justify-between gap-4">
                        <div className="text-xl font-semibold">Classic Burger</div>
                        <div>Laissez-vous tenter par notre création signature, Le Gourmet, une symphonie de saveurs qui éveillera vos papilles. Ce burger d'exception commence par un pain brioché artisanal, légèrement toasté, aux graines de sésame dorées</div>
                        <div className="flex justify-between items-center">
                            <div className="text-primary text-lg font-title"></div>
                            <div></div>
                        </div>
                    </div>
        </div>
        </div>
    );
}