import { Mail, MapPin, Phone } from 'lucide-react';

export default function News() {
  return (
    <div className="flex flex-col justify-center text-center items-center space-y-10 gap-8 px-8 py-16 my-12">
      <h2 className="text-2xl font-title text-center items-center text-primary">NOUS AIMONS AVOIR DE VOS NOUVELLES</h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
        <div className="flex flex-col items-center gap-2">
          <Mail className="h-8 w-8 border-2 border-gray-600 rounded-full text-gray-600" />
          <p className="text-xl font-medium text-gray-600">Email</p>
          <p className="text-primary">your.email.inbox@here.com</p>
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
          <p className="text-primary">+225 0747000034</p>
        </div>
      </div>
    </div>
  );
}