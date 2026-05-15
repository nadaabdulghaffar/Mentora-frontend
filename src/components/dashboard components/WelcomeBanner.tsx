import graphicsIllustration from "../../assets/images/welcome-banner/Graphics.png";
import leftIllustration from "../../assets/images/welcome-banner/welcome-banner-left.png";
import plantIllustration from "../../assets/images/welcome-banner/welcome-banner-plant.png";

interface Props {
  name: string;
  /** Secondary line under the greeting (mentor dashboard uses sessions copy). */
  tagline?: string;
}

const WelcomeBanner = ({ name, tagline }: Props) => {
  return (
<div className="relative flex min-h-[100px] items-center overflow-hidden rounded-2xl bg-primary px-4 py-4 text-white md:min-h-[110px] md:rounded-3xl md:px-8 lg:min-h-[120px] lg:px-12 lg:py-5">

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

    <p className="mt-0.5 text-sm font-medium text-purple-100 md:text-lg lg:text-xl">
      {tagline ?? "Continue your growth journey with expert mentorship"}
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