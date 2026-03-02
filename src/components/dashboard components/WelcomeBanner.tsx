import leftIllustration from "../../assets/images/welcome-banner-left.png";
import rightIllustration from "../../assets/images/welcome-banner-right.png";

interface Props {
    name: string;
}

const WelcomeBanner = ({ name }: Props) => {
    return (
        <div className="relative bg-primary text-white rounded-3xl px-6 sm:px-10 lg:px-12 py-6 lg:py-8 min-h-[160px] lg:min-h-[200px] overflow-hidden flex items-center">

            {/* Left Image */}
            <img
                src={leftIllustration}
                alt="welcome left"
                className="hidden lg:block absolute left-6 bottom-0 w-[180px] object-contain pointer-events-none"
            />

            {/* Right Image */}
            <img
                src={rightIllustration}
                alt="welcome right"
                className="hidden lg:block absolute right-6 top-4 w-[130px] object-contain pointer-events-none select-none"
            />

            {/* Text */}
            <div className="relative z-10 max-w-xl lg:ml-[200px]">
                <h2 className="text-xl sm:text-2xl font-bold tracking-wide">
                    Hello, {name}
                </h2>

                <p className="mt-2 sm:mt-3 text-sm sm:text-base text-purple-100">
                    Continue your growth journey with expert mentorship
                </p>
            </div>

        </div>

    );
};

export default WelcomeBanner;
