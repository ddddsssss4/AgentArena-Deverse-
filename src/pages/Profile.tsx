import { Link } from "react-router-dom";

export default function Profile() {
  return (
    <div className="px-6 lg:px-12 max-w-7xl mx-auto py-8">
      <div className="relative bg-surface-container-lowest rounded-[2.5rem] soft-atrium-shadow overflow-hidden border border-outline-variant/10">
        {/* Profile Header/Cover Area */}
        <div className="h-48 bg-gradient-to-br from-primary-container/30 to-secondary-container/20"></div>
        <div className="px-10 pb-12 relative">
          {/* Overlapping Profile Image */}
          <div className="absolute -top-16 left-10">
            <div className="relative">
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuALW-5H7fZA6w4b_a0kSE8QddZvjg1ky497YoEJqbEiJPjyp8EJZn5b4slm79aSEP6ndOuzzo3COCrO1afZu6VlvVzF1BlmNgqmX63zDGEhAGiqSZJ0GkImTo_wxQOoRMHsaXzLnyw-PDbVlrSpitvGu3Q_xZr969_XXpL4K_K7YUfeyXBdRDsDH3-s1oRdrVn-y20lkHvbm8Sf95OilC4C3--c9BRgH0hLrl58ncEou9TTuzIIDIG8-RpDDVcW21LCfeIxDjPcJkvF"
                alt="Alex Mercer"
                className="w-32 h-32 rounded-[2rem] object-cover border-8 border-surface-container-lowest soft-atrium-shadow"
                referrerPolicy="no-referrer"
              />
              <div className="absolute bottom-1 right-1 w-6 h-6 bg-tertiary rounded-full border-4 border-surface-container-lowest"></div>
            </div>
          </div>

          {/* Profile Info */}
          <div className="pt-20 flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div>
              <h1 className="text-4xl font-black font-headline tracking-tight text-on-surface">
                Alex Mercer
              </h1>
              <p className="text-xl font-medium text-primary mt-1">Backend Engineer</p>
              <div className="flex items-center gap-4 mt-4 text-on-surface-variant">
                <div className="flex items-center gap-1.5 bg-surface-container px-3 py-1 rounded-full">
                  <span
                    className="material-symbols-outlined text-sm"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    bolt
                  </span>
                  <span className="text-xs font-bold uppercase tracking-wider">Availability</span>
                </div>
                <p className="text-sm font-medium">9:00 AM – 6:00 PM EST</p>
              </div>
            </div>
            <Link
              to="/arena"
              className="bg-gradient-to-br from-primary to-primary-container text-white px-8 py-4 rounded-xl font-bold soft-atrium-shadow hover:scale-105 transition-transform text-center"
            >
              Join Conversation
            </Link>
          </div>

          {/* Content Grid */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Skills Section (Editorial Card) */}
            <div className="space-y-6">
              <h3 className="text-sm font-black uppercase tracking-widest text-on-surface-variant opacity-70">
                Technical Expertise
              </h3>
              <div className="flex flex-wrap gap-3">
                {["Rust", "PostgreSQL", "gRPC", "Kubernetes", "Distributed Systems", "GraphQL"].map(
                  (skill) => (
                    <span
                      key={skill}
                      className="px-5 py-2.5 bg-surface-container-low text-on-surface font-semibold rounded-full border border-outline-variant/10 transition-colors hover:bg-secondary-container/30"
                    >
                      {skill}
                    </span>
                  )
                )}
              </div>
              <div className="p-6 bg-surface-container-low rounded-2xl">
                <div className="flex items-center gap-2 mb-3 text-tertiary">
                  <span className="material-symbols-outlined">verified</span>
                  <span className="text-xs font-bold uppercase">AI Persona Notes</span>
                </div>
                <p className="text-on-surface-variant leading-relaxed">
                  Alex excels in building highly scalable microservices and enjoys optimizing
                  database queries. Known for a calm, direct communication style focused on
                  architectural integrity.
                </p>
              </div>
            </div>

            {/* Memory Section (The "Hangout" Core) */}
            <div className="flex flex-col gap-6">
              <h3 className="text-sm font-black uppercase tracking-widest text-on-surface-variant opacity-70">
                Memory with you
              </h3>
              <div className="bg-tertiary-container/20 p-8 rounded-[2rem] border border-tertiary/10 relative overflow-hidden">
                {/* Background subtle decoration */}
                <div className="absolute -top-12 -right-12 w-32 h-32 bg-tertiary/5 rounded-full blur-3xl"></div>
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-tertiary flex items-center justify-center text-white">
                    <span
                      className="material-symbols-outlined"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      auto_awesome
                    </span>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-tertiary uppercase tracking-widest mb-1">
                      Snippet from Yesterday
                    </p>
                    <h4 className="font-headline font-bold text-on-surface">Data Migration Sync</h4>
                  </div>
                </div>
                <div className="relative pt-4 border-t border-tertiary/10">
                  <p className="italic text-on-tertiary-container text-lg leading-relaxed">
                    "...I recall we were discussing the sharding strategy for the user analytics
                    table. You mentioned concerns about cross-shard join performance, and I
                    suggested we look into implementing a materialized view pattern to mitigate the
                    latency."
                  </p>
                  <div className="flex gap-2 mt-6">
                    <span className="text-[10px] bg-tertiary-container/40 text-on-tertiary-container px-2 py-1 rounded font-bold">
                      24H AGO
                    </span>
                    <span className="text-[10px] bg-tertiary-container/40 text-on-tertiary-container px-2 py-1 rounded font-bold">
                      PROJECT: PHOENIX
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-surface-container-highest/30 rounded-2xl border border-outline-variant/10">
                <div className="flex -space-x-3">
                  <img
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuBm4-mxaDV52N9o137uoB1OBpTjV0meNqoUR_H5geQHeHNvJgsTPo7SicZeCT_zgdesabfQBWIek-nUwJJQZbrTD0XyLJgxSNCTNTOk8sanAWG9bkgWNJg45lF27vZsintjlWc3LzTD8c3DXpmiiBYR0TvmX7BNniooYH-wmktweMr15e1ENkuEXrI1cLQ90re4hVca3TE3zVJFl0jTyKu3B5fRKtNjGjIxJvhMlkpBATzz2VOiqzoPKSOtkGseipsNaQTlJ5unz1Ic"
                    alt="Friend"
                    className="w-8 h-8 rounded-full border-2 border-surface-container-lowest object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <img
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuBOSQPNn-ri-KENwfNagy63J7L02DZAarOlXZ96hVgvkqAnezor8o9Gf4rtf0zEcKz6B2yv-WEVIa0NBfmAV9xiXjc_7LT1i1xg2yQH7oBQrDvWJX0PJ7_bzZlZkBhnNeolgX1VZ2QJ2GH8M_jHQfr-dEOG-PJAsk4WU-g2OTx9W7k4AYJCq21Qf2PzzKeM_oEu06CskA_dW6J-ji983TNudNVbEP76sVPYG7HIfgyViNerNs8fm2kg8XwSCf963gJFzzUDngU25phc"
                    alt="Friend"
                    className="w-8 h-8 rounded-full border-2 border-surface-container-lowest object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="w-8 h-8 rounded-full bg-surface-container-high border-2 border-surface-container-lowest flex items-center justify-center text-[10px] font-bold text-on-surface-variant">
                    +4
                  </div>
                </div>
                <span className="text-xs font-medium text-on-surface-variant">
                  Active in 2 Shared Channels
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
