import graphicsIllustration from "../../assets/images/welcome-banner/Graphics.png";
import leftIllustration from "../../assets/images/welcome-banner/welcome-banner-left.png";
import plantIllustration from "../../assets/images/welcome-banner/welcome-banner-plant.png";

interface Props {
  name: string;
}

const WelcomeBanner = ({ name }: Props) => {
  return (
<div className="relative bg-primary text-white rounded-3xl px-12 py-3 min-h-[85px] overflow-hidden flex items-center">

  {/* Graphics */}
  <img
    src={graphicsIllustration}
    alt="graphics"
    className="absolute right-36 top-6 w-[250px] opacity-90 pointer-events-none"
  />

  {/* Left Illustration */}
  <img
    src={leftIllustration}
    alt="welcome illustration"
    className="w-[180px] object-contain mr-6"
  />

  {/* Text */}
  <div className="relative z-10 max-w-xl">
    <h2 className="text-3xl font-bold leading-tight">
      Hello , {name}
    </h2>

    <p className="mt-0.5 text-lg text-purple-100 font-medium">
      Continue your growth journey with expert mentorship
    </p>
  </div>

  {/* Plant */}
  <img
    src={plantIllustration}
    alt="plant"
    className="absolute right-8 bottom-2 w-[45px] object-contain pointer-events-none"
  />

</div>
  );
};

export default WelcomeBanner;