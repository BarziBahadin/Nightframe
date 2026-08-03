import { Link } from "react-router-dom";
import { Download, Images, QrCode, ShieldCheck, Upload, Users } from "lucide-react";

const promises = [
  ["No app required", "The upload page opens in any modern phone browser"],
  ["One private QR", "A simple link connects every guest to the event"],
  ["Host-only collection", "Guests contribute without seeing anyone else’s photos"]
];

const features = [
  [QrCode, "One scan to join", "Share one private QR at the venue or send the event link directly. Guests arrive at a page made only for your event."],
  [Upload, "One photo or a whole batch", "Guests choose photos already on their phone and send several at once. There is no account setup and nothing new to install."],
  [ShieldCheck, "Private by design", "The guest page is for contributing only. Other uploads and host controls remain hidden from everyone except the organizer."],
  [Images, "Everything in one place", "Every contribution arrives in the event dashboard, organized and ready for the host to review, manage, and download."]
];

const steps = [
  ["Prepare the event", "The host chooses the event name, upload window, guest limits, and how many photos each person can contribute."],
  ["Share the private QR", "Place it on tables, invitations, screens, or signs. The same event link can also be shared in a message."],
  ["Guests choose their photos", "They enter their name, select one photo or many from their phone, and upload directly in the browser."],
  ["The host receives everything", "New photos appear privately in the dashboard, where the host can review them and download the complete collection."]
];

const eventTypes = ["Weddings", "Engagements", "Birthdays", "Graduations", "Company events", "Family celebrations"];

const faqs = [
  ["Do guests need to download an app?", "No. The private upload page opens in the guest’s phone browser, so there is no installation or account creation."],
  ["Can guests see photos uploaded by other people?", "No. Web-upload events keep the collection private to the host. Guests only see their own upload progress and confirmation."],
  ["Can someone upload several photos together?", "Yes. Guests can choose one photo or a batch from their gallery. The host controls the per-guest and total event limits."],
  ["When does the upload link work?", "The host sets the event’s start and end time. Uploading is available only while that private event window is open."],
  ["What can the host do with the photos?", "The private dashboard lets the host view contributions, see who participated, manage individual photos, and download the collection."]
];

