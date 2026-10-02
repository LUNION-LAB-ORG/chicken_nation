import { Link } from '@/i18n/navigation';
import Motion from '@/lib/motion';
import { Mail, MapPin, Phone } from 'lucide-react';

export default function News() {
  return (
    <div className="flex flex-col justify-center text-center items-center space-y-10 gap-8 px-8 py-16 my-12">
      <Motion variant="verticalSlideIn">
      <h2 className="text-2xl font-title text-center items-center text-primary">NOUS AIMONS AVOIR DE VOS NOUVELLES</h2>
      </Motion>
      <Motion variant="verticalSlideIn">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
        <div className="flex flex-col items-center gap-2">
          <Mail className="h-8 w-8 border-2 border-gray-600 rounded-full text-gray-600" />
          <p className="text-xl font-medium text-gray-600">Email</p>
          <p className="text-primary">info@chicken-nation.com</p>
        </div>
        <div className="flex flex-col items-center gap-2">
          <MapPin className="h-8 w-8 border-2 border-gray-600 rounded-full text-gray-600" />
          <p className="text-xl font-medium text-gray-600">Siège</p>
          <div className="flex flex-col text-center gap-1">
          <p className="text-primary">Angré 8ème tranche, face à la station Shell, Abidjan, Côte d&apos;Ivoire</p>
          <p className="text-primary">Marcory Zone 4</p>
          </div>
        </div>
        <div className="flex flex-col items-center gap-2">
          <Phone className="h-8 w-8 border-2 border-gray-600 rounded-full text-gray-600" />
          <p className="text-xl font-medium text-gray-600">Téléphone</p>
          <p className="text-primary flex flex-col">
            <a href="tel:+2250747000034">07 47 00 00 34</a>
            <a href="tel:+2250720353535">07 20 35 35 35</a>
          </p>
        </div>
      </div>
      </Motion>
      <p className="text-gray-700">
        Pour commander : en ligne sur{' '}
        <Link href="/restaurants/nos-menus" className="font-semibold text-primary underline underline-offset-4">
          Nos menus
        </Link>{' '}
        ou au{' '}
        <a href="tel:+2252721712130" className="font-semibold text-primary whitespace-nowrap">
          27 21 71 21 30
        </a>
      </p>
    </div>
  );
}