import React from "react";
import {
  Globe2,
  HeartHandshake,
  Lightbulb,
  Sparkles,
  TriangleAlert
} from "lucide-react";

function IconCard({ icon: Icon, title, children, imageUrl }) {
  return (
    <div className="card aboutCard">
      {imageUrl && (
        <img className="aboutCardMedia" src={imageUrl} alt="" aria-hidden="true" />
      )}
      <div className="aboutIcon">
        <Icon size={22} />
      </div>
      <h3 className="aboutCardTitle">{title}</h3>
      <p className="aboutCardText">{children}</p>
    </div>
  );
}

export default function About() {
  const HERO_IMG =
    "https://images.unsplash.com/photo-1523475472560-d2dfddf5c9c6?auto=format&fit=crop&w=1800&q=80";

  const IMG_MISSION =
    "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=900&q=80";

  const IMG_PROBLEM =
    "https://images.unsplash.com/photo-1528825871115-3581a5387919?auto=format&fit=crop&w=900&q=80";

  const IMG_SOLUTION =
    "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=900&q=80";

  return (
    <div className="aboutPage">
      <section className="pageCard aboutHero aboutHeroBanner">
        <img className="aboutHeroImg" src={HERO_IMG} alt="Food donation" />
        <div className="aboutHeroOverlay">
          <h1>About ShareMeal</h1>
          <p className="pageHint" style={{ fontSize: 15, margin: 0 }}>
            A food donation platform built to reduce waste, connect
            communities, and help meals reach the people who need them most.
          </p>
        </div>
      </section>

      <section className="aboutCardsGrid" aria-label="About sections">
        <IconCard
          icon={HeartHandshake}
          title="Mission"
          imageUrl={IMG_MISSION}
        >
          ShareMeal is a platform designed to reduce food waste by connecting
          donors with NGOs.
        </IconCard>

        <IconCard
          icon={TriangleAlert}
          title="Problem"
          imageUrl={IMG_PROBLEM}
        >
          Food waste is increasing, and many people still go hungry.
        </IconCard>

        <IconCard
          icon={Lightbulb}
          title="Solution"
          imageUrl={IMG_SOLUTION}
        >
          Donors can donate food easily, and NGOs can accept and distribute
          food efficiently.
        </IconCard>
      </section>

      <section className="pageCard aboutSection">
        <h2>Features</h2>

        <div className="featureList">
          <div className="featureItem">
            <div className="featureIcon">
              <Sparkles size={18} />
            </div>
            <div>
              <div className="featureTitle">Smart NGO recommendation</div>
              <div className="featureDesc smallText">
                Automatically suggests the best-fit NGO using capacity and rating.
              </div>
            </div>
          </div>

          <div className="featureItem">
            <div className="featureIcon">
              <Sparkles size={18} />
            </div>
            <div>
              <div className="featureTitle">Real-time donation tracking</div>
              <div className="featureDesc smallText">
                Donation lifecycle is visible: pending → accepted → picked → completed.
              </div>
            </div>
          </div>

          <div className="featureItem">
            <div className="featureIcon">
              <Sparkles size={18} />
            </div>
            <div>
              <div className="featureTitle">Role-based dashboards</div>
              <div className="featureDesc smallText">
                Donors create and track donations, NGOs manage pickup workflow.
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="pageCard aboutVision">
        <h2>Vision</h2>
        <div className="aboutQuote">
          To build a world where no food is wasted and no one sleeps hungry.
        </div>
        <div className="aboutQuoteSub smallText">
          Powered by community collaboration and smarter logistics.
        </div>
        <div className="aboutGlobe" aria-hidden="true">
          <Globe2 size={40} />
        </div>
      </section>
    </div>
  );
}