export default function HomePage() {
  return (
    <main className="app-frame flex flex-col gap-16 sm:gap-20 lg:gap-28">
      <nav className="flex items-center border-b hairline pb-5">
        <Link to="/" className="flex items-center gap-3 font-bold tracking-tight">
          <img
            src="/app-icon-192.png"
            alt=""
            width={80}
            height={80}
            className="h-10 w-10 rounded-full object-cover"
            decoding="async"
            aria-hidden="true"
          />
          <span>Nightframe</span>
        </Link>
      </nav>

      <section className="grid min-h-[78vh] gap-12 py-10 lg:grid-cols-[0.86fr_1.14fr] lg:items-center lg:gap-16 lg:py-16">
        <div className="relative z-10">
          <p className="eyebrow mb-4">One night. Every perspective.</p>
          <h1 className="editorial-title max-w-3xl">The night, as everyone saw it.</h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-moss">
            Nightframe gives your event one private QR code. Guests scan it, choose photos from their phones, and send them directly to a host-only collection—no app or guest account required.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <a className="btn-dark px-5 py-3" href="#how-it-works">See how it works</a>
          </div>
          <div className="mt-10 grid max-w-2xl border-y hairline sm:grid-cols-3">
            {promises.map(([value, label]) => (
              <div key={value} className="border-b hairline px-3 py-5 last:border-b-0 sm:border-b-0 sm:border-r sm:px-5 sm:last:border-r-0">
                <p className="text-lg font-semibold sm:text-xl">{value}</p>
                <p className="mt-1 text-xs leading-5 text-moss sm:text-sm">{label}</p>
              </div>
            ))}
          </div>
        </div>
        <HeroPhotos />
      </section>

      <section className="grid gap-7 py-12 lg:grid-cols-[1.15fr_0.85fr] lg:py-16">
        <figure className="group relative min-h-[520px] overflow-hidden rounded-[2rem]">
          <ResponsivePhoto
            name="jonathan-borba-eg-72fI9wK4-unsplash"
            width={2400}
            height={1600}
            alt="Newlyweds celebrating as their guests throw confetti"
            sizes="(min-width: 1024px) 58vw, 100vw"
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.02]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent" />
          <figcaption className="absolute inset-x-0 bottom-0 p-7 sm:p-9">
            <p className="eyebrow">No shot list. No posing.</p>
            <h2 className="mt-3 max-w-xl text-4xl font-semibold text-white sm:text-5xl">The moments between the moments.</h2>
          </figcaption>
        </figure>
        <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-1">
          <figure className="relative min-h-64 overflow-hidden rounded-[2rem]">
            <ResponsivePhoto
              name="golden-event"
              width={687}
              height={1030}
              alt="Elegant outdoor event table glowing in golden-hour sunlight"
              sizes="(min-width: 1024px) 34vw, (min-width: 640px) 50vw, 100vw"
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/55 to-transparent" />
            <figcaption className="absolute bottom-0 p-6 text-xl font-semibold text-white">The calm before everyone arrives.</figcaption>
          </figure>
          <figure className="relative min-h-64 overflow-hidden rounded-[2rem]">
            <ResponsivePhoto
              name="andre-hunter-YK46WkDJj8s-unsplash"
              width={2400}
              height={1601}
              alt="Friends celebrating together under colorful party lights"
              sizes="(min-width: 1024px) 34vw, (min-width: 640px) 50vw, 100vw"
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/65 to-transparent" />
            <figcaption className="absolute bottom-0 p-6 text-xl font-semibold text-white">The story only your guests could tell.</figcaption>
          </figure>
        </div>
      </section>

      <section id="features" className="py-4 lg:py-8">
        <div className="mb-10 max-w-3xl sm:mb-14">
          <p className="eyebrow mb-3">Simple for every guest</p>
          <h2 className="text-3xl font-black leading-tight sm:text-5xl">The easiest way to bring everyone’s photos together.</h2>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-moss">Nightframe removes the usual friction between taking a photo and getting it to the event host.</p>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          {features.map(([Icon, title, copy]) => (
            <article key={String(title)} className="surface p-6 sm:p-8">
              <Icon className="h-7 w-7 text-coral" aria-hidden="true" />
              <h3 className="mt-5 text-xl font-semibold">{title as string}</h3>
              <p className="mt-3 leading-7 text-moss">{copy as string}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="how-it-works" className="grid scroll-mt-8 gap-10 py-6 lg:grid-cols-[0.85fr_1.15fr] lg:items-start lg:gap-16 lg:py-10">
        <div>
          <p className="eyebrow mb-3">How it works</p>
          <h2 className="text-3xl font-black leading-tight sm:text-5xl">Four clear steps. Nothing complicated to explain.</h2>
          <p className="mt-4 max-w-xl leading-7 text-ink/70">
            From the first scan to the final download, every part of the experience stays focused on collecting memories quickly and privately.
          </p>
        </div>
        <div className="grid gap-5">
          {steps.map(([title, copy], index) => (
            <article key={title} className="surface grid gap-4 p-5 sm:grid-cols-[auto_1fr] sm:items-start sm:p-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-amber text-sm font-semibold text-linen">{index + 1}</div>
              <div>
                <h3 className="font-semibold">{title}</h3>
                <p className="mt-1 leading-6 text-moss">{copy}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="grid gap-7 lg:grid-cols-2">
        <article className="surface p-7 sm:p-9">
          <Users className="h-8 w-8 text-coral" aria-hidden="true" />
          <p className="eyebrow mb-3 mt-6">For guests</p>
          <h2 className="text-3xl font-bold">Scan, choose, and send.</h2>
          <p className="mt-4 leading-7 text-moss">Guests see a clean page carrying the event name and message. They enter their name, choose photos from their device, and watch each upload finish. They never need to enter the host dashboard or learn a new app.</p>
        </article>
        <article className="surface p-7 sm:p-9">
          <Download className="h-8 w-8 text-coral" aria-hidden="true" />
          <p className="eyebrow mb-3 mt-6">For the host</p>
          <h2 className="text-3xl font-bold">One private collection.</h2>
          <p className="mt-4 leading-7 text-moss">The host sees every contribution in one event workspace, together with participant names, upload totals, and storage use. Photos can be reviewed individually or downloaded together after the event.</p>
        </article>
      </section>

      <section className="border-y hairline py-12 sm:py-16">
        <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-center lg:gap-16">
          <div>
            <p className="eyebrow mb-3">Made for gathering</p>
            <h2 className="text-3xl font-black leading-tight sm:text-4xl">Useful anywhere memories are shared.</h2>
          </div>
          <div className="flex flex-wrap gap-3">
            {eventTypes.map((eventType) => <span key={eventType} className="rounded-full border hairline bg-white/30 px-4 py-2 text-sm font-semibold">{eventType}</span>)}
          </div>
        </div>
      </section>

      <section className="grid gap-10 py-6 lg:grid-cols-[0.7fr_1.3fr] lg:gap-16 lg:py-10">
        <div>
          <p className="eyebrow mb-3">Questions</p>
          <h2 className="text-3xl font-black leading-tight sm:text-5xl">Good to know.</h2>
          <p className="mt-4 leading-7 text-moss">A few details about what guests and hosts can expect.</p>
        </div>
        <div className="divide-y hairline border-y hairline">
          {faqs.map(([question, answer]) => (
            <details key={question} className="group py-5">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-5 font-semibold">
                <span>{question}</span>
                <span className="text-xl font-normal text-coral transition-transform group-open:rotate-45" aria-hidden="true">+</span>
              </summary>
              <p className="max-w-2xl pb-2 pt-4 leading-7 text-moss">{answer}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="relative mb-8 overflow-hidden rounded-[2rem] border border-white/10 bg-[#0f1b2d] p-8 shadow-[0_32px_100px_rgba(0,0,0,0.32)] sm:p-12 lg:p-14">
        <img src="/app-icon-192.png" alt="" className="pointer-events-none absolute -right-16 -top-24 h-80 w-80 rounded-[4rem] object-contain opacity-[0.06]" aria-hidden="true" />
        <div className="relative">
          <p className="eyebrow mb-3">Your night deserves every angle</p>
          <h2 className="text-3xl font-black leading-tight text-white sm:text-4xl">Make a gallery nobody else could have photographed.</h2>
          <p className="mt-3 max-w-2xl leading-7 text-white/65">
            One private QR lets every guest contribute their perspective while Nightframe keeps the entire collection organized and private for the host.
          </p>
        </div>
      </section>
    </main>
  );
}

function HeroPhotos() {
  return (
    <div className="relative mx-auto h-[580px] w-full max-w-[680px]" aria-hidden="true">
      <div className="absolute inset-y-4 left-[8%] right-[18%] overflow-hidden rounded-[2rem] shadow-[0_35px_100px_rgba(0,0,0,0.45)]">
        <ResponsivePhoto name="golden-event" width={687} height={1030} alt="" sizes="(min-width: 1024px) 48vw, 88vw" loading="eager" fetchPriority="high" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-amber/5" />
      </div>
      <div className="absolute right-0 top-14 h-[250px] w-[38%] rotate-3 overflow-hidden rounded-[1.5rem] border-4 border-[#eee7dc] shadow-2xl">
        <ResponsivePhoto name="sujan-khalifa-LO1lToLGGFA-unsplash" width={2400} height={3601} alt="" sizes="28vw" className="absolute inset-0 h-full w-full object-cover" />
      </div>
      <div className="absolute bottom-0 left-0 h-[245px] w-[40%] -rotate-3 overflow-hidden rounded-[1.5rem] border-4 border-[#eee7dc] shadow-2xl">
        <ResponsivePhoto name="leonardo-miranda-riHGdvluDk8-unsplash" width={2400} height={1600} alt="" sizes="28vw" className="absolute inset-0 h-full w-full object-cover" />
      </div>
      <div className="absolute bottom-7 right-4 rounded-full bg-[#eee7dc] px-5 py-3 text-sm font-bold text-[#171411] shadow-xl">
        One QR. Every point of view.
      </div>
    </div>
  );
}

function ResponsivePhoto({
  name,
  width,
  height,
  alt,
  sizes,
  className,
  loading = "lazy",
  fetchPriority
}: {
  name: string;
  width: number;
  height: number;
  alt: string;
  sizes: string;
  className?: string;
  loading?: "eager" | "lazy";
  fetchPriority?: "high" | "low" | "auto";
}) {
  const webp = [640, 960, 1280]
    .filter((size) => size <= width)
    .map((size) => `/pics/${name}-${size}.webp ${size}w`)
    .join(", ");

  return (
    <picture>
      <source type="image/webp" srcSet={webp} sizes={sizes} />
      <img
        src={`/pics/${name}.jpg`}
        alt={alt}
        width={width}
        height={height}
        loading={loading}
        decoding="async"
        fetchPriority={fetchPriority}
        className={className}
      />
    </picture>
  );
}
