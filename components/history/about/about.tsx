import Image from 'next/image';

export default function About() {
  return (
    <div className="flex flex-col md:flex-row justify-between gap-4 p-6 m-4">
      {/* Image à gauche */}
      <div className="relative">
        <Image 
          src="/assets/images/illustrations/histoire/seau.png" 
          alt="histoire-1" 
          width={500}  
          height={600} 
          className="object-contain hidden md:block"
        />
        <Image 
          src="/assets/images/illustrations/histoire/seau.png" 
          alt="histoire-1" 
          width={500}  
          height={600} 
          className="object-contain block md:hidden"
        />
      </div>

      {/* Contenu à droite */}
      <div className="flex flex-col gap-8 max-w-2xl">
        <div className="font-title text-2xl text-primary font-bold">À̀ propos de nous</div>
        <div className="text-lg leading-relaxed text-gray-800">
          <span className="font-bold">Chicken Nation, le champion du poulet !</span> <br />
          Ici, on ne rigole pas avec la qualité. <br /><br />
          <span className="font-bold">Notre secret ?</span> Un poulet 100 % local, élevé dans nos propres fermes, 
          nourri avec soin et préparé avec passion. Du frais, du bon, du champion ! 
          Parce qu&apos;un vrai bon poulet, ça se travaille dès l&apos;élevage, 
          on veille à chaque étape pour garantir fraîcheur et saveur incomparables. <br /><br />
          
          <span className="font-bold">Et en cuisine ? Là, c’est du sérieux !</span> <br />
          On le marine avec amour, on l&apos;enrobe d&apos;une panure dorée et ultra croustillante, 
          puis on le frit jusqu&apos;à la perfection pour un équilibre parfait entre tendre et croustillant. <br /><br />

          <span className="text-primary font-bold">Explosion de saveurs garantie à chaque bouchée !</span> <br />
          Un goût authentique, généreux et unique, <span className="font-bold">made in Côte d&apos;Ivoire.</span> <br /><br />

          Installez-vous, régalez-vous et laissez-vous embarquer 
          dans une expérience poulet incomparable ! <br /><br />

          <span className="font-bold">Chicken Nation — Du bon. Du frais. Du champion !</span>
        </div>
      </div>
    </div>
  );
}
