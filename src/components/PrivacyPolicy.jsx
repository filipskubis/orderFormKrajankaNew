import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const email = "filipskubis@gmail.com";

export default function PrivacyPolicy() {
  return (
    <main className="flex min-h-screen w-full justify-center overflow-x-hidden bg-white px-4 py-6 text-[#303c6c] sm:px-8 sm:py-10 xl:px-12 xl:py-12">
      <article className="w-full max-w-6xl rounded-lg bg-white p-5 shadow-xl sm:p-8 lg:grid lg:grid-cols-[minmax(15rem,0.8fr)_minmax(0,1.6fr)] lg:gap-12 lg:p-12 xl:gap-16">
        <div className="lg:border-r-2 lg:border-[#cccccc] lg:pr-12 xl:pr-16">
          <Link
            to={-1}
            className="mb-10 inline-flex min-h-11 items-center gap-2 rounded-md px-1 py-1 text-sm font-bold text-[#303c6c] transition-colors hover:text-[#f28a72] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#f28a72] focus-visible:ring-offset-2"
          >
            <ArrowLeft size={18} aria-hidden="true" />
            Wróć do formularza
          </Link>

          <header className="border-b-2 border-[#cccccc] pb-6 lg:border-b-0 lg:pb-0">
            <h1 className="text-3xl leading-tight sm:text-4xl">Polityka prywatności</h1>
            <p className="mt-3 text-base font-medium leading-7 text-[#303c6c]/75">
              Informacje o przetwarzaniu danych osobowych w formularzu zamówień Krajanka.
            </p>
          </header>
        </div>

        <div className="privacy-policy-content pt-8 lg:min-w-0 lg:pt-0">
          <section>
            <h2>1. Administrator danych osobowych</h2>
            <p>Administratorem danych osobowych przetwarzanych za pośrednictwem formularza zamówień Krajanka jest <strong>Filip Skubiś</strong>.</p>
            <p>W sprawach dotyczących danych osobowych możesz skontaktować się z Administratorem pod adresem e-mail: <a href={`mailto:${email}`}>{email}</a>.</p>
          </section>

          <section>
            <h2>2. Jakie dane zbieramy</h2>
            <p>W trakcie składania zamówienia przetwarzamy:</p>
            <ul>
              <li>adres podany w formularzu,</li>
              <li>numer telefonu lub inne dane kontaktowe podane w polu „Kontakt”,</li>
              <li>wybrane produkty, ich ilość oraz wartość zamówienia,</li>
              <li>termin realizacji oraz sposób płatności,</li>
              <li>opcjonalne informacje wpisane w polu „Dodatkowe informacje”.</li>
            </ul>
          </section>

          <section>
            <h2>3. Cel i podstawa prawna przetwarzania</h2>
            <p>Dane przetwarzamy w celu:</p>
            <ul>
              <li>przyjęcia, obsługi i realizacji zamówienia oraz kontaktu w sprawie zamówienia — na podstawie art. 6 ust. 1 lit. b RODO,</li>
              <li>realizacji obowiązków prawnych ciążących na Administratorze, jeżeli mają zastosowanie — na podstawie art. 6 ust. 1 lit. c RODO,</li>
              <li>ustalenia, dochodzenia lub obrony roszczeń — na podstawie prawnie uzasadnionego interesu Administratora (art. 6 ust. 1 lit. f RODO).</li>
            </ul>
            <p>Podanie danych oznaczonych jako wymagane jest niezbędne do przyjęcia i realizacji zamówienia. Podanie dodatkowej informacji jest dobrowolne.</p>
          </section>

          <section>
            <h2>4. Odbiorcy danych</h2>
            <p>Dane mogą być dostępne dla podmiotów, które wspierają działanie formularza i przechowywanie zamówień, w szczególności dostawców hostingu, infrastruktury serwerowej i bazy danych. Podmioty te przetwarzają dane wyłącznie w zakresie niezbędnym do świadczenia swoich usług.</p>
          </section>

          <section>
            <h2>5. Okres przechowywania danych</h2>
            <p>Dane zamówienia przechowujemy przez czas niezbędny do jego realizacji, a następnie przez okres potrzebny do obsługi ewentualnych reklamacji, rozliczeń i roszczeń. Jeżeli przepisy prawa wymagają dłuższego przechowywania określonych danych, są one przechowywane przez okres wskazany w tych przepisach.</p>
          </section>

          <section>
            <h2>6. Twoje prawa</h2>
            <p>Masz prawo do:</p>
            <ul>
              <li>dostępu do swoich danych oraz otrzymania ich kopii,</li>
              <li>sprostowania danych,</li>
              <li>usunięcia danych lub ograniczenia ich przetwarzania,</li>
              <li>przenoszenia danych, gdy jest to możliwe,</li>
              <li>wniesienia sprzeciwu wobec przetwarzania opartego na prawnie uzasadnionym interesie Administratora,</li>
              <li>wniesienia skargi do Prezesa Urzędu Ochrony Danych Osobowych.</li>
            </ul>
            <p>Aby skorzystać z tych praw, napisz na <a href={`mailto:${email}`}>{email}</a>.</p>
          </section>

          <section>
            <h2>7. Zautomatyzowane decyzje i pliki cookies</h2>
            <p>Dane podane w formularzu nie są wykorzystywane do profilowania ani zautomatyzowanego podejmowania decyzji. Formularz nie wykorzystuje plików cookies do celów analitycznych ani marketingowych. Dostawcy infrastruktury mogą przetwarzać podstawowe dane techniczne, takie jak adres IP, data i czas żądania czy informacje o przeglądarce, aby zapewnić bezpieczeństwo i prawidłowe działanie usługi.</p>
          </section>

          <section>
            <h2>8. Bezpieczeństwo danych</h2>
            <p>Stosujemy odpowiednie środki techniczne i organizacyjne, aby chronić dane przed nieuprawnionym dostępem, utratą lub ujawnieniem. Połączenie z formularzem jest zabezpieczone protokołem HTTPS.</p>
          </section>
        </div>
      </article>
    </main>
  );
}
