// app/page.tsx
import HomeCard from "../components/HomeCard";
import ButtonLink from "../components/ButtonLink";
import Counter from "../components/Counter";

export default function Page() {
  return (
    <main className="min-h-screen flex items-start justify-center p-8 bg-slate-50">
      <div className="max-w-4xl w-full flex flex-col gap-8 items-start">  
        <section className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <HomeCard title="create new app" href="/create-new-app" imageSrc="/buff.jpeg" />
          <HomeCard title="choose lot" href="/choose-lot" imageSrc="/buff.jpeg" />
          <HomeCard title="event choice" href="/event-choice" imageSrc="/buff.jpeg" />
          <HomeCard title="use page" href="/use-page" imageSrc="/buff.jpeg" />
          <Counter />
          {/* Add other HomeCards here for additional screens */}
        </section>
      </div>
    </main>
  );
}
