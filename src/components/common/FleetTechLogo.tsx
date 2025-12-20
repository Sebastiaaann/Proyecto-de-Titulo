/**
 * FleetTech Logo Component
 * Uses the official SVG logo from public/logoFTSR.svg
 */

interface FleetTechLogoProps {
    className?: string;
    size?: number;
}

export const FleetTechLogo: React.FC<FleetTechLogoProps> = ({
    className = "",
    size = 48
}) => {
    return (
        <img
            src="/logoFTSR.svg"
            alt="FleetTech Logo"
            width={size}
            height={size}
            className={className}
            style={{ width: size, height: size }}
        />
    );
};

export default FleetTechLogo;
