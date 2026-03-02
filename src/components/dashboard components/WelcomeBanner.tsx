import graphicsIllustration from "../../assets/images/welcome-banner/Graphics.png";
import leftIllustration from "../../assets/images/welcome-banner/welcome-banner-left.png";
import plantIllustration from "../../assets/images/welcome-banner/welcome-banner-plant.png";

interface Props {
  name: string;
}

const WelcomeBanner = ({ name }: Props) => {
  return (
<div className="relative bg-primary text-white rounded-2xl md:rounded-3xl px-4 md:px-8 lg:px-12 py-2 md:py-3 lg:py-4 min-h-[70px] md:min-h-[85px] lg:min-h-[95px] overflow-hidden flex items-center">

  {/* Graphics */}
  <img
    src={graphicsIllustration}
    alt="graphics"
    className="hidden md:block absolute right-36 top-6 w-[250px] opacity-90 pointer-events-none"
  />

  {/* Left Illustration */}
  <img
    src={leftIllustration}
    alt="welcome illustration"
    className="hidden md:block w-[180px] object-contain mr-6"
  />

  {/* Text */}
  <div className="relative z-10 max-w-xl">
    <h2 className="text-xl md:text-3xl lg:text-4xl font-bold leading-tight">
      Hello , {name}
    </h2>

    <p className="mt-0.5 text-sm md:text-lg lg:text-xl text-purple-100 font-medium">
      Continue your growth journey with expert mentorship
    </p>
  </div>

  {/* Plant */}
  <img
    src={plantIllustration}
    alt="plant"
    className="hidden md:block absolute right-8 bottom-2 w-[45px] object-contain pointer-events-none"
  />

</div>
  );
};

export default WelcomeBanner;